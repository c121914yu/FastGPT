import { FlowNodeInputTypeEnum, FlowNodeTypeEnum } from '../../node/constant';
import { FlowNodeTemplateType } from '../../type/index.d';
import {
  ModuleIOValueTypeEnum,
  ModuleInputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../../constants';
import { getHandleConfig } from '../utils';

export const SystemConfigNode: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.systemConfig,
  templateType: FlowNodeTemplateTypeEnum.systemInput,
  flowNodeType: FlowNodeTypeEnum.systemConfig,
  sourceHandle: getHandleConfig(false, false, false, false),
  targetHandle: getHandleConfig(false, false, false, false),
  avatar: '/imgs/workflow/userGuide.png',
  name: '系统配置',
  intro: '可以配置应用的系统参数。',
  unique: true,
  forbidDelete: true,
  inputs: [
    {
      key: ModuleInputKeyEnum.welcomeText,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      valueType: ModuleIOValueTypeEnum.string,
      label: 'core.app.Welcome Text'
    },
    {
      key: ModuleInputKeyEnum.variables,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      valueType: ModuleIOValueTypeEnum.any,
      label: 'core.module.Variable',
      value: []
    },
    {
      key: ModuleInputKeyEnum.questionGuide,
      valueType: ModuleIOValueTypeEnum.boolean,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      label: ''
    },
    {
      key: ModuleInputKeyEnum.tts,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      valueType: ModuleIOValueTypeEnum.any,
      label: ''
    },
    {
      key: ModuleInputKeyEnum.whisper,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      valueType: ModuleIOValueTypeEnum.any,
      label: ''
    }
  ],
  outputs: []
};
