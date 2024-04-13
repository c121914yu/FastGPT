import { FlowNodeInputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import { FlowNodeInputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';

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
    valueType: WorkflowIOValueTypeEnum.string
  }
};
