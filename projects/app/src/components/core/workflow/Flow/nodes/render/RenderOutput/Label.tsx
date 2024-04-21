import { FlowNodeOutputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { Box, Flex, useTheme } from '@chakra-ui/react';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { FlowNodeOutputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { SourceHandle } from '../Handle';
import { getHandleId } from '@fastgpt/global/core/workflow/utils';
import { Position } from 'reactflow';
import { FlowValueTypeMap } from '@/web/core/workflow/constants/dataType';

const OutputLabel = ({
  nodeId,
  outputKey,
  outputs,
  ...item
}: FlowNodeOutputItemType & {
  outputKey: string;
  nodeId: string;
  outputs: FlowNodeOutputItemType[];
}) => {
  const { t } = useTranslation();
  const { label = '', description, valueType } = item;

  const valueTypeLabel = useMemo(
    () => (valueType ? t(FlowValueTypeMap[valueType]?.label) : '-'),
    [t, valueType]
  );

  const Render = useMemo(() => {
    return (
      <Flex
        className="nodrag"
        cursor={'default'}
        alignItems={'center'}
        position={'relative'}
        fontWeight={'medium'}
        color={'myGray.600'}
      >
        <Box position={'relative'}>{t(label)}</Box>
        {description && (
          <MyTooltip label={t(description)} forceShow>
            <QuestionOutlineIcon display={['none', 'inline']} mr={1} />
          </MyTooltip>
        )}
        <Box
          bg={'myGray.100'}
          color={'myGray.500'}
          border={'base'}
          borderRadius={'sm'}
          ml={2}
          px={1}
          py={0.5}
          fontSize={'11px'}
        >
          {valueTypeLabel}
        </Box>
        {item.type === FlowNodeOutputTypeEnum.source && (
          <SourceHandle
            nodeId={nodeId}
            handleId={getHandleId(nodeId, 'source', item.key)}
            translate={[26, 0]}
            position={Position.Right}
          />
        )}
      </Flex>
    );
  }, [description, item.key, item.type, label, nodeId, t, valueTypeLabel]);

  return Render;
};

export default React.memo(OutputLabel);
