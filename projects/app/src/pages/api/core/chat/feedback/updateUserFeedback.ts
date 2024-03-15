import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { MongoChatItem } from '@fastgpt/service/core/chat/chatItemSchema';
import { UpdateChatFeedbackProps } from '@fastgpt/global/core/chat/api';
import { autChatCrud } from '@/service/support/permission/auth/chat';

/* 初始化我的聊天框，需要身份验证 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
<<<<<<< HEAD
  const {
    appId,
    chatId,
    chatItemId,
    shareId,
    teamId,
    teamToken,
    outLinkUid,
    userBadFeedback,
    userGoodFeedback
  } = req.body as UpdateChatFeedbackProps;
=======
  const { appId, chatId, chatItemId, shareId, outLinkUid, teamId, teamToken, userBadFeedback, userGoodFeedback } =
    req.body as UpdateChatFeedbackProps;
>>>>>>> 7d2732aa (fix feckbackMoal  auth bug)

  try {
    await connectToDatabase();

    await autChatCrud({
      req,
      authToken: true,
      appId,
      teamId,
      teamToken,
      chatId,
      teamId,
      teamToken,
      shareId,
      outLinkUid,
      per: 'r'
    });

    if (!chatItemId) {
      throw new Error('chatItemId is required');
    }

    await MongoChatItem.findOneAndUpdate(
      {
        appId,
        chatId,
        dataId: chatItemId
      },
      {
        $unset: {
          ...(userBadFeedback === undefined && { userBadFeedback: '' }),
          ...(userGoodFeedback === undefined && { userGoodFeedback: '' })
        },
        $set: {
          ...(userBadFeedback !== undefined && { userBadFeedback }),
          ...(userGoodFeedback !== undefined && { userGoodFeedback })
        }
      }
    );

    jsonRes(res);
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
