import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RenderInputProps } from '../type';
import { Flex, Button, useDisclosure, Box, ButtonProps, useOutsideClick } from '@chakra-ui/react';
import { useFlowProviderStore } from '../../../../FlowProvider';
import { ChevronDownIcon } from '@chakra-ui/icons';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { computedNodeInputReference } from '@/web/core/workflow/utils';
import { useTranslation } from 'next-i18next';
import { WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import EmptyTip from '@fastgpt/web/components/common/EmptyTip';
import type { ReferenceValueProps } from '@fastgpt/global/core/workflow/type/io';
import Avatar from '@/components/Avatar';

type SelectProps = {
  value?: ReferenceValueProps;
  placeholder?: string;
  list: {
    label: string | React.ReactNode;
    value: string;
    children: {
      label: string;
      value: string;
    }[];
  }[];
  onSelect: (val: ReferenceValueProps) => void;
  styles?: ButtonProps;
};

const Reference = ({ item, nodeId }: RenderInputProps) => {
  const { t } = useTranslation();
  const { onChangeNode } = useFlowProviderStore();

  const onSelect = useCallback(
    (e: any) => {
      onChangeNode({
        nodeId,
        type: 'updateInput',
        key: item.key,
        value: {
          ...item,
          value: e
        }
      });
    },
    [item, nodeId, onChangeNode]
  );

  const { referenceList, formatValue } = useReference({
    nodeId,
    valueType: item.valueType,
    value: item.value
  });

  return (
    <ReferSelector
      placeholder={t(item.referencePlaceholder || '选择引用变量')}
      list={referenceList}
      value={formatValue}
      onSelect={onSelect}
    />
  );
};

export default React.memo(Reference);

export const useReference = ({
  nodeId,
  valueType,
  value
}: {
  nodeId: string;
  valueType?: WorkflowIOValueTypeEnum;
  value?: any;
}) => {
  const { t } = useTranslation();
  const { nodeList, edges } = useFlowProviderStore();

  const referenceList = useMemo(() => {
    const sourceNodes = computedNodeInputReference({
      nodeId,
      nodes: nodeList,
      edges: edges
    });

    if (!sourceNodes) return [];

    // 转换为 select 的数据结构
    const list: SelectProps['list'] = sourceNodes
      .map((node) => {
        return {
          label: (
            <Flex alignItems={'center'}>
              <Avatar mr={1} src={node.avatar} w={'14px'} borderRadius={'ms'} />
              <Box>{node.name}</Box>
            </Flex>
          ),
          value: node.nodeId,
          children: node.outputs
            .filter(
              (output) =>
                valueType === WorkflowIOValueTypeEnum.any ||
                output.valueType === WorkflowIOValueTypeEnum.any ||
                output.valueType === valueType
            )
            .map((output) => {
              return {
                label: t(output.label || ''),
                value: output.id
              };
            })
        };
      })
      .filter((item) => item.children.length > 0);

    return list;
  }, [edges, nodeId, nodeList, t, valueType]);

  const formatValue = useMemo(() => {
    if (
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === 'string' &&
      typeof value[1] === 'string'
    ) {
      return value as ReferenceValueProps;
    }
    return undefined;
  }, [value]);

  return {
    referenceList,
    formatValue
  };
};
export const ReferSelector = ({ placeholder, value, list = [], onSelect, styles }: SelectProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNodeReference, setSelectedItem] = useState<ReferenceValueProps>();

  const selectedNodeChildren = useMemo(() => {
    if (!selectedNodeReference) {
      return [];
    }
    const firstColumn = list.find((item) => item.value === selectedNodeReference[0]);
    if (!firstColumn) {
      return [];
    }
    return firstColumn.children;
  }, [list, selectedNodeReference]);

  const selectItemLabel = useMemo(() => {
    if (!value) {
      return;
    }
    const firstColumn = list.find((item) => item.value === value[0]);
    if (!firstColumn) {
      return;
    }
    const secondColumn = firstColumn.children.find((item) => item.value === value[1]);
    if (!secondColumn) {
      return;
    }
    return [firstColumn, secondColumn];
  }, [list, value]);

  useOutsideClick({
    ref: ref,
    handler: onClose
  });

  const onSelectReference = useCallback(
    (e: string) => {
      if (!selectedNodeReference?.[0]) {
        return;
      }
      onSelect([selectedNodeReference[0], e]);
      onClose();
    },
    [onClose, onSelect, selectedNodeReference]
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedItem(value);
    }
  }, [isOpen, value]);

  return (
    <Box ref={ref} position={'relative'}>
      <Button
        justifyContent={'space-between'}
        width={'100%'}
        minW={'200px'}
        rightIcon={<ChevronDownIcon />}
        variant={'whiteFlow'}
        _active={{
          transform: 'none'
        }}
        {...(isOpen
          ? {
              boxShadow: '0px 0px 4px #A8DBFF',
              borderColor: 'primary.500'
            }
          : {})}
        {...styles}
        onClick={() => (isOpen ? onClose() : onOpen())}
      >
        {selectItemLabel ? (
          <Flex alignItems={'center'}>
            {selectItemLabel[0].label}
            <MyIcon name={'common/rightArrowLight'} mx={1} w={'14px'}></MyIcon>
            {selectItemLabel[1].label}
          </Flex>
        ) : (
          <Box>{placeholder}</Box>
        )}
      </Button>
      {/* picker */}
      {isOpen && (
        <Flex
          position={'absolute'}
          top={'40px'}
          p={2}
          bg={'white'}
          border={'1px solid #fff'}
          boxShadow={'5'}
          borderRadius={'md'}
          zIndex={1}
          minW={'100%'}
          maxW={'500px'}
          w={'auto'}
        >
          <Box flex={1} pr={2}>
            {list.map((item) => (
              <Flex
                key={item.value}
                py={2}
                cursor={'pointer'}
                px={2}
                borderRadius={'md'}
                whiteSpace={'nowrap'}
                _hover={{
                  bg: 'primary.50',
                  color: 'primary.600'
                }}
                {...(item.value === selectedNodeReference?.[0]
                  ? {
                      color: 'primary.600'
                    }
                  : {
                      onClick: () => {
                        setSelectedItem([item.value, undefined]);
                      }
                    })}
              >
                {item.label}
              </Flex>
            ))}
            {list.length === 0 && <EmptyTip text={'没有可用的变量'} pt={1} pb={3} />}
          </Box>
          {selectedNodeReference?.[0] && selectedNodeChildren.length > 0 && (
            <Box borderLeft={'base'} pl={2} flex={1}>
              {selectedNodeChildren.map((item) => (
                <Flex
                  key={item.value}
                  py={2}
                  cursor={'pointer'}
                  px={2}
                  borderRadius={'md'}
                  whiteSpace={'nowrap'}
                  _hover={{
                    bg: 'primary.50',
                    color: 'primary.600'
                  }}
                  {...(item.value === selectedNodeReference?.[1]
                    ? {
                        color: 'primary.600'
                      }
                    : {})}
                  onClick={() => {
                    onSelectReference(item.value);
                  }}
                >
                  {item.label}
                </Flex>
              ))}
            </Box>
          )}
        </Flex>
      )}
    </Box>
  );
};
