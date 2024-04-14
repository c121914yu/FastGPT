import React from 'react';
import { NodeProps } from 'reactflow';
import NodeCard from './render/NodeCard';
import { FlowNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import Divider from '../components/Divider';
import Container from '../components/Container';
import RenderInput from './render/RenderInput';
import RenderOutput from './render/RenderOutput';
import { useTranslation } from 'next-i18next';
import { ToolSourceHandle } from './render/Handle/ToolHandle';
import { Box } from '@chakra-ui/react';

const NodeTools = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const { t } = useTranslation();
  const { nodeId, inputs, outputs } = data;

  return (
    <NodeCard minW={'350px'} selected={selected} {...data}>
      <Divider text={t('common.Input')} />
      <Container>
        <RenderInput nodeId={nodeId} flowInputList={inputs} />
      </Container>

      <Box position={'relative'}>
        <Box borderBottomLeftRadius={'md'} borderBottomRadius={'md'} overflow={'hidden'}>
          <Divider showBorderBottom={false} text={t('core.module.template.Tool module')} />
        </Box>
        <ToolSourceHandle nodeId={nodeId} />
      </Box>
    </NodeCard>
  );
};
export default React.memo(NodeTools);
