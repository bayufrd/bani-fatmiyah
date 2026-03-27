'use client';

import { useState, useEffect, useMemo } from 'react';
import { Heart, X } from 'lucide-react';

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

export function Tawasul() {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter members yang memiliki status 'deceased' dan sesuai search query
  const deceasedMembers = useMemo(() => {
    return members.filter((member) => {
      if (member.status !== 'deceased') return false;
      
      // Jika tidak ada search query, tampilkan semua
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      
      // Cari di nama, nama arab, deskripsi, dan alamat
      return (
        member.name.toLowerCase().includes(query) ||
        (member.arabicName && member.arabicName.toLowerCase().includes(query)) ||
        (member.description && member.description.toLowerCase().includes(query)) ||
        (member.address && member.address.toLowerCase().includes(query)) ||
        (member.nickname && member.nickname.toLowerCase().includes(query))
      );
    });
  }, [members, searchQuery]);

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
        <Heart className="w-8 h-8 text-red-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tawasul</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Doa untuk almarhum dan almarhumah</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
        </div>
      ) : (
        <>
      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari nama, nama arab, atau lokasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors"
        />
      </div>

      {/* Statistics */}
      <div className="mb-8 p-4 bg-gradient-to-r from-red-50 dark:from-red-900/20 to-pink-50 dark:to-pink-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          Total: <span className="text-red-600 dark:text-red-400">{deceasedMembers.length}</span> Almarhum/Almarhumah
        </p>
      </div>

      {/* Modal Dialog */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detail Lengkap</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-3">Orang Tua ({getParents(selectedMember.id).length})</p>
                  <div className="space-y-2">
                    {getParents(selectedMember.id).map((parent) => (
                      <button
                        key={parent.id}
                        onClick={() => setSelectedMember(parent)}
                        className="text-left p-2 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold">
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
                        className="text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold">
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

      {/* Results Grid */}
      {deceasedMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deceasedMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="p-4 bg-gradient-to-br from-red-50 dark:from-red-900/20 to-pink-50 dark:to-pink-900/20 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer hover:shadow-lg dark:hover:shadow-red-900/30 transition-all hover:scale-105"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                  {member.name}
                </h3>
                <span className="text-2xl">
                  {member.gender === 'male' ? '👨' : '👩'}
                </span>
              </div>

              {member.arabicName && (
                <p className="text-sm text-gray-700 dark:text-gray-300 font-arabic mb-2">
                  {member.arabicName}
                </p>
              )}

              {member.death && (
                <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                  📅 {member.death}
                </p>
              )}

              {member.generation !== undefined && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Gen {member.generation}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Tidak ada data almarhum/almarhumah</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
