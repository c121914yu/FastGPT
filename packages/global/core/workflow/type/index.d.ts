import { FlowNodeTypeEnum } from '../node/constant';
import {
  ModuleIOValueTypeEnum,
  ModuleOutputKeyEnum,
  FlowNodeTemplateTypeEnum,
  VariableInputEnum
} from '../constants';
import { DispatchNodeResponseKeyEnum } from '../runtime/constants';
import { FlowNodeInputItemType, FlowNodeOutputItemType } from './io.d';
import { UserModelSchema } from '../../../support/user/type';
import {
  ChatItemType,
  ChatItemValueItemType,
  ToolRunResponseItemType,
  UserChatItemValueItemType
} from '../../chat/type';
import { ChatNodeUsageType } from '../../../support/wallet/bill/type';
import { RunningModuleItemType } from '../runtime/type';
import { PluginTypeEnum } from '../../plugin/constants';

export type FlowNodeCommonType = {
  flowNodeType: `${FlowNodeTypeEnum}`; // render node card

  name: string;
  intro: string; // template list intro
  showStatus?: boolean; // chatting response step status

  // data
  inputs: FlowNodeInputItemType[];
  outputs: FlowNodeOutputItemType[];
};

export type FlowNodeTemplateType = FlowNodeCommonType & {
  id: string; // module id, unique
  templateType: `${FlowNodeTemplateTypeEnum}`;

  // show handle
  sourceHandle: {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
  };
  targetHandle: {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
  };

  // info
  avatar?: string;
  isTool?: boolean; // can be connected by tool

  // action
  forbidDelete?: boolean; // forbid delete
  unique?: boolean;

  // plugin data
  pluginType?: `${PluginTypeEnum}`;
  parentId?: string;
};
export type FlowNodeItemType = FlowNodeTemplateType & {
  nodeId: string;
};
export type nodeTemplateListType = {
  type: `${FlowNodeTemplateTypeEnum}`;
  label: string;
  list: FlowNodeTemplateType[];
}[];

// store node type
export type StoreNodeItemType = FlowNodeCommonType & {
  nodeId: string;
  position?: {
    x: number;
    y: number;
  };

  targetNodes: NodeTargetNodeItemType[]; // 输出到的节点数据
  sourceNodes: NodeSourceNodeItemType[]; // 来源的节点数据
  inputs: FlowNodeInputItemType[];
  outputs: FlowNodeOutputItemType[];

  // runTime field
  // isEntry?: boolean;
};

/* connection type */
export type NodeTargetNodeItemType = {
  nodeId: string;
  sourceHandle: string;
  targetHandle: string;
};
export type NodeSourceNodeItemType = {
  nodeId: string;
};

/* --------------- function type -------------------- */
export type SelectAppItemType = {
  id: string;
  name: string;
  logo: string;
};

/* agent */
export type ClassifyQuestionAgentItemType = {
  value: string;
  key: string;
};
export type ContextExtractAgentItemType = {
  desc: string;
  key: string;
  required: boolean;
  defaultValue?: string;
  enum?: string;
};

/* -------------- running module -------------- */
export type ChatDispatchProps = {
  res: NextApiResponse;
  mode: 'test' | 'chat';
  teamId: string;
  tmbId: string;
  user: UserModelSchema;
  appId: string;
  chatId?: string;
  responseChatItemId?: string;
  histories: ChatItemType[];
  variables: Record<string, any>;
  inputFiles?: UserChatItemValueItemType['file'][];
  stream: boolean;
  detail: boolean; // response detail
  maxRunTimes: number;
};

export type ModuleDispatchProps<T> = ChatDispatchProps & {
  module: RunningModuleItemType;
  runtimeModules: RunningModuleItemType[];
  params: T;
};