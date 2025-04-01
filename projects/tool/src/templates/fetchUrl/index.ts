type Props = {
  url: string;
};
type Response = Promise<{
  result: any;
}>;

const main = async ({ url }: Props): Response => {
  try {
    // const result = await urlsFetch({
    //   urlList: [url],
    //   selector: 'body'
    // });

    // const title = result[0]?.title;
    // const content = result[0]?.content;

    return {
      result: 'test'
    };
  } catch (error) {
    return {
      result: 'Fetch error'
    };
  }
};

export default main;
