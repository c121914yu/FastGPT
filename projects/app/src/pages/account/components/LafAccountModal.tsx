import React, { useMemo, useState } from 'react';
import {
  ModalBody,
  Box,
  Flex,
  Input,
  ModalFooter,
  Button,
  Link,
  Center,
  Spinner
} from '@chakra-ui/react';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { useRequest } from '@fastgpt/web/hooks/useRequest';
import { getLafApplications, pat2Token } from '@/web/support/laf/api';
import { useQuery } from '@tanstack/react-query';
import MySelect from '@fastgpt/web/components/common/MySelect';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { putUpdateTeam } from '@/web/support/user/team/api';
import { useUserStore } from '@/web/support/user/useUserStore';
import type { LafAccountType } from '@fastgpt/global/support/user/team/type.d';

type TApp = {
  name: string;
  appid: string;
  state: string;
};

const LafAccountModal = ({
  defaultData = {
    token: '',
    appid: ''
  },
  onClose
}: {
  defaultData?: LafAccountType;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit, setValue, getValues, watch, reset } = useForm({
    defaultValues: {
      ...defaultData,
      pat: ''
    }
  });

  const lafToken = getValues('token');
  const pat = getValues('pat');

  const { feConfigs } = useSystemStore();
  const { toast } = useToast();
  const { userInfo, initUserInfo } = useUserStore();
  const lafEnv = feConfigs.lafEnv || '';

  const { mutate: pat2TokenMutate, isLoading: isPatLoading } = useRequest({
    mutationFn: async (pat) => {
      const { data } = await pat2Token(lafEnv, pat);
      const lafToken = data.data;
      setValue('token', lafToken);
    },
    errorToast: t('plugin.Invalid Env')
  });

  const { data: appListData, isLoading: isAppListLoading } = useQuery(
    ['appList', lafToken],
    () => {
      return getLafApplications(lafEnv, lafToken);
    },
    {
      enabled: !!lafToken,
      onSuccess: (data) => {},
      onError: (err) => {
        toast({
          title: '获取应用列表失败',
          status: 'error'
        });
      }
    }
  );

  const { mutate: onSubmit, isLoading } = useRequest({
    mutationFn: async (data: LafAccountType) => {
      if (!userInfo?.team.teamId) return;
      return putUpdateTeam({
        teamId: userInfo?.team.teamId,
        lafAccount: data
      });
    },
    onSuccess() {
      initUserInfo();
      onClose();
    },
    successToast: t('common.Update Success'),
    errorToast: t('common.Update Failed')
  });

  return (
    <MyModal
      isOpen
      onClose={onClose}
      iconSrc="/imgs/module/laf.png"
      title={t('user.Laf Account Setting')}
    >
      <ModalBody>
        <Box fontSize={'sm'} color={'myGray.500'}>
          <Box>
            {t('support.user.Laf account intro')}
            <Link href={`https://doc.laf.run/zh/`} isExternal>
              {t('user.Learn More')}
            </Link>
          </Box>
          <Flex>
            <Link textDecoration={'underline'} href={`${feConfigs.lafEnv}/`} isExternal>
              {t('support.user.Go laf env')}
            </Link>
          </Flex>
        </Box>
        {!lafToken ? (
          <Flex alignItems={'center'} mt={5}>
            <Box flex={'0 0 65px'}>PAT:</Box>
            <Input flex={1} {...register('pat')} placeholder={t('plugin.Enter PAT')} />
            <Button
              ml={2}
              flex={'0 0 65px'}
              variant={'whiteBase'}
              isDisabled={!pat}
              onClick={() => {
                pat2TokenMutate(pat);
              }}
              isLoading={isPatLoading}
            >
              {t('common.Confirm')}
            </Button>
          </Flex>
        ) : isAppListLoading ? (
          <Center mt={5}>
            <Spinner color={'myGray.500'} />
          </Center>
        ) : (
          <Flex alignItems={'center'} mt={5}>
            <Box flex={'0 0 65px'}>{t('plugin.Currentapp')}</Box>
            <MySelect
              minW={'200px'}
              list={
                appListData?.data.data
                  .filter((app: TApp) => app.state === 'Running')
                  .map((app: TApp) => ({
                    label: `${app.name}`,
                    value: app.appid
                  })) || []
              }
              placeholder={t('plugin.App')}
              value={watch('appid')}
              onchange={(e) => {
                setValue('appid', e);
              }}
              {...(register('appid'), { required: true })}
            />
            <Button
              variant={'link'}
              onClick={() => {
                reset({
                  token: '',
                  appid: ''
                });
              }}
              ml={4}
            >
              {t('user.Sign Out')}
            </Button>
          </Flex>
        )}
      </ModalBody>
      <ModalFooter>
        <Button mr={3} variant={'whiteBase'} onClick={onClose}>
          {t('common.Cancel')}
        </Button>
        <Button isLoading={isLoading} onClick={handleSubmit((data) => onSubmit(data))}>
          {t('common.Confirm')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default LafAccountModal;
