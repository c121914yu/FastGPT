import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowNodeTemplateType } from '../../type';
import {
  ModuleIOValueTypeEnum,
  ModuleInputKeyEnum,
  ModuleOutputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../../constants';
import {
  Input_Template_SettingAiModel,
  Input_Template_Dataset_Quote,
  Input_Template_History,
  Input_Template_System_Prompt,
  Input_Template_UserChatInput
} from '../input';
import { chatNodeSystemPromptTip } from '../tip';
import { getHandleConfig } from '../utils';

export const AiChatModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.chatNode,
  templateType: FlowNodeTemplateTypeEnum.textAnswer,
  flowNodeType: FlowNodeTypeEnum.chatNode,
  sourceHandle: getHandleConfig(false, true, false, false),
  targetHandle: getHandleConfig(false, false, false, true),
  avatar: '/imgs/workflow/AI.png',
  name: 'AI 对话',
  intro: 'AI 大模型对话',
  showStatus: true,
  isTool: true,
  inputs: [
    Input_Template_SettingAiModel,
    // --- settings modal
    {
      key: ModuleInputKeyEnum.aiChatTemperature,
      renderTypeList: [FlowNodeInputTypeEnum.hidden], // Set in the pop-up window
      label: '',
      value: 0,
      valueType: ModuleIOValueTypeEnum.number,
      min: 0,
      max: 10,
      step: 1
    },
    {
      key: ModuleInputKeyEnum.aiChatMaxToken,
      renderTypeList: [FlowNodeInputTypeEnum.hidden], // Set in the pop-up window
      label: '',
      value: 2000,
      valueType: ModuleIOValueTypeEnum.number,
      min: 100,
      max: 4000,
      step: 50
    },
    {
      key: ModuleInputKeyEnum.aiChatIsResponseText,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      value: true,
      valueType: ModuleIOValueTypeEnum.boolean
    },
    {
      key: ModuleInputKeyEnum.aiChatQuoteTemplate,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: ModuleIOValueTypeEnum.string
    },
    {
      key: ModuleInputKeyEnum.aiChatQuotePrompt,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: '',
      valueType: ModuleIOValueTypeEnum.string
    },
    // settings modal ---
    {
      ...Input_Template_System_Prompt,
      label: 'core.ai.Prompt',
      description: chatNodeSystemPromptTip,
      placeholder: chatNodeSystemPromptTip
    },
    Input_Template_History,
    { ...Input_Template_UserChatInput, toolDescription: '用户问题' },
    Input_Template_Dataset_Quote
  ],
  outputs: [
    {
      id: ModuleOutputKeyEnum.history,
      key: ModuleOutputKeyEnum.history,
      label: 'core.module.output.label.New context',
      description: 'core.module.output.description.New context',
      valueType: ModuleIOValueTypeEnum.chatHistory,
      type: FlowNodeOutputTypeEnum.source
    },
    {
      id: ModuleOutputKeyEnum.answerText,
      key: ModuleOutputKeyEnum.answerText,
      label: 'core.module.output.label.Ai response content',
      description: 'core.module.output.description.Ai response content',
      valueType: ModuleIOValueTypeEnum.string,
      type: FlowNodeOutputTypeEnum.source
    }
  ]
};
