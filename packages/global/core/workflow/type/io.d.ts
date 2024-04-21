import { LLMModelTypeEnum } from '../../ai/constants';
import { WorkflowIOValueTypeEnum, NodeInputKeyEnum, NodeOutputKeyEnum } from '../constants';
import { FlowNodeInputTypeEnum, FlowNodeOutputTypeEnum } from '../node/constant';
import { EditInputFieldMapType, EditOutputFieldMapType } from '../node/type';

export type FlowNodeInputItemType = {
  selectedTypeIndex?: number;
  renderTypeList: FlowNodeInputTypeEnum[]; // Node Type. Decide on a render style

  key: `${NodeInputKeyEnum}` | string;
  valueType?: `${WorkflowIOValueTypeEnum}`; // data type
  value?: any;
  label: string;
  debugLabel?: string;
  description?: string; // field desc
  required?: boolean;
  toolDescription?: string; // If this field is not empty, it is entered as a tool

  maxLength?: number; // input,textarea

  // edit
  canEdit?: boolean;
  editField?: EditInputFieldMapType; // 添加

  // hideInApp?: boolean;
  // hideInPlugin?: boolean;

  // render components params
  referencePlaceholder?: string;
  placeholder?: string; // input,textarea

  list?: { label: string; value: any }[]; // select

  markList?: { label: string; value: any }[]; // slider
  step?: number; // slider
  max?: number; // slider, number input
  min?: number; // slider, number input

  llmModelType?: `${LLMModelTypeEnum}`;
};

export type FlowNodeOutputItemType = {
  id: string; // output unique id(Does not follow the key change)
  type: `${FlowNodeOutputTypeEnum}`;
  key: `${NodeOutputKeyEnum}` | string;
  valueType?: `${WorkflowIOValueTypeEnum}`;
  value?: any;

  label?: string;
  description?: string;
  defaultValue?: any;
  required?: boolean;

  // component params
  editField?: EditOutputFieldMapType; // 添加
};

export type ReferenceValueProps = [string, string | undefined];
