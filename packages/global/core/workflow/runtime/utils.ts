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
  const entryList = [
    FlowNodeTypeEnum.systemConfig,
    FlowNodeTypeEnum.workflowStart,
    FlowNodeTypeEnum.pluginInput
  ];
  return nodes
    .filter((node) => entryList.includes(node.flowNodeType as any))
    .map((item) => item.nodeId);
};

export const storeNodes2RuntimeNodes = (
  nodes: StoreNodeItemType[],
  entryNodeIds: string[]
): RuntimeNodeItemType[] => {
  return (
    nodes.map<RuntimeNodeItemType>((node) => {
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
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    typeof value[0] !== 'string' ||
    typeof value[1] !== 'string'
  ) {
    return value;
  }
  const sourceNodeId = value[0];
  const outputId = value[1];
  const node = nodes.find((node) => node.nodeId === sourceNodeId);

  if (!node) {
    return undefined;
  }

  const outputValue = node.outputs.find((output) => output.id === outputId)?.value;

  return outputValue;
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
