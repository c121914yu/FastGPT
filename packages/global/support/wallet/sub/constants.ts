export enum SubTypeEnum {
  standard = 'standard',
  extraDatasetSize = 'extraDatasetSize',
  extraPoints = 'extraPoints'
}

export const subTypeMap = {
  [SubTypeEnum.standard]: {
    label: 'support.wallet.subscription.type.standard',
    icon: 'acount/plans'
  },
  [SubTypeEnum.extraDatasetSize]: {
    label: 'support.wallet.subscription.type.extraDatasetSize',
    icon: 'core/app/simpleMode/database'
  },
  [SubTypeEnum.extraPoints]: {
    label: 'support.wallet.subscription.type.extraPoints',
    icon: 'core/app/simpleMode/dataset'
  }
};

export enum SubStatusEnum {
  active = 'active',
  expired = 'expired'
}
export const subStatusMap = {
  [SubStatusEnum.active]: {
    label: 'support.wallet.subscription.status.active'
  },
  [SubStatusEnum.expired]: {
    label: 'support.wallet.subscription.status.canceled'
  }
};

export enum SubModeEnum {
  month = 'month',
  year = 'year'
}
export const subModeMap = {
  [SubModeEnum.month]: {
    label: 'support.wallet.subscription.mode.Month',
    durationMonth: 1
  },
  [SubModeEnum.year]: {
    label: 'support.wallet.subscription.mode.Year',
    durationMonth: 12
  }
};

export enum StandardSubLevelEnum {
  free = 'free',
  experience = 'experience',
  team = 'team',
  enterprise = 'enterprise',
  custom = 'custom'
}
export const standardSubLevelMap = {
  [StandardSubLevelEnum.free]: {
    label: 'support.wallet.subscription.standardSubLevel.free',
    desc: 'support.wallet.subscription.standardSubLevel.free desc'
  },
  [StandardSubLevelEnum.experience]: {
    label: 'support.wallet.subscription.standardSubLevel.experience',
    desc: ''
  },
  [StandardSubLevelEnum.team]: {
    label: 'support.wallet.subscription.standardSubLevel.team',
    desc: ''
  },
  [StandardSubLevelEnum.enterprise]: {
    label: 'support.wallet.subscription.standardSubLevel.enterprise',
    desc: ''
  },
  [StandardSubLevelEnum.custom]: {
    label: 'support.wallet.subscription.standardSubLevel.custom',
    desc: ''
  }
};
