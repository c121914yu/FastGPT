import { FlowNodeInputTypeEnum, FlowNodeOutputTypeEnum, FlowNodeTypeEnum } from './constant';
import { ModuleIOValueTypeEnum, ModuleInputKeyEnum, ModuleOutputKeyEnum } from '../constants';
import { SelectedDatasetType } from '../api';
import { EditInputFieldMap, EditOutputFieldMap } from './type';
import { LLMModelTypeEnum } from '../../ai/constants';

export type FlowNodeChangeProps = { nodeId: string } & (
  | {
      type: 'attr'; // key: attr, value: new value
      key: string;
      value: any;
    }
  | {
      type: 'updateInput'; // key: update input key, value: new input value
      key: string;
      value: any;
    }
  | {
      type: 'replaceInput'; // key: old input key, value: new input value
      key: string;
      value: any;
    }
  | {
      type: 'addInput'; // key: null, value: new input value
      value: any;
      index?: number;
    }
  | {
      type: 'delInput'; // key: delete input key, value: null
      key: string;
    }
  | {
      type: 'updateOutput'; // key: update output key, value: new output value
      key: string;
      value: any;
    }
  | {
      type: 'replaceOutput'; // key: old output key, value: new output value
      key: string;
      value: any;
    }
  | {
      type: 'addOutput'; // key: null, value: new output value
      value: any;
      index?: number;
    }
  | {
      type: 'delOutput'; // key: delete output key, value: null
      key: string;
    }
);

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
  valueType?: `${ModuleIOValueTypeEnum}`;
  isToolInput?: boolean;
  defaultValue?: string;
};

/* ------------- item type --------------- */
export type SettingAIDataType = {
  model: string;
  temperature: number;
  maxToken: number;
  isResponseAnswerText?: boolean;
  maxHistories?: number;
};
/* ai chat modules props */
export type AIChatModuleProps = {
  [ModuleInputKeyEnum.aiModel]: string;
  [ModuleInputKeyEnum.aiSystemPrompt]?: string;
  [ModuleInputKeyEnum.aiChatTemperature]: number;
  [ModuleInputKeyEnum.aiChatMaxToken]: number;
  [ModuleInputKeyEnum.aiChatIsResponseText]: boolean;
  [ModuleInputKeyEnum.aiChatQuoteTemplate]?: string;
  [ModuleInputKeyEnum.aiChatQuotePrompt]?: string;
};

export type DatasetModuleProps = {
  [ModuleInputKeyEnum.datasetSelectList]: SelectedDatasetType;
  [ModuleInputKeyEnum.datasetSimilarity]: number;
  [ModuleInputKeyEnum.datasetMaxTokens]: number;
  [ModuleInputKeyEnum.datasetStartReRank]: boolean;
};
