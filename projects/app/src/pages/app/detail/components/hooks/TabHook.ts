import { useRouter } from 'next/router';
import { useCallback } from 'react';

export enum TabEnum {
  edit = 'edit',
  publish = 'publish',
  logs = 'logs'
}

export const useTabHook = () => {
  const router = useRouter();
  const { currentTab = TabEnum.edit } = router.query as { currentTab: TabEnum };

  const setCurrentTab = useCallback(
    (tab: TabEnum) => {
      router.push({
        query: {
          ...router.query,
          currentTab: tab
        }
      });
    },
    [router]
  );

  return {
    currentTab,
    setCurrentTab
  };
};
