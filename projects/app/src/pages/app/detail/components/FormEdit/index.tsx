import React, { useMemo } from 'react';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import { AppContext } from '@/web/core/app/context/appContext';
import { useContextSelector } from 'use-context-selector';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { useI18n } from '@/web/context/I18n';
import { useRouter } from 'next/router';
import Tabs from '@/components/Tabs';
import SideTabs from '@/components/SideTabs';
import Avatar from '@/components/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';

import SimpleEdit from './SimpleEdit';
import { useTabHook, TabEnum } from '../hooks/TabHook';
const Publish = dynamic(() => import('../Publish'), {});
const Logs = dynamic(() => import('../Logs'), {});

const FormEdit = () => {
  const { t } = useTranslation();
  const { appT } = useI18n();
  const router = useRouter();

  const { appDetail } = useContextSelector(AppContext, (v) => v);

  const { currentTab, setCurrentTab } = useTabHook();
  const tabList = useMemo(
    () => [
      {
        label: t('core.app.navbar.App setting'),
        id: TabEnum.edit,
        icon: 'common/overviewLight'
      },
      ...(appDetail.permission.hasManagePer
        ? [
            {
              label: t('core.app.navbar.Publish app'),
              id: TabEnum.publish,
              icon: 'support/outlink/shareLight'
            },
            { label: appT('Chat logs'), id: TabEnum.logs, icon: 'core/app/logsLight' }
          ]
        : [])
    ],
    [appDetail.permission.hasManagePer, appT, t]
  );

  return (
    <Flex flexDirection={['column', 'row']} h={'100%'}>
      {/* pc tab */}
      <Box
        display={['none', 'flex']}
        flexDirection={'column'}
        p={4}
        w={'180px'}
        borderRight={'base'}
      >
        <Flex mb={4} alignItems={'center'}>
          <Avatar src={appDetail.avatar} w={'34px'} borderRadius={'md'} />
          <Box ml={2} fontWeight={'bold'}>
            {appDetail.name}
          </Box>
        </Flex>
        <SideTabs
          flex={1}
          mx={'auto'}
          mt={2}
          w={'100%'}
          list={tabList}
          activeId={currentTab}
          onChange={(e: any) => {
            if (e === 'startChat') {
              router.push(`/chat?appId=${appDetail._id}`);
            } else {
              setCurrentTab(e);
            }
          }}
        />
        <Flex
          alignItems={'center'}
          cursor={'pointer'}
          py={2}
          px={3}
          borderRadius={'md'}
          _hover={{ bg: 'myGray.100' }}
          onClick={() => router.replace('/app/list')}
        >
          <IconButton
            mr={3}
            icon={<MyIcon name={'common/backFill'} w={'18px'} color={'primary.500'} />}
            bg={'white'}
            boxShadow={'1px 1px 9px rgba(0,0,0,0.15)'}
            size={'smSquare'}
            borderRadius={'50%'}
            aria-label={''}
          />
          {appT('My Apps')}
        </Flex>
      </Box>
      {/* phone tab */}
      <Box display={['block', 'none']} textAlign={'center'}>
        <Tabs
          mx={'auto'}
          mt={2}
          w={'100%'}
          list={tabList}
          size={'sm'}
          activeId={currentTab}
          onChange={(e: any) => {
            if (e === 'startChat') {
              router.push(`/chat?appId=${appDetail._id}`);
            } else {
              setCurrentTab(e);
            }
          }}
        />
      </Box>
      <Box flex={'1 0 0'} h={[0, '100%']} overflow={['overlay', '']}>
        {currentTab === TabEnum.edit && <SimpleEdit />}
        {currentTab === TabEnum.logs && <Logs />}
        {currentTab === TabEnum.publish && <Publish />}
      </Box>
    </Flex>
  );
};

export default React.memo(FormEdit);
