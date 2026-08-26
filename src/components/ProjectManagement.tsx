import React, { useState } from 'react';
import { Member, Project, ConflictAlert, ExternalPartner, Label, ProjectWorkflowStatus, ProjectSaveData, CalendarEvent, EventFormData } from '../types';
import Dashboard from './Dashboard';
import MemberListSidebar from './MemberListSidebar';
import ProjectDetail from './ProjectDetail';
import ProjectForm from './ProjectForm';
import MemberManagement from './MemberManagement';
import MemberDetailView from './MemberDetailView';
import ExternalPartnerManagement from './ExternalPartnerManagement';
import ConflictAlerts from './ConflictAlerts';
import KanbanBoard from './KanbanBoard';
import CalendarView from './CalendarView';
import DebugPanel from './DebugPanel';
import { Plus, Users, FolderOpen, Home, Building2, Trello, CalendarDays } from 'lucide-react';
import { checkScheduleConflicts } from '../utils/conflictChecker';

interface ProjectManagementProps {
  projects: Project[];
  members: Member[];
  externalPartners: ExternalPartner[];
  labels: Label[];
  calendarEvents: CalendarEvent[];
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateMembers: (members: Member[]) => void;
  onUpdateExternalPartners: (partners: ExternalPartner[]) => void;
  onCreateLabel: (name: string, color: string) => void;
  onUpdateLabel: (id: string, updates: { name?: string; color?: string }) => void;
  onDeleteLabel: (id: string) => void;
  onCreateCalendarEvent: (data: EventFormData) => void;
  onUpdateCalendarEvent: (id: string, data: EventFormData) => void;
  onDeleteCalendarEvent: (id: string) => void;
  isDatabaseConnected: boolean;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({
  projects,
  members,
  externalPartners,
  labels,
  calendarEvents,
  onUpdateProjects,
  onUpdateMembers,
  onUpdateExternalPartners,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
  onCreateCalendarEvent,
  onUpdateCalendarEvent,
  onDeleteCalendarEvent,
  isDatabaseConnected,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showMemberManagement, setShowMemberManagement] = useState(false);
  const [showPartnerManagement, setShowPartnerManagement] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showKanbanBoard, setShowKanbanBoard] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>(undefined);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([]);

