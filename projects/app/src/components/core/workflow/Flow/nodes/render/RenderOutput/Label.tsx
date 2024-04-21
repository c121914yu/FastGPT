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
  outputs,
  output
}: {
  nodeId: string;
  outputs: FlowNodeOutputItemType[];
  output: FlowNodeOutputItemType;
}) => {
  const { t } = useTranslation();
  const { label = '', description, valueType } = output;

  const valueTypeLabel = useMemo(
    () => (valueType ? t(FlowValueTypeMap[valueType]?.label) : '-'),
    [t, valueType]
  );

  const Render = useMemo(() => {
    return (
      <Box position={'relative'}>
        <Flex
          className="nodrag"
          cursor={'default'}
          alignItems={'center'}
          fontWeight={'medium'}
          color={'myGray.600'}
          {...(output.type === FlowNodeOutputTypeEnum.source
            ? {
                flexDirection: 'row-reverse'
              }
            : {})}
        >
          <Box position={'relative'}>{t(label)}</Box>
          {description && (
            <MyTooltip label={t(description)} forceShow>
              <QuestionOutlineIcon display={['none', 'inline']} />
            </MyTooltip>
          )}
          <Box
            bg={'myGray.100'}
            color={'myGray.500'}
            border={'base'}
            borderRadius={'sm'}
            mx={2}
            px={1}
            py={0.5}
            fontSize={'11px'}
          >
            {valueTypeLabel}
          </Box>
        </Flex>
        {output.type === FlowNodeOutputTypeEnum.source && (
          <SourceHandle
            nodeId={nodeId}
            handleId={getHandleId(nodeId, 'source', output.key)}
            translate={[26, 0]}
            position={Position.Right}
          />
        )}
      </Box>
    );
  }, [description, output.key, output.type, label, nodeId, t, valueTypeLabel]);

  return Render;
};

export default React.memo(OutputLabel);
