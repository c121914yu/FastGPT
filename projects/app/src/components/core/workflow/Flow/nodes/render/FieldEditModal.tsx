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
  Stack,
  Center
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useTranslation } from 'next-i18next';
import { FlowValueTypeMap } from '@/web/core/workflow/constants/dataType';
import { FlowNodeInputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import {
  EditInputFieldMapType,
  EditNodeFieldType
} from '@fastgpt/global/core/workflow/node/type.d';
import { useToast } from '@fastgpt/web/hooks/useToast';
import MySelect from '@fastgpt/web/components/common/MySelect';
import {
  DYNAMIC_INPUT_KEY,
  WorkflowIOValueTypeEnum
} from '@fastgpt/global/core/workflow/constants';
import JsonEditor from '@fastgpt/web/components/common/Textarea/JsonEditor';

const defaultValue: EditNodeFieldType = {
  inputType: FlowNodeInputTypeEnum.reference,
  valueType: WorkflowIOValueTypeEnum.string,
  key: '',
  label: '',
  description: '',
  isToolInput: false,
  defaultValue: '',
  maxLength: 0,
  max: 0,
  min: 0
};

const FieldEditModal = ({
  editField = {
    key: true
  },
  defaultField,
  keys = [],
  onClose,
  onSubmit
}: {
  editField?: EditInputFieldMapType;
  defaultField: EditNodeFieldType;
  keys: string[];
  onClose: () => void;
  onSubmit: (e: { data: EditNodeFieldType; changeKey: boolean }) => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const showDynamicInputSelect =
    !keys.includes(DYNAMIC_INPUT_KEY) || defaultField.key === DYNAMIC_INPUT_KEY;

  const inputTypeList = [
    {
      label: t('core.workflow.inputType.Reference'),
      value: FlowNodeInputTypeEnum.reference,
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      label: t('core.workflow.inputType.input'),
      value: FlowNodeInputTypeEnum.input,
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      label: t('core.workflow.inputType.textarea'),
      value: FlowNodeInputTypeEnum.textarea,
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      label: t('core.workflow.inputType.JSON Editor'),
      value: FlowNodeInputTypeEnum.JSONEditor,
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      label: t('core.workflow.inputType.number input'),
      value: FlowNodeInputTypeEnum.numberInput,
      valueType: WorkflowIOValueTypeEnum.number
    },
    {
      label: t('core.workflow.inputType.switch'),
      value: FlowNodeInputTypeEnum.switch,
      valueType: WorkflowIOValueTypeEnum.boolean
    },
    {
      label: t('core.workflow.inputType.selectApp'),
      value: FlowNodeInputTypeEnum.selectApp,
      valueType: WorkflowIOValueTypeEnum.selectApp
    },
    {
      label: t('core.workflow.inputType.selectLLMModel'),
      value: FlowNodeInputTypeEnum.selectLLMModel,
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      label: t('core.workflow.inputType.selectDataset'),
      value: FlowNodeInputTypeEnum.selectDataset,
      valueType: WorkflowIOValueTypeEnum.selectDataset
    },
    ...(showDynamicInputSelect
      ? [
          {
            label: t('core.workflow.inputType.dynamicTargetInput'),
            value: FlowNodeInputTypeEnum.addInputParam,
            valueType: WorkflowIOValueTypeEnum.any
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

  const { register, getValues, setValue, handleSubmit, watch } = useForm<EditNodeFieldType>({
    defaultValues: {
      ...defaultValue,
      ...defaultField,
      valueType: defaultField.valueType ?? WorkflowIOValueTypeEnum.string
    }
  });
  const inputType = watch('inputType');
  const isToolInput = watch('isToolInput');
  const maxLength = watch('maxLength');
  const max = watch('max');
  const min = watch('min');
  const [refresh, setRefresh] = useState(false);

  const showToolInput = useMemo(() => {
    return editField.isToolInput && inputType === FlowNodeInputTypeEnum.reference;
  }, [editField.isToolInput, inputType]);

  const showDataTypeSelect = useMemo(() => {
    if (!editField.valueType) return false;
    if (inputType === undefined) return true;
    if (inputType === FlowNodeInputTypeEnum.reference) return true;

    return false;
  }, [editField.valueType, inputType]);

  const showDefaultValue = useMemo(() => {
    if (inputType === FlowNodeInputTypeEnum.input) return true;
    if (inputType === FlowNodeInputTypeEnum.textarea) return true;
    if (inputType === FlowNodeInputTypeEnum.JSONEditor) return true;
    if (inputType === FlowNodeInputTypeEnum.numberInput) return true;
    if (inputType === FlowNodeInputTypeEnum.switch) return true;

    return false;
  }, [inputType]);

  const showMaxLenInput = useMemo(() => {
    if (inputType === FlowNodeInputTypeEnum.input) return true;
    if (inputType === FlowNodeInputTypeEnum.textarea) return true;

    return false;
  }, [inputType]);

  const showKeyInput = useMemo(() => {
    if (inputType === FlowNodeInputTypeEnum.addInputParam) return false;

    return editField.key;
  }, [editField.key, inputType]);

  const showInputTypeSelect = useMemo(() => {
    return editField.inputType;
  }, [editField.inputType]);

  const showOutputTypeSelect = useMemo(() => {
    return editField.valueType;
  }, [editField.valueType]);

  const showDescriptionInput = useMemo(() => {
    return editField.description;
  }, [editField.description]);

  const showMinMaxInput = useMemo(() => {
    if (inputType === FlowNodeInputTypeEnum.numberInput) return true;

    return false;
  }, [inputType]);

  const onSubmitSuccess = useCallback(
    (data: EditNodeFieldType) => {
      if (!data.key) return;

      data.label = data.key;
      data.key = data.key.trim();

      // create check key
      if (!defaultField.key && keys.includes(data.key)) {
        return toast({
          status: 'warning',
          title: t('core.module.edit.Field Already Exist')
        });
      }
      // edit check repeat key
      if (defaultField.key && defaultField.key !== data.key && keys.includes(data.key)) {
        return toast({
          status: 'warning',
          title: t('core.module.edit.Field Already Exist')
        });
      }
      if (showDataTypeSelect && !data.valueType) {
        return toast({
          status: 'warning',
          title: '数据类型不能为空'
        });
      }

      onSubmit({
        data,
        changeKey: !keys.includes(data.key)
      });
    },
    [defaultField.key, keys, onSubmit, showDataTypeSelect, t, toast]
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
      iconSrc="/imgs/workflow/extract.png"
      title={t('core.module.edit.Field Edit')}
      onClose={onClose}
      maxW={'1000px'}
    >
      <ModalBody overflow={'visible'}>
        <Flex gap={8}>
          <Stack w={!showInputTypeSelect ? 'full' : '300px'}>
            {showInputTypeSelect && (
              <Flex alignItems={'center'} mb={5}>
                <Box flex={'0 0 70px'}>{t('core.module.Input Type')}</Box>
                <Box flex={1}>
                  <MySelect
                    w={'full'}
                    list={inputTypeList}
                    value={getValues('inputType')}
                    onchange={(e: string) => {
                      const type = e as `${FlowNodeInputTypeEnum}`;
                      const selectedItem = inputTypeList.find((item) => item.value === type);
                      setValue('inputType', type);
                      setValue('valueType', selectedItem?.valueType);
                      setValue('isToolInput', false);

                      if (type === FlowNodeInputTypeEnum.addInputParam) {
                        setValue('required', false);
                      }

                      setRefresh(!refresh);
                    }}
                  />
                </Box>
              </Flex>
            )}
            {showOutputTypeSelect && (
              <Flex mb={5} alignItems={'center'}>
                <Box flex={'0 0 70px'}>{t('core.module.Output Type')}</Box>
                <Box flex={1}>
                  <MySelect
                    w={'full'}
                    list={dataTypeSelectList}
                    value={getValues('valueType')}
                    onchange={(e: string) => {
                      const type = e as `${WorkflowIOValueTypeEnum}`;
                      setValue('valueType', type);

                      setRefresh(!refresh);
                    }}
                  />
                </Box>
              </Flex>
            )}
            {showKeyInput && (
              <Flex mb={5} alignItems={'center'}>
                <Box flex={'0 0 70px'}>{t('core.module.Field Name')}</Box>
                <Input
                  bg={'myGray.50'}
                  placeholder="appointment/sql"
                  {...register('key', {
                    required: true
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
                  placeholder={
                    isToolInput ? t('core.module.Plugin tool Description') : t('common.choosable')
                  }
                  rows={5}
                  {...register('description', { required: isToolInput ? true : false })}
                />
              </Box>
            )}
          </Stack>
          {!showInputTypeSelect ? null : showToolInput ||
            showDataTypeSelect ||
            showDefaultValue ||
            showMaxLenInput ||
            showMinMaxInput ? (
            <Stack w={'300px'}>
              {showToolInput && (
                <Flex alignItems={'center'} mb={5}>
                  <Box flex={'0 0 70px'}>工具参数</Box>
                  <Switch {...register('isToolInput')} />
                </Flex>
              )}
              {showDataTypeSelect && (
                <Flex mb={5} alignItems={'center'}>
                  <Box flex={'0 0 70px'}>{t('core.module.Data Type')}</Box>
                  <Box flex={1}>
                    <MySelect
                      w={'full'}
                      list={dataTypeSelectList}
                      value={getValues('valueType')}
                      onchange={(e: string) => {
                        const type = e as `${WorkflowIOValueTypeEnum}`;
                        setValue('valueType', type);

                        setRefresh(!refresh);
                      }}
                    />
                  </Box>
                </Flex>
              )}
              {showDefaultValue && (
                <Flex mb={5} alignItems={'center'}>
                  <Box flex={'0 0 70px'}>{t('core.module.Default Value')}</Box>
                  {inputType === FlowNodeInputTypeEnum.numberInput && (
                    <Input
                      bg={'myGray.50'}
                      max={max}
                      min={min}
                      type={'number'}
                      {...register('defaultValue')}
                    />
                  )}
                  {inputType === FlowNodeInputTypeEnum.input && (
                    <Input bg={'myGray.50'} maxLength={maxLength} {...register('defaultValue')} />
                  )}
                  {inputType === FlowNodeInputTypeEnum.textarea && (
                    <Textarea
                      bg={'myGray.50'}
                      maxLength={maxLength}
                      {...register('defaultValue')}
                    />
                  )}
                  {inputType === FlowNodeInputTypeEnum.JSONEditor && (
                    <JsonEditor
                      resize
                      w={'full'}
                      onChange={(e) => {
                        setValue('defaultValue', e);
                      }}
                      defaultValue={getValues('defaultValue')}
                    />
                  )}
                  {inputType === FlowNodeInputTypeEnum.switch && (
                    <Switch {...register('defaultValue')} />
                  )}
                </Flex>
              )}
              {showMaxLenInput && (
                <Flex mb={5} alignItems={'center'}>
                  <Box flex={'0 0 70px'}>{t('core.module.Max Length')}</Box>
                  <Input
                    bg={'myGray.50'}
                    placeholder={t('core.module.Max Length placeholder')}
                    {...register('maxLength')}
                  />
                </Flex>
              )}
              {showMinMaxInput && (
                <Box>
                  <Flex mb={5} alignItems={'center'}>
                    <Box flex={'0 0 70px'}>{t('core.module.Max Value')}</Box>
                    <Input bg={'myGray.50'} type={'number'} {...register('max')} />
                  </Flex>
                  <Flex mb={5} alignItems={'center'}>
                    <Box flex={'0 0 70px'}>{t('core.module.Min Value')}</Box>
                    <Input bg={'myGray.50'} type={'number'} {...register('min')} />
                  </Flex>
                </Box>
              )}
            </Stack>
          ) : (
            <Stack w={'300px'}>
              <Center w={'full'} h={'full'}>
                <Box color={'myGray.600'}>{t('core.module.No Config Tips')}</Box>
              </Center>
            </Stack>
          )}
        </Flex>
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
