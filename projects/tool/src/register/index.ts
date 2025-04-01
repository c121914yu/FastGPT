import fs from 'fs';
import path from 'path';
import { addLog } from '@/utils/log';
import { ToolTemplateItemType, ToolTemplateJsonType } from '@fastgpt/global/core/app/tool/type';
import { isProduction } from '@fastgpt/global/common/system/constants';
import { RequestType } from '@/type';

// Scan current directory and get all template.ts files
export const getTools = () => {
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
          const callback = require(callbackPath).default as (params: any) => Promise<any>;

          global.memoryToolCallbacks[id] = callback;
        }
      });

      return templates;
    } catch (error) {
      addLog.error('getToolTemplates', error);
      return [];
    }
  };

  try {
    global.memoryTools = getToolTemplates();
    return global.memoryTools;
  } catch (error) {
    global.memoryTools = [];
    return [];
  }
};

export const handleToolCall = async (
  req: RequestType<{ name: string; params: any }>
): Promise<any> => {
  const { name, params } = req.body;

  const callback = global.memoryToolCallbacks[name];

  if (!callback) {
    return Promise.reject(`Can not find tool callback for ${name}`);
  }

  try {
    addLog.debug(`Tool call: ${name}`, params);
    const result = await callback(params);
    addLog.debug(`Tool call result: ${name}`, result);

    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};
