import React from 'react';
import { NodeProps } from 'reactflow';
import NodeCard from './render/NodeCard';
import { FlowNodeItemType } from '@fastgpt/global/core/workflow/type.d';
import Container from '../components/Container';
import RenderInput from './render/RenderInput';
import RenderOutput from './render/RenderOutput';
import { useFlowProviderStore } from '../FlowProvider';
import Divider from '../components/Divider';
import RenderToolInput from './render/RenderToolInput';
import { useTranslation } from 'next-i18next';

const NodeAnswer = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const { t } = useTranslation();
  const { nodeId, inputs, outputs } = data;
  const { splitToolInputs } = useFlowProviderStore();
  const { toolInputs, commonInputs } = splitToolInputs(inputs, nodeId);

  return (
    <NodeCard minW={'400px'} selected={selected} {...data}>
      <Container borderTop={'2px solid'} borderTopColor={'myGray.200'}>
        {toolInputs.length > 0 && (
          <>
            <Divider text={t('core.module.tool.Tool input')} />
            <Container>
              <RenderToolInput nodeId={nodeId} inputs={toolInputs} />
            </Container>
          </>
        )}
        <RenderInput nodeId={nodeId} flowInputList={commonInputs} />
        <RenderOutput nodeId={nodeId} flowOutputList={outputs} />
      </Container>
    </NodeCard>
  );
};
export default React.memo(NodeAnswer);
