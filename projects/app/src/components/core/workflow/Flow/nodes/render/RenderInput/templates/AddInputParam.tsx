import React, { useState } from 'react';
import type { RenderInputProps } from '../type';
import { Button } from '@chakra-ui/react';
import { SmallAddIcon } from '@chakra-ui/icons';
import { useTranslation } from 'next-i18next';
import { EditNodeFieldType } from '@fastgpt/global/core/workflow/node/type';
import dynamic from 'next/dynamic';
import { useFlowProviderStore } from '../../../../FlowProvider';

const FieldEditModal = dynamic(() => import('../../FieldEditModal'));

const AddInputParam = ({ inputs = [], item, nodeId }: RenderInputProps) => {
  const { t } = useTranslation();
  const { onChangeNode } = useFlowProviderStore();

  const [editField, setEditField] = useState<EditNodeFieldType>();

  return (
    <>
      <Button
        variant={'whitePrimary'}
        leftIcon={<SmallAddIcon />}
        onClick={() => {
          setEditField(item.defaultEditField || {});
        }}
      >
        {t('core.module.input.Add Input')}
      </Button>
      {!!editField && (
        <FieldEditModal
          editField={item.editField}
          defaultField={editField}
          keys={inputs.map((input) => input.key)}
          onClose={() => setEditField(undefined)}
          onSubmit={({ data }) => {
            onChangeNode({
              nodeId,
              type: 'addInput',
              key: data.key,
              value: {
                key: data.key,
                valueType: data.valueType,
                label: data.label,
                type: data.inputType,
                required: data.required,
                description: data.description,
                edit: true,
                editField: item.editField
              }
            });
            setEditField(undefined);
          }}
        />
      )}
    </>
  );
};

export default React.memo(AddInputParam);