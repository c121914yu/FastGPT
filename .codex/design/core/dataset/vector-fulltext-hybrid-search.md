# 向量库全文检索与混合搜索调研报告

## 背景

当前 FastGPT 知识库检索是典型的双索引链路：

- 向量索引写入 `modeldata`，由 `packages/service/common/vectorDB/controller.ts` 根据环境变量选择 SeekDB、OceanBase、PG、Milvus、openGauss 控制器。
- 全文索引写入 MongoDB 的 `dataset_data_texts`，字段为 `fullTextToken`，索引为 `{ teamId: 1, fullTextToken: 'text' }`，`default_language: 'none'`。
- 写入时 `projects/app/src/service/core/dataset/data/controller.ts` 使用 `jiebaSplit(q + a)` 生成全文 token。
- 查询时 `packages/service/core/dataset/search/controller.ts` 分别调用向量库和 Mongo `$text`，再通过 `datasetSearchResultConcat` 做 RRF 融合。

本次目标是调研是否能把全文检索和向量检索放到同一个数据库，优先依赖向量库自身全文能力；同时评估是否能实现单语句或单请求混合搜索，减少当前“两库分别搜索 + 应用层 RRF 合并”的复杂度。如果能力不足，再保留 Mongo 全文检索作为兼容兜底。

## 当前支持范围

代码里实际启用的向量库优先级如下：

1. `SEEKDB_URL` -> `SeekVectorCtrl`
2. `OCEANBASE_URL` -> `ObVectorCtrl`
3. `PG_URL` -> `PgVectorCtrl`
4. `MILVUS_ADDRESS` -> `MilvusCtrl`，可连接自建 Milvus 或 Zilliz Cloud
5. `OPENGAUSS_URL` -> `OpenGaussVectorCtrl`
6. 未配置时默认 PG

当前各控制器只存储 `id/vector/team_id/dataset_id/collection_id/createtime` 或对应字段，不存储 Mongo `dataId`、chunk 原文、全文 token 或全文索引字段。需要特别注意：一个 `DatasetData` 文本块会通过 `formatIndexes` 生成多个 `indexes[]`，每个 index 对应一条向量；但全文检索应只针对一个文本块生成一条全文索引。因此迁移不建议把全文字段直接塞进向量行，而应在同一个向量数据库实例内维护“chunk 全文表 + vector 索引表”两张逻辑表。

## 结论摘要

| 后端 | 是否支持全文检索 | 是否支持同库混合搜索 | 单语句/单请求成熟度 | 结论 |
| --- | --- | --- | --- | --- |
| PostgreSQL + pgvector | 支持，PostgreSQL `tsvector/tsquery` + GIN | 支持，需要 SQL CTE 自行融合 | 中 | 推荐作为第一优先落地路径。工程可控，但中文分词需要保留 jieba token 或引入中文 parser。 |
| Milvus | 支持，BM25 Function + `SPARSE_FLOAT_VECTOR` | 支持，但单次 `hybrid_search` 通常要求 dense/sparse 在同 collection | 中 | 两表模型更符合 FastGPT chunk/多向量结构；若强求单请求，需要额外 chunk 级 hybrid collection。 |
| Zilliz Cloud | 支持，同 Milvus BM25 | 支持，同 Milvus hybrid search 限制 | 中 | 与 Milvus 同方案，托管环境更适合测试 BM25 和 analyzer，但仍要处理两 collection 融合问题。 |
| OceanBase | 支持 MySQL 模式 `FULLTEXT` + `MATCH AGAINST`，但官方仍提示实验阶段 | 可用 SQL 拼接向量 + 全文，普通 OceanBase 未见稳定原生 hybrid 包 | 中低 | 可做同库全文，生产默认不建议首选；需要版本和稳定性验证。 |
| SeekDB | 支持全文索引与向量索引 | 支持 `DBMS_HYBRID_SEARCH`，但需验证是否支持向量表与全文表分离 | 中高 | 最贴近目标；若系统包只能单表 hybrid，则应建立 chunk 级 hybrid 表。 |
| openGauss + DataVec | 支持 `tsvector/tsquery`，DataVec 支持向量索引 | 支持 SQL CTE 自行融合 | 中 | 可迁移全文到同一 openGauss 库，但没有发现原生 hybrid API；中文仍需处理分词。 |
| MongoDB | 支持 `$text`，当前已使用 | 不满足“向量和全文同库” | 兜底 | 仅作为不支持或迁移期间的兼容路径。 |

