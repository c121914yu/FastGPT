import { Request, Response, NextFunction } from 'express';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { addLog } from '@/utils/log';

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  addLog.error(`${req.method} ${req.url}`, err);
  if (!err) {
    return res.status(500).json('Request failed');
  }

  if (Array.isArray(err)) {
    return res.status(500).json(err);
  }

  if (typeof err === 'object') {
    delete err.code;
    delete err.message;
    return res.status(err.code || 500).json(err);
  }

  return res.status(500).send(getErrText(err));
};
