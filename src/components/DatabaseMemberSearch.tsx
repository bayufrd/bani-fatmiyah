'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { FamilyMember } from '@/lib/db';

interface Spouse {
  name?: string;
  arabicName?: string;
  birth?: string;
  death?: string;
  gender?: string;
  address?: string;
  status?: string;
  notes?: string;
}

export function DatabaseMemberSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load members from database API
  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/members');
        if (response.ok) {
          const data = await response.json();
          setMembers(data);
          setError(null);
        } else {
          setError('Gagal memuat data dari database');
        }
      } catch (err) {
        setError('Error menghubungi server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  // Filter members based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = members.filter(
      (member) => {
        const spouseName = parseSpouse(member.spouse)?.name || '';
        return (
          member.name.toLowerCase().includes(query) ||
          member.arabicName?.toLowerCase().includes(query) ||
          member.nickname?.toLowerCase().includes(query) ||
          member.description?.toLowerCase().includes(query) ||
          spouseName.toLowerCase().includes(query)
        );
      }
    );

    setFilteredMembers(filtered);
  }, [searchQuery, members]);

  // Parse parentIds from JSON string if needed
  const parseParentIds = (parentIds: any): number[] => {
    if (!parentIds) return [];
    if (typeof parentIds === 'string') {
      try {
        return JSON.parse(parentIds);
      } catch {
        return [];
      }
    }
    return Array.isArray(parentIds) ? parentIds : [];
  };

  // Parse spouse from JSON string if needed
  const parseSpouse = (spouse: any): Spouse | null => {
    if (!spouse) return null;
    if (typeof spouse === 'string') {
      try {
        return JSON.parse(spouse);
      } catch {
        return null;
      }
    }
    return spouse as Spouse;
  };

  // Get parents for a member
  const getParents = (memberId: number): FamilyMember[] => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return [];

    const parentIds = parseParentIds(member.parentIds);
    return parentIds
      .map((id) => members.find((m) => m.id === id))
      .filter((p) => p !== undefined) as FamilyMember[];
  };

  // Get children for a member
  const getChildren = (memberId: number): FamilyMember[] => {
    return members.filter((m) => {
      const parentIds = parseParentIds(m.parentIds);
      return parentIds.includes(memberId);
    });
  };

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Cari Anggota Keluarga</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Memuat data dari database...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Cari Anggota Keluarga</h2>
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8 transition-colors">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Cari Anggota Keluarga</h2>

      {/* Search Input */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Cari nama, nama arab, panggilan, pasangan, atau keterangan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
        />
      </div>

      {/* Detailed View of Selected Member */}
      {selectedMember && (
        <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-blue-50 dark:to-blue-900/20 rounded-xl border-2 border-purple-300 dark:border-purple-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedMember.name}
            </h3>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedMember.arabicName && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Nama Arab</p>
                <p className="text-lg text-gray-900 dark:text-white mt-1">
                  {selectedMember.arabicName}
                </p>
              </div>
            )}

            {selectedMember.nickname && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Nama Panggilan</p>
                <p className="text-lg text-gray-900 dark:text-white mt-1">
                  {selectedMember.nickname}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Jenis Kelamin</p>
              <p className="text-lg text-gray-900 dark:text-white mt-1">
                {selectedMember.gender === 'male' ? '👨 Laki-laki' : '👩 Perempuan'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Generasi</p>
              <p className="text-lg text-gray-900 dark:text-white mt-1">
                Generasi {selectedMember.generation}
              </p>
            </div>

            {selectedMember.birth && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">📅 Tanggal Lahir</p>
                <p className="text-lg text-gray-900 dark:text-white mt-1">
                  {selectedMember.birth}
                </p>
              </div>
            )}

            {selectedMember.death && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">⚰️ Tanggal Meninggal</p>
                <p className="text-lg text-gray-900 dark:text-white mt-1">
                  {selectedMember.death}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Status</p>
              <p className="text-lg text-gray-900 dark:text-white mt-1">
                {selectedMember.status === 'deceased'
                  ? selectedMember.gender === 'male' ? 'Alm (Almarhum)' : 'Almh (Almarhumah)'
                  : '🟢 Hidup'}
              </p>
            </div>

            {selectedMember.address && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">📍 Alamat</p>
                <p className="text-lg text-gray-900 dark:text-white mt-1">
                  {selectedMember.address}
                </p>
              </div>
            )}

            {/* Spouse Information */}
            {selectedMember.spouse && (() => {
              const spouse = parseSpouse(selectedMember.spouse);
              if (!spouse) return null;
              
              return (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">💑 Pasangan</p>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    <div className="space-y-2">
                      {spouse.name && (
                        <p className="text-gray-900 dark:text-white font-medium">{spouse.name}</p>
                      )}
                      {spouse.arabicName && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{spouse.arabicName}</p>
                      )}
                      {spouse.birth && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">📅 {spouse.birth}</p>
                      )}
                      {spouse.death && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">📅 {spouse.death}</p>
                      )}
                      {spouse.address && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">📍 {spouse.address}</p>
                      )}
                      {spouse.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">💬 {spouse.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedMember.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">ℹ️ Keterangan</p>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {selectedMember.description}
                </p>
              </div>
            )}

            {/* Parents */}
            {getParents(selectedMember.id).length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">👨‍👩‍👦 Orang Tua</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getParents(selectedMember.id).map((parent) => (
                    <button
                      key={parent.id}
                      onClick={() => setSelectedMember(parent)}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
                    >
                      {parent.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Children */}
            {getChildren(selectedMember.id).length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">👧👦 Anak ({getChildren(selectedMember.id).length})</p>
                <div className="flex flex-wrap gap-2 mt-2 max-h-48 overflow-y-auto">
                  {getChildren(selectedMember.id).map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedMember(child)}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results - Grid View */}
      <div className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Hasil: {filteredMembers.length} dari {members.length} anggota
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedMember?.id === member.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 hover:border-purple-300 dark:hover:border-purple-600'
              }`}
            >
              <p className="font-bold text-gray-900 dark:text-white truncate">
                {member.name}
              </p>
              {member.arabicName && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {member.arabicName}
                </p>
              )}
              <div className="mt-2 flex gap-2 flex-wrap text-xs">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded">
                  Gen {member.generation}
                </span>
                <span className={`px-2 py-1 rounded ${
                  member.gender === 'male' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100'
                }`}>
                  {member.gender === 'male' ? '👨' : '👩'}
                </span>
                {member.status === 'deceased' && (
                  <span className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded">
                    ⚰️ Alm
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {filteredMembers.length === 0 && searchQuery && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Tidak ada hasil untuk pencarian "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
