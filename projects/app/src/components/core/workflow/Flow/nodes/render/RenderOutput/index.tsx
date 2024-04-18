import React, { useMemo } from 'react';
import type { FlowNodeOutputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import { Box, Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react';
import { FlowNodeOutputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { NodeOutputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import OutputLabel from './Label';
import { RenderOutputProps } from './type';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

const RenderList: {
  types: `${FlowNodeOutputTypeEnum}`[];
  Component: React.ComponentType<RenderOutputProps>;
}[] = [
  {
    types: [FlowNodeOutputTypeEnum.dynamic],
    Component: dynamic(() => import('./templates/AddOutputParam'))
  }
];

const RenderToolOutput = ({
  nodeId,
  flowOutputList
}: {
  nodeId: string;
  flowOutputList: FlowNodeOutputItemType[];
}) => {
  const outputString = useMemo(() => JSON.stringify(flowOutputList), [flowOutputList]);
  const copyOutputs = useMemo(() => {
    const parseOutputs = JSON.parse(outputString) as FlowNodeOutputItemType[];
    return parseOutputs;
  }, [outputString]);

  const { t } = useTranslation();

  const Render = useMemo(() => {
    return (
      <>
        {copyOutputs.map((output) => {
          const RenderComponent = (() => {
            const Component = RenderList.find(
              (item) => output.type && item.types.includes(output.type)
            )?.Component;

            if (!Component) return null;
            return <Component outputs={copyOutputs} item={output} nodeId={nodeId} />;
          })();

          return (
            output.type !== FlowNodeOutputTypeEnum.hidden && (
              <Box key={output.key} _notLast={{ mb: 5 }} position={'relative'}>
                <TableContainer>
                  <Table bg={'white'}>
                    <Thead>
                      <Tr bg={'myGray.50'}>
                        <Th w={'18px !important'} p={0} />
                        <Th>{t('core.module.variable.variable name')}</Th>
                        <Th>{t('core.workflow.Value type')}</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    {/* <Tbody>
                {inputs.map((item) => (
                  <Tr key={item.key}>
                    <Td textAlign={'center'} p={0} pl={3}>
                      <MyIcon name={'chatSend'} w={'14px'} color={'myGray.500'} />
                    </Td>
                    <Td>{item.label}</Td>
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
                        color={'myGray.600'}
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
                ))}
              </Tbody> */}
                  </Table>
                </TableContainer>
                {output.label && (
                  <OutputLabel
                    nodeId={nodeId}
                    outputKey={output.key}
                    outputs={copyOutputs}
                    {...output}
                  />
                )}
                {!!RenderComponent && (
                  <Box mt={2} className={'nodrag'}>
                    {RenderComponent}
                  </Box>
                )}
              </Box>
            )
          );
        })}
      </>
    );
  }, [copyOutputs, nodeId]);

  return <>{Render}</>;
};

export default React.memo(RenderToolOutput);
