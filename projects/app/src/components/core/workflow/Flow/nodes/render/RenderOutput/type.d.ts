import { FlowNodeOutputItemType } from '@fastgpt/global/core/workflow/node/type';

export type RenderOutputProps = {
  outputs?: FlowNodeOutputItemType[];
  item: FlowNodeOutputItemType;
  moduleId: string;
};
