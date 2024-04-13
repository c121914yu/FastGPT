import { NextApiResponse } from 'next';
import { NodeInputKeyEnum, WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import {
  DispatchNodeResponseKeyEnum,
  needReplaceReferenceInputTypeList
} from '@fastgpt/global/core/workflow/runtime/constants';
import { NodeOutputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import type { ChatDispatchProps } from '@fastgpt/global/core/workflow/type/index.d';
import type {
  DispatchNodeResultType,
  RuntimeNodeItemType
} from '@fastgpt/global/core/workflow/runtime/type.d';
import type { ModuleDispatchProps } from '@fastgpt/global/core/workflow/type/index.d';
import type {
  AIChatItemValueItemType,
  ChatHistoryItemResType,
  ToolRunResponseItemType
} from '@fastgpt/global/core/chat/type.d';
import {
  FlowNodeInputTypeEnum,
  FlowNodeTypeEnum
} from '@fastgpt/global/core/workflow/node/constant';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import { replaceVariable } from '@fastgpt/global/common/string/tools';
import { responseWriteNodeStatus } from '../../../common/response';
import { getSystemTime } from '@fastgpt/global/common/time/timezone';

import { dispatchWorkflowStart } from './init/workflowStart';
import { dispatchChatCompletion } from './chat/oneapi';
import { dispatchDatasetSearch } from './dataset/search';
import { dispatchDatasetConcat } from './dataset/concat';
import { dispatchAnswer } from './tools/answer';
import { dispatchClassifyQuestion } from './agent/classifyQuestion';
import { dispatchContentExtract } from './agent/extract';
import { dispatchHttp468Request } from './tools/http468';
import { dispatchAppRequest } from './tools/runApp';
import { dispatchQueryExtension } from './tools/queryExternsion';
import { dispatchRunPlugin } from './plugin/run';
import { dispatchPluginInput } from './plugin/runInput';
import { dispatchPluginOutput } from './plugin/runOutput';
import { checkTheModuleConnectedByTool, splitEdges, valueTypeFormat } from './utils';
import { ChatNodeUsageType } from '@fastgpt/global/support/wallet/bill/type';
import { dispatchRunTools } from './agent/runTool/index';
import { ChatItemValueTypeEnum } from '@fastgpt/global/core/chat/constants';
import { DispatchFlowResponse } from './type';
import { dispatchStopToolCall } from './agent/runTool/stopTool';
import { dispatchLafRequest } from './tools/runLaf';
import { RuntimeEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import { getReferenceVariableValue } from '@fastgpt/global/core/workflow/runtime/utils';

const callbackMap: Record<`${FlowNodeTypeEnum}`, Function> = {
  [FlowNodeTypeEnum.workflowStart]: dispatchWorkflowStart,
  [FlowNodeTypeEnum.answerNode]: dispatchAnswer,
  [FlowNodeTypeEnum.chatNode]: dispatchChatCompletion,
  [FlowNodeTypeEnum.datasetSearchNode]: dispatchDatasetSearch,
  [FlowNodeTypeEnum.datasetConcatNode]: dispatchDatasetConcat,
  [FlowNodeTypeEnum.classifyQuestion]: dispatchClassifyQuestion,
  [FlowNodeTypeEnum.contentExtract]: dispatchContentExtract,
  [FlowNodeTypeEnum.httpRequest468]: dispatchHttp468Request,
  [FlowNodeTypeEnum.runApp]: dispatchAppRequest,
  [FlowNodeTypeEnum.pluginModule]: dispatchRunPlugin,
  [FlowNodeTypeEnum.pluginInput]: dispatchPluginInput,
  [FlowNodeTypeEnum.pluginOutput]: dispatchPluginOutput,
  [FlowNodeTypeEnum.queryExtension]: dispatchQueryExtension,
  [FlowNodeTypeEnum.tools]: dispatchRunTools,
  [FlowNodeTypeEnum.stopTool]: dispatchStopToolCall,
  [FlowNodeTypeEnum.lafModule]: dispatchLafRequest,

  // none
  [FlowNodeTypeEnum.systemConfig]: () => Promise.resolve(),
  [FlowNodeTypeEnum.emptyNode]: () => Promise.resolve()
};

/* running */
export async function dispatchWorkFlow({
  res,
  runtimeNodes = [],
  runtimeEdges = [],
  startParams = {},
  histories = [],
  variables = {},
  user,
  stream = false,
  detail = false,
  ...props
}: ChatDispatchProps & {
  runtimeNodes: RuntimeNodeItemType[];
  runtimeEdges: RuntimeEdgeItemType[];
  startParams?: Record<string, any>; // entry module params
}): Promise<DispatchFlowResponse> {
  // set sse response headers
  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
  }

  variables = {
    ...getSystemVariable({ timezone: user.timezone }),
    ...variables
  };
  const copyRuntimeNodes = runtimeNodes.map((item) => ({ ...item }));

  let chatResponses: ChatHistoryItemResType[] = []; // response request and save to database
  let chatAssistantResponse: AIChatItemValueItemType[] = []; // The value will be returned to the user
  let chatNodeUsages: ChatNodeUsageType[] = [];
  let toolRunResponse: ToolRunResponseItemType;
  let runningTime = Date.now();

  /* Store special response field  */
  function pushStore(
    { inputs = [] }: RuntimeNodeItemType,
    {
      answerText = '',
      responseData,
      nodeDispatchUsages,
      toolResponses,
      assistantResponses
    }: {
      [NodeOutputKeyEnum.answerText]?: string;
      [DispatchNodeResponseKeyEnum.nodeResponse]?: ChatHistoryItemResType;
      [DispatchNodeResponseKeyEnum.nodeDispatchUsages]?: ChatNodeUsageType[];
      [DispatchNodeResponseKeyEnum.toolResponses]?: ToolRunResponseItemType;
      [DispatchNodeResponseKeyEnum.assistantResponses]?: AIChatItemValueItemType[]; // tool module, save the response value
    }
  ) {
    const time = Date.now();

    if (responseData) {
      chatResponses.push({
        ...responseData,
        runningTime: +((time - runningTime) / 1000).toFixed(2)
      });
    }
    if (nodeDispatchUsages) {
      chatNodeUsages = chatNodeUsages.concat(nodeDispatchUsages);
      props.maxRunTimes -= nodeDispatchUsages.length;
    }
    if (toolResponses !== undefined) {
      if (Array.isArray(toolResponses) && toolResponses.length === 0) return;
      if (typeof toolResponses === 'object' && Object.keys(toolResponses).length === 0) {
        return;
      }
      toolRunResponse = toolResponses;
    }
    if (assistantResponses) {
      chatAssistantResponse = chatAssistantResponse.concat(assistantResponses);
    }

    // save assistant text response
    if (answerText) {
      const isResponseAnswerText =
        inputs.find((item) => item.key === NodeInputKeyEnum.aiChatIsResponseText)?.value ?? true;
      if (isResponseAnswerText) {
        chatAssistantResponse.push({
          type: ChatItemValueTypeEnum.text,
          text: {
            content: answerText
          }
        });
      }
    }

    runningTime = time;
  }
  /* Pass the output of the module to the next stage */
  function nodeOutput(node: RuntimeNodeItemType, result: Record<string, any> = {}): Promise<any> {
    pushStore(node, result);

    // Assign the output value to the next node
    node.outputs.forEach((outputItem) => {
      if (result[outputItem.key] === undefined) return;
      /* update output value */
      outputItem.value = result[outputItem.key];
    });

    // Get next source edges and update status
    const skipHandleId = (result[DispatchNodeResponseKeyEnum.skipHandleId] || []) as string[];
    const targetEdges = runtimeEdges.filter((item) => item.source === node.nodeId);
    // update edge status
    targetEdges.forEach((edge) => {
      if (skipHandleId.includes(edge.sourceHandle)) {
        edge.status = 'skipped';
      } else {
        edge.status = 'running';
      }
    });

    return checkNodeCanRun(
      copyRuntimeNodes.filter((node) => {
        return targetEdges.some((item) => item.target === node.nodeId);
      })
    );
  }
  function checkNodeCanRun(nodes: RuntimeNodeItemType[] = []) {
    /* 
      1. 获取所有该节点的输入线
      2. 输入线分类：普通线和递归线（可以追溯到自身）
      3. 没有输入线，执行（初始节点）
      4. 起始线全部非 waiting 执行
      5. 递归线全部非 waiting 执行
      6. 运行完后，清除连线的状态，避免污染进程
    */
    return Promise.all(
      nodes.map((node) => {
        const edges = runtimeEdges.filter((item) => item.target === node.nodeId);

        if (edges.length === 0) {
          return nodeRun(node);
        }

        const { commonEdges, recursiveEdges } = splitEdges({
          edges,
          allEdges: runtimeEdges,
          currentNode: node
        });

        if (commonEdges.some((item) => item.status === 'waiting')) return;
        if (recursiveEdges.some((item) => item.status === 'waiting')) return;
        return nodeRun(node);
      })
    );
  }
  /* Inject data into module input */
  function getNodeRunParams(node: RuntimeNodeItemType) {
    const params: Record<string, any> = {};
    node.inputs.forEach((input) => {
      // replace {{}} variables
      let value =
        input.valueType === WorkflowIOValueTypeEnum.string
          ? replaceVariable(input.value, variables)
          : input.value;

      // replace reference variables
      const inputRenderType = input.renderTypeList?.[input.selectedTypeIndex || 0];
      if (needReplaceReferenceInputTypeList.includes(inputRenderType)) {
        value = getReferenceVariableValue({
          value: input.value,
          nodes: runtimeNodes
        });
      }

      // dynamic input replace reference variables

      // format valueType
      params[input.key] = valueTypeFormat(value, input.valueType);
    });

    return params;
  }
  async function nodeRun(node: RuntimeNodeItemType): Promise<any> {
    if (res.closed || props.maxRunTimes <= 0) return Promise.resolve();

    // push run status messages
    if (stream && detail && node.showStatus) {
      responseStatus({
        res,
        name: node.name,
        status: 'running'
      });
    }

    // get node running params
    const params = getNodeRunParams(node);

    const dispatchData: ModuleDispatchProps<Record<string, any>> = {
      ...props,
      res,
      variables,
      histories,
      user,
      stream,
      detail,
      node,
      runtimeNodes,
      runtimeEdges,
      params
    };

    // run module
    const dispatchRes: Record<string, any> = await (async () => {
      if (callbackMap[node.flowNodeType]) {
        return callbackMap[node.flowNodeType](dispatchData);
      }
      return {};
    })();

    // format response data. Add modulename and module type
    const formatResponseData: ChatHistoryItemResType = (() => {
      if (!dispatchRes[DispatchNodeResponseKeyEnum.nodeResponse]) return undefined;
      return {
        moduleName: node.name,
        moduleType: node.flowNodeType,
        ...dispatchRes[DispatchNodeResponseKeyEnum.nodeResponse]
      };
    })();

    // Add output default value
    node.outputs.forEach((item) => {
      if (!item.required) return;
      if (dispatchRes[item.key] !== undefined) return;
      dispatchRes[item.key] = valueTypeFormat(item.defaultValue, item.valueType);
    });

    return nodeOutput(node, {
      ...dispatchRes,
      [DispatchNodeResponseKeyEnum.nodeResponse]: formatResponseData
    });
  }

  // start process width initInput
  const entryNodes = copyRuntimeNodes.filter((item) => item.isEntry);
  // reset entry
  copyRuntimeNodes.forEach((item) => {
    item.isEntry = false;
  });
  await checkNodeCanRun(entryNodes);

  // focus try to run pluginOutput
  const pluginOutputModule = copyRuntimeNodes.find(
    (item) => item.flowNodeType === FlowNodeTypeEnum.pluginOutput
  );
  if (pluginOutputModule) {
    await nodeRun(pluginOutputModule);
  }

  return {
    flowResponses: chatResponses,
    flowUsages: chatNodeUsages,
    [DispatchNodeResponseKeyEnum.assistantResponses]:
      concatAssistantResponseAnswerText(chatAssistantResponse),
    [DispatchNodeResponseKeyEnum.toolResponses]: toolRunResponse
  };
}

/* sse response modules staus */
export function responseStatus({
  res,
  status,
  name
}: {
  res: NextApiResponse;
  status?: 'running' | 'finish';
  name?: string;
}) {
  if (!name) return;
  responseWriteNodeStatus({
    res,
    name
  });
}

/* get system variable */
export function getSystemVariable({ timezone }: { timezone: string }) {
  return {
    cTime: getSystemTime(timezone)
  };
}

export const concatAssistantResponseAnswerText = (response: AIChatItemValueItemType[]) => {
  const result: AIChatItemValueItemType[] = [];
  // 合并连续的text
  for (let i = 0; i < response.length; i++) {
    const item = response[i];
    if (item.type === ChatItemValueTypeEnum.text) {
      let text = item.text?.content || '';
      const lastItem = result[result.length - 1];
      if (lastItem && lastItem.type === ChatItemValueTypeEnum.text && lastItem.text?.content) {
        lastItem.text.content += text;
        continue;
      }
    }
    result.push(item);
  }

  return result;
};
