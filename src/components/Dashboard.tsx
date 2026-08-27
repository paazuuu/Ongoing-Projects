import React, { useState } from 'react';
import { Project, Member, ConflictAlert, ExternalPartner } from '../types';
import { Calendar, Clock, MapPin, Users, AlertTriangle, CheckCircle, Plus, Star, Crown } from 'lucide-react';
import { checkScheduleConflicts } from '../utils/conflictChecker';
import MemberAvatar from './MemberAvatar';
import { workflowStatusLabel, workflowStatusColor } from '../utils/workflowStatus';

interface DashboardProps {
  projects: Project[];
  members: Member[];
  externalPartners: ExternalPartner[];
  onProjectSelect: (project: Project) => void;
  onCreateProject: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  projects,
  members,
  externalPartners,
  onProjectSelect,
  onCreateProject,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const activeProjects = projects.filter(p => p.isActive);
  const activeMembers = members.filter(m => m.isActive);
  
  const todayProjects = activeProjects.filter(p => p.date === today);
  const upcomingProjects = activeProjects.filter(p => p.date > today);
  const pastProjects = activeProjects.filter(p => p.date < today);
  
  const conflicts = checkScheduleConflicts(activeProjects, activeMembers);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '明日';
    if (diffDays === -1) return '昨日';
    if (diffDays > 0) return `${diffDays}日後`;
    if (diffDays < 0) return `${Math.abs(diffDays)}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getProjectStatus = (project: Project) => {
    const totalExternalMembers = project.externalPartners.reduce((sum, assignment) => 
      sum + assignment.memberCount, 0
    );
    const assignedCount = project.assignedMembers.length + totalExternalMembers;
    const requiredCount = project.requiredMembers;
    
    if (assignedCount >= requiredCount) return 'complete';
    if (assignedCount > 0) return 'progress';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-700 border-green-200';
      case 'progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete': return '配置完了';
      case 'progress': return '配置中';
      default: return '未配置';
    }
  };

  const ProjectCard: React.FC<{ project: Project; showDate?: boolean }> = ({ project, showDate = false }) => {
    const status = getProjectStatus(project);
    const assignedMembers = activeMembers.filter(m => project.assignedMembers.includes(m.id));
    const assignedPartners = project.externalPartners.map(assignment => {
      const partner = externalPartners.find(p => p.id === assignment.partnerId);
      return partner ? { ...partner, ...assignment } : null;
    }).filter((partner): partner is NonNullable<typeof partner> => partner !== null);
    const totalExternalMembers = project.externalPartners.reduce((sum, assignment) => 
      sum + assignment.memberCount, 0
    );
    const leadMember = project.leadMemberId ? activeMembers.find(m => m.id === project.leadMemberId) : null;
    const contactMember = project.contactMemberId ? activeMembers.find(m => m.id === project.contactMemberId) : null;
    const hasConflicts = conflicts.some(c => c.conflictingProjects.some(cp => cp === project.name));
    
    return (
      <div
        onClick={() => onProjectSelect(project)}
        className={`
          bg-white rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md
          ${hasConflicts ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'}
        `}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {project.jobNo && (
                <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                  JOB {project.jobNo}
                </span>
              )}
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
            </div>
            {project.customerName && (
              <p className="text-xs text-gray-500 mb-1">顧客: {project.customerName}</p>
            )}
            {showDate && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(project.date)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasConflicts && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${workflowStatusColor(project.workflowStatus)}`}>
              {workflowStatusLabel(project.workflowStatus)}
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{project.workTime.start} - {project.workTime.end}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{project.location}</span>
          </div>
          {(leadMember || contactMember) && (
            <div className="flex items-center gap-3 flex-wrap">
              {leadMember && (
                <span className="flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="truncate">{leadMember.name}</span>
                </span>
              )}
              {contactMember && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span className="truncate">連絡係: {contactMember.name}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {assignedMembers.length + totalExternalMembers} / {project.requiredMembers}名
            </span>
          </div>
          
          <div className="flex items-center gap-1 flex-wrap">
            {/* 担当メンバー（リーダーバッジ付き） */}
            {leadMember && (
              <div className="relative">
                <MemberAvatar member={leadMember} size="sm" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">L</span>
                </div>
              </div>
            )}
            
            {/* その他のメンバー */}
            {assignedMembers
              .filter(m => m.id !== project.leadMemberId)
              .slice(0, 3)
              .map((member) => (
                <MemberAvatar key={member.id} member={member} size="sm" />
              ))}
            
            {/* 協力業者 */}
            {assignedPartners.map((partner) => (
              <div
                key={partner.partnerId}
                className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-medium"
                title={`${partner.name} (${partner.memberCount}名)`}
              >
                外
              </div>
            ))}
            
            {/* 残りの数 */}
            {(assignedMembers.length - (leadMember ? 1 : 0) + totalExternalMembers) > 5 && (
              <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                +{(assignedMembers.length - (leadMember ? 1 : 0) + totalExternalMembers) - 5}
              </div>
            )}
          </div>
        </div>

        {project.workContent && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 line-clamp-2">
            {project.workContent}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>
        <button
          onClick={onCreateProject}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規プロジェクト
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">今日のプロジェクト</p>
              <p className="text-2xl font-bold text-gray-900">{todayProjects.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">配置完了</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeProjects.filter(p => getProjectStatus(p) === 'complete').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">アクティブメンバー</p>
              <p className="text-2xl font-bold text-gray-900">{activeMembers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              conflicts.length > 0 ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                conflicts.length > 0 ? 'text-red-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">競合アラート</p>
              <p className="text-2xl font-bold text-gray-900">{conflicts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 競合アラート */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-red-900">スケジュール競合が検出されました</h3>
          </div>
          <div className="space-y-1">
            {conflicts.slice(0, 3).map((conflict, index) => (
              <p key={index} className="text-sm text-red-700">
                <strong>{conflict.memberName}</strong> が {conflict.date} に複数プロジェクトに配置されています
              </p>
            ))}
            {conflicts.length > 3 && (
              <p className="text-sm text-red-600">他 {conflicts.length - 3} 件の競合があります</p>
            )}
          </div>
        </div>
      )}

      {/* 今日のプロジェクト */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">今日のプロジェクト</h2>
        {todayProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">今日のプロジェクトはありません</p>
          </div>
        )}
      </div>

      {/* 今後のプロジェクト */}
      {upcomingProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">今後のプロジェクト</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingProjects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} showDate />
            ))}
          </div>
          {upcomingProjects.length > 6 && (
            <p className="text-center text-gray-500 mt-4">
              他 {upcomingProjects.length - 6} 件のプロジェクトがあります
            </p>
          )}
        </div>
      )}

      {/* 過去のプロジェクト */}
      {pastProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">過去のプロジェクト</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastProjects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} showDate />
            ))}
          </div>
          {pastProjects.length > 6 && (
            <p className="text-center text-gray-500 mt-4">
              他 {pastProjects.length - 6} 件の過去プロジェクトがあります
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;