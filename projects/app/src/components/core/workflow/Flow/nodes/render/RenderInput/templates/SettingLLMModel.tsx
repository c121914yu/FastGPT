import React, { useCallback } from 'react';
import type { RenderInputProps } from '../type';
import { useFlowProviderStore } from '../../../../FlowProvider';
import type { SettingAIDataType } from '@fastgpt/global/core/app/type.d';
import SettingLLMModel from '@/components/core/ai/SettingLLMModel';
import { NodeInputKeyEnum } from '@fastgpt/global/core/workflow/constants';

const SelectAiModelRender = ({ item, inputs = [], nodeId }: RenderInputProps) => {
  const { onChangeNode } = useFlowProviderStore();

  const onChangeModel = useCallback(
    (e: SettingAIDataType) => {
      for (const key in e) {
        const input = inputs.find((input) => input.key === key);
        input &&
          onChangeNode({
            nodeId,
            type: 'updateInput',
            key,
            value: {
              ...input,
              // @ts-ignore
              value: e[key]
            }
          });
      }
    },
    [inputs, nodeId, onChangeNode]
  );

  const llmModelData: SettingAIDataType = {
    model: inputs.find((input) => input.key === NodeInputKeyEnum.aiModel)?.value ?? '',
    maxToken: inputs.find((input) => input.key === NodeInputKeyEnum.aiChatMaxToken)?.value ?? 2048,
    temperature:
      inputs.find((input) => input.key === NodeInputKeyEnum.aiChatTemperature)?.value ?? 1,
    isResponseAnswerText: inputs.find(
      (input) => input.key === NodeInputKeyEnum.aiChatIsResponseText
    )?.value
  };

  return (
    <SettingLLMModel
      llmModelType={item.llmModelType}
      defaultData={llmModelData}
      onChange={onChangeModel}
    />
  );
};

export default React.memo(SelectAiModelRender);