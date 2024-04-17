import {
  FlowNodeInputItemType,
  FlowNodeOutputItemType
} from '@fastgpt/global/core/workflow/type/io.d';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useFlowProviderStore } from '../../../FlowProvider';
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
  output?: FlowNodeOutputItemType;
  mode?: 'app' | 'plugin';
};

const InputLabel = ({ nodeId, input, output, mode }: Props) => {
  const { t } = useTranslation();
  const { onChangeNode } = useFlowProviderStore();
  const {
    description,
    toolDescription,
    label,
    selectedTypeIndex,
    renderTypeList,
    valueType,
    canEdit,
    key,
    value,
    maxLength,
    max,
    min
  } = input;
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

  const RenderLabel = useMemo(() => {
    return (
      <Flex className="nodrag" cursor={'default'} alignItems={'center'} position={'relative'}>
        <Box position={'relative'} fontWeight={'medium'} color={'myGray.600'}>
          {t(label)}
          {description && (
            <MyTooltip label={t(description)} forceShow>
              <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
            </MyTooltip>
          )}
        </Box>
        {mode === 'plugin' && canEdit && (
          <>
            <MyIcon
              name={'common/settingLight'}
              w={'14px'}
              cursor={'pointer'}
              ml={3}
              color={'myGray.600'}
              _hover={{ color: 'primary.500' }}
              onClick={() =>
                setEditField({
                  inputType: renderTypeList[0],
                  valueType: valueType,
                  key,
                  label,
                  description,
                  isToolInput: !!toolDescription,
                  defaultValue: value,
                  maxLength,
                  max,
                  min
                })
              }
            />
            <MyIcon
              className="delete"
              name={'delete'}
              w={'14px'}
              color={'myGray.600'}
              cursor={'pointer'}
              ml={2}
              _hover={{ color: 'red.500' }}
              onClick={() => {
                onChangeNode({
                  nodeId,
                  type: 'delInput',
                  key: key
                });
                onChangeNode({
                  nodeId,
                  type: 'delOutput',
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
                description: data.description,
                toolDescription: data.isToolInput ? data.description : undefined,
                maxLength: data.maxLength,
                value: data.defaultValue,
                max: data.max,
                min: data.min
              };
              const newOutput: FlowNodeOutputItemType = {
                ...(output as FlowNodeOutputItemType),
                valueType: data.valueType,
                key: data.key,
                label: data.label
              };

              if (changeKey) {
                onChangeNode({
                  nodeId,
                  type: 'replaceInput',
                  key: editField.key,
                  value: newInput
                });
                onChangeNode({
                  nodeId,
                  type: 'replaceOutput',
                  key: editField.key,
                  value: newOutput
                });
              } else {
                onChangeNode({
                  nodeId,
                  type: 'updateInput',
                  key: newInput.key,
                  value: newInput
                });
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
        {renderTypeList && renderTypeList.length > 1 && (
          <Box ml={2}>
            <NodeInputSelect
              renderTypeList={renderTypeList}
              renderTypeIndex={selectedTypeIndex}
              onChange={onChangeRenderType}
            />
          </Box>
        )}
      </Flex>
    );
  }, [
    canEdit,
    description,
    editField,
    input,
    key,
    label,
    max,
    maxLength,
    min,
    mode,
    nodeId,
    onChangeNode,
    onChangeRenderType,
    output,
    renderTypeList,
    selectedTypeIndex,
    t,
    toolDescription,
    value,
    valueType
  ]);

  return <>{RenderLabel}</>;
};

export default React.memo(InputLabel);
