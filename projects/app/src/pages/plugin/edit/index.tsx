import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Flow from '@/components/core/workflow/Flow';
import FlowProvider, { useFlowProviderStore } from '@/components/core/workflow/Flow/FlowProvider';
import { pluginSystemModuleTemplates } from '@fastgpt/global/core/workflow/template/constants';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useQuery } from '@tanstack/react-query';
import { getOnePlugin } from '@/web/core/plugin/api';
import { useToast } from '@fastgpt/web/hooks/useToast';
import Loading from '@fastgpt/web/components/common/MyLoading';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useTranslation } from 'next-i18next';

type Props = { pluginId: string };

const Render = ({ pluginId }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const { initData } = useFlowProviderStore();

  const { data: pluginDetail } = useQuery(
    ['getOnePlugin', pluginId],
    () => getOnePlugin(pluginId),
    {
      onError: (error) => {
        toast({
          status: 'warning',
          title: getErrText(error, t('plugin.Load Plugin Failed'))
        });
        router.replace('/plugin/list');
      }
    }
  );
  console.log(pluginDetail);
  useEffect(() => {
    initData(
      JSON.parse(
        JSON.stringify({
          nodes: pluginDetail?.modules || [],
          edges: pluginDetail?.edges || []
        })
      )
    );
  }, [pluginDetail?.edges, pluginDetail?.modules]);

  return pluginDetail ? (
    <Flow Header={<Header plugin={pluginDetail} onClose={() => router.back()} />} />
  ) : (
    <Loading />
  );
};

export default function FlowEdit(props: any) {
  return (
    <FlowProvider mode={'plugin'} basicNodeTemplates={pluginSystemModuleTemplates}>
      <Render {...props} />
    </FlowProvider>
  );
}

export async function getServerSideProps(context: any) {
  return {
    props: {
      pluginId: context?.query?.pluginId || '',
      ...(await serviceSideProps(context))
    }
  };
}
