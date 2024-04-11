import { FlowNodeInputItemType } from '@fastgpt/global/core/workflow/node/type';

export type RenderInputProps = {
  inputs?: FlowNodeInputItemType[];
  item: FlowNodeInputItemType;
  nodeId: string;
};
