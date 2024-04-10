import { ChatCompletionMessageParam } from '@fastgpt/global/core/ai/type';
import { ModuleInputKeyEnum, ModuleOutputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import { FlowNodeInputItemType } from '@fastgpt/global/core/workflow/node/type';
import type {
  ModuleDispatchProps,
  DispatchNodeResponseType
} from '@fastgpt/global/core/workflow/type.d';
import type { RunningModuleItemType } from '@fastgpt/global/core/workflow/runtime/type';
import { ChatNodeUsageType } from '@fastgpt/global/support/wallet/bill/type';
import type { DispatchFlowResponse } from '../../type.d';
import { AIChatItemValueItemType, ChatItemValueItemType } from '@fastgpt/global/core/chat/type';

export type DispatchToolModuleProps = ModuleDispatchProps<{
  [ModuleInputKeyEnum.history]?: ChatItemType[];
  [ModuleInputKeyEnum.aiModel]: string;
  [ModuleInputKeyEnum.aiSystemPrompt]: string;
  [ModuleInputKeyEnum.userChatInput]: string;
}>;

export type RunToolResponse = {
  dispatchFlowResponse: DispatchFlowResponse[];
  totalTokens: number;
  completeMessages?: ChatCompletionMessageParam[];
  assistantResponses?: AIChatItemValueItemType[];
};
export type ToolModuleItemType = RunningModuleItemType & {
  toolParams: RunningModuleItemType['inputs'];
};
