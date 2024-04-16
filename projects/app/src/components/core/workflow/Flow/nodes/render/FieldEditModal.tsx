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
  Stack
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
  const isCreate = useMemo(() => !defaultField.key, [defaultField.key]);
  const showDynamicInputSelect =
    !keys.includes(DYNAMIC_INPUT_KEY) || defaultField.key === DYNAMIC_INPUT_KEY;

  const inputTypeList = [
    {
      label: t('core.workflow.inputType.Reference'),
      value: FlowNodeInputTypeEnum.reference,
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      label: t('core.module.inputType.input'),
      value: FlowNodeInputTypeEnum.input,
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      label: t('core.module.inputType.textarea'),
      value: FlowNodeInputTypeEnum.textarea,
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      label: t('core.module.inputType.JSON Editor'),
      value: FlowNodeInputTypeEnum.JSONEditor,
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      label: t('core.module.inputType.number input'),
      value: FlowNodeInputTypeEnum.numberInput,
      valueType: WorkflowIOValueTypeEnum.number
    },
    {
      label: t('core.module.inputType.switch'),
      value: FlowNodeInputTypeEnum.switch,
      valueType: WorkflowIOValueTypeEnum.boolean
    },
    {
      label: t('core.module.inputType.selectApp'),
      value: FlowNodeInputTypeEnum.selectApp,
      valueType: WorkflowIOValueTypeEnum.selectApp
    },
    {
      label: t('core.module.inputType.selectLLMModel'),
      value: FlowNodeInputTypeEnum.selectLLMModel,
      valueType: WorkflowIOValueTypeEnum.string
    },
    {
      label: t('core.module.inputType.selectDataset'),
      value: FlowNodeInputTypeEnum.selectDataset,
      valueType: WorkflowIOValueTypeEnum.selectDataset
    },
    ...(showDynamicInputSelect
      ? [
          {
            label: t('core.module.inputType.dynamicTargetInput'),
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

  const showMinMaxInput = useMemo(() => {
    if (inputType === FlowNodeInputTypeEnum.numberInput) return true;

    return false;
  }, [inputType]);

  const onSubmitSuccess = useCallback(
    (data: EditNodeFieldType) => {
      if (!data.key) return;
      if (isCreate && keys.includes(data.key)) {
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
    [isCreate, keys, onSubmit, showDataTypeSelect, t, toast]
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
        <Flex>
          <Stack mr={8} w={'300px'}>
            {editField.inputType && (
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
                </Box>
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
                  placeholder={
                    isToolInput ? t('core.module.Plugin tool Description') : t('common.choosable')
                  }
                  rows={5}
                  {...register('description', { required: isToolInput ? true : false })}
                />
              </Box>
            )}
          </Stack>
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

                      if (
                        type === WorkflowIOValueTypeEnum.chatHistory ||
                        type === WorkflowIOValueTypeEnum.datasetQuote
                      ) {
                        const label = dataTypeSelectList.find((item) => item.value === type)?.label;
                        setValue('label', label);
                      }

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
                  <Textarea bg={'myGray.50'} maxLength={maxLength} {...register('defaultValue')} />
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
