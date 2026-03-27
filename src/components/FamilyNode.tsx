'use client';

import { Users, Heart } from 'lucide-react';

interface Spouse {
  name?: string;
  arabicName?: string;
  birth?: string;
  death?: string;
  gender?: 'male' | 'female';
  status?: string;
  address?: string;
  notes?: string;
}

interface FamilyMember {
  id: number;
  name: string;
  nickname?: string;
  arabicName?: string;
  birth?: string;
  death?: string;
  gender?: string;
  generation: number;
  status?: string;
  address?: string;
  description?: string;
  childNumber?: number;
  parentIds?: number[];
  spouse?: Spouse | string;
  createdAt?: string;
  updatedAt?: string;
}

interface FamilyNodeProps {
  member: FamilyMember;
  onClick?: (member: FamilyMember) => void;
  isSelected?: boolean;
}

// Helper to parse spouse
const parseSpouse = (spouse: any): Spouse | undefined => {
  if (!spouse) return undefined;
  if (typeof spouse === 'string') {
    try {
      return JSON.parse(spouse);
    } catch {
      return undefined;
    }
  }
  return spouse;
};

export function FamilyNode({ member, onClick, isSelected = false }: FamilyNodeProps) {
  const genderColor = member.gender === 'male' ? 'bg-blue-50' : 'bg-pink-50';
  const borderColor = member.gender === 'male' ? 'border-blue-200' : 'border-pink-200';
  const hoverBg = member.gender === 'male' ? 'hover:bg-blue-100' : 'hover:bg-pink-100';
  const selectedBg = isSelected ? (member.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100') : '';
  const isDeceased = member.status === 'deceased';
  const deceasedOpacity = isDeceased ? 'opacity-75' : '';

  const ageText = member.death
    ? `${member.birth} - ${member.death}`
    : member.birth
    ? `b. ${member.birth}`
    : '';

  // Status label for deceased members
  const statusLabel = isDeceased 
    ? (member.gender === 'male' ? 'Alm' : 'Almh')
    : '';

  const spouseData = parseSpouse(member.spouse);

  return (
    <div
      className={`w-full max-w-xs p-4 rounded-lg border-2
        ${genderColor} ${borderColor} ${hoverBg} ${selectedBg}
        cursor-pointer transition-all duration-300
        shadow-sm hover:shadow-md ${deceasedOpacity}`}
      onClick={() => onClick?.(member)}
    >
      <div className="flex items-start gap-3">
        <div className="pt-1">
          {member.gender === 'male' ? (
            <Users className="w-5 h-5 text-blue-600" />
          ) : (
            <Heart className="w-5 h-5 text-pink-600" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-base text-gray-900">{member.name}</h3>
            {statusLabel && (
              <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded">
                {statusLabel}
              </span>
            )}
          </div>
          {member.arabicName && (
            <p className="text-sm text-gray-600 mt-1">{member.arabicName}</p>
          )}
          {ageText && <p className="text-xs text-gray-500 mt-1">{ageText}</p>}
          {spouseData?.name && (
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-semibold">Spouse:</span> {spouseData.name}
            </p>
          )}
          {member.address && (
            <p className="text-xs text-gray-600 mt-1">
              📍 {member.address}
            </p>
          )}
          {member.description && (
            <p className="text-xs text-gray-600 mt-2 italic">{member.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
