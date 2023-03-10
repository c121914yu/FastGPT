import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import tunnel from 'tunnel';

/* 密码加密 */
export const hashPassword = (psw: string) => {
  return crypto.createHash('sha256').update(psw).digest('hex');
};

/* 生成 token */
export const generateToken = (userId: string) => {
  const key = process.env.TOKEN_KEY as string;
  const token = jwt.sign(
    {
      userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    },
    key
  );
  return token;
};

/* 校验 token */
export const authToken = (token: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const key = process.env.TOKEN_KEY as string;

    jwt.verify(token, key, function (err, decoded: any) {
      if (err || !decoded?.userId) {
        reject('凭证无效');
        return;
      }
      resolve(decoded.userId);
    });
  });
};

/* 获取用户的 openai APIkey */
export const getUserOpenaiKey = async (userId: string) => {
  const user = await User.findById(userId);

  const userApiKey = user?.accounts?.find((item: any) => item.type === 'openai')?.value;
  if (!userApiKey) {
    return Promise.reject('缺少ApiKey, 无法请求');
  }

  return Promise.resolve(userApiKey);
};

/* 代理 */
export const httpsAgent =
  process.env.AXIOS_PROXY_HOST && process.env.AXIOS_PROXY_PORT
    ? tunnel.httpsOverHttp({
        proxy: {
          host: process.env.AXIOS_PROXY_HOST,
          port: +process.env.AXIOS_PROXY_PORT
        }
      })
    : undefined;
