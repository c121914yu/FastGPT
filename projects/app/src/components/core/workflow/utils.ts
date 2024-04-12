import { ModuleInputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { FlowNodeItemType, StoreNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import { type Node, type Edge } from 'reactflow';

export const flowNode2StoreNodes = ({
  nodes,
  edges
}: {
  nodes: Node<FlowNodeItemType, string | undefined>[];
  edges: Edge<any>[];
}) => {
  const formatNodes: StoreNodeItemType[] = nodes.map((item) => ({
    nodeId: item.data.nodeId,
    name: item.data.name,
    intro: item.data.intro,
    avatar: item.data.avatar,
    flowNodeType: item.data.flowNodeType,
    showStatus: item.data.showStatus,
    position: item.position,
    sourceNodes: [],
    targetNodes: [],
    inputs: item.data.inputs,
    outputs: item.data.outputs
  }));

  // compute sourceNodes and targetNodes by edges
  formatNodes.forEach((node) => {
    const sourceEdges = edges.filter((edge) => edge.target === node.nodeId);
    const targetEdges = edges.filter((edge) => edge.source === node.nodeId);

    node.sourceNodes = sourceEdges.map((item) => ({
      nodeId: item.source
    }));
    node.targetNodes = targetEdges.map((item) => ({
      nodeId: item.target,
      sourceHandle: item.sourceHandle || '',
      targetHandle: item.targetHandle || ''
    }));
  });

  return formatNodes;
};

export const filterExportModules = (modules: StoreNodeItemType[]) => {
  modules.forEach((module) => {
    // dataset - remove select dataset value
    if (module.flowNodeType === FlowNodeTypeEnum.datasetSearchNode) {
      module.inputs.forEach((item) => {
        if (item.key === ModuleInputKeyEnum.datasetSelectList) {
          item.value = [];
        }
      });
    }
  });

  return JSON.stringify(modules, null, 2);
};
