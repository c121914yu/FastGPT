import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowNodeTemplateType } from '../../type.d';
import {
  ModuleIOValueTypeEnum,
  ModuleInputKeyEnum,
  ModuleOutputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../../constants';
import {
  Input_Template_History,
  Input_Template_Switch,
  Input_Template_UserChatInput
} from '../input';
import { getHandleConfig } from '../utils';

export const RunAppModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.runApp,
  templateType: FlowNodeTemplateTypeEnum.externalCall,
  flowNodeType: FlowNodeTypeEnum.runApp,
  sourceHandle: getHandleConfig(false, true, false, false),
  targetHandle: getHandleConfig(false, false, false, true),
  avatar: '/imgs/workflow/app.png',
  name: '应用调用',
  intro: '可以选择一个其他应用进行调用',
  showStatus: true,
  inputs: [
    Input_Template_Switch,
    {
      key: ModuleInputKeyEnum.runAppSelectApp,
      type: FlowNodeInputTypeEnum.selectApp,
      valueType: ModuleIOValueTypeEnum.selectApp,
      label: '选择一个应用',
      description: '选择一个其他应用进行调用',
      required: true
    },
    Input_Template_History,
    Input_Template_UserChatInput
  ],
  outputs: [
    {
      key: ModuleOutputKeyEnum.history,
      label: '新的上下文',
      description: '将该应用回复内容拼接到历史记录中，作为新的上下文返回',
      valueType: ModuleIOValueTypeEnum.chatHistory,
      type: FlowNodeOutputTypeEnum.source
    },
    {
      key: ModuleOutputKeyEnum.answerText,
      label: '回复的文本',
      description: '将在应用完全结束后触发',
      valueType: ModuleIOValueTypeEnum.string,
      type: FlowNodeOutputTypeEnum.source
    }
  ]
};
