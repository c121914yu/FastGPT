import React, { useState } from 'react';
import { NodeProps } from 'reactflow';
import NodeCard from './render/NodeCard';
import { FlowNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import dynamic from 'next/dynamic';
import { Box, Button, Flex } from '@chakra-ui/react';
import { SmallAddIcon } from '@chakra-ui/icons';
import {
  FlowNodeInputItemType,
  FlowNodeOutputItemType
} from '@fastgpt/global/core/workflow/type/io.d';
import Container from '../components/Container';
import Label from './render/RenderInput/Label';
import { getNanoid } from '@fastgpt/global/common/string/tools';

import type {
  EditInputFieldMapType,
  EditNodeFieldType
} from '@fastgpt/global/core/workflow/node/type.d';
import { useTranslation } from 'next-i18next';
import { useFlowProviderStore } from '../FlowProvider';
import { WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import {
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum
} from '@fastgpt/global/core/workflow/node/constant';

const FieldEditModal = dynamic(() => import('./render/FieldEditModal'));

const defaultCreateField: EditNodeFieldType = {
  label: '',
  key: '',
  description: '',
  inputType: FlowNodeInputTypeEnum.reference,
  valueType: WorkflowIOValueTypeEnum.string,
  required: true
};
const createEditField: EditInputFieldMapType = {
  key: true,
  name: true,
  description: true,
  required: true,
  valueType: true,
  inputType: true,
  isToolInput: true
};

const NodePluginInput = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const { t } = useTranslation();
  const { nodeId, inputs, outputs } = data;

  const { onChangeNode, mode } = useFlowProviderStore();

  const [createField, setCreateField] = useState<EditNodeFieldType>();

  return (
    <NodeCard minW={'300px'} selected={selected} forbidMenu {...data}>
      <Container mt={1} borderTop={'2px solid'} borderTopColor={'myGray.300'}>
        <Flex className="nodrag" cursor={'default'} alignItems={'center'} position={'relative'}>
          <Box position={'relative'}>{t('core.workflow.Custom inputs')}</Box>
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
        {inputs.map((input) => (
          <Box key={input.key} mt={3}>
            <Label
              nodeId={nodeId}
              input={input}
              output={outputs.find((output) => output.key === input.key) as FlowNodeOutputItemType}
            />
          </Box>
        ))}
      </Container>
      {!!createField && (
        <FieldEditModal
          editField={createEditField}
          defaultField={createField}
          keys={inputs.map((input) => input.key)}
          onClose={() => setCreateField(undefined)}
          onSubmit={({ data }) => {
            if (!data.key || !data.label || !data.inputType) {
              return;
            }

            const newInput: FlowNodeInputItemType = {
              key: data.key,
              valueType: data.valueType,
              label: data.label,
              renderTypeList: [data.inputType],
              required: data.required,
              description: data.description,
              toolDescription: data.isToolInput ? data.description : undefined,
              canEdit: true,
              value: data.defaultValue,
              editField: createEditField,
              maxLength: data.maxLength,
              max: data.max,
              min: data.min
            };

            onChangeNode({
              nodeId,
              type: 'addInput',
              value: newInput
            });

            const newOutput: FlowNodeOutputItemType = {
              id: getNanoid(),
              key: data.key,
              valueType: data.valueType,
              label: data.label,
              type: FlowNodeOutputTypeEnum.static
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
    </NodeCard>
  );
};
export default React.memo(NodePluginInput);