整体判断：

- “全文索引和向量索引放到同一个数据库”对所有当前向量后端都有可行路径，但可用性差异很大。这里的推荐形态是同库两表，而不是一张表承载所有字段。
- “完全依赖向量库原生分词”不建议一步到位，尤其中文。当前 jieba + 自定义词典是重要效果基线。推荐第一阶段把 `jiebaSplit` 的 token 结果写入同库 chunk 全文表，让全文索引先迁库；第二阶段再对 Milvus/Zilliz Chinese analyzer、OceanBase NGRAM、SeekDB IK/jieba tokenizer、PG/openGauss 中文 parser 做效果 AB。
- “单语句混合搜索”需要分后端理解：SQL 型后端可以单 SQL；Milvus/Zilliz 是单 SDK/API 请求；SeekDB 是单系统包调用。内部仍然可能执行 dense 与 sparse 子检索并融合，但应用层不再需要跨 Mongo 和向量库合并。

## 官方能力调研

### PostgreSQL + pgvector

官方能力：

- pgvector 支持 Postgres 中的向量存储、HNSW/IVFFlat、inner product/cosine/L2 等距离，并在 README 的 Hybrid Search 章节明确建议与 Postgres full-text search 搭配。
- PostgreSQL 原生提供 `tsvector` 和 `tsquery` 类型，GIN/GiST 可用于加速全文检索，GIN 是首选全文索引类型。

可行性：

- 同库全文：高。新增 chunk 全文表 `modeldata_text`，用 `data_id` 与 `modeldata` 的多条向量行关联，并创建 GIN 索引。
- 单 SQL 混合：高。用 CTE 同时取向量 topK 和全文 topK，再按加权分或 SQL 内 RRF 排序。
- 中文效果：中。PostgreSQL 默认配置对中文不可靠。最稳是继续写入 jieba token 字符串，用 `to_tsvector('simple', full_text_token)` 建索引；如要真正 DB 分词，需要部署 `zhparser`、`pg_jieba` 等扩展，迁移成本和云厂商可用性不一致。

推荐实现方式：

```sql
ALTER TABLE modeldata
  ADD COLUMN IF NOT EXISTS data_id varchar(50);

CREATE TABLE IF NOT EXISTS modeldata_text (
  data_id varchar(50) PRIMARY KEY,
  team_id varchar(50) NOT NULL,
  dataset_id varchar(50) NOT NULL,
  collection_id varchar(50) NOT NULL,
  content text,
  full_text_token text,
  search_tsv tsvector
    GENERATED ALWAYS AS (to_tsvector('simple', coalesce(full_text_token, ''))) STORED,
  createtime timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS modeldata_search_tsv_idx
  ON modeldata_text USING gin(search_tsv);

CREATE INDEX CONCURRENTLY IF NOT EXISTS modeldata_data_id_idx
  ON modeldata USING btree(team_id, dataset_id, collection_id, data_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS modeldata_text_filter_idx
  ON modeldata_text USING btree(team_id, dataset_id, collection_id);
```

单 SQL 混合搜索可先用归一化加权分，避免继续暴露 RRF：

