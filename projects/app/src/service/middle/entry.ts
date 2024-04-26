import { jsonRes } from '@fastgpt/service/common/response';
import type { NextApiResponse, NextApiHandler, NextApiRequest } from 'next';
import { connectToDatabase } from '../mongo';
import { withNextCors } from '@fastgpt/service/common/middle/cors';

export const NextAPI = (...args: NextApiHandler[]): NextApiHandler => {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      await Promise.all([withNextCors(req, res), connectToDatabase()]);

      for (const handler of args) {
        await handler(req, res);
      }
    } catch (error) {
      return jsonRes(res, {
        code: 500,
        error,
        url: req.url
      });
    }
  };
};
