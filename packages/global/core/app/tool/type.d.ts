import { WorkflowTemplateBasicType } from '../../workflow/type';

export type JsonSchemaType = {
  [x: string]: unknown;
  type: 'object';
  properties?:
    | {
        [x: string]: unknown;
      }
    | undefined;
};

export type ToolVersionItemType = {
  name: string;
  intro: string;
  createTime: Date | string;
  // 实际用的是下面 4 个属性。
  description: string;
  workflow?: WorkflowTemplateBasicType;
  inputSchema?: JsonSchemaType;
  outputSchema?: JsonSchemaType;
};

export type ToolTemplateJsonType = {
  author: string;
  version: string; // latest version
  tags: string[]; // Classify

  name: string;
  avatar: string;
  intro: string;

  showStatus: boolean;
  isTool: boolean;
  weight: number;

  versions: ToolVersionItemType[];
};
export type ToolTemplateItemType = ToolTemplateJsonType & {
  id: string;
};
