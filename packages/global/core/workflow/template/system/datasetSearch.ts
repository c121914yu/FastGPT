import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowNodeTemplateType } from '../../type';
import {
  ModuleIOValueTypeEnum,
  ModuleInputKeyEnum,
  ModuleOutputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../../constants';
import { Input_Template_UserChatInput } from '../input';
import { DatasetSearchModeEnum } from '../../../dataset/constants';
import { getHandleConfig } from '../utils';

export const Dataset_SEARCH_DESC =
  '调用“语义检索”和“全文检索”能力，从“知识库”中查找可能与问题相关的参考内容';

export const DatasetSearchModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.datasetSearchNode,
  templateType: FlowNodeTemplateTypeEnum.functionCall,
  flowNodeType: FlowNodeTypeEnum.datasetSearchNode,
  sourceHandle: getHandleConfig(false, true, false, false),
  targetHandle: getHandleConfig(false, false, false, true),
  avatar: '/imgs/workflow/db.png',
  name: '知识库搜索',
  intro: Dataset_SEARCH_DESC,
  showStatus: true,
  isTool: true,
  inputs: [
    {
      key: ModuleInputKeyEnum.datasetSelectList,
      renderTypeList: [FlowNodeInputTypeEnum.selectDataset, FlowNodeInputTypeEnum.reference],
      label: 'core.module.input.label.Select dataset',
      value: [],
      valueType: ModuleIOValueTypeEnum.selectDataset,
      list: [],
      required: true
    },
    {
      key: ModuleInputKeyEnum.datasetSimilarity,
      renderTypeList: [FlowNodeInputTypeEnum.selectDatasetParamsModal],
      label: '',
      value: 0.4,
      valueType: ModuleIOValueTypeEnum.number
    },
    // setting from modal
    {
      key: ModuleInputKeyEnum.datasetMaxTokens,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      value: 1500,
      valueType: ModuleIOValueTypeEnum.number
    },
    {
      key: ModuleInputKeyEnum.datasetSearchMode,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: ModuleIOValueTypeEnum.string,
      value: DatasetSearchModeEnum.embedding
    },
    {
      key: ModuleInputKeyEnum.datasetSearchUsingReRank,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: ModuleIOValueTypeEnum.boolean,
      value: false
    },
    {
      key: ModuleInputKeyEnum.datasetSearchUsingExtensionQuery,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: ModuleIOValueTypeEnum.boolean,
      value: true
    },
    {
      key: ModuleInputKeyEnum.datasetSearchExtensionModel,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: ModuleIOValueTypeEnum.string
    },
    {
      key: ModuleInputKeyEnum.datasetSearchExtensionBg,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: ModuleIOValueTypeEnum.string,
      value: ''
    },
    {
      ...Input_Template_UserChatInput,
      toolDescription: '需要检索的内容'
    }
  ],
  outputs: [
    {
      id: ModuleOutputKeyEnum.datasetIsEmpty,
      key: ModuleOutputKeyEnum.datasetIsEmpty,
      label: 'core.module.output.label.Search result empty',
      type: FlowNodeOutputTypeEnum.source,
      valueType: ModuleIOValueTypeEnum.boolean
    },
    {
      id: ModuleOutputKeyEnum.datasetUnEmpty,
      key: ModuleOutputKeyEnum.datasetUnEmpty,
      label: 'core.module.output.label.Search result not empty',
      type: FlowNodeOutputTypeEnum.source,
      valueType: ModuleIOValueTypeEnum.boolean
    },
    {
      id: ModuleOutputKeyEnum.datasetQuoteQA,
      key: ModuleOutputKeyEnum.datasetQuoteQA,
      label: 'core.module.Dataset quote.label',
      type: FlowNodeOutputTypeEnum.source,
      valueType: ModuleIOValueTypeEnum.datasetQuote
    }
  ]
};
