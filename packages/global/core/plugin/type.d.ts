import { ModuleTemplateTypeEnum } from '../workflow/constants';
import type { FlowModuleTemplateType, StoreNodeItemType } from '../workflow/type';
import { PluginSourceEnum, PluginTypeEnum } from './constants';
import { MethodType } from './controller';

export type PluginItemSchema = {
  _id: string;
  userId: string;
  teamId: string;
  tmbId: string;
  name: string;
  avatar: string;
  intro: string;
  updateTime: Date;
  modules: StoreNodeItemType[];
  parentId: string;
  type: `${PluginTypeEnum}`;
  metadata?: {
    pluginUid?: string;
    apiSchemaStr?: string;
    customHeaders?: string;
  };
};

/* plugin template */
export type PluginTemplateType = PluginRuntimeType & {
  author?: string;
  id: string;
  source: `${PluginSourceEnum}`;
  templateType: FlowNodeTemplateType['templateType'];
  intro: string;
  modules: StoreNodeItemType[];
};

export type PluginRuntimeType = {
  teamId?: string;
  name: string;
  avatar: string;
  showStatus?: boolean;
  isTool?: boolean;
  modules: StoreNodeItemType[];
};
