import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowNodeTemplateType } from '../../type';
import {
  ModuleIOValueTypeEnum,
  ModuleInputKeyEnum,
  ModuleOutputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../../constants';
import {
  Input_Template_DynamicInput,
  Input_Template_Switch,
  Input_Template_AddInputParam
} from '../input';
import { Output_Template_AddOutput } from '../output';
import { getHandleConfig } from '../utils';

export const lafModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.lafModule,
  templateType: FlowNodeTemplateTypeEnum.externalCall,
  flowNodeType: FlowNodeTypeEnum.lafModule,
  sourceHandle: getHandleConfig(false, true, false, false),
  targetHandle: getHandleConfig(false, false, false, true),
  avatar: '/imgs/workflow/laf.png',
  name: 'Laf 函数调用（测试）',
  intro: '可以调用Laf账号下的云函数。',
  showStatus: true,
  isTool: true,
  inputs: [
    Input_Template_Switch,
    {
      key: ModuleInputKeyEnum.httpReqUrl,
      type: FlowNodeInputTypeEnum.hidden,
      valueType: ModuleIOValueTypeEnum.string,
      label: '',
      description: 'core.module.input.description.Http Request Url',
      placeholder: 'https://api.ai.com/getInventory',
      required: false
    },
    Input_Template_DynamicInput,
    Input_Template_AddInputParam
  ],
  outputs: [
    {
      key: ModuleOutputKeyEnum.httpRawResponse,
      label: '原始响应',
      description: 'HTTP请求的原始响应。只能接受字符串或JSON类型响应数据。',
      valueType: ModuleIOValueTypeEnum.any,
      type: FlowNodeOutputTypeEnum.source
    },
    {
      ...Output_Template_AddOutput
    }
  ]
};
