import React, { useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useFlowProviderStore } from '../../../FlowProvider';
import { SmallAddIcon } from '@chakra-ui/icons';
import { handleHighLightStyle, sourceCommonStyle, sourceConnectedStyle } from './style';

type Props = {
  nodeId: string;
  handleId: string;
  transformX?: number;
};

const MySourceHandle = React.memo(function MyHandlee({
  nodeId,
  transformX,
  handleId,
  position,
  activeStyle,
  connectedStyle
}: Props & {
  position: Position;
  activeStyle: Record<string, any>;
  connectedStyle: Record<string, any>;
}) {
  const { nodes, hoverNodeId, edges, connectingEdge } = useFlowProviderStore();
  const nodeIsHover = hoverNodeId === nodeId;
  const connected = edges.some((edge) => edge.sourceHandle === handleId);
  const node = useMemo(() => nodes.find((node) => node.data.nodeId === nodeId), [nodes, nodeId]);

  const RenderHandle = useMemo(() => {
    if (!node) return null;
    const { styles, showAddIcon } = (() => {
      if (nodeIsHover || node.selected || connectingEdge?.handleId === handleId) {
        return {
          styles: {
            ...activeStyle,
            ...(transformX && {
              transform: `translate(${transformX}px,-50%)`
            })
          },
          showAddIcon: true
        };
      }

      if (connected) {
        return {
          styles: {
            ...connectedStyle,
            ...(transformX && {
              transform: `translate(${transformX - 2}px,-50%)`
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
                ...(transformX && {
                  transform: `translate(${transformX - 7}px,-50%)`
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
    activeStyle,
    connected,
    connectedStyle,
    connectingEdge?.handleId,
    handleId,
    node,
    nodeIsHover,
    position,
    transformX
  ]);

  return <>{RenderHandle}</>;
});

export const SourceHandle = (props: Props) => {
  return (
    <MySourceHandle
      {...props}
      position={Position.Right}
      activeStyle={{
        ...sourceCommonStyle,
        ...handleHighLightStyle
      }}
      connectedStyle={{
        ...sourceCommonStyle,
        ...sourceConnectedStyle
      }}
    />
  );
};

export default React.memo(MySourceHandle);
