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

export const UserInputModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.questionInput,
  templateType: FlowNodeTemplateTypeEnum.systemInput,
  flowType: FlowNodeTypeEnum.questionInput,
  avatar: '/imgs/workflow/userChatInput.svg',
  name: '流程开始',
  intro: '',
  inputs: [
    {
      key: ModuleInputKeyEnum.userChatInput,
      type: FlowNodeInputTypeEnum.systemInput,
      valueType: ModuleIOValueTypeEnum.string,
      label: 'core.module.input.label.user question',
      showTargetInApp: false,
      showTargetInPlugin: false
    }
  ],
  outputs: [
    {
      key: ModuleOutputKeyEnum.userChatInput,
      label: 'core.module.input.label.user question',
      type: FlowNodeOutputTypeEnum.source,
      valueType: ModuleIOValueTypeEnum.string,
      targets: []
    }
  ]
};
