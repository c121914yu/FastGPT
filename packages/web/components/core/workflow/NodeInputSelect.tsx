import React, { useMemo, useRef } from 'react';
import MyMenu, { type Props as MyMenuProps } from '../../common/MyMenu';
import { FlowNodeInputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { Box, Button, Flex } from '@chakra-ui/react';
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

  const inputList = useRef([
    {
      type: FlowNodeInputTypeEnum.reference,
      icon: 'more',
      title: t('core.workflow.inputType.Reference')
    },
    {
      type: FlowNodeInputTypeEnum.input,
      icon: 'more',
      title: t('core.workflow.inputType.Manual input')
    },
    {
      type: FlowNodeInputTypeEnum.numberInput,
      icon: 'more',
      title: t('core.workflow.inputType.Manual input')
    },
    {
      type: FlowNodeInputTypeEnum.select,
      icon: 'more',
      title: t('core.workflow.inputType.Manual select')
    },
    {
      type: FlowNodeInputTypeEnum.slider,
      icon: 'more',
      title: t('core.workflow.inputType.Manual input')
    },
    {
      type: FlowNodeInputTypeEnum.switch,
      icon: 'more',
      title: t('core.workflow.inputType.Manual select')
    },
    {
      type: FlowNodeInputTypeEnum.textarea,
      icon: 'more',
      title: t('core.workflow.inputType.Manual input')
    },
    {
      type: FlowNodeInputTypeEnum.JSONEditor,
      icon: 'more',
      title: t('core.workflow.inputType.Manual input')
    },
    {
      type: FlowNodeInputTypeEnum.addInputParam,
      icon: 'more',
      title: t('core.workflow.inputType.dynamicTargetInput')
    },
    {
      type: FlowNodeInputTypeEnum.selectApp,
      icon: 'more',
      title: t('core.workflow.inputType.Manual select')
    },
    {
      type: FlowNodeInputTypeEnum.selectLLMModel,
      icon: 'more',
      title: t('core.workflow.inputType.Manual select')
    },
    {
      type: FlowNodeInputTypeEnum.settingLLMModel,
      icon: 'more',
      title: t('core.workflow.inputType.Manual select')
    },
    {
      type: FlowNodeInputTypeEnum.selectDataset,
      icon: 'more',
      title: t('core.workflow.inputType.Manual select')
    },
    {
      type: FlowNodeInputTypeEnum.selectDatasetParamsModal,
      icon: 'more',
      title: t('core.workflow.inputType.Manual select')
    },
    {
      type: FlowNodeInputTypeEnum.settingDatasetQuotePrompt,
      icon: 'more',
      title: t('core.workflow.inputType.Manual input')
    },
    {
      type: FlowNodeInputTypeEnum.hidden,
      icon: 'more',
      title: t('core.workflow.inputType.Manual input')
    },
    {
      type: FlowNodeInputTypeEnum.custom,
      icon: 'more',
      title: t('core.workflow.inputType.Manual input')
    }
  ]);

  const renderList = useMemo(
    () =>
      inputList.current.map((input) => ({
        label: input.title,
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
        >
          <Box>{renderTypeData.title}</Box>
        </Button>
      }
      menuList={filterMenuList}
    />
  );
};

export default React.memo(NodeInputSelect);
