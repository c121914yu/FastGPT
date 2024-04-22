import React, { useMemo } from 'react';
import NodeCard from './render/NodeCard';
import { useTranslation } from 'next-i18next';
import { useFlowProviderStore } from '../FlowProvider';
import { Box, Button, Flex, background } from '@chakra-ui/react';
import { SmallAddIcon } from '@chakra-ui/icons';
import Reference from './render/RenderInput/templates/Reference';
import Select from './render/RenderInput/templates/Select';
import TextInput from './render/RenderInput/templates/TextInput';
import MyIcon from '@fastgpt/web/components/common/Icon';
import RenderOutput from './render/RenderOutput';
import { WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import { FlowNodeInputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';

const NodeIfElse = ({
  data,
  selected,
  minW = '350px',
  maxW
}: {
  data: any;
  selected: boolean;
  minW?: string | number;
  maxW?: string | number;
}) => {
  const { t } = useTranslation();
  const { splitToolInputs } = useFlowProviderStore();
  const { nodeId, inputs, outputs } = data;
  const { commonInputs } = splitToolInputs(inputs, nodeId);
  const { onChangeNode } = useFlowProviderStore();

  const inputChunks = useMemo(() => {
    var chunkedArr = [];
    const copy = commonInputs.filter(
      (item: any) => item.key !== 'condition' && item.key !== 'agents'
    );
    for (var i = 0; i < copy.length; i += 3) {
      chunkedArr.push(copy.slice(i, i + 3));
    }
    return chunkedArr;
  }, [commonInputs]);

  return (
    <NodeCard minW={minW} maxW={maxW} selected={selected} {...data}>
      <>
        <Box px={4} mx={2} mb={2} py={'10px'} position={'relative'} borderRadius={'md'}>
          <RenderOutput nodeId={nodeId} flowOutputList={[outputs[0]]} />
          {inputChunks.map((items: any, index: number) => {
            return (
              <>
                {index > 0 && (
                  <Flex alignItems={'center'} w={'full'} py={'1'}>
                    <Box
                      w={'auto'}
                      flex={1}
                      height={'1px'}
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(232, 235, 240, 0.00) 0%, #E8EBF0 100%)'
                      }}
                    ></Box>
                    <Flex
                      px={'2.5'}
                      color={'primary.600'}
                      fontWeight={'medium'}
                      alignItems={'center'}
                      cursor={'pointer'}
                      rounded={'md'}
                      h={8}
                      _hover={{
                        bg: 'myGray.150'
                      }}
                      onClick={() => {
                        onChangeNode({
                          nodeId,
                          type: 'updateInput',
                          key: 'condition',
                          value: {
                            key: 'condition',
                            valueType: WorkflowIOValueTypeEnum.string,
                            label: 'condition',
                            renderTypeList: [FlowNodeInputTypeEnum.hidden],
                            required: true,
                            value:
                              commonInputs.find((item: any) => item.key === 'condition')?.value ===
                              'OR'
                                ? 'AND'
                                : 'OR'
                          }
                        });
                      }}
                    >
                      {commonInputs.find((item: any) => item.key === 'condition')?.value || 'OR'}
                      <MyIcon ml={1} boxSize={5} name="change" />
                    </Flex>
                    <Box
                      w={'auto'}
                      flex={1}
                      height={'1px'}
                      style={{
                        background:
                          'linear-gradient(90deg, #E8EBF0 0%, rgba(232, 235, 240, 0.00) 100%)'
                      }}
                    ></Box>
                  </Flex>
                )}
                <Flex key={index} gap={2} alignItems={'center'}>
                  {items.map((item: any, key: number) => {
                    if (item.renderTypeList?.includes('reference')) {
                      return <Reference key={key} item={item} nodeId={nodeId} />;
                    } else if (item.renderTypeList?.includes('input')) {
                      return <TextInput key={key} item={item} nodeId={nodeId} />;
                    } else {
                      return <Select key={key} item={item} nodeId={nodeId} />;
                    }
                  })}
                  {inputChunks.length > 1 && (
                    <MyIcon
                      ml={2}
                      boxSize={5}
                      name="delete"
                      cursor={'pointer'}
                      _hover={{ color: 'red.600' }}
                      color={'myGray.400'}
                      onClick={() => {
                        items.map((item: any) => {
                          onChangeNode({
                            nodeId,
                            type: 'delInput',
                            key: item.key
                          });
                        });
                      }}
                    />
                  )}
                </Flex>
              </>
            );
          })}
          <Button
            onClick={() => {
              onChangeNode({
                nodeId,
                type: 'addInput',
                value: [
                  {
                    key: `input${inputChunks.length + 1}`,
                    valueType: 'any',
                    label: `input${inputChunks.length + 1}`,
                    renderTypeList: ['reference'],
                    required: true
                  },
                  {
                    key: `select${inputChunks.length + 1}`,
                    valueType: 'string',
                    label: `select${inputChunks.length + 1}`,
                    required: true,
                    canEdit: true,
                    value: 'equalTo',
                    renderTypeList: ['select'],
                    list: [
                      {
                        label: '等于',
                        value: 'equalTo'
                      },
                      {
                        label: '不等于',
                        value: 'notEqualTo'
                      },
                      {
                        label: '大于',
                        value: 'greaterThan'
                      },
                      {
                        label: '小于',
                        value: 'lessThan'
                      },
                      {
                        label: '大于等于',
                        value: 'greaterThanOrEqualTo'
                      },
                      {
                        label: '小于等于',
                        value: 'lessThanOrEqualTo'
                      }
                    ]
                  },
                  {
                    key: `value${inputChunks.length + 1}`,
                    valueType: 'string',
                    label: `value${inputChunks.length + 1}`,
                    renderTypeList: ['input'],
                    required: true,
                    value: ''
                  }
                ]
              });
            }}
            variant={'whiteBase'}
            leftIcon={<SmallAddIcon />}
            mt={3}
            w={'full'}
            mb={4}
          >
            {t('core.module.input.add')}
          </Button>
          <RenderOutput nodeId={nodeId} flowOutputList={[outputs[1]]} />
        </Box>
      </>
    </NodeCard>
  );
};
export default React.memo(NodeIfElse);
