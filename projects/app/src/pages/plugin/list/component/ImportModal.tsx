import React, { useCallback, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  ModalBody,
  Input,
  Textarea,
  TableContainer,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  IconButton
} from '@chakra-ui/react';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { useForm } from 'react-hook-form';
import { compressImgFileAndUpload } from '@/web/common/file/controller';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useRequest } from '@/web/common/hooks/useRequest';
import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';
import MyModal from '@/components/MyModal';
import { useTranslation } from 'next-i18next';
import { CreateOnePluginParams, MethodType } from '@fastgpt/global/core/plugin/controller';
import { customAlphabet } from 'nanoid';
import { MongoImageTypeEnum } from '@fastgpt/global/common/file/image/constants';
import { PluginTypeEnum } from '@fastgpt/global/core/plugin/constants';
import yaml from 'js-yaml';
import {
  delOnePlugin,
  postCreatePlugin,
  postImportPlugin,
  putUpdatePlugin
} from '@/web/core/plugin/api';
import getModules from './getModules';
import AuthMethodModal from './AuthMethodModal';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useConfirm } from '@/web/common/hooks/useConfirm';
import { FormType, defaultForm } from './EditModal';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 12);
const PreviewPlugin = dynamic(() => import('../../edit/Preview'));

type PathDataType = {
  name: string;
  description: string;
  method: string;
  path: string;
  params: any[];
};

type ApiData = {
  pathData: PathDataType[];
  serverPath: string;
};

export const defaultHttpPlugin: CreateOnePluginParams = {
  avatar: '/imgs/files/folder.svg',
  name: '',
  intro: '',
  parentId: null,
  type: PluginTypeEnum.folder,
  schema: null,
  authMethod: null
};

