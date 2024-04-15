import type {
  StoreNodeItemType,
  FlowNodeItemType,
  FlowNodeTemplateType
} from '@fastgpt/global/core/workflow/type/index.d';
import type { Edge, Node, XYPosition } from 'reactflow';
import { customAlphabet } from 'nanoid';
import { moduleTemplatesFlat } from '@fastgpt/global/core/workflow/template/constants';
import { EDGE_TYPE, FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { EmptyNode } from '@fastgpt/global/core/workflow/template/system/emptyNode';
import { StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import { getGlobalVariableNode } from '../../../../../../packages/global/core/workflow/template/system/globalVariable';
import { splitGuideModule } from '@fastgpt/global/core/workflow/utils';
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

  // add system config node
  const systemConfigNode = nodes.find(
    (item) => item.flowNodeType === FlowNodeTypeEnum.systemConfig
  );
  if (systemConfigNode) {
    sourceNodes.push(systemConfigNode);
  }

  return sourceNodes;
};
