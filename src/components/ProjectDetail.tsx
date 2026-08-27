import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Project, Member, ConflictAlert, ExternalPartner, Label, ProjectPriority, CalendarEvent, Vehicle } from '../types';
import { vehicleCategoryLabel, vehicleCategoryColor } from '../utils/vehicles';
import MemberDetailModal from './MemberDetailModal';
import MemberAvatar from './MemberAvatar';
import LabelPicker from './LabelPicker';
import ChecklistSection from './ChecklistSection';
import CommentsSection from './CommentsSection';
import { WORKFLOW_STATUSES, workflowStatusLabel, workflowStatusColor, priorityColor } from '../utils/workflowStatus';
import { getMemberAvailability, projectDateRange, formatDateRange } from '../utils/availability';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Users,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Crown,
  Star,
  Ban,
  Award,
  Car,
  Plus,
  X
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  members: Member[];
  externalPartners: ExternalPartner[];
  projects: Project[];
  labels: Label[];
  calendarEvents: CalendarEvent[];
  vehicles: Vehicle[];
  isDatabaseConnected: boolean;
  onMemberAssignment: (projectId: string, memberIds: string[]) => void;
  onLeaderAssignment: (projectId: string, leaderId: string | undefined) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onProjectDelete: (projectId: string) => void;
  onEditProject: () => void;
  onCreateLabel: (name: string, color: string) => void;
  conflicts: ConflictAlert[];
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  members,
  externalPartners,
  projects,
  labels,
  calendarEvents,
  vehicles,
  isDatabaseConnected,
  onMemberAssignment,
  onLeaderAssignment,
  onUpdateProjects,
  onProjectDelete,
  onEditProject,
  onCreateLabel,
  conflicts,
}) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [replacementData, setReplacementData] = useState<{
    newMemberId: string;
    assignedMembers: Member[];
  } | null>(null);

  const assignedMembers = members.filter(m => project.assignedMembers.includes(m.id));
  const availableMembers = members.filter(m => !project.assignedMembers.includes(m.id));
  const leadMember = project.leadMemberId ? members.find(m => m.id === project.leadMemberId) : null;
  const contactMember = project.contactMemberId ? members.find(m => m.id === project.contactMemberId) : null;

  // この日程での各作業員の空き状況（他案件と日程が重なるかで判定）
  const availabilityByMember = new Map(
    members.map((m) => [m.id, getMemberAvailability(m, project, projects, calendarEvents)])
  );
  const isMemberAvailable = (memberId: string) =>
    availabilityByMember.get(memberId)?.available ?? true;
  // 未配置の作業員を「空き」と「他案件と重複＝割当不可」に分ける
  const freeMembers = availableMembers.filter((m) => isMemberAvailable(m.id));
  const busyMembers = availableMembers.filter((m) => !isMemberAvailable(m.id));
  const range = projectDateRange(project);
  const rangeLabel = formatDateRange(range.start, range.end);
  
  const assignedPartners = project.externalPartners.map(assignment => {
    const partner = externalPartners.find(p => p.id === assignment.partnerId);
    return partner ? { ...partner, ...assignment } : null;
  }).filter((partner): partner is NonNullable<typeof partner> => partner !== null);

  const totalExternalMembers = project.externalPartners.reduce((sum, assignment) => 
    sum + assignment.memberCount, 0
  );

  const hasConflicts = conflicts.some(c => 
    c.conflictingProjects.some(cp => cp === project.name)
  );

  const handleMemberAdd = (memberId: string) => {
    // この日程で他案件と重なる作業員は割り当て不可
    if (!isMemberAvailable(memberId)) {
      console.log('🚫 日程重複のため割当不可:', memberId);
      return;
    }
    console.log('👤 メンバー追加:', memberId, 'プロジェクト:', project.name);
    const newAssignedMembers = [...new Set([...project.assignedMembers, memberId])];
    console.log('📋 新しい配置リスト:', newAssignedMembers);
    setHasUnsavedChanges(true);
    onMemberAssignment(project.id, newAssignedMembers);
  };

  const handleMemberRemove = (memberId: string) => {
    console.log('👤 メンバー削除:', memberId, 'プロジェクト:', project.name);
    const newAssignedMembers = project.assignedMembers.filter(id => id !== memberId);
    console.log('📋 新しい配置リスト:', newAssignedMembers);
    setHasUnsavedChanges(true);
    onMemberAssignment(project.id, newAssignedMembers);
    
    // 担当メンバーが削除された場合、担当も解除
    if (project.leadMemberId === memberId) {
      console.log('👑 担当メンバー解除:', memberId);
      onLeaderAssignment(project.id, undefined);
    }

    // 連絡係が削除された場合は連絡係も解除
    if (project.contactMemberId === memberId) {
      const updatedProjects = projects.map(p =>
        p.id === project.id
          ? { ...p, contactMemberId: undefined, updatedAt: new Date().toISOString() }
          : p
      );
      onUpdateProjects(updatedProjects);
    }
  };

  const handleDragEnd = (result: any) => {
    console.log('🎯 ドラッグ&ドロップ:', result);
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const memberId = draggableId;

    // 同じエリア内での移動は無視
    if (source.droppableId === destination.droppableId) return;

    if (source.droppableId === 'available' && destination.droppableId === 'assigned') {
      // 利用可能 → 配置済み（定員チェック）
      if (assignedMembers.length >= project.requiredMembers) {
        console.log('⚠️ 定員オーバー - 入れ替えモーダル表示');
        // 定員オーバーの場合、入れ替えモーダルを表示
        setReplacementData({
          newMemberId: memberId,
          assignedMembers: assignedMembers
        });
        setShowReplacementModal(true);
      } else {
        console.log('✅ 通常追加');
        handleMemberAdd(memberId);
      }
    } else if (source.droppableId === 'assigned' && destination.droppableId === 'available') {
      // 配置済み → 利用可能（直接移動）
      console.log('↩️ メンバー削除');
      handleMemberRemove(memberId);
    }
  };

  const handleLeaderAssignment = (memberId: string) => {
    // 未配置かつ日程重複の作業員はリーダーにも設定不可
    if (!project.assignedMembers.includes(memberId)) {
      if (!isMemberAvailable(memberId)) return;
      handleMemberAdd(memberId);
    }
    setHasUnsavedChanges(true);
    onLeaderAssignment(project.id, memberId);
  };

  // 作業員ごとの作業時間（未設定は案件全体の時間）
  const getMemberTime = (memberId: string) =>
    project.memberTimes?.[memberId] ?? { start: project.workTime.start, end: project.workTime.end };

  const handleMemberTimeChange = (memberId: string, field: 'start' | 'end', value: string) => {
    const current = getMemberTime(memberId);
    const nextTime = { ...current, [field]: value };
    const memberTimes = { ...(project.memberTimes ?? {}), [memberId]: nextTime };
    const updatedProjects = projects.map(p =>
      p.id === project.id ? { ...p, memberTimes, updatedAt: new Date().toISOString() } : p
    );
    setHasUnsavedChanges(true);
    onUpdateProjects(updatedProjects);
  };

  // 社有車両の割当トグル
  const handleVehicleToggle = (vehicleId: string) => {
    const current = project.assignedVehicleIds ?? [];
    const next = current.includes(vehicleId)
      ? current.filter((id) => id !== vehicleId)
      : [...current, vehicleId];
    const updatedProjects = projects.map(p =>
      p.id === project.id ? { ...p, assignedVehicleIds: next, updatedAt: new Date().toISOString() } : p
    );
    setHasUnsavedChanges(true);
    onUpdateProjects(updatedProjects);
  };

  // 連絡係のトグル（タップで星をON/OFF。同じ人を再タップで解除）
  const handleContactToggle = (memberId: string) => {
    // 配置済みメンバーのみ連絡係にできる
    if (!project.assignedMembers.includes(memberId)) return;
    const newContactId = project.contactMemberId === memberId ? undefined : memberId;
    const updatedProjects = projects.map(p =>
      p.id === project.id
        ? { ...p, contactMemberId: newContactId, updatedAt: new Date().toISOString() }
        : p
    );
    setHasUnsavedChanges(true);
    onUpdateProjects(updatedProjects);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handleDeleteProject = () => {
    onProjectDelete(project.id);
    setShowDeleteConfirm(false);
  };

  const handleReplacement = (replaceMemberId: string) => {
    console.log('🔄 メンバー入れ替え:', replaceMemberId, '→', replacementData?.newMemberId);
    if (!replacementData) return;

    const newAssignedMembers = project.assignedMembers
      .filter(id => id !== replaceMemberId)
      .concat(replacementData.newMemberId);
    
    console.log('📋 入れ替え後の配置リスト:', newAssignedMembers);
    setHasUnsavedChanges(true);
    onMemberAssignment(project.id, newAssignedMembers);

    if (project.leadMemberId === replaceMemberId) {
      console.log('👑 担当メンバー解除（入れ替え）:', replaceMemberId);
      onLeaderAssignment(project.id, undefined);
    }

    setShowReplacementModal(false);
    setReplacementData(null);
    
    // 入れ替え完了後、即座にデータベースに保存
    setTimeout(() => {
      handleSaveChanges();
    }, 100);
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      console.log('💾 データベースに変更を保存中...');
      
      // APIサーバーに変更を保存
      const updatedProjects = projects.map(p =>
        p.id === project.id ? project : p
      );
      
      await onUpdateProjects(updatedProjects);
      
      setHasUnsavedChanges(false);
      console.log('✅ 変更が正常に保存されました');
    } catch (error) {
      console.error('❌ 保存エラー:', error);
      alert('保存に失敗しました: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };
  const handleCancelReplacement = () => {
    setShowReplacementModal(false);
    setReplacementData(null);
  };

  const handleWorkflowStatusChange = (workflowStatus: Project['workflowStatus']) => {
    const updatedProjects = projects.map(p =>
      p.id === project.id ? { ...p, workflowStatus, updatedAt: new Date().toISOString() } : p
    );
    onUpdateProjects(updatedProjects);
  };

  const handlePriorityChange = (priority: ProjectPriority) => {
    const updatedProjects = projects.map(p =>
      p.id === project.id ? { ...p, priority, updatedAt: new Date().toISOString() } : p
    );
    onUpdateProjects(updatedProjects);
  };

  const handleLabelToggle = (labelId: string) => {
    const newLabelIds = project.labelIds.includes(labelId)
      ? project.labelIds.filter(id => id !== labelId)
      : [...project.labelIds, labelId];
    const updatedProjects = projects.map(p =>
      p.id === project.id ? { ...p, labelIds: newLabelIds, updatedAt: new Date().toISOString() } : p
    );
    onUpdateProjects(updatedProjects);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col overflow-y-auto">
        {/* ヘッダー */}
        <div className={`p-6 bg-white border-b shadow-sm ${hasConflicts ? 'bg-red-50 border-red-200' : ''}`}>
          {/* 更新ボタン */}
          {hasUnsavedChanges && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-yellow-800">
                    メンバー配置が変更されました
                  </span>
                </div>
                <button
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      データベースに保存
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {project.jobNo && (
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    JOB {project.jobNo}
                  </span>
                )}
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                {hasConflicts && (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                )}
              </div>
              {(project.customerName || project.salesRep || project.orderType) && (
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-1">
                  {project.customerName && <span>顧客: <span className="text-gray-900">{project.customerName}</span></span>}
                  {project.salesRep && <span>営業: <span className="text-gray-900">{project.salesRep}</span></span>}
                  {project.orderType && <span>発注形態: <span className="text-gray-900">{project.orderType}</span></span>}
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(project.date)}
                    {project.endDate && project.endDate > project.date && (
                      <> 〜 {formatDate(project.endDate)}</>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{project.workTime.start} - {project.workTime.end}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onEditProject}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                編集
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </button>
            </div>
          </div>

          {/* プロジェクト詳細情報 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">必要人数:</span>
                <span className="text-gray-900">{project.requiredMembers}名</span>
                <span className={`text-sm ${
                  (assignedMembers.length + totalExternalMembers) >= project.requiredMembers 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}>
                  (現在: {assignedMembers.length + totalExternalMembers}名)
                </span>
              </div>
              
              {project.workContent && (
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">作業内容:</span>
                    <p className="text-gray-900 mt-1">{project.workContent}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {leadMember && (
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-gray-700">リーダー:</span>
                  <span className="text-gray-900">{leadMember.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Star className={`w-5 h-5 ${contactMember ? 'text-amber-500 fill-amber-400' : 'text-gray-300'}`} />
                <span className="font-medium text-gray-700">連絡係:</span>
                <span className="text-gray-900">{contactMember ? contactMember.name : '未設定'}</span>
              </div>

              {project.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">備考:</span>
                    <p className="text-gray-900 mt-1">{project.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ワークフロー状況・優先度・ラベル */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              {WORKFLOW_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => handleWorkflowStatusChange(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    project.workflowStatus === status
                      ? workflowStatusColor(status)
                      : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {workflowStatusLabel(status)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">優先度:</span>
              <select
                value={project.priority}
                onChange={(e) => handlePriorityChange(e.target.value as ProjectPriority)}
                className={`text-xs font-medium rounded-full border px-2 py-1 ${priorityColor(project.priority)}`}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            <LabelPicker
              labels={labels}
              selectedLabelIds={project.labelIds}
              onToggle={handleLabelToggle}
              onCreateLabel={onCreateLabel}
            />
          </div>

          {/* 協力業者（下請・傭車）表示 */}
          {assignedPartners.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="font-medium text-orange-900 mb-2">社外作業戦力（下請・傭車）</div>
              <div className="grid grid-cols-2 gap-2">
                {assignedPartners.map((partner) => {
                  const isYousha = (partner.kind ?? 'subcontractor') === 'hired_vehicle';
                  const timeLabel = partner.startTime || partner.endTime
                    ? `${partner.startTime || '—'}〜${partner.endTime || '—'}`
                    : '';
                  return (
                    <div key={partner.partnerId} className="bg-white rounded p-2 border border-orange-200">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full text-white ${isYousha ? 'bg-teal-600' : 'bg-orange-600'}`}>
                          {isYousha ? '傭車' : '下請'}
                        </span>
                        <span className="font-medium text-sm truncate">{partner.name}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {partner.memberCount}{isYousha ? '台' : '名'}
                        {' | '}{isYousha ? '氏名' : '代表'}: {partner.representativeName || '未設定'}
                      </div>
                      {timeLabel && (
                        <div className="text-xs text-gray-500 mt-0.5">時間: {timeLabel}</div>
                      )}
                      {isYousha && (partner.vehicleNumber || partner.vehicleType) && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          車両: {partner.vehicleType || ''}{partner.vehicleNumber ? ` (${partner.vehicleNumber})` : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* メンバー配置エリア */}
        <div className="flex-1 flex">
          {/* 選択可能な作業員（この日程で空いている人だけをスケジュールから抽出） */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-700">選択可能な作業員</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {rangeLabel} に空きがある人（{freeMembers.length}名）をドラッグして配置
              </p>
            </div>
            <Droppable droppableId="available">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 flex-1 min-h-full overflow-y-auto ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* 空きあり（ドラッグ可能） */}
                  <div className="space-y-2">
                    {freeMembers.map((member, index) => (
                      <Draggable key={member.id} draggableId={member.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`group flex items-center gap-3 bg-white rounded-lg border p-2 cursor-grab transition-all ${
                              dragSnapshot.isDragging
                                ? 'shadow-2xl border-blue-400 rotate-1'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                            }`}
                          >
                            <div onClick={() => setSelectedMember(member)} className="cursor-pointer">
                              <MemberAvatar member={member} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-900 text-sm truncate">
                                  {member.name}
                                </span>
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                  空き
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 truncate">{member.team}</div>
                              {member.qualifications.length > 0 && (
                                <div className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
                                  <Award className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{member.qualifications.join('・')}</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleLeaderAssignment(member.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-yellow-500 text-white p-1 rounded-full shadow hover:bg-yellow-600 flex-shrink-0"
                              title="担当（リーダー）に設定して配置"
                            >
                              <Crown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}

                  {freeMembers.length === 0 && (
                    <div className="text-center text-gray-400 py-6 text-sm">
                      この日程に空いている作業員がいません
                    </div>
                  )}

                  {/* 割当不可（他案件と日程が重複） */}
                  {busyMembers.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-2">
                        <Ban className="w-3.5 h-3.5" />
                        この日程は割当不可（他案件と重複・{busyMembers.length}名）
                      </div>
                      <div className="space-y-2">
                        {busyMembers.map((member) => {
                          const reason = availabilityByMember.get(member.id)?.reason ?? '';
                          return (
                            <div
                              key={member.id}
                              onClick={() => setSelectedMember(member)}
                              title={reason}
                              className="flex items-center gap-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 p-2 opacity-70 cursor-not-allowed select-none"
                            >
                              <div className="grayscale">
                                <MemberAvatar member={member} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-gray-500 text-sm truncate line-through">
                                    {member.name}
                                  </span>
                                  <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                    予定あり
                                  </span>
                                </div>
                                <div className="text-[11px] text-red-500 truncate">{reason}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* 配置済みメンバー */}
          <div className="w-1/2">
            <div className="p-4 bg-green-50 border-b">
              <h3 className="font-semibold text-gray-700">
                配置済みメンバー ({assignedMembers.length}/{project.requiredMembers}名)
              </h3>
            </div>
            <Droppable droppableId="assigned">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 min-h-full ${
                    snapshot.isDraggingOver ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="grid grid-cols-4 gap-3">
                    {assignedMembers.map((member, index) => (
                      <Draggable key={member.id} draggableId={member.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`relative group ${
                              snapshot.isDragging ? 'rotate-3 scale-105 opacity-80' : ''
                            }`}
                          >
                            <div
                              onClick={() => setSelectedMember(member)}
                              className="cursor-pointer relative"
                            >
                              <MemberAvatar member={member} />
                              {project.leadMemberId === member.id && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center" title="リーダー">
                                  <Crown className="w-2 h-2 text-white" />
                                </div>
                              )}
                              {project.contactMemberId === member.id && (
                                <div className="absolute -top-1 -left-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center" title="連絡係">
                                  <Star className="w-2 h-2 text-white fill-white" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <button
                                onClick={() => handleLeaderAssignment(member.id)}
                                className="bg-yellow-500 text-white p-1 rounded-full shadow-lg hover:bg-yellow-600"
                                title="リーダーに設定"
                              >
                                <Crown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleContactToggle(member.id)}
                                className={`p-1 rounded-full shadow-lg text-white ${
                                  project.contactMemberId === member.id
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-gray-400 hover:bg-amber-500'
                                }`}
                                title={project.contactMemberId === member.id ? '連絡係を解除' : '連絡係に設定'}
                              >
                                <Star className={`w-3 h-3 ${project.contactMemberId === member.id ? 'fill-white' : ''}`} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>

        {/* 配置メンバーの作業時間（作業員ごとの始/終）＋ 社有車両 */}
        {(assignedMembers.length > 0 || vehicles.length > 0) && (
          <div className="border-t bg-white p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 作業員ごとの作業時間 */}
            {assignedMembers.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  作業員ごとの作業時間
                </h3>
                <p className="text-xs text-gray-400 mb-2">未変更なら案件全体の時間（{project.workTime.start}-{project.workTime.end}）を使用</p>
                <div className="space-y-2">
                  {assignedMembers.map((member) => {
                    const t = getMemberTime(member.id);
                    const isCustom = Boolean(project.memberTimes?.[member.id]);
                    return (
                      <div key={member.id} className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 p-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <MemberAvatar member={member} />
                          <span className="text-sm font-medium text-gray-800 truncate">{member.name}</span>
                          {isCustom && (
                            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full flex-shrink-0">個別</span>
                          )}
                        </div>
                        <input
                          type="time"
                          value={t.start}
                          onChange={(e) => handleMemberTimeChange(member.id, 'start', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <span className="text-gray-400">〜</span>
                        <input
                          type="time"
                          value={t.end}
                          onChange={(e) => handleMemberTimeChange(member.id, 'end', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 社有車両の割当 */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Car className="w-4 h-4" />
                社有車両
              </h3>
              <p className="text-xs text-gray-400 mb-2">この案件で使う車両をタップで選択</p>
              <div className="flex flex-wrap gap-2">
                {vehicles.filter((v) => v.isActive).length === 0 && (
                  <span className="text-xs text-gray-400">車両が未登録です（車両管理から追加）</span>
                )}
                {vehicles.filter((v) => v.isActive).map((v) => {
                  const selected = (project.assignedVehicleIds ?? []).includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleVehicleToggle(v.id)}
                      className={`flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg border transition-colors ${
                        selected ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                      style={selected ? { backgroundColor: vehicleCategoryColor(v.category) } : undefined}
                      title={`${vehicleCategoryLabel(v.category)}${v.plateNumber ? ' / ' + v.plateNumber : ''}`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>{v.name}</span>
                      <span className={`text-[10px] ${selected ? 'opacity-90' : 'text-gray-400'}`}>{vehicleCategoryLabel(v.category)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* チェックリスト・コメント */}
        <div className="border-t bg-white p-6 grid grid-cols-2 gap-6">
          <ChecklistSection projectId={project.id} isDatabaseConnected={isDatabaseConnected} />
          <CommentsSection projectId={project.id} isDatabaseConnected={isDatabaseConnected} />
        </div>

        {/* 入れ替えモーダル */}
        {showReplacementModal && replacementData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  メンバーを入れ替えてください
                </h3>
                <p className="text-gray-600 mb-4">
                  定員に達しています。入れ替えるメンバーを選択してください。
                </p>
                <div className="space-y-2 mb-6">
                  {replacementData.assignedMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleReplacement(member.id)}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MemberAvatar member={member} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.team}</div>
                      </div>
                      {project.leadMemberId === member.id && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelReplacement}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 削除確認モーダル */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  プロジェクトを削除しますか？
                </h3>
                <p className="text-gray-600 mb-6">
                  「{project.name}」を削除します。この操作は取り消せません。
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    削除する
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* メンバー詳細モーダル */}
        {selectedMember && (
          <MemberDetailModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </div>
    </DragDropContext>
  );
};

export default ProjectDetail;