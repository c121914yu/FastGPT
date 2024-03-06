import { GET, POST, DELETE } from '@/web/common/api/request';
import type { OutLinkEditType, OutLinkConfigEditType, OutLinkSchema } from '@fastgpt/global/support/outLink/type.d';

/**
 * create a shareChat
 */
export const createShareChat = (
  data: OutLinkEditType & {
    appId: string;
    type: OutLinkSchema['type'];
  }
) => POST<string>(`/support/outLink/create`, data);

export const putShareChat = (data: OutLinkEditType) =>
  POST<string>(`/support/outLink/update`, data);

/**
 * get shareChat
 */
export const getShareChatList = (data: { appId: string, type: OutLinkSchema['type'] }) =>
  GET<OutLinkSchema[]>(`/support/outLink/list`, data);

/**
 * delete a  shareChat
 */
export const delShareChatById = (id: string) => DELETE(`/support/outLink/delete?id=${id}`);
// wecom 
export const putWecomLinkChat = (data: OutLinkConfigEditType) =>
  POST<string>(`/support/outLink/update`, data);
/**
 * create a shareChat
 */
export const createWecomLinkChat = (
  data: OutLinkConfigEditType & {
    appId: string;
    type: OutLinkSchema['type'];
  }
) => POST<string>(`/support/outLink/create`, data);