```sql
WITH
query AS (
  SELECT
    '[...]'::vector AS qv,
    plainto_tsquery('simple', $1) AS qt
),
vec AS MATERIALIZED (
  SELECT data_id, id AS vector_id, collection_id, (vector <#> (SELECT qv FROM query)) * -1 AS emb_score
  FROM modeldata
  WHERE team_id = $2 AND dataset_id = ANY($3)
  ORDER BY vector <#> (SELECT qv FROM query)
  LIMIT $4
),
txt AS MATERIALIZED (
  SELECT data_id, collection_id, ts_rank_cd(search_tsv, (SELECT qt FROM query)) AS text_score
  FROM modeldata_text
  WHERE team_id = $2 AND dataset_id = ANY($3) AND search_tsv @@ (SELECT qt FROM query)
  ORDER BY text_score DESC
  LIMIT $5
),
merged AS (
  SELECT
    coalesce(vec.data_id, txt.data_id) AS data_id,
    coalesce(vec.collection_id, txt.collection_id) AS collection_id,
    max(coalesce(vec.emb_score, 0)) AS emb_score,
    max(coalesce(txt.text_score, 0)) AS text_score
  FROM vec
  FULL JOIN txt USING (data_id)
  GROUP BY 1, 2
)
SELECT data_id, collection_id, emb_score, text_score,
       $6 * emb_score + (1 - $6) * text_score AS score
FROM merged
ORDER BY score DESC
LIMIT $7;
```

注意：`emb_score` 与 `text_score` 量纲不同，生产实现应做 min-max、rank normalization 或保留 SQL 内 RRF。若强制“不用 RRF”，必须用离线评测校准权重。

### Milvus / Zilliz Cloud

官方能力：

- Milvus 和 Zilliz Cloud 均支持 BM25 full text search：`VARCHAR` 文本字段启用 analyzer，BM25 Function 生成 `SPARSE_FLOAT_VECTOR`，用 BM25 sparse inverted index 检索。
- Milvus/Zilliz 支持多向量 hybrid search，可同时搜索 dense vector、BM25 sparse vector 等字段，并用 `WeightedRanker` 或 `RRFRanker` 做 rerank。
- Milvus analyzer 支持 built-in analyzer 与 custom analyzer，并明确建议中文、日文、韩文使用语言专用 analyzer，例如 `chinese` 或 specialized tokenizer。

可行性：

- 同库全文：高，但现有 collection schema 不包含 chunk 全文字段和 BM25 sparse 字段，需要新增一个按 `dataId` 唯一的全文 collection，或重建为多 collection 结构。
- 单请求混合：有条件成立。Milvus/Zilliz 的 hybrid search 适合 dense 与 sparse 都在同一 collection 的模型；FastGPT 默认两表/两 collection 模型需要 controller 内按 `dataId` 融合，或额外建立 chunk 级 hybrid collection。
- 中文效果：中高。优先测试 `chinese` analyzer；若要保持当前效果，可先把 jieba token 写入 text 字段并使用 whitespace/custom analyzer。
- 工程风险：当前依赖 `@zilliz/milvus2-sdk-node@2.4.10`，官方文档是当前 2.6.x 能力。需要确认 SDK 是否支持 BM25 Function、sparse field、hybrid search 的 Node API；大概率需要升级并兼容 Zilliz Cloud。

推荐新 schema：

`modeldata` dense collection：

- `id`: Int64，继续作为 vector row id。
- `dataId`: VarChar，Mongo `dataset_datas._id`，一个 chunk 多条向量行共享同一个 `dataId`。
- `teamId/datasetId/collectionId/createTime`: metadata filter。
- `vector`: FloatVector(1536)。

`modeldata_text` sparse/fulltext collection：

- `dataId`: VarChar primary key，按 chunk 唯一。
- `teamId/datasetId/collectionId/createTime`: metadata filter。
- `content`: VarChar，原文或 jieba token text。
- `sparse`: SparseFloatVector，由 BM25 Function 从 `content` 生成。

查询方式：

- embedding 搜索：搜索 dense collection 的 `vector`，返回 `dataId`。
- fullText 搜索：搜索 fulltext collection 的 `sparse`，返回 `dataId`。
- mixed 搜索：Milvus 原生 `hybrid_search` 通常要求多个 vector field 在同一 collection。两 collection 模型下需要应用层或服务端按 `dataId` 融合；如果强需求是 Milvus 单次 `hybrid_search`，则只能把 `content/sparse` 冗余到每条向量行，但这会导致一个 chunk 多次参与 BM25 统计和召回，默认不推荐。可选折中是建立一个“chunk 级 hybrid collection”，只存每个 chunk 的代表向量 + sparse，用于 hybrid search，完整多向量召回仍走 dense collection。

