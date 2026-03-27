'use client';

import { useState, useMemo, useEffect } from 'react';
import type { FamilyMember } from '@/lib/db';
import { FamilyNode } from './FamilyNode';
import { Search } from 'lucide-react';

export function FamilySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Load members from database via API
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetch('/api/members');
        if (response.ok) {
          const data = await response.json();
          setAllMembers(data);
        }
      } catch (error) {
        console.error('Failed to load members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return allMembers;
    }

    const query = searchQuery.toLowerCase();
    return allMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.arabicName?.toLowerCase().includes(query) ||
        member.description?.toLowerCase().includes(query)
    );
  }, [searchQuery, allMembers]);

  const getParents = (memberId: number): FamilyMember[] => {
    const member = allMembers.find((m) => m.id === memberId);
    if (!member || !member.parentIds) return [];
    
    const parentIds = Array.isArray(member.parentIds) 
      ? member.parentIds 
      : typeof member.parentIds === 'string'
        ? JSON.parse(member.parentIds)
        : [];
    
    return parentIds
      .map((id: number) => allMembers.find((m) => m.id === id))
      .filter((p) => p !== undefined) as FamilyMember[];
  };

  const getChildren = (memberId: number): FamilyMember[] => {
    return allMembers.filter((m) => {
      if (!m.parentIds) return false;
      const parentIds = Array.isArray(m.parentIds) 
        ? m.parentIds 
        : typeof m.parentIds === 'string'
          ? JSON.parse(m.parentIds)
          : [];
      return parentIds.includes(memberId);
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8 transition-colors">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Cari Anggota Keluarga</h2>

      {/* Search Input */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Cari nama, nama arab, atau deskripsi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors disabled:opacity-50"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Memuat data anggota keluarga...</p>
        </div>
      ) : (
        <>
          {/* Detailed View - Moved to top */}
          {selectedMember && (
        <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-blue-50 dark:to-blue-900/20 rounded-xl border-2 border-purple-300 dark:border-purple-700 transition-colors">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedMember.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedMember.arabicName && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Nama Arab</p>
                <p className="text-lg text-gray-900 dark:text-white mt-1">
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

            {selectedMember.spouse && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Pasangan</p>
                <p className="text-lg text-gray-900 dark:text-white mt-1">
                  {typeof selectedMember.spouse === 'string' 
                    ? selectedMember.spouse
                    : selectedMember.spouse?.name || 'N/A'
                  }
                </p>
              </div>
            )}

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
            <div className="mt-6 pt-6 border-t border-purple-300 dark:border-purple-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-3">Orang Tua ({getParents(selectedMember.id).length})</p>
              <div className="space-y-2">
                {getParents(selectedMember.id).map((parent) => (
                  <button
                    key={parent.id}
                    onClick={() => setSelectedMember(parent)}
                    className="text-left p-2 w-full rounded hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold">
                      {parent.name}
                      {parent.arabicName && ` (${parent.arabicName})`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Children info */}
          {getChildren(selectedMember.id).length > 0 && (
            <div className="mt-6 pt-6 border-t border-purple-300 dark:border-purple-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-3">
                Anak-anak ({getChildren(selectedMember.id).length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getChildren(selectedMember.id).map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedMember(child)}
                    className="text-left p-2 rounded hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold">
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
      )}

      {/* Results Counter */}
      {searchQuery && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Ditemukan {filteredMembers.length} anggota keluarga
        </p>
      )}

      {/* Results Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} onClick={() => setSelectedMember(member)}>
              <FamilyNode
                member={member}
                isSelected={selectedMember?.id === member.id}
                onClick={setSelectedMember}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Tidak ada anggota keluarga yang sesuai dengan pencarian</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
