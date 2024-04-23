import { ReferenceValueProps } from 'core/workflow/type/io';
import { VariableConditionEnum } from './constant';

export type IfElseConditionType = 'And' | 'Or';
export type IfElseListItemType = {
  variable?: ReferenceValueProps;
  condition?: VariableConditionEnum;
  value?: string;
};
