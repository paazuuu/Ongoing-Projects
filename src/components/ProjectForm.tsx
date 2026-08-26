import React, { useState, useEffect } from 'react';
import { Project, ProjectFormData, ProjectSaveData, ExternalPartner, ExternalPartnerAssignment, Label } from '../types';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import LabelPicker from './LabelPicker';
import { priorityColor } from '../utils/workflowStatus';

interface ProjectFormProps {
  project: Project | null;
  externalPartners: ExternalPartner[];
  labels: Label[];
  onCreateLabel: (name: string, color: string) => void;
  onSave: (data: ProjectSaveData) => void;
  onCancel: () => void;
  defaultDate?: string; // カレンダーから新規作成する際の初期日付
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, externalPartners, labels, onCreateLabel, onSave, onCancel, defaultDate }) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    date: defaultDate ?? '',
    workTimeStart: '09:00',
    workTimeEnd: '17:00',
    location: '',
    workContent: '',
    requiredMembers: 1,
    notes: '',
    priority: 'medium',
    labelIds: [],
  });

  const [partnerAssignments, setPartnerAssignments] = useState<ExternalPartnerAssignment[]>([]);
  const [showNewPartnerForm, setShowNewPartnerForm] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        date: project.date,
        workTimeStart: project.workTime.start,
        workTimeEnd: project.workTime.end,
        location: project.location,
        workContent: project.workContent,
        requiredMembers: project.requiredMembers,
        notes: project.notes,
        priority: project.priority,
        labelIds: project.labelIds,
      });
      setPartnerAssignments(project.externalPartners || []);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      name: formData.name,
      date: formData.date,
      workTime: {
        start: formData.workTimeStart,
        end: formData.workTimeEnd,
      },
      location: formData.location,
      workContent: formData.workContent,
      requiredMembers: formData.requiredMembers,
      notes: formData.notes,
      priority: formData.priority,
      labelIds: formData.labelIds,
      externalPartners: partnerAssignments,
      leadMemberId: project?.leadMemberId,
    };

    onSave(projectData);
  };

  const handleChange = (field: keyof ProjectFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLabelToggle = (labelId: string) => {
    setFormData(prev => ({
      ...prev,
      labelIds: prev.labelIds.includes(labelId)
        ? prev.labelIds.filter(id => id !== labelId)
        : [...prev.labelIds, labelId],
    }));
  };

  const handleAddPartner = (partnerId: string) => {
    if (!partnerAssignments.find(p => p.partnerId === partnerId)) {
      setPartnerAssignments(prev => [...prev, {
        partnerId,
        memberCount: 1,
        representativeName: ''
      }]);
    }
  };

  const handleRemovePartner = (partnerId: string) => {
    setPartnerAssignments(prev => prev.filter(p => p.partnerId !== partnerId));
  };

  const handlePartnerUpdate = (partnerId: string, field: 'memberCount' | 'representativeName', value: number | string) => {
    setPartnerAssignments(prev => prev.map(p => 
      p.partnerId === partnerId ? { ...p, [field]: value } : p
    ));
  };

  const availablePartners = externalPartners.filter(p => 
    p.isActive && !partnerAssignments.find(pa => pa.partnerId === p.id)
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'プロジェクト編集' : '新規プロジェクト作成'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プロジェクト名 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: ○○ビル新築工事 / A社定期点検"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                実施日 *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                必要人数 *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.requiredMembers}
                onChange={(e) => handleChange('requiredMembers', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開始時間 *
              </label>
              <input
                type="time"
                required
                value={formData.workTimeStart}
                onChange={(e) => handleChange('workTimeStart', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                終了時間 *
              </label>
              <input
                type="time"
                required
                value={formData.workTimeEnd}
                onChange={(e) => handleChange('workTimeEnd', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                優先度
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${priorityColor(formData.priority)}`}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ラベル
              </label>
              <LabelPicker
                labels={labels}
                selectedLabelIds={formData.labelIds}
                onToggle={handleLabelToggle}
                onCreateLabel={onCreateLabel}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作業場所 *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: 東京都中央区"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作業内容
            </label>
            <textarea
              value={formData.workContent}
              onChange={(e) => handleChange('workContent', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: 基礎コンクリート打設 / 内装解体・撤去 / 設備点検"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備考
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: 安全靴必須、屋内作業"
            />
          </div>

          {/* 協力業者設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              協力業者設定
            </label>
            
            {/* 配置済み協力業者 */}
            {partnerAssignments.length > 0 && (
              <div className="space-y-3 mb-4">
                {partnerAssignments.map((assignment) => {
                  const partner = externalPartners.find(p => p.id === assignment.partnerId);
                  return (
                    <div key={assignment.partnerId} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-orange-900">{partner?.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePartner(assignment.partnerId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-orange-700 mb-1">人数</label>
                          <input
                            type="number"
                            min="1"
                            value={assignment.memberCount}
                            onChange={(e) => handlePartnerUpdate(assignment.partnerId, 'memberCount', parseInt(e.target.value) || 1)}
                            className="w-full border border-orange-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-orange-700 mb-1">代表者名</label>
                          <input
                            type="text"
                            value={assignment.representativeName}
                            onChange={(e) => handlePartnerUpdate(assignment.partnerId, 'representativeName', e.target.value)}
                            className="w-full border border-orange-300 rounded px-2 py-1 text-sm"
                            placeholder="代表者名"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 協力業者追加 */}
            <div className="space-y-2">
              {availablePartners.length > 0 && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">既存の協力業者から選択</label>
                  <select
                    onChange={(e) => e.target.value && handleAddPartner(e.target.value)}
                    value=""
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">協力業者を選択...</option>
                    {availablePartners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <button
                  type="button"
                  onClick={() => setShowNewPartnerForm(!showNewPartnerForm)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  新規協力業者を追加
                </button>
                
                {showNewPartnerForm && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                    <input
                      type="text"
                      value={newPartnerName}
                      onChange={(e) => setNewPartnerName(e.target.value)}
                      placeholder="新規協力業者名"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (newPartnerName.trim()) {
                            // 新規協力業者を追加する処理（親コンポーネントで実装）
                            setNewPartnerName('');
                            setShowNewPartnerForm(false);
                          }
                        }}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        追加
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewPartnerForm(false);
                          setNewPartnerName('');
                        }}
                        className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {project ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;