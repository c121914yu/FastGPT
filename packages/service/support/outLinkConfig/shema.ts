import { connectionMongo, type Model } from '../../common/mongo';
import type { OutLinkConfigSchema as OutLinkConfigType } from "@fastgpt/global/support/outLinkConfig/type"
const { Schema, model, models } = connectionMongo;

const OutLinkConfigSchema = new Schema({
    shareId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    ReplyLimit:{
        type: String,
        required: true
    },
    defaultResponse: {
        type: String,
        required: true
    },
    immediateResponse: {
        type: String,
        required: true
    },
});

try {
    OutLinkConfigSchema.index({ shareId: -1 });
} catch (error) {
    console.log(error);
}

export const MongoOutLinkConfig: Model<OutLinkConfigType> =
    models['outlinkconfig'] || model('outlinkconfig', OutLinkConfigSchema);

MongoOutLinkConfig.syncIndexes();