import React, { useCallback, useMemo } from 'react';
import { Box, Flex, Button, IconButton } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import dynamic from 'next/dynamic';

import MyIcon from '@fastgpt/web/components/common/Icon';
import { useBeforeunload } from '@fastgpt/web/hooks/useBeforeunload';
import { useContextSelector } from 'use-context-selector';
import { WorkflowContext } from '@/components/core/workflow/context';
import { useInterval } from 'ahooks';
import { AppContext, TabEnum } from '../context';
import RouteTab from '../RouteTab';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import PopoverConfirm from '@fastgpt/web/components/common/MyPopover/PopoverConfirm';
import { useRouter } from 'next/router';

import AppCard from '../WorkflowComponents/AppCard';
const PublishHistories = dynamic(
  () => import('@/components/core/workflow/components/PublishHistoriesSlider')
);

const Header = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const { appDetail, onPublish, currentTab } = useContextSelector(AppContext, (v) => v);
  const isV2Workflow = appDetail?.version === 'v2';

  const {
    flowData2StoreDataAndCheck,
    onSaveWorkflow,
    setIsShowVersionHistories,
    isShowVersionHistories
  } = useContextSelector(WorkflowContext, (v) => v);

  const onclickPublish = useCallback(async () => {
    const data = flowData2StoreDataAndCheck();
    if (data) {
      await onPublish({
        ...data,
        chatConfig: appDetail.chatConfig,
        //@ts-ignore
        version: 'v2'
      });
    }
  }, [flowData2StoreDataAndCheck, onPublish, appDetail.chatConfig]);

  const saveAndBack = useCallback(async () => {
    try {
      await onSaveWorkflow();
      router.push('/app/list');
    } catch (error) {}
  }, [onSaveWorkflow, router]);
  // effect
  useBeforeunload({
    callback: onSaveWorkflow,
    tip: t('core.common.tip.leave page')
  });
  useInterval(() => {
    if (!appDetail._id) return;
    onSaveWorkflow();
  }, 40000);

  const Render = useMemo(() => {
    return (
      <>
        {/* {!isPc && (
          <Flex pt={2} justifyContent={'center'}>
            <RouteTab />
          </Flex>
        )} */}
        <Flex
          mt={[2, 0]}
          py={3}
          pl={[2, 4]}
          pr={[2, 6]}
          borderBottom={'base'}
          alignItems={'center'}
          userSelect={'none'}
          h={'67px'}
          {...(currentTab === TabEnum.appEdit
            ? {
                bg: 'myGray.25'
              }
            : {
                bg: 'transparent',
                borderBottomColor: 'transparent'
              })}
        >
          {/* back */}
          <MyIcon
            name={'common/leftArrowLight'}
            w={'1.75rem'}
            cursor={'pointer'}
            onClick={saveAndBack}
          />
          {/* app info */}
          <Box ml={1}>
            <AppCard
              showSaveStatus={
                !isShowVersionHistories && isV2Workflow && currentTab === TabEnum.appEdit
              }
            />
          </Box>

          {/* {isPc && (
            <Box position={'absolute'} left={'50%'} transform={'translateX(-50%)'}>
              <RouteTab />
            </Box>
          )} */}
          <Box flex={1} />

          {currentTab === TabEnum.appEdit && (
            <>
              {!isShowVersionHistories && (
                <IconButton
                  // mr={[2, 4]}
                  icon={<MyIcon name={'history'} w={'18px'} />}
                  aria-label={''}
                  size={'sm'}
                  w={'30px'}
                  variant={'whitePrimary'}
                  onClick={() => setIsShowVersionHistories(true)}
                />
              )}
              {/* <Button
                size={'sm'}
                leftIcon={<MyIcon name={'core/workflow/debug'} w={['14px', '16px']} />}
                variant={'whitePrimary'}
                onClick={async () => {
                  const data = flowData2StoreDataAndCheck();
                  if (data) {
                    setWorkflowTestData(data);
                  }
                }}
              >
                {t('core.workflow.Debug')}
              </Button> */}

              {!isShowVersionHistories && (
                <PopoverConfirm
                  showCancel
                  content={t('core.app.Publish Confirm')}
                  Trigger={
                    <Button
                      ml={[2, 4]}
                      size={'sm'}
                      leftIcon={<MyIcon name={'common/publishFill'} w={['14px', '16px']} />}
                    >
                      {t('core.app.Publish')}
                    </Button>
                  }
                  onConfirm={() => onclickPublish()}
                />
              )}
            </>
          )}
        </Flex>
        {isShowVersionHistories && <PublishHistories />}
      </>
    );
  }, [
    currentTab,
    isShowVersionHistories,
    isV2Workflow,
    onclickPublish,
    saveAndBack,
    setIsShowVersionHistories,
    t
  ]);

  return Render;
};

export default React.memo(Header);