  const activeProjects = projects.filter(p => p.isActive);
  const activeMembers = members.filter(m => m.isActive);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setShowProjectForm(false);
    setShowMemberManagement(false);
    setShowPartnerManagement(false);
    setShowDashboard(false);
    setShowKanbanBoard(false);
    setShowCalendar(false);
  };

  const handleCreateProject = () => {
    setFormDefaultDate(undefined);
    setSelectedProject(null);
    setSelectedMember(null);
    setShowProjectForm(true);
    setShowMemberManagement(false);
    setShowPartnerManagement(false);
    setShowDashboard(false);
    setShowKanbanBoard(false);
    setShowCalendar(false);
  };

  const handleShowMemberManagement = () => {
    setSelectedProject(null);
    setSelectedMember(null);
    setShowProjectForm(false);
    setShowMemberManagement(true);
    setShowPartnerManagement(false);
    setShowDashboard(false);
    setShowKanbanBoard(false);
    setShowCalendar(false);
  };

  const handleShowPartnerManagement = () => {
    setSelectedProject(null);
    setSelectedMember(null);
    setShowProjectForm(false);
    setShowMemberManagement(false);
    setShowPartnerManagement(true);
    setShowDashboard(false);
    setShowKanbanBoard(false);
    setShowCalendar(false);
  };

  const handleShowDashboard = () => {
    setSelectedProject(null);
    setSelectedMember(null);
    setShowProjectForm(false);
    setShowMemberManagement(false);
    setShowPartnerManagement(false);
    setShowDashboard(true);
    setShowKanbanBoard(false);
    setShowCalendar(false);
  };

  const handleShowKanbanBoard = () => {
    setSelectedProject(null);
    setSelectedMember(null);
    setShowProjectForm(false);
    setShowMemberManagement(false);
    setShowPartnerManagement(false);
    setShowDashboard(false);
    setShowKanbanBoard(true);
    setShowCalendar(false);
  };

  const handleShowCalendar = () => {
    setSelectedProject(null);
    setSelectedMember(null);
    setShowProjectForm(false);
    setShowMemberManagement(false);
    setShowPartnerManagement(false);
    setShowDashboard(false);
    setShowKanbanBoard(false);
    setShowCalendar(true);
  };

  const handleCreateProjectForDate = (date: string) => {
    setFormDefaultDate(date);
    setSelectedProject(null);
    setSelectedMember(null);
    setShowProjectForm(true);
    setShowMemberManagement(false);
    setShowPartnerManagement(false);
    setShowDashboard(false);
    setShowKanbanBoard(false);
    setShowCalendar(false);
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
    
    if (selectedProject) {
      // 更新
      const updatedProjects = projects.map(p =>
        p.id === selectedProject.id
          ? { ...p, ...projectData, updatedAt: now }
          : p
      );
      onUpdateProjects(updatedProjects);
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
      onUpdateProjects([...projects, newProject]);
    }
    
    setShowProjectForm(false);
    setShowDashboard(true);
    setFormDefaultDate(undefined);

    // 競合チェック
    const newConflicts = checkScheduleConflicts(projects, activeMembers);
    setConflicts(newConflicts);
  };

  const handleProjectDelete = (projectId: string) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, isActive: false, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdateProjects(updatedProjects);
    setSelectedProject(null);
  };

  const handleMemberAssignment = (projectId: string, memberIds: string[]) => {
    console.log('🎯 メンバー配置変更:', projectId, memberIds);
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, assignedMembers: memberIds, updatedAt: new Date().toISOString() }
        : p
    );
    console.log('📊 更新されたプロジェクト:', updatedProjects.find(p => p.id === projectId));
    onUpdateProjects(updatedProjects);
    
    // 競合チェック
    const newConflicts = checkScheduleConflicts(updatedProjects, activeMembers);
    setConflicts(newConflicts);
  };

  const handleLeaderAssignment = (projectId: string, leaderId: string | undefined) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, leadMemberId: leaderId, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdateProjects(updatedProjects);
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setSelectedProject(null);
    setShowProjectForm(false);
    setShowMemberManagement(false);
    setShowPartnerManagement(false);
    setShowDashboard(false);
    setShowKanbanBoard(false);
    setShowCalendar(false);
  };

  const handleEditSelectedMember = () => {
    setShowMemberManagement(true);
    // MemberManagementコンポーネントで選択されたメンバーを編集状態にする処理は
    // MemberManagementコンポーネント内で実装する必要があります
  };

  const handleDeleteMember = (memberId: string) => {
    const updatedMembers = members.map(m =>
      m.id === memberId
        ? { ...m, isActive: false, updatedAt: new Date().toISOString() }
        : m
    );
    onUpdateMembers(updatedMembers);
    setSelectedMember(null);
    setShowDashboard(true);
  };

  const handleRestoreMember = (memberId: string) => {
    const updatedMembers = members.map(m =>
      m.id === memberId
        ? { ...m, isActive: true, updatedAt: new Date().toISOString() }
        : m
    );
    onUpdateMembers(updatedMembers);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* サイドバー */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h1 className="text-2xl font-bold mb-4">プロジェクト管理</h1>
          <div className="space-y-2">
            <button
              onClick={handleShowDashboard}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                showDashboard 
                  ? 'bg-white bg-opacity-30 text-white' 
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              ダッシュボード
            </button>
            <button
              onClick={handleCreateProject}
              className="w-full flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200 text-white"
            >
              <Plus className="w-4 h-4" />
              新規プロジェクト
            </button>
            <button
              onClick={handleShowMemberManagement}
              className="w-full flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200 text-white"
            >
              <Users className="w-4 h-4" />
              メンバー管理
            </button>
            <button
              onClick={handleShowPartnerManagement}
              className="w-full flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200 text-white"
            >
              <Building2 className="w-4 h-4" />
              協力業者管理
            </button>
            <button
              onClick={handleShowKanbanBoard}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                showKanbanBoard
                  ? 'bg-white bg-opacity-30 text-white'
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
              }`}
            >
              <Trello className="w-4 h-4" />
              ステータスボード
            </button>
            <button
              onClick={handleShowCalendar}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                showCalendar
                  ? 'bg-white bg-opacity-30 text-white'
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              カレンダー
            </button>
          </div>
        </div>

        {/* 競合アラート */}
        {conflicts.length > 0 && (
          <div className="p-4 border-b">
            <ConflictAlerts conflicts={conflicts} />
          </div>
        )}

        {/* データベース連携状況 */}
        <div className="p-4 border-b text-xs">
          {isDatabaseConnected ? (
            <span className="text-green-600">データベース連携中</span>
          ) : (
            <span className="text-gray-400">モックデータ使用中</span>
          )}
        </div>

        {/* プロジェクト一覧 */}
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
        {showCalendar ? (
          <CalendarView
            projects={activeProjects}
            calendarEvents={calendarEvents}
            onProjectSelect={handleProjectSelect}
            onCreateProjectForDate={handleCreateProjectForDate}
            onCreateEvent={onCreateCalendarEvent}
            onUpdateEvent={onUpdateCalendarEvent}
            onDeleteEvent={onDeleteCalendarEvent}
          />
        ) : showDashboard ? (
          <Dashboard
            projects={activeProjects}
            members={activeMembers}
            externalPartners={externalPartners}
            onProjectSelect={handleProjectSelect}
            onCreateProject={handleCreateProject}
          />
        ) : showKanbanBoard ? (
          <KanbanBoard
            projects={projects}
            members={activeMembers}
            labels={labels}
            conflicts={conflicts}
            onProjectSelect={handleProjectSelect}
            onProjectStatusChange={handleProjectStatusChange}
          />
        ) : showProjectForm ? (
          <div className="flex-1 p-6">
            <ProjectForm
              project={selectedProject}
              externalPartners={externalPartners}
              labels={labels}
              onCreateLabel={onCreateLabel}
              onSave={handleProjectSave}
              onCancel={() => setShowProjectForm(false)}
              defaultDate={formDefaultDate}
            />
          </div>
        ) : showMemberManagement ? (
          <div className="flex-1 p-6">
            <MemberManagement
              members={members}
              onUpdateMembers={onUpdateMembers}
            />
          </div>
        ) : showPartnerManagement ? (
          <div className="flex-1 p-6">
            <ExternalPartnerManagement
              partners={externalPartners}
              onUpdatePartners={onUpdateExternalPartners}
            />
          </div>
        ) : selectedMember ? (
          <div className="flex-1">
            <MemberDetailView
              member={selectedMember}
              projects={activeProjects}
              onEditMember={handleEditSelectedMember}
              onDeleteMember={handleDeleteMember}
              onRestoreMember={handleRestoreMember}
            />
          </div>
        ) : selectedProject ? (
          <div className="flex-1">
            <ProjectDetail
              project={projects.find(p => p.id === selectedProject.id) ?? selectedProject}
              members={activeMembers}
              externalPartners={externalPartners}
              projects={projects}
              labels={labels}
              isDatabaseConnected={isDatabaseConnected}
              onMemberAssignment={handleMemberAssignment}
              onLeaderAssignment={handleLeaderAssignment}
              onUpdateProjects={onUpdateProjects}
              onProjectDelete={handleProjectDelete}
              onEditProject={() => setShowProjectForm(true)}
              onCreateLabel={onCreateLabel}
              conflicts={conflicts}
            />
          </div>
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