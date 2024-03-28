import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { NodeProps } from 'reactflow';
import NodeCard from '../../render/NodeCard';
import { FlowModuleItemType } from '@fastgpt/global/core/module/type.d';
import Divider from '../../modules/Divider';
import Container from '../../modules/Container';
import RenderInput from '../../render/RenderInput';
import RenderOutput from '../../render/RenderOutput';
import { Avatar, Box, Button, Center, Flex, Input, Spinner, useToast } from '@chakra-ui/react';
import { ModuleInputKeyEnum } from '@fastgpt/global/core/module/constants';
import { onChangeNode, useFlowProviderStore } from '../../../FlowProvider';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  defaultEnv,
  getLafAppDetail,
  getLafApplications,
  getLafProfile,
  pat2Token
} from '@/web/support/laf/api';
import RenderToolInput from '../../render/RenderToolInput';
import MySelect from '@fastgpt/web/components/common/MySelect';
import { useRequest } from '@fastgpt/web/hooks/useRequest';
import { getApiSchemaByUrl } from '@/web/core/plugin/api';
import { str2OpenApiSchema } from '@fastgpt/global/core/plugin/httpPlugin/utils';
import { upperCase } from 'lodash';

type TApp = {
  name: string;
  appid: string;
  state: string;
};

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

const NodeHttp = ({ data, selected }: NodeProps<FlowModuleItemType>) => {
  const { t } = useTranslation();
  const { moduleId, inputs, outputs } = data;
  const { splitToolInputs, hasToolNode } = useFlowProviderStore();
  const { commonInputs, toolInputs } = splitToolInputs(inputs, moduleId);
  const [pat, setPat] = useState('');
  const [token, setToken] = useState(localStorage.getItem('lafToken') || '');
  const [lafEnv, setLafEnv] = useState(localStorage.getItem('lafEnv') || defaultEnv);
  const requestUrl = inputs.find((item) => item.key === ModuleInputKeyEnum.httpReqUrl);
  const requestMethods = inputs.find((item) => item.key === ModuleInputKeyEnum.httpMethod);
  const [currentApp, setCurrentApp] = useState<TApp | null>(null);
  const [currentFunc, setCurrentFunc] = useState<TFunc | null>(null);
  const [appDetailData, setAppDetailData] = useState<TAppDetail | null>(null);
  const [funcList, setFuncList] = useState<TFunc[]>([]);

  const toast = useToast();

  const { data: profileData, isLoading: isProfileLoading } = useQuery(['profile', token], () => {
    return getLafProfile(lafEnv, token);
  });

  const { data: appListData, isLoading: isAppListLoading } = useQuery(
    ['appList', requestUrl?.value, token],
    () => {
      return getLafApplications(lafEnv, token);
    },
    {
      enabled: !!token,
      onSuccess: (data) => {
        const initAppid = requestUrl?.value?.match(/https:\/\/(.*?)\./)[1];
        if (!initAppid) return;
        const app = data.data.data.find((app: TApp) => app.appid === initAppid);
        setCurrentApp(app);
        onChangeAppApi(initAppid);
      }
    }
  );

  const { mutate: pat2TokenMutate, isLoading: isPatLoading } = useRequest({
    mutationFn: async (pat) => {
      const { data } = await pat2Token(lafEnv, pat);
      const lafToken = data.data;
      localStorage.setItem('lafToken', lafToken);
      setToken(lafToken);
    },
    errorToast: t('plugin.Invalid Env')
  });

  const { mutate: onChangeAppApi, isLoading: isLoadingAppApi } = useRequest({
    mutationFn: async (appid) => {
      if (!appid) {
        return toast({
          title: t('plugin.Invalid Appid'),
          status: 'warning'
        });
      }
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

  return (
    <NodeCard minW={'350px'} selected={selected} {...data}>
      <Container>
        <Box w={'full'}>
          {!profileData?.data.data ? (
            <Box>
              <Flex mb={2} alignItems={'center'}>
                <Box mr={2}>Env:</Box>
                {!!lafEnv ? (
                  <Button variant={'link'} onClick={() => setLafEnv('')}>
                    {lafEnv}
                  </Button>
                ) : (
                  <Input
                    h={10}
                    placeholder={t('plugin.Enter Env')}
                    onBlur={(e) => {
                      setLafEnv(e.target.value);
                      localStorage.setItem('lafEnv', e.target.value);
                    }}
                  ></Input>
                )}
              </Flex>
              <Flex h={10}>
                <Box h={'full'} alignContent={'center'} mr={2}>
                  PAT:
                </Box>
                <Input
                  h={'full'}
                  mr={4}
                  placeholder={t('plugin.Enter PAT')}
                  onChange={(e) => setPat(e.target.value)}
                ></Input>
                <Button
                  h={'full'}
                  variant={'whiteBase'}
                  onClick={async () => {
                    if (!pat) {
                      return toast({
                        title: 'pat is empty',
                        status: 'warning'
                      });
                    }
                    pat2TokenMutate(pat);
                  }}
                  isLoading={isPatLoading && isProfileLoading}
                >
                  {t('common.Confirm')}
                </Button>
              </Flex>
            </Box>
          ) : (
            <Box>
              <Flex alignItems={'center'} mb={2} justifyContent={'space-between'}>
                <Flex alignItems={'center'}>
                  <Avatar
                    size={'sm'}
                    mr={2}
                    src={
                      profileData?.data.data.profile.uid
                        ? `https://${lafEnv}/v1/user/avatar/${profileData?.data.data.profile.uid}`
                        : ''
                    }
                  />
                  {profileData?.data.data.username}
                </Flex>
                <Button
                  variant={'link'}
                  onClick={() => {
                    setToken('');
                    setPat('');
                    localStorage.removeItem('lafToken');
                  }}
                >
                  {t('user.Sign Out')}
                </Button>
              </Flex>
              {isAppListLoading ? (
                <Center>
                  <Spinner />
                </Center>
              ) : (
                <MySelect
                  list={
                    appListData?.data.data
                      .filter((app: TApp) => app.state === 'Running')
                      .map((app: TApp) => ({
                        label: `${app.name} (${app.appid})`,
                        value: app.appid
                      })) || []
                  }
                  placeholder={t('plugin.App')}
                  onchange={(e) => {
                    const app = appListData?.data.data.find((app: TApp) => app.appid === e);
                    setCurrentApp(app);
                    onChangeAppApi(e);
                  }}
                  value={currentApp?.appid}
                  mb={2}
                />
              )}
              {!currentApp ? null : isLoadingAppApi ? (
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
                      onChangeNode({
                        moduleId,
                        type: 'addInput',
                        key: e.key,
                        value: {
                          key: param.name,
                          label: param.name,
                          required: param.required,
                          toolDescription: 'param.description',
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
                          toolDescription: 'properties[key].description',
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
          )}
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
    </NodeCard>
  );
};
export default React.memo(NodeHttp);
