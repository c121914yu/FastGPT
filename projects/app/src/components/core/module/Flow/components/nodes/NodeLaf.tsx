import React, { useEffect, useMemo, useState } from 'react';
import { NodeProps } from 'reactflow';
import NodeCard from '../render/NodeCard';
import { FlowModuleItemType } from '@fastgpt/global/core/module/type.d';
import Divider from '../modules/Divider';
import Container from '../modules/Container';
import RenderInput from '../render/RenderInput';
import RenderOutput from '../render/RenderOutput';
import { Box, Center, Spinner, useToast } from '@chakra-ui/react';
import { ModuleInputKeyEnum } from '@fastgpt/global/core/module/constants';
import { onChangeNode, useFlowProviderStore } from '../../FlowProvider';
import { useTranslation } from 'next-i18next';
import { getLafAppDetail } from '@/web/support/laf/api';
import RenderToolInput from '../render/RenderToolInput';
import MySelect from '@fastgpt/web/components/common/MySelect';
import { useRequest } from '@fastgpt/web/hooks/useRequest';
import { getApiSchemaByUrl } from '@/web/core/plugin/api';
import { str2OpenApiSchema } from '@fastgpt/global/core/plugin/httpPlugin/utils';
import { upperCase } from 'lodash';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { RenderHttpProps } from './NodeHttp';

type TAppDetail = {
  domain: {
    domain: string;
  };
};

type TFunc = {
  name: string;
  path: string;
  description: string;
  method: string;
  params: any[];
  request: any;
};

