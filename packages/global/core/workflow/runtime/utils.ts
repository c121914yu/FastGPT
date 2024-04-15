import { ChatCompletionRequestMessageRoleEnum } from '../../ai/constants';
import { FlowNodeTypeEnum } from '../node/constant';
import { StoreNodeItemType } from '../type';
import { StoreEdgeItemType } from '../type/edge';
import { RuntimeEdgeItemType, RuntimeNodeItemType } from './type';

export const initWorkflowEdgeStatus = (edges: StoreEdgeItemType[]): RuntimeEdgeItemType[] => {
  return (
    edges?.map((edge) => ({
      ...edge,
      status: 'waiting'
    })) || []
  );
};

export const getDefaultEntryNodeIds = (nodes: (StoreNodeItemType | RuntimeNodeItemType)[]) => {
  const entryList = [FlowNodeTypeEnum.workflowStart, FlowNodeTypeEnum.pluginInput];
  return nodes
    .filter((node) => entryList.includes(node.flowNodeType as any))
    .map((item) => item.nodeId);
};

export const storeNodes2RuntimeNodes = (
  nodes: StoreNodeItemType[],
  entryNodeIds: string[]
): RuntimeNodeItemType[] => {
  return (
    nodes
      ?.filter((item) => {
        return ![FlowNodeTypeEnum.systemConfig].includes(item.nodeId as any);
      })
      .map<RuntimeNodeItemType>((node) => {
        return {
          nodeId: node.nodeId,
          name: node.name,
          avatar: node.avatar,
          intro: node.intro,
          flowNodeType: node.flowNodeType,
          showStatus: node.showStatus,
          isEntry: entryNodeIds.includes(node.nodeId),
          inputs: node.inputs,
          outputs: node.outputs,
          pluginId: node.pluginId
        };
      }) || []
  );
};

export const getReferenceVariableValue = ({
  value,
  nodes
}: {
  value: [string, string];
  nodes: RuntimeNodeItemType[];
}) => {
  if (!Array.isArray(value) || value.length !== 2) {
    return value;
  }
  const sourceNodeId = value[0];
  const outputId = value[1];
  const node = nodes.find((node) => node.nodeId === sourceNodeId);

  if (!node) {
    return value;
  }

  const outputValue = node.outputs.find((output) => output.id === outputId)?.value;

  return outputValue ?? value;
};

export const textAdaptGptResponse = ({
  text,
  model = '',
  finish_reason = null,
  extraData = {}
}: {
  model?: string;
  text: string | null;
  finish_reason?: null | 'stop';
  extraData?: Object;
}) => {
  return JSON.stringify({
    ...extraData,
    id: '',
    object: '',
    created: 0,
    model,
    choices: [
      {
        delta:
          text === null
            ? {}
            : { role: ChatCompletionRequestMessageRoleEnum.Assistant, content: text },
        index: 0,
        finish_reason
      }
    ]
  });
};
