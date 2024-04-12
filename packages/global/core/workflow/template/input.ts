import { DYNAMIC_INPUT_KEY, ModuleInputKeyEnum } from '../constants';
import { FlowNodeInputTypeEnum } from '../node/constant';
import { ModuleIOValueTypeEnum } from '../constants';
import { chatNodeSystemPromptTip } from './tip';
import { FlowNodeInputItemType } from '../type/io';

export const Input_Template_History: FlowNodeInputItemType = {
  key: ModuleInputKeyEnum.history,
  renderTypeList: [FlowNodeInputTypeEnum.numberInput, FlowNodeInputTypeEnum.reference],
  valueType: ModuleIOValueTypeEnum.chatHistory,
  label: 'core.module.input.label.chat history',
  required: true,
  min: 0,
  max: 30,
  value: 6
};

export const Input_Template_UserChatInput: FlowNodeInputItemType = {
  key: ModuleInputKeyEnum.userChatInput,
  renderTypeList: [FlowNodeInputTypeEnum.reference, FlowNodeInputTypeEnum.textarea],
  valueType: ModuleIOValueTypeEnum.string,
  label: '用户问题',
  required: true
};

export const Input_Template_AddInputParam: FlowNodeInputItemType = {
  key: ModuleInputKeyEnum.addInputParam,
  renderTypeList: [FlowNodeInputTypeEnum.addInputParam],
  valueType: ModuleIOValueTypeEnum.any,
  label: '',
  required: false
};

export const Input_Template_DynamicInput: FlowNodeInputItemType = {
  key: DYNAMIC_INPUT_KEY,
  renderTypeList: [FlowNodeInputTypeEnum.reference],
  valueType: ModuleIOValueTypeEnum.dynamic,
  label: 'core.module.inputType.dynamicTargetInput',
  description: 'core.module.input.description.dynamic input',
  required: false
};

export const Input_Template_SelectAIModel: FlowNodeInputItemType = {
  key: ModuleInputKeyEnum.aiModel,
  renderTypeList: [FlowNodeInputTypeEnum.selectLLMModel, FlowNodeInputTypeEnum.reference],
  label: 'core.module.input.label.aiModel',
  required: true,
  valueType: ModuleIOValueTypeEnum.string
};
export const Input_Template_SettingAiModel: FlowNodeInputItemType = {
  key: ModuleInputKeyEnum.aiModel,
  renderTypeList: [FlowNodeInputTypeEnum.settingLLMModel, FlowNodeInputTypeEnum.reference],
  label: 'core.module.input.label.aiModel',
  valueType: ModuleIOValueTypeEnum.string
};

export const Input_Template_System_Prompt: FlowNodeInputItemType = {
  key: ModuleInputKeyEnum.aiSystemPrompt,
  renderTypeList: [FlowNodeInputTypeEnum.textarea, FlowNodeInputTypeEnum.reference],
  max: 3000,
  valueType: ModuleIOValueTypeEnum.string,
  label: 'core.ai.Prompt',
  description: chatNodeSystemPromptTip,
  placeholder: chatNodeSystemPromptTip
};

export const Input_Template_Dataset_Quote: FlowNodeInputItemType = {
  key: ModuleInputKeyEnum.aiChatDatasetQuote,
  renderTypeList: [FlowNodeInputTypeEnum.settingDatasetQuotePrompt],
  label: '知识库引用',
  description: 'core.module.Dataset quote.Input description',
  valueType: ModuleIOValueTypeEnum.datasetQuote
};
