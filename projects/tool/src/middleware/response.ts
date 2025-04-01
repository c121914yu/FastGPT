import { Request, Response, NextFunction } from 'express';

type ResponseFormat<T = any> = {
  code: number;
  time: Date;
  message?: string;
  data: T;
};

export const formatResponse = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Override res.json method
    const originalJson = res.json;
    res.json = function (data: any) {
      const formattedResponse: ResponseFormat =
        res.statusCode >= 400
          ? {
              code: res.statusCode,
              time: new Date(),
              message: typeof data === 'string' ? data : data.message || 'Request failed',
              data: typeof data === 'object' ? data : undefined
            }
          : {
              code: res.statusCode,
              time: new Date(),
              data
            };
      return originalJson.call(this, formattedResponse);
    };
    next();
  };
};
