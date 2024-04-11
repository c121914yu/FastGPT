import { FlowNodeTemplateTypeEnum } from '../../constants';
import { FlowNodeTypeEnum } from '../../node/constant';
import { FlowNodeTemplateType } from '../../type.d';
import { getHandleConfig } from '../utils';

export const RunPluginModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.pluginModule,
  templateType: FlowNodeTemplateTypeEnum.externalCall,
  flowNodeType: FlowNodeTypeEnum.pluginModule,
  sourceHandle: getHandleConfig(false, true, false, false),
  targetHandle: getHandleConfig(false, false, false, true),
  intro: '',
  name: '',
  showStatus: false,
  isTool: true,
  inputs: [], // [{key:'pluginId'},...]
  outputs: []
};
