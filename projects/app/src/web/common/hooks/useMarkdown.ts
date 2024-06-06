import { connectBaseUrl } from '@fastgpt/web/common/system/utils';
import { useQuery } from '@tanstack/react-query';

export const getMd = async (url: string) => {
  const response = await fetch(connectBaseUrl(`/docs/${url}`));
  const textContent = await response.text();
  return textContent;
};

export const useMarkdown = ({ url }: { url: string }) => {
  const { data = '' } = useQuery([url], () => getMd(url));

  return {
    data
  };
};
