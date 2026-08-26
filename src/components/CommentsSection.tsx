import React, { useEffect, useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Comment } from '../types';
import { apiFetch } from '../hooks/useDatabaseData';

const AUTHOR_NAME_STORAGE_KEY = 'ongoing-projects.commentAuthorName';

interface CommentsSectionProps {
  projectId: string;
  isDatabaseConnected: boolean;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ projectId, isDatabaseConnected }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState(() => localStorage.getItem(AUTHOR_NAME_STORAGE_KEY) ?? '');
  const [body, setBody] = useState('');

  useEffect(() => {
    setComments([]);
    if (!isDatabaseConnected) return;
    apiFetch<Comment[]>(`/api/projects/${projectId}/comments`).then((data) => {
      if (data) setComments(data);
    });
  }, [projectId, isDatabaseConnected]);

  useEffect(() => {
    localStorage.setItem(AUTHOR_NAME_STORAGE_KEY, authorName);
  }, [authorName]);

  const handleAdd = async () => {
    const trimmedBody = body.trim();
    if (!trimmedBody) return;
    setBody('');

    if (!isDatabaseConnected) {
      const localComment: Comment = {
        id: `comment-${Date.now()}`,
        projectId,
        authorName: authorName.trim() || null,
        body: trimmedBody,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [localComment, ...prev]);
      return;
    }

    const created = await apiFetch<Comment>(`/api/projects/${projectId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: authorName.trim() || null, body: trimmedBody }),
    });
    if (created) setComments((prev) => [created, ...prev]);
  };

  const handleDelete = async (comment: Comment) => {
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    if (!isDatabaseConnected) return;
    await apiFetch(`/api/comments/${comment.id}`, { method: 'DELETE' });
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-gray-700">コメント</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="名前（任意）"
          className="w-28 text-sm border border-gray-300 rounded px-2 py-1"
        />
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="コメントを入力"
          className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
        />
        <button
          onClick={handleAdd}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          送信
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start justify-between gap-2 bg-gray-50 rounded p-2 group">
            <div>
              <div className="text-xs text-gray-500">
                {comment.authorName ?? '匿名'} ・ {formatDateTime(comment.createdAt)}
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">{comment.body}</div>
            </div>
            <button
              onClick={() => handleDelete(comment)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {comments.length === 0 && <p className="text-xs text-gray-400">コメントはまだありません</p>}
      </div>
    </div>
  );
};

export default CommentsSection;
