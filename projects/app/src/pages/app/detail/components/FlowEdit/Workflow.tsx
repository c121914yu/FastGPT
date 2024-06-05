import React, { useMemo } from 'react';
import { appSystemModuleTemplates } from '@fastgpt/global/core/workflow/template/constants';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { v1Workflow2V2 } from '@/web/core/workflow/adapt';
import WorkflowContextProvider, { WorkflowContext } from '@/components/core/workflow/context';
import { useContextSelector } from 'use-context-selector';
import { AppContext } from '@/web/core/app/context/appContext';
import { useMount } from 'ahooks';
import { Box } from '@chakra-ui/react';

import Flow from '@/components/core/workflow/Flow';

const Workflow = () => {
  const appDetail = useContextSelector(AppContext, (e) => e.appDetail);

  const isV2Workflow = appDetail?.version === 'v2';
  const { openConfirm, ConfirmModal } = useConfirm({
    showCancel: false,
    content:
      '检测到您的高级编排为旧版，系统将为您自动格式化成新版工作流。\n\n由于版本差异较大，会导致一些工作流无法正常排布，请重新手动连接工作流。如仍异常，可尝试删除对应节点后重新添加。\n\n你可以直接点击调试进行工作流测试，调试完毕后点击发布。直到你点击发布，新工作流才会真正保存生效。\n\n在你发布新工作流前，自动保存不会生效。'
  });

  const initData = useContextSelector(WorkflowContext, (v) => v.initData);

  useMount(() => {
    if (!isV2Workflow) {
      openConfirm(() => {
        initData(JSON.parse(JSON.stringify(v1Workflow2V2((appDetail.modules || []) as any))));
      })();
    } else {
      initData({
        nodes: appDetail.modules || [],
        edges: appDetail.edges || []
      });
    }
  });

  return (
    <Box h={'100%'} bg={'myGray.50'}>
      <Flow />

      {!isV2Workflow && <ConfirmModal countDown={0} />}
    </Box>
  );
};

export default React.memo(Workflow);
