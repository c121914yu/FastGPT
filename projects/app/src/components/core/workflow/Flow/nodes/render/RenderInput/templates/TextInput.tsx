import React from 'react';
import type { RenderInputProps } from '../type';
import { Input } from '@chakra-ui/react';
import { useFlowProviderStore } from '../../../../FlowProvider';

const TextInput = ({ item, nodeId }: RenderInputProps) => {
  const { onChangeNode } = useFlowProviderStore();

  return (
    <Input
      placeholder={item.placeholder}
      defaultValue={item.value}
      onBlur={(e) => {
        onChangeNode({
          nodeId,
          type: 'updateInput',
          key: item.key,
          value: {
            ...item,
            value: e.target.value
          }
        });
      }}
    />
  );
};

export default React.memo(TextInput);