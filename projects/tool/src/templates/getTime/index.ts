import { formatTime2YMDHMS } from '@fastgpt/global/common/string/time';
type Props = {
  time?: string;
};
type Response = Promise<{
  time: string;
}>;

const main = async ({ time }: Props): Response => {
  return {
    time: time ?? formatTime2YMDHMS(new Date())
  };
};

export default main;
