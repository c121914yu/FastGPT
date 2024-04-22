import {
  FlowNodeTemplateTypeEnum,
  NodeInputKeyEnum,
  NodeOutputKeyEnum,
  WorkflowIOValueTypeEnum
} from '../../constants';
import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  FlowNodeTypeEnum
} from '../../node/constant';
import { FlowNodeTemplateType } from '../../type/index.d';
import { getHandleConfig } from '../utils';

export const ifElseModule: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.ifElseModule,
  templateType: FlowNodeTemplateTypeEnum.externalCall,
  flowNodeType: FlowNodeTypeEnum.ifElseModule,
  sourceHandle: getHandleConfig(true, false, true, true),
  targetHandle: getHandleConfig(true, false, true, true),
  avatar: '/imgs/workflow/ifElse.svg',
  name: '条件分支',
  intro: '根据条件判断执行不同的分支。',
  showStatus: true,
  inputs: [
    {
      key: 'condition',
      valueType: WorkflowIOValueTypeEnum.string,
      label: 'condition',
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      required: true,
      value: 'OR'
    },
    {
      key: NodeInputKeyEnum.agents,
      renderTypeList: [FlowNodeInputTypeEnum.hidden],
      valueType: WorkflowIOValueTypeEnum.any,
      label: '',
      value: [
        {
          value: 'IF',
          key: 'IF'
        },
        {
          value: 'ELSE',
          key: 'ELSE'
        }
      ]
    },
    {
      key: 'input1',
      valueType: WorkflowIOValueTypeEnum.any,
      label: 'input1',
      renderTypeList: [FlowNodeInputTypeEnum.reference],
      required: true
    },
    {
      key: 'select1',
      valueType: WorkflowIOValueTypeEnum.string,
      label: 'select1',
      required: true,
      renderTypeList: [FlowNodeInputTypeEnum.select],
      canEdit: true,
      value: 'equalTo',
      list: [
        {
          label: '等于',
          value: 'equalTo'
        },
        {
          label: '不等于',
          value: 'notEqualTo'
        },
        {
          label: '大于',
          value: 'greaterThan'
        },
        {
          label: '小于',
          value: 'lessThan'
        },
        {
          label: '大于等于',
          value: 'greaterThanOrEqualTo'
        },
        {
          label: '小于等于',
          value: 'lessThanOrEqualTo'
        }
      ]
    },
    {
      key: 'value1',
      valueType: WorkflowIOValueTypeEnum.string,
      label: 'value1',
      renderTypeList: [FlowNodeInputTypeEnum.input],
      required: true,
      value: ''
    }
  ],
  outputs: [
    {
      id: NodeOutputKeyEnum.if,
      key: NodeOutputKeyEnum.if,
      label: 'IF',
      valueType: WorkflowIOValueTypeEnum.any,
      type: FlowNodeOutputTypeEnum.source
    },
    {
      id: NodeOutputKeyEnum.else,
      key: NodeOutputKeyEnum.else,
      label: 'ELSE',
      valueType: WorkflowIOValueTypeEnum.any,
      type: FlowNodeOutputTypeEnum.source
    }
  ]
};
