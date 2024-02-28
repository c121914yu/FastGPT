import React, { Dispatch, useCallback, useRef } from 'react';
import { PageTypeEnum } from '@/constants/user';
import type { ResLogin } from '@/global/support/api/userRes';
import {
  AbsoluteCenter,
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Image,
  Spinner
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import Divider from '@/components/core/module/Flow/components/modules/Divider';
import { useTranslation } from 'next-i18next';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { getWechatQR, getWechatResult, oauthLogin } from '@/web/support/user/api';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useRouter } from 'next/router';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { OAuthEnum } from '@fastgpt/global/support/user/constant';
import { nanoid } from 'nanoid';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { LOGO_ICON } from '@fastgpt/global/common/system/constants';

interface Props {
  loginSuccess: (e: ResLogin) => void;
  setPageType: Dispatch<`${PageTypeEnum}`>;
}

const WechatForm = ({ setPageType, loginSuccess }: Props) => {
  const { t } = useTranslation();
  const [wechatInfo, setWechatInfo] = React.useState<{
    code: string;
    codeUrl: string;
  }>();
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const redirectUri = `${location.origin}/login/provider`;
  const state = useRef(nanoid());

  const { lastRoute = '/app/list' } = router.query as { lastRoute: string };
  const { setLoginStore, feConfigs } = useSystemStore();

  const oAuthList = [
    ...(feConfigs?.oauth?.github
      ? [
          {
            label: t('support.user.login.Github'),
            provider: OAuthEnum.github,
            icon: 'common/gitFill',
            redirectUrl: `https://github.com/login/oauth/authorize?client_id=${feConfigs?.oauth?.github}&redirect_uri=${redirectUri}&state=${state.current}&scope=user:email%20read:user`
          }
        ]
      : []),
    ...(feConfigs?.oauth?.google
      ? [
          {
            label: t('support.user.login.Google'),
            provider: OAuthEnum.google,
            icon: 'common/googleFill',
            redirectUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${feConfigs?.oauth?.google}&redirect_uri=${redirectUri}&state=${state.current}&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20openid&include_granted_scopes=true`
          }
        ]
      : []),
    {
      label: t('support.user.login.Phone'),
      provider: PageTypeEnum.login,
      icon: 'common/phoneFill',
      pageType: PageTypeEnum.login
    }
  ];

  useQuery(['getWechatQR'], () => getWechatQR(), {
    onSuccess(data) {
      setWechatInfo(data);
    }
  });

  useQuery(
    ['getWechatResult', wechatInfo?.code],
    () => getWechatResult({ code: wechatInfo?.code || '' }),
    {
      refetchInterval: 6 * 1000,
      enabled: !!wechatInfo?.code,
      onSuccess(data: any) {
        if (data?.openid) {
          login(data.openid);
        }
      }
    }
  );

  const login = useCallback(
    async (openid: string) => {
      try {
        setIsLoading(true);
        const res = await oauthLogin({
          type: 'wechat',
          code: openid,
          callbackUrl: `${location.origin}/login/provider`,
          inviterId: localStorage.getItem('inviterId') || undefined
        });

        if (!res) {
          toast({
            status: 'warning',
            title: '登录异常'
          });
          return setTimeout(() => {
            router.replace('/login');
          }, 1000);
        }
        loginSuccess(res);
      } catch (error) {
        toast({
          status: 'warning',
          title: getErrText(error, '登录异常')
        });
        setTimeout(() => {
          router.replace('/login');
        }, 1000);
      }
    },
    [loginSuccess, router, toast]
  );

  return (
    <Flex flexDirection={'column'} h={'100%'}>
      <Flex alignItems={'center'}>
        <Flex
          w={['48px', '56px']}
          h={['48px', '56px']}
          bg={'myGray.25'}
          borderRadius={'xl'}
          borderWidth={'1.5px'}
          borderColor={'borderColor.base'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Avatar src={LOGO_ICON} w={'30px'} />
        </Flex>
        <Box ml={3} fontSize={['2xl', '3xl']} fontWeight={'bold'}>
          {feConfigs?.systemTitle}
        </Box>
      </Flex>
      <Box
        fontSize={24}
        fontWeight={600}
        w={'full'}
        display={'flex'}
        justifyContent={'center'}
        pt={12}
      >
        微信扫码登录
      </Box>
      <Box p={5} display={'flex'} w={'full'} justifyContent={'center'}>
        {wechatInfo?.codeUrl && !isLoading ? (
          <Image w="200px" src={wechatInfo?.codeUrl} alt="qrcode"></Image>
        ) : (
          <Center w={200} h={200}>
            <Spinner />
          </Center>
        )}
      </Box>
      <Box flex={1} />
      {feConfigs?.show_register && oAuthList.length > 0 && (
        <>
          <Box position={'relative'}>
            <Divider />
            <AbsoluteCenter bg="white" px="4" color={'myGray.500'}>
              or
            </AbsoluteCenter>
          </Box>
          <Box mt={8}>
            {oAuthList.map((item) => (
              <Box key={item.provider} _notFirst={{ mt: 4 }}>
                <Button
                  variant={'whitePrimary'}
                  w={'100%'}
                  h={'42px'}
                  leftIcon={
                    <MyIcon
                      name={item.icon as any}
                      w={'20px'}
                      cursor={'pointer'}
                      color={'myGray.800'}
                    />
                  }
                  onClick={() => {
                    item.redirectUrl &&
                      setLoginStore({
                        provider: item.provider,
                        lastRoute,
                        state: state.current
                      });
                    item.redirectUrl && router.replace(item.redirectUrl, '_self');
                    item.pageType && setPageType(item.pageType);
                  }}
                >
                  {item.label}
                </Button>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Flex>
  );
};

export default WechatForm;
