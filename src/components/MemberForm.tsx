import React, { useState, useEffect } from 'react';
import { Member, MemberFormData } from '../types';
import { Save, X, Plus, Trash2 } from 'lucide-react';

interface MemberFormProps {
  member: Member | null;
  onSave: (data: MemberFormData) => void;
  onCancel: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ member, onSave, onCancel }) => {
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    team: '',
    qualifications: [],
    availableHoursStart: '08:00',
    availableHoursEnd: '18:00',
    availableAreas: [],
    notes: '',
  });

  const [newQualification, setNewQualification] = useState('');
  const [newArea, setNewArea] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        team: member.team,
        qualifications: [...member.qualifications],
        availableHoursStart: member.availableHours.start,
        availableHoursEnd: member.availableHours.end,
        availableAreas: [...member.availableAreas],
        notes: member.notes,
      });
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof MemberFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addQualification = () => {
    if (newQualification.trim() && !formData.qualifications.includes(newQualification.trim())) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const removeQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const addArea = () => {
    if (newArea.trim() && !formData.availableAreas.includes(newArea.trim())) {
      setFormData(prev => ({
        ...prev,
        availableAreas: [...prev.availableAreas, newArea.trim()]
      }));
      setNewArea('');
    }
  };

  const removeArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availableAreas: prev.availableAreas.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {member ? 'メンバー編集' : '新規メンバー追加'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              氏名 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="例: 山田 太郎"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所属チーム *
            </label>
            <input
              type="text"
              required
              value={formData.team}
              onChange={(e) => handleChange('team', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="例: 東京工事1課 / 土木チーム"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              稼働開始時間 *
            </label>
            <input
              type="time"
              required
              value={formData.availableHoursStart}
              onChange={(e) => handleChange('availableHoursStart', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              稼働終了時間 *
            </label>
            <input
              type="time"
              required
              value={formData.availableHoursEnd}
              onChange={(e) => handleChange('availableHoursEnd', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            保有資格
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="例: 土木施工管理技士 / 電気工事士 / 玉掛け"
              />
              <button
                type="button"
                onClick={addQualification}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.qualifications.map((qualification, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                >
                  <span>{qualification}</span>
                  <button
                    type="button"
                    onClick={() => removeQualification(index)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            稼働エリア
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="例: 東京都"
              />
              <button
                type="button"
                onClick={addArea}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.availableAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                >
                  <span>{area}</span>
                  <button
                    type="button"
                    onClick={() => removeArea(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            備考
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="例: 要宿泊不可、早朝対応可能"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            キャンセル
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            {member ? '更新' : '追加'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;