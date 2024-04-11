import { FlowNodeInputTypeEnum, FlowNodeTypeEnum } from '../../node/constant';
import { FlowNodeTemplateType } from '../../type.d';
import {
  ModuleIOValueTypeEnum,
  ModuleInputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../../constants';
import { getHandleConfig } from '../utils';

export const UserGuideModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.userGuide,
  templateType: FlowNodeTemplateTypeEnum.systemInput,
  flowNodeType: FlowNodeTypeEnum.userGuide,
  sourceHandle: getHandleConfig(false, false, false, false),
  targetHandle: getHandleConfig(false, false, false, false),
  avatar: '/imgs/workflow/userGuide.png',
  name: '系统配置',
  intro: '可以配置应用的系统参数。',
  forbidDelete: true,
  inputs: [
    {
      key: ModuleInputKeyEnum.welcomeText,
      type: FlowNodeInputTypeEnum.hidden,
      valueType: ModuleIOValueTypeEnum.string,
      label: 'core.app.Welcome Text'
    },
    {
      key: ModuleInputKeyEnum.variables,
      type: FlowNodeInputTypeEnum.hidden,
      valueType: ModuleIOValueTypeEnum.any,
      label: 'core.module.Variable',
      value: []
    },
    {
      key: ModuleInputKeyEnum.questionGuide,
      valueType: ModuleIOValueTypeEnum.boolean,
      type: FlowNodeInputTypeEnum.switch,
      label: ''
    },
    {
      key: ModuleInputKeyEnum.tts,
      type: FlowNodeInputTypeEnum.hidden,
      valueType: ModuleIOValueTypeEnum.any,
      label: '',
      showTargetInApp: false,
      showTargetInPlugin: false
    },
    {
      key: ModuleInputKeyEnum.whisper,
      type: FlowNodeInputTypeEnum.hidden,
      valueType: ModuleIOValueTypeEnum.any,
      label: '',
      showTargetInApp: false,
      showTargetInPlugin: false
    }
  ],
  outputs: []
};
