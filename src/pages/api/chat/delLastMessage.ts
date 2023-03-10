import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, ChatWindow } from '@/service/mongo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { windowId } = req.query as { windowId: string };

    if (!windowId) {
      throw new Error('缺少参数');
    }

    await connectToDatabase();

    // 删除最一条数据库记录, 也就是预发送的那一条
    await ChatWindow.findByIdAndUpdate(windowId, {
      $pop: { content: 1 },
      updateTime: Date.now()
    });

    jsonRes(res);
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
