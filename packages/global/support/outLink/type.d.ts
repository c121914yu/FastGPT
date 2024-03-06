import { AppSchema } from 'core/app/type';
import { OutLinkTypeEnum } from './constant';

export type OutLinkSchema = {
  _id: string;
  shareId: string;
  teamId: string;
  tmbId: string;
  appId: string;
  name: string;
  usagePoints: number;
  lastTime: Date;
  type: `${OutLinkTypeEnum}`;
  responseDetail: boolean;
  limit?: {
    expiredTime?: Date;
    QPM: number;
    maxUsagePoints: number;
    hookUrl?: string;
  };
  wecomConfig?: {
    ReplyLimit: Boolean;
    defaultResponse: string;
    immediateResponse: boolean;
    WXWORK_TOKEN: string;
    WXWORK_AESKEY: string;
    WXWORK_SECRET: string;
    WXWORD_ID: string;
  }
};
export type OutLinkWithAppType = Omit<OutLinkSchema, 'appId'> & {
  appId: AppSchema;
};

export type OutLinkEditType = {
  _id?: string;
  name: string;
  responseDetail: OutLinkSchema['responseDetail'];
  limit: OutLinkSchema['limit'];
};

export type OutLinkConfigEditType = {
  _id?: string;
  name: string;
  wecomConfig: OutLinkSchema['wecomConfig'];
  limit?: OutLinkSchema['limit'];
}