/**
 * Everything the Chat View sidebar lists — Figma node 308:454, "Conversation
 * Web". Kept out of the playground for the same reason `members.ts` is: the
 * component is layout, this is content, and the icon imports belong next to the
 * rows that name them.
 */

import iconChatBadge from '../assets/icons/Chat badge.svg'
import iconTag from '../assets/icons/Tag.svg'
import iconInbox from '../assets/icons/Inbox.svg'
import iconUserContact from '../assets/icons/User contact.svg'

import iconGoogleAds from '../assets/icons/Google Ads.svg'
import iconBroom from '../assets/icons/Broom.svg'
import iconWebsiteCode from '../assets/icons/Website code.svg'
import iconDollarBadge from '../assets/icons/Dollar badge.svg'
/* Exported from Figma under its layer name rather than its subject — it is the
   handset glyph on the "Customer support" row. */
import iconTelephone from '../assets/icons/Group.svg'

import dotOnline from '../assets/icons/Ellipse 28.svg'
import dotAway from '../assets/icons/Frame 189.svg'
import dotBusy from '../assets/icons/Frame 186.svg'

import avatarRoland from '../assets/images/avatars/roland-rodriguez.png'
import avatarSamantha from '../assets/images/avatars/samantha-lee.png'
import avatarJames from '../assets/images/avatars/james-carter.png'
import avatarOlivia from '../assets/images/avatars/olivia-brown.png'
/* Ethan's is a generated identicon, not a photo — it ships as an SVG so it
   stays crisp, and it already carries its own circular clip. */
import avatarEthan from '../assets/icons/[E] Black - Aura Afternoon.svg'

import railMessageActive from '../assets/icons/Message/Active.svg'
import railMessageInactive from '../assets/icons/Message/Inactive.svg'
import railVideoActive from '../assets/icons/Video/Active.svg'
import railVideoInactive from '../assets/icons/Video/Inactive.svg'
import railJobActive from '../assets/icons/Job/Active.svg'
import railJobInactive from '../assets/icons/Job/Inactive.svg'
import railChartActive from '../assets/icons/Chart/Active.svg'
import railChartInactive from '../assets/icons/Chart/Inactive.svg'
import railSettingsActive from '../assets/icons/Settings/Active.svg'
import railSettingsInactive from '../assets/icons/Settings/Inactive.svg'

/** Green dot, amber moon, red cross — the three states drawn in the design. */
export type Presence = 'online' | 'away' | 'busy'

export const PRESENCE_DOTS: Record<Presence, string> = {
  online: dotOnline,
  away: dotAway,
  busy: dotBusy,
}

export type NavLink = { label: string; icon: string }
export type Chat = { name: string; avatar: string; presence: Presence }

/** The four filters above the chat lists. "My inbox" is the landing state. */
export const INBOX_LINKS: NavLink[] = [
  { label: 'My inbox', icon: iconChatBadge },
  { label: 'Mentions', icon: iconTag },
  { label: 'Archived chats', icon: iconInbox },
  { label: 'Contact list', icon: iconUserContact },
]

export const PINNED_CHATS: Chat[] = [
  { name: 'Roland Rodriguez', avatar: avatarRoland, presence: 'online' },
  { name: 'Samantha Lee', avatar: avatarSamantha, presence: 'away' },
  { name: 'James Carter', avatar: avatarJames, presence: 'busy' },
  { name: 'Olivia Brown', avatar: avatarOlivia, presence: 'online' },
  { name: 'Ethan Smith', avatar: avatarEthan, presence: 'online' },
]

export const GROUPS: NavLink[] = [
  { label: 'Marketing team', icon: iconGoogleAds },
  { label: 'Design team', icon: iconBroom },
  { label: 'Engineering team', icon: iconWebsiteCode },
  { label: 'Operations team', icon: iconDollarBadge },
  { label: 'Customer support', icon: iconTelephone },
]

/**
 * The app rail. Both cuts of each icon ship from Figma with the selected chip —
 * `#eef0f7` fill plus a hairline — already drawn into the active file, so
 * selection here is an asset swap rather than a background this code paints.
 */
export type RailItem = { label: string; active: string; inactive: string }

export const RAIL_ITEMS: RailItem[] = [
  { label: 'Messages', active: railMessageActive, inactive: railMessageInactive },
  { label: 'Video', active: railVideoActive, inactive: railVideoInactive },
  { label: 'Jobs', active: railJobActive, inactive: railJobInactive },
  { label: 'Charts', active: railChartActive, inactive: railChartInactive },
  { label: 'Settings', active: railSettingsActive, inactive: railSettingsInactive },
]
