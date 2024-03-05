import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { MongoOutLink } from '@fastgpt/service/support/outLink/schema';
import { authApp } from '@fastgpt/service/support/permission/auth/app';
import type { OutLinkSchema } from '@fastgpt/global/support/outLink/type.d';

/* get shareChat list by appId */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    const { appId, type } = req.query as {
      appId: string;
      type: OutLinkSchema['type']
    };

    const { teamId, tmbId, isOwner } = await authApp({ req, authToken: true, appId, per: 'w' });

    const data = await MongoOutLink.find({
      appId,
      type,
      ...(isOwner ? { teamId } : { tmbId })
    }).sort({
      _id: -1
    });

    jsonRes(res, { data });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
