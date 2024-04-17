import type { FlowNodeOutputItemType } from '../type/io.d';
import { NodeOutputKeyEnum } from '../constants';
import { FlowNodeOutputTypeEnum } from '../node/constant';
import { WorkflowIOValueTypeEnum } from '../constants';

export const Output_Template_AddOutput: FlowNodeOutputItemType = {
  id: NodeOutputKeyEnum.userChatInput,
  key: NodeOutputKeyEnum.addOutputParam,
  type: FlowNodeOutputTypeEnum.dynamic,
  valueType: WorkflowIOValueTypeEnum.any,
  label: ''
};
