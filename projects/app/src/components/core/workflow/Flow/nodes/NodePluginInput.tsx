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
import SourceHandle from './render/SourceHandle';
import type {
  EditInputFieldMap,
  EditNodeFieldType
} from '@fastgpt/global/core/workflow/node/type.d';
import {
  FlowNodeInputItemType,
  FlowNodeOutputItemType
} from '@fastgpt/global/core/workflow/type/io.d';
import { WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import { useTranslation } from 'next-i18next';
import { useFlowProviderStore } from '../FlowProvider';

const FieldEditModal = dynamic(() => import('./render/FieldEditModal'));

const defaultCreateField: EditNodeFieldType = {
  label: '',
  key: '',
  description: '',
  inputType: FlowNodeInputTypeEnum.target,
  valueType: WorkflowIOValueTypeEnum.string,
  required: true
};
const createEditField: EditInputFieldMap = {
  key: true,
  name: true,
  description: true,
  required: true,
  dataType: true,
  inputType: true,
  isToolInput: true
};

const NodePluginInput = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const { t } = useTranslation();
  const { nodeId, inputs, outputs } = data;
  const { onChangeNode } = useFlowProviderStore();

  const [createField, setCreateField] = useState<EditNodeFieldType>();
  const [editField, setEditField] = useState<EditNodeFieldType>();

  return (
    <NodeCard minW={'300px'} selected={selected} forbidMenu {...data}>
      <Container mt={1} borderTop={'2px solid'} borderTopColor={'myGray.300'}>
        {inputs.map((item) => (
          <Flex
            key={item.key}
            className="nodrag"
            cursor={'default'}
            justifyContent={'right'}
            alignItems={'center'}
            position={'relative'}
            mb={7}
          >
            {item.description && (
              <MyTooltip label={t(item.description)} forceShow>
                <QuestionOutlineIcon display={['none', 'inline']} mr={1} />
              </MyTooltip>
            )}
            <Box position={'relative'}>
              {t(item.label)}
              {item.required && (
                <Box
                  position={'absolute'}
                  right={'-6px'}
                  top={'-3px'}
                  color={'red.500'}
                  fontWeight={'bold'}
                >
                  *
                </Box>
              )}
            </Box>
            <SourceHandle handleKey={item.key} valueType={item.valueType} />
          </Flex>
        ))}
        <Box textAlign={'right'} mt={5}>
          <Button
            variant={'whitePrimary'}
            leftIcon={<SmallAddIcon />}
            onClick={() => {
              setCreateField(defaultCreateField);
            }}
          >
            {t('core.module.input.Add Input')}
          </Button>
        </Box>
      </Container>
      {!!createField && (
        <FieldEditModal
          editField={createEditField}
          defaultField={createField}
          keys={inputs.map((input) => input.key)}
          onClose={() => setCreateField(undefined)}
          onSubmit={({ data }) => {
            onChangeNode({
              nodeId,
              type: 'addInput',
              value: {
                key: data.key,
                valueType: data.valueType,
                label: data.label,
                type: data.inputType,
                required: data.required,
                description: data.description,
                toolDescription: data.isToolInput ? data.description : undefined,
                edit: true,
                editField: createEditField
              }
            });
            onChangeNode({
              nodeId,
              type: 'addOutput',
              value: {
                key: data.key,
                valueType: data.valueType,
                label: data.label,
                type: FlowNodeOutputTypeEnum.source,
                edit: true,
                targets: []
              }
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
            if (!data.inputType || !data.key || !data.label) return;

            // check key valid
            const memInput = inputs.find((item) => item.key === editField.key);
            const memOutput = outputs.find((item) => item.key === editField.key);

            if (!memInput || !memOutput) return setEditField(undefined);

            const newInput: FlowNodeInputItemType = {
              ...memInput,
              type: data.inputType,
              valueType: data.valueType,
              key: data.key,
              required: data.required,
              label: data.label,
              description: data.description,
              toolDescription: data.isToolInput ? data.description : undefined,
              ...(data.inputType === FlowNodeInputTypeEnum.addInputParam
                ? {
                    editField: {
                      key: true,
                      name: true,
                      description: true,
                      required: true,
                      dataType: true,
                      inputType: false
                    },
                    defaultEditField: {
                      label: '',
                      key: '',
                      description: '',
                      inputType: FlowNodeInputTypeEnum.target,
                      valueType: WorkflowIOValueTypeEnum.string,
                      required: true
                    }
                  }
                : {})
            };
            const newOutput: FlowNodeOutputItemType = {
              ...memOutput,
              valueType: data.valueType,
              key: data.key,
              label: data.label
            };
            console.log(data);
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
export default React.memo(NodePluginInput);