限制：

- Milvus full text 是 sparse-vector/BM25 路径，不是传统 SQL `MATCH`。
- BM25 sparse field 不能作为普通 output field 输出，只返回原 text/metadata。
- 旧 collection 可能无法无损追加 BM25 Function 和 sparse index，建议设计成新 collection 并做重建迁移。

### OceanBase

官方能力：

- OceanBase Database MySQL 模式支持 `FULLTEXT INDEX` 和 `MATCH (...) AGAINST (...)`，但 V4.3.1 文档仍提示全文索引处于实验阶段，不建议生产环境使用。
- OceanBase V4.3.3/V4.4 文档和当前代码都支持向量存储、HNSW vector index、`inner_product/cosine_distance` 等向量检索。

可行性：

- 同库全文：中。技术上能新增 `modeldata_text` 存 chunk 级 `content/full_text_token` 并创建 FULLTEXT index。
- 单 SQL 混合：中。可以用子查询/CTE 同时计算 `MATCH AGAINST` 和 vector score，再排序。
- 生产风险：中高。全文索引实验提示是硬约束，必须跑长时间写入、更新、删除、并发查询稳定性验证后再默认启用。
- 中文效果：中。可测试 `WITH PARSER NGRAM` 或继续使用 jieba token；否则中文精确召回不可直接假设。

推荐策略：

- 若部署的是普通 OceanBase：默认只提供可选实验开关，不作为首选生产默认。
- 若部署的是 SeekDB：走 SeekDB 原生 hybrid 搜索，见下一节。

### SeekDB

官方能力：

- SeekDB 官方文档明确描述 hybrid search with full-text indexes and vector indexes。
- `DBMS_HYBRID_SEARCH.SEARCH` 返回 JSON 格式搜索结果；`DBMS_HYBRID_SEARCH.GET_SQL` 可返回实际执行 SQL。
- 默认支持全文和向量结果加权融合，也支持通过 Rank 语法配置 RRF。
- 文档提示 hybrid search 只支持 heap tables。
- 全文索引支持 Space、Basic English、IK、Ngram、jieba 等 tokenizer；其中 jieba tokenizer 插件当前仍标注实验，不建议直接作为生产默认。

可行性：

- 同库全文：高。
- 单语句/系统包混合：高，是当前所有后端里最贴合目标的方案。
- 工程风险：中。当前 FastGPT 的 `SeekVectorCtrl` 直接复用 OceanBase 控制器，表结构不是 heap table，也没有全文字段，需要单独分叉实现。

推荐实现：

- 为 SeekDB 单独扩展 `SeekVectorCtrl`，不要继续完全复用 `ObVectorCtrl`。
- `modeldata` 仍存多向量行；新增 `modeldata_text` heap table，按 `data_id` 唯一存 `content/full_text_token` 和 `FULLTEXT INDEX`。
- 若要使用 `DBMS_HYBRID_SEARCH` 做真正单系统包混合，需要确认该包是否支持向量表与全文表分离。如果只支持同一 heap table，则推荐建立 chunk 级 hybrid 表，存每个 chunk 的代表向量 + 全文索引；多向量精召回仍保留在 `modeldata`。
- 中文 tokenizer 优先对比 IK、NGRAM 与现有 `jiebaSplit` token 写入；SeekDB 原生 jieba 插件可作为实验项，不作为第一批生产默认。
- 如果 `DBMS_HYBRID_SEARCH.SEARCH` 支持表分离，则一次调用完成，结果 JSON 解析成 `dataId/collectionId/score`。
- 如果系统包只支持单表 hybrid，则不要把全文冗余到每条向量行；优先建立 chunk 级 hybrid 表，或退回 SQL/过程内按 `dataId` 融合。
- 如果用户选择非 RRF，则使用默认 weighted fusion；如果需要与旧结果接近，可用 RRF 模式做过渡。

