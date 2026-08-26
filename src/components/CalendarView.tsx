import React, { useMemo, useState } from 'react';
import { Project, CalendarEvent, CalendarItem, EventFormData } from '../types';
import {
  WEEKDAY_LABELS,
  buildMonthMatrix,
  buildItemsByDate,
  toDateKey,
  todayKey,
  monthTitle,
} from '../utils/calendar';
import EventForm from './EventForm';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, FolderOpen, Clock } from 'lucide-react';

interface CalendarViewProps {
  projects: Project[];
  calendarEvents: CalendarEvent[];
  onProjectSelect: (project: Project) => void;
  onCreateProjectForDate: (date: string) => void;
  onCreateEvent: (data: EventFormData) => void;
  onUpdateEvent: (id: string, data: EventFormData) => void;
  onDeleteEvent: (id: string) => void;
}

const MAX_ITEMS_IN_CELL = 3;

const CalendarView: React.FC<CalendarViewProps> = ({
  projects,
  calendarEvents,
  onProjectSelect,
  onCreateProjectForDate,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const today = todayKey();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-index
  const [selectedDate, setSelectedDate] = useState(today);

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const days = useMemo(() => buildMonthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);
  const itemsByDate = useMemo(
    () => buildItemsByDate(projects, calendarEvents),
    [projects, calendarEvents]
  );

  const selectedItems: CalendarItem[] = itemsByDate.get(selectedDate) ?? [];

  const goPrevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goNextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(today);
  };

  const openNewEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };
  const openEditEvent = (id: string) => {
    const ev = calendarEvents.find((e) => e.id === id) ?? null;
    setEditingEvent(ev);
    setShowEventForm(true);
  };

  const handleItemClick = (item: CalendarItem) => {
    if (item.kind === 'project') {
      const project = projects.find((p) => p.id === item.id);
      if (project) onProjectSelect(project);
    } else {
      openEditEvent(item.id);
    }
  };

  const handleSaveEvent = (data: EventFormData) => {
    if (editingEvent) {
      onUpdateEvent(editingEvent.id, data);
    } else {
      onCreateEvent(data);
    }
    setShowEventForm(false);
    setEditingEvent(null);
    setSelectedDate(data.date);
  };

  const handleDeleteEvent = (id: string) => {
    onDeleteEvent(id);
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
  const selectedDateLabel = `${selectedDateObj.getMonth() + 1}月${selectedDateObj.getDate()}日 (${
    WEEKDAY_LABELS[selectedDateObj.getDay()]
  })`;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* ツールバー */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800 min-w-[9rem]">
            {monthTitle(viewYear, viewMonth)}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goPrevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="前の月"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="次の月"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={goToday}
            className="ml-2 px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
          >
            今日
          </button>
        </div>
        <button
          onClick={openNewEvent}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          予定を追加
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* カレンダーグリッド */}
        <div className="flex-1 flex flex-col min-w-0 p-4">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b">
            {WEEKDAY_LABELS.map((w, i) => (
              <div
                key={w}
                className={`text-center text-sm font-semibold py-2 ${
                  i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-0">
            {days.map((day) => {
              const key = toDateKey(day);
              const items = itemsByDate.get(key) ?? [];
              const inMonth = day.getMonth() === viewMonth;
              const isToday = key === today;
              const isSelected = key === selectedDate;
              const dow = day.getDay();

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`text-left border-b border-r border-gray-100 p-1.5 flex flex-col gap-1 overflow-hidden transition-colors ${
                    isSelected ? 'bg-blue-50 ring-1 ring-inset ring-blue-400' : 'hover:bg-gray-50'
                  } ${inMonth ? '' : 'bg-gray-50/60'}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center justify-center text-sm w-6 h-6 rounded-full ${
                        isToday ? 'bg-blue-600 text-white font-bold' : ''
                      } ${
                        !isToday && dow === 0 ? 'text-red-500' : ''
                      } ${!isToday && dow === 6 ? 'text-blue-500' : ''} ${
                        !inMonth ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    {items.slice(0, MAX_ITEMS_IN_CELL).map((item) => (
                      <div
                        key={`${item.kind}-${item.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="flex items-center gap-1 text-[11px] leading-tight rounded px-1 py-0.5 text-white truncate cursor-pointer hover:opacity-90"
                        style={{ backgroundColor: item.color }}
                        title={`${item.timeLabel} ${item.title}`}
                      >
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                    {items.length > MAX_ITEMS_IN_CELL && (
                      <span className="text-[11px] text-gray-500 px-1">
                        +{items.length - MAX_ITEMS_IN_CELL} 件
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 選択日の詳細パネル */}
        <div className="w-80 border-l bg-gray-50 flex flex-col min-h-0">
          <div className="px-5 py-4 border-b bg-white">
            <p className="text-sm text-gray-500">選択中の日</p>
            <h3 className="text-lg font-bold text-gray-800">{selectedDateLabel}</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {selectedItems.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                <CalendarDays className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">予定はありません</p>
              </div>
            ) : (
              selectedItems.map((item) => (
                <button
                  key={`${item.kind}-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="w-full text-left bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1 w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 truncate">{item.title}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{item.timeLabel}</span>
                        <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {item.kind === 'project' ? (
                            <>
                              <FolderOpen className="w-2.5 h-2.5" />
                              プロジェクト
                            </>
                          ) : (
                            <>
                              <CalendarDays className="w-2.5 h-2.5" />
                              予定
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* アクション */}
          <div className="p-4 border-t bg-white space-y-2">
            <button
              onClick={openNewEvent}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              この日に予定を追加
            </button>
            <button
              onClick={() => onCreateProjectForDate(selectedDate)}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              この日に新規プロジェクト
            </button>
          </div>
        </div>
      </div>

      {showEventForm && (
        <EventForm
          event={editingEvent}
          defaultDate={selectedDate}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default CalendarView;
