import fs from 'fs';
import path from 'path';
import { addLog } from '@/utils/log';
import { ToolTemplateItemType, ToolTemplateJsonType } from '@fastgpt/global/core/app/tool/type';
import { CallToolRequest, CallToolResult, Tool } from '@modelcontextprotocol/sdk/types';
import { WorkflowTemplateBasicType } from '@fastgpt/global/core/workflow/type';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import { isProduction } from '@fastgpt/global/common/system/constants';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { runWorker } from './worker';

// Scan current directory and get all template.ts files
export const getMcpTools = () => {
  if (isProduction && global.memoryTools && global.memoryTools.length > 0) {
    return global.memoryTools;
  }

  global.memoryTools = [];
  global.memoryToolCallbacks = {};
  const getToolTemplates = () => {
    try {
      const templates: ToolTemplateItemType[] = [];
      const templateDir = path.join(__dirname, '..', 'templates');

      // Read all subdirectories
      const dirs = fs
        .readdirSync(templateDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      // Load templates from each directory
      dirs.forEach((id) => {
        const templatePath = path.join(templateDir, id, 'template.ts');
        if (fs.existsSync(templatePath)) {
          // Import template dynamically
          const template = require(templatePath).default as ToolTemplateJsonType;
          templates.push({
            ...template,
            id: id
          });
        }
        const callbackPath = path.join(templateDir, id, 'index.ts');
        if (fs.existsSync(callbackPath)) {
          const callback = require(callbackPath).default as (
            e: CallToolRequest['params']['arguments']
          ) => Promise<any>;

          global.memoryToolCallbacks[id] = callback;
        }
      });

      return templates;
    } catch (error) {
      addLog.error('getToolTemplates', error);
      return [];
    }
  };
  const pluginInput2InputSchema = (workflow?: WorkflowTemplateBasicType): Tool['inputSchema'] => {
    const workflowIOValueTypeToJsonSchema = (
      valueType?: `${WorkflowIOValueTypeEnum}`
    ): Tool['inputSchema']['properties'] => {
      switch (valueType) {
        // Basic
        case WorkflowIOValueTypeEnum.string:
          return { type: 'string' };
        case WorkflowIOValueTypeEnum.number:
          return { type: 'number' };
        case WorkflowIOValueTypeEnum.boolean:
          return { type: 'boolean' };
        case WorkflowIOValueTypeEnum.object:
          return { type: 'object' };

        // Array
        case WorkflowIOValueTypeEnum.arrayString:
          return {
            type: 'array',
            items: { type: 'string' }
          };
        case WorkflowIOValueTypeEnum.arrayNumber:
          return {
            type: 'array',
            items: { type: 'number' }
          };
        case WorkflowIOValueTypeEnum.arrayBoolean:
          return {
            type: 'array',
            items: { type: 'boolean' }
          };
        case WorkflowIOValueTypeEnum.arrayObject:
          return {
            type: 'array',
            items: { type: 'object' }
          };
        case WorkflowIOValueTypeEnum.arrayAny:
          return {
            type: 'array',
            items: {} // any type in JSON Schema
          };

        // 特殊类型
        case WorkflowIOValueTypeEnum.any:
          return {}; // JSON Schema 中的任意类型不指定 type

        // 业务特定类型 - 自定义处理
        case WorkflowIOValueTypeEnum.chatHistory:
        case WorkflowIOValueTypeEnum.datasetQuote:
        case WorkflowIOValueTypeEnum.dynamic:
        case WorkflowIOValueTypeEnum.selectDataset:
        case WorkflowIOValueTypeEnum.selectApp:
          return {
            type: 'array',
            items: {
              type: 'object'
            }
          };

        default:
          // 如果遇到未知类型，返回任意类型
          return {};
      }
    };

    if (!workflow) {
      return {
        type: 'object'
      };
    }

    const pluginInput = workflow.nodes.find(
      (node) => node.flowNodeType === FlowNodeTypeEnum.pluginInput
    );
    if (!pluginInput) {
      return {
        type: 'object'
      };
    }

    const inputs = pluginInput.inputs;
    const inputSchema: Tool['inputSchema'] = {
      type: 'object',
      properties: {}
    };
    inputs.forEach((input) => {
      inputSchema.properties![input.key] = workflowIOValueTypeToJsonSchema(input.valueType);
    });

    return inputSchema;
  };

  try {
    const templates = getToolTemplates();

    const tools: Tool[] = templates.map((item) => ({
      name: item.id,
      description: item.versions[0].description,
      inputSchema: pluginInput2InputSchema(item.versions[0]?.workflow),
      metadata: item
    }));

    global.memoryTools = tools;
    return tools;
  } catch (error) {
    global.memoryTools = [];
    return [];
  }
};

export const handleToolCall = async (e: CallToolRequest['params']): Promise<CallToolResult> => {
  const name = e.name;
  // Get the tool callback function from dir/name/index.ts

  const callback = global.memoryToolCallbacks[name];

  if (!callback) {
    return {
      content: [],
      message: `Can not find tool callback for ${name}`,
      isError: true
    };
  }

  try {
    addLog.debug(`Tool call: ${name}`, e.arguments);
    console.log(await runWorker(name), 2222);
    const result = await callback(e.arguments);
    addLog.debug(`Tool call result: ${name}`, result);

    return {
      content: [],
      toolResult: result,
      isError: false
    };
  } catch (error) {
    return {
      content: [],
      message: getErrText(error),
      isError: true
    };
  }
};
