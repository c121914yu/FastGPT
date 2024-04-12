import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  ModalFooter,
  ModalBody,
  Flex,
  Switch,
  Input,
  Textarea,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Image,
  Stack
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import MyModal from '@fastgpt/web/components/common/MyModal';
import {
  DYNAMIC_INPUT_KEY,
  ModuleIOValueTypeEnum,
  PluginInputTypeEnum
} from '@fastgpt/global/core/module/constants';
import { useTranslation } from 'next-i18next';
import { FlowValueTypeMap } from '@/web/core/workflow/constants/dataType';
import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum
} from '@fastgpt/global/core/module/node/constant';
import { EditInputFieldMap, EditNodeFieldType } from '@fastgpt/global/core/module/node/type.d';
import { useToast } from '@fastgpt/web/hooks/useToast';
import MySelect from '@fastgpt/web/components/common/MySelect';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useSystemStore } from '@/web/common/system/useSystemStore';

const FieldEditModal = ({
  editField = {
    key: true,
    name: true,
    description: true,
    dataType: true
  },
  defaultField,
  keys = [],
  onClose,
  onSubmit
}: {
  editField?: EditInputFieldMap;
  defaultField: EditNodeFieldType;
  keys: string[];
  onClose: () => void;
  onSubmit: (e: { data: EditNodeFieldType; changeKey: boolean }) => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isCreate = useMemo(() => !defaultField.key, [defaultField.key]);
  const showDynamicInputSelect =
    !keys.includes(DYNAMIC_INPUT_KEY) || defaultField.key === DYNAMIC_INPUT_KEY;
  const { llmModelList } = useSystemStore();
  const [selectedModelList, setSelectedModelList] = useState<any[]>(
    defaultField.selectedModelList || []
  );

  const inputTypeList = [
    {
      label: t('core.module.inputType.target'),
      value: FlowNodeInputTypeEnum.target,
      valueType: ModuleIOValueTypeEnum.string
    },
    {
      label: t('core.module.inputType.input'),
      value: FlowNodeInputTypeEnum.input,
      valueType: ModuleIOValueTypeEnum.string
    },
    ...(showDynamicInputSelect
      ? [
          {
            label: t('core.module.inputType.dynamicTargetInput'),
            value: FlowNodeInputTypeEnum.addInputParam,
            valueType: ModuleIOValueTypeEnum.any
          }
        ]
      : [])
  ];

  const dataTypeSelectList = Object.values(FlowValueTypeMap)
    .slice(0, -2)
    .map((item) => ({
      label: t(item.label),
      value: item.value
    }));

  const inputDataTypeList = [
    {
      label: t('core.module.inputDataType.input'),
      value: PluginInputTypeEnum.input,
      valueType: ModuleIOValueTypeEnum.string
    },
    {
      label: t('core.module.inputDataType.textarea'),
      value: PluginInputTypeEnum.textarea,
      valueType: ModuleIOValueTypeEnum.string
    },
    {
      label: t('core.module.inputDataType.jsonInput'),
      value: PluginInputTypeEnum.JSONEditor,
      valueType: ModuleIOValueTypeEnum.string
    },
    {
      label: t('core.module.inputDataType.radio'),
      value: PluginInputTypeEnum.select,
      valueType: ModuleIOValueTypeEnum.string
    },
    {
      label: t('core.module.inputDataType.selectDataset'),
      value: PluginInputTypeEnum.selectDataset,
      valueType: ModuleIOValueTypeEnum.selectDataset
    },
    {
      label: t('core.module.inputDataType.selectLLMModel'),
      value: PluginInputTypeEnum.selectLLMModel,
      valueType: ModuleIOValueTypeEnum.string
    },
    {
      label: t('core.module.inputDataType.switch'),
      value: PluginInputTypeEnum.switch,
      valueType: ModuleIOValueTypeEnum.boolean
    }
  ];

  const { register, getValues, setValue, handleSubmit, watch } = useForm<EditNodeFieldType>({
    defaultValues: defaultField
  });
  const inputType = watch('inputType');
  const outputType = watch('outputType');
  const inputDataType = watch('inputDataType');
  const required = watch('required');
  const [refresh, setRefresh] = useState(false);

  const showToolInput = useMemo(() => {
    return editField.isToolInput && inputType === FlowNodeInputTypeEnum.target;
  }, [editField.isToolInput, inputType]);

  const showDataTypeSelect = useMemo(() => {
    if (!editField.dataType) return false;
    if (inputType === undefined) return true;
    if (inputType === FlowNodeInputTypeEnum.target) return true;
    if (outputType === FlowNodeOutputTypeEnum.source) return true;

    return false;
  }, [editField.dataType, inputType, outputType]);

  const showInputDataTypeSelect = useMemo(() => {
    if (inputType === FlowNodeInputTypeEnum.input) return true;

    return false;
  }, [inputType]);

  const showMaxLenInput = useMemo(() => {
    if (inputType !== FlowNodeInputTypeEnum.input) return false;
    if (inputDataType === PluginInputTypeEnum.input) return true;
    if (inputDataType === PluginInputTypeEnum.textarea) return true;

    return false;
  }, [inputDataType, inputType]);

  const showSelectDataList = useMemo(() => {
    if (inputDataType === PluginInputTypeEnum.select) return true;

    return false;
  }, [inputDataType]);

  const showModelList = useMemo(() => {
    if (inputDataType === PluginInputTypeEnum.selectLLMModel) return true;

    return false;
  }, [inputDataType]);

  const showRequired = useMemo(() => {
    if (inputType === FlowNodeInputTypeEnum.addInputParam) return false;

    return editField.required || editField.defaultValue;
  }, [editField.defaultValue, editField.required, inputType]);

  const showNameInput = useMemo(() => {
    return editField.name;
  }, [editField.name]);

  const showKeyInput = useMemo(() => {
    if (inputType === FlowNodeInputTypeEnum.addInputParam) return false;

    return editField.key;
  }, [editField.key, inputType]);

  const showDescriptionInput = useMemo(() => {
    return editField.description;
  }, [editField.description]);

  const [list, setList] = useState<Array<{ label: string; value: string }>>(
    defaultField.list || []
  );
  const [emptyInput, setEmptyInput] = useState({ label: '', value: '' });
  const addNewListItem = (label: string, value: string = '') => {
    if (!label) return;
    setEmptyInput({ label: '', value: '' });
    const checkExist = list.find((item) => item.label === label);
    if (checkExist) {
      return toast({
        status: 'warning',
        title: t('core.module.edit.Field Already Exist')
      });
    }
    setList([...list, { label, value }]);
    setValue('list', [...list, { label, value }]);
  };

  const onSubmitSuccess = useCallback(
    (data: EditNodeFieldType) => {
      if (!data.key) return;
      if (isCreate && keys.includes(data.key)) {
        return toast({
          status: 'warning',
          title: t('core.module.edit.Field Already Exist')
        });
      }
      onSubmit({
        data,
        changeKey: !keys.includes(data.key)
      });
    },
    [isCreate, keys, onSubmit, t, toast]
  );
  const onSubmitError = useCallback(
    (e: Object) => {
      for (const item of Object.values(e)) {
        if (item.message) {
          toast({
            status: 'warning',
            title: item.message
          });
          break;
        }
      }
    },
    [toast]
  );

  return (
    <MyModal
      isOpen={true}
      iconSrc="/imgs/module/extract.png"
      title={t('core.module.edit.Field Edit')}
      onClose={onClose}
    >
      <ModalBody overflow={'visible'}>
        {/* input type select: target, input, textarea.... */}
        {editField.inputType && (
          <Flex alignItems={'center'} mb={5}>
            <Box flex={'0 0 70px'}>{t('core.module.Input Type')}</Box>
            <MySelect
              w={'288px'}
              list={inputTypeList}
              value={getValues('inputType')}
              onchange={(e: string) => {
                const type = e as `${FlowNodeInputTypeEnum}`;
                const selectedItem = inputTypeList.find((item) => item.value === type);
                setValue('inputType', type);
                setValue('valueType', selectedItem?.valueType);

                if (type === FlowNodeInputTypeEnum.selectDataset) {
                  setValue('label', selectedItem?.label);
                } else if (type === FlowNodeInputTypeEnum.addInputParam) {
                  setValue('label', t('core.module.valueType.dynamicTargetInput'));
                  setValue('key', DYNAMIC_INPUT_KEY);
                  setValue('required', false);
                }

                setRefresh(!refresh);
              }}
            />
          </Flex>
        )}
        {showRequired && (
          <Flex alignItems={'center'} mb={5}>
            <Box flex={'0 0 70px'}>{t('common.Require Input')}</Box>
            <Switch
              {...register('required', {
                onChange(e) {
                  if (!e.target.checked) {
                    setValue('defaultValue', '');
                  }
                }
              })}
            />
          </Flex>
        )}
        {showRequired && required && editField.defaultValue && (
          <Flex alignItems={'center'} mb={5}>
            <Box flex={['0 0 70px']}>{t('core.module.Default value')}</Box>
            <Input
              bg={'myGray.50'}
              placeholder={t('core.module.Default value placeholder')}
              {...register('defaultValue')}
            />
          </Flex>
        )}
        {showToolInput && (
          <Flex alignItems={'center'} mb={5}>
            <Box flex={'0 0 70px'}>工具参数</Box>
            <Switch {...register('isToolInput')} />
          </Flex>
        )}
        {showDataTypeSelect && (
          <Flex mb={5} alignItems={'center'}>
            <Box flex={'0 0 70px'}>{t('core.module.Data Type')}</Box>
            <MySelect
              w={'288px'}
              list={dataTypeSelectList}
              value={getValues('valueType')}
              onchange={(e: string) => {
                const type = e as `${ModuleIOValueTypeEnum}`;
                setValue('valueType', type);

                if (
                  type === ModuleIOValueTypeEnum.chatHistory ||
                  type === ModuleIOValueTypeEnum.datasetQuote
                ) {
                  const label = dataTypeSelectList.find((item) => item.value === type)?.label;
                  setValue('label', label);
                }

                setRefresh(!refresh);
              }}
            />
          </Flex>
        )}
        {showInputDataTypeSelect && (
          <Flex mb={5} alignItems={'center'}>
            <Box flex={'0 0 70px'}>{t('core.module.Data Type')}</Box>
            <MySelect
              w={'288px'}
              list={inputDataTypeList}
              value={getValues('inputDataType')}
              onchange={(e: string) => {
                const type = e as `${PluginInputTypeEnum}`;
                const selectedItem = inputDataTypeList.find((item) => item.value === type);

                setValue('inputDataType', type);
                setValue('valueType', selectedItem?.valueType);
                setRefresh(!refresh);
              }}
            />
          </Flex>
        )}
        {showMaxLenInput && (
          <Flex mb={5} alignItems={'center'}>
            <Box flex={'0 0 70px'}>{t('core.module.Max Length')}</Box>
            <Input
              bg={'myGray.50'}
              placeholder={t('core.module.Max Length placeholder')}
              {...register('maxLen')}
            />
          </Flex>
        )}
        {showSelectDataList && (
          <Flex mb={5} alignItems={'center'}>
            <Box flex={'0 0 70px'}>{t('core.module.Select Data List')}</Box>
            <TableContainer w={'full'}>
              <Table>
                <Thead>
                  <Tr>
                    <Th p={2}>label</Th>
                    <Th p={2}>value</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {list.map((item, index) => (
                    <Tr key={item.label}>
                      <Td p={0} pl={2}>
                        <Input
                          variant={'unstyled'}
                          defaultValue={item.label}
                          onBlur={(e) => {
                            const value = e.target.value;
                            setList((prevList) => {
                              const newList = [...prevList];
                              newList[index] = { ...newList[index], label: value };
                              return newList;
                            });
                            setValue(
                              'list',
                              list?.map((item, i) =>
                                i === index ? { ...item, label: value } : item
                              )
                            );
                          }}
                        />
                      </Td>
                      <Td p={0} pl={2}>
                        <Box display={'flex'} alignItems={'center'}>
                          <Input
                            variant={'unstyled'}
                            defaultValue={item.value}
                            onBlur={(e) => {
                              const value = e.target.value;
                              setList((prevList) => {
                                const newList = [...prevList];
                                newList[index] = { ...newList[index], value: value };
                                return newList;
                              });
                              setValue(
                                'list',
                                list?.map((item, i) =>
                                  i === index ? { ...item, value: value } : item
                                )
                              );
                            }}
                          />
                          <MyIcon
                            name={'delete'}
                            cursor={'pointer'}
                            _hover={{ color: 'red.600' }}
                            w={'14px'}
                            onClick={() => {
                              setList((prevList) => prevList.filter((_, i) => i !== index));
                              setValue(
                                'list',
                                list.filter((_, i) => i !== index)
                              );
                            }}
                          />
                        </Box>
                      </Td>
                    </Tr>
                  ))}
                  <Tr>
                    <Td p={0} pl={2}>
                      <Input
                        variant={'unstyled'}
                        value={emptyInput.label}
                        onChange={(e) => setEmptyInput({ ...emptyInput, label: e.target.value })}
                        onBlur={(e) => addNewListItem(e.target.value)}
                      />
                    </Td>
                    <Td p={0} pl={2}>
                      <Input
                        variant={'unstyled'}
                        value={emptyInput.value}
                        onChange={(e) => setEmptyInput({ ...emptyInput, value: e.target.value })}
                        onBlur={(e) => addNewListItem(emptyInput.label, e.target.value)}
                      />
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </Flex>
        )}
        {showModelList && (
          <Flex mb={5} alignItems={'center'}>
            <Box flex={'0 0 70px'}>{t('core.module.Model List')}</Box>
            <Stack maxH={'200px'} overflow={'auto'} w={'full'}>
              {llmModelList.map((item, index) => (
                <Flex
                  key={index}
                  border={
                    selectedModelList.find((i) => i.model === item.model)
                      ? '1px solid #9bb4f9'
                      : '1px solid #e2e8f0'
                  }
                  bg={selectedModelList.find((i) => i.model === item.model) && 'primary.100'}
                  color={selectedModelList.find((i) => i.model === item.model) && '#436ff6'}
                  borderRadius={'md'}
                  _hover={{ bg: 'primary.100', border: '1px solid #9bb4f9', color: '#436ff6' }}
                  p={2}
                  cursor={'pointer'}
                  onClick={() => {
                    setSelectedModelList((prev) => {
                      const checkExist = prev.find((i) => i.model === item.model);
                      if (checkExist) {
                        return prev.filter((i) => i.model !== item.model);
                      }
                      return [...prev, item];
                    });
                    setValue(
                      'selectedModelList',
                      selectedModelList.find((i) => i.model === item.model)
                        ? selectedModelList.filter((i) => i.model !== item.model)
                        : [...selectedModelList, item]
                    );
                  }}
                >
                  <Box mr={2}>
                    <Image w={6} alt={item.name} src={item.avatar} />
                  </Box>
                  <Box>{item.name}</Box>
                </Flex>
              ))}
            </Stack>
          </Flex>
        )}
        {showNameInput && (
          <Flex mb={5} alignItems={'center'}>
            <Box flex={'0 0 70px'}>{t('core.module.Field Name')}</Box>
            <Input
              bg={'myGray.50'}
              placeholder="预约字段/sql语句……"
              {...register('label', { required: true })}
            />
          </Flex>
        )}
        {showKeyInput && (
          <Flex mb={5} alignItems={'center'}>
            <Box flex={'0 0 70px'}>{t('core.module.Field key')}</Box>
            <Input
              bg={'myGray.50'}
              placeholder="appointment/sql"
              {...register('key', {
                required: true,
                validate: (value) =>
                  inputDataType === PluginInputTypeEnum.switch && value === 'switch'
                    ? "Key cannot be named 'switch'"
                    : true,
                onChange: (e) => {
                  const value = e.target.value;
                  // auto fill label
                  if (!showNameInput) {
                    setValue('label', value);
                  }
                }
              })}
            />
          </Flex>
        )}
        {showDescriptionInput && (
          <Box mb={5} alignItems={'flex-start'}>
            <Box flex={'0 0 70px'} mb={'1px'}>
              {t('core.module.Field Description')}
            </Box>
            <Textarea
              bg={'myGray.50'}
              placeholder={t('common.choosable')}
              rows={5}
              {...register('description')}
            />
          </Box>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant={'whiteBase'} mr={3} onClick={onClose}>
          {t('common.Close')}
        </Button>
        <Button onClick={handleSubmit(onSubmitSuccess, onSubmitError)}>
          {t('common.Confirm')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default React.memo(FieldEditModal);
