import React, { useEffect, useMemo } from 'react';
import { AppSchema } from '@fastgpt/global/core/app/type.d';
import Header from './Header';
import Flow from '@/components/core/workflow/Flow';
import FlowProvider, { useFlowProviderStore } from '@/components/core/workflow/Flow/FlowProvider';
import { appSystemModuleTemplates } from '@fastgpt/global/core/workflow/template/constants';

type Props = { app: AppSchema; onClose: () => void };

const Render = ({ app, onClose }: Props) => {
  const { initData } = useFlowProviderStore();

  useEffect(() => {
    initData(
      JSON.parse(
        JSON.stringify({
          nodes: app.modules || [],
          edges: app.edges || []
        })
      )
    );
  }, [app.edges, app.modules]);

  const memoRender = useMemo(() => {
    return <Flow Header={<Header app={app} onClose={onClose} />} />;
  }, [app, onClose]);

  return memoRender;
};

export default React.memo(function FlowEdit(props: Props) {
  const filterAppIds = useMemo(() => [props.app._id], [props.app._id]);

  return (
    <FlowProvider
      mode={'app'}
      filterAppIds={filterAppIds}
      basicNodeTemplates={appSystemModuleTemplates}
    >
      <Render {...props} />
    </FlowProvider>
  );
});
