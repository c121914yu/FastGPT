import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { NextAPI } from '@/service/middleware/entry';
import { connectionMongo } from '@fastgpt/service/common/mongo';
import { MongoPlugin } from '@fastgpt/service/core/plugin/schema';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { AppDefaultPermission } from '@fastgpt/global/support/permission/app/constant';
import { MongoAppVersion } from '@fastgpt/service/core/app/version/schema';
import { delay } from '@fastgpt/global/common/system/utils';

/* 把plugin内容全部迁移到app表 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  await authCert({ req, authRoot: true });

  const plugins = await MongoPlugin.find({ inited: { $ne: true } }, '_id').lean();

  // 50 组进程
  const promises = [];
  for (let i = 0; i < 50; i++) {
    const plugin = plugins.shift();
    if (!plugin) break;

    promises.push(movePlugin(plugin._id));
  }

  jsonRes(res, {
    message: 'success'
  });
}

export default NextAPI(handler);

async function movePlugin(id: string) {
  const plugin = await MongoPlugin.findById(id);

  if (!plugin) return;

  try {
    await mongoSessionRun(async (session) => {
      const [{ _id: appId }] = await MongoApp.create(
        [
          {
            parentId: plugin.parentId,
            avatar: plugin.avatar,
            name: plugin.name,
            teamId: plugin.teamId,
            tmbId: plugin.tmbId,
            modules: plugin.modules,
            edges: plugin.edges,
            type: AppTypeEnum.plugin,
            version: plugin.version,
            defaultPermission: AppDefaultPermission,
            pluginMetadata: {
              ...plugin.metadata,
              version: plugin.nodeVersion
            }
          }
        ],
        { session }
      );
      await MongoAppVersion.create(
        [
          {
            appId,
            nodes: plugin.modules,
            edges: plugin.edges
          }
        ],
        { session }
      );

      plugin.inited = true;
      await plugin.save({ session });
    });
  } catch (error) {
    console.log('error： move plugin', error);

    await delay(1000);
    return movePlugin(id);
  }
}
