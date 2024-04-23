import { DispatchNodeResponseKeyEnum } from '@fastgpt/global/core/workflow/runtime/constants';
import { RuntimeNodeItemType } from '@fastgpt/global/core/workflow/runtime/type';
import { VariableConditionEnum } from '@fastgpt/global/core/workflow/template/system/ifElse/constant';
import {
  IfElseConditionType,
  IfElseListItemType
} from '@fastgpt/global/core/workflow/template/system/ifElse/type';
import { getHandleId } from '@fastgpt/global/core/workflow/utils';

type Props = {
  params: {
    condition: IfElseConditionType;
    ifElseList: IfElseListItemType[];
    agents: any[];
  };
  runtimeNodes: RuntimeNodeItemType[];
  node: { nodeId: string };
};

function checkCondition(condition: VariableConditionEnum, variableValue: any, value: string) {
  const operations = {
    [VariableConditionEnum.isEmpty]: () => !variableValue,
    [VariableConditionEnum.isNotEmpty]: () => !!variableValue,
    [VariableConditionEnum.equalTo]: () => variableValue === value,
    [VariableConditionEnum.notEqual]: () => variableValue !== value,
    [VariableConditionEnum.greaterThan]: () => variableValue > Number(value),
    [VariableConditionEnum.lessThan]: () => variableValue < Number(value),
    [VariableConditionEnum.greaterThanOrEqualTo]: () => variableValue >= Number(value),
    [VariableConditionEnum.lessThanOrEqualTo]: () => variableValue <= Number(value),
    [VariableConditionEnum.include]: () => variableValue.includes(value),
    [VariableConditionEnum.notInclude]: () => !variableValue.includes(value),
    [VariableConditionEnum.startWith]: () => variableValue.startsWith(value),
    [VariableConditionEnum.endWith]: () => variableValue.endsWith(value),
    [VariableConditionEnum.lengthEqualTo]: () => variableValue.length === Number(value),
    [VariableConditionEnum.lengthNotEqualTo]: () => variableValue.length !== Number(value),
    [VariableConditionEnum.lengthGreaterThan]: () => variableValue.length > Number(value),
    [VariableConditionEnum.lengthGreaterThanOrEqualTo]: () => variableValue.length >= Number(value),
    [VariableConditionEnum.lengthLessThan]: () => variableValue.length < Number(value),
    [VariableConditionEnum.lengthLessThanOrEqualTo]: () => variableValue.length <= Number(value)
  };

  return (operations[condition] || (() => false))();
}

export const dispatchIfElse = async (props: Props): Promise<any> => {
  const {
    params,
    runtimeNodes,
    node: { nodeId }
  } = props;
  const { condition, ifElseList, agents } = params;
  const listResult = ifElseList.map((item) => {
    const { variable, condition: variableCondition, value } = item;

    const node = runtimeNodes.find((node) => node.nodeId === variable[0]);
    if (!node) return false;
    const output = node.outputs.find((item) => item.id === variable[1]);
    if (!output) return false;

    const variableValue = output.value;

    return checkCondition(variableCondition as VariableConditionEnum, variableValue, value || '');
  });

  let result: boolean;

  if (condition === 'And') {
    result = listResult.every(Boolean);
  } else {
    result = listResult.some(Boolean);
  }

  return {
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      totalPoints: 0,
      ifElseResult: result ? 'IF' : 'ELSE'
    },
    [DispatchNodeResponseKeyEnum.skipHandleId]: !result
      ? agents
          .filter((item: any) => item.value === 'IF')
          .map((item: any) => getHandleId(nodeId, 'source', item.key))
      : agents
          .filter((item: any) => item.value === 'ELSE')
          .map((item: any) => getHandleId(nodeId, 'source', item.key))
  };
};
