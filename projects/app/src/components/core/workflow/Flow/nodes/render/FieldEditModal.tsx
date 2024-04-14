import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  ModalFooter,
  ModalBody,
  Flex,
  Switch,
  Input,
  Textarea
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import MyModal from '@fastgpt/web/components/common/MyModal';
import {
  DYNAMIC_INPUT_KEY,
  WorkflowIOValueTypeEnum
} from '@fastgpt/global/core/workflow/constants';
import { useTranslation } from 'next-i18next';
import { FlowValueTypeMap } from '@/web/core/workflow/constants/dataType';
import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum
} from '@fastgpt/global/core/workflow/node/constant';
import {
  EditInputFieldMapType,
  EditNodeFieldType
} from '@fastgpt/global/core/workflow/node/type.d';
import { useToast } from '@fastgpt/web/hooks/useToast';
import MySelect from '@fastgpt/web/components/common/MySelect';

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
      label: t('core.module.inputType.switch'),
      value: FlowNodeInputTypeEnum.switch,
      valueType: WorkflowIOValueTypeEnum.boolean
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
  const required = watch('required');
  const [refresh, setRefresh] = useState(false);

  const showDataTypeSelect = useMemo(() => {
    if (!editField.valueType) return false;
    if (inputType === undefined) return true;
    if (inputType === FlowNodeInputTypeEnum.reference) return true;

    return false;
  }, [editField.valueType, inputType]);

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
        {editField.isToolInput && (
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
