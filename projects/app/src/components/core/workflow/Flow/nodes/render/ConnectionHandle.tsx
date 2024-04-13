import React, { useMemo } from 'react';
import { Handle, Position, useStore } from 'reactflow';
import { useTranslation } from 'next-i18next';
import { useFlowProviderStore } from '../../FlowProvider';
import { SmallAddIcon } from '@chakra-ui/icons';
import {
  primaryColor,
  sourceCommonStyle,
  sourceConnectedStyle,
  sourceHoverStyle
} from '@/web/core/workflow/constants/handleStyle';

const sourceConnectedStyles = {
  ...sourceConnectedStyle,
  transform: 'translate(3px,-50%)'
};
const sourceHoverStyles = {
  ...sourceHoverStyle,
  transform: 'translate(5px,-50%)'
};

export const ConnectionSourceHandle = ({
  nodeId,
  isHover
}: {
  nodeId: string;
  isHover: boolean;
}) => {
  const { nodes, edges, connectingEdge } = useFlowProviderStore();
  const { t } = useTranslation();

  const node = useMemo(() => nodes.find((node) => node.data.nodeId === nodeId), [nodes, nodeId]);

  /* not node/not connecting node, hidden */
  const showSourceHandle = useMemo(() => {
    if (!node) return false;
    if (connectingEdge && connectingEdge.nodeId !== nodeId) return false;
    return true;
  }, [connectingEdge, node, nodeId]);

  const RightHandle = useMemo(() => {
    if (!node || !node.data?.sourceHandle?.right) return null;

    const handleId = `${nodeId}-right`;
    const connected = edges.some((edge) => edge.sourceHandle === handleId);

    const { styles, showAddIcon } = (() => {
      if (connected || connectingEdge?.handleId === handleId) {
        return {
          styles: {
            ...sourceCommonStyle,
            ...sourceConnectedStyles
          },
          showAddIcon: false
        };
      }
      if ((isHover || node.selected) && connectingEdge?.handleId !== handleId) {
        return {
          styles: {
            ...sourceCommonStyle,
            ...sourceHoverStyles
          },
          showAddIcon: true
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
                visibility: 'hidden'
              }
        }
        type="source"
        id={handleId}
        position={Position.Right}
      >
        {showAddIcon && (
          <SmallAddIcon pointerEvents={'none'} color={'primary.600'} fontWeight={'bold'} />
        )}
      </Handle>
    );
  }, [connectingEdge?.handleId, edges, isHover, node, nodeId]);

  return showSourceHandle ? <>{RightHandle}</> : null;
};

export const ConnectionTargetHandle = ({ nodeId }: { nodeId: string }) => {
  const { nodes, edges, connectingEdge } = useFlowProviderStore();

  const { t } = useTranslation();

  const node = useMemo(() => nodes.find((node) => node.data.nodeId === nodeId), [nodes, nodeId]);

  const showHandle = useMemo(() => {
    if (!node) return false;
    if (connectingEdge && connectingEdge.nodeId === nodeId) return false;
    return true;
  }, [connectingEdge, node, nodeId]);

  const LeftHandle = useMemo(() => {
    if (!node || !node.data?.targetHandle?.left) return null;

    const handleId = `${nodeId}-left`;
    const connected = edges.some((edge) => edge.targetHandle === handleId);

    return (
      <Handle
        style={
          !!connectingEdge || connected
            ? {
                width: '14px',
                height: '14px',
                transform: 'translate(-2px, -50%)',
                borderColor: primaryColor,
                backgroundColor: 'white',
                borderWidth: '3px',
                transition: 'all 0.1s'
              }
            : {
                visibility: 'hidden'
              }
        }
        type="target"
        id={handleId}
        position={Position.Left}
      />
    );
  }, [connectingEdge, edges, node, nodeId]);

  return showHandle ? <>{LeftHandle}</> : null;
};

export default <></>;
