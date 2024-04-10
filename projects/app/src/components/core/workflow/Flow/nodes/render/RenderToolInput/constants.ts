import { FlowNodeInputItemType } from '@fastgpt/global/core/workflow/node/type';
import { FlowNodeInputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { ModuleIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';

export const defaultEditFormData: FlowNodeInputItemType = {
  valueType: 'string',
  type: FlowNodeInputTypeEnum.target,
  key: '',
  label: '',
  toolDescription: '',
  required: true,
  edit: true,
  editField: {
    key: true,
    description: true,
    dataType: true
  },
  defaultEditField: {
    label: '',
    key: '',
    description: '',
    inputType: FlowNodeInputTypeEnum.target,
    valueType: ModuleIOValueTypeEnum.string
  }
};
