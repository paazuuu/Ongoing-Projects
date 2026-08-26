import React from 'react';
import { Member, Label } from '../types';
import { ProjectFilterState, isFilterActive } from '../utils/projectFilter';
import { priorityLabel } from '../utils/workflowStatus';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface ProjectFilterBarProps {
  members: Member[];
  labels: Label[];
  filter: ProjectFilterState;
  onChange: (filter: ProjectFilterState) => void;
  resultCount?: number;
}

const selectClass =
  'text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const ProjectFilterBar: React.FC<ProjectFilterBarProps> = ({
  members,
  labels,
  filter,
  onChange,
  resultCount,
}) => {
  const active = isFilterActive(filter);

  const set = (patch: Partial<ProjectFilterState>) => onChange({ ...filter, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center gap-1 text-gray-500 text-sm">
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">絞り込み</span>
      </div>

      {/* キーワード */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filter.keyword}
          onChange={(e) => set({ keyword: e.target.value })}
          placeholder="案件名・場所・内容"
          className="text-sm border border-gray-300 rounded-lg pl-8 pr-2 py-1.5 w-44 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 担当者 */}
      <select
        value={filter.memberId}
        onChange={(e) => set({ memberId: e.target.value })}
        className={selectClass}
        aria-label="担当者で絞り込み"
      >
        <option value="">担当者：全員</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {/* 優先度 */}
      <select
        value={filter.priority}
        onChange={(e) => set({ priority: e.target.value as ProjectFilterState['priority'] })}
        className={selectClass}
        aria-label="優先度で絞り込み"
      >
        <option value="">優先度：すべて</option>
        <option value="high">{priorityLabel('high')}</option>
        <option value="medium">{priorityLabel('medium')}</option>
        <option value="low">{priorityLabel('low')}</option>
      </select>

      {/* ラベル */}
      <select
        value={filter.labelId}
        onChange={(e) => set({ labelId: e.target.value })}
        className={selectClass}
        aria-label="ラベルで絞り込み"
      >
        <option value="">ラベル：すべて</option>
        {labels.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>

      {active && (
        <button
          onClick={() => onChange({ memberId: '', priority: '', labelId: '', keyword: '' })}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          クリア
        </button>
      )}

      {typeof resultCount === 'number' && (
        <span className="text-sm text-gray-500 ml-auto">{resultCount} 件</span>
      )}
    </div>
  );
};

export default ProjectFilterBar;
