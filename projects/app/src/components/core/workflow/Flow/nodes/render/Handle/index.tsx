import React, { useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useFlowProviderStore } from '../../../FlowProvider';
import { SmallAddIcon } from '@chakra-ui/icons';
import { handleHighLightStyle, sourceCommonStyle, handleConnectedStyle } from './style';
import { NodeOutputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import { getHandleId } from '@fastgpt/global/core/workflow/utils';

type Props = {
  nodeId: string;
  handleId: string;
  position: `${Position}`;
  translate?: [number, number];
};

const MySourceHandle = React.memo(function MyHandle({
  nodeId,
  translate,
  handleId,
  position,
  highlightStyle,
  connectedStyle
}: Props & {
  position: Position;
  highlightStyle: Record<string, any>;
  connectedStyle: Record<string, any>;
}) {
  const { nodes, hoverNodeId, edges, connectingEdge } = useFlowProviderStore();

  const node = useMemo(() => nodes.find((node) => node.data.nodeId === nodeId), [nodes, nodeId]);
  const connected = edges.some((edge) => edge.sourceHandle === handleId);
  const nodeIsHover = hoverNodeId === nodeId;

  const RenderHandle = useMemo(() => {
    if (!node) return null;
    if (connectingEdge?.handleId === NodeOutputKeyEnum.selectedTools) return null;

    const active = nodeIsHover || node.selected || connectingEdge?.handleId === handleId;

    const translateStr = (() => {
      if (!translate) return '';
      if (position === Position.Right) {
        return `${active ? translate[0] + 2 : translate[0]}px, -50%`;
      }
      if (position === Position.Left) {
        return `${active ? translate[0] + 2 : translate[0]}px, -50%`;
      }
      if (position === Position.Top) {
        return `-50%, ${active ? translate[1] - 2 : translate[1]}px`;
      }
      if (position === Position.Bottom) {
        return `-50%, ${active ? translate[1] + 2 : translate[1]}px`;
      }
    })();

    const { styles, showAddIcon } = (() => {
      if (active) {
        return {
          styles: {
            ...highlightStyle,
            ...(translateStr && {
              transform: `translate(${translateStr})`
            })
          },
          showAddIcon: true
        };
      }

      if (connected) {
        return {
          styles: {
            ...connectedStyle,
            ...(translateStr && {
              transform: `translate(${translateStr})`
            })
          },
          showAddIcon: false
        };
      }

      return {
        styles: undefined,
        showAddIcon: false
      };
    })();

    return (
      <Handle
        style={
          !!styles
            ? styles
            : {
                visibility: 'hidden',
                ...(translate && {
                  transform: `translate(${translateStr})`
                })
              }
        }
        type="source"
        id={handleId}
        position={position}
      >
        {showAddIcon && (
          <SmallAddIcon pointerEvents={'none'} color={'primary.600'} fontWeight={'bold'} />
        )}
      </Handle>
    );
  }, [
    node,
    translate,
    handleId,
    position,
    nodeIsHover,
    connectingEdge?.handleId,
    connected,
    highlightStyle,
    connectedStyle
  ]);

  return <>{RenderHandle}</>;
});

export const SourceHandle = (props: Props) => {
  return (
    <MySourceHandle
      {...props}
      highlightStyle={{
        ...sourceCommonStyle,
        ...handleHighLightStyle
      }}
      connectedStyle={{
        ...sourceCommonStyle,
        ...handleConnectedStyle
      }}
    />
  );
};

const MyTargetHandle = React.memo(function MyHandle({
  nodeId,
  handleId,
  position,
  translate,
  highlightStyle,
  connectedStyle
}: Props & {
  position: Position;
  highlightStyle: Record<string, any>;
  connectedStyle: Record<string, any>;
}) {
  const { nodes, edges, connectingEdge } = useFlowProviderStore();

  // check tool connected
  if (
    edges.some(
      (edge) => edge.target === nodeId && edge.targetHandle === NodeOutputKeyEnum.selectedTools
    )
  )
    return null;

  const node = useMemo(() => nodes.find((node) => node.data.nodeId === nodeId), [nodes, nodeId]);
  const connected = edges.some((edge) => edge.targetHandle === handleId);

  const translateStr = (() => {
    if (!translate) return '';

    if (position === Position.Right) {
      return `${connectingEdge ? translate[0] + 2 : translate[0]}px, -50%`;
    }
    if (position === Position.Left) {
      return `${connectingEdge ? translate[0] - 2 : translate[0]}px, -50%`;
    }
    if (position === Position.Top) {
      return `-50%, ${connectingEdge ? translate[1] - 2 : translate[1]}px`;
    }
    if (position === Position.Bottom) {
      return `-50%, ${connectingEdge ? translate[1] + 2 : translate[1]}px`;
    }
  })();

  const transform = translateStr ? `translate(${translateStr})` : '';

  const RenderHandle = useMemo(() => {
    if (!node) return null;
    if (connectingEdge?.handleId && !connectingEdge.handleId?.includes('source')) return null;

    const styles = (() => {
      if (!connectingEdge && !connected) return;

      if (connectingEdge) {
        return {
          ...highlightStyle,
          transform
        };
      }

      if (connected) {
        return {
          ...connectedStyle,
          transform
        };
      }
      return;
    })();

    return (
      <Handle
        style={
          !!styles
            ? styles
            : {
                visibility: 'hidden',
                transform
              }
        }
        type="target"
        id={handleId}
        position={position}
      ></Handle>
    );
  }, [
    node,
    transform,
    handleId,
    position,
    connectingEdge,
    connected,
    highlightStyle,
    connectedStyle
  ]);

  return <>{RenderHandle}</>;
});

export const TargetHandle = (props: Props) => {
  return (
    <MyTargetHandle
      {...props}
      highlightStyle={{
        ...sourceCommonStyle,
        ...handleHighLightStyle
      }}
      connectedStyle={{
        ...sourceCommonStyle,
        ...handleConnectedStyle
      }}
    />
  );
};

export default <></>;
