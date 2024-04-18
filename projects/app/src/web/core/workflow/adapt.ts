import {
  FlowNodeTemplateTypeEnum,
  WorkflowIOValueTypeEnum
} from '@fastgpt/global/core/workflow/constants';
import {
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '@fastgpt/global/core/workflow/node/constant';
import { getHandleConfig } from '@fastgpt/global/core/workflow/template/utils';
import { FlowNodeItemType, FlowNodeTemplateType } from '@fastgpt/global/core/workflow/type';
import { VARIABLE_NODE_ID } from './constants';
import { splitGuideModule } from '@fastgpt/global/core/workflow/utils';

export const systemConfigNode2VariableNode = (node: FlowNodeItemType) => {
  const template: FlowNodeTemplateType = {
    id: FlowNodeTypeEnum.globalVariable,
    templateType: FlowNodeTemplateTypeEnum.other,
    flowNodeType: FlowNodeTypeEnum.emptyNode,
    sourceHandle: getHandleConfig(false, false, false, false),
    targetHandle: getHandleConfig(false, false, false, false),
    avatar: '/imgs/workflow/variable.png',
    name: '全局变量',
    intro: '',
    unique: true,
    forbidDelete: true,
    inputs: [],
    outputs: []
  };

  const { variableModules } = splitGuideModule(node);

  const variableNode: FlowNodeItemType = {
    nodeId: VARIABLE_NODE_ID,
    ...template,
    outputs: variableModules.map((item) => ({
      id: item.key,
      type: FlowNodeOutputTypeEnum.dynamic,
      label: item.label,
      key: item.key,
      valueType: WorkflowIOValueTypeEnum.any
    }))
  };

  return variableNode;
};
