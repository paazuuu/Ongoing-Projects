# 既存Excel 項目台帳 → システム対応表

現場で使われてきた運用Excel 2種の全項目を洗い出し、本システム（工事・請負プロジェクト管理）
への対応状況を整理したもの。**システム改善時にここの欄を落とさない**ための基準。

- ビジュアル版（リファレンス）: https://claude.ai/code/artifact/f2b57250-6a64-410a-bdf2-f9d16cb0a70e

## 1. 操配表（.xls）= 月間 作業員×日 マトリクス（俯瞰）

- 単位: 1シート=1ヶ月
- 行: 作業員（協力会社所属は「氏名（会社名）」形式で混在）
- 列: 日付＋曜日
- セル（主）: その日の現場/顧客 または勤怠
- セル（副・小）: 作業/車両/役割の略号（幅・真・プ・河・北・下・W・10t・● 等）

### 勤怠・状態の語彙（現場で使い分けられている区別）
休み / 絶対休み / 全休 / 年休 / PM年休 / 病欠 / 病院 / 現地休 / 褒賞休暇 /
振休 / 始業式 / 三役会議 / 操配会議 / コロナ / 研修・添乗指導 / リモート /
段取り / 移動・移動W・移動S / 待機 / 片付け / 職場全体

## 2. 作業計画（予定）表（.xlsx）= 日次 JOB別 配車・配員計画（作業管理）

- 単位: 曜日別シート＋計画印刷日、1行=1JOB

| 大項目 | 欄 |
|---|---|
| 基本 | JOB No. / 顧客名 / 現場名 / 営業担当 / 発注形態 / 作業内容 |
| 社有戦力（自店）×3枠 | 車両 / 社員 / 始 / 終 |
| 機動 | 機動 / 備考 |
| 社外作業戦力 – 下請×2枠 | 業者 / 数 / 始 / 終 |
| 社外作業戦力 – 傭車 | 社名 / 車番 / 数 / 始 / 終 / 氏名 / 車種 |
| 車両手配 | 作業出張 / 営業車 / 連絡車 / Wキャブ / レンタカー |

## 3. システム対応状況（✓=対応 / △=一部 / ✗=未対応）

| Excelの欄 | 現システムでの持ち方 | 状態 |
|---|---|---|
| 現場名 / 作業内容 / 所在地 | Project.name / workContent / location | ✓ |
| 作業日・期間 | Project.date / endDate | ✓ |
| 作業時間（全体） | Project.workTime | ✓ |
| 配員（社員） | Project.assignedMembers（空き状況で二重配置防止） | ✓ |
| リーダー / 連絡係 | leadMemberId / contactMemberId | ✓ |
| 備考 | Project.notes | ✓ |
| 下請（業者・数・始/終） | ExternalPartnerAssignment.kind='subcontractor' + memberCount/representativeName/startTime/endTime | ✓ |
| 傭車（社名・車番・車種・氏名・数・始/終） | ExternalPartnerAssignment.kind='hired_vehicle' + vehicleNumber/vehicleType/representativeName(氏名)/memberCount/start/end | ✓ |
| 勤怠・休暇（年休・病欠・振休・研修・会議・段取り・移動…） | CalendarEvent.eventType（utils/eventTypes.ts）＋作業員ひも付け。占有種別は空き判定に連動 | ✓ |
| JOB No. | Project.jobNo | ✓ |
| 顧客名 | Project.customerName | ✓ |
| 営業担当 | Project.salesRep | ✓ |
| 発注形態 | Project.orderType | ✓ |
| 作業員ごとの始/終 | —（現状は案件全体で1つの時間） | ✗ |
| 社有車両（営業車/連絡車/Wキャブ/レンタカー/機動） | —（傭車は対応済） | ✗ |
| 月間 作業員×日 の俯瞰マトリクス | — | ✗ |
| 作業/役割の略号（副セル） | — | ✗ |

## 4. 残りロードマップ

- Phase 1: Project に JOB No. / 顧客名 / 営業担当 / 発注形態 を追加 — **実装済**
- Phase 2: 勤怠・休暇の種別 — **実装済**（utils/eventTypes.ts）
- Phase 3: 配員ごとの始/終 ＋ 社有車両マスタ/割当（傭車は実装済）
- Phase 4: 下請・傭車の精緻化 — **実装済**
- Phase 5: 操配マトリクス（作業員×日の月間俯瞰ビュー）

## 実装メモ
- 勤怠種別: `src/utils/eventTypes.ts` の `EVENT_TYPES`。`blocks:true` の種別は
  `getMemberAvailability`（`src/utils/availability.ts`）でその日を割当不可にする。
- 下請/傭車: `ExternalPartnerAssignment`（`src/types/index.ts`）に kind / start・endTime /
  vehicleNumber / vehicleType を追加。入力は `ProjectForm`、表示は `ProjectDetail`。
