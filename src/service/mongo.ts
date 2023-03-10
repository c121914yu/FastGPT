import mongoose from 'mongoose';

/**
 * 连接 MongoDB 数据库
 */
export async function connectToDatabase(): Promise<void> {
  if (global.mongodb) {
    return;
  }

  global.mongodb = 'connecting';
  console.log('connect mongo');
  try {
    mongoose.set('strictQuery', true);
    global.mongodb = await mongoose.connect(process.env.MONGODB_URI as string, {
      bufferCommands: true,
      dbName: 'doc_gpt',
      maxPoolSize: 5,
      minPoolSize: 1,
      maxConnecting: 5
    });
  } catch (error) {
    console.log('error->', 'mongo connect error');
    global.mongodb = null;
  }
}

export * from './models/authCode';
export * from './models/chat';
export * from './models/model';
export * from './models/user';
export * from './models/training';
export * from './models/chatWindow';
