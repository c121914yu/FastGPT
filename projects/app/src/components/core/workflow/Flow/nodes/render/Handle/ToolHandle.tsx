import MyTooltip from '@/components/MyTooltip';
import { FlowValueTypeMap } from '@/web/core/workflow/constants/dataType';
import { Box, BoxProps } from '@chakra-ui/react';
import {
  WorkflowIOValueTypeEnum,
  NodeInputKeyEnum,
  NodeOutputKeyEnum
} from '@fastgpt/global/core/workflow/constants';
import { useTranslation } from 'next-i18next';
import { Connection, Handle, Position } from 'reactflow';
import { useFlowProviderStore } from '../../../FlowProvider';
import { useCallback } from 'react';
import { getHandleId } from '@fastgpt/global/core/workflow/utils';

type ToolHandleProps = BoxProps & {
  nodeId: string;
};
export const ToolTargetHandle = ({ nodeId }: ToolHandleProps) => {
  const { t } = useTranslation();
  const { connectingEdge, edges } = useFlowProviderStore();
  const handleId = NodeOutputKeyEnum.selectedTools;

  const connected = edges.some((edge) => edge.targetHandle === handleId);
  // if top handle is connected, return null
  const hidden =
    !connected &&
    (connectingEdge?.handleId !== NodeOutputKeyEnum.selectedTools ||
      edges.some((edge) => edge.targetHandle === getHandleId(nodeId, 'target', 'top')));

  const valueTypeMap = FlowValueTypeMap[WorkflowIOValueTypeEnum.tools];

  return (
    <MyTooltip
      label={t('app.module.type', {
        type: t(valueTypeMap?.label),
        description: valueTypeMap?.description
      })}
      shouldWrapChildren={false}
    >
      <Handle
        style={{
          borderRadius: '0',
          backgroundColor: 'transparent'
        }}
        type="target"
        id={handleId}
        position={Position.Top}
      >
        <Box
          w={'14px'}
          h={'14px'}
          border={'4px solid #5E8FFF'}
          transform={'translate(-40%,-30%) rotate(45deg)'}
          pointerEvents={'none'}
          visibility={hidden ? 'hidden' : 'visible'}
        />
      </Handle>
    </MyTooltip>
  );
};

export const ToolSourceHandle = ({ nodeId }: ToolHandleProps) => {
  const { t } = useTranslation();
  const { setEdges } = useFlowProviderStore();

  const valueTypeMap = FlowValueTypeMap[WorkflowIOValueTypeEnum.tools];

  /* onConnect edge, delete tool input and switch */
  const onConnect = useCallback(
    (e: Connection) => {
      setEdges((edges) =>
        edges.filter((edge) => {
          if (edge.target !== e.target) return true;
          if (edge.targetHandle === NodeOutputKeyEnum.selectedTools) return true;
          return false;
        })
      );
    },
    [setEdges]
  );

  return (
    <MyTooltip
      label={t('app.module.type', {
        type: t(valueTypeMap?.label),
        description: valueTypeMap?.description
      })}
      shouldWrapChildren={false}
    >
      <Handle
        style={{
          borderRadius: '0',
          backgroundColor: 'transparent'
        }}
        type="source"
        id={NodeOutputKeyEnum.selectedTools}
        position={Position.Bottom}
        onConnect={onConnect}
      >
        <Box
          w={'14px'}
          h={'14px'}
          border={'4px solid #5E8FFF'}
          transform={'translate(-40%,-30%) rotate(45deg)'}
          pointerEvents={'none'}
        />
      </Handle>
    </MyTooltip>
  );
};
