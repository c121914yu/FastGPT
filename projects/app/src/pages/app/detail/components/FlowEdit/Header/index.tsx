import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, Flex, IconButton, useTheme, useDisclosure, Button } from '@chakra-ui/react';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import { useTranslation } from 'next-i18next';
import { useCopyData } from '@/web/common/hooks/useCopyData';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import dynamic from 'next/dynamic';

import MyIcon from '@fastgpt/web/components/common/Icon';
import ChatTest, { type ChatTestComponentRef } from '@/components/core/workflow/Flow/ChatTest';
import { uiWorkflow2StoreWorkflow } from '@/components/core/workflow/utils';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { getErrText } from '@fastgpt/global/common/error/utils';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import { StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import {
  checkWorkflowNodeAndConnection,
  filterSensitiveNodesData
} from '@/web/core/workflow/utils';
import { useContextSelector } from 'use-context-selector';
import { WorkflowContext, getWorkflowStore } from '@/components/core/workflow/context';
import { useUpdateEffect } from 'ahooks';
import { useI18n } from '@/web/context/I18n';
import { AppContext } from '@/web/core/app/context/appContext';
import AppInfoBox from './AppInfoBox';
import { useTabHook, TabEnum } from '../../hooks/TabHook';

const ImportSettings = dynamic(() => import('@/components/core/workflow/Flow/ImportSettings'));
const PublishHistories = dynamic(
  () => import('@/components/core/workflow/components/PublishHistoriesSlider')
);

const RenderHeaderContainer = React.memo(function RenderHeaderContainer({
  ChatTestRef,
  setWorkflowTestData
}: {
  ChatTestRef: React.RefObject<ChatTestComponentRef>;
  setWorkflowTestData: React.Dispatch<
    React.SetStateAction<
      | {
          nodes: StoreNodeItemType[];
          edges: StoreEdgeItemType[];
        }
      | undefined
    >
  >;
}) {
  const { appDetail } = useContextSelector(AppContext, (v) => v);
  const { currentTab } = useTabHook();

  const { toast } = useToast();
  const { t } = useTranslation();
  const { appT } = useI18n();

  const { copyData } = useCopyData();
  const { openConfirm: openConfigPublish, ConfirmModal } = useConfirm({
    content: t('core.app.Publish Confirm')
  });
  const { publishApp } = useContextSelector(AppContext, (v) => v);
  const edges = useContextSelector(WorkflowContext, (v) => v.edges);

  const [isSaving, setIsSaving] = useState(false);
  const onUpdateNodeError = useContextSelector(WorkflowContext, (v) => v.onUpdateNodeError);

  const { isOpen: isOpenImport, onOpen: onOpenImport, onClose: onCloseImport } = useDisclosure();

  const isShowVersionHistories = useContextSelector(
    WorkflowContext,
    (v) => v.isShowVersionHistories
  );
  const setIsShowVersionHistories = useContextSelector(
    WorkflowContext,
    (v) => v.setIsShowVersionHistories
  );

  const flowData2StoreDataAndCheck = useCallback(async () => {
    const { nodes } = await getWorkflowStore();
    const checkResults = checkWorkflowNodeAndConnection({ nodes, edges });

    if (!checkResults) {
      const storeNodes = uiWorkflow2StoreWorkflow({ nodes, edges });

      return storeNodes;
    } else {
      checkResults.forEach((nodeId) => onUpdateNodeError(nodeId, true));
      toast({
        status: 'warning',
        title: t('core.workflow.Check Failed')
      });
    }
  }, [edges, onUpdateNodeError, t, toast]);

  const onclickPublish = useCallback(async () => {
    setIsSaving(true);
    const data = await flowData2StoreDataAndCheck();
    if (data) {
      try {
        await publishApp({
          ...data,
          type: AppTypeEnum.workflow,
          chatConfig: appDetail.chatConfig,
          //@ts-ignore
          version: 'v2'
        });
        toast({
          status: 'success',
          title: t('core.app.Publish Success')
        });
        ChatTestRef.current?.resetChatTest();
      } catch (error) {
        toast({
          status: 'warning',
          title: getErrText(error, t('core.app.Publish Failed'))
        });
      }
    }

    setIsSaving(false);
  }, [flowData2StoreDataAndCheck, publishApp, appDetail.chatConfig, toast, t, ChatTestRef]);

  const onExportWorkflow = useCallback(async () => {
    const data = await flowData2StoreDataAndCheck();
    if (data) {
      copyData(
        JSON.stringify(
          {
            nodes: filterSensitiveNodesData(data.nodes),
            edges: data.edges,
            chatConfig: appDetail.chatConfig
          },
          null,
          2
        ),
        appT('Export Config Successful')
      );
    }
  }, [appDetail.chatConfig, appT, copyData, flowData2StoreDataAndCheck]);

  const Render = useMemo(() => {
    return (
      <>
        <Flex align={'center'} position={'relative'}>
          <AppInfoBox />

          <Box flex={1} />

          {currentTab === TabEnum.edit && (
            <>
              {!isShowVersionHistories && (
                <>
                  <MyMenu
                    Button={
                      <IconButton
                        mr={[2, 4]}
                        icon={<MyIcon name={'more'} w={'14px'} p={2} />}
                        aria-label={''}
                        size={'sm'}
                        variant={'whitePrimary'}
                      />
                    }
                    menuList={[
                      {
                        label: appT('Import Configs'),
                        icon: 'common/importLight',
                        onClick: onOpenImport
                      },
                      {
                        label: appT('Export Configs'),
                        icon: 'export',
                        onClick: onExportWorkflow
                      }
                    ]}
                  />

                  <IconButton
                    mr={[2, 4]}
                    icon={<MyIcon name={'history'} w={'18px'} />}
                    aria-label={''}
                    size={'sm'}
                    w={'30px'}
                    variant={'whitePrimary'}
                    onClick={() => setIsShowVersionHistories(true)}
                  />
                </>
              )}

              <Button
                size={'sm'}
                leftIcon={<MyIcon name={'core/workflow/debug'} w={['14px', '16px']} />}
                variant={'whitePrimary'}
                onClick={async () => {
                  const data = await flowData2StoreDataAndCheck();
                  if (data) {
                    setWorkflowTestData(data);
                  }
                }}
              >
                {t('core.workflow.Debug')}
              </Button>

              {!isShowVersionHistories && (
                <Button
                  ml={[2, 4]}
                  size={'sm'}
                  isLoading={isSaving}
                  leftIcon={<MyIcon name={'common/publishFill'} w={['14px', '16px']} />}
                  onClick={openConfigPublish(onclickPublish)}
                >
                  {t('core.app.Publish')}
                </Button>
              )}
            </>
          )}
        </Flex>
        <ConfirmModal confirmText={t('core.app.Publish')} />
      </>
    );
  }, [
    currentTab,
    isShowVersionHistories,
    appT,
    onOpenImport,
    onExportWorkflow,
    t,
    isSaving,
    openConfigPublish,
    onclickPublish,
    ConfirmModal,
    setIsShowVersionHistories,
    flowData2StoreDataAndCheck,
    setWorkflowTestData
  ]);

  return (
    <>
      {Render}
      {isOpenImport && <ImportSettings onClose={onCloseImport} />}
      {isShowVersionHistories && <PublishHistories />}
    </>
  );
});

const Header = () => {
  const ChatTestRef = useRef<ChatTestComponentRef>(null);

  const [workflowTestData, setWorkflowTestData] = useState<{
    nodes: StoreNodeItemType[];
    edges: StoreEdgeItemType[];
  }>();
  const { isOpen: isOpenTest, onOpen: onOpenTest, onClose: onCloseTest } = useDisclosure();

  useUpdateEffect(() => {
    onOpenTest();
  }, [workflowTestData]);

  return (
    <>
      <RenderHeaderContainer ChatTestRef={ChatTestRef} setWorkflowTestData={setWorkflowTestData} />
      <ChatTest ref={ChatTestRef} isOpen={isOpenTest} {...workflowTestData} onClose={onCloseTest} />
    </>
  );
};

export default React.memo(Header);
