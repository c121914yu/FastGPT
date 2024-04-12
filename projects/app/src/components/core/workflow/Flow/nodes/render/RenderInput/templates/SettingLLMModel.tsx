import React, { useCallback } from 'react';
import type { RenderInputProps } from '../type';
import { useFlowProviderStore } from '../../../../FlowProvider';
import { SettingAIDataType } from '@fastgpt/global/core/workflow/node/type';
import SettingLLMModel from '@/components/core/ai/SettingLLMModel';
import { ModuleInputKeyEnum } from '@fastgpt/global/core/workflow/constants';

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
    model: inputs.find((input) => input.key === ModuleInputKeyEnum.aiModel)?.value ?? '',
    maxToken:
      inputs.find((input) => input.key === ModuleInputKeyEnum.aiChatMaxToken)?.value ?? 2048,
    temperature:
      inputs.find((input) => input.key === ModuleInputKeyEnum.aiChatTemperature)?.value ?? 1,
    isResponseAnswerText: inputs.find(
      (input) => input.key === ModuleInputKeyEnum.aiChatIsResponseText
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
