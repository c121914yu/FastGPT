import { MongoOutLink } from '../../outLink/schema';
import { OutLinkErrEnum } from '@fastgpt/global/common/error/code/outLink';

/* outLink exist and it app exist */
export async function authWecomLinkValid({ shareId }: { shareId?: string }) {
    if (!shareId) {
        return Promise.reject(OutLinkErrEnum.linkUnInvalid);
    }
    const shareChat = await MongoOutLink.findOne({ shareId });

    if (!shareChat) {
        return Promise.reject(OutLinkErrEnum.linkUnInvalid);
    }

    return {
        appId: shareChat.appId,
        shareChat
    };
}
