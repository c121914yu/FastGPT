import { OutLinkTypeEnum } from '../outLink/constant';

export type OutLinkConfigSchema = {
    _id: string;
    shareId: string;
    type: `${OutLinkTypeEnum}`
    ReplyLimit: Boolean;
    defaultResponse: string;
    immediateResponse: boolean;
    WXWORK_TOKEN: string;
    WXWORK_AESKEY: string;
    WXWORK_SECRET: string;
    WXWORD_ID: string;
};

export type OutLinkConfigEditType = {
    _id?: string;
    ReplyLimit: Boolean;
    defaultResponse: string;
    immediateResponse: boolean;
    WXWORK_TOKEN: string;
    WXWORK_AESKEY: string;
    WXWORK_SECRET: string;
    WXWORD_ID: string;
}