import React, { useState } from 'react';
import { Member, Project, ConflictAlert, ExternalPartner, Label, ProjectWorkflowStatus, ProjectSaveData, CalendarEvent, EventFormData, Vehicle } from '../types';
import Dashboard from './Dashboard';
import MemberListSidebar from './MemberListSidebar';
import ProjectDetail from './ProjectDetail';
import ProjectForm from './ProjectForm';
import MemberManagement from './MemberManagement';
import MemberDetailView from './MemberDetailView';
import ExternalPartnerManagement from './ExternalPartnerManagement';
import VehicleManagement from './VehicleManagement';
import ConflictAlerts from './ConflictAlerts';
import KanbanBoard from './KanbanBoard';
import CalendarView from './CalendarView';
import MyScheduleView from './MyScheduleView';
import MatrixView from './MatrixView';
import WorkPlanPrintView from './WorkPlanPrintView';
import DebugPanel from './DebugPanel';
import { Plus, Users, FolderOpen, Home, Building2, Trello, CalendarDays, CalendarClock, Car, Grid3x3, Printer, Database } from 'lucide-react';
import { checkScheduleConflicts } from '../utils/conflictChecker';

interface ProjectManagementProps {
  projects: Project[];
  members: Member[];
  externalPartners: ExternalPartner[];
  labels: Label[];
  calendarEvents: CalendarEvent[];
  vehicles: Vehicle[];
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateMembers: (members: Member[]) => void;
  onUpdateExternalPartners: (partners: ExternalPartner[]) => void;
  onUpdateVehicles: (vehicles: Vehicle[]) => void;
  onCreateLabel: (name: string, color: string) => void;
  onUpdateLabel: (id: string, updates: { name?: string; color?: string }) => void;
  onDeleteLabel: (id: string) => void;
  onCreateCalendarEvent: (data: EventFormData) => void;
  onUpdateCalendarEvent: (id: string, data: EventFormData) => void;
  onDeleteCalendarEvent: (id: string) => void;
  isDatabaseConnected: boolean;
}

// 画面（ビュー）を単一の状態で管理。真偽値フラグの取りこぼしによる
// 「2画面同時表示 / 遷移不能」を構造的に防ぐ。
type ViewKey =
  | 'dashboard'
  | 'kanban'
  | 'calendar'
  | 'matrix'
  | 'mySchedule'
  | 'workPlan'
  | 'members'
  | 'partners'
  | 'vehicles'
  | 'projectForm'
  | 'projectDetail'
  | 'memberDetail';

