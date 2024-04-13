/* 
  react flow type
*/
import { FlowNodeInputTypeEnum, FlowNodeOutputTypeEnum, FlowNodeTypeEnum } from './constant';
import { WorkflowIOValueTypeEnum, NodeInputKeyEnum, NodeOutputKeyEnum } from '../constants';
import { SelectedDatasetType } from '../api';
import { EditInputFieldMap, EditOutputFieldMap } from './type';
import { LLMModelTypeEnum } from '../../ai/constants';

/* --------------- edit field ------------------- */
export type EditInputFieldMap = EditOutputFieldMap & {
  inputType?: boolean;
  required?: boolean;
  isToolInput?: boolean;
};
export type EditOutputFieldMap = {
  name?: boolean;
  key?: boolean;
  description?: boolean;
  dataType?: boolean;
  defaultValue?: boolean;
};
export type EditNodeFieldType = {
  inputType?: `${FlowNodeInputTypeEnum}`; // input type
  outputType?: `${FlowNodeOutputTypeEnum}`;
  required?: boolean;
  key?: string;
  label?: string;
  description?: string;
  valueType?: `${WorkflowIOValueTypeEnum}`;
  isToolInput?: boolean;
  defaultValue?: string;
};
