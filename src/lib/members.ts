export type TierId = 'basic' | 'professional' | 'enterprise' | 'startup'

export type Tier = {
  id: TierId
  label: string
  color: string
}

export const TIERS: Record<TierId, Tier> = {
  basic: { id: 'basic', label: 'Basic', color: '#f99600' },
  professional: { id: 'professional', label: 'Professional', color: '#32c200' },
  enterprise: { id: 'enterprise', label: 'Enterprise', color: '#007aff' },
  startup: { id: 'startup', label: 'Startup', color: '#a40ad3' },
}

export type CompanyId = 'microsoft' | 'tesla' | 'apple' | 'google' | 'amazon' | 'meta' | 'general-electric'

import iconMicrosoft from '../assets/icons/microsoft.svg'
import iconTesla from '../assets/icons/Frame 43.svg'
import iconApple from '../assets/icons/apple.svg'
import iconGoogle from '../assets/icons/google.svg'
import iconGoogle1 from '../assets/icons/google-1.svg'
import iconAmazon from '../assets/icons/amazon.svg'
import iconMeta from '../assets/icons/Frame 44.svg'
import iconGE from '../assets/icons/General Electric Company.svg'

import avatarMaxwellRumanous from '../assets/images/avatars/maxwell-rumanous.png'
import avatarSeraphinaLarkspur from '../assets/images/avatars/seraphina-larkspur.png'
import avatarElenaSmith from '../assets/images/avatars/elena-smith.png'
import avatarLanaWilliams from '../assets/images/avatars/lana-williams.png'
import avatarJohnDoe from '../assets/images/avatars/john-doe.png'
import avatarSaraConnor from '../assets/images/avatars/sara-connor.png'
import avatarMikeJones from '../assets/images/avatars/mike-jones.png'
import avatarJaneSmith from '../assets/images/avatars/jane-smith.png'
import avatarMonogramJadeLimeJ from '../assets/images/avatars/monogram-jade-lime-j.png'
import avatarMonogramJadeIndigoM from '../assets/images/avatars/monogram-jade-indigo-m.png'

/* Figma reuses the same logo instance for every Microsoft/Apple/Amazon
   row; only Google has a second distinct variant in the design. */
export const COMPANY_LOGOS: Record<string, string[]> = {
  microsoft: [iconMicrosoft],
  tesla: [iconTesla],
  apple: [iconApple],
  google: [iconGoogle, iconGoogle1],
  amazon: [iconAmazon],
  meta: [iconMeta],
  'general-electric': [iconGE],
}

export const COMPANY_NAMES: Record<string, string> = {
  microsoft: 'Microsoft',
  tesla: 'Tesla',
  apple: 'Apple',
  google: 'Google',
  amazon: 'Amazon',
  meta: 'Meta',
  'general-electric': 'General Electric',
}

export type Member = {
  id: number
  name: string
  email: string
  tier: TierId
  company: CompanyId
  companyLogoIndex: number
  dateJoined: string
  avatar: string
}

