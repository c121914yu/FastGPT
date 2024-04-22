export const Prompt_AgentQA = {
  description: `<Context></Context> 标记中是一段文本，学习和分析它，并整理学习成果：
- 提出问题并给出每个问题的答案。
- 答案需详细完整，尽可能保留原文描述。
- 答案可以包含普通文字、链接、代码、表格、公示、媒体链接等 Markdown 元素。
- 最多提出 30 个问题。
`,
  fixedText: `请按以下格式整理学习成果:
<Context>
文本
</Context>
Q1: 问题。
A1: 答案。
Q2:
A2:

------

我们开始吧!

<Context>
{{text}}
<Context/>
`
};

export const Prompt_ExtractJson = `你可以从 <对话记录></对话记录> 中提取指定 JSON 信息，你仅需返回 JSON 字符串，无需回答问题。
<提取要求>
{{description}}
</提取要求>

<字段说明>
1. 下面的 JSON 字符串均按照 JSON Schema 的规则描述。
2. key 代表字段名；description 代表字段的描述；enum 是可选值，代表可选的 value。
3. 如果没有可提取的内容，忽略该字段。
4. 本次需提取的JSON Schema：{{json}}
</字段说明>

<对话记录>
{{text}}
</对话记录>
`;

export const Prompt_CQJson = `你是一个语义判断器，可以判断我的问题属于哪个类型。

<问题类型>
{{typeList}}
</问题类型>

请结合<背景知识></背景知识> 和 <对话记录></对话记录>， 判断当前问题属于哪个“问题分类”，并返回“类型ID”。


<背景知识>
{{systemPrompt}}
</背景知识>

<对话记录>
{{history}}
</对话记录>

当前问题："{{question}}"

类型ID=
`;
