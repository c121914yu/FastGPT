import { ToolTemplateItemType } from '@fastgpt/global/core/app/tool/type';
import { Request } from 'express';

declare global {
  var memoryTools: ToolTemplateItemType[];
  var memoryToolCallbacks: Record<string, (params: any) => Promise<any>>;
}

export type RequestType<Body = any, Query = any> = Request & {
  body: Body;
  query: Query;
};
