import { DispatchNodeResponseKeyEnum } from '@fastgpt/global/core/workflow/runtime/constants';
import { getHandleId } from '@fastgpt/global/core/workflow/utils';

interface Group {
  input?: string;
  select?: string;
  value?: string;
}

type Props = { params: { condition: string } & any; node: { nodeId: string } };

export const dispatchIfElse = async (props: Props): Promise<any> => {
  const {
    params,
    node: { nodeId }
  } = props;
  const { condition, userChatInput, agents } = params;
  const groups: Group[] = [];
  Object.keys(params).forEach((key) => {
    if (key !== 'condition') {
      const match = key.match(/(input|select|value)(\d+)/);
      if (match) {
        const [, type, index] = match;
        const groupIndex = parseInt(index, 10) - 1;
        groups[groupIndex] = groups[groupIndex] || {};
        groups[groupIndex][type as keyof Group] = params[key];
      }
    }
  });

  const compare = (group: Group): boolean => {
    if (!group.input || !group.select || !group.value) return false;
    switch (group.select) {
      case 'equalTo':
        return group.input === group.value;
      case 'notEqualTo':
        return group.input !== group.value;
      case 'greaterThan':
        return group.input > group.value;
      case 'lessThan':
        return group.input < group.value;
      case 'greaterThanOrEqualTo':
        return group.input >= group.value;
      case 'lessThanOrEqualTo':
        return group.input <= group.value;
      default:
        throw new Error(`Unsupported select type: ${group.select}`);
    }
  };

  const result = condition === 'OR' ? groups.some(compare) : groups.every(compare);

  return {
    [DispatchNodeResponseKeyEnum.nodeResponse]: {
      query: userChatInput,
      totalPoints: 0,
      cqResult: result ? 'IF' : 'ELSE'
    },
    [DispatchNodeResponseKeyEnum.skipHandleId]: result
      ? agents
          .filter((item: any) => item.value === 'IF')
          .map((item: any) => getHandleId(nodeId, 'source', item.key))
      : agents
          .filter((item: any) => item.value === 'ELSE')
          .map((item: any) => getHandleId(nodeId, 'source', item.key))
  };
};
