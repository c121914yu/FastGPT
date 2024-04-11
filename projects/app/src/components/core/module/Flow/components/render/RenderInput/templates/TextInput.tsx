import React from 'react';
import type { RenderInputProps } from '../type';
import { Input } from '@chakra-ui/react';
import { onChangeNode } from '../../../../FlowProvider';
import dynamic from 'next/dynamic';

const components = {
  selectDataset: dynamic(() => import('./SelectDataset')),
  select: dynamic(() => import('./Select')),
  selectLLMModel: dynamic(() => import('./SelectLLMModel')),
  JSONEditor: dynamic(() => import('./JsonEditor')),
  textarea: dynamic(() => import('./Textarea')),
  switch: dynamic(() => import('./Switch'))
};
const TextInput = ({ item, moduleId }: RenderInputProps) => {
  const InputComponent = components[item.inputDataType as keyof typeof components];
  if (InputComponent) {
    return <InputComponent item={item} moduleId={moduleId} />;
  }

  return (
    <Input
      placeholder={item.placeholder}
      defaultValue={item.value}
      maxLength={item.maxLen}
      onBlur={(e) => {
        onChangeNode({
          moduleId,
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
