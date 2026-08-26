import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Label } from '../types';

const COLOR_PALETTE = [
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
  '#0891b2',
];

interface LabelPickerProps {
  labels: Label[];
  selectedLabelIds: string[];
  onToggle: (labelId: string) => void;
  onCreateLabel: (name: string, color: string) => void;
}

const LabelPicker: React.FC<LabelPickerProps> = ({ labels, selectedLabelIds, onToggle, onCreateLabel }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [showNewLabelForm, setShowNewLabelForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(COLOR_PALETTE[0]);

  const selectedLabels = labels.filter((l) => selectedLabelIds.includes(l.id));

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) return;
    onCreateLabel(newLabelName.trim(), newLabelColor);
    setNewLabelName('');
    setNewLabelColor(COLOR_PALETTE[0]);
    setShowNewLabelForm(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1 flex-wrap">
        {selectedLabels.map((label) => (
          <span
            key={label.id}
            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: label.color }}
          >
            {label.name}
          </span>
        ))}
        <button
          onClick={() => setShowPopover((v) => !v)}
          className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          title="ラベルを編集"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {showPopover && (
        <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">ラベル</span>
            <button onClick={() => setShowPopover(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {labels.map((label) => (
              <label key={label.id} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedLabelIds.includes(label.id)}
                  onChange={() => onToggle(label.id)}
                />
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                <span className="text-sm text-gray-700">{label.name}</span>
              </label>
            ))}
            {labels.length === 0 && <p className="text-xs text-gray-400 px-1">ラベルがありません</p>}
          </div>

          {showNewLabelForm ? (
            <div className="mt-3 pt-3 border-t space-y-2">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="ラベル名"
                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              />
              <div className="flex items-center gap-1 flex-wrap">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewLabelColor(color)}
                    className={`w-5 h-5 rounded-full border-2 ${newLabelColor === color ? 'border-gray-800' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNewLabelForm(false)}
                  className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateLabel}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  追加
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewLabelForm(true)}
              className="mt-3 pt-3 border-t w-full flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-3 h-3" />
              新規ラベルを追加
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LabelPicker;