### openGauss + DataVec

官方能力：

- openGauss 支持 `tsvector/tsquery` 作为全文检索类型。
- openGauss DataVec 支持 `vector/bitvector/sparsevector`、IVFFLAT/HNSW/IVFPQ/HNSWPQ 等向量索引，并通过 `ORDER BY vector <-> ... LIMIT topK` 检索。

可行性：

- 同库全文：高。
- 单 SQL 混合：中。和 PG 类似，可以通过 CTE 自行融合。
- 中文效果：中。默认全文配置仍不等同于 jieba，需要保留 jieba token 或引入中文分词配置。
- 工程风险：中。DataVec 文档说明向量索引查询语法对 `ORDER BY` 形式有限制，复杂 CTE 是否稳定走索引需要实测 `EXPLAIN`。

推荐实现：

- 表结构与 PG 类似：`modeldata` 增加 `data_id`，新增 chunk 级 `modeldata_text(data_id, content, full_text_token, search_tsv)`。
- 全文检索用 `to_tsvector`、`plainto_tsquery`、GIN。
- mixed recall 用单 SQL CTE；必要时把 vector topK 与 text topK 做 MATERIALIZED CTE，确保向量索引和全文索引分别命中。

### MongoDB 兼容兜底

MongoDB 官方仍支持 self-managed `$text`，并可通过 `$meta: 'textScore'` 返回/排序相关性分数。但官方也建议新方案优先使用 MongoDB Search 或 Vector Search，而不是 `$text`。

对 FastGPT 来说，Mongo 兜底不是目标方案，只保留以下场景：

- 当前 vector backend 不支持 native full text。
- 目标后端支持但版本或部署未开启相关能力。
- 迁移期间双写校验未完成。
- 某些中文场景原生 analyzer 效果明显低于 jieba + Mongo `$text`，需要灰度回退。

## 技术方案

### 设计原则

1. 不直接删除 Mongo 全文表，先做能力开关和灰度。
2. 新增 vector controller 能力，不把 provider 差异泄漏到 dataset 搜索主流程。
3. 默认采用同库两表：`modeldata` 存多向量行，`modeldata_text` 按 `dataId` 存一条 chunk 全文索引。
4. `dataId` 作为混合搜索返回的主键，避免一个 chunk 多个 vector index 导致全文结果重复和 BM25 文档频率偏移。
5. 第一阶段以“全文索引落到向量库”为目标，不强制同时替换所有中文分词策略。
6. 混合搜索支持两类融合：DB-native weighted/RRF；FastGPT 统一接口保留 `embeddingWeight`。

### 接口扩展

建议扩展 `VectorControllerType`：

```ts
type VectorSearchCapabilities = {
  fullTextRecall: boolean;
  hybridRecall: boolean;
  singleRequestHybrid: boolean;
  nativeChineseAnalyzer: boolean;
};

type InsertVectorControllerProps = {
  teamId: string;
  datasetId: string;
  collectionId: string;
  dataId: string;
  vectors: number[][];
};

type UpsertFullTextControllerProps = {
  teamId: string;
  datasetId: string;
  collectionId: string;
  dataId: string;
  content: string;
  fullTextToken: string;
};

type FullTextRecallCtrlProps = {
  teamId: string;
  datasetIds: string[];
  query: string;
  queryToken: string;
  limit: number;
  forbidCollectionIdList: string[];
  filterCollectionIdList?: string[];
};

type HybridRecallCtrlProps = FullTextRecallCtrlProps & {
  vector: number[];
  embeddingWeight: number;
  embeddingLimit: number;
  fullTextLimit: number;
};
```

返回值统一成：

```ts
type NativeRecallItem = {
  dataId: string;
  vectorId?: string;
  collectionId: string;
  embeddingScore?: number;
  fullTextScore?: number;
  score: number;
};
```

### 写入链路调整

