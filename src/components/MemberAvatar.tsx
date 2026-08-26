import React from 'react';
import { Member } from '../types';

interface MemberAvatarProps {
  member: Member;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClassMap: Record<NonNullable<MemberAvatarProps['size']>, string> = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

const MemberAvatar: React.FC<MemberAvatarProps> = ({ member, size = 'md' }) => {
  const initials = member.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <div
      className={`${sizeClassMap[size]} bg-blue-500 text-white rounded-full flex items-center justify-center font-medium shadow-sm cursor-pointer hover:bg-blue-600 transition-colors border-2 border-white`}
      title={member.name}
    >
      {initials}
    </div>
  );
};

export default MemberAvatar;
