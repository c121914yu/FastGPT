import React from 'react';
import type { ImageProps } from '@chakra-ui/react';
import { LOGO_ICON } from '@fastgpt/global/common/system/constants';
import MyImage from '@fastgpt/web/components/common/Image/MyImage';

const Avatar = ({ w = '30px', src, ...props }: ImageProps) => {
  return (
    <MyImage
      fallbackSrc={LOGO_ICON}
      fallbackStrategy={'onError'}
      borderRadius={'md'}
      objectFit={'contain'}
      alt=""
      w={w}
      h={w}
      p={'1px'}
      src={src}
      {...props}
    />
  );
};

export default Avatar;
