import { ModelTypeEnum, getModelMap } from '../../../core/ai/model';

export const formatModelChars2Points = ({
  model,
  charsLength = 0,
  modelType,
  multiple = 1000
}: {
  model: string;
  charsLength: number;
  modelType: `${ModelTypeEnum}`;
  multiple?: number;
}) => {
  const modelData = getModelMap?.[modelType]?.(model);
  if (!modelData) {
    return {
      totalPoints: 0,
      modelName: ''
    };
  }

  const totalPoints = (modelData.charsPointsPrice || 0) * (charsLength / multiple);

  return {
    modelName: modelData.name,
    totalPoints
  };
};
