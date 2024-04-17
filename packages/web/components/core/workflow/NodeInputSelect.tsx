import React, { useMemo, useRef } from 'react';
import MyMenu, { type Props as MyMenuProps } from '../../common/MyMenu';
import { FlowNodeInputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { Box, Button, Flex, useTheme } from '@chakra-ui/react';
import MyIcon from '../../common/Icon';
import { useTranslation } from 'next-i18next';
import { useConfirm } from '../../../hooks/useConfirm';

const NodeInputSelect = ({
  renderTypeList,
  renderTypeIndex = 0,
  onChange
}: {
  renderTypeList: string[];
  renderTypeIndex?: number;
  onChange: (e: string) => void;
}) => {
  const { t } = useTranslation();
  const { openConfirm, ConfirmModal } = useConfirm({
    title: t('core.workflow.Change input type tip')
  });
  const renderType = renderTypeList[renderTypeIndex];
  const theme = useTheme();

  const inputList = useRef([
    {
      type: FlowNodeInputTypeEnum.reference,
      icon: 'core/workflow/grout',
      title: 'reference',
      desc: 'xxxxx'
    },
    { type: FlowNodeInputTypeEnum.input, icon: 'more', title: 'input', desc: 'xxxxx' },
    { type: FlowNodeInputTypeEnum.numberInput, icon: 'more', title: 'numberInput', desc: 'xxxxx' },
    { type: FlowNodeInputTypeEnum.select, icon: 'more', title: 'select', desc: 'xxxxx' },
    { type: FlowNodeInputTypeEnum.slider, icon: 'more', title: 'slider', desc: 'xxxxx' },
    { type: FlowNodeInputTypeEnum.switch, icon: 'more', title: 'switch', desc: 'xxxxx' },
    { type: FlowNodeInputTypeEnum.textarea, icon: 'more', title: 'textarea', desc: 'xxxxx' },
    { type: FlowNodeInputTypeEnum.JSONEditor, icon: 'more', title: 'JSONEditor', desc: 'xxxxx' },
    {
      type: FlowNodeInputTypeEnum.addInputParam,
      icon: 'more',
      title: 'addInputParam',
      desc: 'xxxxx'
    },
    { type: FlowNodeInputTypeEnum.selectApp, icon: 'more', title: 'selectApp', desc: 'xxxxx' },
    {
      type: FlowNodeInputTypeEnum.selectLLMModel,
      icon: 'more',
      title: 'selectLLMModel',
      desc: 'xxxxx'
    },
    {
      type: FlowNodeInputTypeEnum.settingLLMModel,
      icon: 'more',
      title: 'settingLLMModel',
      desc: 'xxxxx'
    },
    {
      type: FlowNodeInputTypeEnum.selectDataset,
      icon: 'more',
      title: 'selectDataset',
      desc: 'xxxxx'
    },
    {
      type: FlowNodeInputTypeEnum.selectDatasetParamsModal,
      icon: 'more',
      title: 'selectDatasetParamsModal',
      desc: 'xxxxx'
    },
    {
      type: FlowNodeInputTypeEnum.settingDatasetQuotePrompt,
      icon: 'more',
      title: 'settingDatasetQuotePrompt',
      desc: 'xxxxx'
    },
    { type: FlowNodeInputTypeEnum.hidden, icon: 'more', title: 'hidden', desc: 'xxxxx' },
    { type: FlowNodeInputTypeEnum.custom, icon: 'more', title: 'custom', desc: 'xxxxx' }
  ]);

  const renderList = useMemo(
    () =>
      inputList.current.map((input) => ({
        label: (
          <Box>
            <Box fontWeight={'bold'}>{input.title}</Box>
            <Box fontSize={'sm'} color={'gray.500'}>
              {input.desc}
            </Box>
          </Box>
        ),
        icon: input.icon,
        renderType: input.type,
        isActive: renderType === input.type,
        onClick: () => onChange(input.type)
      })),
    [renderType]
  );

  const filterMenuList = useMemo(
    () => renderList.filter((item) => renderTypeList.includes(item.renderType)),
    [renderTypeList, renderList]
  );
  const renderTypeData = useMemo(
    () => inputList.current.find((item) => item.type === renderType) || inputList.current[0],
    [renderType]
  );

  return (
    <MyMenu
      offset={[0, -1]}
      Button={
        <Button
          size={'xs'}
          leftIcon={<MyIcon name={renderTypeData.icon as any} w={'14px'} />}
          variant={'grayBase'}
          border={theme.borders.base}
          borderRadius={'xs'}
        >
          <Box fontWeight={'medium'}>{renderTypeData.title}</Box>
        </Button>
      }
      menuList={filterMenuList}
    />
  );
};

export default React.memo(NodeInputSelect);
