import React, { useMemo } from 'react';
import type { FlowNodeOutputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import { Box } from '@chakra-ui/react';
import { FlowNodeOutputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { NodeOutputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import OutputLabel from './Label';
import { RenderOutputProps } from './type';
import dynamic from 'next/dynamic';

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
              <Box key={output.key} _notLast={{ mb: 7 }} position={'relative'}>
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