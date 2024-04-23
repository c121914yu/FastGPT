import { Worker } from 'worker_threads';
import path from 'path';

export enum WorkerNameEnum {
  htmlStr2Md = 'htmlStr2Md',
  countGptMessagesTokens = 'countGptMessagesTokens',
  countPromptToken = 'countPromptToken'
}

export const runWorker = <T = any>(name: WorkerNameEnum, params?: Record<string, any>) => {
  const workerPath = path.join(process.cwd(), '.next', 'server', `${name}.js`);

  return new Promise<T>((resolve, reject) => {
    const worker = new Worker(workerPath);

    worker.postMessage(params);

    worker.on('message', (msg: { type: 'success' | 'error'; data: any }) => {
      worker.terminate();

      if (msg.type === 'error') return reject(msg.data);

      resolve(msg.data);
    });

    worker.on('error', (err) => {
      reject(err);
    });
  });
};
