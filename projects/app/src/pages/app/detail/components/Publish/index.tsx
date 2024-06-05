import React, { useRef, useState } from 'react';
import { Box, useTheme } from '@chakra-ui/react';

import { PublishChannelEnum } from '@fastgpt/global/support/outLink/constant';
import dynamic from 'next/dynamic';

import MyRadio from '@/components/common/MyRadio';
import { useTranslation } from 'next-i18next';

import Link from './Link';
import { AppContext } from '@/web/core/app/context/appContext';
import { useContextSelector } from 'use-context-selector';

const API = dynamic(() => import('./API'));
const FeiShu = dynamic(() => import('./FeiShu'));

const OutLink = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { appDetail } = useContextSelector(AppContext, (v) => v);

  const publishList = useRef([
    {
      icon: '/imgs/modal/shareFill.svg',
      title: t('core.app.Share link'),
      desc: t('core.app.Share link desc'),
      value: PublishChannelEnum.share
    },
    {
      icon: 'support/outlink/apikeyFill',
      title: t('core.app.Api request'),
      desc: t('core.app.Api request desc'),
      value: PublishChannelEnum.apikey
    }
    // {
    //   icon: 'core/app/publish/lark',
    //   title: t('core.app.publish.Fei shu bot'),
    //   desc: t('core.app.publish.Fei Shu Bot Desc'),
    //   value: PublishChannelEnum.feishu
    // }
  ]);

  const [linkType, setLinkType] = useState<PublishChannelEnum>(PublishChannelEnum.share);

  return (
    <Box pt={[1, 5]}>
      <Box fontWeight={'bold'} fontSize={['md', 'lg']} mb={2} px={5}>
        {t('core.app.publish.Publish channel')}
      </Box>
      <Box pb={[5, 7]} px={5} borderBottom={theme.borders.base}>
        <MyRadio
          gridTemplateColumns={['repeat(1,1fr)', 'repeat(auto-fill, minmax(0, 400px))']}
          iconSize={'20px'}
          list={publishList.current}
          value={linkType}
          onChange={(e) => setLinkType(e as PublishChannelEnum)}
        />
      </Box>

      {linkType === PublishChannelEnum.share && (
        <Link appId={appDetail._id} type={PublishChannelEnum.share} />
      )}
      {linkType === PublishChannelEnum.apikey && <API appId={appDetail._id} />}
      {linkType === PublishChannelEnum.feishu && <FeiShu appId={appDetail._id} />}
    </Box>
  );
};

export default OutLink;
