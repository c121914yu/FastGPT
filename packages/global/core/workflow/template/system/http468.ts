import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowNodeTemplateType } from '../../type/index.d';
import {
  ModuleIOValueTypeEnum,
  ModuleInputKeyEnum,
  ModuleOutputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../../constants';
import { Input_Template_AddInputParam, Input_Template_DynamicInput } from '../input';
import { Output_Template_AddOutput } from '../output';
import { getHandleConfig } from '../utils';

export const HttpModule468: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.httpRequest468,
  templateType: FlowNodeTemplateTypeEnum.externalCall,
  flowNodeType: FlowNodeTypeEnum.httpRequest468,
  sourceHandle: getHandleConfig(false, true, false, false),
  targetHandle: getHandleConfig(false, false, false, true),
  avatar: '/imgs/workflow/http.png',
  name: 'HTTP 请求',
  intro: '可以发出一个 HTTP 请求，实现更为复杂的操作（联网搜索、数据库查询等）',
  showStatus: true,
  isTool: true,
  inputs: [
    {
      key: ModuleInputKeyEnum.httpMethod,
      renderTypeList: [FlowNodeInputTypeEnum.custom],
      valueType: ModuleIOValueTypeEnum.string,
      label: '',
      value: 'POST',
      required: true
    },
    {
      key: ModuleInputKeyEnum.httpReqUrl,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      valueType: ModuleIOValueTypeEnum.string,
      label: '',
      description: 'core.module.input.description.Http Request Url',
      placeholder: 'https://api.ai.com/getInventory',
      required: false
    },
    {
      key: ModuleInputKeyEnum.httpHeaders,
      renderTypeList: [FlowNodeInputTypeEnum.custom],
      valueType: ModuleIOValueTypeEnum.any,
      value: [],
      label: '',
      description: 'core.module.input.description.Http Request Header',
      placeholder: 'core.module.input.description.Http Request Header',
      required: false
    },
    {
      key: ModuleInputKeyEnum.httpParams,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      valueType: ModuleIOValueTypeEnum.any,
      value: [],
      label: '',
      required: false
    },
    {
      key: ModuleInputKeyEnum.httpJsonBody,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      valueType: ModuleIOValueTypeEnum.any,
      value: '',
      label: '',
      required: false
    },
    Input_Template_DynamicInput,
    {
      ...Input_Template_AddInputParam
    }
  ],
  outputs: [
    {
      id: ModuleOutputKeyEnum.httpRawResponse,
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
