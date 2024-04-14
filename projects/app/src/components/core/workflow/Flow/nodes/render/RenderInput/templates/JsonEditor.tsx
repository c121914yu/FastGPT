import React, { useCallback, useMemo } from 'react';
import type { RenderInputProps } from '../type';
import { useFlowProviderStore } from '../../../../FlowProvider';
import { useTranslation } from 'next-i18next';
import JSONEditor from '@fastgpt/web/components/common/Textarea/JsonEditor';
import {
  formatEditorVariablePickerIcon,
  getGuideModule,
  splitGuideModule
} from '@fastgpt/global/core/workflow/utils';

const JsonEditor = ({ inputs = [], item, nodeId }: RenderInputProps) => {
  const { t } = useTranslation();
  const { nodes, onChangeNode } = useFlowProviderStore();

  // get variable
  const variables = useMemo(() => {
    const globalVariables = formatEditorVariablePickerIcon(
      splitGuideModule(getGuideModule(nodes.map((node) => node.data)))?.variableModules || []
    );
    const moduleVariables = formatEditorVariablePickerIcon(
      inputs
        .filter((input) => input.canEdit)
        .map((item) => ({
          key: item.key,
          label: item.label
        }))
    );

    return [...globalVariables, ...moduleVariables];
  }, [inputs, nodes]);

  const update = useCallback(
    (value: string) => {
      onChangeNode({
        nodeId,
        type: 'updateInput',
        key: item.key,
        value: {
          ...item,
          value
        }
      });
    },
    [item, nodeId, onChangeNode]
  );

  const value = useMemo(() => {
    if (typeof item.value === 'string') {
      return item.value;
    }
    return JSON.stringify(item.value, null, 2);
  }, [item.value]);

  return (
    <JSONEditor
      bg={'myGray.50'}
      placeholder={item.placeholder}
      resize
      value={value}
      onChange={(e) => {
        update(e);
      }}
      variables={variables}
    />
  );
};

export default React.memo(JsonEditor);
