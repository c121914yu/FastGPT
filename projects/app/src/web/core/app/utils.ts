import { AppSimpleEditFormType } from '@fastgpt/global/core/app/type';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import {
  FlowNodeInputTypeEnum,
  FlowNodeTypeEnum
} from '@fastgpt/global/core/workflow/node/constant';
import { NodeInputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import {
  DatasetSearchModule,
  Dataset_SEARCH_DESC
} from '@fastgpt/global/core/workflow/template/system/datasetSearch';
import { getNanoid } from '@fastgpt/global/common/string/tools';
import { ToolModule } from '@fastgpt/global/core/workflow/template/system/tools';

export async function postForm2Modules(data: AppSimpleEditFormType) {
  function userGuideTemplate(formData: AppSimpleEditFormType): StoreNodeItemType[] {
    return [
      {
        nodeId: 'userGuide',
        name: '系统配置',
        intro: '可以配置应用的系统参数',
        flowNodeType: FlowNodeTypeEnum.systemConfig,
        position: {
          x: 447.98520778293346,
          y: 721.4016845336229
        },
        inputs: [
          {
            key: NodeInputKeyEnum.welcomeText,
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: 'core.app.Welcome Text',
            value: formData.userGuide.welcomeText
          },
          {
            key: NodeInputKeyEnum.variables,
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: 'core.app.Chat Variable',
            value: formData.userGuide.variables
          },
          {
            key: NodeInputKeyEnum.questionGuide,
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: 'core.app.Question Guide',
            value: formData.userGuide.questionGuide
          },
          {
            key: NodeInputKeyEnum.tts,
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '',
            value: formData.userGuide.tts
          },
          {
            key: NodeInputKeyEnum.whisper,
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '',
            value: formData.userGuide.whisper
          }
        ],
        outputs: []
      }
    ];
  }
  function simpleChatTemplate(formData: AppSimpleEditFormType): StoreNodeItemType[] {
    return [
      {
        nodeId: 'userChatInput',
        intro: '当用户发送一个内容后，流程将会从这个模块开始执行。',
        name: 'core.module.template.Chat entrance',
        avatar: '/imgs/workflow/userChatInput.png',
        flowNodeType: 'workflowStart',
        position: {
          x: 464.32198615344566,
          y: 1602.2698463081606
        },
        inputs: [
          {
            key: 'userChatInput',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            valueType: 'string',
            label: 'core.module.input.label.user question'
          }
        ],
        outputs: [
          {
            id: 'userChatInput',
            key: 'userChatInput',
            label: 'core.module.input.label.user question',
            type: 'source',
            valueType: 'string'
          }
        ]
      },
      {
        nodeId: 'chatModule',
        name: 'AI 对话',
        intro: 'AI 大模型对话',
        avatar: '/imgs/workflow/AI.png',
        flowNodeType: 'chatNode',
        showStatus: true,
        position: {
          x: 981.9682828103937,
          y: 890.014595014464
        },
        inputs: [
          {
            key: 'model',
            renderTypeList: [
              FlowNodeInputTypeEnum.settingLLMModel,
              FlowNodeInputTypeEnum.reference
            ],
            label: 'core.module.input.label.aiModel',
            required: true,
            valueType: 'string',
            value: formData.aiSettings.model
          },
          {
            key: 'temperature',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '温度',
            value: formData.aiSettings.temperature,
            valueType: 'number',
            min: 0,
            max: 10,
            step: 1,
            markList: [
              {
                label: '严谨',
                value: 0
              },
              {
                label: '发散',
                value: 10
              }
            ]
          },
          {
            key: 'maxToken',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '回复上限',
            value: formData.aiSettings.maxToken,
            valueType: 'number',
            min: 100,
            max: 4000,
            step: 50,
            markList: [
              {
                label: '100',
                value: 100
              },
              {
                label: '4000',
                value: 4000
              }
            ]
          },
          {
            key: 'isResponseAnswerText',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '返回AI内容',
            value: true,
            valueType: 'boolean'
          },
          {
            key: 'quoteTemplate',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '引用内容模板',
            valueType: 'string',
            value: ''
          },
          {
            key: 'quotePrompt',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '引用内容提示词',
            valueType: 'string',
            value: ''
          },
          {
            key: 'systemPrompt',
            renderTypeList: [FlowNodeInputTypeEnum.textarea, FlowNodeInputTypeEnum.reference],
            label: 'core.ai.Prompt',
            max: 300,
            valueType: 'string',
            description: 'core.app.tip.chatNodeSystemPromptTip',
            placeholder: 'core.app.tip.chatNodeSystemPromptTip',
            value: formData.aiSettings.systemPrompt
          },
          {
            key: 'history',
            renderTypeList: [FlowNodeInputTypeEnum.numberInput, FlowNodeInputTypeEnum.reference],
            label: 'core.module.input.label.chat history',
            required: true,
            min: 0,
            max: 30,
            valueType: 'chatHistory',
            value: formData.aiSettings.maxHistories
          },
          {
            key: 'userChatInput',
            renderTypeList: [FlowNodeInputTypeEnum.reference, FlowNodeInputTypeEnum.textarea],
            label: 'core.module.input.label.user question',
            required: true,
            valueType: 'string'
          }
        ],
        outputs: [
          {
            id: 'history',
            key: 'history',
            label: '新的上下文',
            description: '将本次回复内容拼接上历史记录，作为新的上下文返回',
            valueType: 'chatHistory',
            type: 'source'
          },
          {
            id: 'answerText',
            key: 'answerText',
            label: 'AI回复',
            description: '将在 stream 回复完毕后触发',
            valueType: 'string',
            type: 'source'
          }
        ]
      }
    ];
  }
  function datasetTemplate(formData: AppSimpleEditFormType): StoreNodeItemType[] {
    return [
      {
        nodeId: 'userChatInput',
        name: 'core.module.template.Chat entrance',
        intro: '当用户发送一个内容后，流程将会从这个模块开始执行。',
        flowNodeType: 'workflowStart',
        position: {
          x: 324.81436595478294,
          y: 1527.0012457753612
        },
        inputs: [
          {
            key: 'userChatInput',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            valueType: 'string',
            label: 'core.module.input.label.user question'
          }
        ],
        outputs: [
          {
            id: 'userChatInput',
            key: 'userChatInput',
            label: 'core.module.input.label.user question',
            type: 'source',
            valueType: 'string'
          }
        ]
      },
      {
        nodeId: 'chatModule',
        name: 'AI 对话',
        intro: 'AI 大模型对话',
        avatar: '/imgs/workflow/AI.png',
        flowNodeType: 'chatNode',
        showStatus: true,
        position: {
          x: 1962.4010270586014,
          y: 1026.9105717680477
        },
        inputs: [
          {
            key: 'model',
            renderTypeList: [
              FlowNodeInputTypeEnum.settingLLMModel,
              FlowNodeInputTypeEnum.reference
            ],
            label: 'core.module.input.label.aiModel',
            required: true,
            valueType: 'string',
            value: formData.aiSettings.model
          },
          {
            key: 'temperature',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '温度',
            value: formData.aiSettings.temperature,
            valueType: 'number',
            min: 0,
            max: 10,
            step: 1,
            markList: [
              {
                label: '严谨',
                value: 0
              },
              {
                label: '发散',
                value: 10
              }
            ]
          },
          {
            key: 'maxToken',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '回复上限',
            value: formData.aiSettings.maxToken,
            valueType: 'number',
            min: 100,
            max: 4000,
            step: 50,
            markList: [
              {
                label: '100',
                value: 100
              },
              {
                label: '4000',
                value: 4000
              }
            ]
          },
          {
            key: 'isResponseAnswerText',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '返回AI内容',
            value: true,
            valueType: 'boolean'
          },
          {
            key: 'quoteTemplate',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '引用内容模板',
            valueType: 'string',
            value: ''
          },
          {
            key: 'quotePrompt',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '引用内容提示词',
            valueType: 'string',
            value: ''
          },
          {
            key: 'systemPrompt',
            renderTypeList: [FlowNodeInputTypeEnum.textarea, FlowNodeInputTypeEnum.reference],
            label: 'core.ai.Prompt',
            max: 300,
            valueType: 'string',
            description: 'core.app.tip.chatNodeSystemPromptTip',
            placeholder: 'core.app.tip.chatNodeSystemPromptTip',
            value: formData.aiSettings.systemPrompt
          },
          {
            key: 'history',
            renderTypeList: [FlowNodeInputTypeEnum.numberInput, FlowNodeInputTypeEnum.reference],
            label: 'core.module.input.label.chat history',
            required: true,
            min: 0,
            max: 30,
            valueType: 'chatHistory',
            value: formData.aiSettings.maxHistories
          },
          {
            key: 'userChatInput',
            renderTypeList: [FlowNodeInputTypeEnum.reference, FlowNodeInputTypeEnum.textarea],
            label: 'core.module.input.label.user question',
            required: true,
            valueType: 'string'
          }
        ],
        outputs: [
          {
            id: 'history',
            key: 'history',
            label: '新的上下文',
            description: '将本次回复内容拼接上历史记录，作为新的上下文返回',
            valueType: 'chatHistory',
            type: 'source'
          },
          {
            id: 'answerText',
            key: 'answerText',
            label: 'AI回复',
            description: '将在 stream 回复完毕后触发',
            valueType: 'string',
            type: 'source'
          }
        ]
      },
      {
        nodeId: 'datasetSearch',
        name: '知识库搜索',
        intro: Dataset_SEARCH_DESC,
        avatar: '/imgs/workflow/db.png',
        flowNodeType: 'datasetSearchNode',
        showStatus: true,
        position: {
          x: 1098.245668870126,
          y: 1166.7285333032098
        },
        inputs: [
          {
            key: 'datasets',
            renderTypeList: [FlowNodeInputTypeEnum.selectDataset, FlowNodeInputTypeEnum.reference],
            label: 'core.module.input.label.Select dataset',
            value: formData.dataset.datasets,
            valueType: 'selectDataset',
            list: [],
            required: true
          },
          {
            key: 'similarity',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '',
            value: formData.dataset.similarity,
            valueType: 'number'
          },
          {
            key: 'limit',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '',
            value: formData.dataset.limit,
            valueType: 'number'
          },
          {
            key: 'searchMode',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '',
            valueType: 'string',
            value: formData.dataset.searchMode
          },
          {
            key: 'usingReRank',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '',
            valueType: 'boolean',
            value: formData.dataset.usingReRank
          },
          {
            key: 'datasetSearchUsingExtensionQuery',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '',
            valueType: 'boolean',
            value: formData.dataset.datasetSearchUsingExtensionQuery
          },
          {
            key: 'datasetSearchExtensionModel',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '',
            valueType: 'string',
            value: formData.dataset.datasetSearchExtensionModel
          },
          {
            key: 'datasetSearchExtensionBg',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '',
            valueType: 'string',
            value: formData.dataset.datasetSearchExtensionBg
          },
          {
            key: 'userChatInput',
            renderTypeList: [FlowNodeInputTypeEnum.custom],
            label: '',
            required: true,
            valueType: 'string',
            toolDescription: '需要检索的内容'
          }
        ],
        outputs: [
          {
            id: 'isEmpty',
            key: 'isEmpty',
            label: 'core.module.output.label.Search result empty',
            type: 'static',
            valueType: 'boolean'
          },
          {
            id: 'unEmpty',
            key: 'unEmpty',
            label: 'core.module.output.label.Search result not empty',
            type: 'static',
            valueType: 'boolean'
          },
          {
            id: 'quoteQA',
            key: 'quoteQA',
            label: 'core.module.Dataset quote.label',
            type: 'static',
            valueType: 'datasetQuote'
          }
        ]
      }
    ];
  }
  function toolTemplates(formData: AppSimpleEditFormType): {
    modules: StoreNodeItemType[];
    tools: StoreNodeItemType[];
  } {
    let tools: StoreNodeItemType[] =
      formData.dataset.datasets.length > 0
        ? [
            {
              nodeId: 'datasetSearch',
              name: DatasetSearchModule.name,
              intro: DatasetSearchModule.intro,
              avatar: DatasetSearchModule.avatar,
              flowNodeType: DatasetSearchModule.flowNodeType,
              showStatus: DatasetSearchModule.showStatus,
              position: {
                x: 1000,
                y: 2143
              },
              inputs: [
                {
                  key: 'datasets',
                  renderTypeList: [
                    FlowNodeInputTypeEnum.selectDataset,
                    FlowNodeInputTypeEnum.reference
                  ],
                  label: 'core.module.input.label.Select dataset',
                  value: formData.dataset.datasets,
                  valueType: 'selectDataset',
                  list: [],
                  required: true
                },
                {
                  key: 'similarity',
                  renderTypeList: [FlowNodeInputTypeEnum.hidden],
                  label: '',
                  value: formData.dataset.similarity,
                  valueType: 'number'
                },
                {
                  key: 'limit',
                  renderTypeList: [FlowNodeInputTypeEnum.hidden],
                  label: '',
                  value: formData.dataset.limit,
                  valueType: 'number'
                },
                {
                  key: 'searchMode',
                  renderTypeList: [FlowNodeInputTypeEnum.hidden],
                  label: '',
                  valueType: 'string',
                  value: formData.dataset.searchMode
                },
                {
                  key: 'usingReRank',
                  renderTypeList: [FlowNodeInputTypeEnum.hidden],
                  label: '',
                  valueType: 'boolean',
                  value: formData.dataset.usingReRank
                },
                {
                  key: 'datasetSearchUsingExtensionQuery',
                  renderTypeList: [FlowNodeInputTypeEnum.hidden],
                  label: '',
                  valueType: 'boolean',
                  value: formData.dataset.datasetSearchUsingExtensionQuery
                },
                {
                  key: 'datasetSearchExtensionModel',
                  renderTypeList: [FlowNodeInputTypeEnum.hidden],
                  label: '',
                  valueType: 'string',
                  value: formData.dataset.datasetSearchExtensionModel
                },
                {
                  key: 'datasetSearchExtensionBg',
                  renderTypeList: [FlowNodeInputTypeEnum.hidden],
                  label: '',
                  valueType: 'string',
                  value: formData.dataset.datasetSearchExtensionBg
                },
                {
                  key: 'userChatInput',
                  renderTypeList: [FlowNodeInputTypeEnum.custom],
                  label: '',
                  required: true,
                  valueType: 'string',
                  toolDescription: '需要检索的内容'
                }
              ],
              outputs: [
                {
                  id: 'isEmpty',
                  key: 'isEmpty',
                  label: 'core.module.output.label.Search result empty',
                  type: 'static',
                  valueType: 'boolean'
                },
                {
                  id: 'unEmpty',
                  key: 'unEmpty',
                  label: 'core.module.output.label.Search result not empty',
                  type: 'static',
                  valueType: 'boolean'
                },
                {
                  id: 'quoteQA',
                  key: 'quoteQA',
                  label: 'core.module.Dataset quote.label',
                  type: 'static',
                  valueType: 'datasetQuote'
                }
              ]
            }
          ]
        : [];

    tools = tools.concat(
      formData.selectedTools.map((tool, i) => ({
        nodeId: getNanoid(6),
        name: tool.name,
        intro: tool.intro,
        avatar: tool.avatar,
        flowNodeType: tool.flowNodeType,
        showStatus: tool.showStatus,
        position: {
          x: 1000 + (300 * i + 1),
          y: 2143
        },
        inputs: tool.inputs,
        outputs: tool.outputs
      }))
    );

    const modules: StoreNodeItemType[] = [
      {
        nodeId: 'userChatInput',
        intro: '当用户发送一个内容后，流程将会从这个模块开始执行。',
        name: 'core.module.template.Chat entrance',
        avatar: '/imgs/workflow/userChatInput.png',
        flowNodeType: 'workflowStart',
        position: {
          x: 464.32198615344566,
          y: 1602.2698463081606
        },
        inputs: [
          {
            key: 'userChatInput',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            valueType: 'string',
            label: 'core.module.input.label.user question'
          }
        ],
        outputs: [
          {
            id: 'userChatInput',
            key: 'userChatInput',
            label: 'core.module.input.label.user question',
            type: 'source',
            valueType: 'string'
          }
        ]
      },
      {
        nodeId: ToolModule.id,
        name: ToolModule.name,
        intro: ToolModule.intro,
        avatar: ToolModule.avatar,
        flowNodeType: ToolModule.flowNodeType,
        showStatus: true,
        position: {
          x: 981.9682828103937,
          y: 890.014595014464
        },
        inputs: [
          {
            key: 'model',
            renderTypeList: [
              FlowNodeInputTypeEnum.settingLLMModel,
              FlowNodeInputTypeEnum.reference
            ],
            label: 'core.module.input.label.aiModel',
            required: true,
            valueType: 'string',
            value: formData.aiSettings.model
          },
          {
            key: 'temperature',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '温度',
            value: formData.aiSettings.temperature,
            valueType: 'number',
            min: 0,
            max: 10,
            step: 1
          },
          {
            key: 'maxToken',
            renderTypeList: [FlowNodeInputTypeEnum.hidden],
            label: '回复上限',
            value: formData.aiSettings.maxToken,
            valueType: 'number',
            min: 100,
            max: 4000,
            step: 50
          },
          {
            key: 'systemPrompt',
            renderTypeList: [FlowNodeInputTypeEnum.textarea, FlowNodeInputTypeEnum.reference],
            max: 3000,
            valueType: 'string',
            label: 'core.ai.Prompt',
            description: 'core.app.tip.chatNodeSystemPromptTip',
            placeholder: 'core.app.tip.chatNodeSystemPromptTip'
          },
          {
            key: 'history',
            renderTypeList: [FlowNodeInputTypeEnum.numberInput, FlowNodeInputTypeEnum.reference],
            label: 'core.module.input.label.chat history',
            required: true,
            min: 0,
            max: 30,
            valueType: 'chatHistory',
            value: formData.aiSettings.maxHistories
          },
          {
            key: 'userChatInput',
            renderTypeList: [FlowNodeInputTypeEnum.reference, FlowNodeInputTypeEnum.textarea],
            label: 'core.module.input.label.user question',
            required: true,
            valueType: 'string',
            value: ['userChatInput', 'userChatInput']
          }
        ],
        outputs: []
      },
      ...tools
    ];

    return { modules, tools };
  }

  const modules = (() => {
    if (data.selectedTools.length > 0) return toolTemplates(data).modules;
    if (data.dataset.datasets.length > 0) return datasetTemplate(data);
    return simpleChatTemplate(data);
  })();

  const edges = (() => {
    if (data.selectedTools.length > 0)
      return [
        {
          source: 'userChatInput',
          target: ToolModule.id,
          sourcePort: `userChatInput-source-right`,
          targetPort: `${ToolModule.id}-target-left`
        }
        // ...toolTemplates(data).tools.map((tool) => ({
        //   source: ToolModule.id,
        //   target: tool.nodeId,
        //   sourcePort: `${ToolModule.id}-source-bottom`,
        //   targetPort: `${tool.nodeId}-target-top`
        // }))
      ];

    return [
      {
        source: 'userChatInput',
        target: 'chatModule',
        sourcePort: `userChatInput-source-right`,
        targetPort: `chatModule-target-left`
      }
    ];
  })();

  return { modules: [...userGuideTemplate(data), ...modules], edges };
}
