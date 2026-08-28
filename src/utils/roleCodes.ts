// 作業/役割の略号（操配表の副セル）
// 既存Excel「操配表」では各セルの隅に、作業内容・車両・役割を表す小さな略号
// （幅・真・プ・河・北・下・W・10t・● 等）が手書き/入力されてきた。
// システムでは案件×作業員ごとの自由入力（memberRoleCodes）とし、
// よく使う略号を候補として提示する（現場ごとに増減するため固定リストにはしない）。

export interface RoleCodePreset {
  code: string;
  hint: string; // 補足（現場で使われがちな意味の一例。厳密な定義ではない）
}

export const ROLE_CODE_PRESETS: RoleCodePreset[] = [
  { code: '幅', hint: '幅員/幅出し' },
  { code: '真', hint: '真値/真芯' },
  { code: 'プ', hint: 'プラント/プレ' },
  { code: '河', hint: '河川' },
  { code: '北', hint: '北工区 等' },
  { code: '下', hint: '下請' },
  { code: 'W', hint: 'Wキャブ' },
  { code: '10t', hint: '10t車' },
  { code: '●', hint: '目印/要確認' },
];
