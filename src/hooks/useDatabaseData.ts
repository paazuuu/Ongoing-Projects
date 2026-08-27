import { useState, useEffect } from 'react';
import { Member, Project, ExternalPartner, Label, CalendarEvent, EventFormData } from '../types';
import { mockMembers, mockProjects, mockExternalPartners, mockLabels, mockCalendarEvents } from '../data/mockData';

const EVENTS_STORAGE_KEY = 'calendar-events';

const loadStoredEvents = (): CalendarEvent[] => {
  if (typeof window === 'undefined') return mockCalendarEvents;
  try {
    const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return mockCalendarEvents;
    const parsed = JSON.parse(raw) as CalendarEvent[];
    if (!Array.isArray(parsed)) return mockCalendarEvents;
    // 旧データに memberIds が無い場合を補完
    return parsed.map((ev) => ({ ...ev, memberIds: ev.memberIds ?? [] }));
  } catch {
    return mockCalendarEvents;
  }
};

const persistEvents = (events: CalendarEvent[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch {
    // localStorage が使えない環境では黙って無視
  }
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T | null> => {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) return null;
  const envelope: ApiEnvelope<T> = await response.json();
  return envelope.success ? envelope.data : null;
};

export const useDatabaseData = () => {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [externalPartners, setExternalPartners] = useState<ExternalPartner[]>(mockExternalPartners);
  const [labels, setLabels] = useState<Label[]>(mockLabels);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(loadStoredEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);

  // データベース接続状態をチェック
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const isConnected = response.ok;
        setIsDatabaseConnected(isConnected);
        if (isConnected) {
          loadData();
        }
      } catch (error) {
        console.log('データベース接続なし、モックデータを使用します');
        setIsDatabaseConnected(false);
      }
    };

    checkConnection();
  }, []);

  // データ読み込み
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [membersData, projectsData, partnersData, labelsData, eventsData] = await Promise.all([
        apiFetch<Member[]>('/api/members'),
        apiFetch<Project[]>('/api/projects'),
        apiFetch<ExternalPartner[]>('/api/external-partners'),
        apiFetch<Label[]>('/api/labels'),
        apiFetch<CalendarEvent[]>('/api/calendar-events'),
      ]);

      if (membersData) setMembers(membersData);
      if (projectsData) setProjects(projectsData);
      if (partnersData) setExternalPartners(partnersData);
      if (labelsData) setLabels(labelsData);
      if (eventsData) setCalendarEvents(eventsData);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      // エラーが発生した場合はモックデータを継続使用
    } finally {
      setIsLoading(false);
    }
  };

  // メンバー更新
  const updateMembers = async (updatedMembers: Member[]) => {
    setMembers(updatedMembers);

    if (!isDatabaseConnected) return;

    try {
      for (const member of updatedMembers) {
        await apiFetch('/api/members', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(member),
        });
      }
    } catch (error) {
      console.error('メンバー更新エラー:', error);
    }
  };

  // プロジェクト更新
  const updateProjects = async (updatedProjects: Project[]) => {
    setProjects(updatedProjects);

    if (!isDatabaseConnected) return;

    try {
      for (const project of updatedProjects) {
        await apiFetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project),
        });
      }
    } catch (error) {
      console.error('プロジェクト更新エラー:', error);
      throw error;
    }
  };

  // 協力業者更新
  const updateExternalPartners = async (updatedPartners: ExternalPartner[]) => {
    setExternalPartners(updatedPartners);

    if (!isDatabaseConnected) return;

    try {
      for (const partner of updatedPartners) {
        await apiFetch('/api/external-partners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partner),
        });
      }
    } catch (error) {
      console.error('協力業者更新エラー:', error);
    }
  };

  // ラベル作成
  const createLabel = async (name: string, color: string) => {
    if (!isDatabaseConnected) {
      const newLabel: Label = { id: `label-${Date.now()}`, name, color, createdAt: new Date().toISOString() };
      setLabels((prev) => [...prev, newLabel]);
      return newLabel;
    }

    const created = await apiFetch<Label>('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (created) setLabels((prev) => [...prev, created]);
    return created;
  };

  // ラベル更新
  const updateLabel = async (id: string, updates: { name?: string; color?: string }) => {
    setLabels((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));

    if (!isDatabaseConnected) return;

    await apiFetch<Label>(`/api/labels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  };

  // ラベル削除
  const deleteLabel = async (id: string) => {
    setLabels((prev) => prev.filter((l) => l.id !== id));
    setProjects((prev) => prev.map((p) => ({ ...p, labelIds: p.labelIds.filter((labelId) => labelId !== id) })));

    if (!isDatabaseConnected) return;

    await apiFetch(`/api/labels/${id}`, { method: 'DELETE' });
  };

  // カレンダー予定の永続化（DB接続時はAPI、未接続時はlocalStorage）
  const commitEvents = (updater: (prev: CalendarEvent[]) => CalendarEvent[]) => {
    setCalendarEvents((prev) => {
      const next = updater(prev);
      persistEvents(next);
      return next;
    });
  };

  // 予定作成
  const createCalendarEvent = async (data: EventFormData): Promise<CalendarEvent> => {
    const now = new Date().toISOString();
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: data.title,
      date: data.date,
      isAllDay: data.isAllDay,
      startTime: data.isAllDay ? undefined : data.startTime,
      endTime: data.isAllDay ? undefined : data.endTime,
      color: data.color,
      memo: data.memo,
      memberIds: data.memberIds,
      eventType: data.eventType || undefined,
      createdAt: now,
      updatedAt: now,
    };
    commitEvents((prev) => [...prev, newEvent]);

    if (isDatabaseConnected) {
      await apiFetch('/api/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
    }
    return newEvent;
  };

  // 予定更新
  const updateCalendarEvent = async (id: string, data: EventFormData) => {
    const now = new Date().toISOString();
    commitEvents((prev) =>
      prev.map((ev) =>
        ev.id === id
          ? {
              ...ev,
              title: data.title,
              date: data.date,
              isAllDay: data.isAllDay,
              startTime: data.isAllDay ? undefined : data.startTime,
              endTime: data.isAllDay ? undefined : data.endTime,
              color: data.color,
              memo: data.memo,
              memberIds: data.memberIds,
              eventType: data.eventType || undefined,
              updatedAt: now,
            }
          : ev
      )
    );

    if (isDatabaseConnected) {
      await apiFetch(`/api/calendar-events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, updatedAt: now }),
      });
    }
  };

  // 予定削除
  const deleteCalendarEvent = async (id: string) => {
    commitEvents((prev) => prev.filter((ev) => ev.id !== id));

    if (isDatabaseConnected) {
      await apiFetch(`/api/calendar-events/${id}`, { method: 'DELETE' });
    }
  };

  return {
    members,
    projects,
    externalPartners,
    labels,
    calendarEvents,
    isLoading,
    isDatabaseConnected,
    updateMembers,
    updateProjects,
    updateExternalPartners,
    createLabel,
    updateLabel,
    deleteLabel,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    loadData,
  };
};
