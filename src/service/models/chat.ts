import { Schema, model, models } from 'mongoose';

const ChatSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  modelId: {
    type: Schema.Types.ObjectId,
    ref: 'model',
    required: true
  },
  expiredTime: {
    // 过期时间
    type: Number,
    required: true
  },
  loadAmount: {
    // 剩余加载次数
    type: Number,
    required: true
  }
});

export const Chat = models['chat'] || model('chat', ChatSchema);