当前流程先插入向量，再创建 `MongoDatasetData`，因此向量库不知道 Mongo `dataId`。迁移需要调整：

1. 在插入前生成 `dataId = new Types.ObjectId()`。
2. `insertDatasetDataVector` 接收 `dataId`，每个 `indexes[]` 生成的向量行都写同一个 `dataId`。
3. 新增 `upsertDatasetDataFullText`，按 `dataId` 在同库全文表写一条 `content/fullTextToken`。
4. 创建 `MongoDatasetData` 时使用预生成 `_id: dataId`。
5. `MongoDatasetDataText` 暂时继续双写，直到灰度验证完成。

更新链路：

- 文本变化时只更新同库全文表的 `content/fullTextToken/search_tsv`；只有 `indexes[]` 变化才重建向量行。
- index 变化时继续按 vector id 删除/新增。
- 删除数据时按 `dataId` 删除全文表行，按 `idList` 或 `dataId` 删除向量行。

### 查询链路调整

`searchDatasetData` 的主流程建议改为：

1. 计算 `forbidCollectionIdList` 和 `filterCollectionIdList`，保持当前权限/标签/时间过滤逻辑。
2. 如果 `searchMode=embedding`，继续走 `embRecall`。
3. 如果 `searchMode=fullTextRecall`：
   - 优先 `Vector.fullTextRecall`。
   - 不支持时回退当前 `MongoDatasetDataText.aggregate`。
4. 如果 `searchMode=mixedRecall`：
   - SQL 型后端优先 `Vector.hybridRecall`，一次 SQL 跨 `modeldata` 与 `modeldata_text` 完成。
   - SeekDB 优先确认 `DBMS_HYBRID_SEARCH` 是否支持向量表与全文表分离；若支持则一次系统包调用完成。
   - Milvus/Zilliz 默认两 collection 后不一定能用一次原生 `hybrid_search` 完成，需要在 controller 内按 `dataId` 做同库融合；如果强制单次 `hybrid_search`，需要额外 chunk 级 hybrid collection 或接受全文字段冗余。
   - 如果只支持同库全文但不支持 hybrid，则在同一向量库内做 `embRecall + fullTextRecall` 后应用层融合。
   - 如果全文不支持，则回退当前向量库 + Mongo `$text` + RRF。
5. 所有 recall 统一返回 `dataId` 后，再回 Mongo 查 `dataset_datas` 和 `collections`，保持最终展示、图片 URL、max token、rerank 逻辑不变。

### 后端实现路线

#### PG/openGauss

- DDL：`modeldata` 增加 `data_id`；新增 `modeldata_text`，字段为 `data_id/team_id/dataset_id/collection_id/content/full_text_token/search_tsv`，创建 GIN 和 metadata btree 索引。
- Insert：`modeldata` 每个 index 一条 vector row；`modeldata_text` 每个 chunk 一条 fulltext row。
- Full text recall：在 `modeldata_text` 上执行 `search_tsv @@ plainto_tsquery('simple', queryToken)`。
- Hybrid recall：CTE 分别召回 `modeldata` 向量 topK 和 `modeldata_text` 全文 topK，再按 `data_id` 融合；或 SQL 内 RRF 作为可选兼容模式。
- 验证：必须 `EXPLAIN ANALYZE` 确认 vector HNSW 与 GIN 都命中。

#### Milvus/Zilliz

- 默认两 collection：dense `modeldata` 存多向量行；sparse `modeldata_text` 按 chunk 唯一，启用 analyzer 和 BM25 Function。
- Index：dense collection 上 `vector` HNSW/IP；fulltext collection 上 `sparse` BM25 sparse inverted index；两边都保留 metadata Trie。
- Full text recall：搜索 fulltext collection 的 `anns_field=sparse`，`data=[query]`。
- Hybrid recall：默认在 controller 内发起 dense search 与 sparse search，并按 `dataId` 做同库融合。若产品强制“一次 Milvus hybrid_search”，需要建立额外 chunk 级 hybrid collection，只存每个 chunk 的代表向量 + sparse；不建议把 sparse 字段冗余到每条 index 向量行。
- 迁移：建议新建 collection 后回放全量 vector/fulltext，不建议在线改旧 schema。

