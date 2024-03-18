import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import axios from 'axios';
import yaml from 'js-yaml';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const url = req.query.url as string;

    const data = await axios({ url: url, method: 'get' });

    let schema = '';

    if (typeof data.data !== 'string') {
      schema = JSON.stringify(data.data);
    } else {
      schema = data.data;
    }

    try {
      JSON.parse(schema);
    } catch (jsonError) {
      try {
        yaml.load(schema, { schema: yaml.FAILSAFE_SCHEMA });
      } catch (yamlError) {
        throw new Error();
      }
    }

    return jsonRes(res, {
      data: schema
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
