import { AppTTSConfigType, AppWhisperConfigType } from './type';

export enum AppTypeEnum {
  simple = 'simple',
  workflow = 'advanced',
  plugin = 'plugin'
}
export const AppTypeMap = {
  [AppTypeEnum.simple]: {
    label: '简易应用',
    icon: 'core/app/simpleBot'
  },
  [AppTypeEnum.workflow]: {
    label: '工作流',
    icon: 'core/app/workflowBot'
  },
  [AppTypeEnum.plugin]: {
    label: '插件',
    icon: 'core/app/pluginBot'
  }
};

export const defaultTTSConfig: AppTTSConfigType = { type: 'web' };

export const defaultWhisperConfig: AppWhisperConfigType = {
  open: false,
  autoSend: false,
  autoTTSResponse: false
};

export const defaultChatInputGuideConfig = {
  open: false,
  textList: [],
  customUrl: ''
};