const ImportModal = ({
  defaultPlugin = defaultHttpPlugin,
  onClose,
  onSuccess,
  onDelete
}: {
  defaultPlugin?: FormType;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isPc } = useSystemStore();
  const [refresh, setRefresh] = useState(false);
  const [apiData, setApiData] = useState<ApiData>(() => {
    try {
      return handleOpenAPI(defaultPlugin.schema || '') as ApiData;
    } catch (err) {
      return { pathData: [], serverPath: '' };
    }
  });
  const [authMethod, setAuthMethod] = useState<MethodType>(
    defaultPlugin.authMethod || {
      name: t('plugin.None'),
      prefix: 'Basic',
      key: 'Authorization',
      value: ''
    }
  );
  const [isOpen, setIsOpen] = useState(false);
  const isEdit = !!defaultPlugin.id;

  const { mutate: createPlugins, isLoading: creating } = useRequest({
    mutationFn: async (data: CreateOnePluginParams) => {
      return postCreatePlugin(data);
    },
    onSuccess(id: string) {
      if (!apiData?.pathData) {
        onClose();
        onSuccess();
        return;
      }
      const pluginData = getPluginsData({ id, apiData, authMethod });
      importPlugins({ pluginData, parentId: id });
    },
    successToast: apiData?.pathData ? '' : t('common.Create Success'),
    errorToast: t('common.Create Failed')
  });

  const { mutate: importPlugins, isLoading: importing } = useRequest({
    mutationFn: async (data: CreateOnePluginParams[]) => {
      return postImportPlugin(data);
    },
    onSuccess() {
      onSuccess();
      onClose();
    },
    successToast: isEdit ? t('common.Update Success') : t('common.Create Success'),
    errorToast: isEdit ? t('common.Update Failed') : t('common.Create Failed')
  });

  const { mutate: updatePlugins, isLoading: updating } = useRequest({
    mutationFn: async (data: FormType) => {
      if (!data.id) return Promise.resolve('');
      // @ts-ignore
      return putUpdatePlugin(data);
    },
    onSuccess() {
      if (!apiData?.pathData) {
        onClose();
        onSuccess();
      }
    },
    successToast: apiData?.pathData ? '' : t('common.Update Success'),
    errorToast: t('common.Update Failed')
  });

  const { openConfirm, ConfirmModal } = useConfirm({
    title: t('common.Delete Tip'),
    content: t('plugin.Confirm Delete')
  });

  const { register, setValue, getValues, handleSubmit } = useForm<CreateOnePluginParams>({
    defaultValues: defaultPlugin
  });

  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: 'image/*',
    multiple: false
  });

  const onSelectFile = useCallback(
    async (e: File[]) => {
      const file = e[0];
      if (!file) return;
      try {
        const src = await compressImgFileAndUpload({
          type: MongoImageTypeEnum.pluginAvatar,
          file,
          maxW: 300,
          maxH: 300
        });
        setValue('avatar', src);
        setRefresh((state) => !state);
      } catch (err: any) {
        toast({
          title: getErrText(err, t('common.Select File Failed')),
          status: 'warning'
        });
      }
    },
    [setValue, t, toast]
  );

  const onclickDelApp = useCallback(async () => {
    if (!defaultPlugin.id) return;
    try {
      await delOnePlugin(defaultPlugin.id);
      toast({
        title: t('common.Delete Success'),
        status: 'success'
      });
      onDelete();
    } catch (err: any) {
      toast({
        title: getErrText(err, t('common.Delete Failed')),
        status: 'error'
      });
    }
    onClose();
  }, [defaultPlugin.id, onClose, toast, t, onDelete]);

  return (
    <MyModal
      isOpen
      onClose={onClose}
      iconSrc="/imgs/modal/edit.svg"
      title={isEdit ? t('plugin.Edit Http Plugin') : t('plugin.Import Plugin')}
      isCentered={!isPc}
      w={['90vw', '600px']}
    >
      <ModalBody>
        <Box color={'myGray.800'} fontWeight={'bold'}>
          {t('plugin.Set Name')}
        </Box>
        <Flex mt={3} alignItems={'center'}>
          <MyTooltip label={t('common.Set Avatar')}>
            <Avatar
              flexShrink={0}
              src={getValues('avatar')}
              w={['28px', '32px']}
              h={['28px', '32px']}
              cursor={'pointer'}
              borderRadius={'md'}
              onClick={onOpenSelectFile}
            />
          </MyTooltip>
          <Input
            flex={1}
            ml={4}
            bg={'myWhite.600'}
            {...register('name', {
              required: t("common.Name Can't Be Empty")
            })}
          />
        </Flex>
        <Box color={'myGray.800'} fontWeight={'bold'} mt={3}>
          {t('plugin.Intro')}
        </Box>
        <Textarea {...register('intro')} bg={'myWhite.600'} rows={2} mt={3} />
        <Box color={'myGray.800'} fontWeight={'bold'} mt={3}>
          {'Schema'}
        </Box>
        <Textarea
          {...register('schema')}
          bg={'myWhite.600'}
          rows={10}
          mt={3}
          onChange={debounce((e) => {
            const content = e.target.value;
            try {
              const pathData = handleOpenAPI(content);
              setApiData(pathData as ApiData);
            } catch (err) {
              toast({
                title: t('plugin.Invalid Schema'),
                status: 'warning'
              });
            }
          }, 500)}
        />
        <Box color={'myGray.800'} fontWeight={'bold'} mt={3}>
          {t('plugin.Plugin List')}
        </Box>
        <TableContainer maxH={400} overflowY={'auto'} mt={3}>
          <Table border={'1px solid'} borderColor={'myGray.200'}>
            <Thead>
              <Th>{t('Name')}</Th>
              <Th>{t('plugin.Description')}</Th>
              <Th>{t('plugin.Method')}</Th>
              <Th>{t('plugin.Path')}</Th>
            </Thead>
            <Tbody>
              {apiData?.pathData?.map((item, index) => (
                <Tr key={index}>
                  <Td>{item.name}</Td>
                  <Td>{item.description}</Td>
                  <Td>{item.method}</Td>
                  <Td>{item.path}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Box color={'myGray.800'} fontWeight={'bold'} mt={3}>
          {t('plugin.Auth Method')}
        </Box>
        <Box
          bg={'myWhite.600'}
          h={'40px'}
          borderRadius={'md'}
          mt={3}
          fontSize={'sm'}
          color={'myGray.800'}
          border={'1px solid'}
          borderColor={'myGray.200'}
          cursor={'pointer'}
          onClick={() => {
            setIsOpen(true);
          }}
          display={'flex'}
          alignItems={'center'}
          pl={6}
        >
          {authMethod.name}
        </Box>
      </ModalBody>

      <Flex px={5} py={4} alignItems={'center'}>
        {isEdit && (
          <IconButton
            className="delete"
            size={'xsSquare'}
            icon={<MyIcon name={'delete'} w={'14px'} />}
            variant={'whiteDanger'}
            aria-label={'delete'}
            _hover={{
              bg: 'red.100'
            }}
            onClick={(e) => {
              e.stopPropagation();
              openConfirm(onclickDelApp)();
            }}
          />
        )}
        <Box flex={1} />
        <Button variant={'whiteBase'} mr={3} onClick={onClose}>
          {t('common.Close')}
        </Button>
        {!isEdit ? (
          <Button
            onClick={handleSubmit((data) => {
              createPlugins({
                ...defaultForm,
                type: PluginTypeEnum.folder,
                name: data.name,
                intro: data.intro,
                avatar: data.avatar,
                authMethod,
                schema: data.schema
              });
            })}
            isLoading={creating || importing}
          >
            {t('common.Confirm Create')}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit((data) => {
              const id = defaultPlugin.id as string;
              updatePlugins({ ...data, authMethod });
              const pluginData = getPluginsData({ id, apiData, authMethod });
              importPlugins({ pluginData, parentId: id });
            })}
            isLoading={creating || importing}
          >
            {t('common.Confirm Update')}
          </Button>
        )}
      </Flex>

      <File onSelect={onSelectFile} />
      {isOpen && (
        <AuthMethodModal
          onClose={() => {
            setIsOpen(false);
          }}
          setAuthMethod={setAuthMethod}
          authMethod={authMethod}
        />
      )}
      <ConfirmModal />
    </MyModal>
  );
};

export default ImportModal;

const handleOpenAPI = (content: string) => {
  if (!content) return { pathData: [], serverPath: '' };
  try {
    let data: any = {};
    try {
      data = JSON.parse(content);
    } catch (jsonError) {
      try {
        data = yaml.load(content, { schema: yaml.FAILSAFE_SCHEMA });
      } catch (yamlError) {
        console.error(yamlError);
        throw new Error();
      }
    }

    const serverPath = data.servers?.[0].url;
    const pathData = Object.keys(data.paths)
      .map((path) => {
        const methodData = data.paths[path];
        return Object.keys(methodData).map((method) => {
          const methodInfo = methodData[method];
          if (methodInfo.deprecated) return false;
          const result = {
            path,
            method,
            name: methodInfo.operationId,
            description: methodInfo.description,
            params: methodInfo.parameters
          };
          return result;
        });
      })
      .flat()
      .filter(Boolean);

    return { pathData, serverPath };
  } catch (err) {
    console.log(
      '%cprojects/app/src/pages/plugin/list/component/ImportModal.tsx:383 err',
      'color: #007acc;',
      err
    );
    throw new Error('Invalid Schema');
  }
};

const getModulesData = ({
  item,
  authMethod,
  apiData
}: {
  item: PathDataType;
  authMethod: MethodType;
  apiData: ApiData;
}) => {
  const inputId = nanoid();
  const outputId = nanoid();
  const httpId = nanoid();

  const inputInputs =
    item.params?.map((param: any) => {
      return {
        key: param.name,
        valueType: param.schema.type,
        label: param.name,
        type: 'target',
        required: param.required,
        description: param.description,
        edit: true,
        editField: {
          key: true,
          name: true,
          description: true,
          required: true,
          dataType: true,
          inputType: true,
          isToolInput: true
        },
        connected: true
      };
    }) || [];

  const inputOutputs =
    item.params?.map((param: any) => {
      return {
        key: param.name,
        valueType: param.schema.type,
        label: param.name,
        type: 'source',
        edit: true,
        targets: [
          {
            moduleId: httpId,
            key: param.name
          }
        ]
      };
    }) || [];

  const httpInputs =
    item.params?.map((param: any) => {
      return {
        key: param.name,
        valueType: param.schema.type,
        label: param.name,
        type: 'target',
        description: param.description,
        edit: true,
        editField: {
          key: true,
          description: true,
          dataType: true
        },
        connected: true
      };
    }) || [];

  const headers = [];
  let body = '{}';
  const params = [];

  if (item.params && item.params.length > 0) {
    for (const param of item.params) {
      if (param.in === 'header') {
        headers.push({
          key: param.name,
          type: param.schema.type,
          value: `{{${param.name}}}`
        });
      } else if (param.in === 'body') {
        body = JSON.stringify({ ...JSON.parse(body), [param.name]: `{{${param.name}}}` }, null, 2);
      } else if (param.in === 'query') {
        params.push({
          key: param.name,
          type: param.schema.type,
          value: `{{${param.name}}}`
        });
      }
    }
  }

  if (authMethod.name === 'API Key') {
    headers.push({
      key: authMethod.key,
      type: 'string',
      value: `${authMethod.prefix} ${authMethod.value}`
    });
  }

  return getModules({
    inputId,
    outputId,
    httpId,
    item,
    inputInputs,
    inputOutputs,
    method: item.method.toUpperCase(),
    path: apiData.serverPath + item.path,
    headers,
    body,
    params,
    httpInputs
  });
};

const getPluginsData = ({
  id,
  apiData,
  authMethod
}: {
  id: string;
  apiData: ApiData;
  authMethod: MethodType;
}) => {
  return apiData.pathData.map((item) => {
    const modules = getModulesData({ item, authMethod, apiData });

    return {
      avatar: '/icon/logo.svg',
      name: item.name,
      intro: item.description,
      parentId: id,
      type: PluginTypeEnum.plugin,
      schema: null,
      authMethod: null,
      modules
    };
  });
};
