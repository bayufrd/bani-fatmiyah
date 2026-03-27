'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, X } from 'lucide-react';

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

export function GenerasiSilsilah() {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGenerations, setExpandedGenerations] = useState<Set<number>>(
    new Set()
  );

  // Load all members from API on component mount
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

  // Group by generation
  const groupedByGeneration = useMemo(() => {
    return members.reduce(
      (acc, member) => {
        if (!acc[member.generation]) {
          acc[member.generation] = [];
        }
        acc[member.generation].push(member);
        return acc;
      },
      {} as Record<number, FamilyMember[]>
    );
  }, [members]);

  const toggleGeneration = (generation: number) => {
    const newExpanded = new Set(expandedGenerations);
    if (newExpanded.has(generation)) {
      newExpanded.delete(generation);
    } else {
      newExpanded.add(generation);
    }
    setExpandedGenerations(newExpanded);
  };

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

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8 transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generasi Silsilah</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Daftar anggota keluarga per generasi</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
        </div>
      ) : (
        <>
          {/* Modal Dialog */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detail Lengkap Anggota</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {selectedMember.name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {selectedMember.arabicName && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Nama Arab</p>
                    <p className="text-lg text-gray-900 dark:text-white mt-1 font-arabic">
                      {selectedMember.arabicName}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Jenis Kelamin</p>
                  <p className="text-lg text-gray-900 dark:text-white mt-1">
                    {(selectedMember.gender === 'male' || !selectedMember.gender) ? 'Laki-laki' : 'Perempuan'}
                  </p>
                </div>

                {selectedMember.birth && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Tanggal Lahir</p>
                    <p className="text-lg text-gray-900 dark:text-white mt-1">
                      {selectedMember.birth}
                    </p>
                  </div>
                )}

                {selectedMember.death && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Tanggal Meninggal</p>
                    <p className="text-lg text-gray-900 dark:text-white mt-1">
                      {selectedMember.death}
                    </p>
                  </div>
                )}

                {selectedMember.spouse && (() => {
                  const spouseData = parseSpouse(selectedMember.spouse);
                  return spouseData ? (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Pasangan</p>
                      <p className="text-lg text-gray-900 dark:text-white mt-1">
                        {spouseData.name}
                      </p>
                      {spouseData.notes && (
                        <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">
                          {spouseData.notes}
                        </p>
                      )}
                    </div>
                  ) : null;
                })()}

                {selectedMember.address && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Alamat</p>
                    <p className="text-lg text-gray-900 dark:text-white mt-1">
                      📍 {selectedMember.address}
                    </p>
                  </div>
                )}

                {selectedMember.status && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Status</p>
                    <p className="text-lg text-gray-900 dark:text-white mt-1">
                      {selectedMember.status === 'deceased' 
                        ? ((selectedMember.gender === 'male' || !selectedMember.gender) ? 'Alm (Almarhum)' : 'Almh (Almarhumah)')
                        : 'Hidup'
                      }
                    </p>
                  </div>
                )}

                {selectedMember.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Keterangan</p>
                    <p className="text-gray-900 dark:text-gray-100 mt-1">
                      {selectedMember.description}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Generasi</p>
                  <p className="text-lg text-gray-900 dark:text-white mt-1">
                    Generasi {selectedMember.generation}
                  </p>
                </div>
              </div>

              {/* Parents info */}
              {getParents(selectedMember.id).length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-3">
                    Orang Tua ({getParents(selectedMember.id).length})
                  </p>
                  <div className="space-y-2">
                    {getParents(selectedMember.id).map((parent) => (
                      <button
                        key={parent.id}
                        onClick={() => setSelectedMember(parent)}
                        className="text-left p-3 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold">
                          {parent.name}
                        </div>
                        {parent.arabicName && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {parent.arabicName}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Children info */}
              {getChildren(selectedMember.id).length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-3">
                    Anak-anak ({getChildren(selectedMember.id).length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getChildren(selectedMember.id).map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedMember(child)}
                        className="text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold">
                          {child.name}
                        </div>
                        {child.arabicName && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {child.arabicName}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generations List */}
      <div className="space-y-6">
        {Object.entries(groupedByGeneration)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([generation, members]) => (
            <div key={generation}>
              <button
                onClick={() => toggleGeneration(parseInt(generation))}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 dark:from-blue-900/30 to-indigo-50 dark:to-indigo-900/30 hover:from-blue-100 dark:hover:from-blue-900/50 hover:to-indigo-100 dark:hover:to-indigo-900/50 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
              >
                <div className="text-left">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Generasi {generation}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {members.length} anggota keluarga
                  </p>
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {expandedGenerations.has(parseInt(generation)) ? '−' : '+'}
                </span>
              </button>

              {expandedGenerations.has(parseInt(generation)) && (
                <div className="mt-4 pl-6 border-l-4 border-blue-300 dark:border-blue-700 space-y-3">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="w-full text-left p-3 rounded-lg border transition-all bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {member.name}
                          </p>
                          {member.arabicName && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-arabic">
                              {member.arabicName}
                            </p>
                          )}
                          {member.spouse && (() => {
                            const spouseData = parseSpouse(member.spouse);
                            return spouseData?.name ? (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                + {spouseData.name}
                              </p>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
