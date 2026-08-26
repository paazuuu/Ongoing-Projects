import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventFormData, Member } from '../types';
import { EVENT_COLORS } from '../utils/calendar';
import { X, Save, Trash2, Clock, Users } from 'lucide-react';

interface EventFormProps {
  event: CalendarEvent | null; // null=新規
  defaultDate: string; // 新規時の初期日付
  members: Member[];
  onSave: (data: EventFormData) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, defaultDate, members, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: defaultDate,
    isAllDay: true,
    startTime: '09:00',
    endTime: '10:00',
    color: EVENT_COLORS[2].value, // グリーン
    memo: '',
    memberIds: [],
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        date: event.date,
        isAllDay: event.isAllDay,
        startTime: event.startTime ?? '09:00',
        endTime: event.endTime ?? '10:00',
        color: event.color,
        memo: event.memo,
        memberIds: event.memberIds ?? [],
      });
    } else {
      setFormData((prev) => ({ ...prev, date: defaultDate }));
    }
  }, [event, defaultDate]);

  const toggleMember = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...prev.memberIds, memberId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          className="flex items-center justify-between px-5 py-4 rounded-t-2xl text-white"
          style={{ backgroundColor: formData.color }}
        >
          <h2 className="text-lg font-bold">{event ? '予定を編集' : '予定を追加'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <input
              type="text"
              autoFocus
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="予定のタイトル"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 日付 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 終日トグル */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isAllDay}
              onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">終日</span>
          </label>

          {/* 時刻（終日でない場合） */}
          {!formData.isAllDay && (
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-400">〜</span>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* カラー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カラー</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c.value })}
                  title={c.label}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    formData.color === c.value ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* 対象の作業員（ひも付け） */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 text-gray-400" />
              対象の作業員
            </label>
            <p className="text-xs text-gray-400 mb-2">
              選ぶと、その人はこの日に他案件へ割り当てできなくなります（未選択＝全体の予定）
            </p>
            <div className="flex flex-wrap gap-2">
              {members.length === 0 && (
                <span className="text-xs text-gray-400">登録された作業員がいません</span>
              )}
              {members.map((m) => {
                const selected = formData.memberIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMember(m.id)}
                    className={`text-sm px-2.5 py-1 rounded-full border transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              rows={3}
              placeholder="補足・詳細など"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* アクション */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
            {event && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(event.id)}
                className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
