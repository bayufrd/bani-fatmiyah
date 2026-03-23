'use client';

import { useState, useMemo } from 'react';
import { FamilyMember, familyData } from '@/data/familyData';
import { FamilyNode } from './FamilyNode';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TreeNodeProps {
  member: FamilyMember;
  depth: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  selectedMember: FamilyMember | null;
  onSelectMember: (member: FamilyMember) => void;
}

function TreeMemberNode({
  member,
  depth,
  isExpanded,
  onToggle,
  selectedMember,
  onSelectMember,
}: TreeNodeProps) {
  const children = useMemo(
    () => familyData.filter((m) => m.parentId === member.id),
    [member.id]
  );

  const hasChildren = children.length > 0;

  return (
    <div className="relative">
      {/* Main node */}
      <div className="flex items-center gap-4 mb-4">
        {hasChildren && (
          <button
            onClick={() => onToggle(member.id)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-8" />}

        <div
          onClick={() => onSelectMember(member)}
          className="flex-shrink-0"
        >
          <FamilyNode
            member={member}
            isSelected={selectedMember?.id === member.id}
            onClick={onSelectMember}
          />
        </div>
      </div>

      {/* Children nodes with connecting lines */}
      {hasChildren && isExpanded && (
        <div className="ml-4 border-l-2 border-gray-300 pl-0">
          {children.map((child, index) => (
            <div key={child.id} className="relative mb-4">
              {/* Horizontal line connecting to branch */}
              <div className="absolute left-0 top-8 w-4 h-0.5 bg-gray-300 -ml-4" />

              <TreeMemberNode
                member={child}
                depth={depth + 1}
                isExpanded={true}
                onToggle={onToggle}
                selectedMember={selectedMember}
                onSelectMember={onSelectMember}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeVisualizer() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['farmiyah-1'])
  );
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const rootMember = familyData.find((m) => m.generation === 1);

  if (!rootMember) {
    return <div>Data tidak ditemukan</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Pohon Silsilah Keluarga Farmiyah
        </h2>
        <p className="text-gray-600">
          Klik nama untuk melihat detail, atau klik tombol panah untuk memperluas/menyembunyikan keturunan
        </p>
      </div>

      {/* Tree visualization */}
      <div className="overflow-x-auto pb-8">
        <div className="inline-block min-w-full">
          <TreeMemberNode
            member={rootMember}
            depth={0}
            isExpanded={expandedNodes.has(rootMember.id)}
            onToggle={toggleNode}
            selectedMember={selectedMember}
            onSelectMember={setSelectedMember}
          />
        </div>
      </div>

      {/* Detail panel */}
      {selectedMember && (
        <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {selectedMember.name}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedMember.arabicName && (
              <div>
                <p className="text-sm text-gray-600 font-semibold">Nama Arab</p>
                <p className="text-lg text-gray-900 mt-1">
                  {selectedMember.arabicName}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 font-semibold">Jenis Kelamin</p>
              <p className="text-lg text-gray-900 mt-1">
                {selectedMember.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>

            {selectedMember.birth && (
              <div>
                <p className="text-sm text-gray-600 font-semibold">Tahun Lahir</p>
                <p className="text-lg text-gray-900 mt-1">
                  {selectedMember.birth}
                </p>
              </div>
            )}

            {selectedMember.death && (
              <div>
                <p className="text-sm text-gray-600 font-semibold">Tahun Meninggal</p>
                <p className="text-lg text-gray-900 mt-1">
                  {selectedMember.death}
                </p>
              </div>
            )}

            {selectedMember.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 font-semibold">Keterangan</p>
                <p className="text-gray-900 mt-1">
                  {selectedMember.description}
                </p>
              </div>
            )}

            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 font-semibold">Generasi</p>
              <p className="text-lg text-gray-900 mt-1">
                Generasi {selectedMember.generation}
              </p>
            </div>
          </div>

          {/* Parents info */}
          {selectedMember.parentId && (
            <div className="mt-6 pt-6 border-t border-gray-300">
              <p className="text-sm text-gray-600 font-semibold mb-2">Orang Tua</p>
              {(() => {
                const parent = familyData.find(
                  (m) => m.id === selectedMember.parentId
                );
                return parent ? (
                  <p className="text-gray-900">
                    {parent.name}
                    {parent.arabicName && ` (${parent.arabicName})`}
                  </p>
                ) : null;
              })()}
            </div>
          )}

          {/* Children info */}
          {(() => {
            const children = familyData.filter(
              (m) => m.parentId === selectedMember.id
            );
            if (children.length > 0) {
              return (
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <p className="text-sm text-gray-600 font-semibold mb-2">
                    Anak-anak ({children.length})
                  </p>
                  <ul className="space-y-2">
                    {children.map((child) => (
                      <li key={child.id} className="text-gray-900">
                        • {child.name}
                        {child.arabicName && ` (${child.arabicName})`}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
}
