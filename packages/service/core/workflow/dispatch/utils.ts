import type { ChatItemType } from '@fastgpt/global/core/chat/type.d';
import {
  WorkflowIOValueTypeEnum,
  NodeOutputKeyEnum
} from '@fastgpt/global/core/workflow/constants';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import {
  RuntimeEdgeItemType,
  RuntimeNodeItemType
} from '@fastgpt/global/core/workflow/runtime/type';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';

/* 
  区分普通连线和递归连线
  递归连线：可以通过往上查询 nodes，最终追溯到自身
*/
export const splitEdges = ({
  edges,
  allEdges,
  currentNode
}: {
  edges: RuntimeEdgeItemType[];
  allEdges: RuntimeEdgeItemType[];
  currentNode: RuntimeNodeItemType;
}) => {
  const commonEdges: RuntimeEdgeItemType[] = [];
  const recursiveEdges: RuntimeEdgeItemType[] = [];

  edges.forEach((edge) => {
    const checkIsCurrentNode = (edge: RuntimeEdgeItemType): boolean => {
      const sourceEdge = allEdges.find((item) => item.target === edge.source);
      if (!sourceEdge) return false;
      if (sourceEdge.source === currentNode.nodeId) return true;
      return checkIsCurrentNode(sourceEdge);
    };
    if (checkIsCurrentNode(edge)) {
      recursiveEdges.push(edge);
    } else {
      commonEdges.push(edge);
    }
  });

  return { commonEdges, recursiveEdges };
};

export const checkTheModuleConnectedByTool = (
  modules: StoreNodeItemType[],
  module: StoreNodeItemType
) => {
  let sign = false;
  const toolModules = modules.filter((item) => item.flowNodeType === FlowNodeTypeEnum.tools);

  toolModules.forEach((item) => {
    const toolOutput = item.outputs.find(
      (output) => output.key === NodeOutputKeyEnum.selectedTools
    );
    toolOutput?.targets.forEach((target) => {
      if (target.moduleId === module.moduleId) {
        sign = true;
      }
    });
  });

  return sign;
};

export const getHistories = (history?: ChatItemType[] | number, histories: ChatItemType[] = []) => {
  if (!history) return [];
  if (typeof history === 'number') return histories.slice(-history);
  if (Array.isArray(history)) return history;

  return [];
};

/* value type format */
export const valueTypeFormat = (value: any, type?: `${WorkflowIOValueTypeEnum}`) => {
  if (value === undefined) return;

  if (type === 'string') {
    if (typeof value !== 'object') return String(value);
    return JSON.stringify(value);
  }
  if (type === 'number') return Number(value);
  if (type === 'boolean') return Boolean(value);

  return value;
};
