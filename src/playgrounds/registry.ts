import type { ComponentType } from 'react'
import { ArticleReader } from './ArticleReader'
import { NotificationStack } from './NotificationStack'
import { Portfolio } from './Portfolio'
import { MembershipDashboard } from './MembershipDashboard'

export type Playground = {
  /** Also the URL hash: `#/article-reader`. Keep it kebab-case and stable. */
  id: string
  /** Shown in the bottom switcher — keep it short, the pill is narrow. */
  label: string
  Component: ComponentType
}

/**
 * Every page in the playground. Add an entry here and the bottom switcher picks
 * it up — nothing else to wire. Order is the order shown in the switcher.
 */
export const playgrounds: Playground[] = [
  { id: 'article-reader', label: 'Article Reader', Component: ArticleReader },
  { id: 'notification-stack', label: 'Notifications', Component: NotificationStack },
  { id: 'portfolio', label: 'Portfolio', Component: Portfolio },
  { id: 'membership-dashboard', label: 'Membership', Component: MembershipDashboard },
]

export const defaultPlaygroundId = playgrounds[0].id
