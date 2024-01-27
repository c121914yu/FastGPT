import React, { useMemo, useState } from 'react';
import { Box, Flex, Grid } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import {
  audioSpeechModelList,
  chatModelList,
  qaModelList,
  qgModelList,
  vectorModelList,
  whisperModel
} from '@/web/common/system/staticData';
import { useSystemStore } from '@/web/common/system/useSystemStore';

const Points = () => {
  const { t } = useTranslation();
  const { initd } = useSystemStore();

  return (
    <Flex
      mt={['40px', '90px']}
      flexDirection={'column'}
      alignItems={'center'}
      position={'relative'}
    >
      <Box fontWeight={'bold'} fontSize={['24px', '36px']}>
        {t('support.wallet.subscription.Ai points')}
      </Box>
      <Grid gap={6} mt={['30px', '48px']} w={'100%'}>
        <Box
          display={['block', 'flex']}
          borderRadius={'xl'}
          borderWidth={'1px'}
          borderColor={'myGray.150'}
          bg={'rgba(255,255,255,0.9)'}
          overflow={'hidden'}
        >
          <Box
            flex={1}
            borderRightWidth={'1px'}
            borderRightColor={'myGray.150'}
            py={4}
            px={6}
            fontSize={'lg'}
            fontWeight={'bold'}
          >
            对话模型
          </Box>
          <Box flex={4} textAlign={'center'}>
            {chatModelList?.map((item, i) => (
              <Flex key={item.model} py={4} bg={i % 2 !== 0 ? 'myGray.50' : ''}>
                <Box flex={'1 0 0'}>{item.name}</Box>
                <Box flex={'1 0 0'}>5积分 / 1000字符</Box>
              </Flex>
            ))}
          </Box>
        </Box>
        <Box
          display={['block', 'flex']}
          borderRadius={'xl'}
          borderWidth={'1px'}
          borderColor={'myGray.150'}
          bg={'rgba(255,255,255,0.9)'}
          overflow={'hidden'}
        >
          <Box flex={1} borderRightWidth={'1px'} borderRightColor={'myGray.150'} py={4} px={6}>
            <Box fontSize={'lg'} fontWeight={'bold'}>
              索引模型
            </Box>
            <Box fontSize={'sm'} mt={1} color={'myGray.500'}>
              文档索引 & 对话索引
            </Box>
          </Box>
          <Box flex={4} textAlign={'center'}>
            {vectorModelList?.map((item, i) => (
              <Flex key={item.model} py={4} bg={i % 2 !== 0 ? 'myGray.50' : ''}>
                <Box flex={'1 0 0'}>{item.name}</Box>
                <Box flex={'1 0 0'}>5积分 / 1000字符</Box>
              </Flex>
            ))}
          </Box>
        </Box>
        <Box
          display={['block', 'flex']}
          borderRadius={'xl'}
          borderWidth={'1px'}
          borderColor={'myGray.150'}
          bg={'rgba(255,255,255,0.9)'}
          overflow={'hidden'}
        >
          <Box flex={1} borderRightWidth={'1px'} borderRightColor={'myGray.150'} py={4} px={6}>
            <Box fontSize={'lg'} fontWeight={'bold'}>
              文件预处理模型
            </Box>
            <Box fontSize={'sm'} mt={1} color={'myGray.500'}>
              QA拆分
            </Box>
          </Box>
          <Box flex={4} textAlign={'center'}>
            {qaModelList?.map((item, i) => (
              <Flex key={item.model} py={4} bg={i % 2 !== 0 ? 'myGray.50' : ''}>
                <Box flex={'1 0 0'}>{item.name}</Box>
                <Box flex={'1 0 0'}>5积分 / 1000字符</Box>
              </Flex>
            ))}
          </Box>
        </Box>
        <Box
          display={['block', 'flex']}
          borderRadius={'xl'}
          borderWidth={'1px'}
          borderColor={'myGray.150'}
          bg={'rgba(255,255,255,0.9)'}
          overflow={'hidden'}
        >
          <Box flex={1} borderRightWidth={'1px'} borderRightColor={'myGray.150'} py={4} px={6}>
            <Box fontSize={'lg'} fontWeight={'bold'}>
              下一步指引
            </Box>
          </Box>
          <Box flex={4} textAlign={'center'}>
            {qgModelList?.map((item, i) => (
              <Flex key={item.model} py={4} bg={i % 2 !== 0 ? 'myGray.50' : ''}>
                <Box flex={'1 0 0'}>{item.name}</Box>
                <Box flex={'1 0 0'}>5积分 / 1000字符</Box>
              </Flex>
            ))}
          </Box>
        </Box>
        <Box
          display={['block', 'flex']}
          borderRadius={'xl'}
          borderWidth={'1px'}
          borderColor={'myGray.150'}
          bg={'rgba(255,255,255,0.9)'}
          overflow={'hidden'}
        >
          <Box flex={1} borderRightWidth={'1px'} borderRightColor={'myGray.150'} py={4} px={6}>
            <Box fontSize={'lg'} fontWeight={'bold'}>
              语音播放
            </Box>
          </Box>
          <Box flex={4} textAlign={'center'}>
            {audioSpeechModelList?.map((item, i) => (
              <Flex key={item.model} py={4} bg={i % 2 !== 0 ? 'myGray.50' : ''}>
                <Box flex={'1 0 0'}>{item.name}</Box>
                <Box flex={'1 0 0'}>5积分 / 1000字符</Box>
              </Flex>
            ))}
          </Box>
        </Box>
        <Box
          display={['block', 'flex']}
          borderRadius={'xl'}
          borderWidth={'1px'}
          borderColor={'myGray.150'}
          bg={'rgba(255,255,255,0.9)'}
          overflow={'hidden'}
        >
          <Box flex={1} borderRightWidth={'1px'} borderRightColor={'myGray.150'} py={4} px={6}>
            <Box fontSize={'lg'} fontWeight={'bold'}>
              语音输入
            </Box>
          </Box>
          <Box flex={4} textAlign={'center'} h={'100%'}>
            <Flex py={4}>
              <Box flex={'1 0 0'}>{whisperModel?.name}</Box>
              <Box flex={'1 0 0'}>{whisperModel?.inputPrice}积分 / 分钟</Box>
            </Flex>
          </Box>
        </Box>
      </Grid>
    </Flex>
  );
};

export default React.memo(Points);