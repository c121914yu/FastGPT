import { addLog } from '@/utils/log';
import path from 'path';
import { Worker } from 'worker_threads';

export const runWorker = <T = any>(name: string, params?: Record<string, any>) => {
  const getSafeEnv = () => {
    return {
      LOG_LEVEL: process.env.LOG_LEVEL,
      STORE_LOG_LEVEL: process.env.STORE_LOG_LEVEL,
      NODE_ENV: process.env.NODE_ENV
    };
  };

  const getWorker = (name: string) => {
    const workerPath = path.join(__dirname, name, 'index.ts');

    return new Worker(workerPath, {
      env: getSafeEnv()
    });
  };

  return new Promise<T>((resolve, reject) => {
    const start = Date.now();
    const worker = getWorker(name);

    worker.postMessage(params);

    worker.on('message', (msg: { type: 'success' | 'error'; data: any }) => {
      if (msg.type === 'error') return reject(msg.data);

      resolve(msg.data);

      const time = Date.now() - start;
      if (time > 1000) {
        addLog.info(`Worker ${name} run time: ${time}ms`);
      }
    });

    worker.on('error', (err) => {
      reject(err);
      worker.terminate();
    });
    worker.on('messageerror', (err) => {
      reject(err);
      worker.terminate();
    });
  });
};
