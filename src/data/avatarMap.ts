import type { PersonaReportData } from '../engine/report'

const avatarPath = (fileName: string) => `/images/avatars/${fileName}.png`

const defaultAvatar = avatarPath('default')

const avatarByKey: Partial<Record<string, string>> = {
  creator: avatarPath('creator'),
  creator_internal: avatarPath('creator_internal'),
  creator_armor: avatarPath('creator_armor'),
  creator_burst: avatarPath('creator_burst'),
  creator_review: avatarPath('creator_review'),
  observer: avatarPath('observer'),
  observer_internal: avatarPath('observer_internal'),
  observer_armor: avatarPath('observer_armor'),
  observer_burst: avatarPath('observer_burst'),
  observer_review: avatarPath('observer_review'),
  strategist: avatarPath('strategist'),
  strategist_internal: avatarPath('strategist_internal'),
  strategist_armor: avatarPath('strategist_armor'),
  strategist_burst: avatarPath('strategist_burst'),
  strategist_review: avatarPath('strategist_review'),
  pleaser: avatarPath('pleaser'),
  pleaser_internal: avatarPath('pleaser_internal'),
  pleaser_armor: avatarPath('pleaser_armor'),
  pleaser_burst: avatarPath('pleaser_burst'),
  pleaser_review: avatarPath('pleaser_review'),
  avenger: avatarPath('avenger'),
  avenger_internal: avatarPath('avenger_internal'),
  avenger_armor: avatarPath('avenger_armor'),
  avenger_burst: avatarPath('avenger_burst'),
  avenger_review: avatarPath('avenger_review'),
  avoider: avatarPath('avoider'),
  avoider_internal: avatarPath('avoider_internal'),
  avoider_armor: avatarPath('avoider_armor'),
  avoider_burst: avatarPath('avoider_burst'),
  avoider_review: avatarPath('avoider_review'),
  caregiver: avatarPath('caregiver'),
  caregiver_internal: avatarPath('caregiver_internal'),
  caregiver_armor: avatarPath('caregiver_armor'),
  caregiver_burst: avatarPath('caregiver_burst'),
  caregiver_review: avatarPath('caregiver_review'),
  judge: avatarPath('judge'),
  judge_internal: avatarPath('judge_internal'),
  judge_armor: avatarPath('judge_armor'),
  judge_burst: avatarPath('judge_burst'),
  judge_review: avatarPath('judge_review'),
}

export function getAvatarForReport(report: PersonaReportData) {
  return (
    avatarByKey[report.personaKey] ??
    avatarByKey[report.topPaths[0]?.key] ??
    defaultAvatar
  )
}

export function getDefaultAvatar() {
  return defaultAvatar
}
