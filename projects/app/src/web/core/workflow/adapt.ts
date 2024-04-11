import type { StoreNodeItemType, FlowNodeItemType } from '@fastgpt/global/core/workflow/type.d';
import type { Edge, Node } from 'reactflow';
import { customAlphabet } from 'nanoid';
import { moduleTemplatesFlat } from '@fastgpt/global/core/workflow/template/constants';
import { EDGE_TYPE } from '@fastgpt/global/core/workflow/node/constant';
import { EmptyNode } from '@fastgpt/global/core/workflow/template/system/emptyNode';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);

export const appModule2FlowNode = ({
  item: storeNode
}: {
  item: StoreNodeItemType;
}): Node<FlowNodeItemType> => {
  // init some static data
  const template =
    moduleTemplatesFlat.find((template) => template.flowNodeType === storeNode.flowNodeType) ||
    EmptyNode;

  console.log(JSON.parse(JSON.stringify(moduleTemplatesFlat)));

  // replace item data
  const moduleItem: FlowNodeItemType = {
    ...template,
    ...storeNode,
    avatar: template?.avatar || storeNode.avatar,
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
    node.targetNodes.forEach((targetNode) => {
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
