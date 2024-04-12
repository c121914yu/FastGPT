import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { RenderInputProps } from '../type';
import {
  Flex,
  Menu,
  MenuList,
  MenuItem,
  Button,
  useDisclosure,
  MenuButton,
  Box,
  css,
  ButtonProps,
  MenuItemProps
} from '@chakra-ui/react';
import { useFlowProviderStore } from '../../../../FlowProvider';
import { ChevronDownIcon } from '@chakra-ui/icons';
import MyIcon from '@fastgpt/web/components/common/Icon';

type SelectProps = {
  value?: [string, string];
  placeholder?: string;
  list: {
    label: string | React.ReactNode;
    value: string;
    children: {
      label: string;
      value: string;
    }[];
  }[];
  onSelect?: (val: any) => void;
  styles: ButtonProps;
};

const Reference = ({ item, nodeId }: RenderInputProps) => {
  const { onChangeNode } = useFlowProviderStore();

  return <Flex>引用</Flex>;
};

export default React.memo(Reference);

const menuItemStyles: MenuItemProps = {
  borderRadius: 'sm',
  py: 2,
  display: 'flex',
  alignItems: 'center',
  _hover: {
    backgroundColor: 'myWhite.600'
  },
  _notLast: {
    mb: 2
  }
};

const ReferSelector = ({ placeholder, value, list, onSelect, styles }: SelectProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState([list[0], list[0].children[0]]);

  const selectItemLabel = useMemo(() => {
    if (!value) {
      return [list[0], list[0].children[0]];
    }
    const firstColumn = list.find((item) => item.value === value[0]);
    if (!firstColumn) {
      return [list[0], list[0].children[0]];
    }
    const secondColumn = firstColumn.children.find((item) => item.value === value[1]);
    if (!secondColumn) {
      return [firstColumn, firstColumn.children[0]];
    }
    return [firstColumn, secondColumn];
  }, [list, value]);

  useEffect(() => {
    if (isOpen) {
      setSelectedItem(selectItemLabel);
    }
  }, [isOpen, selectItemLabel, setSelectedItem]);

  return (
    <Box
      css={css({
        '& div': {
          width: 'auto !important'
        }
      })}
    >
      <Menu
        autoSelect={false}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        strategy={'fixed'}
        matchWidth
      >
        <MenuButton
          as={Button}
          ref={ref}
          width={'100%'}
          px={3}
          rightIcon={<ChevronDownIcon />}
          variant={'whitePrimary'}
          textAlign={'left'}
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
        >
          {selectItemLabel ? (
            <Flex alignItems={'center'}>
              {selectItemLabel[0].label} {'>'} {selectItemLabel[1].label}
            </Flex>
          ) : (
            <Box>{placeholder}</Box>
          )}
        </MenuButton>

        <MenuList
          minW={'100% !important'}
          w={'auto'}
          px={'6px'}
          py={'6px'}
          border={'1px solid #fff'}
          boxShadow={
            '0px 2px 4px rgba(161, 167, 179, 0.25), 0px 0px 1px rgba(121, 141, 159, 0.25);'
          }
          zIndex={99}
          maxH={'40vh'}
          overflowY={'auto'}
        >
          {list.map((item) => (
            <MenuItem
              key={item.value}
              {...menuItemStyles}
              {...(selectedItem[0].value === item.value
                ? {
                    color: 'primary.500',
                    bg: 'myWhite.300'
                  }
                : {})}
              whiteSpace={'pre-wrap'}
            >
              {item.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};
