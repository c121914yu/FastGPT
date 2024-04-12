export enum FlowNodeInputTypeEnum { // render ui
  reference = 'reference', // reference to other node output
  input = 'input', // one line input
  numberInput = 'numberInput',
  select = 'select',
  slider = 'slider',
  switch = 'switch', // true/false

  // editor
  textarea = 'textarea',
  JSONEditor = 'JSONEditor',

  addInputParam = 'addInputParam', // params input

  // special input
  selectApp = 'selectApp',

  // ai model select
  selectLLMModel = 'selectLLMModel',
  settingLLMModel = 'settingLLMModel',

  // dataset special input
  selectDataset = 'selectDataset',
  selectDatasetParamsModal = 'selectDatasetParamsModal',
  settingDatasetQuotePrompt = 'settingDatasetQuotePrompt',

  hidden = 'hidden',
  custom = 'custom'
}

export enum FlowNodeOutputTypeEnum {
  answer = 'answer',
  source = 'source',
  hidden = 'hidden',

  addOutputParam = 'addOutputParam'
}

export enum FlowNodeTypeEnum {
  emptyNode = 'emptyNode',
  systemConfig = 'userGuide',
  workflowStart = 'workflowStart',
  historyNode = 'historyNode',
  chatNode = 'chatNode',

  datasetSearchNode = 'datasetSearchNode',
  datasetConcatNode = 'datasetConcatNode',

  answerNode = 'answerNode',
  classifyQuestion = 'classifyQuestion',
  contentExtract = 'contentExtract',
  httpRequest468 = 'httpRequest468',
  runApp = 'app',
  pluginModule = 'pluginModule',
  pluginInput = 'pluginInput',
  pluginOutput = 'pluginOutput',
  queryExtension = 'cfr',
  tools = 'tools',
  stopTool = 'stopTool',
  lafModule = 'lafModule',

  // abandon
  httpRequest = 'httpRequest'
}

export const EDGE_TYPE = 'default';
