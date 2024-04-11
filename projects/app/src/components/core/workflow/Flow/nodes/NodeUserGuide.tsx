import React, { useCallback, useMemo, useTransition } from 'react';
import { NodeProps } from 'reactflow';
import { Box, Flex, Textarea, useTheme } from '@chakra-ui/react';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { FlowNodeItemType, StoreNodeItemType } from '@fastgpt/global/core/workflow/type.d';
import { ModuleInputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import { welcomeTextTip } from '@fastgpt/global/core/workflow/template/tip';
import { onChangeNode } from '../FlowProvider';

import VariableEdit from '../../../app/VariableEdit';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@/components/MyTooltip';
import Container from '../components/Container';
import NodeCard from './render/NodeCard';
import type { VariableItemType } from '@fastgpt/global/core/app/type.d';
import QGSwitch from '@/components/core/app/QGSwitch';
import TTSSelect from '@/components/core/app/TTSSelect';
import WhisperConfig from '@/components/core/app/WhisperConfig';
import { splitGuideModule } from '@fastgpt/global/core/workflow/utils';
import { useTranslation } from 'next-i18next';
import { TTSTypeEnum } from '@/constants/app';

const NodeUserGuide = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const theme = useTheme();
  return (
    <>
      <NodeCard minW={'300px'} selected={selected} forbidMenu {...data}>
        <Container className="nodrag" borderTop={'2px solid'} borderTopColor={'myGray.200'}>
          <WelcomeText data={data} />
          <Box pt={4} pb={2}>
            <ChatStartVariable data={data} />
          </Box>
          <Box pt={3} borderTop={theme.borders.base}>
            <TTSGuide data={data} />
          </Box>
          <Box mt={3} pt={3} borderTop={theme.borders.base}>
            <WhisperGuide data={data} />
          </Box>
          <Box mt={3} pt={3} borderTop={theme.borders.base}>
            <QuestionGuide data={data} />
          </Box>
        </Container>
      </NodeCard>
    </>
  );
};

export default React.memo(NodeUserGuide);

function WelcomeText({ data }: { data: FlowNodeItemType }) {
  const { t } = useTranslation();
  const { inputs, nodeId } = data;
  const [, startTst] = useTransition();

  const welcomeText = inputs.find((item) => item.key === ModuleInputKeyEnum.welcomeText);

  return (
    <>
      <Flex mb={1} alignItems={'center'}>
        <MyIcon name={'core/modules/welcomeText'} mr={2} w={'16px'} color={'#E74694'} />
        <Box>{t('core.app.Welcome Text')}</Box>
        <MyTooltip label={t(welcomeTextTip)} forceShow>
          <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
        </MyTooltip>
      </Flex>
      {welcomeText && (
        <Textarea
          className="nodrag"
          rows={6}
          resize={'both'}
          defaultValue={welcomeText.value}
          bg={'myWhite.500'}
          placeholder={t(welcomeTextTip)}
          onChange={(e) => {
            startTst(() => {
              onChangeNode({
                nodeId,
                key: ModuleInputKeyEnum.welcomeText,
                type: 'updateInput',
                value: {
                  ...welcomeText,
                  value: e.target.value
                }
              });
            });
          }}
        />
      )}
    </>
  );
}

function ChatStartVariable({ data }: { data: FlowNodeItemType }) {
  const { inputs, nodeId } = data;

  const variables = useMemo(
    () =>
      (inputs.find((item) => item.key === ModuleInputKeyEnum.variables)
        ?.value as VariableItemType[]) || [],
    [inputs]
  );

  const updateVariables = useCallback(
    (value: VariableItemType[]) => {
      onChangeNode({
        nodeId,
        key: ModuleInputKeyEnum.variables,
        type: 'updateInput',
        value: {
          ...inputs.find((item) => item.key === ModuleInputKeyEnum.variables),
          value
        }
      });
    },
    [inputs, nodeId]
  );

  return <VariableEdit variables={variables} onChange={(e) => updateVariables(e)} />;
}

function QuestionGuide({ data }: { data: FlowNodeItemType }) {
  const { inputs, nodeId } = data;

  const questionGuide = useMemo(
    () =>
      (inputs.find((item) => item.key === ModuleInputKeyEnum.questionGuide)?.value as boolean) ||
      false,
    [inputs]
  );

  return (
    <QGSwitch
      isChecked={questionGuide}
      size={'lg'}
      onChange={(e) => {
        const value = e.target.checked;
        onChangeNode({
          nodeId,
          key: ModuleInputKeyEnum.questionGuide,
          type: 'updateInput',
          value: {
            ...inputs.find((item) => item.key === ModuleInputKeyEnum.questionGuide),
            value
          }
        });
      }}
    />
  );
}

function TTSGuide({ data }: { data: FlowNodeItemType }) {
  const { inputs, nodeId } = data;
  const { ttsConfig } = splitGuideModule({ inputs } as StoreNodeItemType);

  return (
    <TTSSelect
      value={ttsConfig}
      onChange={(e) => {
        onChangeNode({
          nodeId,
          key: ModuleInputKeyEnum.tts,
          type: 'updateInput',
          value: {
            ...inputs.find((item) => item.key === ModuleInputKeyEnum.tts),
            value: e
          }
        });
      }}
    />
  );
}

function WhisperGuide({ data }: { data: FlowNodeItemType }) {
  const { inputs, nodeId } = data;
  const { ttsConfig, whisperConfig } = splitGuideModule({ inputs } as StoreNodeItemType);

  return (
    <WhisperConfig
      isOpenAudio={ttsConfig.type !== TTSTypeEnum.none}
      value={whisperConfig}
      onChange={(e) => {
        onChangeNode({
          nodeId,
          key: ModuleInputKeyEnum.whisper,
          type: 'updateInput',
          value: {
            ...inputs.find((item) => item.key === ModuleInputKeyEnum.whisper),
            value: e
          }
        });
      }}
    />
  );
}
