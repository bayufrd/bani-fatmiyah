'use client';

import { useState, useMemo } from 'react';
import { FamilyMember, familyData } from '@/data/familyData';
import { FamilyNode } from './FamilyNode';
import { Heart, X } from 'lucide-react';

export function Tawasul() {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Filter members yang memiliki status 'deceased'
  const deceasedMembers = useMemo(() => {
    return familyData.filter(
      (member) =>
        member.status === 'deceased'
    );
  }, []);

  const getParents = (memberId: string): FamilyMember[] => {
    const member = familyData.find((m) => m.id === memberId);
    if (!member) return [];
    
    const parentIds = member.parentIds || (member.parentId ? [member.parentId] : []);
    return parentIds
      .map((id) => familyData.find((m) => m.id === id))
      .filter((p) => p !== undefined) as FamilyMember[];
  };

  const getChildren = (memberId: string): FamilyMember[] => {
    return familyData.filter((m) => {
      const parentIds = m.parentIds || (m.parentId ? [m.parentId] : []);
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

                {selectedMember.spouseName && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Pasangan</p>
                    <p className="text-lg text-gray-900 dark:text-white mt-1">
                      {selectedMember.spouseName}
                    </p>
                    {selectedMember.spouse?.notes && (
                      <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">
                        {selectedMember.spouse.notes}
                      </p>
                    )}
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
          <p className="text-gray-600 dark:text-gray-400">Tidak ada data almarhum/almarhumah</p>
        </div>
      )}
    </div>
  );
}
