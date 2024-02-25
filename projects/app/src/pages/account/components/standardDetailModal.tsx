import React, { useMemo } from 'react';
import {
  ModalBody, Box, Flex, Input, ModalFooter, Button, Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import MyModal from '@/components/MyModal';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLoading } from '@/web/common/hooks/useLoading';
import MyIcon from '@fastgpt/web/components/common/Icon';
import dayjs from 'dayjs';
import { getUserStandDardList } from "@/web/support/wallet/sub/api"
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { SubTypeEnum, StandardSubLevelMap } from '@fastgpt/global/support/wallet/sub/constants';
import { FeTeamPlanStatusType, TeamSubSchema } from '@fastgpt/global/support/wallet/sub/type';
const StandDetailModal = ({
  onClose
}: {
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { Loading } = useLoading();

  const { gitStar, feConfigs } = useSystemStore();
  const {
    data: standardHistory = [],
    isLoading: isGetting,
    refetch
  } = useQuery(['getUserStandDardList'], async () => getUserStandDardList());

  const StandardData = {
    [SubTypeEnum.standard]: {
      icon: 'acount/plans',
      name: '套餐'
    },
    [SubTypeEnum.extraPoints]: {
      icon: "acount/message",
      name: '额外AI 积分'
    },
    [SubTypeEnum.extraDatasetSize]: {
      icon: "acount/database",
      name: '额外数据包'
    },
  }
  return (
    <MyModal
      isOpen
      w={['100vw', '550px']}
      onClose={onClose}
      iconSrc="acount/plansBlue"
      title={t('user.Standard Detail')}
    >
      <ModalBody>
        <TableContainer mt={2} position={'relative'} minH={'300px'}>
          <Table>
            <Thead>
              <Tr>
                <Th>{t('support.standard.type')}</Th>
                <Th>{t('support.standard.storage')}</Th>
                <Th>{t('support.standard.AI Bonus Points')}</Th>
                <Th>{t('support.standard.Start Time')}</Th>
                <Th>{t('support.standard.Expired Time')}</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody fontSize={'sm'}>
              {
                Array.isArray(standardHistory) && standardHistory.map(({ _id, type, currentSubLevel, currentExtraDatasetSize, surplusPoints, totalPoints, startTime, expiredTime }: TeamSubSchema) => {
                  return (
                    <Tr key={_id}>
                      <Td>
                        <MyIcon mr={2} name={StandardData[type].icon as any} w={'20px'} />
                        {StandardSubLevelMap[currentSubLevel] + StandardData[type] && StandardData[type].name}
                      </Td>
                      <Td>{currentExtraDatasetSize ? (currentExtraDatasetSize + '组') : '—'}</Td>
                      <Td>{totalPoints ? (surplusPoints.toFixed(0) + '/' + totalPoints + '积分') : '—'}</Td>
                      <Td>{dayjs(startTime).format('YYYY/MM/DD\nHH:mm')}</Td>
                      <Td>{dayjs(expiredTime).format('YYYY/MM/DD\nHH:mm')}</Td>
                    </Tr>
                  )
                })
              }
              <Tr key={'_id'}>
              </Tr>
            </Tbody>
          </Table>
          <Loading loading={isGetting} fixed={false} />
        </TableContainer>
      </ModalBody>
      <ModalFooter>

      </ModalFooter>
    </MyModal>
  );
};

export default StandDetailModal;
