import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Connection,
  Controls,
  ControlButton,
  MiniMap,
  NodeProps,
  ReactFlowProvider,
  useReactFlow,
  OnInit
} from 'reactflow';
import { Box, Flex, IconButton, useDisclosure } from '@chakra-ui/react';
import { SmallCloseIcon } from '@chakra-ui/icons';
import { EDGE_TYPE, FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';

import dynamic from 'next/dynamic';

import ButtonEdge from './components/ButtonEdge';
import NodeTemplatesModal from './NodeTemplatesModal';
import { useFlowProviderStore } from './FlowProvider';

import 'reactflow/dist/style.css';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useTranslation } from 'next-i18next';
import { FlowNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@/components/MyTooltip';

const NodeSimple = dynamic(() => import('./nodes/NodeSimple'));
const nodeTypes: Record<`${FlowNodeTypeEnum}`, any> = {
  [FlowNodeTypeEnum.emptyNode]: NodeSimple,
  [FlowNodeTypeEnum.systemConfig]: dynamic(() => import('./nodes/NodeSystemConfig')),
  [FlowNodeTypeEnum.workflowStart]: dynamic(() => import('./nodes/NodeWorkflowStart')),
  [FlowNodeTypeEnum.historyNode]: NodeSimple,
  [FlowNodeTypeEnum.chatNode]: NodeSimple,
  [FlowNodeTypeEnum.datasetSearchNode]: NodeSimple,
  [FlowNodeTypeEnum.datasetConcatNode]: dynamic(() => import('./nodes/NodeDatasetConcat')),
  [FlowNodeTypeEnum.answerNode]: dynamic(() => import('./nodes/NodeAnswer')),
  [FlowNodeTypeEnum.classifyQuestion]: dynamic(() => import('./nodes/NodeCQNode')),
  [FlowNodeTypeEnum.contentExtract]: dynamic(() => import('./nodes/NodeExtract')),
  [FlowNodeTypeEnum.httpRequest468]: dynamic(() => import('./nodes/NodeHttp')),
  [FlowNodeTypeEnum.httpRequest]: NodeSimple,
  [FlowNodeTypeEnum.runApp]: NodeSimple,
  [FlowNodeTypeEnum.pluginInput]: dynamic(() => import('./nodes/NodePluginInput')),
  [FlowNodeTypeEnum.pluginOutput]: dynamic(() => import('./nodes/NodePluginOutput')),
  [FlowNodeTypeEnum.pluginModule]: NodeSimple,
  [FlowNodeTypeEnum.queryExtension]: NodeSimple,
  [FlowNodeTypeEnum.tools]: dynamic(() => import('./nodes/NodeTools')),
  [FlowNodeTypeEnum.stopTool]: (data: NodeProps<FlowNodeItemType>) => (
    <NodeSimple {...data} minW={'100px'} maxW={'300px'} />
  ),
  [FlowNodeTypeEnum.lafModule]: dynamic(() => import('./nodes/NodeLaf'))
};
const edgeTypes = {
  [EDGE_TYPE]: ButtonEdge
};

const Container = React.memo(function Container() {
  const { toast } = useToast();
  const { t } = useTranslation();

  const {
    reactFlowWrapper,
    nodes,
    onNodesChange,
    edges,
    onEdgesChange,
    onConnectStart,
    onConnectEnd,
    onConnect
  } = useFlowProviderStore();

  const customOnConnect = useCallback(
    (connect: Connection) => {
      if (!connect.sourceHandle || !connect.targetHandle) {
        return;
      }
      if (connect.source === connect.target) {
        return toast({
          status: 'warning',
          title: t('core.module.Can not connect self')
        });
      }
      onConnect({
        connect
      });
    },
    [onConnect, t, toast]
  );

  return (
    <ReactFlow
      ref={reactFlowWrapper}
      fitView
      nodes={nodes}
      edges={edges}
      minZoom={0.1}
      maxZoom={1.5}
      defaultEdgeOptions={{
        animated: true,
        zIndex: 0
      }}
      elevateEdgesOnSelect
      connectionLineStyle={{ strokeWidth: 2, stroke: '#5A646Es' }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={customOnConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
    >
      <FlowController />
    </ReactFlow>
  );
});

const Flow = ({ Header, ...data }: { Header: React.ReactNode }) => {
  const {
    isOpen: isOpenTemplate,
    onOpen: onOpenTemplate,
    onClose: onCloseTemplate
  } = useDisclosure();

  const memoRenderContainer = useMemo(() => {
    return (
      <Box
        minH={'400px'}
        flex={'1 0 0'}
        w={'100%'}
        h={0}
        position={'relative'}
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
      >
        {/* open module template */}
        <IconButton
          position={'absolute'}
          top={5}
          left={5}
          size={'mdSquare'}
          borderRadius={'50%'}
          icon={<SmallCloseIcon fontSize={'26px'} />}
          transform={isOpenTemplate ? '' : 'rotate(135deg)'}
          transition={'0.2s ease'}
          aria-label={''}
          zIndex={1}
          boxShadow={'2px 2px 6px #85b1ff'}
          onClick={() => {
            isOpenTemplate ? onCloseTemplate() : onOpenTemplate();
          }}
        />

        <Container {...data} />

        <NodeTemplatesModal isOpen={isOpenTemplate} onClose={onCloseTemplate} />
      </Box>
    );
  }, [data, isOpenTemplate, onCloseTemplate, onOpenTemplate]);

  return (
    <Box h={'100%'} position={'fixed'} zIndex={999} top={0} left={0} right={0} bottom={0}>
      <ReactFlowProvider>
        <Flex h={'100%'} flexDirection={'column'} bg={'#fff'}>
          {Header}
          {memoRenderContainer}
        </Flex>
      </ReactFlowProvider>
    </Box>
  );
};

export default React.memo(Flow);

const FlowController = React.memo(function FlowController() {
  const { fitView } = useReactFlow();
  return (
    <>
      <MiniMap
        style={{
          height: 78,
          width: 126,
          marginBottom: 35
        }}
        pannable
      />
      <Controls
        position={'bottom-right'}
        style={{
          display: 'flex',
          marginBottom: 5,
          background: 'white',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow:
            '0px 0px 1px 0px rgba(19, 51, 107, 0.20), 0px 12px 16px -4px rgba(19, 51, 107, 0.20)'
        }}
        showInteractive={false}
        showFitView={false}
      >
        <MyTooltip label={'页面居中'}>
          <ControlButton className="custom-workflow-fix_view" onClick={() => fitView()}>
            <MyIcon name={'core/modules/fixview'} w={'14px'} />
          </ControlButton>
        </MyTooltip>
      </Controls>
      <Background />
    </>
  );
});