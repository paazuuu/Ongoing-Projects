import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Member, Project, ConflictAlert, ExternalPartner } from '../types';
import MemberCard from './MemberCard';
import { Clock, MapPin, Users, AlertTriangle } from 'lucide-react';

interface ProjectColumnProps {
  project: Project;
  members: Member[];
  externalPartners: ExternalPartner[];
  onMemberClick: (member: Member) => void;
  conflicts: ConflictAlert[];
}

const ProjectColumn: React.FC<ProjectColumnProps> = ({
  project,
  members,
  externalPartners,
  onMemberClick,
  conflicts,
}) => {
  const hasConflicts = conflicts.some(c => 
    c.conflictingProjects.includes(project.id)
  );

  const assignedPartners = project.externalPartners.map(assignment => {
    const partner = externalPartners.find(p => p.id === assignment.partnerId);
    return partner ? { ...partner, ...assignment } : null;
  }).filter((partner): partner is NonNullable<typeof partner> => partner !== null);

  const totalExternalMembers = project.externalPartners.reduce((sum, assignment) => 
    sum + assignment.memberCount, 0
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
      <div className={`p-4 border-b ${hasConflicts ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
          {hasConflicts && (
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{project.workTime.start} - {project.workTime.end}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{project.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{members.length + totalExternalMembers} / {project.requiredMembers}名</span>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-white rounded text-xs text-gray-700">
          {project.workContent}
        </div>
        
        {/* 協力業者表示 */}
        {assignedPartners.length > 0 && (
          <div className="mt-2 p-2 bg-orange-50 rounded">
            <div className="text-xs font-medium text-orange-700 mb-1">協力業者</div>
            <div className="flex flex-wrap gap-1">
              {assignedPartners.map((partner) => (
                <span
                  key={partner.partnerId}
                  className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs"
                >
                  {partner.name} ({partner.memberCount}名)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Droppable droppableId={project.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-4 min-h-96 ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            <div className="space-y-3">
              {members.map((member, index) => (
                <Draggable key={member.id} draggableId={member.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => onMemberClick(member)}
                    >
                      <MemberCard
                        member={member}
                        isDragging={snapshot.isDragging}
                        hasConflict={conflicts.some(c => c.memberId === member.id)}
                      />
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
  );
};

export default ProjectColumn;