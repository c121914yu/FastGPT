import { TimerIdEnum } from './constants';
import { MongoTimerLock } from './schema';
import { addMinutes } from 'date-fns';

// 检查是否被定时器锁住
export const checkTimerLock = async ({
  timerId,
  lockMinuted
}: {
  timerId: `${TimerIdEnum}`;
  lockMinuted: number;
}) => {
  const timer = await MongoTimerLock.findOne({
    timerId
  });

  if (timer) return false;

  MongoTimerLock.create({
    timerId,
    expiredTime: addMinutes(new Date(), lockMinuted)
  });

  return true;
};
