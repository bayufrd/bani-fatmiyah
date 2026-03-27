'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { FamilyNode } from './FamilyNode';

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

export function FamilyTree() {
  const [expandedGenerations, setExpandedGenerations] = useState<Set<number>>(
    new Set([0, 1, 2, 3])
  );
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const generationRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Load members from API on mount
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetch('/api/members');
        if (response.ok) {
          const data = await response.json();
          setMembers(data);
        }
      } catch (error) {
        console.error('Failed to load members:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMembers();
  }, []);

  // Helper function to parse spouse from JSON string to object
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

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return members;
    }

    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) => {
        const spouseData = parseSpouse(member.spouse);
        return (
          member.name.toLowerCase().includes(query) ||
          member.arabicName?.toLowerCase().includes(query) ||
          member.description?.toLowerCase().includes(query) ||
          spouseData?.name?.toLowerCase().includes(query)
        );
      }
    );
  }, [searchQuery, members]);

  const toggleGeneration = (generation: number) => {
    const newExpanded = new Set(expandedGenerations);
    if (newExpanded.has(generation)) {
      newExpanded.delete(generation);
    } else {
      newExpanded.add(generation);
    }
    setExpandedGenerations(newExpanded);
  };

  const groupedByGeneration = filteredMembers.reduce(
    (acc, member) => {
      if (!acc[member.generation]) {
        acc[member.generation] = [];
      }
      acc[member.generation].push(member);
      return acc;
    },
    {} as Record<number, FamilyMember[]>
  );

  const getParents = (memberId: number): FamilyMember[] => {
    const member = members.find((m) => m.id === memberId);
    if (!member || !member.parentIds) return [];
    
    return member.parentIds
      .map((id) => members.find((m) => m.id === id))
      .filter((p) => p !== undefined) as FamilyMember[];
  };

  const getChildren = (memberId: number): FamilyMember[] => {
    return members.filter((m) => {
      const parentIds = m.parentIds || [];
      return parentIds.includes(memberId);
    });
  };

  // Auto-expand generations when search is active
  useEffect(() => {
    if (searchQuery.trim()) {
      const generationsWithResults = Object.keys(groupedByGeneration)
        .map((g) => parseInt(g))
        .filter((gen) => groupedByGeneration[gen]?.length > 0);
      setExpandedGenerations(new Set(generationsWithResults));
    } else {
      setExpandedGenerations(new Set([0, 1, 2, 3]));
    }
  }, [searchQuery, groupedByGeneration]);

  // Auto scroll to generation 1 when it's selected and expanded
  useEffect(() => {
    if (selectedMember && selectedMember.generation === 0 && expandedGenerations.has(1)) {
      const gen1Ref = generationRefs.current[1];
      if (gen1Ref) {
        setTimeout(() => {
          gen1Ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [selectedMember, expandedGenerations]);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pohon Silsilah Keluarga Besar H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh)</h2>

      {/* Search Input */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input
          key="family-tree-search"
          type="text"
          placeholder="Cari nama, nama arab, pasangan, atau deskripsi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Results Counter */}
      {searchQuery && (
        <p className="text-sm text-gray-600 mb-4">
          Ditemukan {Object.values(groupedByGeneration).flat().length} anggota keluarga
        </p>
      )}

      <div className="space-y-8">
        {Object.entries(groupedByGeneration)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .filter(([, members]) => members.length > 0)
          .map(([generation, members]) => (
            <div key={generation}>
              <button
                onClick={() => toggleGeneration(parseInt(generation))}
                className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors w-full"
              >
                {expandedGenerations.has(parseInt(generation)) ? (
                  <ChevronUp className="w-5 h-5 text-purple-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-purple-600" />
                )}
                <h3 className="font-semibold text-gray-900">
                  Generasi {generation}
                  <span className="text-sm text-gray-600 ml-2">({members.length} anggota)</span>
                </h3>
              </button>

              {expandedGenerations.has(parseInt(generation)) && (
                <div
                  ref={(el) => {
                    if (el) generationRefs.current[parseInt(generation)] = el;
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l-2 border-gray-300"
                >
                  {members.map((member) => (
                    <div key={member.id} className="relative">
                      <FamilyNode
                        member={member}
                        onClick={setSelectedMember}
                        isSelected={selectedMember?.id === member.id}
                      />
                      {getParents(member.id).length > 0 && (
                        <div className="text-xs text-gray-500 mt-2">
                          Orang tua: {getParents(member.id).map((p) => p.name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>

      {selectedMember && (
        <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Detail Anggota</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Nama</p>
              <p className="text-lg font-semibold text-gray-900">{selectedMember.name}</p>
            </div>
            {selectedMember.arabicName && (
              <div>
                <p className="text-sm text-gray-600">Nama Arab</p>
                <p className="text-lg font-semibold text-gray-900 font-arabic">
                  {selectedMember.arabicName}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Jenis Kelamin</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {selectedMember.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>
            {selectedMember.birth && (
              <div>
                <p className="text-sm text-gray-600">Tanggal Lahir</p>
                <p className="text-lg font-semibold text-gray-900">{selectedMember.birth}</p>
              </div>
            )}
            {selectedMember.death && (
              <div>
                <p className="text-sm text-gray-600">Tanggal Meninggal</p>
                <p className="text-lg font-semibold text-gray-900">{selectedMember.death}</p>
              </div>
            )}
            {selectedMember.spouse && (() => {
              const spouseData = parseSpouse(selectedMember.spouse);
              return spouseData?.name ? (
                <div>
                  <p className="text-sm text-gray-600">Pasangan</p>
                  <p className="text-lg font-semibold text-gray-900">{spouseData.name}</p>
                  {spouseData.notes && (
                    <p className="text-sm text-gray-600 mt-1">{spouseData.notes}</p>
                  )}
                </div>
              ) : null;
            })()}
            <div>
              <p className="text-sm text-gray-600">Generasi</p>
              <p className="text-lg font-semibold text-gray-900">{selectedMember.generation}</p>
            </div>
            {selectedMember.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Keterangan</p>
                <p className="text-lg font-semibold text-gray-900">{selectedMember.description}</p>
              </div>
            )}
            {getParents(selectedMember.id).length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Orang Tua</p>
                <div className="space-y-2 mt-2">
                  {getParents(selectedMember.id).map((parent) => (
                    <button
                      key={parent.id}
                      onClick={() => setSelectedMember(parent)}
                      className="block w-full text-left p-3 bg-white rounded-lg border border-gray-300 hover:bg-purple-50 hover:border-purple-400 transition-colors"
                    >
                      <p className="font-semibold text-purple-600 hover:text-purple-700">
                        {parent.name}
                      </p>
                      {parent.arabicName && (
                        <p className="text-sm text-gray-600 font-arabic">{parent.arabicName}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {getChildren(selectedMember.id).length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-2">Anak ({getChildren(selectedMember.id).length})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getChildren(selectedMember.id).map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedMember(child)}
                      className="text-left p-3 bg-white rounded-lg border border-gray-300 hover:bg-purple-50 hover:border-purple-400 transition-colors"
                    >
                      <p className="font-semibold text-purple-600 hover:text-purple-700 text-sm">
                        {child.name}
                      </p>
                      {child.arabicName && (
                        <p className="text-xs text-gray-600 font-arabic">{child.arabicName}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
