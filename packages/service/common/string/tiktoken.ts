import {
  ChatCompletionContentPart,
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
  ChatCompletionTool
} from '@fastgpt/global/core/ai/type';
import { chats2GPTMessages } from '@fastgpt/global/core/chat/adapt';
import { ChatItemType } from '@fastgpt/global/core/chat/type';
import { WorkerNameEnum, runWorker } from '../../worker/utils';
import { ChatCompletionRequestMessageRoleEnum } from '@fastgpt/global/core/ai/constants';

/* count one prompt tokens */
export const countPromptTokens = async (
  prompt: string | ChatCompletionContentPart[] | null | undefined = '',
  role: '' | `${ChatCompletionRequestMessageRoleEnum}` = ''
) => {
  try {
    const total = await runWorker<number>(WorkerNameEnum.countPromptToken, {
      prompt,
      role
    });

    return total;
  } catch (error) {
    return 0;
  }
};

export const countMessagesTokens = (messages: ChatItemType[]) => {
  const adaptMessages = chats2GPTMessages({ messages, reserveId: true });

  return countGptMessagesTokens(adaptMessages);
};

export const countGptMessagesTokens = async (
  messages: ChatCompletionMessageParam[],
  tools?: ChatCompletionTool[],
  functionCall?: ChatCompletionCreateParams.Function[]
) => {
  try {
    const total = await runWorker<number>(WorkerNameEnum.countGptMessagesTokens, {
      messages,
      tools,
      functionCall
    });

    return total;
  } catch (error) {
    return 0;
  }
};
