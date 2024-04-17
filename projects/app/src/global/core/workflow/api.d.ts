import { RuntimeNodeItemType } from '@fastgpt/global/core/workflow/runtime/type';
import { RuntimeEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';

export type PostWorkflowDebugProps = {
  nodes: RuntimeNodeItemType[];
  edges: RuntimeEdgeItemType[];
  variables: Record<string, any>;
  appId: string;
};
