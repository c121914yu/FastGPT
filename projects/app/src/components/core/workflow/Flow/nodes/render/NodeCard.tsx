import React, { useMemo } from 'react';
import { Box, Button, Card, Flex, IconButton } from '@chakra-ui/react';
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
import { useDebug } from '../../hooks/useDebug';
import { ResponseBox } from '@/components/ChatBox/WholeResponseModal';
import { CloseIcon } from '@chakra-ui/icons';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';

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
    isError = false,
    debugResult
  } = props;

  const { nodes, setHoverNodeId, onUpdateNodeError } = useFlowProviderStore();

  const showToolHandle = useMemo(
    () => isTool && !!nodes.find((item) => item.data?.flowNodeType === FlowNodeTypeEnum.tools),
    [isTool, nodes]
  );

  /* Node header */
  const Header = useMemo(() => {
    return (
      <Box position={'relative'}>
        {/* debug */}
        <NodeDebugResponse nodeId={nodeId} debugResult={debugResult} />
        <Box className="custom-drag-handle" px={4} py={3}>
          {/* tool target handle */}
          {showToolHandle && <ToolTargetHandle nodeId={nodeId} />}

          {/* avatar and name */}
          <Flex alignItems={'center'}>
            <Avatar src={avatar} borderRadius={'0'} objectFit={'contain'} w={'30px'} h={'30px'} />
            <Box ml={3} fontSize={'lg'}>
              {t(name)}
            </Box>
          </Flex>
          {!forbidMenu && (
            <MenuRender name={name} nodeId={nodeId} flowNodeType={flowNodeType} inputs={inputs} />
          )}
          <NodeIntro nodeId={nodeId} intro={intro} />
        </Box>
      </Box>
    );
  }, [
    nodeId,
    debugResult,
    showToolHandle,
    avatar,
    t,
    name,
    forbidMenu,
    flowNodeType,
    inputs,
    intro
  ]);

  const Render = useMemo(() => {
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
          },
          '& .controller-debug': {
            display: 'block'
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
        <ConnectionSourceHandle nodeId={nodeId} />
        <ConnectionTargetHandle nodeId={nodeId} />
      </Box>
    );
  }, [Header, children, isError, maxW, minW, nodeId, onUpdateNodeError, selected, setHoverNodeId]);

  return Render;
};

export default React.memo(NodeCard);

const MenuRender = React.memo(function MenuRender({
  name,
  nodeId,
  flowNodeType,
  inputs
}: {
  name: string;
  nodeId: string;
  flowNodeType: Props['flowNodeType'];
  inputs: Props['inputs'];
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { setLoading } = useSystemStore();
  const { openDebugNode, DebugInputModal } = useDebug();

  const { openConfirm: onOpenConfirmSync, ConfirmModal: ConfirmSyncModal } = useConfirm({
    content: t('module.Confirm Sync Plugin')
  });
  // custom title edit
  const { onOpenModal: onOpenCustomTitleModal, EditModal: EditTitleModal } = useEditTitle({
    title: t('common.Custom Title'),
    placeholder: t('app.module.Custom Title Tip') || ''
  });
  const { openConfirm: onOpenConfirmDeleteNode, ConfirmModal: ConfirmDeleteModal } = useConfirm({
    content: t('core.module.Confirm Delete Node'),
    type: 'delete'
  });

  const { onDelNode, onCopyNode, onResetNode, onChangeNode } = useFlowProviderStore();

  const Render = useMemo(() => {
    const menuList = [
      {
        icon: 'core/workflow/debug',
        label: t('core.workflow.Debug'),
        variant: 'whiteBase',
        onClick: () => openDebugNode({ entryNodeId: nodeId })
      },
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
                onOpenCustomTitleModal({
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
      <>
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
                leftIcon={<MyIcon name={item.icon as any} w={'13px'} />}
                onClick={item.onClick}
              >
                {item.label}
              </Button>
            </Box>
          ))}
        </Box>
        <EditTitleModal maxLength={20} />
        <ConfirmSyncModal />
        <ConfirmDeleteModal />
        <DebugInputModal />
      </>
    );
  }, [
    ConfirmDeleteModal,
    ConfirmSyncModal,
    DebugInputModal,
    EditTitleModal,
    flowNodeType,
    inputs,
    name,
    nodeId,
    onChangeNode,
    onCopyNode,
    onDelNode,
    onOpenConfirmDeleteNode,
    onOpenConfirmSync,
    onOpenCustomTitleModal,
    onResetNode,
    openDebugNode,
    setLoading,
    t,
    toast
  ]);

  return Render;
});

const NodeIntro = React.memo(function NodeIntro({
  nodeId,
  intro
}: {
  nodeId: string;
  intro: string;
}) {
  const { t } = useTranslation();
  const { onChangeNode, splitToolInputs } = useFlowProviderStore();

  const moduleIsTool = useMemo(() => {
    const { isTool } = splitToolInputs([], nodeId);
    return isTool;
  }, [nodeId, splitToolInputs]);

  // edit intro
  const { onOpenModal: onOpenIntroModal, EditModal: EditIntroModal } = useEditTextarea({
    title: t('core.module.Edit intro'),
    tip: '调整该模块会对工具调用时机有影响。\n你可以通过精确的描述该模块功能，引导模型进行工具调用。',
    canEmpty: false
  });

  const Render = useMemo(() => {
    return (
      <>
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
        <EditIntroModal maxLength={500} />
      </>
    );
  }, [EditIntroModal, intro, moduleIsTool, nodeId, onChangeNode, onOpenIntroModal, t]);

  return Render;
});

const NodeDebugResponse = React.memo(function NodeDebugResponse({
  nodeId,
  debugResult
}: {
  nodeId: string;
  debugResult: FlowNodeItemType['debugResult'];
}) {
  const { t } = useTranslation();
  const { onChangeNode } = useFlowProviderStore();

  const RenderStatus = useMemo(() => {
    const map = {
      running: {
        bg: 'primary.200',
        text: t('core.workflow.Running')
      },
      success: {
        bg: 'green.50',
        text: t('core.workflow.Success')
      },
      failed: {
        bg: 'red.200',
        text: t('core.workflow.Failed')
      }
    };

    const statusData = map[debugResult?.status || 'running'];

    const response = debugResult?.response;

    return !!debugResult ? (
      <>
        <Flex px={4} bg={statusData.bg} borderTopRadius={'md'} py={2}>
          <MyIcon name={'support/account/loginoutLight'} w={'14px'} mr={1} />
          <Box color={'myGray.900'} fontWeight={'bold'}>
            {statusData.text}
          </Box>
        </Flex>
        {/* result */}
        {response && (
          <Card
            className="nodrag"
            position={'absolute'}
            right={'-305px'}
            top={0}
            zIndex={10}
            w={'300px'}
            py={3}
            border={'base'}
          >
            <Flex px={4} justifyContent={'space-between'} mb={1}>
              <Box fontWeight={'bold'}>{t('core.workflow.Run result')}</Box>
              <CloseIcon
                onClick={() => {
                  onChangeNode({
                    nodeId,
                    type: 'attr',
                    key: 'debugResult',
                    value: undefined
                  });
                }}
              />
            </Flex>
            <Box h={'400px'} overflow={'auto'}>
              <ResponseBox response={[response]} showDetail hideTabs />
            </Box>
          </Card>
        )}
      </>
    ) : null;
  }, [debugResult, nodeId, onChangeNode, t]);

  return <>{RenderStatus}</>;
});