export const MEMBERS: Member[] = [
  { id: 1, name: 'James Oliver', email: 'james.oliver@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '12/29/2023', avatar: avatarMonogramJadeLimeJ },
  { id: 2, name: 'Maxwell Rumanous', email: 'm.rumanous@tesla.com', tier: 'professional', company: 'tesla', companyLogoIndex: 0, dateJoined: '03/15/2024', avatar: avatarMaxwellRumanous },
  { id: 3, name: 'Seraphina Larkspur', email: 'seraphina.larkspur@apple.com', tier: 'enterprise', company: 'apple', companyLogoIndex: 0, dateJoined: '07/22/2024', avatar: avatarSeraphinaLarkspur },
  { id: 4, name: 'Jasper Moon', email: 'jasper.moon@google.com', tier: 'startup', company: 'google', companyLogoIndex: 0, dateJoined: '11/05/2024', avatar: avatarMonogramJadeLimeJ },
  { id: 5, name: 'Elena Smith', email: 'elena.smith@amazon.com', tier: 'professional', company: 'amazon', companyLogoIndex: 0, dateJoined: '01/30/2024', avatar: avatarElenaSmith },
  { id: 6, name: 'Marcus Jones', email: 'marcus.jones@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '09/12/2024', avatar: avatarMonogramJadeIndigoM },
  { id: 7, name: 'Lana Williams', email: 'lana.williams@meta.com', tier: 'enterprise', company: 'meta', companyLogoIndex: 0, dateJoined: '04/18/2024', avatar: avatarLanaWilliams },
  { id: 8, name: 'John Doe', email: 'john.doe@google.com', tier: 'startup', company: 'google', companyLogoIndex: 1, dateJoined: '06/27/2024', avatar: avatarJohnDoe },
  { id: 9, name: 'Sara Connor', email: 'sara.connor@skynet.com', tier: 'enterprise', company: 'general-electric', companyLogoIndex: 0, dateJoined: '10/09/2024', avatar: avatarSaraConnor },
  { id: 10, name: 'Mike Jones', email: 'mike.jones@apple.com', tier: 'professional', company: 'apple', companyLogoIndex: 0, dateJoined: '02/14/2024', avatar: avatarMikeJones },
  { id: 11, name: 'Jane Smith', email: 'jane.smith@amazon.com', tier: 'basic', company: 'amazon', companyLogoIndex: 0, dateJoined: '08/25/2024', avatar: avatarJaneSmith },
  { id: 12, name: 'Olivia Chen', email: 'olivia.chen@microsoft.com', tier: 'professional', company: 'microsoft', companyLogoIndex: 0, dateJoined: '03/02/2024', avatar: avatarMaxwellRumanous },
  { id: 13, name: 'Ethan Brooks', email: 'ethan.brooks@tesla.com', tier: 'enterprise', company: 'tesla', companyLogoIndex: 0, dateJoined: '05/19/2024', avatar: avatarSeraphinaLarkspur },
  { id: 14, name: 'Priya Patel', email: 'priya.patel@apple.com', tier: 'basic', company: 'apple', companyLogoIndex: 0, dateJoined: '01/11/2024', avatar: avatarElenaSmith },
  { id: 15, name: 'Lucas Fernandez', email: 'lucas.fernandez@google.com', tier: 'startup', company: 'google', companyLogoIndex: 1, dateJoined: '09/28/2024', avatar: avatarLanaWilliams },
  { id: 16, name: 'Grace Kim', email: 'grace.kim@amazon.com', tier: 'professional', company: 'amazon', companyLogoIndex: 0, dateJoined: '04/07/2024', avatar: avatarJohnDoe },
  { id: 17, name: 'Noah Davies', email: 'noah.davies@microsoft.com', tier: 'enterprise', company: 'microsoft', companyLogoIndex: 0, dateJoined: '12/02/2024', avatar: avatarSaraConnor },
  { id: 18, name: 'Ava Thompson', email: 'ava.thompson@meta.com', tier: 'basic', company: 'meta', companyLogoIndex: 0, dateJoined: '02/23/2024', avatar: avatarMikeJones },
  { id: 19, name: 'Liam Carter', email: 'liam.carter@google.com', tier: 'startup', company: 'google', companyLogoIndex: 0, dateJoined: '07/14/2024', avatar: avatarJaneSmith },
  { id: 20, name: 'Sofia Rossi', email: 'sofia.rossi@apple.com', tier: 'professional', company: 'apple', companyLogoIndex: 0, dateJoined: '06/30/2024', avatar: avatarMonogramJadeLimeJ },
  { id: 21, name: 'Mason Clarke', email: 'mason.clarke@amazon.com', tier: 'enterprise', company: 'amazon', companyLogoIndex: 0, dateJoined: '08/05/2024', avatar: avatarMonogramJadeIndigoM },
  { id: 22, name: 'Isabella Novak', email: 'isabella.novak@tesla.com', tier: 'basic', company: 'tesla', companyLogoIndex: 0, dateJoined: '03/21/2024', avatar: avatarMaxwellRumanous },
  { id: 23, name: 'Benjamin Wright', email: 'benjamin.wright@microsoft.com', tier: 'startup', company: 'microsoft', companyLogoIndex: 0, dateJoined: '10/16/2024', avatar: avatarSeraphinaLarkspur },
  { id: 24, name: 'Chloe Martin', email: 'chloe.martin@google.com', tier: 'professional', company: 'google', companyLogoIndex: 1, dateJoined: '05/03/2024', avatar: avatarElenaSmith },
  { id: 25, name: 'Daniel Silva', email: 'daniel.silva@ge.com', tier: 'enterprise', company: 'general-electric', companyLogoIndex: 0, dateJoined: '11/22/2024', avatar: avatarLanaWilliams },
  { id: 26, name: 'Zara Ahmed', email: 'zara.ahmed@apple.com', tier: 'basic', company: 'apple', companyLogoIndex: 0, dateJoined: '01/29/2024', avatar: avatarJohnDoe },
  { id: 27, name: 'Henry Foster', email: 'henry.foster@amazon.com', tier: 'startup', company: 'amazon', companyLogoIndex: 0, dateJoined: '09/09/2024', avatar: avatarSaraConnor },
  { id: 28, name: 'Mia Lindqvist', email: 'mia.lindqvist@meta.com', tier: 'professional', company: 'meta', companyLogoIndex: 0, dateJoined: '04/25/2024', avatar: avatarMikeJones },
  { id: 29, name: 'Owen Bennett', email: 'owen.bennett@tesla.com', tier: 'enterprise', company: 'tesla', companyLogoIndex: 0, dateJoined: '06/11/2024', avatar: avatarJaneSmith },
  { id: 30, name: 'Layla Haddad', email: 'layla.haddad@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '02/14/2025', avatar: avatarMonogramJadeLimeJ },
  { id: 31, name: 'Jack Sullivan', email: 'jack.sullivan@google.com', tier: 'startup', company: 'google', companyLogoIndex: 1, dateJoined: '07/30/2024', avatar: avatarMonogramJadeIndigoM },
  { id: 32, name: 'Amara Okafor', email: 'amara.okafor@amazon.com', tier: 'professional', company: 'amazon', companyLogoIndex: 0, dateJoined: '03/17/2024', avatar: avatarMaxwellRumanous },
  { id: 33, name: 'Felix Bergmann', email: 'felix.bergmann@apple.com', tier: 'enterprise', company: 'apple', companyLogoIndex: 0, dateJoined: '08/22/2024', avatar: avatarSeraphinaLarkspur },
  { id: 34, name: 'Ruby Chen', email: 'ruby.chen@ge.com', tier: 'basic', company: 'general-electric', companyLogoIndex: 0, dateJoined: '05/06/2024', avatar: avatarElenaSmith },
  { id: 35, name: 'Theo Nakamura', email: 'theo.nakamura@meta.com', tier: 'startup', company: 'meta', companyLogoIndex: 0, dateJoined: '10/29/2024', avatar: avatarLanaWilliams },
  { id: 36, name: 'Nora Kristiansen', email: 'nora.kristiansen@microsoft.com', tier: 'professional', company: 'microsoft', companyLogoIndex: 0, dateJoined: '01/05/2025', avatar: avatarJohnDoe },
  { id: 37, name: 'Adrian Kowalski', email: 'adrian.kowalski@tesla.com', tier: 'enterprise', company: 'tesla', companyLogoIndex: 0, dateJoined: '12/19/2024', avatar: avatarSaraConnor },
  { id: 38, name: 'Freya Solberg', email: 'freya.solberg@google.com', tier: 'basic', company: 'google', companyLogoIndex: 0, dateJoined: '06/24/2024', avatar: avatarMikeJones },
  { id: 39, name: 'Marcus Webb', email: 'marcus.webb@apple.com', tier: 'startup', company: 'apple', companyLogoIndex: 0, dateJoined: '09/13/2024', avatar: avatarJaneSmith },
  { id: 40, name: 'Aisha Rahman', email: 'aisha.rahman@amazon.com', tier: 'professional', company: 'amazon', companyLogoIndex: 0, dateJoined: '02/08/2025', avatar: avatarMonogramJadeLimeJ },
  { id: 41, name: 'Leo Castellano', email: 'leo.castellano@meta.com', tier: 'enterprise', company: 'meta', companyLogoIndex: 0, dateJoined: '07/01/2024', avatar: avatarMonogramJadeIndigoM },
  { id: 42, name: 'Ingrid Larsen', email: 'ingrid.larsen@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '11/11/2024', avatar: avatarMaxwellRumanous },
  { id: 43, name: 'Diego Morales', email: 'diego.morales@ge.com', tier: 'startup', company: 'general-electric', companyLogoIndex: 0, dateJoined: '03/26/2024', avatar: avatarSeraphinaLarkspur },
  { id: 44, name: 'Willow Park', email: 'willow.park@tesla.com', tier: 'professional', company: 'tesla', companyLogoIndex: 0, dateJoined: '08/17/2024', avatar: avatarElenaSmith },
  { id: 45, name: 'Caleb Osei', email: 'caleb.osei@google.com', tier: 'enterprise', company: 'google', companyLogoIndex: 1, dateJoined: '01/20/2025', avatar: avatarLanaWilliams },
  { id: 46, name: 'Hannah Ramirez', email: 'hannah.ramirez@meta.com', tier: 'basic', company: 'meta', companyLogoIndex: 0, dateJoined: '07/09/2024', avatar: avatarMonogramJadeLimeJ },
  { id: 47, name: 'Julian Ramirez', email: 'julian.ramirez@ge.com', tier: 'basic', company: 'general-electric', companyLogoIndex: 0, dateJoined: '06/20/2026', avatar: avatarMaxwellRumanous },
  { id: 48, name: 'Skylar Wood', email: 'skylar.wood@meta.com', tier: 'basic', company: 'meta', companyLogoIndex: 0, dateJoined: '02/28/2026', avatar: avatarSeraphinaLarkspur },
  { id: 49, name: 'Beau Wallace', email: 'beau.wallace@amazon.com', tier: 'basic', company: 'amazon', companyLogoIndex: 0, dateJoined: '05/26/2025', avatar: avatarMonogramJadeLimeJ },
  { id: 50, name: 'William Gray', email: 'william.gray@microsoft.com', tier: 'professional', company: 'microsoft', companyLogoIndex: 0, dateJoined: '04/21/2025', avatar: avatarSeraphinaLarkspur },
  { id: 51, name: 'Adeline Hughes', email: 'adeline.hughes@microsoft.com', tier: 'enterprise', company: 'microsoft', companyLogoIndex: 0, dateJoined: '09/30/2024', avatar: avatarSeraphinaLarkspur },
  { id: 52, name: 'James Hayes', email: 'james.hayes@amazon.com', tier: 'professional', company: 'amazon', companyLogoIndex: 0, dateJoined: '01/15/2024', avatar: avatarLanaWilliams },
  { id: 53, name: 'Owen Cruz', email: 'owen.cruz@amazon.com', tier: 'startup', company: 'amazon', companyLogoIndex: 0, dateJoined: '02/10/2026', avatar: avatarElenaSmith },
  { id: 54, name: 'Lucas Sanders', email: 'lucas.sanders@microsoft.com', tier: 'professional', company: 'microsoft', companyLogoIndex: 0, dateJoined: '06/13/2024', avatar: avatarLanaWilliams },
  { id: 55, name: 'Gabriella Alexander', email: 'gabriella.alexander@google.com', tier: 'enterprise', company: 'google', companyLogoIndex: 0, dateJoined: '06/14/2025', avatar: avatarLanaWilliams },
  { id: 56, name: 'Anna Wallace', email: 'anna.wallace@meta.com', tier: 'basic', company: 'meta', companyLogoIndex: 0, dateJoined: '01/10/2026', avatar: avatarSaraConnor },
  { id: 57, name: 'Benjamin Ortiz', email: 'benjamin.ortiz@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '08/27/2023', avatar: avatarMaxwellRumanous },
  { id: 58, name: 'Brooklyn Hamilton', email: 'brooklyn.hamilton@amazon.com', tier: 'enterprise', company: 'amazon', companyLogoIndex: 0, dateJoined: '10/04/2023', avatar: avatarLanaWilliams },
  { id: 59, name: 'Eli Marshall', email: 'eli.marshall@amazon.com', tier: 'enterprise', company: 'amazon', companyLogoIndex: 0, dateJoined: '09/11/2025', avatar: avatarMonogramJadeIndigoM },
  { id: 60, name: 'Caleb Graham', email: 'caleb.graham@tesla.com', tier: 'professional', company: 'tesla', companyLogoIndex: 0, dateJoined: '03/04/2024', avatar: avatarMaxwellRumanous },
  { id: 61, name: 'Cooper Cole', email: 'cooper.cole@google.com', tier: 'basic', company: 'google', companyLogoIndex: 1, dateJoined: '03/12/2024', avatar: avatarJaneSmith },
  { id: 62, name: 'Adeline Harrison', email: 'adeline.harrison@tesla.com', tier: 'startup', company: 'tesla', companyLogoIndex: 0, dateJoined: '12/10/2024', avatar: avatarJaneSmith },
  { id: 63, name: 'Elena Griffin', email: 'elena.griffin@apple.com', tier: 'professional', company: 'apple', companyLogoIndex: 0, dateJoined: '03/13/2023', avatar: avatarMaxwellRumanous },
  { id: 64, name: 'Colton Long', email: 'colton.long@microsoft.com', tier: 'enterprise', company: 'microsoft', companyLogoIndex: 0, dateJoined: '05/11/2023', avatar: avatarJaneSmith },
  { id: 65, name: 'Josiah Cole', email: 'josiah.cole@microsoft.com', tier: 'professional', company: 'microsoft', companyLogoIndex: 0, dateJoined: '03/19/2024', avatar: avatarMaxwellRumanous },
  { id: 66, name: 'Daniel Hamilton', email: 'daniel.hamilton@ge.com', tier: 'professional', company: 'general-electric', companyLogoIndex: 0, dateJoined: '09/14/2024', avatar: avatarJaneSmith },
  { id: 67, name: 'Brooklyn Harrison', email: 'brooklyn.harrison@ge.com', tier: 'professional', company: 'general-electric', companyLogoIndex: 0, dateJoined: '11/21/2023', avatar: avatarElenaSmith },
  { id: 68, name: 'Cooper Gray', email: 'cooper.gray@apple.com', tier: 'enterprise', company: 'apple', companyLogoIndex: 0, dateJoined: '06/03/2026', avatar: avatarMikeJones },
  { id: 69, name: 'Liam Wood', email: 'liam.wood@tesla.com', tier: 'basic', company: 'tesla', companyLogoIndex: 0, dateJoined: '12/27/2024', avatar: avatarJohnDoe },
  { id: 70, name: 'Emmett Ramirez', email: 'emmett.ramirez@apple.com', tier: 'professional', company: 'apple', companyLogoIndex: 0, dateJoined: '05/02/2025', avatar: avatarJaneSmith },
  { id: 71, name: 'Landon Gibson', email: 'landon.gibson@meta.com', tier: 'startup', company: 'meta', companyLogoIndex: 0, dateJoined: '11/03/2025', avatar: avatarSeraphinaLarkspur },
  { id: 72, name: 'Emmett Graham', email: 'emmett.graham@microsoft.com', tier: 'enterprise', company: 'microsoft', companyLogoIndex: 0, dateJoined: '12/04/2025', avatar: avatarJohnDoe },
  { id: 73, name: 'Caleb Barnes', email: 'caleb.barnes@meta.com', tier: 'professional', company: 'meta', companyLogoIndex: 0, dateJoined: '08/16/2024', avatar: avatarMonogramJadeLimeJ },
  { id: 74, name: 'Gabriel Cole', email: 'gabriel.cole@amazon.com', tier: 'basic', company: 'amazon', companyLogoIndex: 0, dateJoined: '09/11/2023', avatar: avatarSaraConnor },
  { id: 75, name: 'Iris Jenkins', email: 'iris.jenkins@ge.com', tier: 'enterprise', company: 'general-electric', companyLogoIndex: 0, dateJoined: '06/21/2023', avatar: avatarSeraphinaLarkspur },
  { id: 76, name: 'Chloe Brooks', email: 'chloe.brooks@amazon.com', tier: 'professional', company: 'amazon', companyLogoIndex: 0, dateJoined: '11/21/2024', avatar: avatarJaneSmith },
  { id: 77, name: 'Declan Barnes', email: 'declan.barnes@tesla.com', tier: 'professional', company: 'tesla', companyLogoIndex: 0, dateJoined: '05/17/2026', avatar: avatarMaxwellRumanous },
  { id: 78, name: 'Riley Ross', email: 'riley.ross@google.com', tier: 'startup', company: 'google', companyLogoIndex: 0, dateJoined: '06/28/2025', avatar: avatarMonogramJadeIndigoM },
  { id: 79, name: 'Alexa Hamilton', email: 'alexa.hamilton@google.com', tier: 'professional', company: 'google', companyLogoIndex: 1, dateJoined: '03/07/2024', avatar: avatarSeraphinaLarkspur },
  { id: 80, name: 'Adeline Woods', email: 'adeline.woods@amazon.com', tier: 'professional', company: 'amazon', companyLogoIndex: 0, dateJoined: '08/22/2023', avatar: avatarJohnDoe },
  { id: 81, name: 'Paisley Barnes', email: 'paisley.barnes@meta.com', tier: 'basic', company: 'meta', companyLogoIndex: 0, dateJoined: '04/17/2024', avatar: avatarMonogramJadeLimeJ },
  { id: 82, name: 'James Alexander', email: 'james.alexander@microsoft.com', tier: 'enterprise', company: 'microsoft', companyLogoIndex: 0, dateJoined: '02/11/2023', avatar: avatarJaneSmith },
  { id: 83, name: 'Beau Marshall', email: 'beau.marshall@tesla.com', tier: 'startup', company: 'tesla', companyLogoIndex: 0, dateJoined: '10/11/2023', avatar: avatarElenaSmith },
  { id: 84, name: 'Weston Harrison', email: 'weston.harrison@ge.com', tier: 'basic', company: 'general-electric', companyLogoIndex: 0, dateJoined: '12/02/2024', avatar: avatarJohnDoe },
  { id: 85, name: 'Aiden Reynolds', email: 'aiden.reynolds@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '11/18/2025', avatar: avatarMonogramJadeLimeJ },
  { id: 86, name: 'Sebastian Hughes', email: 'sebastian.hughes@ge.com', tier: 'startup', company: 'general-electric', companyLogoIndex: 0, dateJoined: '05/07/2025', avatar: avatarMonogramJadeIndigoM },
  { id: 87, name: 'Naomi Foster', email: 'naomi.foster@ge.com', tier: 'professional', company: 'general-electric', companyLogoIndex: 0, dateJoined: '02/07/2026', avatar: avatarSaraConnor },
  { id: 88, name: 'Alexander Myers', email: 'alexander.myers@microsoft.com', tier: 'startup', company: 'microsoft', companyLogoIndex: 0, dateJoined: '08/13/2023', avatar: avatarJaneSmith },
  { id: 89, name: 'Joseph Jenkins', email: 'joseph.jenkins@ge.com', tier: 'basic', company: 'general-electric', companyLogoIndex: 0, dateJoined: '06/28/2023', avatar: avatarJohnDoe },
  { id: 90, name: 'Cameron Cole', email: 'cameron.cole@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '02/27/2023', avatar: avatarMonogramJadeLimeJ },
  { id: 91, name: 'Kai Ramirez', email: 'kai.ramirez@amazon.com', tier: 'basic', company: 'amazon', companyLogoIndex: 0, dateJoined: '05/09/2023', avatar: avatarMonogramJadeLimeJ },
  { id: 92, name: 'Claire Reynolds', email: 'claire.reynolds@meta.com', tier: 'basic', company: 'meta', companyLogoIndex: 0, dateJoined: '02/09/2024', avatar: avatarJaneSmith },
  { id: 93, name: 'Skylar Mendoza', email: 'skylar.mendoza@meta.com', tier: 'professional', company: 'meta', companyLogoIndex: 0, dateJoined: '09/13/2024', avatar: avatarSaraConnor },
  { id: 94, name: 'Gabriel Alexander', email: 'gabriel.alexander@apple.com', tier: 'enterprise', company: 'apple', companyLogoIndex: 0, dateJoined: '09/20/2024', avatar: avatarJohnDoe },
  { id: 95, name: 'Dylan Barnes', email: 'dylan.barnes@ge.com', tier: 'basic', company: 'general-electric', companyLogoIndex: 0, dateJoined: '11/01/2024', avatar: avatarJohnDoe },
  { id: 96, name: 'Kai Hughes', email: 'kai.hughes@ge.com', tier: 'enterprise', company: 'general-electric', companyLogoIndex: 0, dateJoined: '12/31/2023', avatar: avatarSeraphinaLarkspur },
  { id: 97, name: 'Evelyn Harrison', email: 'evelyn.harrison@apple.com', tier: 'professional', company: 'apple', companyLogoIndex: 0, dateJoined: '05/25/2024', avatar: avatarJaneSmith },
  { id: 98, name: 'Anthony Cole', email: 'anthony.cole@microsoft.com', tier: 'startup', company: 'microsoft', companyLogoIndex: 0, dateJoined: '05/26/2023', avatar: avatarMonogramJadeLimeJ },
  { id: 99, name: 'Kinsley Wood', email: 'kinsley.wood@tesla.com', tier: 'basic', company: 'tesla', companyLogoIndex: 0, dateJoined: '03/03/2023', avatar: avatarMonogramJadeIndigoM },
  { id: 100, name: 'Nathan West', email: 'nathan.west@amazon.com', tier: 'basic', company: 'amazon', companyLogoIndex: 0, dateJoined: '02/18/2023', avatar: avatarJaneSmith },
  { id: 101, name: 'Hannah Cox', email: 'hannah.cox@meta.com', tier: 'enterprise', company: 'meta', companyLogoIndex: 0, dateJoined: '08/26/2023', avatar: avatarSeraphinaLarkspur },
  { id: 102, name: 'Caleb Watson', email: 'caleb.watson@apple.com', tier: 'basic', company: 'apple', companyLogoIndex: 0, dateJoined: '06/14/2026', avatar: avatarLanaWilliams },
  { id: 103, name: 'Alexander Griffin', email: 'alexander.griffin@apple.com', tier: 'basic', company: 'apple', companyLogoIndex: 0, dateJoined: '02/28/2023', avatar: avatarSaraConnor },
  { id: 104, name: 'Eleanor West', email: 'eleanor.west@meta.com', tier: 'professional', company: 'meta', companyLogoIndex: 0, dateJoined: '11/04/2025', avatar: avatarElenaSmith },
  { id: 105, name: 'Jonathan Alexander', email: 'jonathan.alexander@tesla.com', tier: 'professional', company: 'tesla', companyLogoIndex: 0, dateJoined: '11/11/2025', avatar: avatarMonogramJadeLimeJ },
  { id: 106, name: 'Paisley Bennett', email: 'paisley.bennett@google.com', tier: 'basic', company: 'google', companyLogoIndex: 0, dateJoined: '06/15/2024', avatar: avatarMonogramJadeLimeJ },
  { id: 107, name: 'Peyton Ramirez', email: 'peyton.ramirez@amazon.com', tier: 'professional', company: 'amazon', companyLogoIndex: 0, dateJoined: '11/15/2024', avatar: avatarJohnDoe },
  { id: 108, name: 'Landon Barnes', email: 'landon.barnes@microsoft.com', tier: 'professional', company: 'microsoft', companyLogoIndex: 0, dateJoined: '05/09/2025', avatar: avatarJaneSmith },
  { id: 109, name: 'Josephine Foster', email: 'josephine.foster@ge.com', tier: 'enterprise', company: 'general-electric', companyLogoIndex: 0, dateJoined: '06/09/2026', avatar: avatarJohnDoe },
  { id: 110, name: 'Brooklyn Ford', email: 'brooklyn.ford@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '08/26/2025', avatar: avatarElenaSmith },
  { id: 111, name: 'Henry Cole', email: 'henry.cole@google.com', tier: 'startup', company: 'google', companyLogoIndex: 1, dateJoined: '09/18/2025', avatar: avatarMaxwellRumanous },
  { id: 112, name: 'Adeline Gibson', email: 'adeline.gibson@tesla.com', tier: 'startup', company: 'tesla', companyLogoIndex: 0, dateJoined: '02/01/2023', avatar: avatarJohnDoe },
  { id: 113, name: 'Asher Gray', email: 'asher.gray@ge.com', tier: 'startup', company: 'general-electric', companyLogoIndex: 0, dateJoined: '05/09/2025', avatar: avatarMonogramJadeIndigoM },
  { id: 114, name: 'Logan Torres', email: 'logan.torres@microsoft.com', tier: 'startup', company: 'microsoft', companyLogoIndex: 0, dateJoined: '04/19/2026', avatar: avatarMonogramJadeLimeJ },
  { id: 115, name: 'Charlotte West', email: 'charlotte.west@google.com', tier: 'startup', company: 'google', companyLogoIndex: 0, dateJoined: '05/23/2023', avatar: avatarMikeJones },
  { id: 116, name: 'Leah Price', email: 'leah.price@ge.com', tier: 'startup', company: 'general-electric', companyLogoIndex: 0, dateJoined: '01/05/2025', avatar: avatarMikeJones },
  { id: 117, name: 'Ethan Gomez', email: 'ethan.gomez@google.com', tier: 'basic', company: 'google', companyLogoIndex: 1, dateJoined: '10/06/2024', avatar: avatarMonogramJadeLimeJ },
  { id: 118, name: 'Lucas Bell', email: 'lucas.bell@microsoft.com', tier: 'enterprise', company: 'microsoft', companyLogoIndex: 0, dateJoined: '08/23/2023', avatar: avatarLanaWilliams },
  { id: 119, name: 'Levi Harrison', email: 'levi.harrison@microsoft.com', tier: 'startup', company: 'microsoft', companyLogoIndex: 0, dateJoined: '04/18/2025', avatar: avatarMaxwellRumanous },
  { id: 120, name: 'Sarah Wallace', email: 'sarah.wallace@google.com', tier: 'basic', company: 'google', companyLogoIndex: 0, dateJoined: '08/30/2024', avatar: avatarSeraphinaLarkspur },
  { id: 121, name: 'Elizabeth Myers', email: 'elizabeth.myers@meta.com', tier: 'professional', company: 'meta', companyLogoIndex: 0, dateJoined: '12/02/2023', avatar: avatarJohnDoe },
  { id: 122, name: 'Kinsley James', email: 'kinsley.james@microsoft.com', tier: 'enterprise', company: 'microsoft', companyLogoIndex: 0, dateJoined: '07/03/2025', avatar: avatarMonogramJadeIndigoM },
  { id: 123, name: 'Genesis Ward', email: 'genesis.ward@ge.com', tier: 'basic', company: 'general-electric', companyLogoIndex: 0, dateJoined: '05/28/2024', avatar: avatarElenaSmith },
  { id: 124, name: 'Maya Ward', email: 'maya.ward@tesla.com', tier: 'basic', company: 'tesla', companyLogoIndex: 0, dateJoined: '06/25/2023', avatar: avatarElenaSmith },
  { id: 125, name: 'Samantha Reyes', email: 'samantha.reyes@amazon.com', tier: 'startup', company: 'amazon', companyLogoIndex: 0, dateJoined: '03/30/2025', avatar: avatarJaneSmith },
  { id: 126, name: 'Silas Foster', email: 'silas.foster@ge.com', tier: 'startup', company: 'general-electric', companyLogoIndex: 0, dateJoined: '03/18/2024', avatar: avatarMikeJones },
  { id: 127, name: 'Emma Diaz', email: 'emma.diaz@meta.com', tier: 'basic', company: 'meta', companyLogoIndex: 0, dateJoined: '08/13/2024', avatar: avatarJaneSmith },
  { id: 128, name: 'Rowan Hayes', email: 'rowan.hayes@ge.com', tier: 'startup', company: 'general-electric', companyLogoIndex: 0, dateJoined: '02/19/2024', avatar: avatarSeraphinaLarkspur },
  { id: 129, name: 'Stella Simmons', email: 'stella.simmons@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '07/21/2024', avatar: avatarMaxwellRumanous },
  { id: 130, name: 'Paisley Ramirez', email: 'paisley.ramirez@apple.com', tier: 'startup', company: 'apple', companyLogoIndex: 0, dateJoined: '03/14/2026', avatar: avatarLanaWilliams },
  { id: 131, name: 'Aaron Peterson', email: 'aaron.peterson@amazon.com', tier: 'enterprise', company: 'amazon', companyLogoIndex: 0, dateJoined: '11/10/2024', avatar: avatarMonogramJadeIndigoM },
  { id: 132, name: 'Bella Owens', email: 'bella.owens@tesla.com', tier: 'enterprise', company: 'tesla', companyLogoIndex: 0, dateJoined: '10/25/2025', avatar: avatarMonogramJadeIndigoM },
  { id: 133, name: 'Kai Brooks', email: 'kai.brooks@google.com', tier: 'basic', company: 'google', companyLogoIndex: 1, dateJoined: '02/04/2023', avatar: avatarMonogramJadeLimeJ },
  { id: 134, name: 'Elijah Wood', email: 'elijah.wood@amazon.com', tier: 'startup', company: 'amazon', companyLogoIndex: 0, dateJoined: '03/08/2023', avatar: avatarElenaSmith },
  { id: 135, name: 'Ella Ruiz', email: 'ella.ruiz@microsoft.com', tier: 'startup', company: 'microsoft', companyLogoIndex: 0, dateJoined: '12/30/2023', avatar: avatarSaraConnor },
  { id: 136, name: 'Jayden Graham', email: 'jayden.graham@amazon.com', tier: 'enterprise', company: 'amazon', companyLogoIndex: 0, dateJoined: '01/03/2025', avatar: avatarMonogramJadeLimeJ },
  { id: 137, name: 'Gabriel Sanders', email: 'gabriel.sanders@ge.com', tier: 'startup', company: 'general-electric', companyLogoIndex: 0, dateJoined: '03/23/2023', avatar: avatarElenaSmith },
  { id: 138, name: 'Amelia Cox', email: 'amelia.cox@amazon.com', tier: 'startup', company: 'amazon', companyLogoIndex: 0, dateJoined: '03/19/2026', avatar: avatarMonogramJadeIndigoM },
  { id: 139, name: 'Theodore Wood', email: 'theodore.wood@microsoft.com', tier: 'enterprise', company: 'microsoft', companyLogoIndex: 0, dateJoined: '10/22/2025', avatar: avatarSaraConnor },
  { id: 140, name: 'Rowan Cruz', email: 'rowan.cruz@apple.com', tier: 'startup', company: 'apple', companyLogoIndex: 0, dateJoined: '11/13/2025', avatar: avatarJaneSmith },
  { id: 141, name: 'Amelia Ruiz', email: 'amelia.ruiz@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '02/23/2026', avatar: avatarMikeJones },
  { id: 142, name: 'Maya Diaz', email: 'maya.diaz@meta.com', tier: 'enterprise', company: 'meta', companyLogoIndex: 0, dateJoined: '01/27/2024', avatar: avatarJaneSmith },
  { id: 143, name: 'Sofia Brooks', email: 'sofia.brooks@tesla.com', tier: 'basic', company: 'tesla', companyLogoIndex: 0, dateJoined: '03/17/2025', avatar: avatarMaxwellRumanous },
  { id: 144, name: 'Aaron Marshall', email: 'aaron.marshall@tesla.com', tier: 'basic', company: 'tesla', companyLogoIndex: 0, dateJoined: '06/05/2025', avatar: avatarMikeJones },
  { id: 145, name: 'Luke Sullivan', email: 'luke.sullivan@microsoft.com', tier: 'professional', company: 'microsoft', companyLogoIndex: 0, dateJoined: '10/21/2024', avatar: avatarJaneSmith },
  { id: 146, name: 'Isabella Ortiz', email: 'isabella.ortiz@ge.com', tier: 'enterprise', company: 'general-electric', companyLogoIndex: 0, dateJoined: '03/16/2026', avatar: avatarMaxwellRumanous },
  { id: 147, name: 'Asher Bennett', email: 'asher.bennett@google.com', tier: 'basic', company: 'google', companyLogoIndex: 0, dateJoined: '01/24/2024', avatar: avatarSeraphinaLarkspur },
  { id: 148, name: 'Grayson James', email: 'grayson.james@tesla.com', tier: 'enterprise', company: 'tesla', companyLogoIndex: 0, dateJoined: '06/15/2026', avatar: avatarJaneSmith },
  { id: 149, name: 'Henry McDonald', email: 'henry.mcdonald@tesla.com', tier: 'professional', company: 'tesla', companyLogoIndex: 0, dateJoined: '11/16/2023', avatar: avatarMonogramJadeIndigoM },
  { id: 150, name: 'Ava West', email: 'ava.west@google.com', tier: 'startup', company: 'google', companyLogoIndex: 1, dateJoined: '08/16/2025', avatar: avatarJohnDoe },
  { id: 151, name: 'Alice Coleman', email: 'alice.coleman@microsoft.com', tier: 'professional', company: 'microsoft', companyLogoIndex: 0, dateJoined: '05/06/2026', avatar: avatarMaxwellRumanous },
  { id: 152, name: 'Sofia Graham', email: 'sofia.graham@apple.com', tier: 'professional', company: 'apple', companyLogoIndex: 0, dateJoined: '08/12/2024', avatar: avatarMaxwellRumanous },
  { id: 153, name: 'Andrew Peterson', email: 'andrew.peterson@microsoft.com', tier: 'professional', company: 'microsoft', companyLogoIndex: 0, dateJoined: '05/27/2023', avatar: avatarElenaSmith },
  { id: 154, name: 'Zoe Ford', email: 'zoe.ford@google.com', tier: 'enterprise', company: 'google', companyLogoIndex: 0, dateJoined: '01/24/2023', avatar: avatarMikeJones },
  { id: 155, name: 'Sophia Ramirez', email: 'sophia.ramirez@apple.com', tier: 'professional', company: 'apple', companyLogoIndex: 0, dateJoined: '11/02/2024', avatar: avatarJohnDoe },
  { id: 156, name: 'Aaliyah Wallace', email: 'aaliyah.wallace@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '05/09/2025', avatar: avatarJohnDoe },
  { id: 157, name: 'Maya Perry', email: 'maya.perry@microsoft.com', tier: 'enterprise', company: 'microsoft', companyLogoIndex: 0, dateJoined: '06/18/2026', avatar: avatarMaxwellRumanous },
  { id: 158, name: 'William Hughes', email: 'william.hughes@ge.com', tier: 'professional', company: 'general-electric', companyLogoIndex: 0, dateJoined: '01/11/2026', avatar: avatarJaneSmith },
  { id: 159, name: 'Lily Long', email: 'lily.long@amazon.com', tier: 'professional', company: 'amazon', companyLogoIndex: 0, dateJoined: '06/25/2025', avatar: avatarSaraConnor },
  { id: 160, name: 'Skylar Hayes', email: 'skylar.hayes@tesla.com', tier: 'professional', company: 'tesla', companyLogoIndex: 0, dateJoined: '07/23/2025', avatar: avatarLanaWilliams },
  { id: 161, name: 'Riley Barnes', email: 'riley.barnes@ge.com', tier: 'basic', company: 'general-electric', companyLogoIndex: 0, dateJoined: '07/10/2023', avatar: avatarMaxwellRumanous },
  { id: 162, name: 'Charlotte McDonald', email: 'charlotte.mcdonald@meta.com', tier: 'professional', company: 'meta', companyLogoIndex: 0, dateJoined: '09/11/2023', avatar: avatarMonogramJadeIndigoM },
  { id: 163, name: 'Claire McDonald', email: 'claire.mcdonald@amazon.com', tier: 'basic', company: 'amazon', companyLogoIndex: 0, dateJoined: '07/26/2023', avatar: avatarMikeJones },
  { id: 164, name: 'Asher Reyes', email: 'asher.reyes@ge.com', tier: 'enterprise', company: 'general-electric', companyLogoIndex: 0, dateJoined: '11/02/2025', avatar: avatarMonogramJadeLimeJ },
  { id: 165, name: 'Rowan Myers', email: 'rowan.myers@tesla.com', tier: 'startup', company: 'tesla', companyLogoIndex: 0, dateJoined: '03/01/2025', avatar: avatarMikeJones },
  { id: 166, name: 'Charlotte Bennett', email: 'charlotte.bennett@tesla.com', tier: 'professional', company: 'tesla', companyLogoIndex: 0, dateJoined: '10/31/2023', avatar: avatarMaxwellRumanous },
  { id: 167, name: 'Anthony Gomez', email: 'anthony.gomez@google.com', tier: 'basic', company: 'google', companyLogoIndex: 1, dateJoined: '10/31/2025', avatar: avatarMikeJones },
  { id: 168, name: 'Lily Hughes', email: 'lily.hughes@meta.com', tier: 'basic', company: 'meta', companyLogoIndex: 0, dateJoined: '11/01/2023', avatar: avatarMikeJones },
  { id: 169, name: 'Landon Ford', email: 'landon.ford@microsoft.com', tier: 'enterprise', company: 'microsoft', companyLogoIndex: 0, dateJoined: '04/22/2025', avatar: avatarSaraConnor },
  { id: 170, name: 'Zoe Perry', email: 'zoe.perry@meta.com', tier: 'startup', company: 'meta', companyLogoIndex: 0, dateJoined: '06/22/2024', avatar: avatarMonogramJadeLimeJ },
  { id: 171, name: 'Gabriel Gray', email: 'gabriel.gray@apple.com', tier: 'professional', company: 'apple', companyLogoIndex: 0, dateJoined: '01/26/2024', avatar: avatarMaxwellRumanous },
  { id: 172, name: 'Jasper Cole', email: 'jasper.cole@microsoft.com', tier: 'enterprise', company: 'microsoft', companyLogoIndex: 0, dateJoined: '10/25/2025', avatar: avatarJaneSmith },
  { id: 173, name: 'Grayson Ellis', email: 'grayson.ellis@ge.com', tier: 'professional', company: 'general-electric', companyLogoIndex: 0, dateJoined: '05/09/2025', avatar: avatarSaraConnor },
  { id: 174, name: 'Stella Gibson', email: 'stella.gibson@apple.com', tier: 'professional', company: 'apple', companyLogoIndex: 0, dateJoined: '09/30/2024', avatar: avatarElenaSmith },
  { id: 175, name: 'Benjamin Reyes', email: 'benjamin.reyes@microsoft.com', tier: 'professional', company: 'microsoft', companyLogoIndex: 0, dateJoined: '10/30/2024', avatar: avatarJohnDoe },
  { id: 176, name: 'Benjamin Ross', email: 'benjamin.ross@tesla.com', tier: 'enterprise', company: 'tesla', companyLogoIndex: 0, dateJoined: '03/03/2023', avatar: avatarJaneSmith },
  { id: 177, name: 'Wyatt Hughes', email: 'wyatt.hughes@amazon.com', tier: 'enterprise', company: 'amazon', companyLogoIndex: 0, dateJoined: '07/10/2024', avatar: avatarMonogramJadeIndigoM },
  { id: 178, name: 'Lillian Hamilton', email: 'lillian.hamilton@ge.com', tier: 'basic', company: 'general-electric', companyLogoIndex: 0, dateJoined: '08/11/2025', avatar: avatarSeraphinaLarkspur },
  { id: 179, name: 'Audrey Wood', email: 'audrey.wood@ge.com', tier: 'basic', company: 'general-electric', companyLogoIndex: 0, dateJoined: '11/13/2025', avatar: avatarMaxwellRumanous },
  { id: 180, name: 'Roman Wood', email: 'roman.wood@tesla.com', tier: 'enterprise', company: 'tesla', companyLogoIndex: 0, dateJoined: '06/13/2026', avatar: avatarMonogramJadeIndigoM },
  { id: 181, name: 'Gabriel Ortiz', email: 'gabriel.ortiz@ge.com', tier: 'basic', company: 'general-electric', companyLogoIndex: 0, dateJoined: '08/30/2025', avatar: avatarJohnDoe },
  { id: 182, name: 'Harper Diaz', email: 'harper.diaz@amazon.com', tier: 'professional', company: 'amazon', companyLogoIndex: 0, dateJoined: '12/02/2023', avatar: avatarMaxwellRumanous },
  { id: 183, name: 'Ian Cole', email: 'ian.cole@google.com', tier: 'startup', company: 'google', companyLogoIndex: 0, dateJoined: '04/05/2024', avatar: avatarMonogramJadeIndigoM },
  { id: 184, name: 'Joshua Ruiz', email: 'joshua.ruiz@ge.com', tier: 'startup', company: 'general-electric', companyLogoIndex: 0, dateJoined: '02/15/2025', avatar: avatarSaraConnor },
  { id: 185, name: 'Grace Kelly', email: 'grace.kelly@google.com', tier: 'startup', company: 'google', companyLogoIndex: 1, dateJoined: '07/15/2023', avatar: avatarMonogramJadeIndigoM },
  { id: 186, name: 'Natalie Ellis', email: 'natalie.ellis@microsoft.com', tier: 'professional', company: 'microsoft', companyLogoIndex: 0, dateJoined: '05/05/2023', avatar: avatarElenaSmith },
  { id: 187, name: 'Natalie Wood', email: 'natalie.wood@apple.com', tier: 'basic', company: 'apple', companyLogoIndex: 0, dateJoined: '01/02/2025', avatar: avatarJohnDoe },
  { id: 188, name: 'Levi Graham', email: 'levi.graham@tesla.com', tier: 'enterprise', company: 'tesla', companyLogoIndex: 0, dateJoined: '05/22/2026', avatar: avatarLanaWilliams },
  { id: 189, name: 'Weston Peterson', email: 'weston.peterson@meta.com', tier: 'basic', company: 'meta', companyLogoIndex: 0, dateJoined: '08/15/2025', avatar: avatarMonogramJadeIndigoM },
  { id: 190, name: 'Weston Wood', email: 'weston.wood@amazon.com', tier: 'enterprise', company: 'amazon', companyLogoIndex: 0, dateJoined: '06/26/2025', avatar: avatarLanaWilliams },
  { id: 191, name: 'Layla Sullivan', email: 'layla.sullivan@amazon.com', tier: 'professional', company: 'amazon', companyLogoIndex: 0, dateJoined: '12/14/2023', avatar: avatarElenaSmith },
  { id: 192, name: 'Addison Hayes', email: 'addison.hayes@tesla.com', tier: 'basic', company: 'tesla', companyLogoIndex: 0, dateJoined: '01/02/2023', avatar: avatarMaxwellRumanous },
  { id: 193, name: 'Gabriel Peterson', email: 'gabriel.peterson@google.com', tier: 'startup', company: 'google', companyLogoIndex: 0, dateJoined: '01/16/2023', avatar: avatarSaraConnor },
  { id: 194, name: 'Aubrey Simmons', email: 'aubrey.simmons@amazon.com', tier: 'enterprise', company: 'amazon', companyLogoIndex: 0, dateJoined: '05/06/2025', avatar: avatarJohnDoe },
  { id: 195, name: 'Paisley Peterson', email: 'paisley.peterson@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '02/21/2026', avatar: avatarJaneSmith },
  { id: 196, name: 'William Ford', email: 'william.ford@apple.com', tier: 'professional', company: 'apple', companyLogoIndex: 0, dateJoined: '12/07/2024', avatar: avatarMaxwellRumanous },
  { id: 197, name: 'Joseph Hughes', email: 'joseph.hughes@microsoft.com', tier: 'basic', company: 'microsoft', companyLogoIndex: 0, dateJoined: '10/10/2025', avatar: avatarMikeJones },
  { id: 198, name: 'Ryan Peterson', email: 'ryan.peterson@ge.com', tier: 'professional', company: 'general-electric', companyLogoIndex: 0, dateJoined: '04/06/2026', avatar: avatarLanaWilliams },
  { id: 199, name: 'Declan Hughes', email: 'declan.hughes@meta.com', tier: 'startup', company: 'meta', companyLogoIndex: 0, dateJoined: '03/07/2024', avatar: avatarMikeJones },
  { id: 200, name: 'Lucy Griffin', email: 'lucy.griffin@google.com', tier: 'professional', company: 'google', companyLogoIndex: 1, dateJoined: '11/14/2024', avatar: avatarMonogramJadeIndigoM },
]
