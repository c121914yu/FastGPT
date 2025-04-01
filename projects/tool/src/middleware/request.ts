import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response) => Promise<any> | any;

// Request handler wrapper
export const handleRequest = (handler: AsyncFunction) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await handler(req, res);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
};
