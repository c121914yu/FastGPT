import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { NodeProps } from 'reactflow';
import NodeCard from '../render/NodeCard';
import { FlowNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import Divider from '../../components/Divider';
import Container from '../../components/Container';
import RenderInput from '../render/RenderInput';
import RenderOutput from '../render/RenderOutput';
import {
  Box,
  Flex,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { NodeInputKeyEnum, WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import { useFlowProviderStore } from '../../FlowProvider';
import { useTranslation } from 'next-i18next';
import Tabs from '@/components/Tabs';
import MyIcon from '@fastgpt/web/components/common/Icon';
import {
  FlowNodeInputItemType,
  FlowNodeOutputItemType
} from '@fastgpt/global/core/workflow/type/io.d';
import { useToast } from '@fastgpt/web/hooks/useToast';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { QuestionOutlineIcon, SmallAddIcon } from '@chakra-ui/icons';
import JSONEditor from '@fastgpt/web/components/common/Textarea/JsonEditor';
import {
  formatEditorVariablePickerIcon,
  getGuideModule,
  splitGuideModule
} from '@fastgpt/global/core/workflow/utils';
import { EditorVariablePickerType } from '@fastgpt/web/components/common/Textarea/PromptEditor/type';
import HttpInput from '@fastgpt/web/components/common/Input/HttpInput';
import dynamic from 'next/dynamic';
import MySelect from '@fastgpt/web/components/common/MySelect';
import RenderToolInput from '../render/RenderToolInput';
import IOTitle from '../../components/IOTitle';
import { EditNodeFieldType, EditOutputFieldMapType } from '@fastgpt/global/core/workflow/node/type';
import FieldEditModal from '../render/FieldEditModal';
import { getNanoid } from '@fastgpt/global/common/string/tools';
import { FlowValueTypeMap } from '@/web/core/workflow/constants/dataType';
const CurlImportModal = dynamic(() => import('./CurlImportModal'));

export const HttpHeaders = [
  { key: 'A-IM', label: 'A-IM' },
  { key: 'Accept', label: 'Accept' },
  { key: 'Accept-Charset', label: 'Accept-Charset' },
  { key: 'Accept-Encoding', label: 'Accept-Encoding' },
  { key: 'Accept-Language', label: 'Accept-Language' },
  { key: 'Accept-Datetime', label: 'Accept-Datetime' },
  { key: 'Access-Control-Request-Method', label: 'Access-Control-Request-Method' },
  { key: 'Access-Control-Request-Headers', label: 'Access-Control-Request-Headers' },
  { key: 'Authorization', label: 'Authorization' },
  { key: 'Cache-Control', label: 'Cache-Control' },
  { key: 'Connection', label: 'Connection' },
  { key: 'Content-Length', label: 'Content-Length' },
  { key: 'Content-Type', label: 'Content-Type' },
  { key: 'Cookie', label: 'Cookie' },
  { key: 'Date', label: 'Date' },
  { key: 'Expect', label: 'Expect' },
  { key: 'Forwarded', label: 'Forwarded' },
  { key: 'From', label: 'From' },
  { key: 'Host', label: 'Host' },
  { key: 'If-Match', label: 'If-Match' },
  { key: 'If-Modified-Since', label: 'If-Modified-Since' },
  { key: 'If-None-Match', label: 'If-None-Match' },
  { key: 'If-Range', label: 'If-Range' },
  { key: 'If-Unmodified-Since', label: 'If-Unmodified-Since' },
  { key: 'Max-Forwards', label: 'Max-Forwards' },
  { key: 'Origin', label: 'Origin' },
  { key: 'Pragma', label: 'Pragma' },
  { key: 'Proxy-Authorization', label: 'Proxy-Authorization' },
  { key: 'Range', label: 'Range' },
  { key: 'Referer', label: 'Referer' },
  { key: 'TE', label: 'TE' },
  { key: 'User-Agent', label: 'User-Agent' },
  { key: 'Upgrade', label: 'Upgrade' },
  { key: 'Via', label: 'Via' },
  { key: 'Warning', label: 'Warning' },
  { key: 'Dnt', label: 'Dnt' },
  { key: 'X-Requested-With', label: 'X-Requested-With' },
  { key: 'X-CSRF-Token', label: 'X-CSRF-Token' }
];

enum TabEnum {
  params = 'params',
  headers = 'headers',
  body = 'body'
}
export type PropsArrType = {
  key: string;
  type: string;
  value: string;
};

const RenderHttpMethodAndUrl = React.memo(function RenderHttpMethodAndUrl({
  nodeId,
  inputs
}: {
  nodeId: string;
  inputs: FlowNodeInputItemType[];
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [_, startSts] = useTransition();
  const { onChangeNode } = useFlowProviderStore();

  const { isOpen: isOpenCurl, onOpen: onOpenCurl, onClose: onCloseCurl } = useDisclosure();

  const requestMethods = inputs.find((item) => item.key === NodeInputKeyEnum.httpMethod);
  const requestUrl = inputs.find((item) => item.key === NodeInputKeyEnum.httpReqUrl);

  const onChangeUrl = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeNode({
        nodeId,
        type: 'updateInput',
        key: NodeInputKeyEnum.httpReqUrl,
        value: {
          ...requestUrl,
          value: e.target.value
        }
      });
    },
    [nodeId, onChangeNode, requestUrl]
  );
  const onBlurUrl = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // 拆分params和url
      const url = val.split('?')[0];
      const params = val.split('?')[1];
      if (params) {
        const paramsArr = params.split('&');
        const paramsObj = paramsArr.reduce((acc, cur) => {
          const [key, value] = cur.split('=');
          return {
            ...acc,
            [key]: value
          };
        }, {});
        const inputParams = inputs.find((item) => item.key === NodeInputKeyEnum.httpParams);

        if (!inputParams || Object.keys(paramsObj).length === 0) return;

        const concatParams: PropsArrType[] = inputParams?.value || [];
        Object.entries(paramsObj).forEach(([key, value]) => {
          if (!concatParams.find((item) => item.key === key)) {
            concatParams.push({ key, value: value as string, type: 'string' });
          }
        });

        onChangeNode({
          nodeId,
          type: 'updateInput',
          key: NodeInputKeyEnum.httpParams,
          value: {
            ...inputParams,
            value: concatParams
          }
        });

        onChangeNode({
          nodeId,
          type: 'updateInput',
          key: NodeInputKeyEnum.httpReqUrl,
          value: {
            ...requestUrl,
            value: url
          }
        });

        toast({
          status: 'success',
          title: t('core.module.http.Url and params have been split')
        });
      }
    },
    [inputs, nodeId, onChangeNode, requestUrl, t, toast]
  );

  const Render = useMemo(() => {
    return (
      <Box>
        <Box mb={2} display={'flex'} justifyContent={'space-between'}>
          <Box fontWeight={'medium'} color={'myGray.600'}>
            {t('core.module.Http request settings')}
          </Box>
          <Button variant={'link'} onClick={onOpenCurl}>
            {t('core.module.http.curl import')}
          </Button>
        </Box>
        <Flex alignItems={'center'} className="nodrag">
          <MySelect
            h={'34px'}
            w={'88px'}
            bg={'white'}
            width={'100%'}
            value={requestMethods?.value}
            list={[
              {
                label: 'GET',
                value: 'GET'
              },
              {
                label: 'POST',
                value: 'POST'
              },
              {
                label: 'PUT',
                value: 'PUT'
              },
              {
                label: 'DELETE',
                value: 'DELETE'
              },
              {
                label: 'PATCH',
                value: 'PATCH'
              }
            ]}
            onchange={(e) => {
              onChangeNode({
                nodeId,
                type: 'updateInput',
                key: NodeInputKeyEnum.httpMethod,
                value: {
                  ...requestMethods,
                  value: e
                }
              });
            }}
          />
          <Input
            flex={'1 0 0'}
            ml={2}
            h={'34px'}
            bg={'white'}
            value={requestUrl?.value}
            placeholder={t('core.module.input.label.Http Request Url')}
            fontSize={'xs'}
            onChange={onChangeUrl}
            onBlur={onBlurUrl}
          />
        </Flex>

        {isOpenCurl && <CurlImportModal nodeId={nodeId} inputs={inputs} onClose={onCloseCurl} />}
      </Box>
    );
  }, [
    inputs,
    isOpenCurl,
    nodeId,
    onBlurUrl,
    onChangeNode,
    onChangeUrl,
    onCloseCurl,
    onOpenCurl,
    requestMethods,
    requestUrl?.value,
    t
  ]);

  return Render;
});

