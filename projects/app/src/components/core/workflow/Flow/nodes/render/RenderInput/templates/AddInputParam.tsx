import React, { useCallback, useMemo, useState } from 'react';
import type { RenderInputProps } from '../type';
import { Box, Button, Flex } from '@chakra-ui/react';
import { SmallAddIcon } from '@chakra-ui/icons';
import { useTranslation } from 'next-i18next';
import { EditNodeFieldType } from '@fastgpt/global/core/workflow/node/type';
import dynamic from 'next/dynamic';
import { useFlowProviderStore } from '../../../../FlowProvider';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import { FlowNodeInputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { FlowNodeInputItemType } from '@fastgpt/global/core/workflow/type/io';
import Reference from './Reference';

const FieldEditModal = dynamic(() => import('../../FieldEditModal'));

const AddInputParam = (props: RenderInputProps) => {
  const { item, inputs, nodeId } = props;
  const { t } = useTranslation();
  const { onChangeNode, mode } = useFlowProviderStore();
  const inputValue = (item.value || []) as FlowNodeInputItemType[];

  const [editField, setEditField] = useState<EditNodeFieldType>();
  const inputIndex = useMemo(
    () => inputs?.findIndex((input) => input.key === item.key),
    [inputs, item.key]
  );

  const onAddField = useCallback(
    ({ data }: { data: EditNodeFieldType }) => {
      if (!data.key) return;
      const newInput: FlowNodeInputItemType = {
        key: data.key,
        valueType: data.valueType,
        label: data.label || '',
        renderTypeList: [FlowNodeInputTypeEnum.reference],
        required: data.required,
        description: data.description,
        canEdit: true,
        editField: item.editField
      };
      onChangeNode({
        nodeId,
        type: 'addInput',
        index: inputIndex ? inputIndex + 1 : 1,
        value: newInput
      });
      setEditField(undefined);
    },
    [inputIndex, item, nodeId, onChangeNode]
  );

  return (
    <>
      <Flex className="nodrag" cursor={'default'} alignItems={'center'} position={'relative'}>
        <Box position={'relative'}>
          {t('core.workflow.Custom variable')}
          {item.description && <QuestionTip label={t(item.description)} />}
        </Box>
        <Box flex={'1 0 0'} />
        <Button
          variant={'transparentBase'}
          leftIcon={<SmallAddIcon />}
          iconSpacing={1}
          size={'sm'}
          mr={'-5px'}
          fontSize={'md'}
          onClick={() => setEditField({})}
        >
          {t('common.Add New')}
        </Button>
      </Flex>
      {mode === 'plugin' && (
        <Box mt={1}>
          <Reference {...props} />
        </Box>
      )}

      {!!editField && (
        <FieldEditModal
          editField={item.editField}
          defaultField={editField}
          keys={inputValue.map((input) => input.key)}
          onClose={() => setEditField(undefined)}
          onSubmit={onAddField}
        />
      )}
    </>
  );
};

export default React.memo(AddInputParam);