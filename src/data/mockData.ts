import { Member, Project, ExternalPartner, Label, CalendarEvent } from '../types';

const toDateStr = (offsetDays: number): string =>
  new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const mockMembers: Member[] = [
  {
    id: 'member-1',
    name: '山田 太郎',
    team: '東京工事1課',
    qualifications: ['1級土木施工管理技士', '玉掛け'],
    availableHours: { start: '08:00', end: '18:00' },
    availableAreas: ['東京都', '神奈川県'],
    notes: '経験豊富な現場代理人',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'member-2',
    name: '佐藤 花子',
    team: '東京工事1課',
    qualifications: ['2級建築施工管理技士'],
    availableHours: { start: '09:00', end: '17:00' },
    availableAreas: ['東京都'],
    notes: '要宿泊不可',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'member-3',
    name: '田中 次郎',
    team: '関西工事課',
    qualifications: ['1級建築施工管理技士', '車両系建設機械'],
    availableHours: { start: '08:00', end: '19:00' },
    availableAreas: ['大阪府', '京都府', '兵庫県'],
    notes: '',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'member-4',
    name: '鈴木 三郎',
    team: '東京土木チーム',
    qualifications: ['第一種電気工事士', '高所作業車'],
    availableHours: { start: '07:00', end: '16:00' },
    availableAreas: ['東京都', '千葉県', '埼玉県'],
    notes: '早朝対応可能',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'member-5',
    name: '高橋 美咲',
    team: '関西工事課',
    qualifications: ['2級土木施工管理技士', '足場の組立て等作業主任者'],
    availableHours: { start: '09:00', end: '18:00' },
    availableAreas: ['大阪府', '奈良県'],
    notes: '足場・仮設まわりに強い',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

export const mockExternalPartners: ExternalPartner[] = [
  {
    id: 'partner-1',
    name: '田中建設',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'partner-2',
    name: '株式会社山田工業',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'partner-3',
    name: '佐藤土木',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'partner-4',
    name: '関西建設株式会社',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

export const mockLabels: Label[] = [
  { id: 'label-1', name: '緊急', color: '#ef4444', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'label-2', name: '工事', color: '#3b82f6', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'label-3', name: '請負', color: '#f59e0b', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'label-4', name: '定期点検', color: '#14b8a6', createdAt: '2025-01-01T00:00:00Z' }
];

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: '○○ビル 内装改修工事',
    date: new Date().toISOString().split('T')[0], // 今日
    workTime: { start: '09:00', end: '17:00' },
    location: '東京都中央区',
    workContent: '3F内装解体・軽鉄下地組み',
    requiredMembers: 2,
    notes: '安全靴・ヘルメット必須、館内養生',
    assignedMembers: ['member-1', 'member-2'],
    leadMemberId: 'member-1',
    contactMemberId: 'member-2',
    externalPartners: [
      {
        partnerId: 'partner-1',
        kind: 'subcontractor',
        memberCount: 2,
        representativeName: '田中 一郎',
        startTime: '09:00',
        endTime: '17:00'
      }
    ],
    labelIds: ['label-2'],
    workflowStatus: 'in_progress',
    priority: 'high',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'project-2',
    name: '△△道路 改良工事',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 明日
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5日後まで（複数日）
    workTime: { start: '08:00', end: '16:00' },
    location: '神奈川県横浜市',
    workContent: '路盤整正・アスファルト舗装',
    requiredMembers: 3,
    notes: '片側交互通行、交通誘導員手配済み',
    assignedMembers: ['member-3'],
    leadMemberId: 'member-3',
    externalPartners: [],
    labelIds: ['label-2'],
    workflowStatus: 'todo',
    priority: 'medium',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'project-3',
    name: '□□マンション 設備点検（請負）',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2日後
    workTime: { start: '10:00', end: '15:00' },
    location: '東京都新宿区',
    workContent: '共用部設備の定期点検・報告書作成',
    requiredMembers: 1,
    notes: '居住者対応注意、日中作業',
    assignedMembers: [],
    leadMemberId: undefined,
    externalPartners: [],
    labelIds: ['label-3', 'label-4'],
    workflowStatus: 'todo',
    priority: 'low',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'project-4',
    name: 'D施設 緊急漏水対応',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 昨日
    workTime: { start: '14:00', end: '18:00' },
    location: '東京都世田谷区',
    workContent: '給排水管漏水の応急補修',
    requiredMembers: 2,
    notes: '緊急案件、施設稼働中',
    assignedMembers: ['member-1', 'member-4'],
    leadMemberId: 'member-1',
    externalPartners: [
      {
        partnerId: 'partner-1',
        kind: 'subcontractor',
        memberCount: 1,
        representativeName: '田中 一郎',
        startTime: '14:00',
        endTime: '18:00'
      },
      {
        partnerId: 'partner-4',
        kind: 'hired_vehicle',
        memberCount: 1,
        representativeName: '西村',
        startTime: '14:00',
        endTime: '17:00',
        vehicleNumber: '8735',
        vehicleType: '25t/RC'
      }
    ],
    labelIds: ['label-1'],
    workflowStatus: 'done',
    priority: 'high',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'project-5',
    name: 'E商業施設 外構工事',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1週間後
    workTime: { start: '06:00', end: '12:00' },
    location: '千葉県船橋市',
    workContent: '駐車場舗装・区画線引き',
    requiredMembers: 3,
    notes: '開店前作業、早朝対応',
    assignedMembers: [],
    leadMemberId: undefined,
    externalPartners: [],
    labelIds: ['label-3'],
    workflowStatus: 'todo',
    priority: 'medium',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: '安全衛生ミーティング',
    date: toDateStr(0),
    isAllDay: false,
    startTime: '17:30',
    endTime: '18:00',
    color: '#ca8a04',
    memo: '全チーム参加。今月のヒヤリハット共有',
    memberIds: [], // 全体共有
    eventType: 'souhai_kaigi',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'event-2',
    title: '段取り（機材準備）',
    date: toDateStr(1),
    isAllDay: true,
    color: '#0ea5e9',
    memo: '',
    memberIds: ['member-4'], // 鈴木が対応
    eventType: 'dandori',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'event-3',
    title: '年休（佐藤）',
    date: toDateStr(3),
    isAllDay: true,
    color: '#a855f7',
    memo: '終日不在',
    memberIds: ['member-2'], // 佐藤 花子
    eventType: 'nenkyu',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];
