import { WorkflowContext, getWorkflowStore } from '@/components/core/workflow/context';
import { uiWorkflow2StoreWorkflow } from '@/components/core/workflow/utils';
import { useI18n } from '@/web/context/I18n';
import { AppContext } from '@/web/core/app/context/appContext';
import { Box, Flex, HStack, useDisclosure } from '@chakra-ui/react';
import { formatTime2HM } from '@fastgpt/global/common/string/time';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { useBeforeunload } from '@fastgpt/web/hooks/useBeforeunload';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useBoolean, useInterval } from 'ahooks';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import Avatar from '@/components/Avatar';
import dynamic from 'next/dynamic';
import { useTabHook, TabEnum } from '../../hooks/TabHook';

const AppInfoModal = dynamic(() => import('@/pages/app/detail/components/InfoModal'));

const AppInfoBox = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { currentTab } = useTabHook();
  const isEditPage = currentTab === TabEnum.edit;

  const { appDetail, updateAppDetail } = useContextSelector(AppContext, (v) => v);
  const isV2Workflow = appDetail?.version === 'v2';

  const isShowVersionHistories = useContextSelector(
    WorkflowContext,
    (v) => v.isShowVersionHistories
  );
  const edges = useContextSelector(WorkflowContext, (v) => v.edges);
  const workflowDebugData = useContextSelector(WorkflowContext, (v) => v.workflowDebugData);

  const {
    isOpen: isOpenInfoEdit,
    onOpen: onOpenInfoEdit,
    onClose: onCloseInfoEdit
  } = useDisclosure();

  const [saveLabel, setSaveLabel] = useState(t('core.app.Onclick to save'));
  const [loading, { setTrue: setLoading, setFalse: closeLoading }] = useBoolean();

  const onclickSave = useCallback(
    async (forbid?: boolean) => {
      // version preview / debug mode, not save
      if (!isV2Workflow || isShowVersionHistories || forbid || loading || !isEditPage) return;

      const { nodes } = await getWorkflowStore();

      if (nodes.length === 0) return;

      setLoading();
      const storeWorkflow = uiWorkflow2StoreWorkflow({ nodes, edges });

      if (edges.length === 0) return;

      try {
        await updateAppDetail({
          ...storeWorkflow,
          type: AppTypeEnum.workflow,
          chatConfig: appDetail.chatConfig,
          //@ts-ignore
          version: 'v2'
        });

        setSaveLabel(
          t('core.app.Auto Save time', {
            time: formatTime2HM()
          })
        );
      } catch (error) {}

      closeLoading();
      return null;
    },
    [
      isV2Workflow,
      isShowVersionHistories,
      loading,
      isEditPage,
      setLoading,
      edges,
      closeLoading,
      updateAppDetail,
      appDetail.chatConfig,
      t
    ]
  );

  const saveAndBack = useCallback(async () => {
    try {
      await onclickSave();
      router.push('/app/list');
    } catch (error) {}
  }, [onclickSave, router]);

  // effect
  useBeforeunload({
    callback: onclickSave,
    tip: t('core.common.tip.leave page')
  });

  useInterval(() => {
    if (!appDetail._id) return;
    onclickSave(!!workflowDebugData);
  }, 20000);

  return (
    <>
      <Flex alignItems={'center'}>
        <MyIcon
          name={'common/backLight'}
          w={'16px'}
          cursor={'pointer'}
          _hover={{ color: 'primary.600' }}
          onClick={saveAndBack}
        />
        <Avatar
          ml={4}
          src={appDetail.avatar}
          w={'2rem'}
          cursor={'pointer'}
          onClick={onOpenInfoEdit}
        />
        <Box ml={3}>
          <HStack cursor={'pointer'} onClick={onOpenInfoEdit}>
            <MyTooltip label={appDetail.name.length > 15 ? appDetail.name : ''}>
              <Box fontSize={['md', 'lg']} maxW={'200px'} className="textEllipsis">
                {appDetail.name}
              </Box>
            </MyTooltip>
            <MyIcon name={'edit'} w={'1rem'} _hover={{ color: 'primary.600' }} />
          </HStack>
          {isEditPage && (
            <Flex alignItems={'center'} mt={1}>
              {!isShowVersionHistories && isV2Workflow && (
                <MyTooltip label={t('core.app.Onclick to save')}>
                  <Box
                    fontSize={'xs'}
                    display={'inline-block'}
                    borderRadius={'xs'}
                    cursor={'pointer'}
                    onClick={() => onclickSave()}
                    color={'myGray.500'}
                  >
                    {saveLabel}
                  </Box>
                </MyTooltip>
              )}
              {loading && <MyIcon ml={1} name={'common/loading'} w={'1rem'} />}
            </Flex>
          )}
        </Box>
      </Flex>
      {isOpenInfoEdit && <AppInfoModal onClose={onCloseInfoEdit} />}
    </>
  );
};

export default React.memo(AppInfoBox);