const NodeLaf = ({ data, selected }: NodeProps<FlowModuleItemType>) => {
  const { t } = useTranslation();
  const { moduleId, inputs, outputs } = data;
  const { splitToolInputs, hasToolNode } = useFlowProviderStore();
  const { commonInputs, toolInputs } = splitToolInputs(inputs, moduleId);
  const { feConfigs } = useSystemStore();

  const requestUrl = inputs.find((item) => item.key === ModuleInputKeyEnum.httpReqUrl);
  const requestMethods = inputs.find((item) => item.key === ModuleInputKeyEnum.httpMethod);
  const inputParams = inputs.find((item) => item.key === ModuleInputKeyEnum.httpParams);
  const jsonBody = inputs.find((item) => item.key === ModuleInputKeyEnum.httpJsonBody);

  const [currentFunc, setCurrentFunc] = useState<TFunc | null>(null);
  const [appDetailData, setAppDetailData] = useState<TAppDetail | null>(null);
  const [funcList, setFuncList] = useState<TFunc[]>([]);

  const toast = useToast();
  const { userInfo } = useUserStore();

  const lafEnv = feConfigs.laf_env || '';
  const token = useMemo(() => userInfo?.lafAccount?.token || '', [userInfo]);
  const appid = useMemo(() => userInfo?.lafAccount?.appid || '', [userInfo]);

  const { mutate: getFuncList, isLoading: isLoadingAppApi } = useRequest({
    mutationFn: async (appid) => {
      const appDetail = await getLafAppDetail(lafEnv, token, appid);
      setAppDetailData(appDetail?.data.data);
      const schemaUrl = appDetail?.data.data
        ? `https://${appDetail?.data.data.domain.domain}/_/api-docs?token=${appDetail?.data.data.openapi_token}`
        : '';
      if (!schemaUrl || !schemaUrl.startsWith('https://')) {
        return toast({
          title: t('plugin.Invalid URL'),
          status: 'warning'
        });
      }
      const schema = await getApiSchemaByUrl(schemaUrl);
      const openApiSchema = await str2OpenApiSchema(JSON.stringify(schema));
      setFuncList(openApiSchema.pathData);
    },
    errorToast: t('plugin.Invalid Schema')
  });

  useEffect(() => {
    const initFunc = requestUrl?.value?.match(/\/([^\/?#]+)(?:\?|#|$)/)[1];
    const initMethod = requestMethods?.value;
    setCurrentFunc(funcList.find((func) => func.name === `${initFunc}_${initMethod}`) || null);
  }, [funcList, requestMethods, requestUrl?.value]);

  useEffect(() => {
    if (appid && token) {
      getFuncList(appid);
    }
  }, [appid, getFuncList, token]);

  const CustomComponents = useMemo(
    () => ({
      [ModuleInputKeyEnum.httpHeaders]: () => (
        <>
          <RenderHttpProps moduleId={moduleId} inputs={inputs} />
        </>
      )
    }),
    [inputs, moduleId]
  );

  return (
    <NodeCard minW={'350px'} selected={selected} {...data}>
      {!userInfo?.lafAccount?.appid ? (
        <Center minH={200}>{t('plugin.Please bind laf accout first')}</Center>
      ) : (
        <>
          <Container>
            <Box w={'full'}>
              <Box>
                {isLoadingAppApi ? (
                  <Center>
                    <Spinner />
                  </Center>
                ) : (
                  <MySelect
                    list={
                      funcList.map((func) => ({
                        label: func.description ? `${func.name} (${func.description})` : func.name,
                        value: func.name
                      })) || []
                    }
                    placeholder={t('plugin.Func')}
                    onchange={(e) => {
                      const findFuncByName = (name: string) =>
                        funcList.find((func) => func.name === name);

                      const updateNode = (key: string, value: any) => {
                        onChangeNode({ moduleId, type: 'updateInput', key, value });
                      };

                      const addNode = (key: string, value: any) => {
                        onChangeNode({ moduleId, type: 'addInput', key, value });
                      };

                      const currentFunc = findFuncByName(e);

                      if (currentFunc) {
                        const { domain } = appDetailData || {};
                        const { method, path, params, request } = currentFunc;

                        updateNode(ModuleInputKeyEnum.httpReqUrl, {
                          ...requestUrl,
                          value: `https://${domain?.domain || ''}${path || ''}`
                        });

                        updateNode(ModuleInputKeyEnum.httpMethod, {
                          ...requestMethods,
                          value: upperCase(method)
                        });

                        const properties =
                          request?.content?.['application/json']?.schema?.properties || {};

                        const delNodeKeys = commonInputs
                          .filter(
                            (input) =>
                              input.edit &&
                              !(
                                params?.some((param) => param.name === input.key) ||
                                properties[input.key]
                              )
                          )
                          .map((input) => input.key);

                        delNodeKeys.forEach((key) => {
                          onChangeNode({ moduleId, type: 'delInput', key, value: '' });
                        });

                        const concatParams =
                          params?.map((param) => ({
                            key: param.name,
                            type: 'string',
                            value: `{{${param.name}}}`
                          })) || [];

                        updateNode(ModuleInputKeyEnum.httpParams, {
                          ...inputParams,
                          value: concatParams
                        });

                        params?.forEach((param) => {
                          addNode(e.key, {
                            key: param.name,
                            valueType: param.schema.type,
                            label: param.name,
                            type: 'target',
                            description: param.description || '',
                            edit: true,
                            editField: {
                              key: true,
                              description: true,
                              dataType: true
                            },
                            required: param.required,
                            connected: false
                          });
                        });

                        Object.keys(properties).forEach((key) => {
                          addNode(e.key, {
                            key,
                            valueType: 'string',
                            label: key,
                            type: 'target',
                            required: properties[key].required || false,
                            description: properties[key].description || '',
                            edit: true,
                            editField: {
                              key: true,
                              description: true,
                              dataType: true
                            },
                            connected: false
                          });
                        });

                        const bodyJson = Object.keys(properties).reduce((acc: any, key) => {
                          acc[key] = `{{${key}}}`;
                          return acc;
                        }, {});

                        updateNode(ModuleInputKeyEnum.httpJsonBody, {
                          ...jsonBody,
                          value: JSON.stringify(bodyJson, null, 2)
                        });
                      }
                    }}
                    value={currentFunc?.name}
                  />
                )}
              </Box>
            </Box>
          </Container>
          {!isLoadingAppApi && (
            <>
              {hasToolNode && (
                <>
                  <Divider text={t('core.module.tool.Tool input')} />
                  <Container>
                    <RenderToolInput moduleId={moduleId} inputs={toolInputs} canEdit />
                  </Container>
                </>
              )}
              <>
                <Divider text={t('common.Input')} />
                <Container>
                  <RenderInput
                    moduleId={moduleId}
                    flowInputList={commonInputs}
                    CustomComponent={CustomComponents}
                  />
                </Container>
              </>
              <>
                <Divider text={t('common.Output')} />
                <Container>
                  <RenderOutput moduleId={moduleId} flowOutputList={outputs} />
                </Container>
              </>
            </>
          )}
        </>
      )}
    </NodeCard>
  );
};
export default React.memo(NodeLaf);
