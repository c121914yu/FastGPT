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
export const appModule2FlowEdge = ({ nodes }: { nodes: StoreNodeItemType[] }) => {
  const edges: Edge[] = [];
  nodes.forEach((node) =>
    node.targetNodes?.forEach((targetNode) => {
      edges.push({
        source: node.nodeId,
        sourceHandle: targetNode.sourceHandle,
        target: targetNode.nodeId,
        targetHandle: targetNode.targetHandle,
        id: nanoid(),
        type: EDGE_TYPE
      });
    })
  );

  return edges;
};
