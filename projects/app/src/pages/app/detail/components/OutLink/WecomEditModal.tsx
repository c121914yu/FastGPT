import React, { useEffect, useState, useMemo } from 'react';
import {
    Flex,
    Box,
    Button,
    ModalFooter,
    ModalBody,
    Input,
    Switch,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Link
} from '@chakra-ui/react';
import MyModal from '@/components/MyModal';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import MyTooltip from '@/components/MyTooltip';
import { OutLinkTypeEnum } from '@fastgpt/global/support/outLink/constant';
import type { OutLinkConfigEditType } from "@fastgpt/global/support/outLink/type";
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { useRequest } from '@/web/common/hooks/useRequest';
import dayjs from 'dayjs';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import {
    createWecomLinkChat,
    putWecomLinkChat
} from '@/web/support/outLink/api';

const WecomEditModal = ({
    appId,
    type,
    defaultData,
    onClose,
    onCreate,
    onEdit
}: {
    appId: string;
    type: `${OutLinkTypeEnum}`;
    defaultData: OutLinkConfigEditType;
    onClose: () => void;
    onCreate: (id: string) => void;
    onEdit: () => void;
}) => {
    const { feConfigs } = useSystemStore();
    const { t } = useTranslation();
    const {
        register,
        setValue,
        handleSubmit: submitShareChat
    } = useForm({
        defaultValues: defaultData
    });

    const isEdit = useMemo(() => !!defaultData?._id, [defaultData]);

    const { mutate: onclickCreate, isLoading: creating } = useRequest({
        mutationFn: async (e: OutLinkConfigEditType) =>
            createWecomLinkChat({
                ...e,
                appId,
                type
            }),
        errorToast: t('common.Create Failed'),
        onSuccess: onCreate
    });
    const { mutate: onclickUpdate, isLoading: updating } = useRequest({
        mutationFn: (e: OutLinkConfigEditType) => {
            return putWecomLinkChat(e);
        },
        errorToast: t('common.Update Failed'),
        onSuccess: onEdit
    });

    return (
        <MyModal
            isOpen={true}
            iconSrc="/imgs/modal/shareFill.svg"
            title={isEdit ? t('outlink.Edit Link') : t('outlink.Create Link')}
        >
            <ModalBody>
                <Flex alignItems={'center'}>
                    <Box flex={'0 0 90px'}>{t('Name')}</Box>
                    <Input
                        placeholder={t('outlink.WecomLink name') || 'Link Name'}
                        maxLength={20}
                        {...register('name', {
                            required: t('common.Name is empty') || 'Name is empty'
                        })}
                    />
                </Flex>
                <Flex alignItems={'center'} mt={4}>
                    <Flex flex={'0 0 90px'} alignItems={'center'}>
                        QPM
                        <MyTooltip label={t('outlink.QPM Tips' || '')}>
                            <QuestionOutlineIcon ml={1} />
                        </MyTooltip>
                    </Flex>
                    <Input
                        max={1000}
                        {...register('limit.QPM', {
                            min: 0,
                            max: 1000,
                            valueAsNumber: true,
                            required: t('outlink.QPM is empty') || ''
                        })}
                    />
                </Flex>
                <Flex alignItems={'center'} mt={4}>
                    <Flex flex={'0 0 90px'} alignItems={'center'}>
                        {t('support.outlink.Max usage points')}
                        <MyTooltip label={t('support.outlink.Max usage points tip')}>
                            <QuestionOutlineIcon ml={1} />
                        </MyTooltip>
                    </Flex>
                    <Input
                        {...register('limit.maxUsagePoints', {
                            min: -1,
                            max: 10000000,
                            valueAsNumber: true,
                            required: true
                        })}
                    />
                </Flex>
                <Flex alignItems={'center'} mt={4}>
                    <Flex flex={'0 0 90px'} alignItems={'center'}>
                        {t('common.Expired Time')}
                    </Flex>
                    <Input
                        type="datetime-local"
                        defaultValue={
                            defaultData.limit?.expiredTime
                                ? dayjs(defaultData.limit?.expiredTime).format('YYYY-MM-DDTHH:mm')
                                : ''
                        }
                        onChange={(e) => {
                            setValue('limit.expiredTime', new Date(e.target.value));
                        }}
                    />
                </Flex>
                <Flex alignItems={'center'} mt={4}>
                    <Flex flex={'0 0 90px'} alignItems={'center'}>
                        默认回复
                    </Flex>
                    <Input
                        placeholder={t('outlink.Default Response') || 'Link Name'}
                        maxLength={20}
                        {...register('wecomConfig.defaultResponse', {
                            required: t('common.default Response is empty') || 'Name is empty'
                        })}
                    />
                </Flex>
                <Flex alignItems={'center'} mt={4}>
                    <Flex flex={'0 0 90px'} alignItems={'center'}>
                        立即回复
                    </Flex>
                    <Switch {...register('wecomConfig.immediateResponse')} size={'lg'} />
                </Flex>
                <Flex alignItems={'center'} mt={4}>
                    <Box flex={'0 0 90px'}>{t('outlink.WXWORK_TOKEN')}</Box>
                    <Input
                        placeholder={t('outlink.WXWORK_TOKEN') || 'Link Name'}
                        maxLength={20}
                        {...register('wecomConfig.WXWORK_TOKEN', {
                            required: t('common.Name is empty') || 'Name is empty'
                        })}
                    />
                </Flex>
                <Flex alignItems={'center'} mt={4}>
                    <Box flex={'0 0 90px'}>{t('outlink.WXWORK_AESKEY')}</Box>
                    <Input
                        placeholder={t('outlink.WXWORK_AESKEY') || 'Link Name'}
                        maxLength={20}
                        {...register('wecomConfig.WXWORK_AESKEY', {
                            required: t('common.Name is empty') || 'Name is empty'
                        })}
                    />
                </Flex>
                <Flex alignItems={'center'} mt={4}>
                    <Box flex={'0 0 90px'}>{t('outlink.WXWORK_SECRET')}</Box>
                    <Input
                        placeholder={t('outlink.WXWORK_SECRET') || 'Link Name'}
                        maxLength={20}
                        {...register('wecomConfig.WXWORK_SECRET', {
                            required: t('common.Name is empty') || 'Name is empty'
                        })}
                    />
                </Flex>
                <Flex alignItems={'center'} mt={4}>
                    <Box flex={'0 0 90px'}>{t('outlink.WXWORD_ID')}</Box>
                    <Input
                        placeholder={t('outlink.WXWORD_ID') || 'Link Name'}
                        maxLength={20}
                        {...register('wecomConfig.WXWORD_ID', {
                            required: t('common.Name is empty') || 'Name is empty'
                        })}
                    />
                </Flex>
                <Flex alignItems={'center'} mt={4}>
                    <Flex flex={'0 0 90px'} alignItems={'center'}>
                        限制回复
                    </Flex>
                    <Switch {...register('wecomConfig.ReplyLimit')} size={'lg'} />
                </Flex>
            </ModalBody>
            <ModalFooter>
                <Button variant={'whiteBase'} mr={3} onClick={onClose}>
                    {t('common.Close')}
                </Button>
                <Button
                    isLoading={creating || updating}
                    onClick={submitShareChat((data) => (isEdit ? onclickUpdate(data) : onclickCreate(data)))}
                >
                    {t('common.Confirm')}
                </Button>
            </ModalFooter>
        </MyModal>
    );
}


export default WecomEditModal;
