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
import { Input_Template_SelectAIModel, Input_Template_History } from '../input';
import { LLMModelTypeEnum } from '../../../ai/constants';
import { getHandleConfig } from '../utils';

export const ContextExtractModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.contentExtract,
  templateType: FlowNodeTemplateTypeEnum.functionCall,
  flowNodeType: FlowNodeTypeEnum.contentExtract,
  sourceHandle: getHandleConfig(false, true, false, false),
  targetHandle: getHandleConfig(false, false, false, true),
  avatar: '/imgs/workflow/extract.png',
  name: '文本内容提取',
  intro: '可从文本中提取指定的数据，例如：sql语句、搜索关键词、代码等',
  showStatus: true,
  isTool: true,
  inputs: [
    {
      ...Input_Template_SelectAIModel,
      llmModelType: LLMModelTypeEnum.extractFields
    },
    {
      key: ModuleInputKeyEnum.description,
      renderTypeList: [FlowNodeInputTypeEnum.textarea, FlowNodeInputTypeEnum.reference],
      valueType: ModuleIOValueTypeEnum.string,
      label: '提取要求描述',
      description:
        '给AI一些对应的背景知识或要求描述，引导AI更好的完成任务。\n该输入框可使用全局变量。',
      placeholder:
        '例如: \n1. 当前时间为: {{cTime}}。你是一个实验室预约助手，你的任务是帮助用户预约实验室，从文本中获取对应的预约信息。\n2. 你是谷歌搜索助手，需要从文本中提取出合适的搜索词。'
    },
    Input_Template_History,
    {
      key: ModuleInputKeyEnum.contextExtractInput,
      renderTypeList: [FlowNodeInputTypeEnum.reference, FlowNodeInputTypeEnum.textarea],
      label: '需要提取的文本',
      required: true,
      valueType: ModuleIOValueTypeEnum.string,
      toolDescription: '需要检索的内容'
    },
    {
      key: ModuleInputKeyEnum.extractKeys,
      renderTypeList: [FlowNodeInputTypeEnum.custom],
      label: '',
      valueType: ModuleIOValueTypeEnum.any,
      description: "由 '描述' 和 'key' 组成一个目标字段，可提取多个目标字段",
      value: [] // {desc: string; key: string; required: boolean; enum: string[]}[]
    }
  ],
  outputs: [
    {
      id: ModuleOutputKeyEnum.success,
      key: ModuleOutputKeyEnum.success,
      label: '字段完全提取',
      valueType: ModuleIOValueTypeEnum.boolean,
      type: FlowNodeOutputTypeEnum.source
    },
    {
      id: ModuleOutputKeyEnum.failed,
      key: ModuleOutputKeyEnum.failed,
      label: '提取字段缺失',
      description: '存在一个或多个字段未提取成功。尽管使用了默认值也算缺失。',
      valueType: ModuleIOValueTypeEnum.boolean,
      type: FlowNodeOutputTypeEnum.source
    },
    {
      id: ModuleOutputKeyEnum.contextExtractFields,
      key: ModuleOutputKeyEnum.contextExtractFields,
      label: '完整提取结果',
      description: '一个 JSON 字符串，例如：{"name:":"YY","Time":"2023/7/2 18:00"}',
      valueType: ModuleIOValueTypeEnum.string,
      type: FlowNodeOutputTypeEnum.source
    }
  ]
};