import { LLMModelTypeEnum } from '../../ai/constants';
import { ModuleIOValueTypeEnum, ModuleInputKeyEnum, ModuleOutputKeyEnum } from '../constants';
import { FlowNodeInputTypeEnum, FlowNodeOutputTypeEnum } from '../node/constant';

export type FlowNodeInputItemType = {
  selectedTypeIndex?: number;
  renderTypeList: `${FlowNodeInputTypeEnum}`[]; // Node Type. Decide on a render style
  key: `${ModuleInputKeyEnum}` | string;
  valueType?: `${ModuleIOValueTypeEnum}`; // data type
  value?: any;
  label: string;
  description?: string; // field desc
  required?: boolean;
  toolDescription?: string; // If this field is not empty, it is entered as a tool

  // hideInApp?: boolean;
  // hideInPlugin?: boolean;

  // render components params
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
  type?: `${FlowNodeOutputTypeEnum}`;
  key: `${ModuleOutputKeyEnum}` | string;
  value?: any;
  valueType?: `${ModuleIOValueTypeEnum}`;

  label?: string;
  description?: string;
  defaultValue?: any;
};