#### OceanBase

- DDL：`modeldata` 增加 `data_id`；新增 `modeldata_text`，创建 `FULLTEXT INDEX`，保留 `modeldata` vector index。
- Full text recall：在 `modeldata_text` 上执行 `MATCH(full_text_token) AGAINST (? IN NATURAL LANGUAGE MODE)`。
- Hybrid recall：单 SQL 子查询/CTE 分别查两张表，再按 `data_id` 融合。
- 默认策略：标记 experimental，需要显式开启。

#### SeekDB

- DDL：`modeldata` 存多向量行；新增 chunk 级 `modeldata_text` heap table，包含 `FULLTEXT INDEX`。
- Full/hybrid recall：优先验证 `DBMS_HYBRID_SEARCH.SEARCH` 能否跨 vector table 与 fulltext table。如果不能，使用单 SQL/过程内融合，或额外建立 chunk 级 hybrid heap table。
- `GET_SQL` 可用于开发期确认实际 SQL 和索引命中。
- 当前 `SeekVectorCtrl` 需要从 OceanBase 控制器中分离出来。

### 数据迁移

1. 增加 schema，不改变旧读路径：`modeldata` 增加 `data_id`，新增 `modeldata_text`。
2. 新写入双写：同库 `modeldata_text` + Mongo `dataset_data_texts`。
3. 后台 backfill：
   - 扫描 `MongoDatasetData`。
   - 对每个 `indexes[].dataId` 更新 `modeldata.data_id`。
   - 对每个 `MongoDatasetData._id` 向 `modeldata_text` upsert 一条 `content/full_text_token`。
   - Milvus/Zilliz 若不支持补 BM25 function 字段，则重建 fulltext collection 或 chunk 级 hybrid collection。
4. 灰度读：
   - `VECTOR_FULLTEXT_MODE=mongo|native|auto`。
   - `auto` 下按 controller capability 决定。
5. 对账：
   - 每日统计 vector row 缺失 `data_id` 数，以及 `MongoDatasetData` 缺失 `modeldata_text` 行数。
   - 对同一批 query 比较旧 Mongo fulltext 与 native fulltext topK overlap、MRR、人工标注命中率。
6. 稳定后删除 Mongo fulltext 写入和清理 `dataset_data_texts`，但建议至少一个版本周期后再物理删除。

## 效果评估

预期收益：

- 少一次 Mongo 全文召回链路，mixed recall 可从“两库并发 + 应用 RRF”收敛为单 DB/API 查询。
- 数据一致性更好：向量和全文索引随同一 vector backend 生命周期管理。
- 部署形态更清晰：知识库检索核心索引集中在向量库，不再要求 Mongo 承担全文检索性能。
- Milvus/Zilliz/SeekDB 的 dense+sparse hybrid 更贴近现代 RAG 检索。

主要风险：

- 中文检索回归。当前 jieba 自定义词典可能比默认 DB analyzer 更适合 FastGPT 数据。
- 分数不可比。向量 inner product、BM25、`ts_rank_cd`、`MATCH AGAINST` 的分数范围不同，非 RRF 加权需要归一化和评测。
- 迁移复杂度。尤其 Milvus/Zilliz 旧 collection schema 可能需要重建。
- Provider 差异大。不能只做一个 SQL 拼接工具，必须落在各 controller 内。
- OceanBase fulltext 生产稳定性需要谨慎，因为官方文档仍有实验提示。

评测建议：

- 构造 100 到 300 条中文、英文、数字编号、专有名词、长问题 query。
- 对比旧链路、native fulltext、native hybrid 三组：
  - topK overlap
  - MRR/nDCG
  - 精确关键词命中率
  - 无召回率
  - P95/P99 延迟
  - 写入后可检索延迟
- 中文测试必须覆盖连续中文、英文缩写、版本号、工单号、产品名、代码标识符。

