import { AppTypeMap } from '@fastgpt/global/core/app/constants';
import { connectionMongo, type Model } from '../../common/mongo';
const { Schema, model, models } = connectionMongo;
import type { AppSchema as AppType } from '@fastgpt/global/core/app/type.d';
import { PermissionTypeEnum, PermissionTypeMap } from '@fastgpt/global/support/permission/constant';
import {
  TeamCollectionName,
  TeamMemberCollectionName
} from '@fastgpt/global/support/user/team/constant';
import { AppDefaultPermission } from '@fastgpt/global/support/permission/app/constant';

export const AppCollectionName = 'apps';

export const chatConfigType = {
  welcomeText: String,
  variables: Array,
  questionGuide: Boolean,
  ttsConfig: Object,
  whisperConfig: Object,
  scheduledTriggerConfig: Object,
  chatInputGuide: Object
};

const AppSchema = new Schema({
  parentId: {
    type: Schema.Types.ObjectId,
    ref: AppCollectionName,
    default: null
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: TeamCollectionName,
    required: true
  },
  tmbId: {
    type: Schema.Types.ObjectId,
    ref: TeamMemberCollectionName,
    required: true
  },
  type: {
    type: String,
    default: 'advanced',
    enum: Object.keys(AppTypeMap)
  },
  version: {
    type: String,
    enum: ['v1', 'v2']
  },

  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: '/icon/logo.svg'
  },
  intro: {
    type: String,
    default: ''
  },
  updateTime: {
    type: Date,
    default: () => new Date()
  },

  // tmp store
  modules: {
    type: Array,
    default: []
  },
  edges: {
    type: Array,
    default: []
  },
  chatConfig: {
    type: chatConfigType,
    default: {}
  },

  scheduledTriggerConfig: {
    cronString: String,
    timezone: String,
    defaultPrompt: String
  },
  scheduledTriggerNextTime: {
    type: Date
  },

  inited: {
    type: Boolean
  },

  // the default permission of a app
  defaultPermission: {
    type: Number,
    default: AppDefaultPermission
  },
  teamTags: {
    type: [String]
  },

  // plugin
  pluginMetadata: {
    pluginUid: String,
    apiSchemaStr: String,
    customHeaders: String,
    version: String
  }
});

try {
  AppSchema.index({ updateTime: -1 });
  AppSchema.index({ teamId: 1 });
  AppSchema.index({ scheduledTriggerConfig: 1, intervalNextTime: -1 });
} catch (error) {
  console.log(error);
}

export const MongoApp: Model<AppType> =
  models[AppCollectionName] || model(AppCollectionName, AppSchema);

MongoApp.syncIndexes();
