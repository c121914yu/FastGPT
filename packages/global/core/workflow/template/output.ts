import type { FlowNodeOutputItemType } from '../node/type';
import { ModuleOutputKeyEnum } from '../constants';
import { FlowNodeOutputTypeEnum } from '../node/constant';
import { ModuleIOValueTypeEnum } from '../constants';

export const Output_Template_AddOutput: FlowNodeOutputItemType = {
  key: ModuleOutputKeyEnum.addOutputParam,
  type: FlowNodeOutputTypeEnum.addOutputParam,
  valueType: ModuleIOValueTypeEnum.any,
  label: ''
};
