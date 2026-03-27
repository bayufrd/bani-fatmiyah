'use client';

import { useState, useEffect } from 'react';
import type { FamilyMember } from '@/lib/db';
import GallerySection from '@/components/GallerySection';
import { AdminNavbar } from '@/components/AdminNavbar';

interface FormState extends Partial<FamilyMember> {
  selectedParentIds?: number[];
  spouseName?: string;
  spouseArabicName?: string;
  spouseBirth?: string;
  spouseDeath?: string;
  spouseGender?: string;
  spouseStatus?: string;
  spouseAddress?: string;
  spouseNotes?: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormState>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [parentSearchQuery, setParentSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [activeMenu, setActiveMenu] = useState<'members' | 'gallery'>('members');
  const [isDark, setIsDark] = useState(true);

  // Check if member has children (other members using this id as parent)
  const getMemberChildren = (memberId: number): FamilyMember[] => {
    return members.filter((m) => {
      if (!m.parentIds) return false;
      const parentIds = Array.isArray(m.parentIds) 
        ? m.parentIds 
        : typeof m.parentIds === 'string' 
          ? JSON.parse(m.parentIds) 
          : [];
      return parentIds.includes(memberId);
    });
  };

  const closeSnackbar = () => {
    setSnackbar(null);
  };

  useEffect(() => {
    if (snackbar) {
      const timer = setTimeout(closeSnackbar, 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  // Auto load members when authenticated and list is empty
  useEffect(() => {
    if (isAuthenticated && members.length === 0) {
      loadAllMembers();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setSnackbar({ message: 'Password tidak boleh kosong', type: 'error' });
      return;
    }

    // Validate password by checking with API
    fetch('/api/auth/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
          setSnackbar({ message: 'Login berhasil!', type: 'success' });
          setPassword('');
          // Load members immediately after login
          setTimeout(() => {
            loadAllMembers();
          }, 100);
        } else if (res.status === 401) {
          setSnackbar({ message: 'Password salah!', type: 'error' });
        } else {
          setSnackbar({ message: 'Terjadi kesalahan', type: 'error' });
        }
      })
      .catch(() => {
        setSnackbar({ message: 'Gagal terhubung ke server', type: 'error' });
      });
  };

  // Load ALL members from API
  const loadAllMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/members');
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
        console.log(`Loaded ${data.length} members`);
        if (data.length === 0) {
          setSnackbar({
            message: 'Belum ada member. Klik "+ Tambah Member" untuk mulai.',
            type: 'info',
          });
        }
      } else {
        console.error('Failed to fetch members:', response.status);
        setSnackbar({
          message: 'Gagal load members dari server',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to load members:', error);
      setSnackbar({
        message: `Error: ${String(error)}`,
        type: 'error',
      });
    }
    setLoading(false);
  };

  // Get filtered members for display (frontend search only)
  const getFilteredMembers = () => {
    if (!searchQuery) return members;
    return members.filter((m) => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const openAddModal = () => {
    setFormData({});
    setEditingId(null);
    setParentSearchQuery('');
    setShowModal(true);
  };

  const openEditModal = (member: FamilyMember) => {
    let parentIds: number[] = [];
    try {
      if (member.parentIds) {
        if (Array.isArray(member.parentIds)) {
          parentIds = member.parentIds as number[];
        } else if (typeof member.parentIds === 'string') {
          parentIds = JSON.parse(member.parentIds);
        }
      }
    } catch (e) {
      console.error('Failed to parse parentIds:', member.parentIds, e);
      parentIds = [];
    }

    let spouse: any = undefined;
    try {
      if (member.spouse) {
        if (typeof member.spouse === 'string') {
          spouse = JSON.parse(member.spouse);
        } else {
          spouse = member.spouse;
        }
      }
    } catch (e) {
      console.error('Failed to parse spouse:', member.spouse, e);
      spouse = undefined;
    }

    setFormData({
      ...member,
      selectedParentIds: parentIds,
      // Convert photo path to data URL for preview if it exists
      photo: member.photo ? member.photo : undefined,
      ...(spouse ? {
        spouseName: spouse.name,
        spouseArabicName: spouse.arabicName,
        spouseBirth: spouse.birth,
        spouseDeath: spouse.death,
        spouseGender: spouse.gender,
        spouseStatus: spouse.status,
        spouseAddress: spouse.address,
        spouseNotes: spouse.notes,
      } : {}),
    });
    setEditingId(member.id);
    setParentSearchQuery('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setEditingId(null);
    setParentSearchQuery('');
  };

  // Handle photo file change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately (as data URL for display only)
    const reader = new FileReader();
    reader.onload = (event) => {
      // Only store as preview for display in form, not as actual photo path
      setFormData({ ...formData, photo: event.target?.result as string });
    };
    reader.readAsDataURL(file);

    // Store file for upload later
    (e.target as any).photoFile = file;
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      // Validation: 
      // Gen 0: boleh tanpa parent
      // Gen 1: boleh 1-2 orang tua
      // Gen > 1: wajib 1 orang tua
      const generation = parseInt(String(formData.generation) || '0');
      const parentIds = formData.selectedParentIds || [];
      
      if (generation === 0 && parentIds.length > 0) {
        alert('Generasi 0 tidak boleh memilih orang tua!');
        setLoading(false);
        return;
      }

      if (generation === 1 && parentIds.length === 0) {
        alert('Generasi 1 wajib memilih minimal 1 orang tua!');
        setLoading(false);
        return;
      }

      if (generation > 1 && parentIds.length === 0) {
        alert(`Generasi ${generation} wajib memilih 1 orang tua!`);
        setLoading(false);
        return;
      }

      const url = editingId ? `/api/members?id=${editingId}` : '/api/members';
      const method = editingId ? 'PUT' : 'POST';

      // Build spouse object from form fields
      // If ANY spouse field is filled, create object. If ALL are empty, set to null to clear data
      const hasAnySpouseData = 
        formData.spouseName || 
        formData.spouseArabicName ||
        formData.spouseBirth || 
        formData.spouseDeath ||
        formData.spouseGender ||
        formData.spouseStatus ||
        formData.spouseAddress ||
        formData.spouseNotes;

      const spouse = hasAnySpouseData ? {
        name: formData.spouseName || '',
        arabicName: formData.spouseArabicName,
        birth: formData.spouseBirth,
        death: formData.spouseDeath,
        gender: formData.spouseGender as 'male' | 'female' | undefined,
        status: formData.spouseStatus,
        address: formData.spouseAddress,
        notes: formData.spouseNotes,
      } : null; // Set to null instead of undefined to ensure it's sent to API

      const payload = {
        ...formData,
        generation: generation,
        parentIds: parentIds,
        spouse: spouse,
        photo: undefined, // Will be set after upload or from existing
      };
      
      // Remove temporary spouse fields and selection arrays
      delete (payload as any).spouseName;
      delete (payload as any).spouseArabicName;
      delete (payload as any).spouseBirth;
      delete (payload as any).spouseDeath;
      delete (payload as any).spouseGender;
      delete (payload as any).spouseStatus;
      delete (payload as any).spouseAddress;
      delete (payload as any).spouseNotes;
      delete (payload as any).selectedParentIds;
      
      // Clean up payload - remove unnecessary fields
      delete (payload as any).createdAt;
      delete (payload as any).updatedAt;

      // Handle photo upload if file exists
      const fileInput = document.getElementById('photo-input') as HTMLInputElement;
      const photoFile = fileInput?.files?.[0];
      // Start with existing photo path from database (if editing), or undefined if new
      let photoPath: string | undefined = editingId && typeof formData.photo === 'string' && formData.photo.startsWith('/') 
        ? formData.photo 
        : undefined;

      if (photoFile && editingId) {
        // Upload new photo for existing member
        const formDataUpload = new FormData();
        formDataUpload.append('file', photoFile);
        formDataUpload.append('memberId', String(editingId));

        try {
          const uploadResponse = await fetch('/api/members/upload', {
            method: 'POST',
            headers: {
              'x-admin-password': password,
            },
            body: formDataUpload,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            photoPath = uploadData.photoPath;
          } else {
            const uploadError = await uploadResponse.json();
            alert(`Photo upload error: ${uploadError.error}`);
            setLoading(false);
            return;
          }
        } catch (uploadError) {
          alert(`Photo upload failed: ${String(uploadError)}`);
          setLoading(false);
          return;
        }
      }

      payload.photo = photoPath;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // If creating new member, upload photo with the new ID returned from server
        if (!editingId && photoFile) {
          const newMember = await response.json();
          const formDataUpload = new FormData();
          formDataUpload.append('file', photoFile);
          formDataUpload.append('memberId', String(newMember.id));

          try {
            const uploadResponse = await fetch('/api/members/upload', {
              method: 'POST',
              headers: {
                'x-admin-password': password,
              },
              body: formDataUpload,
            });

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              // Update member with photo path - only send photo field to avoid timestamp conflicts
              const updatePayload = { photo: uploadData.photoPath };
              const updateResponse = await fetch(`/api/members?id=${newMember.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'x-admin-password': password,
                },
                body: JSON.stringify(updatePayload),
              });
              
              if (!updateResponse.ok) {
                const updateError = await updateResponse.json();
                console.error('Failed to update member with photo path:', updateError);
              }
            } else {
              const uploadErr = await uploadResponse.json();
              console.error('Photo upload failed for new member:', uploadErr);
            }
          } catch (uploadError) {
            console.error('Photo upload failed for new member:', uploadError);
          }
        }

        await loadAllMembers();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to save member:', error);
      alert('Failed to save member');
    }
    setLoading(false);
  };

  const handleDeleteMember = async (id: number) => {
    // Check if member has children
    const children = getMemberChildren(id);
    if (children.length > 0) {
      const childNames = children.map((c) => c.name).join(', ');
      setSnackbar({
        message: `Orang ini mempunyai ${children.length} anak (${childNames}). Tidak bisa dihapus. Hanya bisa diedit.`,
        type: 'error',
      });
      return;
    }

    if (!confirm('Yakin hapus member ini?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/members?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': password,
        },
      });

      if (response.ok) {
        await loadAllMembers();
        closeModal();
        setSnackbar({
          message: 'Member berhasil dihapus',
          type: 'success',
        });
      } else {
        const error = await response.json();
        setSnackbar({
          message: `Error: ${error.error}`,
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to delete member:', error);
      setSnackbar({
        message: 'Failed to delete member',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoArabify = async () => {
    if (!confirm('Auto-generate nama Arab untuk semua member yang belum punya? Ini akan overwrite data yang kosong.')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/auto-arabify', {
        method: 'POST',
        headers: {
          'x-admin-password': password,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSnackbar({
          message: `✓ ${result.updated} member updated dengan nama Arab, ${result.skipped} sudah ada`,
          type: 'success',
        });
        await loadAllMembers();
      } else {
        const error = await response.json();
        setSnackbar({
          message: `Error: ${error.error}`,
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to auto-arabify:', error);
      setSnackbar({
        message: 'Failed to auto-arabify members',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
            >
              Login
            </button>
          </form>
        </div>

        {/* Snackbar */}
        {snackbar && (
          <div
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-3 shadow-lg ${
              snackbar.type === 'success'
                ? 'bg-green-500'
                : snackbar.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
            }`}
          >
            <span className="text-xl leading-none">
              {snackbar.type === 'success' ? '✓' : snackbar.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span className="flex-1">{snackbar.message}</span>
            <button
              onClick={closeSnackbar}
              className="text-white hover:opacity-80 ml-2 text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  }

  // Helper to render photo with fallback icon
  const renderMemberPhoto = (photoPath?: string) => {
    if (photoPath) {
      return (
        <img
          src={photoPath}
          alt="Foto Profil"
          className="w-12 h-12 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  return (
    <>
      <AdminNavbar 
        isDark={isDark} 
        onToggleTheme={() => setIsDark(!isDark)} 
      />
      <div className={`min-h-screen p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin</h1>

        {/* Menu Navigation */}
        <div className="mb-8 border-b border-gray-700">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveMenu('members')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeMenu === 'members'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Family Members
            </button>
            <button
              onClick={() => setActiveMenu('gallery')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeMenu === 'gallery'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Gallery Family
            </button>
          </div>
        </div>

        {/* Family Members Section */}
        {activeMenu === 'members' && (
          <div>
            {/* Search & Add Button */}
            <div className="mb-6 flex gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Cari member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:outline-none"
              />
              <button
                onClick={openAddModal}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition font-bold"
              >
                + Tambah Member
              </button>
              <button
                onClick={() => loadAllMembers()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                Refresh
              </button>
              {loading && <span className="text-gray-400 px-4 py-2">Loading...</span>}
            </div>

            {/* Simple Tips */}
            <div className="mb-4 text-sm text-gray-300 italic">
              💡 Klik nama keluarga yang ingin di-edit
            </div>

            {/* Members Table - Desktop */}
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-white">Foto</th>
                    <th className="px-4 py-3 text-left text-white">Nama</th>
                    <th className="px-4 py-3 text-left text-white">Nama Arab</th>
                    <th className="px-4 py-3 text-left text-white">Gen</th>
                    <th className="px-4 py-3 text-left text-white">Gender</th>
                    <th className="px-4 py-3 text-left text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredMembers().map((member) => (
                    <tr 
                      key={member.id} 
                      onClick={() => openEditModal(member)}
                      className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                      title="Klik untuk edit data member"
                    >
                      <td className="px-4 py-3">
                        {renderMemberPhoto(member.photo)}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{member.name}</td>
                      <td className="px-4 py-3 text-gray-300">{member.arabicName || '-'}</td>
                      <td className="px-4 py-3 text-gray-300">{member.generation}</td>
                      <td className="px-4 py-3 text-gray-300">{member.gender || '-'}</td>
                      <td className="px-4 py-3 text-gray-300">{member.status || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredMembers().length === 0 && (
                <div className="p-8 text-center text-gray-400">Tidak ada members</div>
              )}
            </div>

            {/* Members Cards - Mobile */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {getFilteredMembers().map((member) => (
                <div
                  key={member.id}
                  onClick={() => openEditModal(member)}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 hover:bg-gray-750 cursor-pointer transition-colors shadow-lg"
                  title="Klik untuk edit data member"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {renderMemberPhoto(member.photo)}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-white mb-1">{member.name}</h3>
                      <div className="text-sm text-gray-400 space-y-1">
                        {member.arabicName && <p><span className="text-gray-500">Arab:</span> {member.arabicName}</p>}
                        <p><span className="text-gray-500">Gen:</span> {member.generation}</p>
                        {member.gender && <p><span className="text-gray-500">Gender:</span> {member.gender}</p>}
                        {member.status && <p><span className="text-gray-500">Status:</span> {member.status}</p>}
                      </div>
                    </div>
                    <div className="flex-shrink-0 pt-1">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
              {getFilteredMembers().length === 0 && (
                <div className="p-8 text-center text-gray-400">Tidak ada members</div>
              )}
            </div>
          </div>
        )}

        {/* Gallery Family Section */}
        {activeMenu === 'gallery' && (
          <GallerySection password={password} isAuthenticated={isAuthenticated} />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? 'Edit Member' : 'Tambah Member'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6">
              {/* Foto Profil - Circular at top center */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <input
                    type="file"
                    id="photo-input"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(e)}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-input"
                    className="flex items-center justify-center w-32 h-32 rounded-full bg-gray-700 border-2 border-dashed border-gray-500 hover:border-gray-400 cursor-pointer transition-colors"
                  >
                    {formData.photo ? (
                      <img
                        src={formData.photo}
                        alt="Preview"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs">Upload</span>
                      </div>
                    )}
                  </label>
                  {formData.photo && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: undefined })}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      title="Hapus foto"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mb-6">Max 5MB. Format: JPEG, PNG, WebP, GIF</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Nama - Required */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nama <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Contoh: Bayu Farid Mulyanto"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                    required
                  />
                </div>

                {/* Nama Panggilan */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nama Panggilan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bayu, Farid"
                    value={formData.nickname || ''}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                  />
                </div>

                {/* Nama Arab */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nama Arab</label>
                  <input
                    type="text"
                    placeholder="Opsional"
                    value={formData.arabicName || ''}
                    onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                  >
                    <option value="">Pilih Gender</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>

                {/* Generasi - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Generasi <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-400 mb-1">Gen 0: Founder/Awal silsilah | Gen 1: Anak dari Gen 0 | Gen 2: Cucu, dst.</p>
                  <input
                    type="text"
                    placeholder="0, 1, 2, 3..."
                    value={formData.generation !== undefined ? String(formData.generation) : ''}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (val === '' || /^\d+$/.test(val)) {
                        setFormData({ ...formData, generation: val ? parseInt(val) : undefined });
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                    required
                  />
                </div>

                {/* Tanggal/Lokasi Lahir */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Lahir (Tanggal & Lokasi)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Surakarta, 30 Januari 1999"
                    value={formData.birth || ''}
                    onChange={(e) => setFormData({ ...formData, birth: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                  />
                </div>

                {/* Tanggal/Lokasi Meninggal */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Meninggal (Tanggal & Lokasi)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jakarta, 15 Maret 2020"
                    value={formData.death || ''}
                    onChange={(e) => setFormData({ ...formData, death: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                  >
                    <option value="">Pilih Status</option>
                    <option value="alive">Hidup</option>
                    <option value="deceased">Meninggal</option>
                  </select>
                </div>

                {/* Nomor Urut Anak */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nomor Urut Anak</label>
                  <input
                    type="number"
                    placeholder="1, 2, 3..."
                    value={formData.childNumber || ''}
                    onChange={(e) => setFormData({ ...formData, childNumber: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                  />
                </div>

                {/* Alamat */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Alamat</label>
                  <input
                    type="text"
                    placeholder="Alamat saat ini atau terakhir diketahui"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Parent Selection - Required */}
              <div className="md:col-span-2 mb-6 border-t border-gray-600 pt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Orang Tua (Parent) <span className="text-red-500">*</span></label>
                <p className="text-xs text-gray-400 mb-2">
                  {formData.generation === 0 
                    ? 'Gen 0 boleh kosong (tidak perlu orang tua)'
                    : formData.generation === 1
                    ? 'Gen 1 bisa pilih 1-2 orang tua (ayah dan ibu)'
                    : `Gen ${formData.generation} wajib pilih 1 orang tua`
                  }
                </p>
                <input
                  type="text"
                  placeholder="Cari nama orang tua..."
                  value={parentSearchQuery}
                  onChange={(e) => setParentSearchQuery(e.target.value)}
                  className="w-full px-3 py-1 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none text-sm"
                />
                <div className="max-h-40 overflow-y-auto bg-gray-700 rounded border border-gray-600 p-2">
                  {members.length === 0 ? (
                    <div className="text-gray-400 text-sm">Loading members...</div>
                  ) : (
                    members
                      .filter((m) => m.id !== editingId && m.name.toLowerCase().includes(parentSearchQuery.toLowerCase()))
                      .map((m) => {
                        const isGen1 = formData.generation === 1;
                        const isSelected = (formData.selectedParentIds || []).includes(m.id);
                        const maxReached = isGen1 && (formData.selectedParentIds || []).length >= 2 && !isSelected;

                        return (
                          <label key={m.id} className={`flex items-center text-gray-300 mb-1 cursor-pointer hover:bg-gray-600 px-1 py-1 rounded ${maxReached ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <input
                              type={isGen1 ? 'checkbox' : 'radio'}
                              name={isGen1 ? undefined : 'parent'}
                              checked={isSelected}
                              disabled={maxReached}
                              onChange={(e) => {
                                if (isGen1) {
                                  // Checkbox logic for Gen 1
                                  const currentIds = formData.selectedParentIds || [];
                                  if (e.target.checked) {
                                    if (currentIds.length < 2) {
                                      setFormData({
                                        ...formData,
                                        selectedParentIds: [...currentIds, m.id],
                                      });
                                    }
                                  } else {
                                    setFormData({
                                      ...formData,
                                      selectedParentIds: currentIds.filter((id) => id !== m.id),
                                    });
                                  }
                                } else {
                                  // Radio logic for other generations
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      selectedParentIds: [m.id],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      selectedParentIds: [],
                                    });
                                  }
                                }
                              }}
                              className="mr-2 cursor-pointer"
                            />
                            <span className="text-sm">{m.name} (Gen {m.generation})</span>
                          </label>
                        );
                      })
                  )}
                </div>
                {(formData.selectedParentIds || []).length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    <strong>Orang tua terpilih ({(formData.selectedParentIds || []).length}/{formData.generation === 1 ? '2' : '1'}):</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(formData.selectedParentIds || []).map((parentId) => {
                        const parent = members.find((m) => m.id === parentId);
                        return (
                          <span key={parentId} className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            {parent?.name || parentId}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  selectedParentIds: [],
                                });
                              }}
                              className="ml-1 hover:bg-red-600 px-1 rounded"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Spouse Section */}
              <div className="border-t border-gray-600 pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Data Pasangan (Opsional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nama Pasangan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Siti Nur Azizah"
                      value={formData.spouseName || ''}
                      onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nama Arab Pasangan</label>
                    <input
                      type="text"
                      placeholder="Opsional"
                      value={formData.spouseArabicName || ''}
                      onChange={(e) => setFormData({ ...formData, spouseArabicName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Lahir (Tanggal & Lokasi)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Yogyakarta, 20 Mei 1995"
                      value={formData.spouseBirth || ''}
                      onChange={(e) => setFormData({ ...formData, spouseBirth: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Meninggal (Tanggal & Lokasi)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Bandung, 10 April 2018"
                      value={formData.spouseDeath || ''}
                      onChange={(e) => setFormData({ ...formData, spouseDeath: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Gender Pasangan</label>
                    <select
                      value={formData.spouseGender || ''}
                      onChange={(e) => setFormData({ ...formData, spouseGender: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                    >
                      <option value="">Pilih Gender</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Status Pasangan</label>
                    <select
                      value={formData.spouseStatus || ''}
                      onChange={(e) => setFormData({ ...formData, spouseStatus: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                    >
                      <option value="">Pilih Status</option>
                      <option value="alive">Hidup</option>
                      <option value="deceased">Meninggal</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Alamat Pasangan</label>
                    <input
                      type="text"
                      placeholder="Alamat saat ini atau terakhir diketahui"
                      value={formData.spouseAddress || ''}
                      onChange={(e) => setFormData({ ...formData, spouseAddress: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Catatan Pasangan</label>
                    <textarea
                      placeholder="Informasi tambahan tentang pasangan"
                      value={formData.spouseNotes || ''}
                      onChange={(e) => setFormData({ ...formData, spouseNotes: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-600 pt-6 mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">Deskripsi/Catatan</label>
                <textarea
                  placeholder="Informasi tambahan tentang member ini"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 border-t border-gray-600 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : editingId ? 'Update' : 'Tambah'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(editingId)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
                    disabled={loading}
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg text-white z-50 flex items-center gap-2 max-w-sm ${
          snackbar.type === 'error' ? 'bg-red-600' : snackbar.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
        }`}>
          <span className="text-xl">
            {snackbar.type === 'error' ? '✕' : snackbar.type === 'success' ? '✓' : 'ℹ'}
          </span>
          <span className="flex-1">{snackbar.message}</span>
          <button
            onClick={closeSnackbar}
            className="text-white hover:opacity-80 ml-2 text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
    </>
  );
}
