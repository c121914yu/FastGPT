import React, { useState } from 'react';
import type { RenderOutputProps } from '../type';
import { useFlowProviderStore } from '../../../../FlowProvider';
import { Box, Button, Flex } from '@chakra-ui/react';
import { SmallAddIcon } from '@chakra-ui/icons';
import { useTranslation } from 'next-i18next';

import dynamic from 'next/dynamic';
import { EditNodeFieldType, EditOutputFieldMapType } from '@fastgpt/global/core/workflow/node/type';

const FieldEditModal = dynamic(() => import('../../FieldEditModal'));

const defaultEditField: EditOutputFieldMapType = {
  key: true,
  valueType: true,
  description: true
};

const AddOutputParam = ({ outputs = [], item, nodeId }: RenderOutputProps) => {
  const { t } = useTranslation();
  const { onChangeNode } = useFlowProviderStore();
  const [editField, setEditField] = useState<EditNodeFieldType>();

  return (
    <Box>
      <Box>
        <Flex className="nodrag" cursor={'default'} alignItems={'center'} position={'relative'}>
          <Box position={'relative'} fontWeight={'medium'}>
            {t('core.workflow.Custom outputs')}
          </Box>
          <Box flex={'1 0 0'} />
          <Button
            variant={'whitePrimary'}
            leftIcon={<SmallAddIcon />}
            iconSpacing={1}
            size={'sm'}
            mr={'-5px'}
            onClick={() => setEditField(defaultEditField)}
          >
            {t('core.module.output.Add Output')}
          </Button>
        </Flex>
      </Box>
      {!!editField && (
        <FieldEditModal
          // editField={item.editField}
          editField={{
            key: true,
            valueType: true,
            description: true
          }}
          defaultField={editField}
          keys={outputs.map((output) => output.key)}
          onClose={() => setEditField(undefined)}
          onSubmit={({ data }) => {
            onChangeNode({
              nodeId,
              type: 'addOutput',
              key: data.key,
              value: {
                type: data.outputType,
                valueType: data.valueType,
                key: data.key,
                label: data.label,
                description: data.description,
                required: data.required,
                defaultValue: data.defaultValue,
                edit: true,
                editField: item.editField,
                targets: []
              }
            });
            setEditField(undefined);
          }}
        />
      )}
    </Box>
  );
};

export default React.memo(AddOutputParam);
