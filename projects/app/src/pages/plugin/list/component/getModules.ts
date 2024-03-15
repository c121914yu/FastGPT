const getModules = (props: any) => {
  return [
    {
      moduleId: props.inputId,
      name: '定义插件输入',
      intro: '自定义配置外部输入，使用插件时，仅暴露自定义配置的输入',
      avatar: '/imgs/module/input.png',
      flowType: 'pluginInput',
      showStatus: false,
      position: {
        x: 616.4226348688949,
        y: -165.05298493910115
      },
      inputs: props.inputInputs,
      outputs: props.inputOutputs
    },
    {
      moduleId: props.outputId,
      name: '定义插件输出',
      intro: '自定义配置外部输出，使用插件时，仅暴露自定义配置的输出',
      avatar: '/imgs/module/output.png',
      flowType: 'pluginOutput',
      showStatus: false,
      position: {
        x: 1607.7142331269126,
        y: -151.8669210746189
      },
      inputs: [
        {
          key: 'result',
          valueType: 'string',
          label: 'result',
          type: 'target',
          required: true,
          description: '',
          edit: true,
          editField: {
            key: true,
            name: true,
            description: true,
            required: false,
            dataType: true,
            inputType: false
          },
          connected: true
        }
      ],
      outputs: [
        {
          key: 'result',
          valueType: 'string',
          label: 'result',
          type: 'source',
          edit: true,
          targets: []
        }
      ]
    },
    {
      moduleId: props.httpId,
      name: 'HTTP 请求',
      intro: '可以发出一个 HTTP 请求，实现更为复杂的操作（联网搜索、数据库查询等）',
      avatar: '/imgs/module/http.png',
      flowType: 'httpRequest468',
      showStatus: true,
      position: {
        x: 1042.549746602742,
        y: -447.77496332641647
      },
      inputs: [
        {
          key: 'switch',
          type: 'target',
          label: 'core.module.input.label.switch',
          description: 'core.module.input.description.Trigger',
          valueType: 'any',
          showTargetInApp: true,
          showTargetInPlugin: true,
          connected: false
        },
        {
          key: 'system_httpMethod',
          type: 'custom',
          valueType: 'string',
          label: '',
          value: props.method,
          required: true,
          showTargetInApp: false,
          showTargetInPlugin: false,
          connected: false
        },
        {
          key: 'system_httpReqUrl',
          type: 'hidden',
          valueType: 'string',
          label: '',
          description: 'core.module.input.description.Http Request Url',
          placeholder: 'https://api.ai.com/getInventory',
          required: false,
          showTargetInApp: false,
          showTargetInPlugin: false,
          value: props.path,
          connected: false
        },
        {
          key: 'system_httpHeader',
          type: 'custom',
          valueType: 'any',
          value: props.headers,
          label: '',
          description: 'core.module.input.description.Http Request Header',
          placeholder: 'core.module.input.description.Http Request Header',
          required: false,
          showTargetInApp: false,
          showTargetInPlugin: false,
          connected: false
        },
        {
          key: 'system_httpParams',
          type: 'hidden',
          valueType: 'any',
          value: props.params,
          label: '',
          required: false,
          showTargetInApp: false,
          showTargetInPlugin: false,
          connected: false
        },
        {
          key: 'system_httpJsonBody',
          type: 'hidden',
          valueType: 'any',
          value: props.body,
          label: '',
          required: false,
          showTargetInApp: false,
          showTargetInPlugin: false,
          connected: false
        },
        {
          key: 'DYNAMIC_INPUT_KEY',
          type: 'target',
          valueType: 'any',
          label: 'core.module.inputType.dynamicTargetInput',
          description: 'core.module.input.description.dynamic input',
          required: false,
          showTargetInApp: false,
          showTargetInPlugin: true,
          hideInApp: true,
          connected: false
        },
        {
          key: 'system_addInputParam',
          type: 'addInputParam',
          valueType: 'any',
          label: '',
          required: false,
          showTargetInApp: false,
          showTargetInPlugin: false,
          editField: {
            key: true,
            description: true,
            dataType: true
          },
          defaultEditField: {
            label: '',
            key: '',
            description: '',
            inputType: 'target',
            valueType: 'string'
          },
          connected: false
        },
        ...(props.httpInputs || [])
      ],
      outputs: [
        {
          key: 'finish',
          label: 'core.module.output.label.running done',
          description: 'core.module.output.description.running done',
          valueType: 'boolean',
          type: 'source',
          targets: []
        },
        {
          key: 'httpRawResponse',
          label: '原始响应',
          description: 'HTTP请求的原始响应。只能接受字符串或JSON类型响应数据。',
          valueType: 'any',
          type: 'source',
          targets: [
            {
              moduleId: props.outputId,
              key: 'result'
            }
          ]
        },
        {
          key: 'system_addOutputParam',
          type: 'addOutputParam',
          valueType: 'any',
          label: '',
          targets: [],
          editField: {
            key: true,
            description: true,
            dataType: true,
            defaultValue: true
          },
          defaultEditField: {
            label: '',
            key: '',
            description: '',
            outputType: 'source',
            valueType: 'string'
          }
        }
      ]
    }
  ];
};

export default getModules;
