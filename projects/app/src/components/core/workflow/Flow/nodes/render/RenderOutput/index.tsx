import React, { useMemo } from 'react';
import type { FlowNodeOutputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import { Box } from '@chakra-ui/react';
import { FlowNodeOutputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { ModuleOutputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import OutputLabel from './Label';
import { RenderOutputProps } from './type';
import dynamic from 'next/dynamic';

const RenderList: {
  types: `${FlowNodeOutputTypeEnum}`[];
  Component: React.ComponentType<RenderOutputProps>;
}[] = [
  {
    types: [FlowNodeOutputTypeEnum.addOutputParam],
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
  const sortOutputs = useMemo(
    () =>
      [...flowOutputList].sort((a, b) => {
        if (a.type === FlowNodeOutputTypeEnum.addOutputParam) {
          return 1;
        }
        if (b.type === FlowNodeOutputTypeEnum.addOutputParam) {
          return -1;
        }

        if (a.key === ModuleOutputKeyEnum.finish) return -1;
        if (b.key === ModuleOutputKeyEnum.finish) return 1;
        return 0;
      }),
    [flowOutputList]
  );

  return (
    <>
      {sortOutputs.map((output) => {
        const RenderComponent = (() => {
          const Component = RenderList.find(
            (item) => output.type && item.types.includes(output.type)
          )?.Component;

          if (!Component) return null;
          return <Component outputs={sortOutputs} item={output} nodeId={nodeId} />;
        })();

        return (
          output.type !== FlowNodeOutputTypeEnum.hidden && (
            <Box key={output.key} _notLast={{ mb: 7 }} position={'relative'}>
              {output.label && (
                <OutputLabel
                  nodeId={nodeId}
                  outputKey={output.key}
                  outputs={sortOutputs}
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
};

export default React.memo(RenderToolOutput);