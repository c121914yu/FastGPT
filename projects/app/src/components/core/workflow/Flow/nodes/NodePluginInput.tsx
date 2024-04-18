import React, { useMemo, useState } from 'react';
import { NodeProps } from 'reactflow';
import NodeCard from './render/NodeCard';
import { FlowNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import dynamic from 'next/dynamic';
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
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
import MyIcon from '@fastgpt/web/components/common/Icon';
import {
  FlowNodeInputMap,
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum
} from '@fastgpt/global/core/workflow/node/constant';
import { FlowValueTypeMap } from '@/web/core/workflow/constants/dataType';

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
  description: true,
  required: true,
  valueType: true,
  inputType: true,
  isToolInput: true
};

const NodePluginInput = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const { t } = useTranslation();
  const { nodeId, inputs, outputs } = data;

  const { onChangeNode } = useFlowProviderStore();

  const [createField, setCreateField] = useState<EditNodeFieldType>();
  const [editField, setEditField] = useState<EditNodeFieldType>();

  const Render = useMemo(() => {
    console.log(111111);
    return (
      <NodeCard
        minW={'300px'}
        selected={selected}
        menuForbid={{
          rename: true,
          copy: true,
          delete: true
        }}
        {...data}
      >
        <Container mt={1}>
          <Flex className="nodrag" cursor={'default'} alignItems={'center'} position={'relative'}>
            <Box position={'relative'} fontWeight={'medium'}>
              {t('core.workflow.Custom inputs')}
            </Box>
            <Box flex={'1 0 0'} />
            <Button
              variant={'whitePrimary'}
              leftIcon={<SmallAddIcon />}
              iconSpacing={1}
              size={'sm'}
              mr={'-5px'}
              onClick={() => setCreateField(defaultCreateField)}
            >
              {t('common.Add New')}
            </Button>
          </Flex>
          <Box
            mt={2}
            borderRadius={'md'}
            overflow={'hidden'}
            borderWidth={'1px'}
            borderBottom="none"
          >
            <TableContainer>
              <Table bg={'white'}>
                <Thead>
                  <Tr bg={'myGray.50'}>
                    <Th>{t('core.module.variable.variable name')}</Th>
                    <Th>{t('core.workflow.Value type')}</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {inputs.map((item) => {
                    const renderType = item.renderTypeList[0] || FlowNodeInputTypeEnum.reference;
                    return (
                      <Tr key={item.key}>
                        <Td>
                          <Flex alignItems={'center'}>
                            <MyIcon
                              mr={1}
                              name={FlowNodeInputMap[renderType]?.icon as any}
                              w={'14px'}
                            />
                            {item.label}
                          </Flex>
                        </Td>
                        <Td>{item.valueType ? t(FlowValueTypeMap[item.valueType]?.label) : '-'}</Td>
                        <Td>
                          <MyIcon
                            mr={3}
                            name={'common/settingLight'}
                            w={'16px'}
                            cursor={'pointer'}
                            onClick={() => {
                              setEditField({
                                ...item,
                                inputType: item.renderTypeList[0],
                                valueType: item.valueType,
                                key: item.key,
                                label: item.label,
                                description: item.description,
                                isToolInput: !!item.toolDescription
                              });
                            }}
                          />
                          <MyIcon
                            className="delete"
                            name={'delete'}
                            w={'16px'}
                            cursor={'pointer'}
                            ml={2}
                            _hover={{ color: 'red.500' }}
                            onClick={() => {
                              onChangeNode({
                                nodeId,
                                type: 'delInput',
                                key: item.key
                              });
                              onChangeNode({
                                nodeId,
                                type: 'delOutput',
                                key: item.key
                              });
                            }}
                          />{' '}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
          {/* {inputs.map((input) => (
        <Box key={input.key} mt={3}>
          <Label
            nodeId={nodeId}
            input={input}
            output={outputs.find((output) => output.key === input.key) as FlowNodeOutputItemType}
            mode={mode}
          />
        </Box>
      ))} */}
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
        {!!editField?.key && (
          <FieldEditModal
            editField={createEditField}
            keys={inputs.map((input) => input.key).filter((key) => key !== editField.key)}
            defaultField={editField}
            onClose={() => setEditField(undefined)}
            onSubmit={({ data, changeKey }) => {
              const output = outputs.find((output) => output.key === editField.key);
              if (!data.inputType || !data.key || !data.label || !editField.key) return;

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
      </NodeCard>
    );
  }, [createField, data, editField, inputs, nodeId, onChangeNode, outputs, selected, t]);

  return Render;
};
export default React.memo(NodePluginInput);
