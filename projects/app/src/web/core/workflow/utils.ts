import type {
  StoreNodeItemType,
  FlowNodeItemType,
  FlowNodeTemplateType
} from '@fastgpt/global/core/workflow/type/index.d';
import type { Edge, Node, XYPosition } from 'reactflow';
import { moduleTemplatesFlat } from '@fastgpt/global/core/workflow/template/constants';
import {
  EDGE_TYPE,
  FlowNodeInputTypeEnum,
  FlowNodeTypeEnum
} from '@fastgpt/global/core/workflow/node/constant';
import { EmptyNode } from '@fastgpt/global/core/workflow/template/system/emptyNode';
import { StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import { getNanoid } from '@fastgpt/global/common/string/tools';

export const nodeTemplate2FlowNode = ({
  template,
  position
}: {
  template: FlowNodeTemplateType;
  position: XYPosition;
}): Node<FlowNodeItemType> => {
  // replace item data
  const moduleItem: FlowNodeItemType = {
    ...template,
    nodeId: getNanoid()
  };

  return {
    id: moduleItem.nodeId,
    type: moduleItem.flowNodeType,
    data: moduleItem,
    position: position
  };
};
export const storeNode2FlowNode = ({
  item: storeNode
}: {
  item: StoreNodeItemType;
}): Node<FlowNodeItemType> => {
  // init some static data
  const template =
    moduleTemplatesFlat.find((template) => template.flowNodeType === storeNode.flowNodeType) ||
    EmptyNode;

  // replace item data
  const moduleItem: FlowNodeItemType = {
    ...template,
    ...storeNode,
    avatar: template?.avatar,
    inputs: storeNode.inputs.map((storeInput) => {
      const templateInput =
        template.inputs.find((item) => item.key === storeInput.key) || storeInput;
      return {
        ...templateInput,
        ...storeInput
      };
    }),
    outputs: storeNode.outputs.map((storeOutput) => {
      const templateOutput =
        template.outputs.find((item) => item.key === storeOutput.key) || storeOutput;
      return {
        ...storeOutput,
        ...templateOutput,
        value: storeOutput.value
      };
    })
  };

  return {
    id: storeNode.nodeId,
    type: storeNode.flowNodeType,
    data: moduleItem,
    position: storeNode.position || { x: 0, y: 0 }
  };
};
export const storeEdgesRenderEdge = ({ edge }: { edge: StoreEdgeItemType }) => {
  return {
    ...edge,
    id: getNanoid(),
    type: EDGE_TYPE
  };
};

export const computedNodeInputReference = ({
  nodeId,
  nodes,
  edges
}: {
  nodeId: string;
  nodes: FlowNodeItemType[];
  edges: Edge[];
}) => {
  // get current node
  const node = nodes.find((item) => item.nodeId === nodeId);
  if (!node) {
    return;
  }
  let sourceNodes: FlowNodeItemType[] = [];
  // 根据 edge 获取所有的 source 节点（source节点会继续向前递归获取）
  const findSourceNode = (nodeId: string) => {
    const targetEdges = edges.filter((item) => item.target === nodeId);
    targetEdges.forEach((edge) => {
      const sourceNode = nodes.find((item) => item.nodeId === edge.source);
      if (!sourceNode) return;

      // 去重
      if (sourceNodes.some((item) => item.nodeId === sourceNode.nodeId)) {
        return;
      }
      sourceNodes.push(sourceNode);
      findSourceNode(sourceNode.nodeId);
    });
  };
  findSourceNode(nodeId);

  // add system config node
  const systemConfigNode = nodes.find(
    (item) => item.flowNodeType === FlowNodeTypeEnum.systemConfig
  );

  if (systemConfigNode) {
    sourceNodes.push(systemConfigNode);
  }

  return sourceNodes;
};

/* Connection rules */
export const checkWorkflowNodeAndConnection = ({
  nodes,
  edges
}: {
  nodes: Node<FlowNodeItemType, string | undefined>[];
  edges: Edge<any>[];
}): string[] | undefined => {
  // 1. reference check. Required value
  for (const node of nodes) {
    const data = node.data;
    const inputs = data.inputs;

    if (
      inputs.some((input) => {
        if (input.required) {
          if (Array.isArray(input.value) && input.value.length === 0) return true;
          if (input.value === undefined) return true;
        }
        const renderType = input.renderTypeList[input.selectedTypeIndex || 0];
        if (renderType === FlowNodeInputTypeEnum.reference && input.required) {
          if (!input.value || !Array.isArray(input.value) || input.value.length !== 2) {
            return true;
          }
          // Can not find key
          const sourceNode = nodes.find((item) => item.data.nodeId === input.value[0]);
          if (!sourceNode) {
            return true;
          }
          const sourceOutput = sourceNode.data.outputs.find((item) => item.id === input.value[1]);
          if (!sourceOutput) {
            return true;
          }
        }
        return false;
      })
    ) {
      return [data.nodeId];
    }
  }
};
