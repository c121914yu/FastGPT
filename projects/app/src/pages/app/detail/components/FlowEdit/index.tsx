import React, { useMemo } from 'react';
import Header from './Header/index';
import { Box, Flex, HStack } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useTabHook, TabEnum } from '../hooks/TabHook';
import Workflow from './Workflow';
import { useTranslation } from 'next-i18next';
import { AppContext } from '@/web/core/app/context/appContext';
import { useContextSelector } from 'use-context-selector';
import { useI18n } from '@/web/context/I18n';
import WorkflowContextProvider from '@/components/core/workflow/context';
import { appSystemModuleTemplates } from '@fastgpt/global/core/workflow/template/constants';
const Publish = dynamic(() => import('../Publish'), {});
const Logs = dynamic(() => import('../Logs'), {});

const FlowEdit = () => {
  const { t } = useTranslation();
  const { appT } = useI18n();
  const { currentTab, setCurrentTab } = useTabHook();
  const { appDetail } = useContextSelector(AppContext, (v) => v);

  const tabList = useMemo(
    () => [
      {
        label: t('core.app.Workflow'),
        id: TabEnum.edit
      },
      ...(appDetail.permission.hasManagePer
        ? [
            {
              label: t('core.app.navbar.Publish app'),
              id: TabEnum.publish
            },
            { label: appT('Chat logs'), id: TabEnum.logs }
          ]
        : [])
    ],
    [appDetail.permission.hasManagePer, appT, t]
  );

  return (
    <Flex
      flexDirection={'column'}
      position={'fixed'}
      zIndex={999}
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg={'white'}
    >
      <Box
        display={['block', 'flex']}
        py={3}
        px={[2, 5, 8]}
        borderBottom={'base'}
        alignItems={'center'}
        userSelect={'none'}
        bg={'myGray.25'}
        h={['auto', '67px']}
        position={'relative'}
      >
        {/* tab */}
        <HStack
          gap={5}
          position={['relative', 'absolute']}
          top={['auto', '50%']}
          left={['auto', '50%']}
          transform={['none', 'translate(-50%,-50%)']}
          justifyContent={'center'}
          mb={[3, 0]}
          zIndex={1}
        >
          {tabList.map((tab) => (
            <Box
              key={tab.id}
              fontSize={'lg'}
              {...(currentTab === tab.id
                ? {
                    color: 'primary.600',
                    cursor: 'default',
                    fontWeight: 'bold'
                  }
                : {
                    color: 'myGray.500',
                    cursor: 'pointer',
                    onClick: () => setCurrentTab(tab.id)
                  })}
            >
              {tab.label}
            </Box>
          ))}
        </HStack>
        <Box flex={'1 0 0'}>
          <Header />
        </Box>
      </Box>
      <Box flex={'1 0 0'}>
        {currentTab === TabEnum.edit && <Workflow />}
        {currentTab === TabEnum.logs && <Logs />}
        {currentTab === TabEnum.publish && (
          <Box px={5}>
            <Publish />
          </Box>
        )}
      </Box>
    </Flex>
  );
};

const Render = () => {
  const appDetail = useContextSelector(AppContext, (e) => e.appDetail);
  const filterAppIds = useMemo(() => [appDetail._id], [appDetail._id]);

  return (
    <WorkflowContextProvider
      value={{
        appId: appDetail._id,
        mode: 'app',
        filterAppIds,
        basicNodeTemplates: appSystemModuleTemplates
      }}
    >
      <FlowEdit />
    </WorkflowContextProvider>
  );
};

export default React.memo(Render);
