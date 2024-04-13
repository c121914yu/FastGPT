import React, { useMemo } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { Handle, Position } from 'reactflow';
import { FlowValueTypeMap } from '@/web/core/workflow/constants/dataType';
import MyTooltip from '@/components/MyTooltip';
import { useTranslation } from 'next-i18next';
import { WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import { SmallAddIcon } from '@chakra-ui/icons';
import { sourceCommonStyle, sourceConnectedStyle } from '@/web/core/workflow/constants/handleStyle';

type Props = {
  handleId: string;
  transform?: string;
};

const SourceHandle = ({ handleId, transform }: Props) => {
  const { t } = useTranslation();

  return (
    <Handle
      style={{
        ...sourceCommonStyle,
        ...sourceConnectedStyle,
        transform
      }}
      type="source"
      id={handleId}
      position={Position.Right}
    ></Handle>
  );
};

export default React.memo(SourceHandle);