## 推荐落地顺序

1. PG 先行：当前默认 fallback 是 PG，SQL 能力成熟，适合作为接口与迁移框架样板。
2. Milvus/Zilliz 第二批：完成 SDK 升级和 collection 重建方案后，可获得最完整的 BM25 + hybrid search 能力。
3. SeekDB 单独优化：如果用户部署 SeekDB，优先使用 `DBMS_HYBRID_SEARCH`，但需要从 OceanBase 控制器拆出独立实现。
4. openGauss 跟随 PG：复用 SQL 型 controller 思路，但要实测 DataVec query 限制。
5. OceanBase 谨慎灰度：只在明确版本和压测通过后启用 native fulltext。
6. Mongo 保留兜底：所有 native path 都未覆盖前，不删除当前 Mongo 全文链路。

## 参考资料

- Milvus Full Text Search: https://milvus.io/docs/full-text-search.md
- Milvus Multi-Vector Hybrid Search: https://milvus.io/docs/multi-vector-search.md
- Milvus Analyzer Overview: https://milvus.io/docs/analyzer-overview.md
- Zilliz Cloud Full Text Search: https://docs.zilliz.com/docs/full-text-search
- Zilliz Cloud Hybrid Search: https://docs.zilliz.com/docs/hybrid-search
- pgvector README Hybrid Search: https://github.com/pgvector/pgvector
- PostgreSQL Text Search Types: https://www.postgresql.org/docs/17/datatype-textsearch.html
- PostgreSQL Preferred Index Types for Text Search: https://www.postgresql.org/docs/current/textsearch-indexes.html
- OceanBase Full-text Index: https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378818
- OceanBase Full-text Queries: https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378428
- OceanBase Vector Search with Ollama: https://en.oceanbase.com/docs/common-oceanbase-database-10000000003045202
- SeekDB Hybrid Search: https://www.oceanbase.ai/docs/hybrid-search
- SeekDB Full-text Indexes: https://www.oceanbase.ai/docs/full-text-index/
- openGauss Text Search Types: https://docs.opengauss.org/en/docs/5.1.0/docs/SQLReference/text-search-types.html
- openGauss DataVec Quickstart: https://docs.opengauss.org/zh/docs/latest/datavec/datavec_quickstart.html
- MongoDB `$text`: https://www.mongodb.com/docs/v8.2/reference/operator/query/text/

## TODO

- [ ] 确认产品层面是否接受第一阶段继续使用 `jiebaSplit` 生成 token，但全文索引存储迁到同库 `modeldata_text`。
- [ ] 为 `VectorControllerType` 增加 capability、upsertFullText、deleteFullText、fullTextRecall、hybridRecall 接口。
- [ ] 调整 dataset data 写入流程，预生成 `MongoDatasetData._id`，传入 vector insert，并按 chunk upsert 一条同库全文索引。
- [ ] PG 实现 `modeldata.data_id`、`modeldata_text` schema migration、fullTextRecall、hybridRecall 和 query builder 单测。
- [ ] PG 跑 `EXPLAIN ANALYZE`，确认 HNSW 与 GIN 索引命中。
- [ ] Milvus/Zilliz 验证当前 `@zilliz/milvus2-sdk-node@2.4.10` 是否支持 BM25 Function、fulltext collection 和 hybrid search；如不支持，设计 SDK 升级和 chunk 级 hybrid collection。
- [ ] SeekDB 从 OceanBase controller 拆出独立实现，验证 `DBMS_HYBRID_SEARCH` 是否支持向量表与全文表分离，以及 heap table 限制。
- [ ] openGauss 按 PG 方案实现并验证 DataVec 查询限制。
- [ ] OceanBase 做版本矩阵和稳定性压测后再决定是否开放 native fulltext。
- [ ] 实现 `VECTOR_FULLTEXT_MODE=mongo|native|auto` 灰度开关。
- [ ] 增加 backfill 任务和缺失索引对账任务。
- [ ] 建立中英文检索评测集，对比旧链路和 native 链路效果。
