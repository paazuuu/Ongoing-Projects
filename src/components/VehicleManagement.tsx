import React, { useState } from 'react';
import { Vehicle, VehicleCategory } from '../types';
import { VEHICLE_CATEGORIES, vehicleCategoryLabel, vehicleCategoryColor } from '../utils/vehicles';
import { Plus, Edit3, Trash2, RotateCcw, Search, Car } from 'lucide-react';

interface VehicleManagementProps {
  vehicles: Vehicle[];
  onUpdateVehicles: (vehicles: Vehicle[]) => void;
}

interface DraftVehicle {
  name: string;
  category: VehicleCategory;
  plateNumber: string;
  notes: string;
}

const emptyDraft: DraftVehicle = { name: '', category: 'sales', plateNumber: '', notes: '' };

const VehicleManagement: React.FC<VehicleManagementProps> = ({ vehicles, onUpdateVehicles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [draft, setDraft] = useState<DraftVehicle>(emptyDraft);

  const activeVehicles = vehicles.filter((v) => v.isActive);
  const inactiveVehicles = vehicles.filter((v) => !v.isActive);

  const filtered = (showInactive ? inactiveVehicles : activeVehicles).filter((v) =>
    `${v.name} ${vehicleCategoryLabel(v.category)} ${v.plateNumber ?? ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setDraft(emptyDraft);
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!draft.name.trim()) return;
    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      name: draft.name.trim(),
      category: draft.category,
      plateNumber: draft.plateNumber.trim() || undefined,
      notes: draft.notes.trim() || undefined,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    onUpdateVehicles([...vehicles, newVehicle]);
    resetForm();
  };

  const handleStartEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setShowAddForm(false);
    setDraft({
      name: v.name,
      category: v.category,
      plateNumber: v.plateNumber ?? '',
      notes: v.notes ?? '',
    });
  };

  const handleUpdate = () => {
    if (!editingId || !draft.name.trim()) return;
    const updated = vehicles.map((v) =>
      v.id === editingId
        ? {
            ...v,
            name: draft.name.trim(),
            category: draft.category,
            plateNumber: draft.plateNumber.trim() || undefined,
            notes: draft.notes.trim() || undefined,
            updatedAt: new Date().toISOString(),
          }
        : v
    );
    onUpdateVehicles(updated);
    resetForm();
  };

  const setActive = (id: string, isActive: boolean) => {
    onUpdateVehicles(
      vehicles.map((v) => (v.id === id ? { ...v, isActive, updatedAt: new Date().toISOString() } : v))
    );
  };

  const DraftForm: React.FC<{ mode: 'add' | 'edit' }> = ({ mode }) => (
    <div className={`${mode === 'add' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'} border rounded-lg p-4`}>
      <h3 className="font-medium text-gray-800 mb-3">{mode === 'add' ? '車両を追加' : '車両を編集'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">車両名 *</label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="例: 営業1号車"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">区分</label>
          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value as VehicleCategory })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {VEHICLE_CATEGORIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">車番・ナンバー</label>
          <input
            type="text"
            value={draft.plateNumber}
            onChange={(e) => setDraft({ ...draft, plateNumber: e.target.value })}
            placeholder="例: 大阪 300 あ 12-34"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">メモ</label>
          <input
            type="text"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            placeholder="例: 4名乗車可"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={mode === 'add' ? handleAdd : handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          {mode === 'add' ? '追加' : '更新'}
        </button>
        <button onClick={resetForm} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 text-sm">
          キャンセル
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Car className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">車両管理</h2>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{activeVehicles.length}台</span>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規追加
        </button>
      </div>

      {/* フィルター */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="車両名・区分・車番で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInactive(false)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!showInactive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            稼働中 ({activeVehicles.length})
          </button>
          <button
            onClick={() => setShowInactive(true)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${showInactive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            使用停止 ({inactiveVehicles.length})
          </button>
        </div>
      </div>

      {showAddForm && <DraftForm mode="add" />}
      {editingId && <DraftForm mode="edit" />}

      {/* 一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            className={`bg-white border-2 rounded-lg p-4 transition-all duration-200 ${v.isActive ? 'border-gray-200 hover:border-blue-300 hover:shadow-md' : 'border-red-200 bg-red-50'}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: vehicleCategoryColor(v.category) + '22' }}>
                  <Car className="w-5 h-5" style={{ color: vehicleCategoryColor(v.category) }} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{v.name}</h3>
                  <span
                    className="inline-block text-[11px] px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: vehicleCategoryColor(v.category) }}
                  >
                    {vehicleCategoryLabel(v.category)}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {v.isActive ? (
                  <>
                    <button onClick={() => handleStartEdit(v)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="編集">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setActive(v.id, false)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="使用停止">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => setActive(v.id, true)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="復元">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {v.plateNumber && <p className="text-xs text-gray-600">車番: {v.plateNumber}</p>}
            {v.notes && <p className="text-xs text-gray-500 mt-0.5">{v.notes}</p>}
            {!v.isActive && <div className="text-xs text-red-600 font-medium mt-1">使用停止</div>}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Car className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">
            {searchTerm ? '検索条件に一致する車両が見つかりません' : showInactive ? '使用停止の車両はありません' : '車両がまだ登録されていません'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
