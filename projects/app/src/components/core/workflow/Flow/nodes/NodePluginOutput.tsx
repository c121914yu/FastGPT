import React, { useState } from 'react';
import { NodeProps } from 'reactflow';
import NodeCard from './render/NodeCard';
import { FlowNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import dynamic from 'next/dynamic';
import { Box, Button, Flex } from '@chakra-ui/react';
import { QuestionOutlineIcon, SmallAddIcon } from '@chakra-ui/icons';
import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum
} from '@fastgpt/global/core/workflow/node/constant';
import Container from '../components/Container';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@/components/MyTooltip';
import TargetHandle from './render/TargetHandle';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { EditNodeFieldType } from '@fastgpt/global/core/workflow/node/type';
import {
  FlowNodeInputItemType,
  FlowNodeOutputItemType
} from '@fastgpt/global/core/workflow/type/io';
import { WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import { useTranslation } from 'next-i18next';
import { useFlowProviderStore } from '../FlowProvider';
import RenderInput from './render/RenderInput';
import { getNanoid } from '@fastgpt/global/common/string/tools';

const FieldEditModal = dynamic(() => import('./render/FieldEditModal'));

const defaultCreateField: EditNodeFieldType = {
  label: '',
  key: '',
  description: '',
  valueType: WorkflowIOValueTypeEnum.string
};
const createEditField = {
  key: true,
  name: true,
  description: true,
  dataType: true
};

const NodePluginOutput = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const { t } = useTranslation();
  const { nodeId, inputs, outputs } = data;
  const { onChangeNode } = useFlowProviderStore();

  const [createField, setCreateField] = useState<EditNodeFieldType>();
  const [editField, setEditField] = useState<EditNodeFieldType>();

  return (
    <NodeCard minW={'300px'} selected={selected} forbidMenu {...data}>
      <Container mt={1} borderTop={'2px solid'} borderTopColor={'myGray.300'}>
        <Flex className="nodrag" cursor={'default'} alignItems={'center'} position={'relative'}>
          <Box position={'relative'}>{t('core.workflow.Custom outputs')}</Box>
          <Box flex={'1 0 0'} />
          <Button
            variant={'transparentBase'}
            leftIcon={<SmallAddIcon />}
            iconSpacing={1}
            size={'sm'}
            mr={'-5px'}
            fontSize={'md'}
            onClick={() => setCreateField(defaultCreateField)}
          >
            {t('common.Add New')}
          </Button>
        </Flex>
        <RenderInput nodeId={nodeId} flowInputList={inputs} />
      </Container>
      {!!createField && (
        <FieldEditModal
          editField={createEditField}
          defaultField={createField}
          keys={inputs.map((input) => input.key)}
          onClose={() => setCreateField(undefined)}
          onSubmit={({ data }) => {
            if (!data.key || !data.label) {
              return;
            }

            const newInput: FlowNodeInputItemType = {
              key: data.key,
              valueType: data.valueType,
              label: data.label,
              renderTypeList: [FlowNodeInputTypeEnum.reference],
              required: false,
              description: data.description,
              canEdit: true,
              editField: createEditField
            };
            const newOutput: FlowNodeOutputItemType = {
              id: getNanoid(),
              key: data.key,
              valueType: data.valueType,
              label: data.label,
              type: FlowNodeOutputTypeEnum.static
            };

            onChangeNode({
              nodeId,
              type: 'addInput',
              value: newInput
            });
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
          keys={[editField.key]}
          onClose={() => setEditField(undefined)}
          onSubmit={({ data, changeKey }) => {
            if (!data.inputType || !data.key || !data.label || !editField.key) return;

            // check key valid
            const memInput = inputs.find((item) => item.key === editField.key);
            const memOutput = outputs.find((item) => item.key === editField.key);

            if (!memInput || !memOutput) return setEditField(undefined);

            const newInput: FlowNodeInputItemType = {
              ...memInput,
              renderTypeList: [data.inputType],
              valueType: data.valueType,
              key: data.key,
              required: data.required,
              label: data.label,
              description: data.description
            };
            const newOutput: FlowNodeOutputItemType = {
              ...memOutput,
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
    </NodeCard>
  );
};

export default React.memo(NodePluginOutput);
