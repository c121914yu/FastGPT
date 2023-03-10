import { GET, POST, DELETE, PUT } from './request';
import type { ModelType } from '@/types/model';
import { ModelUpdateParams } from '@/types/model';
import { TrainingItemType } from '../types/training';

export const getMyModels = () => GET<ModelType[]>('/model/list');

export const postCreateModel = (data: { name: string; serviceModelName: string }) =>
  POST<ModelType>('/model/create', data);

export const delModelById = (id: string) => DELETE(`/model/del?modelId=${id}`);

export const getModelById = (id: string) => GET<ModelType>(`/model/detail?modelId=${id}`);

export const putModelById = (id: string, data: ModelUpdateParams) =>
  PUT(`/model/update?modelId=${id}`, data);

export const postTrainModel = (id: string, form: FormData) =>
  POST(`/model/train?modelId=${id}`, form, {
    headers: {
      'content-type': 'multipart/form-data'
    }
  });

export const putModelTrainingStatus = (id: string) => PUT(`/model/putTrainStatus?modelId=${id}`);

export const getModelTrainings = (id: string) =>
  GET<TrainingItemType[]>(`/model/getTrainings?modelId=${id}`);