const ProjectManagement: React.FC<ProjectManagementProps> = ({
  projects,
  members,
  externalPartners,
  labels,
  calendarEvents,
  vehicles,
  onUpdateProjects,
  onUpdateMembers,
  onUpdateExternalPartners,
  onUpdateVehicles,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
  onCreateCalendarEvent,
  onUpdateCalendarEvent,
  onDeleteCalendarEvent,
  isDatabaseConnected,
}) => {
  const [view, setView] = useState<ViewKey>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>(undefined);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([]);

  const activeProjects = projects.filter(p => p.isActive);
  const activeMembers = members.filter(m => m.isActive);

  // ナビゲーション（メニュー）: 単一ビューへ切り替え、選択状態はクリア
  const goTo = (next: ViewKey) => {
    setSelectedProject(null);
    setSelectedMember(null);
    setFormDefaultDate(undefined);
    setView(next);
  };

  const handleShowDashboard = () => goTo('dashboard');
  const handleShowMemberManagement = () => goTo('members');
  const handleShowPartnerManagement = () => goTo('partners');
  const handleShowKanbanBoard = () => goTo('kanban');
  const handleShowCalendar = () => goTo('calendar');
  const handleShowMySchedule = () => goTo('mySchedule');
  const handleShowVehicleManagement = () => goTo('vehicles');
  const handleShowMatrix = () => goTo('matrix');
  const handleShowWorkPlan = () => goTo('workPlan');

  const handleCreateProject = () => {
    setSelectedProject(null);
    setSelectedMember(null);
    setFormDefaultDate(undefined);
    setView('projectForm');
  };

  const handleCreateProjectForDate = (date: string) => {
    setSelectedProject(null);
    setSelectedMember(null);
    setFormDefaultDate(date);
    setView('projectForm');
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedMember(null);
    setSelectedProject(project);
    setView('projectDetail');
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedProject(null);
    setSelectedMember(member);
    setView('memberDetail');
  };

  const handleProjectStatusChange = (projectId: string, workflowStatus: ProjectWorkflowStatus) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, workflowStatus, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdateProjects(updatedProjects);
  };

  const handleProjectSave = (projectData: ProjectSaveData) => {
    const now = new Date().toISOString();

    let updatedProjects: Project[];
    if (selectedProject) {
      // 更新
      updatedProjects = projects.map(p =>
        p.id === selectedProject.id
          ? { ...p, ...projectData, updatedAt: now }
          : p
      );
    } else {
      // 新規作成
      const newProject: Project = {
        id: `project-${Date.now()}`,
        ...projectData,
        workflowStatus: 'todo',
        assignedMembers: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      updatedProjects = [...projects, newProject];
    }

    onUpdateProjects(updatedProjects);
    setFormDefaultDate(undefined);
    setView('dashboard');

    // 競合チェック（保存後の最新データで判定）
    setConflicts(checkScheduleConflicts(updatedProjects, activeMembers));
  };

  const handleProjectDelete = (projectId: string) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, isActive: false, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdateProjects(updatedProjects);
    setSelectedProject(null);
    setView('dashboard');
  };

  const handleMemberAssignment = (projectId: string, memberIds: string[]) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, assignedMembers: memberIds, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdateProjects(updatedProjects);

    // 競合チェック
    setConflicts(checkScheduleConflicts(updatedProjects, activeMembers));
  };

  const handleLeaderAssignment = (projectId: string, leaderId: string | undefined) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, leadMemberId: leaderId, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdateProjects(updatedProjects);
  };

  const handleEditSelectedMember = () => {
    // メンバー管理画面へ（個別編集は MemberManagement 内で実施）
    setView('members');
  };

  const handleDeleteMember = (memberId: string) => {
    const updatedMembers = members.map(m =>
      m.id === memberId
        ? { ...m, isActive: false, updatedAt: new Date().toISOString() }
        : m
    );
    onUpdateMembers(updatedMembers);
    setSelectedMember(null);
    setView('dashboard');
  };

  const handleRestoreMember = (memberId: string) => {
    const updatedMembers = members.map(m =>
      m.id === memberId
        ? { ...m, isActive: true, updatedAt: new Date().toISOString() }
        : m
    );
    onUpdateMembers(updatedMembers);
  };

  // ライブデータで最新化した選択中プロジェクト（配置更新などを即反映）
  const liveSelectedProject = selectedProject
    ? projects.find(p => p.id === selectedProject.id) ?? selectedProject
    : null;

  // サイドバーのナビ定義（グループ分けで見やすく）
  const navGroups: { title: string; items: { key: ViewKey; label: string; icon: typeof Home; onClick: () => void; accent?: boolean }[] }[] = [
    {
      title: '俯瞰・進捗',
      items: [
        { key: 'dashboard', label: 'ダッシュボード', icon: Home, onClick: handleShowDashboard },
        { key: 'kanban', label: 'ステータスボード', icon: Trello, onClick: handleShowKanbanBoard },
        { key: 'calendar', label: 'カレンダー', icon: CalendarDays, onClick: handleShowCalendar },
        { key: 'matrix', label: '操配表', icon: Grid3x3, onClick: handleShowMatrix },
      ],
    },
    {
      title: '案件・割り振り',
      items: [
        { key: 'projectForm', label: '新規プロジェクト', icon: Plus, onClick: handleCreateProject, accent: true },
      ],
    },
    {
      title: '個人・出力',
      items: [
        { key: 'mySchedule', label: 'マイスケジュール', icon: CalendarClock, onClick: handleShowMySchedule },
        { key: 'workPlan', label: '作業計画表（印刷）', icon: Printer, onClick: handleShowWorkPlan },
      ],
    },
    {
      title: 'マスタ管理',
      items: [
        { key: 'members', label: 'メンバー管理', icon: Users, onClick: handleShowMemberManagement },
        { key: 'partners', label: '協力業者管理', icon: Building2, onClick: handleShowPartnerManagement },
        { key: 'vehicles', label: '車両管理', icon: Car, onClick: handleShowVehicleManagement },
      ],
    },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* サイドバー */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h1 className="text-lg font-bold leading-tight">工事・請負プロジェクト管理</h1>
          <p className="text-xs text-blue-100 mt-1">案件づくり・人員割り振り・進捗の見える化</p>
        </div>

        {/* ナビゲーション */}
        <nav className="p-3 space-y-4 border-b overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = view === item.key;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={item.onClick}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : item.accent
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* 競合アラート */}
        {conflicts.length > 0 && (
          <div className="p-4 border-b">
            <ConflictAlerts conflicts={conflicts} />
          </div>
        )}

        {/* データベース連携状況 */}
        <div className="px-4 py-2.5 border-b text-xs flex items-center gap-1.5">
          <Database className={`w-3.5 h-3.5 ${isDatabaseConnected ? 'text-green-600' : 'text-gray-400'}`} />
          {isDatabaseConnected ? (
            <span className="text-green-600 font-medium">データベース連携中</span>
          ) : (
            <span className="text-gray-400">モックデータ使用中</span>
          )}
        </div>

        {/* メンバー一覧 */}
        <div className="flex-1 overflow-y-auto">
          <MemberListSidebar
            members={activeMembers}
            projects={activeProjects}
            onMemberClick={handleMemberSelect}
            selectedMember={selectedMember}
          />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {view === 'workPlan' ? (
          <WorkPlanPrintView
            projects={activeProjects}
            members={activeMembers}
            externalPartners={externalPartners}
            vehicles={vehicles}
            calendarEvents={calendarEvents}
          />
        ) : view === 'matrix' ? (
          <MatrixView
            projects={activeProjects}
            members={activeMembers}
            calendarEvents={calendarEvents}
            onProjectSelect={handleProjectSelect}
          />
        ) : view === 'vehicles' ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <VehicleManagement vehicles={vehicles} onUpdateVehicles={onUpdateVehicles} />
          </div>
        ) : view === 'mySchedule' ? (
          <MyScheduleView
            projects={activeProjects}
            members={activeMembers}
            calendarEvents={calendarEvents}
            onProjectSelect={handleProjectSelect}
          />
        ) : view === 'calendar' ? (
          <CalendarView
            projects={activeProjects}
            members={activeMembers}
            calendarEvents={calendarEvents}
            onProjectSelect={handleProjectSelect}
            onCreateProjectForDate={handleCreateProjectForDate}
            onCreateEvent={onCreateCalendarEvent}
            onUpdateEvent={onUpdateCalendarEvent}
            onDeleteEvent={onDeleteCalendarEvent}
          />
        ) : view === 'kanban' ? (
          <KanbanBoard
            projects={projects}
            members={activeMembers}
            labels={labels}
            conflicts={conflicts}
            onProjectSelect={handleProjectSelect}
            onProjectStatusChange={handleProjectStatusChange}
          />
        ) : view === 'projectForm' ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <ProjectForm
              project={liveSelectedProject}
              externalPartners={externalPartners}
              labels={labels}
              onCreateLabel={onCreateLabel}
              onSave={handleProjectSave}
              onCancel={() => setView(selectedProject ? 'projectDetail' : 'dashboard')}
              defaultDate={formDefaultDate}
            />
          </div>
        ) : view === 'members' ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <MemberManagement
              members={members}
              onUpdateMembers={onUpdateMembers}
            />
          </div>
        ) : view === 'partners' ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <ExternalPartnerManagement
              partners={externalPartners}
              onUpdatePartners={onUpdateExternalPartners}
            />
          </div>
        ) : view === 'memberDetail' && selectedMember ? (
          <div className="flex-1">
            <MemberDetailView
              member={selectedMember}
              projects={activeProjects}
              onEditMember={handleEditSelectedMember}
              onDeleteMember={handleDeleteMember}
              onRestoreMember={handleRestoreMember}
            />
          </div>
        ) : view === 'projectDetail' && liveSelectedProject ? (
          <div className="flex-1">
            <ProjectDetail
              project={liveSelectedProject}
              members={activeMembers}
              externalPartners={externalPartners}
              projects={projects}
              labels={labels}
              calendarEvents={calendarEvents}
              vehicles={vehicles}
              isDatabaseConnected={isDatabaseConnected}
              onMemberAssignment={handleMemberAssignment}
              onLeaderAssignment={handleLeaderAssignment}
              onUpdateProjects={onUpdateProjects}
              onProjectDelete={handleProjectDelete}
              onEditProject={() => setView('projectForm')}
              onCreateLabel={onCreateLabel}
              conflicts={conflicts}
            />
          </div>
        ) : view === 'dashboard' ? (
          <Dashboard
            projects={activeProjects}
            members={activeMembers}
            externalPartners={externalPartners}
            onProjectSelect={handleProjectSelect}
            onCreateProject={handleCreateProject}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">プロジェクトを選択してください</h2>
              <p className="text-gray-400">
                左側のリストからプロジェクトを選択するか、<br />
                新規プロジェクトを作成してください
              </p>
            </div>
          </div>
        )}
      </div>

      {/* デバッグパネル */}
      <DebugPanel
        projects={projects}
        members={members}
        isDatabaseConnected={isDatabaseConnected}
      />
    </div>
  );
};

export default ProjectManagement;
