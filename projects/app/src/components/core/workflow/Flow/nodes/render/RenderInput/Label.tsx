import { FlowNodeInputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useFlowProviderStore, useFlowProviderStoreType } from '../../../FlowProvider';
import { Box, Flex } from '@chakra-ui/react';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';

import dynamic from 'next/dynamic';
import NodeInputSelect from '@fastgpt/web/components/core/workflow/NodeInputSelect';

type Props = FlowNodeInputItemType & {
  nodeId: string;
  inputKey: string;
  mode: useFlowProviderStoreType['mode'];
};

const InputLabel = ({ nodeId, inputKey, mode, ...item }: Props) => {
  const { t } = useTranslation();
  const { onChangeNode } = useFlowProviderStore();
  const { required = false, description, label, selectedTypeIndex, renderTypeList } = item;

  const onChangeRenderType = useCallback(
    (e: string) => {
      const index = renderTypeList.findIndex((item) => item === e) || 0;

      onChangeNode({
        nodeId,
        type: 'updateInput',
        key: inputKey,
        value: {
          ...item,
          selectedTypeIndex: index
        }
      });
    },
    [inputKey, item, nodeId, onChangeNode, renderTypeList]
  );

  return (
    <Flex className="nodrag" cursor={'default'} alignItems={'center'} position={'relative'}>
      <Box position={'relative'}>
        {required && (
          <Box
            position={'absolute'}
            top={'-2px'}
            left={'-8px'}
            color={'red.500'}
            fontWeight={'bold'}
          >
            *
          </Box>
        )}
        {t(label)}
        {description && (
          <MyTooltip label={t(description)} forceShow>
            <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
          </MyTooltip>
        )}
      </Box>
      {renderTypeList.length > 1 && (
        <Box ml={1}>
          <NodeInputSelect
            renderTypeList={renderTypeList}
            renderTypeIndex={selectedTypeIndex}
            onChange={onChangeRenderType}
          />
        </Box>
      )}
    </Flex>
  );
};

export default React.memo(InputLabel);
