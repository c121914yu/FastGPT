import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowNodeTemplateType } from '../../type';
import {
  WorkflowIOValueTypeEnum,
  NodeInputKeyEnum,
  NodeOutputKeyEnum,
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
      key: NodeInputKeyEnum.datasetSelectList,
      renderTypeList: [FlowNodeInputTypeEnum.selectDataset, FlowNodeInputTypeEnum.reference],
      label: 'core.module.input.label.Select dataset',
      value: [],
      valueType: WorkflowIOValueTypeEnum.selectDataset,
      list: [],
      required: true
    },
    {
      key: NodeInputKeyEnum.datasetSimilarity,
      renderTypeList: [FlowNodeInputTypeEnum.selectDatasetParamsModal],
      label: '',
      value: 0.4,
      valueType: WorkflowIOValueTypeEnum.number
    },
    // setting from modal
    {
      key: NodeInputKeyEnum.datasetMaxTokens,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      value: 1500,
      valueType: WorkflowIOValueTypeEnum.number
    },
    {
      key: NodeInputKeyEnum.datasetSearchMode,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: WorkflowIOValueTypeEnum.string,
      value: DatasetSearchModeEnum.embedding
    },
    {
      key: NodeInputKeyEnum.datasetSearchUsingReRank,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: WorkflowIOValueTypeEnum.boolean,
      value: false
    },
    {
      key: NodeInputKeyEnum.datasetSearchUsingExtensionQuery,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: WorkflowIOValueTypeEnum.boolean,
      value: true
    },
    {
      key: NodeInputKeyEnum.datasetSearchExtensionModel,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      key: NodeInputKeyEnum.datasetSearchExtensionBg,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: WorkflowIOValueTypeEnum.string,
      value: ''
    },
    {
      ...Input_Template_UserChatInput,
      toolDescription: '需要检索的内容'
    }
  ],
  outputs: [
    {
      id: NodeOutputKeyEnum.datasetIsEmpty,
      key: NodeOutputKeyEnum.datasetIsEmpty,
      label: 'core.module.output.label.Search result empty',
      type: FlowNodeOutputTypeEnum.static,
      valueType: WorkflowIOValueTypeEnum.boolean
    },
    {
      id: NodeOutputKeyEnum.datasetUnEmpty,
      key: NodeOutputKeyEnum.datasetUnEmpty,
      label: 'core.module.output.label.Search result not empty',
      type: FlowNodeOutputTypeEnum.static,
      valueType: WorkflowIOValueTypeEnum.boolean
    },
    {
      id: NodeOutputKeyEnum.datasetQuoteQA,
      key: NodeOutputKeyEnum.datasetQuoteQA,
      label: 'core.module.Dataset quote.label',
      type: FlowNodeOutputTypeEnum.static,
      valueType: WorkflowIOValueTypeEnum.datasetQuote
    }
  ]
};
