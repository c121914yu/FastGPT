import { FlowNodeOutputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Box, Flex } from '@chakra-ui/react';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { FlowNodeOutputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { SourceHandle } from '../Handle';
import { getHandleId } from '@fastgpt/global/core/workflow/utils';

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
  const { label = '', description } = item;

  return (
    <Flex
      className="nodrag"
      cursor={'default'}
      justifyContent={'right'}
      alignItems={'center'}
      position={'relative'}
    >
      {description && (
        <MyTooltip label={t(description)} forceShow>
          <QuestionOutlineIcon display={['none', 'inline']} mr={1} />
        </MyTooltip>
      )}
      <Box position={'relative'}>{t(label)}</Box>
      {item.type === FlowNodeOutputTypeEnum.source && (
        <SourceHandle
          nodeId={nodeId}
          handleId={getHandleId(nodeId, 'source', item.key)}
          translate={[20, 0]}
          position="right"
        />
      )}
    </Flex>
  );
};

export default React.memo(OutputLabel);