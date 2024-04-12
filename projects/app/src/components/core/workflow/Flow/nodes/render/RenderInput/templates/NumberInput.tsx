import React from 'react';
import type { RenderInputProps } from '../type';
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper
} from '@chakra-ui/react';
import { useFlowProviderStore } from '../../../../FlowProvider';

const NumberInputRender = ({ item, nodeId }: RenderInputProps) => {
  const { onChangeNode } = useFlowProviderStore();

  return (
    <NumberInput
      defaultValue={item.value}
      min={item.min}
      max={item.max}
      onChange={(e) => {
        onChangeNode({
          nodeId,
          type: 'updateInput',
          key: item.key,
          value: {
            ...item,
            value: Number(e)
          }
        });
      }}
    >
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  );
};

export default React.memo(NumberInputRender);
