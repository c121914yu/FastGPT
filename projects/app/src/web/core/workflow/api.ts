import { GET, POST, PUT, DELETE } from '@/web/common/api/request';
import { ChatHistoryItemResType } from '@fastgpt/global/core/chat/type';
import { PostWorkflowDebugProps } from '@/global/core/workflow/api';

export const postWorkflowDebug = (data: PostWorkflowDebugProps) =>
  POST<ChatHistoryItemResType>('/core/workflow/debug', {
    ...data,
    mode: 'debug'
  });
