import { FlowNodeInputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useFlowProviderStore, useFlowProviderStoreType } from '../../../FlowProvider';
import { Box, Flex } from '@chakra-ui/react';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';

import NodeInputSelect from '@fastgpt/web/components/core/workflow/NodeInputSelect';
import MyIcon from '@fastgpt/web/components/common/Icon';

import dynamic from 'next/dynamic';
import { EditNodeFieldType } from '@fastgpt/global/core/workflow/node/type';
const FieldEditModal = dynamic(() => import('../FieldEditModal'));

type Props = {
  nodeId: string;
  input: FlowNodeInputItemType;
};

const InputLabel = ({ nodeId, input }: Props) => {
  const { t } = useTranslation();
  const { onChangeNode } = useFlowProviderStore();
  const { description, label, selectedTypeIndex, renderTypeList, valueType, canEdit, key } = input;
  const [editField, setEditField] = useState<EditNodeFieldType>();

  const onChangeRenderType = useCallback(
    (e: string) => {
      const index = renderTypeList.findIndex((item) => item === e) || 0;

      onChangeNode({
        nodeId,
        type: 'updateInput',
        key: input.key,
        value: {
          ...input,
          selectedTypeIndex: index,
          value: undefined
        }
      });
    },
    [input, nodeId, onChangeNode, renderTypeList]
  );

  return (
    <Flex className="nodrag" cursor={'default'} alignItems={'center'} position={'relative'}>
      <Box position={'relative'}>
        {t(label)}
        {description && (
          <MyTooltip label={t(description)} forceShow>
            <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
          </MyTooltip>
        )}
      </Box>
      {canEdit && (
        <>
          <MyIcon
            name={'common/settingLight'}
            w={'14px'}
            cursor={'pointer'}
            ml={3}
            _hover={{ color: 'primary.500' }}
            onClick={() =>
              setEditField({
                inputType: renderTypeList[0],
                valueType: valueType,
                key,
                label,
                description
              })
            }
          />
          <MyIcon
            className="delete"
            name={'delete'}
            w={'14px'}
            cursor={'pointer'}
            ml={2}
            _hover={{ color: 'red.500' }}
            onClick={() => {
              onChangeNode({
                nodeId,
                type: 'delInput',
                key: key
              });
            }}
          />
        </>
      )}

      {!!editField?.key && (
        <FieldEditModal
          editField={input.editField}
          keys={[editField.key]}
          defaultField={editField}
          onClose={() => setEditField(undefined)}
          onSubmit={({ data, changeKey }) => {
            if (!data.inputType || !data.key || !data.label || !editField.key) return;

            const newInput: FlowNodeInputItemType = {
              ...input,
              renderTypeList: [data.inputType],
              valueType: data.valueType,
              key: data.key,
              required: data.required,
              label: data.label,
              description: data.description
            };

            if (changeKey) {
              onChangeNode({
                nodeId,
                type: 'replaceInput',
                key: editField.key,
                value: newInput
              });
            } else {
              onChangeNode({
                nodeId,
                type: 'updateInput',
                key: newInput.key,
                value: newInput
              });
            }
            setEditField(undefined);
          }}
        />
      )}
      {renderTypeList && renderTypeList.length > 1 && (
        <Box ml={1}>
          <NodeInputSelect
            renderTypeList={renderTypeList}
            renderTypeIndex={selectedTypeIndex}
            onChange={onChangeRenderType}
          />
        </Box>
      )}
    </Flex>
  );
};

export default React.memo(InputLabel);