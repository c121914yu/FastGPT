import { StoreNodeItemType } from '../workflow/type';

export const defaultModules: StoreNodeItemType[] = [
  {
    nodeId: 'custom-output',
    name: '自定义输出',
    flowNodeType: 'pluginOutput',
    showStatus: false,
    position: {
      x: 994.1266684738011,
      y: -45.87689365278443
    },
    inputs: [],
    outputs: []
  },
  {
    nodeId: 'custom-input',
    name: '自定义输入',
    flowNodeType: 'pluginInput',
    showStatus: false,
    position: {
      x: 457.57860319995154,
      y: -44.25099042468186
    },
    inputs: [],
    outputs: []
  }
];

export enum PluginTypeEnum {
  folder = 'folder',
  custom = 'custom',
  http = 'http'
}
export const pluginTypeMap = {
  [PluginTypeEnum.folder]: {
    label: '文件夹',
    icon: 'file/fill/folder'
  },
  [PluginTypeEnum.custom]: {
    label: '自定义',
    icon: 'common/custom'
  },
  [PluginTypeEnum.http]: {
    label: 'HTTP',
    icon: 'common/http'
  }
};

export enum PluginSourceEnum {
  personal = 'personal',
  community = 'community',
  commercial = 'commercial'
}
