import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types';

declare global {
  var memoryTools: Tool[];
  var memoryToolCallbacks: Record<
    string,
    (e: CallToolRequest['params']['arguments']) => Promise<any>
  >;
}
