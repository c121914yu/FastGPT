import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, ChatWindow } from '@/service/mongo';

/* 定时删除那些不活跃的内容 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    const response = await ChatWindow.deleteMany(
      { $expr: { $lt: [{ $size: '$content' }, 5] } },
      // 使用 $pull 操作符删除数组中的元素
      { $pull: { content: { $exists: true } } }
    );

    jsonRes(res, {
      message: `删除了${response.deletedCount}条记录`
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
