import type { FlowNodeOutputItemType } from '../type/io.d';
import { ModuleOutputKeyEnum } from '../constants';
import { FlowNodeOutputTypeEnum } from '../node/constant';
import { ModuleIOValueTypeEnum } from '../constants';

export const Output_Template_AddOutput: FlowNodeOutputItemType = {
  id: ModuleOutputKeyEnum.userChatInput,
  key: ModuleOutputKeyEnum.addOutputParam,
  type: FlowNodeOutputTypeEnum.addOutputParam,
  valueType: ModuleIOValueTypeEnum.any,
  label: ''
};
