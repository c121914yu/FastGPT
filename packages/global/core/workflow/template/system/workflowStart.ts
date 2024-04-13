import { FlowNodeOutputTypeEnum, FlowNodeTypeEnum } from '../../node/constant';
import { FlowNodeTemplateType } from '../../type/index.d';
import {
  WorkflowIOValueTypeEnum,
  NodeOutputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../../constants';
import { getHandleConfig } from '../utils';

export const WorkflowStart: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.workflowStart,
  templateType: FlowNodeTemplateTypeEnum.systemInput,
  flowNodeType: FlowNodeTypeEnum.workflowStart,
  sourceHandle: getHandleConfig(false, true, false, false),
  targetHandle: getHandleConfig(false, false, false, false),
  avatar: '/imgs/workflow/userChatInput.svg',
  name: '流程开始',
  intro: '',
  forbidDelete: true,
  unique: true,
  inputs: [],
  outputs: [
    {
      id: NodeOutputKeyEnum.userChatInput,
      key: NodeOutputKeyEnum.userChatInput,
      label: 'core.module.input.label.user question',
      type: FlowNodeOutputTypeEnum.source,
      valueType: WorkflowIOValueTypeEnum.string
    }
  ]
};
