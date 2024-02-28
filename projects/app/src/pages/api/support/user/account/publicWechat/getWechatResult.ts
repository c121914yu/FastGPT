import { verifyWechatCode } from '@/service/support/wechat/wechatCode';
import { jsonRes } from '@fastgpt/service/common/response';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code } = req.query as { code: string };

    if (!code) {
      return jsonRes(res, {
        code: 400,
        data: 'Parameter error'
      });
    }

    const verifyInfo = await verifyWechatCode({ code });
    if (!verifyInfo?.openid) {
      return jsonRes(res, {
        code: 201,
        data: 'Verification code expired'
      });
    }

    return jsonRes(res, {
      code: 200,
      message: 'Successfully',
      data: verifyInfo
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      message: 'service getWechatResult error'
    });
  }
}
