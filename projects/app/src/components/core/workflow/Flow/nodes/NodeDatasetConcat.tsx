import React, { useMemo } from 'react';
import { NodeProps } from 'reactflow';
import NodeCard from './render/NodeCard';
import { FlowNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import Container from '../components/Container';
import RenderInput from './render/RenderInput';
import { Box, Button, Flex } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { AddIcon } from '@chakra-ui/icons';
import {
  ModuleIOValueTypeEnum,
  ModuleInputKeyEnum,
  ModuleOutputKeyEnum
} from '@fastgpt/global/core/workflow/constants';
import { getOneQuoteInputTemplate } from '@fastgpt/global/core/workflow/template/system/datasetConcat';
import { useFlowProviderStore } from '../FlowProvider';
import TargetHandle from './render/TargetHandle';
import MyIcon from '@fastgpt/web/components/common/Icon';
import SourceHandle from './render/SourceHandle';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MySlider from '@/components/Slider';
import { FlowNodeInputItemType } from '@fastgpt/global/core/workflow/type/io.d';

const NodeDatasetConcat = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const { t } = useTranslation();
  const { llmModelList } = useSystemStore();
  const { nodes, onChangeNode } = useFlowProviderStore();
  const { nodeId, inputs, outputs } = data;

  const quotes = useMemo(
    () => inputs.filter((item) => item.valueType === ModuleIOValueTypeEnum.datasetQuote),
    [inputs]
  );

  const tokenLimit = useMemo(() => {
    let maxTokens = 3000;

    nodes.forEach((item) => {
      if (item.type === FlowNodeTypeEnum.chatNode) {
        const model =
          item.data.inputs.find((item) => item.key === ModuleInputKeyEnum.aiModel)?.value || '';
        const quoteMaxToken =
          llmModelList.find((item) => item.model === model)?.quoteMaxToken || 3000;

        maxTokens = Math.max(maxTokens, quoteMaxToken);
      }
    });

    return maxTokens;
  }, [llmModelList, nodes]);

  const RenderQuoteList = useMemo(() => {
    return (
      <Box>
        <Box>
          {quotes.map((quote, i) => (
            <Flex key={quote.key} position={'relative'} mb={4} alignItems={'center'}>
              <TargetHandle handleKey={quote.key} valueType={quote.valueType} />
              <Box>
                {t('core.chat.Quote')}
                {i + 1}
              </Box>
              <MyIcon
                ml={2}
                w={'14px'}
                name={'delete'}
                cursor={'pointer'}
                _hover={{ color: 'red.600' }}
                onClick={() => {
                  onChangeNode({
                    nodeId,
                    type: 'delInput',
                    key: quote.key
                  });
                }}
              />
            </Flex>
          ))}
        </Box>
        <Button
          leftIcon={<AddIcon />}
          variant={'whiteBase'}
          onClick={() => {
            onChangeNode({
              nodeId,
              type: 'addInput',
              value: getOneQuoteInputTemplate()
            });
          }}
        >
          {t('core.module.Dataset quote.Add quote')}
        </Button>
      </Box>
    );
  }, [nodeId, quotes, t]);

  const CustomComponent = useMemo(() => {
    console.log(111);
    return {
      [ModuleInputKeyEnum.datasetMaxTokens]: (item: FlowNodeInputItemType) => (
        <Box px={2}>
          <MySlider
            markList={[
              { label: '100', value: 100 },
              { label: tokenLimit, value: tokenLimit }
            ]}
            width={'100%'}
            min={100}
            max={tokenLimit}
            step={50}
            value={item.value}
            onChange={(e) => {
              onChangeNode({
                nodeId,
                type: 'updateInput',
                key: item.key,
                value: {
                  ...item,
                  value: e
                }
              });
            }}
          />
        </Box>
      )
    };
  }, [nodeId, tokenLimit]);

  return (
    <NodeCard minW={'400px'} selected={selected} {...data}>
      <Container borderTop={'2px solid'} borderTopColor={'myGray.200'} position={'relative'}>
        <RenderInput nodeId={nodeId} flowInputList={inputs} CustomComponent={CustomComponent} />
        {/* render dataset select */}
        {RenderQuoteList}
        <Flex position={'absolute'} right={4} top={'60%'}>
          <Box>{t('core.module.Dataset quote.Concat result')}</Box>
          <SourceHandle
            handleKey={ModuleOutputKeyEnum.datasetQuoteQA}
            valueType={ModuleIOValueTypeEnum.datasetQuote}
            // transform={'translate(-14px, -50%)'}
          />
        </Flex>
        {/* <RenderOutput nodeId={nodeId} flowOutputList={outputs} /> */}
      </Container>
    </NodeCard>
  );
};
export default React.memo(NodeDatasetConcat);