import { EditNodeFieldType } from '@fastgpt/global/core/workflow/node/type';
import { FlowNodeOutputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Box, Flex } from '@chakra-ui/react';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import dynamic from 'next/dynamic';
import { useFlowProviderStore } from '../../../FlowProvider';

const FieldEditModal = dynamic(() => import('../FieldEditModal'));

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
  const { onChangeNode } = useFlowProviderStore();
  const { label = '', description } = item;
  const [editField, setEditField] = useState<EditNodeFieldType>();

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
    </Flex>
  );
};

export default React.memo(OutputLabel);
