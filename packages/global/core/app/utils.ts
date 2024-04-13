import type { AppSimpleEditFormType } from '../app/type';
import { FlowNodeTypeEnum } from '../workflow/node/constant';
import {
  NodeOutputKeyEnum,
  NodeInputKeyEnum,
  FlowNodeTemplateTypeEnum
} from '../workflow/constants';
import type { FlowNodeInputItemType } from '../workflow/type/io.d';
import { getGuideModule, splitGuideModule } from '../workflow/utils';
import { StoreNodeItemType } from '../workflow/type';
import { DatasetSearchModeEnum } from '../dataset/constants';
import { defaultWhisperConfig } from './constants';

export const getDefaultAppForm = (): AppSimpleEditFormType => {
  return {
    aiSettings: {
      model: 'gpt-3.5-turbo',
      systemPrompt: '',
      temperature: 0,
      isResponseAnswerText: true,
      maxHistories: 6,
      maxToken: 4000
    },
    dataset: {
      datasets: [],
      similarity: 0.4,
      limit: 1500,
      searchMode: DatasetSearchModeEnum.embedding,
      usingReRank: false,
      datasetSearchUsingExtensionQuery: true,
      datasetSearchExtensionBg: ''
    },
    selectedTools: [],
    userGuide: {
      welcomeText: '',
      variables: [],
      questionGuide: false,
      tts: {
        type: 'web'
      },
      whisper: defaultWhisperConfig
    }
  };
};

/* format app modules to edit form */
export const appModules2Form = ({ modules }: { modules: StoreNodeItemType[] }) => {
  const defaultAppForm = getDefaultAppForm();

  const findInputValueByKey = (inputs: FlowNodeInputItemType[], key: string) => {
    return inputs.find((item) => item.key === key)?.value;
  };

  modules.forEach((module) => {
    if (
      module.flowNodeType === FlowNodeTypeEnum.chatNode ||
      module.flowNodeType === FlowNodeTypeEnum.tools
    ) {
      defaultAppForm.aiSettings.model = findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.aiModel
      );
      defaultAppForm.aiSettings.systemPrompt = findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.aiSystemPrompt
      );
      defaultAppForm.aiSettings.temperature = findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.aiChatTemperature
      );
      defaultAppForm.aiSettings.maxToken = findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.aiChatMaxToken
      );
      defaultAppForm.aiSettings.maxHistories = findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.history
      );
    } else if (module.flowNodeType === FlowNodeTypeEnum.datasetSearchNode) {
      defaultAppForm.dataset.datasets = findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.datasetSelectList
      );
      defaultAppForm.dataset.similarity = findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.datasetSimilarity
      );
      defaultAppForm.dataset.limit = findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.datasetMaxTokens
      );
      defaultAppForm.dataset.searchMode =
        findInputValueByKey(module.inputs, NodeInputKeyEnum.datasetSearchMode) ||
        DatasetSearchModeEnum.embedding;
      defaultAppForm.dataset.usingReRank = !!findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.datasetSearchUsingReRank
      );
      defaultAppForm.dataset.datasetSearchUsingExtensionQuery = findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.datasetSearchUsingExtensionQuery
      );
      defaultAppForm.dataset.datasetSearchExtensionModel = findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.datasetSearchExtensionModel
      );
      defaultAppForm.dataset.datasetSearchExtensionBg = findInputValueByKey(
        module.inputs,
        NodeInputKeyEnum.datasetSearchExtensionBg
      );
    } else if (module.flowNodeType === FlowNodeTypeEnum.userGuide) {
      const { welcomeText, variableModules, questionGuide, ttsConfig, whisperConfig } =
        splitGuideModule(getGuideModule(modules));

      defaultAppForm.userGuide = {
        welcomeText: welcomeText,
        variables: variableModules,
        questionGuide: questionGuide,
        tts: ttsConfig,
        whisper: whisperConfig
      };
    } else if (module.flowNodeType === FlowNodeTypeEnum.pluginModule) {
      defaultAppForm.selectedTools.push({
        id: module.inputs.find((input) => input.key === NodeInputKeyEnum.pluginId)?.value || '',
        name: module.name,
        avatar: module.avatar,
        intro: module.intro || '',
        flowNodeType: module.flowNodeType,
        showStatus: module.showStatus,
        inputs: module.inputs,
        outputs: module.outputs,
        templateType: FlowNodeTemplateTypeEnum.other
      });
    }
  });

  return defaultAppForm;
};
