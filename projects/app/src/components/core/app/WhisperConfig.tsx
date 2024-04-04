import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@/components/MyTooltip';
import { Box, Button, Flex, ModalBody, useDisclosure, Switch } from '@chakra-ui/react';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import type { AppWhisperConfigType } from '@fastgpt/global/core/app/type.d';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useForm } from 'react-hook-form';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';

const WhisperConfig = ({
  value,
  onChange
}: {
  value: AppWhisperConfigType;
  onChange: (e: AppWhisperConfigType) => void;
}) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { register, watch } = useForm({
    defaultValues: value
  });
  const isOpenWhisper = watch('open');

  const formLabel = useMemo(() => {
    if (!isOpenWhisper) {
      return t('core.app.whisper.Close');
    }
    return t('core.app.whisper.Open');
  }, [t, isOpenWhisper]);

  useEffect(() => {
    const watchSign = watch((data) =>
      onChange({
        autoSend: data.autoSend ?? false,
        autoTTSResponse: data.autoTTSResponse ?? false,
        open: data.open ?? false
      })
    );

    return () => {
      watchSign.unsubscribe();
    };
  });

  return (
    <Flex alignItems={'center'}>
      <MyIcon name={'core/app/simpleMode/whisper'} mr={2} w={'20px'} />
      <Box>{t('core.app.Whisper')}</Box>
      <Box flex={1} />
      <MyTooltip label={t('core.app.Config whisper')}>
        <Button
          variant={'transparentBase'}
          iconSpacing={1}
          size={'sm'}
          fontSize={'md'}
          mr={'-5px'}
          onClick={onOpen}
        >
          {formLabel}
        </Button>
      </MyTooltip>
      <MyModal
        title={t('core.app.Whisper config')}
        iconSrc="core/app/simpleMode/whisper"
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalBody px={[5, 16]} py={[4, 8]}>
          <Flex justifyContent={'space-between'} alignItems={'center'}>
            {t('core.app.whisper.Switch')}
            <Switch {...register('open')} size={'lg'} />
          </Flex>
          {isOpenWhisper && (
            <>
              <Flex mt={8} alignItems={'center'}>
                {t('core.app.whisper.Auto send')}
                <QuestionTip label={t('core.app.whisper.Auto send tip')} />
                <Box flex={'1 0 0'} />
                <Switch {...register('autoSend')} size={'lg'} />
              </Flex>
              <Flex mt={8} alignItems={'center'}>
                {t('core.app.whisper.Auto tts response')}
                <QuestionTip label={t('core.app.whisper.Auto tts response tip')} />
                <Box flex={'1 0 0'} />
                <Switch {...register('autoTTSResponse')} size={'lg'} />
              </Flex>
            </>
          )}
        </ModalBody>
      </MyModal>
    </Flex>
  );
};

export default React.memo(WhisperConfig);
