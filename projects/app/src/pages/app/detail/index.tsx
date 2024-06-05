import React from 'react';
import dynamic from 'next/dynamic';
import PageContainer from '@/components/PageContainer';
import { serviceSideProps } from '@/web/common/utils/i18n';
import Head from 'next/head';
import { AppContext, AppContextProvider } from '@/web/core/app/context/appContext';
import { useContextSelector } from 'use-context-selector';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';

const FormEdit = dynamic(() => import('./components/FormEdit'), {});
const FlowEdit = dynamic(() => import('./components/FlowEdit'), {});

const AppDetail = () => {
  const { appDetail, loadingApp } = useContextSelector(AppContext, (e) => e);

  return (
    <>
      <Head>
        <title>{appDetail.name}</title>
      </Head>
      <PageContainer isLoading={loadingApp}>
        {!loadingApp && (
          <>
            {appDetail.type === AppTypeEnum.simple && <FormEdit />}
            {appDetail.type === AppTypeEnum.workflow && <FlowEdit />}
          </>
        )}
      </PageContainer>
    </>
  );
};

const Provider = ({ appId }: { appId: string }) => {
  return (
    <AppContextProvider appId={appId}>
      <AppDetail />
    </AppContextProvider>
  );
};

export async function getServerSideProps(context: any) {
  const appId = context?.query?.appId || '';

  return {
    props: {
      appId,
      ...(await serviceSideProps(context, ['app', 'chat', 'file', 'publish', 'workflow']))
    }
  };
}

export default Provider;
