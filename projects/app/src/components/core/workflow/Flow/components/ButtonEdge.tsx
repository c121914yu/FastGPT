import React, { useCallback, useMemo } from 'react';
import { BezierEdge, getBezierPath, EdgeLabelRenderer, EdgeProps } from 'reactflow';
import { useFlowProviderStore } from '../FlowProvider';
import { Flex } from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { NodeOutputKeyEnum } from '@fastgpt/global/core/workflow/constants';

const ButtonEdge = (props: EdgeProps) => {
  const { nodes, onDelConnect, connectingEdge } = useFlowProviderStore();
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    sourceHandleId,
    style = {}
  } = props;

  const highlightEdge = useMemo(() => {
    const connectNode = nodes.find((node) => {
      return node.selected && (node.id === props.source || node.id === props.target);
    });
    return !!(connectNode || selected);
  }, [nodes, props.source, props.target, selected]);

  const [, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const isToolEdge = sourceHandleId === NodeOutputKeyEnum.selectedTools;

  const memoEdgeLabel = useMemo(() => {
    const arrowTransform = (() => {
      if (targetPosition === 'left') {
        return `translate(-85%, -50%) translate(${targetX}px,${targetY}px) rotate(0deg)`;
      }
      if (targetPosition === 'right') {
        return `translate(0%, -60%) translate(${targetX}px,${targetY}px) rotate(-180deg)`;
      }
      if (targetPosition === 'bottom') {
        return `translate(-55%, -20%) translate(${targetX}px,${targetY}px) rotate(-90deg)`;
      }
      if (targetPosition === 'top') {
        return `translate(-50%, -90%) translate(${targetX}px,${targetY}px) rotate(90deg)`;
      }
    })();
    return (
      <EdgeLabelRenderer>
        {highlightEdge && (
          <Flex
            alignItems={'center'}
            justifyContent={'center'}
            position={'absolute'}
            transform={`translate(-50%, -50%) translate(${labelX}px,${labelY}px)`}
            pointerEvents={'all'}
            w={'17px'}
            h={'17px'}
            bg={'white'}
            borderRadius={'17px'}
            cursor={'pointer'}
            zIndex={1000}
            onClick={() => onDelConnect(id)}
          >
            <MyIcon name={'core/workflow/closeEdge'} w={'100%'}></MyIcon>
          </Flex>
        )}
        {!isToolEdge && (
          <Flex
            alignItems={'center'}
            justifyContent={'center'}
            position={'absolute'}
            transform={arrowTransform}
            pointerEvents={'all'}
            w={'16px'}
            h={'16px'}
            bg={'white'}
            zIndex={highlightEdge ? 1000 : 0}
          >
            <MyIcon
              name={'common/rightArrowLight'}
              w={'100%'}
              {...(highlightEdge
                ? {
                    color: 'primary.500',
                    fontWeight: 'bold'
                  }
                : {
                    color: 'primary.300'
                  })}
            ></MyIcon>
          </Flex>
        )}
      </EdgeLabelRenderer>
    );
  }, [
    labelX,
    labelY,
    highlightEdge,
    isToolEdge,
    targetPosition,
    targetX,
    targetY,
    onDelConnect,
    id
  ]);

  const memoBezierEdge = useMemo(() => {
    const edgeStyle: React.CSSProperties = {
      ...style,
      ...(highlightEdge
        ? {
            strokeWidth: 4,
            stroke: '#3370ff'
          }
        : { strokeWidth: 2, zIndex: 2, stroke: '#94B5FF' })
    };

    return <BezierEdge {...props} style={edgeStyle} />;
  }, [style, highlightEdge, props]);

  return (
    <>
      {memoBezierEdge}
      {memoEdgeLabel}
    </>
  );
};

export default React.memo(ButtonEdge);
