import React, { useRef, forwardRef, useMemo, useCallback, useState } from 'react';
import { Button, useDisclosure, Box, Flex, useOutsideClick } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { MultipleSelectProps } from './type';
import EmptyTip from '../EmptyTip';
import { useTranslation } from 'next-i18next';

const MultipleRowSelect = ({
  placeholder,
  label,
  value = [],
  list,
  emptyTip,
  maxH = 300,
  onSelect,
  styles
}: MultipleSelectProps) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cloneValue, setCloneValue] = useState(value);

  useOutsideClick({
    ref: ref,
    handler: onClose
  });

  const RenderList = useCallback(
    ({ index, list }: { index: number; list: MultipleSelectProps['list'] }) => {
      const selectedValue = cloneValue[index];
      const selectedIndex = list.findIndex((item) => item.value === selectedValue);
      const children = list[selectedIndex]?.children || [];
      const hasChildren = list.some((item) => item.children && item.children?.length > 0);

      return (
        <>
          <Box
            flex={'1 0 0'}
            px={2}
            borderLeft={index !== 0 ? 'base' : 'none'}
            maxH={`${maxH}px`}
            overflowY={'auto'}
          >
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
                {...(item.value === selectedValue
                  ? {
                      color: 'primary.600'
                    }
                  : {
                      onClick: () => {
                        const newValue = [...cloneValue];
                        newValue[index] = item.value;
                        setCloneValue(newValue);
                        if (!hasChildren) {
                          onSelect(newValue);
                          onClose();
                        }
                      }
                    })}
              >
                {item.label}
              </Flex>
            ))}
            {list.length === 0 && (
              <EmptyTip text={emptyTip ?? t('common.MultipleRowSelect.No data')} pt={1} pb={3} />
            )}
          </Box>
          {children.length > 0 && <RenderList list={children} index={index + 1} />}
        </>
      );
    },
    [cloneValue]
  );

  const onOpenSelect = useCallback(() => {
    setCloneValue(value);
    onOpen();
  }, [value, onOpen]);

  return (
    <Box ref={ref} position={'relative'}>
      <Button
        justifyContent={'space-between'}
        width={'100%'}
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
        onClick={() => (isOpen ? onClose() : onOpenSelect())}
      >
        <Box>{label ?? placeholder}</Box>
      </Button>
      {isOpen && (
        <Flex
          position={'absolute'}
          top={'40px'}
          py={2}
          bg={'white'}
          border={'1px solid #fff'}
          boxShadow={'5'}
          borderRadius={'md'}
          zIndex={1}
          minW={'100%'}
        >
          <RenderList list={list} index={0} />
        </Flex>
      )}
    </Box>
  );
};

export default React.memo(MultipleRowSelect);