export function RenderHttpProps({
  nodeId,
  inputs
}: {
  nodeId: string;
  inputs: FlowNodeInputItemType[];
}) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(TabEnum.params);
  const { nodeList } = useFlowProviderStore();

  const requestMethods = inputs.find((item) => item.key === NodeInputKeyEnum.httpMethod)?.value;
  const params = inputs.find((item) => item.key === NodeInputKeyEnum.httpParams);
  const headers = inputs.find((item) => item.key === NodeInputKeyEnum.httpHeaders);
  const jsonBody = inputs.find((item) => item.key === NodeInputKeyEnum.httpJsonBody);

  const paramsLength = params?.value?.length || 0;
  const headersLength = headers?.value?.length || 0;

  // get variable
  const variables = useMemo(() => {
    const globalVariables = formatEditorVariablePickerIcon(
      splitGuideModule(getGuideModule(nodeList))?.variableModules || []
    );
    const systemVariables = [
      {
        key: 'appId',
        label: t('core.module.http.AppId')
      },
      {
        key: 'chatId',
        label: t('core.module.http.ChatId')
      },
      {
        key: 'responseChatItemId',
        label: t('core.module.http.ResponseChatItemId')
      },
      {
        key: 'variables',
        label: t('core.module.http.Variables')
      },
      {
        key: 'histories',
        label: t('core.module.http.Histories')
      },
      {
        key: 'cTime',
        label: t('core.module.http.Current time')
      }
    ];
    const moduleVariables = formatEditorVariablePickerIcon(
      inputs
        .filter((input) => input.canEdit || input.toolDescription)
        .map((item) => ({
          key: item.key,
          label: item.label
        }))
    );

    return [...moduleVariables, ...globalVariables, ...systemVariables];
  }, [inputs, nodeList, t]);

  const variableText = useMemo(() => {
    return variables
      .map((item) => `${item.key}${item.key !== item.label ? `(${item.label})` : ''}`)
      .join('\n');
  }, [variables]);

  const stringifyVariables = useMemo(
    () =>
      JSON.stringify({
        params,
        headers,
        jsonBody,
        variables
      }),
    [headers, jsonBody, params, variables]
  );

  const Render = useMemo(() => {
    const { params, headers, jsonBody, variables } = JSON.parse(stringifyVariables);
    return (
      <Box>
        <Flex alignItems={'center'} mb={2} fontWeight={'medium'} color={'myGray.600'}>
          {t('core.module.Http request props')}
          <MyTooltip label={t('core.module.http.Props tip', { variable: variableText })}>
            <QuestionOutlineIcon ml={1} />
          </MyTooltip>
        </Flex>
        <Tabs
          list={[
            { label: <RenderPropsItem text="Params" num={paramsLength} />, id: TabEnum.params },
            ...(!['GET', 'DELETE'].includes(requestMethods)
              ? [
                  {
                    label: (
                      <Flex alignItems={'center'}>
                        Body
                        {jsonBody?.value && <Box ml={1}>✅</Box>}
                      </Flex>
                    ),
                    id: TabEnum.body
                  }
                ]
              : []),
            { label: <RenderPropsItem text="Headers" num={headersLength} />, id: TabEnum.headers }
          ]}
          activeId={selectedTab}
          onChange={(e) => setSelectedTab(e as any)}
        />
        <Box bg={'white'} borderRadius={'md'}>
          {params &&
            headers &&
            jsonBody &&
            {
              [TabEnum.params]: (
                <RenderForm
                  nodeId={nodeId}
                  input={params}
                  variables={variables}
                  tabType={TabEnum.params}
                />
              ),
              [TabEnum.body]: <RenderJson nodeId={nodeId} variables={variables} input={jsonBody} />,
              [TabEnum.headers]: (
                <RenderForm
                  nodeId={nodeId}
                  input={headers}
                  variables={variables}
                  tabType={TabEnum.headers}
                />
              )
            }[selectedTab]}
        </Box>
      </Box>
    );
  }, [
    headersLength,
    nodeId,
    paramsLength,
    requestMethods,
    selectedTab,
    stringifyVariables,
    t,
    variableText
  ]);

  return Render;
}
const RenderForm = ({
  nodeId,
  input,
  variables,
  tabType
}: {
  nodeId: string;
  input: FlowNodeInputItemType;
  variables: EditorVariablePickerType[];
  tabType?: TabEnum;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { onChangeNode } = useFlowProviderStore();

  const [list, setList] = useState<PropsArrType[]>(input.value || []);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [shouldUpdateNode, setShouldUpdateNode] = useState(false);

  const leftVariables = useMemo(() => {
    return (tabType === TabEnum.headers ? HttpHeaders : variables).filter((variable) => {
      const existVariables = list.map((item) => item.key);
      return !existVariables.includes(variable.key);
    });
  }, [list, tabType, variables]);

  useEffect(() => {
    setList(input.value || []);
  }, [input.value]);

  useEffect(() => {
    if (shouldUpdateNode) {
      onChangeNode({
        nodeId,
        type: 'updateInput',
        key: input.key,
        value: {
          ...input,
          value: list
        }
      });
      setShouldUpdateNode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const handleKeyChange = (index: number, newKey: string) => {
    setList((prevList) => {
      if (!newKey) {
        setUpdateTrigger((prev) => !prev);
        toast({
          status: 'warning',
          title: t('core.module.http.Key cannot be empty')
        });
        return prevList;
      }
      const checkExist = prevList.find((item, i) => i !== index && item.key == newKey);
      if (checkExist) {
        setUpdateTrigger((prev) => !prev);
        toast({
          status: 'warning',
          title: t('core.module.http.Key already exists')
        });
        return prevList;
      }
      return prevList.map((item, i) => (i === index ? { ...item, key: newKey } : item));
    });
    setShouldUpdateNode(true);
  };

  const handleAddNewProps = (key: string, value: string = '') => {
    setList((prevList) => {
      if (!key) {
        return prevList;
      }

      const checkExist = prevList.find((item) => item.key === key);
      if (checkExist) {
        setUpdateTrigger((prev) => !prev);
        toast({
          status: 'warning',
          title: t('core.module.http.Key already exists')
        });
        return prevList;
      }
      return [...prevList, { key, type: 'string', value }];
    });

    setShouldUpdateNode(true);
  };

  return (
    <TableContainer overflowY={'visible'} overflowX={'unset'}>
      <Table>
        <Thead>
          <Tr>
            <Th px={2}>{t('core.module.http.Props name')}</Th>
            <Th px={2}>{t('core.module.http.Props value')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {list.map((item, index) => (
            <Tr key={`${input.key}${index}`}>
              <Td p={0} w={'150px'}>
                <HttpInput
                  hasVariablePlugin={false}
                  hasDropDownPlugin={tabType === TabEnum.headers}
                  setDropdownValue={(value) => {
                    handleKeyChange(index, value);
                    setUpdateTrigger((prev) => !prev);
                  }}
                  placeholder={t('core.module.http.Props name')}
                  value={item.key}
                  variables={leftVariables}
                  onBlur={(val) => {
                    handleKeyChange(index, val);
                  }}
                  updateTrigger={updateTrigger}
                />
              </Td>
              <Td p={0}>
                <Box display={'flex'} alignItems={'center'}>
                  <HttpInput
                    placeholder={t('core.module.http.Props value')}
                    value={item.value}
                    variables={variables}
                    onBlur={(val) => {
                      setList((prevList) =>
                        prevList.map((item, i) => (i === index ? { ...item, value: val } : item))
                      );
                      setShouldUpdateNode(true);
                    }}
                  />
                  <MyIcon
                    name={'delete'}
                    cursor={'pointer'}
                    _hover={{ color: 'red.600' }}
                    w={'14px'}
                    onClick={() => {
                      setList((prevlist) => prevlist.filter((val) => val.key !== item.key));
                      setShouldUpdateNode(true);
                    }}
                  />
                </Box>
              </Td>
            </Tr>
          ))}
          <Tr>
            <Td p={0} w={'150px'}>
              <HttpInput
                hasVariablePlugin={false}
                hasDropDownPlugin={tabType === TabEnum.headers}
                setDropdownValue={(val) => {
                  handleAddNewProps(val);
                  setUpdateTrigger((prev) => !prev);
                }}
                placeholder={t('core.module.http.Add props')}
                value={''}
                variables={leftVariables}
                updateTrigger={updateTrigger}
                onBlur={(val) => {
                  handleAddNewProps(val);
                  setUpdateTrigger((prev) => !prev);
                }}
              />
            </Td>
            <Td p={0}>
              <Box display={'flex'} alignItems={'center'}>
                <HttpInput />
              </Box>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
};
const RenderJson = ({
  nodeId,
  input,
  variables
}: {
  nodeId: string;
  input: FlowNodeInputItemType;
  variables: EditorVariablePickerType[];
}) => {
  const { t } = useTranslation();
  const { onChangeNode } = useFlowProviderStore();
  const [_, startSts] = useTransition();

  return (
    <Box mt={1}>
      <JSONEditor
        bg={'white'}
        defaultHeight={200}
        resize
        value={input.value}
        placeholder={t('core.module.template.http body placeholder')}
        onChange={(e) => {
          startSts(() => {
            onChangeNode({
              nodeId,
              type: 'updateInput',
              key: input.key,
              value: {
                ...input,
                value: e
              }
            });
          });
        }}
        variables={variables}
      />
    </Box>
  );
};
const RenderPropsItem = ({ text, num }: { text: string; num: number }) => {
  return (
    <Flex alignItems={'center'}>
      <Box>{text}</Box>
      {num > 0 && (
        <Box ml={1} borderRadius={'50%'} bg={'myGray.200'} px={2} py={'1px'}>
          {num}
        </Box>
      )}
    </Flex>
  );
};

const NodeHttp = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const { t } = useTranslation();
  const { nodeId, inputs, outputs } = data;
  const { splitToolInputs, hasToolNode } = useFlowProviderStore();
  const { toolInputs, commonInputs } = splitToolInputs(inputs, nodeId);

  const [createField, setCreateField] = useState<EditNodeFieldType>();
  const [editField, setEditField] = useState<EditNodeFieldType>();
  const defaultEditField = {
    key: '',
    label: '',
    valueType: WorkflowIOValueTypeEnum.string,
    description: ''
  };
  const createEditField: EditOutputFieldMapType = {
    key: true,
    valueType: true,
    description: true
  };
  const { onChangeNode } = useFlowProviderStore();

  const CustomComponents = useMemo(
    () => ({
      [NodeInputKeyEnum.httpMethod]: () => (
        <RenderHttpMethodAndUrl nodeId={nodeId} inputs={inputs} />
      ),
      [NodeInputKeyEnum.httpHeaders]: () => <RenderHttpProps nodeId={nodeId} inputs={inputs} />
    }),
    [inputs, nodeId]
  );

  return (
    <NodeCard minW={'350px'} selected={selected} {...data}>
      {hasToolNode && (
        <>
          <Container>
            <IOTitle text={t('core.module.tool.Tool input')} />
            <RenderToolInput nodeId={nodeId} inputs={toolInputs} canEdit />
          </Container>
        </>
      )}
      <>
        <Container>
          <IOTitle text={t('common.Input')} />
          <RenderInput
            nodeId={nodeId}
            flowInputList={commonInputs}
            CustomComponent={CustomComponents}
          />
        </Container>
      </>
      <>
        <Container>
          <IOTitle text={t('common.Output')} />
          <Flex className="nodrag" cursor={'default'} alignItems={'center'} position={'relative'}>
            <Box position={'relative'} fontWeight={'medium'}>
              {t('core.workflow.Custom outputs')}
            </Box>
            <Box flex={'1 0 0'} />
            <Button
              variant={'whitePrimary'}
              leftIcon={<SmallAddIcon />}
              iconSpacing={1}
              size={'sm'}
              mr={'-5px'}
              onClick={() => setCreateField(defaultEditField)}
            >
              {t('common.Add New')}
            </Button>
          </Flex>
          <Box
            mt={2}
            borderRadius={'md'}
            overflow={'hidden'}
            borderWidth={'1px'}
            borderBottom="none"
          >
            <TableContainer>
              <Table bg={'white'}>
                <Thead>
                  <Tr bg={'myGray.50'}>
                    <Th w={'18px !important'} p={0} />
                    <Th>{t('core.module.variable.variable name')}</Th>
                    <Th>{t('core.workflow.Value type')}</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {outputs
                    .filter((item) => item.label)
                    .map((item) => (
                      <Tr key={item.key}>
                        <Td textAlign={'center'} p={0} pl={3}>
                          <MyIcon name={'chatSend'} w={'14px'} color={'myGray.500'} />
                        </Td>
                        <Td>{item.label}</Td>
                        <Td>{item.valueType ? t(FlowValueTypeMap[item.valueType]?.label) : '-'}</Td>
                        <Td>
                          <MyIcon
                            mr={3}
                            name={'common/settingLight'}
                            w={'16px'}
                            cursor={'pointer'}
                            onClick={() => {
                              setEditField({
                                ...item,
                                valueType: item.valueType,
                                key: item.key,
                                description: item.description
                              });
                            }}
                          />
                          <MyIcon
                            className="delete"
                            name={'delete'}
                            w={'16px'}
                            color={'myGray.600'}
                            cursor={'pointer'}
                            ml={2}
                            _hover={{ color: 'red.500' }}
                            onClick={() => {
                              onChangeNode({
                                nodeId,
                                type: 'delOutput',
                                key: item.key
                              });
                            }}
                          />{' '}
                        </Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
          {!!createField && (
            <FieldEditModal
              editField={createEditField}
              defaultField={createField}
              keys={outputs.map((output) => output.key)}
              onClose={() => setCreateField(undefined)}
              onSubmit={({ data }) => {
                if (!data.key) {
                  return;
                }

                const newOutput: FlowNodeOutputItemType = {
                  id: getNanoid(),
                  key: data.key,
                  valueType: data.valueType,
                  label: data.key
                };
                onChangeNode({
                  nodeId,
                  type: 'addOutput',
                  value: newOutput
                });
                setCreateField(undefined);
              }}
            />
          )}
          {!!editField?.key && (
            <FieldEditModal
              editField={createEditField}
              defaultField={editField}
              keys={outputs.map((output) => output.key).filter((key) => key !== editField.key)}
              onClose={() => setEditField(undefined)}
              onSubmit={({ data, changeKey }) => {
                const output = outputs.find((output) => output.key === editField.key);
                if (!data.key || !editField.key) return;

                const newOutput: FlowNodeOutputItemType = {
                  ...(output as FlowNodeOutputItemType),
                  valueType: data.valueType,
                  key: data.key,
                  label: data.label,
                  description: data.description
                };

                if (changeKey) {
                  onChangeNode({
                    nodeId,
                    type: 'replaceOutput',
                    key: editField.key,
                    value: newOutput
                  });
                } else {
                  onChangeNode({
                    nodeId,
                    type: 'updateOutput',
                    key: newOutput.key,
                    value: newOutput
                  });
                }
                setEditField(undefined);
              }}
            />
          )}
        </Container>
      </>
    </NodeCard>
  );
};
export default React.memo(NodeHttp);