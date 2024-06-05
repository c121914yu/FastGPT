import React from 'react';
import { AppTypeEnum, AppTypeMap } from '@fastgpt/global/core/app/constants';
import { Flex } from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';

const AppTypeTag = ({ type, w = '14px' }: { type: AppTypeEnum; w?: string }) => {
  console.log(type, '=====');
  return AppTypeMap[type] ? (
    <Flex alignItems={'center'} color={'myGray.500'}>
      <MyIcon mr={0.5} name={AppTypeMap[type]?.icon as any} w={w} />
      {AppTypeMap[type]?.label}
    </Flex>
  ) : null;
};

export default AppTypeTag;
