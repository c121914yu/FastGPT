import React, { useEffect } from 'react';
import ReactFlow, { Background, ReactFlowProvider, useNodesState } from 'reactflow';
import { FlowNodeItemType, StoreNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import dynamic from 'next/dynamic';
import { plugin2ModuleIO } from '@fastgpt/global/core/workflow/utils';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { Box } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { PluginItemSchema } from '@fastgpt/global/core/plugin/type';
import { storeNode2FlowNode } from '@/web/core/workflow/adapt';

const nodeTypes = {
  [FlowNodeTypeEnum.pluginModule]: dynamic(
    () => import('@/components/core/workflow/Flow/nodes/NodeSimple')
  )
};

const PreviewPlugin = ({
  plugin,
  modules,
  onClose
}: {
  plugin: PluginItemSchema;
  modules: StoreNodeItemType[];
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const [nodes = [], setNodes, onNodesChange] = useNodesState<FlowNodeItemType>([]);

  useEffect(() => {
    setNodes([
      storeNode2FlowNode({
        item: {
          nodeId: 'plugin',
          flowNodeType: FlowNodeTypeEnum.pluginModule,
          name: plugin.name,
          intro: plugin.intro,
          targetNodes: [],
          sourceNodes: [],
          ...plugin2ModuleIO(plugin._id, modules)
        }
      })
    ]);
  }, [modules, plugin, setNodes]);

  return (
    <MyModal
      isOpen
      title={t('module.Preview Plugin')}
      iconSrc="/imgs/modal/preview.svg"
      onClose={onClose}
      isCentered
    >
      <Box h={'400px'} w={'400px'}>
        <ReactFlowProvider>
          <ReactFlow
            fitView
            nodes={nodes}
            edges={[]}
            minZoom={0.1}
            maxZoom={1.5}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
          >
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </Box>
    </MyModal>
  );
};

export default React.memo(PreviewPlugin);
