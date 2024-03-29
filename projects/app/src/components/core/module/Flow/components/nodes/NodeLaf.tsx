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

  return (
    <NodeCard minW={'350px'} selected={selected} {...data}>
      {!userInfo?.lafAccount?.appid ? (
        <Center minH={200}>请先绑定 laf 账号</Center>
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
                      onChangeNode({
                        moduleId,
                        type: 'updateInput',
                        key: ModuleInputKeyEnum.httpReqUrl,
                        value: {
                          ...requestUrl,
                          value: `https://${appDetailData?.domain.domain}${
                            funcList.find((func) => func.name === e)?.path
                          }`
                        }
                      });
                      onChangeNode({
                        moduleId,
                        type: 'updateInput',
                        key: ModuleInputKeyEnum.httpMethod,
                        value: {
                          ...requestMethods,
                          value: upperCase(funcList.find((func) => func.name === e)?.method)
                        }
                      });
                      const func = funcList.find((func) => func.name === e);
                      const delNode = toolInputs.filter(
                        (input) =>
                          !(
                            func?.params?.find((param) => param.name === input.key) ||
                            func?.request?.content?.['application/json']?.schema?.properties?.[
                              input.key
                            ]
                          )
                      );
                      delNode.forEach((input) => {
                        onChangeNode({
                          moduleId,
                          type: 'delInput',
                          key: input.key,
                          value: ''
                        });
                      });
                      func?.params?.forEach((param) => {
                        console.log(param);
                        onChangeNode({
                          moduleId,
                          type: 'addInput',
                          key: e.key,
                          value: {
                            key: param.name,
                            label: param.name,
                            required: param.required,
                            toolDescription: param?.description || 'description',
                            type: 'hidden',
                            valueType: 'string'
                          }
                        });
                      });
                      const properties =
                        func?.request?.content?.['application/json']?.schema?.properties;
                      const propsKeys = properties ? Object.keys(properties) : [];
                      propsKeys.forEach((key) => {
                        onChangeNode({
                          moduleId,
                          type: 'addInput',
                          key: e.key,
                          value: {
                            key,
                            label: key,
                            required: true,
                            toolDescription: properties?.[key].description || 'description',
                            type: 'hidden',
                            valueType: 'string'
                          }
                        });
                      });
                    }}
                    value={currentFunc?.name}
                  />
                )}
              </Box>
            </Box>
          </Container>
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
              <RenderInput moduleId={moduleId} flowInputList={commonInputs} />
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
    </NodeCard>
  );
};
export default React.memo(NodeLaf);
