import {
  type Node,
  type NodeChange,
  type Edge,
  type EdgeChange,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  OnConnectStartParams
} from 'reactflow';
import type {
  FlowNodeItemType,
  FlowNodeTemplateType
} from '@fastgpt/global/core/workflow/type/index.d';
import type { FlowNodeChangeProps } from '@fastgpt/global/core/workflow/type/fe.d';
import { FlowNodeInputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import React, {
  type SetStateAction,
  type Dispatch,
  useContext,
  useCallback,
  createContext,
  useRef,
  useMemo,
  useState
} from 'react';
import { customAlphabet } from 'nanoid';
import { storeEdgesRenderEdge, storeNode2FlowNode } from '@/web/core/workflow/utils';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { EDGE_TYPE, FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { NodeOutputKeyEnum, RuntimeEdgeStatusEnum } from '@fastgpt/global/core/workflow/constants';
import { useTranslation } from 'next-i18next';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import { RuntimeEdgeItemType, StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import { RuntimeNodeItemType } from '@fastgpt/global/core/workflow/runtime/type';
import { defaultRunningStatus, defaultSkippedStatus } from '../constants';
import { postWorkflowDebug } from '@/web/core/workflow/api';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { checkNodeRunStatus } from '@fastgpt/global/core/workflow/runtime/utils';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);

type OnChange<ChangesType> = (changes: ChangesType[]) => void;

export type useFlowProviderStoreType = {
  // connect
  connectingEdge: OnConnectStartParams | undefined;
  onConnectStart: (event: any, params: OnConnectStartParams) => void;
  onConnectEnd: (event: any) => void;
  // nodes
  basicNodeTemplates: FlowNodeTemplateType[];
  reactFlowWrapper: null | React.RefObject<HTMLDivElement>;
  mode: 'app' | 'plugin';
  filterAppIds: string[];
  nodes: Node<FlowNodeItemType, string | undefined>[];
  nodeList: FlowNodeItemType[];
  setNodes: Dispatch<SetStateAction<Node<FlowNodeItemType, string | undefined>[]>>;
  onNodesChange: OnChange<NodeChange>;
  // debug
  workflowDebugData:
    | {
        runtimeNodes: RuntimeNodeItemType[];
        runtimeEdges: RuntimeEdgeItemType[];
        nextRunNodes: RuntimeNodeItemType[];
      }
    | undefined;
  onNextNodeDebug: () => Promise<void>;
  onStartNodeDebug: ({
    entryNodeId,
    runtimeNodes,
    runtimeEdges
  }: {
    entryNodeId: string;
    runtimeNodes: RuntimeNodeItemType[];
    runtimeEdges: RuntimeEdgeItemType[];
  }) => Promise<void>;
  onStopNodeDebug: () => void;

  edges: Edge<any>[];
  setEdges: Dispatch<SetStateAction<Edge<any>[]>>;
  onEdgesChange: OnChange<EdgeChange>;
  onFixView: () => void;
  onDelNode: (nodeId: string) => void;
  onChangeNode: (e: FlowNodeChangeProps) => void;
  onCopyNode: (nodeId: string) => void;
  onResetNode: (e: { id: string; module: FlowNodeTemplateType }) => void;
  onDelEdge: (e: {
    nodeId: string;
    sourceHandle?: string | undefined;
    targetHandle?: string | undefined;
  }) => void;
  onDelConnect: (id: string) => void;
  onConnect: ({ connect }: { connect: Connection }) => any;
  initData: (e: { nodes: StoreNodeItemType[]; edges: StoreEdgeItemType[] }) => void;
  splitToolInputs: (
    inputs: FlowNodeInputItemType[],
    nodeId: string
  ) => {
    isTool: boolean;
    toolInputs: FlowNodeInputItemType[];
    commonInputs: FlowNodeInputItemType[];
  };
  hasToolNode: boolean;
  hoverNodeId: string | undefined;
  setHoverNodeId: React.Dispatch<React.SetStateAction<string | undefined>>;
  onUpdateNodeError: (node: string, isError: Boolean) => void;
};

const StateContext = createContext<useFlowProviderStoreType>({
  reactFlowWrapper: null,
  mode: 'app',
  filterAppIds: [],
  nodes: [],
  setNodes: function (
    value: React.SetStateAction<Node<FlowNodeItemType, string | undefined>[]>
  ): void {
    return;
  },
  onNodesChange: function (changes: NodeChange[]): void {
    return;
  },
  edges: [],
  setEdges: function (value: React.SetStateAction<Edge<any>[]>): void {
    return;
  },
  onEdgesChange: function (changes: EdgeChange[]): void {
    return;
  },
  onFixView: function (): void {
    return;
  },
  onDelNode: function (nodeId: string): void {
    return;
  },
  onChangeNode: function (e: FlowNodeChangeProps): void {
    return;
  },
  onCopyNode: function (nodeId: string): void {
    return;
  },
  onDelEdge: function (e: {
    nodeId: string;
    sourceHandle?: string | undefined;
    targetHandle?: string | undefined;
  }): void {
    return;
  },
  onDelConnect: function (id: string): void {
    return;
  },
  onConnect: function ({ connect }: { connect: Connection }) {
    return;
  },

  onResetNode: function (e): void {
    throw new Error('Function not implemented.');
  },
  splitToolInputs: function (
    inputs: FlowNodeInputItemType[],
    nodeId: string
  ): {
    isTool: boolean;
    toolInputs: FlowNodeInputItemType[];
    commonInputs: FlowNodeInputItemType[];
  } {
    throw new Error('Function not implemented.');
  },
  hasToolNode: false,
  onConnectStart: function (event: any, params: OnConnectStartParams): void {
    throw new Error('Function not implemented.');
  },
  onConnectEnd: function (event: any): void {
    throw new Error('Function not implemented.');
  },
  connectingEdge: undefined,
  basicNodeTemplates: [],
  initData: function (e: { nodes: StoreNodeItemType[]; edges: StoreEdgeItemType[] }): void {
    throw new Error('Function not implemented.');
  },
  hoverNodeId: undefined,
  setHoverNodeId: function (value: React.SetStateAction<string | undefined>): void {
    throw new Error('Function not implemented.');
  },
  onUpdateNodeError: function (nodeId: string, isError: Boolean): void {
    throw new Error('Function not implemented.');
  },
  nodeList: [],
  workflowDebugData: undefined,
  onNextNodeDebug: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  onStartNodeDebug: function ({
    entryNodeId,
    runtimeNodes,
    runtimeEdges
  }: {
    entryNodeId: string;
    runtimeNodes: RuntimeNodeItemType[];
    runtimeEdges: RuntimeEdgeItemType[];
  }): Promise<void> {
    throw new Error('Function not implemented.');
  },
  onStopNodeDebug: function (): void {
    throw new Error('Function not implemented.');
  }
});
export const useFlowProviderStore = () => useContext(StateContext);

export const FlowProvider = ({
  mode,
  basicNodeTemplates = [],
  filterAppIds = [],
  children,
  appId,
  pluginId
}: {
  mode: useFlowProviderStoreType['mode'];
  basicNodeTemplates: FlowNodeTemplateType[];
  filterAppIds?: string[];
  children: React.ReactNode;
  appId?: string;
  pluginId?: string;
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { toast } = useToast();
  const [nodes = [], setNodes, onNodesChange] = useNodesState<FlowNodeItemType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hoverNodeId, setHoverNodeId] = useState<string>();
  const [connectingEdge, setConnectingEdge] = useState<OnConnectStartParams>();

  const stringifyNodes = useMemo(() => JSON.stringify(nodes.map((node) => node.data)), [nodes]);
  const nodeList = useMemo(
    () => JSON.parse(stringifyNodes) as FlowNodeItemType[],
    [stringifyNodes]
  );

  const hasToolNode = useMemo(() => {
    return !!nodes.find((node) => node.data.flowNodeType === FlowNodeTypeEnum.tools);
  }, [nodes]);

  const onFixView = useCallback(() => {
    const btn = document.querySelector('.custom-workflow-fix_view') as HTMLButtonElement;

    setTimeout(() => {
      btn && btn.click();
    }, 100);
  }, []);

  const onDelEdge = useCallback(
    ({
      nodeId,
      sourceHandle,
      targetHandle
    }: {
      nodeId: string;
      sourceHandle?: string | undefined;
      targetHandle?: string | undefined;
    }) => {
      if (!sourceHandle && !targetHandle) return;
      setEdges((state) =>
        state.filter((edge) => {
          if (edge.source === nodeId && edge.sourceHandle === sourceHandle) return false;
          if (edge.target === nodeId && edge.targetHandle === targetHandle) return false;

          return true;
        })
      );
    },
    [setEdges]
  );

  // node
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === 'remove') {
          const node = nodes.find((n) => n.id === change.id);
          if (node && node.data.forbidDelete) {
            return toast({
              status: 'warning',
              title: t('core.workflow.Can not delete node')
            });
          }
        }
      }
      onNodesChange(changes);
    },
    [nodes, onNodesChange, t, toast]
  );
  const onDelNode = useCallback(
    (nodeId: string) => {
      setNodes((state) => state.filter((item) => item.id !== nodeId));
      setEdges((state) => state.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    },
    [setEdges, setNodes]
  );
  /* change */
  const onChangeNode = useCallback(
    (props: FlowNodeChangeProps) => {
      const { nodeId, type } = props;
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id !== nodeId) return node;

          const updateObj: Record<string, any> = {};

          if (type === 'attr') {
            if (props.key) {
              updateObj[props.key] = props.value;
            }
          } else if (type === 'updateInput') {
            updateObj.inputs = node.data.inputs.map((item) =>
              item.key === props.key ? props.value : item
            );
          } else if (type === 'replaceInput') {
            onDelEdge({ nodeId, targetHandle: props.key });
            const oldInputIndex = node.data.inputs.findIndex((item) => item.key === props.key);
            updateObj.inputs = node.data.inputs.filter((item) => item.key !== props.key);
            setTimeout(() => {
              onChangeNode({
                nodeId,
                type: 'addInput',
                index: oldInputIndex,
                value: props.value
              });
            });
          } else if (type === 'addInput') {
            const input = node.data.inputs.find((input) => input.key === props.value.key);
            if (input) {
              toast({
                status: 'warning',
                title: 'key 重复'
              });
              updateObj.inputs = node.data.inputs;
            } else {
              if (props.index !== undefined) {
                const inputs = [...node.data.inputs];
                inputs.splice(props.index, 0, props.value);
                updateObj.inputs = inputs;
              } else {
                updateObj.inputs = node.data.inputs.concat(props.value);
              }
            }
          } else if (type === 'delInput') {
            onDelEdge({ nodeId, targetHandle: props.key });
            updateObj.inputs = node.data.inputs.filter((item) => item.key !== props.key);
          } else if (type === 'updateOutput') {
            updateObj.outputs = node.data.outputs.map((item) =>
              item.key === props.key ? props.value : item
            );
          } else if (type === 'replaceOutput') {
            onDelEdge({ nodeId, sourceHandle: props.key });
            const oldOutputIndex = node.data.outputs.findIndex((item) => item.key === props.key);
            updateObj.outputs = node.data.outputs.filter((item) => item.key !== props.key);
            setTimeout(() => {
              onChangeNode({
                nodeId,
                type: 'addOutput',
                index: oldOutputIndex,
                value: props.value
              });
            });
          } else if (type === 'addOutput') {
            const output = node.data.outputs.find((output) => output.key === props.value.key);
            if (output) {
              toast({
                status: 'warning',
                title: 'key 重复'
              });
              updateObj.outputs = node.data.outputs;
            } else {
              if (props.index !== undefined) {
                const outputs = [...node.data.outputs];
                outputs.splice(props.index, 0, props.value);
                updateObj.outputs = outputs;
              } else {
                updateObj.outputs = node.data.outputs.concat(props.value);
              }
            }
          } else if (type === 'delOutput') {
            onDelEdge({ nodeId, sourceHandle: props.key });
            updateObj.outputs = node.data.outputs.filter((item) => item.key !== props.key);
          }

          return {
            ...node,
            data: {
              ...node.data,
              ...updateObj
            }
          };
        })
      );
    },
    [onDelEdge, setNodes, toast]
  );
  const onCopyNode = useCallback(
    (nodeId: string) => {
      setNodes((nodes) => {
        const node = nodes.find((node) => node.id === nodeId);
        if (!node) return nodes;
        const template = {
          avatar: node.data.avatar,
          name: node.data.name,
          intro: node.data.intro,
          flowNodeType: node.data.flowNodeType,
          inputs: node.data.inputs,
          outputs: node.data.outputs,
          showStatus: node.data.showStatus
        };
        return nodes.concat(
          storeNode2FlowNode({
            item: {
              name: template.name,
              intro: template.intro,
              nodeId: nanoid(),
              position: { x: node.position.x + 200, y: node.position.y + 50 },
              flowNodeType: template.flowNodeType,
              showStatus: template.showStatus,
              inputs: template.inputs,
              outputs: template.outputs
            }
          })
        );
      });
    },
    [setNodes]
  );
  const onUpdateNodeError = useCallback(
    (nodeId: string, isError: Boolean) => {
      setNodes((nodes) => {
        return nodes.map((item) => {
          if (item.data?.nodeId === nodeId) {
            //@ts-ignore
            item.data.isError = isError;
          }
          return item;
        });
      });
    },
    [setNodes]
  );

  /* Run workflow debug and get next runtime data */
  const [workflowDebugData, setWorkflowDebugData] = useState<{
    runtimeNodes: RuntimeNodeItemType[];
    runtimeEdges: RuntimeEdgeItemType[];
    nextRunNodes: RuntimeNodeItemType[];
  }>();
  const onNextNodeDebug = useCallback(
    async (debugData = workflowDebugData) => {
      if (!debugData) return;
      // 1. Cancel node selected status and debugResult.showStatus
      setNodes((state) =>
        state.map((node) => ({
          ...node,
          selected: false,
          data: {
            ...node.data,
            debugResult: node.data.debugResult
              ? {
                  ...node.data.debugResult,
                  showResult: false,
                  isExpired: true
                }
              : undefined
          }
        }))
      );

      // 2. Set isEntry field and get entryNodes
      const runtimeNodes = debugData.runtimeNodes.map((item) => ({
        ...item,
        isEntry: debugData.nextRunNodes.some((node) => node.nodeId === item.nodeId)
      }));
      const entryNodes = runtimeNodes.filter((item) => item.isEntry);

      const runtimeNodeStatus: Record<string, string> = entryNodes
        .map((node) => {
          const status = checkNodeRunStatus({
            node,
            runtimeEdges: debugData?.runtimeEdges || []
          });

          return {
            nodeId: node.nodeId,
            status
          };
        })
        .reduce(
          (acc, cur) => ({
            ...acc,
            [cur.nodeId]: cur.status
          }),
          {}
        );

      // 3. Set entry node status to running
      entryNodes.forEach((node) => {
        if (runtimeNodeStatus[node.nodeId] !== 'wait') {
          console.log(node.name);
          onChangeNode({
            nodeId: node.nodeId,
            type: 'attr',
            key: 'debugResult',
            value: defaultRunningStatus
          });
        }
      });

      try {
        // 4. Run one step
        const { finishedEdges, finishedNodes, nextStepRunNodes, flowResponses } =
          await postWorkflowDebug({
            nodes: runtimeNodes,
            edges: debugData.runtimeEdges,
            variables: {},
            appId,
            pluginId
          });
        // console.log({ finishedEdges, finishedNodes, nextStepRunNodes, flowResponses });
        // 5. Store debug result
        const newStoreDebugData = {
          runtimeNodes: finishedNodes,
          // edges need to save status
          runtimeEdges: finishedEdges.map((edge) => {
            const oldEdge = debugData.runtimeEdges.find(
              (item) => item.source === edge.source && item.target === edge.target
            );
            const status =
              oldEdge?.status && oldEdge.status !== RuntimeEdgeStatusEnum.waiting
                ? oldEdge.status
                : edge.status;
            return {
              ...edge,
              status
            };
          }),
          nextRunNodes: nextStepRunNodes
        };
        setWorkflowDebugData(newStoreDebugData);

        // 6. selected entry node and Update entry node debug result
        setNodes((state) =>
          state.map((node) => {
            const isEntryNode = entryNodes.some((item) => item.nodeId === node.data.nodeId);

            if (!isEntryNode || runtimeNodeStatus[node.data.nodeId] === 'wait') return node;

            const result = flowResponses.find((item) => item.nodeId === node.data.nodeId);

            if (runtimeNodeStatus[node.data.nodeId] === 'skip') {
              return {
                ...node,
                selected: isEntryNode,
                data: {
                  ...node.data,
                  debugResult: {
                    status: 'skipped',
                    showResult: true,
                    isExpired: false
                  }
                }
              };
            }
            return {
              ...node,
              selected: isEntryNode,
              data: {
                ...node.data,
                debugResult: {
                  status: 'success',
                  response: result,
                  showResult: true,
                  isExpired: false
                }
              }
            };
          })
        );

        // Check for an empty response
        if (flowResponses.length === 0 && nextStepRunNodes.length > 0) {
          onNextNodeDebug(newStoreDebugData);
        }
      } catch (error) {
        entryNodes.forEach((node) => {
          onChangeNode({
            nodeId: node.nodeId,
            type: 'attr',
            key: 'debugResult',
            value: {
              status: 'failed',
              message: getErrText(error, 'Debug failed'),
              showResult: true
            }
          });
        });
        console.log(error);
      }
    },
    [appId, onChangeNode, pluginId, setNodes, workflowDebugData]
  );
  const onStopNodeDebug = useCallback(() => {
    setWorkflowDebugData(undefined);
    setNodes((state) =>
      state.map((node) => ({
        ...node,
        selected: false,
        data: {
          ...node.data,
          debugResult: undefined
        }
      }))
    );
  }, [setNodes]);
  const onStartNodeDebug = useCallback(
    async ({
      entryNodeId,
      runtimeNodes,
      runtimeEdges
    }: {
      entryNodeId: string;
      runtimeNodes: RuntimeNodeItemType[];
      runtimeEdges: RuntimeEdgeItemType[];
    }) => {
      const data = {
        runtimeNodes,
        runtimeEdges,
        nextRunNodes: runtimeNodes.filter((node) => node.nodeId === entryNodeId)
      };
      onStopNodeDebug();
      setWorkflowDebugData(data);

      onNextNodeDebug(data);
    },
    [onNextNodeDebug, onStopNodeDebug]
  );

  // connect
  const onConnectStart = useCallback((event: any, params: OnConnectStartParams) => {
    setConnectingEdge(params);
  }, []);
  const onConnectEnd = useCallback(() => {
    setConnectingEdge(undefined);
  }, []);
  const onConnect = useCallback(
    ({ connect }: { connect: Connection }) => {
      setEdges((state) =>
        addEdge(
          {
            ...connect,
            type: EDGE_TYPE
          },
          state
        )
      );
    },
    [setEdges]
  );
  const onDelConnect = useCallback(
    (id: string) => {
      setEdges((state) => state.filter((item) => item.id !== id));
    },
    [setEdges]
  );

  /* If the module is connected by a tool, the tool input and the normal input are separated */
  const splitToolInputs = useCallback(
    (inputs: FlowNodeInputItemType[], nodeId: string) => {
      const isTool = !!edges.find(
        (edge) => edge.targetHandle === NodeOutputKeyEnum.selectedTools && edge.target === nodeId
      );

      return {
        isTool,
        toolInputs: inputs.filter((item) => isTool && item.toolDescription),
        commonInputs: inputs.filter((item) => {
          if (!isTool) return true;
          return !item.toolDescription;
        })
      };
    },
    [edges]
  );

  // reset a node data. delete edge and replace it
  const onResetNode = useCallback(
    ({ id, module }: { id: string; module: FlowNodeTemplateType }) => {
      setNodes((state) =>
        state.map((node) => {
          if (node.id === id) {
            // delete edge
            node.data.inputs.forEach((item) => {
              onDelEdge({ nodeId: id, targetHandle: item.key });
            });
            node.data.outputs.forEach((item) => {
              onDelEdge({ nodeId: id, sourceHandle: item.key });
            });
            return {
              ...node,
              data: {
                ...node.data,
                ...module
              }
            };
          }
          return node;
        })
      );
    },
    [onDelEdge, setNodes]
  );

  const initData = useCallback(
    (e: { nodes: StoreNodeItemType[]; edges: StoreEdgeItemType[] }) => {
      setNodes(e.nodes?.map((item) => storeNode2FlowNode({ item })));

      setEdges(e.edges?.map((item) => storeEdgesRenderEdge({ edge: item })));

      setTimeout(() => {
        onFixView();
      }, 1000);
    },
    [setEdges, setNodes, onFixView]
  );

  const value = {
    reactFlowWrapper,
    mode,
    filterAppIds,
    edges,
    setEdges,
    onEdgesChange,
    // nodes
    nodes,
    nodeList,
    setNodes,
    onDelNode,
    onNodesChange: handleNodesChange,
    hoverNodeId,
    setHoverNodeId,
    onCopyNode,
    onUpdateNodeError,
    workflowDebugData,
    onNextNodeDebug,
    onStartNodeDebug,
    onStopNodeDebug,

    basicNodeTemplates,
    // connect
    connectingEdge,
    onConnectStart,
    onConnectEnd,
    onFixView,
    onChangeNode,
    onResetNode,
    onDelEdge,
    onDelConnect,
    onConnect,
    initData,
    splitToolInputs,
    hasToolNode
  };

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
};

export default React.memo(FlowProvider);
