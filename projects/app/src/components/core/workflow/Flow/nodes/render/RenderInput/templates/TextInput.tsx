import React from 'react';
import type { RenderInputProps } from '../type';
import { Input } from '@chakra-ui/react';
import { onChangeNode } from '../../../../FlowProvider';

const TextInput = ({ item, nodeId }: RenderInputProps) => {
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
