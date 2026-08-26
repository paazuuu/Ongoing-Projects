import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Project, Member, Label, ConflictAlert, ProjectWorkflowStatus } from '../types';
import MemberAvatar from './MemberAvatar';
import { AlertTriangle, Calendar } from 'lucide-react';
import { WORKFLOW_STATUSES, workflowStatusLabel, priorityColor, priorityLabel } from '../utils/workflowStatus';

interface KanbanBoardProps {
  projects: Project[];
  members: Member[];
  labels: Label[];
  conflicts: ConflictAlert[];
  onProjectSelect: (project: Project) => void;
  onProjectStatusChange: (projectId: string, status: ProjectWorkflowStatus) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projects,
  members,
  labels,
  conflicts,
  onProjectSelect,
  onProjectStatusChange,
}) => {
  const activeProjects = projects.filter((p) => p.isActive);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as ProjectWorkflowStatus;
    if (newStatus === result.source.droppableId) return;
    onProjectStatusChange(result.draggableId, newStatus);
  };

  return (
    <div className="p-6 h-full overflow-x-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ステータスボード</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-full min-w-max">
          {WORKFLOW_STATUSES.map((status) => {
            const columnProjects = activeProjects.filter((p) => p.workflowStatus === status);
            return (
              <div
                key={status}
                className="w-80 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 flex flex-col"
              >
                <div className="p-3 border-b bg-white rounded-t-lg flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">{workflowStatusLabel(status)}</h2>
                  <span className="text-sm text-gray-500">{columnProjects.length}</span>
                </div>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 space-y-3 overflow-y-auto ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {columnProjects.map((project, index) => {
                        const projectLabels = labels.filter((l) => project.labelIds.includes(l.id));
                        const leadMember = project.leadMemberId
                          ? members.find((m) => m.id === project.leadMemberId)
                          : null;
                        const otherMembers = members.filter(
                          (m) => project.assignedMembers.includes(m.id) && m.id !== project.leadMemberId
                        );
                        const hasConflict = conflicts.some((c) =>
                          c.conflictingProjects.includes(project.name)
                        );
                        const checklist = project.checklistSummary;

                        return (
                          <Draggable key={project.id} draggableId={project.id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => onProjectSelect(project)}
                                className={`bg-white rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow ${
                                  dragSnapshot.isDragging ? 'shadow-lg' : ''
                                } ${hasConflict ? 'border-red-300' : 'border-gray-200'}`}
                              >
                                <div className="flex items-start justify-between mb-2 gap-2">
                                  <h3 className="font-medium text-gray-900 text-sm">{project.name}</h3>
                                  {hasConflict && (
                                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                  <Calendar className="w-3 h-3" />
                                  <span>{project.date}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-wrap mb-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColor(
                                      project.priority
                                    )}`}
                                  >
                                    優先度: {priorityLabel(project.priority)}
                                  </span>
                                  {projectLabels.map((label) => (
                                    <span
                                      key={label.id}
                                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                      style={{ backgroundColor: label.color }}
                                    >
                                      {label.name}
                                    </span>
                                  ))}
                                </div>
                                {checklist && checklist.total > 0 && (
                                  <div className="mb-2">
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-green-500"
                                        style={{ width: `${(checklist.done / checklist.total) * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {checklist.done}/{checklist.total} 完了
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  {leadMember && <MemberAvatar member={leadMember} size="sm" />}
                                  {otherMembers.slice(0, 3).map((m) => (
                                    <MemberAvatar key={m.id} member={m} size="sm" />
                                  ))}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
