import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowNodeTemplateType } from '../../type.d';
import {
  ModuleIOValueTypeEnum,
  ModuleInputKeyEnum,
  ModuleOutputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../../constants';
import { Input_Template_Dataset_Quote, Input_Template_Switch } from '../input';
import { getNanoid } from '../../../../common/string/tools';
import { getHandleConfig } from '../utils';

export const getOneQuoteInputTemplate = (key = getNanoid()) => ({
  ...Input_Template_Dataset_Quote,
  key,
  type: FlowNodeInputTypeEnum.hidden
});

export const DatasetConcatModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.datasetConcatNode,
  flowNodeType: FlowNodeTypeEnum.datasetConcatNode,
  templateType: FlowNodeTemplateTypeEnum.other,
  sourceHandle: getHandleConfig(false, true, false, false),
  targetHandle: getHandleConfig(false, false, false, true),
  avatar: '/imgs/workflow/concat.svg',
  name: '知识库搜索引用合并',
  intro: '可以将多个知识库搜索结果进行合并输出。使用 RRF 的合并方式进行最终排序输出。',
  showStatus: false,
  inputs: [
    Input_Template_Switch,
    {
      key: ModuleInputKeyEnum.datasetMaxTokens,
      type: FlowNodeInputTypeEnum.custom,
      label: '最大 Tokens',
      value: 1500,
      valueType: ModuleIOValueTypeEnum.number
    },
    getOneQuoteInputTemplate('defaultQuote')
  ],
  outputs: [
    {
      key: ModuleOutputKeyEnum.datasetQuoteQA,
      label: 'core.module.Dataset quote.label',
      type: FlowNodeOutputTypeEnum.source,
      valueType: ModuleIOValueTypeEnum.datasetQuote
    }
  ]
};
