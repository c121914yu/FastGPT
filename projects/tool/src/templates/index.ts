import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { addLog } from '@/utils/log';
import { ToolTemplateJsonType } from '@fastgpt/global/core/app/tool/type';
import { CallToolRequestSchema, CallToolResult, Tool } from '@modelcontextprotocol/sdk/types';

// Scan current directory and get all template.ts files
export const getToolTemplates = () => {
  if (global.memoryToolTemplates && global.memoryToolTemplates.length > 0) {
    return global.memoryToolTemplates;
  }

  global.memoryToolTemplates = [];

  try {
    const currentDir = __dirname;

    // Read all subdirectories
    const dirs = fs
      .readdirSync(currentDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Load templates from each directory
    dirs.forEach((dir) => {
      const templatePath = path.join(currentDir, dir, 'template.ts');
      if (fs.existsSync(templatePath)) {
        // Import template dynamically
        const template = require(templatePath).default as ToolTemplateJsonType;
        global.memoryToolTemplates.push({
          ...template,
          id: dir
        });
      }
    });

    return global.memoryToolTemplates;
  } catch (error) {
    addLog.error('getToolTemplates', error);
    global.memoryToolTemplates = [];
    return [];
  }
};

export const getMcpTools = () => {
  const templates = getToolTemplates();

  const tools: Tool[] = templates.map((item) => ({
    name: item.id,
    description: item.versions[0].description,
    inputSchema: {
      type: 'object'
    },
    metadata: item
  }));

  return tools;
};

export const handleToolCall = async (
  e: z.infer<typeof CallToolRequestSchema.shape.params>
): Promise<CallToolResult> => {
  console.log(e);

  return {
    content: [
      {
        type: 'text',
        text: 'Unknown tool: ' + e.name
      }
    ],
    isError: false
  };
};
