import React, { useEffect, useState } from 'react';
import { Plus, Trash2, CheckSquare } from 'lucide-react';
import { ChecklistItem } from '../types';
import { apiFetch } from '../hooks/useDatabaseData';

interface ChecklistSectionProps {
  projectId: string;
  isDatabaseConnected: boolean;
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ projectId, isDatabaseConnected }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    setItems([]);
    if (!isDatabaseConnected) return;
    apiFetch<ChecklistItem[]>(`/api/projects/${projectId}/checklist`).then((data) => {
      if (data) setItems(data);
    });
  }, [projectId, isDatabaseConnected]);

  const handleAdd = async () => {
    const content = newContent.trim();
    if (!content) return;
    setNewContent('');

    if (!isDatabaseConnected) {
      const localItem: ChecklistItem = {
        id: `checklist-${Date.now()}`,
        projectId,
        content,
        isDone: false,
        sortOrder: items.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setItems((prev) => [...prev, localItem]);
      return;
    }

    const created = await apiFetch<ChecklistItem>(`/api/projects/${projectId}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, sortOrder: items.length }),
    });
    if (created) setItems((prev) => [...prev, created]);
  };

  const handleToggle = async (item: ChecklistItem) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isDone: !i.isDone } : i)));
    if (!isDatabaseConnected) return;
    await apiFetch(`/api/checklist/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDone: !item.isDone }),
    });
  };

  const handleDelete = async (item: ChecklistItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (!isDatabaseConnected) return;
    await apiFetch(`/api/checklist/${item.id}`, { method: 'DELETE' });
  };

  const done = items.filter((i) => i.isDone).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <CheckSquare className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-gray-700">チェックリスト</span>
        {items.length > 0 && (
          <span className="text-sm text-gray-500">
            {done}/{items.length} 完了
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-green-500" style={{ width: `${(done / items.length) * 100}%` }} />
        </div>
      )}

      <div className="space-y-1 mb-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <input type="checkbox" checked={item.isDone} onChange={() => handleToggle(item)} />
            <span className={`flex-1 text-sm ${item.isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {item.content}
            </span>
            <button
              onClick={() => handleDelete(item)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="項目を追加"
          className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
        />
        <button onClick={handleAdd} className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 text-gray-600">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChecklistSection;
