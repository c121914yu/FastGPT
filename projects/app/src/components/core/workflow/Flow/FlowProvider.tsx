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
import type { FlowNodeChangeProps } from '@fastgpt/global/core/workflow/node/type';
import { FlowNodeInputItemType } from '@fastgpt/global/core/workflow/type/io.d';
import React, {
  type SetStateAction,
  type Dispatch,
  useContext,
  useCallback,
  createContext,
  useRef,
  useEffect,
  useMemo
} from 'react';
import { customAlphabet } from 'nanoid';
import { appModule2FlowEdge, storeNode2FlowNode } from '@/web/core/workflow/adapt';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { EDGE_TYPE, FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { ModuleOutputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import { useTranslation } from 'next-i18next';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import { EventNameEnum, eventBus } from '@/web/common/utils/eventbus';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);

type OnChange<ChangesType> = (changes: ChangesType[]) => void;
type requestEventType =
  | 'onChangeNode'
  | 'onCopyNode'
  | 'onResetNode'
  | 'onDelNode'
  | 'onDelConnect'
  | 'setNodes';

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
  setNodes: Dispatch<SetStateAction<Node<FlowNodeItemType, string | undefined>[]>>;
  onNodesChange: OnChange<NodeChange>;
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
  initData: (modules: StoreNodeItemType[]) => void;
  splitToolInputs: (
    inputs: FlowNodeInputItemType[],
    nodeId: string
  ) => {
    isTool: boolean;
    toolInputs: FlowNodeInputItemType[];
    commonInputs: FlowNodeInputItemType[];
  };
  hasToolNode: boolean;
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
  initData: function (modules: StoreNodeItemType[]): void {
    throw new Error('Function not implemented.');
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
  basicNodeTemplates: []
});
export const useFlowProviderStore = () => useContext(StateContext);

export const FlowProvider = ({
  mode,
  basicNodeTemplates = [],
  filterAppIds = [],
  children
}: {
  mode: useFlowProviderStoreType['mode'];
  basicNodeTemplates: FlowNodeTemplateType[];
  filterAppIds?: string[];
  children: React.ReactNode;
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { toast } = useToast();
  const [nodes = [], setNodes, onNodesChange] = useNodesState<FlowNodeItemType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [connectingEdge, setConnectingEdge] = React.useState<OnConnectStartParams>();

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
          console.log(node?.data, '======');
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
              sourceNodes: [],
              targetNodes: [],
              inputs: template.inputs,
              outputs: template.outputs
            }
          })
        );
      });
    },
    [setNodes]
  );

  /* If the module is connected by a tool, the tool input and the normal input are separated */
  const splitToolInputs = useCallback(
    (inputs: FlowNodeInputItemType[], nodeId: string) => {
      const isTool = !!edges.find(
        (edge) => edge.targetHandle === ModuleOutputKeyEnum.selectedTools && edge.target === nodeId
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
    (nodes: StoreNodeItemType[]) => {
      const edges = appModule2FlowEdge({
        nodes
      });
      setEdges(edges);

      setNodes(nodes.map((item) => storeNode2FlowNode({ item })));

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
    setNodes,
    onNodesChange: handleNodesChange,
    basicNodeTemplates,
    // connect
    connectingEdge,
    onConnectStart,
    onConnectEnd,
    onFixView,
    onDelNode,
    onChangeNode,
    onResetNode,
    onCopyNode,
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