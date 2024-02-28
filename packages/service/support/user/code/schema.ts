import { CodeModelSchema } from '@fastgpt/global/support/user/code/type';
import { type Model, connectionMongo } from '../../../common/mongo';
const { Schema, model, models } = connectionMongo;

export const codesCollectionName = 'codes';

const CodeSchema = new Schema({
  openid: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  createTime: {
    type: Date,
    default: () => new Date()
  },
  expireTime: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000)
  }
});

export const MongoCode: Model<CodeModelSchema> =
  models[codesCollectionName] || model(codesCollectionName, CodeSchema);

MongoCode.syncIndexes();
