import React, { useMemo, useState } from 'react';
import { Box, Button, Flex } from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import Avatar from '@/components/Avatar';
import type { FlowNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import { useTranslation } from 'next-i18next';
import { useEditTitle } from '@/web/common/hooks/useEditTitle';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useFlowProviderStore } from '../../FlowProvider';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { NodeInputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { getPreviewPluginModule } from '@/web/core/plugin/api';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { LOGO_ICON } from '@fastgpt/global/common/system/constants';
import { ToolTargetHandle } from './Handle/ToolHandle';
import { useEditTextarea } from '@fastgpt/web/hooks/useEditTextarea';
import { ConnectionSourceHandle, ConnectionTargetHandle } from './Handle/ConnectionHandle';

type Props = FlowNodeItemType & {
  children?: React.ReactNode | React.ReactNode[] | string;
  minW?: string | number;
  maxW?: string | number;
  forbidMenu?: boolean;
  selected?: boolean;
};

const NodeCard = (props: Props) => {
  const { t } = useTranslation();
  const {
    children,
    avatar = LOGO_ICON,
    name = t('core.module.template.UnKnow Module'),
    intro,
    minW = '300px',
    maxW = '600px',
    nodeId,
    flowNodeType,
    inputs,
    selected,
    forbidMenu,
    isTool = false,
    isError = false
  } = props;

  const { toast } = useToast();
  const { setLoading } = useSystemStore();
  const {
    nodes,
    splitToolInputs,
    onDelNode,
    onCopyNode,
    onResetNode,
    onChangeNode,
    setHoverNodeId,
    onUpdateNodeError
  } = useFlowProviderStore();

  // edit intro
  const { onOpenModal: onOpenIntroModal, EditModal: EditIntroModal } = useEditTextarea({
    title: t('core.module.Edit intro'),
    tip: '调整该模块会对工具调用时机有影响。\n你可以通过精确的描述该模块功能，引导模型进行工具调用。',
    canEmpty: false
  });
  // custom title edit
  const { onOpenModal, EditModal: EditTitleModal } = useEditTitle({
    title: t('common.Custom Title'),
    placeholder: t('app.module.Custom Title Tip') || ''
  });
  const { openConfirm: onOpenConfirmSync, ConfirmModal: ConfirmSyncModal } = useConfirm({
    content: t('module.Confirm Sync Plugin')
  });
  const { openConfirm: onOpenConfirmDeleteNode, ConfirmModal: ConfirmDeleteModal } = useConfirm({
    content: t('core.module.Confirm Delete Node'),
    type: 'delete'
  });

  const showToolHandle = useMemo(
    () => isTool && !!nodes.find((item) => item.data?.flowNodeType === FlowNodeTypeEnum.tools),
    [isTool, nodes]
  );
  const moduleIsTool = useMemo(() => {
    const { isTool } = splitToolInputs([], nodeId);
    return isTool;
  }, [nodeId, splitToolInputs]);

  /* Node header */
  const Header = useMemo(() => {
    const menuList = [
      ...(flowNodeType === FlowNodeTypeEnum.pluginModule
        ? [
            {
              icon: 'common/refreshLight',
              label: t('plugin.Synchronous version'),
              variant: 'whiteBase',
              onClick: () => {
                const pluginId = inputs.find(
                  (item) => item.key === NodeInputKeyEnum.pluginId
                )?.value;
                if (!pluginId) return;
                onOpenConfirmSync(async () => {
                  try {
                    setLoading(true);
                    const pluginModule = await getPreviewPluginModule(pluginId);
                    onResetNode({
                      id: nodeId,
                      module: pluginModule
                    });
                  } catch (e) {
                    return toast({
                      status: 'error',
                      title: getErrText(e, t('plugin.Get Plugin Module Detail Failed'))
                    });
                  }
                  setLoading(false);
                })();
              }
            }
          ]
        : [
            {
              icon: 'edit',
              label: t('common.Rename'),
              variant: 'whiteBase',
              onClick: () =>
                onOpenModal({
                  defaultVal: name,
                  onSuccess: (e) => {
                    if (!e) {
                      return toast({
                        title: t('app.modules.Title is required'),
                        status: 'warning'
                      });
                    }
                    onChangeNode({
                      nodeId,
                      type: 'attr',
                      key: 'name',
                      value: e
                    });
                  }
                })
            }
          ]),
      {
        icon: 'copy',
        label: t('common.Copy'),
        variant: 'whiteBase',
        onClick: () => onCopyNode(nodeId)
      },
      {
        icon: 'delete',
        label: t('common.Delete'),
        variant: 'whiteDanger',
        onClick: onOpenConfirmDeleteNode(() => onDelNode(nodeId))
      }
    ];

    return (
      <Box className="custom-drag-handle" px={4} py={3} position={'relative'}>
        {showToolHandle && <ToolTargetHandle nodeId={nodeId} />}
        <Flex alignItems={'center'}>
          <Avatar src={avatar} borderRadius={'0'} objectFit={'contain'} w={'30px'} h={'30px'} />
          <Box ml={3} fontSize={'lg'}>
            {t(name)}
          </Box>
        </Flex>
        {!forbidMenu && (
          <Box
            className="nodrag controller-menu"
            display={'none'}
            flexDirection={'column'}
            gap={3}
            position={'absolute'}
            top={'-20px'}
            right={0}
            transform={'translateX(90%)'}
            pl={'20px'}
            pr={'10px'}
            pb={'20px'}
            pt={'20px'}
          >
            {menuList.map((item) => (
              <Box key={item.icon}>
                <Button
                  size={'xs'}
                  variant={item.variant}
                  leftIcon={<MyIcon name={item.icon as any} w={'12px'} />}
                  onClick={item.onClick}
                >
                  {item.label}
                </Button>
              </Box>
            ))}
          </Box>
        )}
        <Flex alignItems={'flex-end'} py={1}>
          <Box fontSize={'xs'} color={'myGray.600'} flex={'1 0 0'}>
            {t(intro)}
          </Box>
          {moduleIsTool && (
            <Button
              size={'xs'}
              variant={'whiteBase'}
              onClick={() => {
                onOpenIntroModal({
                  defaultVal: intro,
                  onSuccess(e) {
                    onChangeNode({
                      nodeId,
                      type: 'attr',
                      key: 'intro',
                      value: e
                    });
                  }
                });
              }}
            >
              {t('core.module.Edit intro')}
            </Button>
          )}
        </Flex>
      </Box>
    );
  }, [
    flowNodeType,
    t,
    onOpenConfirmDeleteNode,
    showToolHandle,
    nodeId,
    avatar,
    name,
    forbidMenu,
    intro,
    moduleIsTool,
    inputs,
    onOpenConfirmSync,
    setLoading,
    onResetNode,
    toast,
    onOpenModal,
    onChangeNode,
    onCopyNode,
    onDelNode,
    onOpenIntroModal
  ]);
  /* config modal */
  const RenderModal = useMemo(() => {
    return (
      <>
        <EditTitleModal maxLength={20} />
        {moduleIsTool && <EditIntroModal maxLength={500} />}
        <ConfirmSyncModal />
        <ConfirmDeleteModal />
      </>
    );
  }, [ConfirmDeleteModal, ConfirmSyncModal, EditIntroModal, EditTitleModal, moduleIsTool]);

  return (
    <Box
      minW={minW}
      maxW={maxW}
      bg={'white'}
      borderWidth={'1px'}
      borderRadius={'md'}
      boxShadow={'1'}
      _hover={{
        boxShadow: '4',
        '& .controller-menu': {
          display: 'flex'
        }
      }}
      onMouseEnter={() => setHoverNodeId(nodeId)}
      onMouseLeave={() => setHoverNodeId(undefined)}
      {...(isError
        ? {
            borderColor: 'red.500',
            onMouseDownCapture: () => onUpdateNodeError(nodeId, false)
          }
        : {
            borderColor: selected ? 'primary.600' : 'borderColor.base'
          })}
    >
      {Header}
      {children}
      {RenderModal}
      <ConnectionSourceHandle nodeId={nodeId} />
      <ConnectionTargetHandle nodeId={nodeId} />
    </Box>
  );
};

export default React.memo(NodeCard);
