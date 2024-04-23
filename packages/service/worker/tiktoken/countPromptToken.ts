/* Only the token of gpt-3.5-turbo is used */
import { Tiktoken } from 'js-tiktoken/lite';
import encodingJson from './cl100k_base.json';
import { ChatCompletionContentPart } from '@fastgpt/global/core/ai/type';
import { ChatCompletionRequestMessageRoleEnum } from '@fastgpt/global/core/ai/constants';
import { parentPort } from 'worker_threads';

/* count messages tokens */
parentPort?.on(
  'message',
  ({
    prompt = '',
    role = ''
  }: {
    prompt: string | ChatCompletionContentPart[] | null | undefined;
    role: '' | `${ChatCompletionRequestMessageRoleEnum}`;
  }) => {
    /* init tikToken obj */
    const enc = new Tiktoken(encodingJson);

    /* count one prompt tokens */
    const countPromptTokens = (
      prompt: string | ChatCompletionContentPart[] | null | undefined = '',
      role: '' | `${ChatCompletionRequestMessageRoleEnum}` = ''
    ) => {
      const promptText = (() => {
        if (!prompt) return '';
        if (typeof prompt === 'string') return prompt;
        let promptText = '';
        prompt.forEach((item) => {
          if (item.type === 'text') {
            promptText += item.text;
          } else if (item.type === 'image_url') {
            promptText += item.image_url.url;
          }
        });
        return promptText;
      })();

      const text = `${role}\n${promptText}`.trim();

      try {
        const encodeText = enc.encode(text);
        const supplementaryToken = role ? 4 : 0;
        return encodeText.length + supplementaryToken;
      } catch (error) {
        return text.length;
      }
    };

    const total = countPromptTokens(prompt, role);

    parentPort?.postMessage({
      type: 'success',
      data: total
    });

    if (global) {
      global.close();
    }
  }
);
