import React, { useMemo } from 'react';
import { NodeProps } from 'reactflow';
import { Box, Button, Flex, Textarea } from '@chakra-ui/react';
import NodeCard from './render/NodeCard';
import { FlowNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import Divider from '../components/Divider';
import Container from '../components/Container';
import RenderInput from './render/RenderInput';
import type { ClassifyQuestionAgentItemType } from '@fastgpt/global/core/workflow/type/index.d';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 4);
import MyIcon from '@fastgpt/web/components/common/Icon';
import { FlowNodeOutputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { ModuleIOValueTypeEnum, ModuleInputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import { useTranslation } from 'next-i18next';
import SourceHandle from './render/SourceHandle';
import MyTooltip from '@/components/MyTooltip';
import { FlowNodeInputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import { useFlowProviderStore } from '../FlowProvider';

const NodeCQNode = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const { t } = useTranslation();
  const { nodeId, inputs } = data;
  const { onChangeNode } = useFlowProviderStore();

  const CustomComponent = useMemo(
    () => ({
      [ModuleInputKeyEnum.agents]: ({
        key: agentKey,
        value = [],
        ...props
      }: FlowNodeInputItemType) => {
        const agents = value as ClassifyQuestionAgentItemType[];
        return (
          <Box>
            {agents.map((item, i) => (
              <Box key={item.key} mb={4}>
                <Flex alignItems={'center'}>
                  <MyTooltip label={t('common.Delete')}>
                    <MyIcon
                      mt={1}
                      mr={2}
                      name={'minus'}
                      w={'14px'}
                      cursor={'pointer'}
                      color={'myGray.600'}
                      _hover={{ color: 'red.600' }}
                      onClick={() => {
                        onChangeNode({
                          nodeId,
                          type: 'updateInput',
                          key: agentKey,
                          value: {
                            ...props,
                            key: agentKey,
                            value: agents.filter((input) => input.key !== item.key)
                          }
                        });
                        onChangeNode({
                          nodeId,
                          type: 'delOutput',
                          key: item.key
                        });
                      }}
                    />
                  </MyTooltip>
                  <Box flex={1}>分类{i + 1}</Box>
                </Flex>
                <Box position={'relative'}>
                  <Textarea
                    rows={2}
                    mt={1}
                    defaultValue={item.value}
                    onChange={(e) => {
                      const newVal = agents.map((val) =>
                        val.key === item.key
                          ? {
                              ...val,
                              value: e.target.value
                            }
                          : val
                      );
                      onChangeNode({
                        nodeId,
                        type: 'updateInput',
                        key: agentKey,
                        value: {
                          ...props,
                          key: agentKey,
                          value: newVal
                        }
                      });
                    }}
                  />
                  <SourceHandle handleKey={item.key} valueType={ModuleIOValueTypeEnum.boolean} />
                </Box>
              </Box>
            ))}
            <Button
              onClick={() => {
                const key = nanoid();

                onChangeNode({
                  nodeId,
                  type: 'updateInput',
                  key: agentKey,
                  value: {
                    ...props,
                    key: agentKey,
                    value: agents.concat({ value: '', key })
                  }
                });

                onChangeNode({
                  nodeId,
                  type: 'addOutput',
                  value: {
                    key,
                    label: '',
                    type: FlowNodeOutputTypeEnum.hidden,
                    targets: []
                  }
                });
              }}
            >
              {t('core.module.Add question type')}
            </Button>
          </Box>
        );
      }
    }),
    [nodeId, t]
  );

  return (
    <NodeCard minW={'400px'} selected={selected} {...data}>
      <Divider text={t('common.Input')} />
      <Container>
        <RenderInput nodeId={nodeId} flowInputList={inputs} CustomComponent={CustomComponent} />
      </Container>
    </NodeCard>
  );
};
export default React.memo(NodeCQNode);