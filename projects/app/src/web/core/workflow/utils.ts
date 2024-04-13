import type {
  StoreNodeItemType,
  FlowNodeItemType,
  FlowNodeTemplateType
} from '@fastgpt/global/core/workflow/type/index.d';
import type { Edge, Node, XYPosition } from 'reactflow';
import { customAlphabet } from 'nanoid';
import { moduleTemplatesFlat } from '@fastgpt/global/core/workflow/template/constants';
import { EDGE_TYPE } from '@fastgpt/global/core/workflow/node/constant';
import { EmptyNode } from '@fastgpt/global/core/workflow/template/system/emptyNode';
import { StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);

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
    nodeId: nanoid()
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
    inputs: template.inputs.map((input) => {
      // use latest inputs
      const storeNodeInput = storeNode.inputs.find((item) => item.key === input.key) || input;
      return {
        ...input,
        value: storeNodeInput.value
      };
    }),
    outputs: template.outputs.map((output) => {
      // unChange outputs
      const storeNodeOutput = storeNode.outputs.find((item) => item.key === output.key) || output;
      return {
        ...output,
        value: storeNodeOutput.value
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
    id: nanoid(),
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

  return sourceNodes;
};
