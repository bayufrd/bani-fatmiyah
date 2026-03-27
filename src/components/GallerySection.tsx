'use client';

import { useState, useEffect } from 'react';
import type { FamilyGallery } from '@/lib/db';

interface GallerySectionProps {
  password: string;
  isAuthenticated: boolean;
}

export default function GallerySection({ password, isAuthenticated }: GallerySectionProps) {
  const [gallery, setGallery] = useState<FamilyGallery[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [albumTitle, setAlbumTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [albumsByYear, setAlbumsByYear] = useState<Array<{ year: number; albums: string[] }>>([]);
  const [albumInputMode, setAlbumInputMode] = useState<'select' | 'new'>('select');
  const [expandedAlbums, setExpandedAlbums] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<FamilyGallery | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error'; show: boolean }>({
    message: '',
    type: 'success',
    show: false,
  });
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; photoId: number | null }>({
    show: false,
    photoId: null,
  });

  // Get current year and last 10 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // Snackbar helper
  const showSnackbar = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbar({ message, type, show: true });
    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      // Load gallery photos
      const photoRes = await fetch('/api/gallery');
      if (photoRes.ok) {
        const photoData = await photoRes.json();
        setGallery(photoData);
      }

      // Load available albums grouped by year (from DB + filesystem)
      const albumRes = await fetch('/api/gallery/albums');
      if (albumRes.ok) {
        const albumData = await albumRes.json();
        setAlbumsByYear(albumData.albumsByYear);
      }
    } catch (error) {
      console.error('Failed to load gallery:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    // Generate preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    setSelectedFiles(files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (!albumTitle.trim()) {
      showSnackbar('Silakan masukkan judul album', 'error');
      return;
    }

    if (selectedFiles.length === 0) {
      showSnackbar('Silakan pilih minimal 1 foto', 'error');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('year', year);
      formData.append('folderName', albumTitle); // Use album title as folder name
      formData.append('albumTitle', albumTitle);

      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: {
          'x-admin-password': password,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        showSnackbar(`✅ Berhasil upload ${data.uploaded} foto`, 'success');
        setSelectedFiles([]);
        setPreviewUrls([]);
        setAlbumTitle('');
        setUploadProgress(0);
        loadGallery();
      } else {
        const error = await res.json();
        showSnackbar(`Gagal upload: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      showSnackbar('Gagal upload foto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = (id: number) => {
    setConfirmDelete({ show: true, photoId: id });
  };

  const confirmDeletePhoto = async (id: number) => {
    setConfirmDelete({ show: false, photoId: null });

    try {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': password,
        },
      });

      if (res.ok) {
        showSnackbar('✅ Foto berhasil dihapus', 'success');
        loadGallery();
      } else {
        showSnackbar('Gagal hapus foto', 'error');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showSnackbar('Gagal hapus foto', 'error');
    }
  };

  const clearPreview = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const toggleAlbumExpand = (albumKey: string) => {
    const newExpanded = new Set(expandedAlbums);
    if (newExpanded.has(albumKey)) {
      newExpanded.delete(albumKey);
    } else {
      newExpanded.add(albumKey);
    }
    setExpandedAlbums(newExpanded);
  };

  const groupByYearAndAlbum = () => {
    const grouped: Record<number, Record<string, FamilyGallery[]>> = {};
    
    gallery.forEach((photo) => {
      const year = photo.year;
      const albumTitle = photo.albumTitle || 'Unknown';
      
      if (!grouped[year]) {
        grouped[year] = {};
      }
      if (!grouped[year][albumTitle]) {
        grouped[year][albumTitle] = [];
      }
      grouped[year][albumTitle].push(photo);
    });
    
    return grouped;
  };

  const groupByFolder = () => {
    const grouped: Record<string, FamilyGallery[]> = {};
    gallery.forEach((photo) => {
      const folderName = photo.albumTitle || 'Unknown';
      
      if (!grouped[folderName]) {
        grouped[folderName] = [];
      }
      grouped[folderName].push(photo);
    });
    return grouped;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Upload Foto Gallery</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tahun</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Album Title Selection/Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Judul Album
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setAlbumInputMode('select')}
                  className={`flex-1 px-3 py-2 rounded border transition ${
                    albumInputMode === 'select'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Pilih yang Ada
                </button>
                <button
                  onClick={() => setAlbumInputMode('new')}
                  className={`flex-1 px-3 py-2 rounded border transition ${
                    albumInputMode === 'new'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Album Baru
                </button>
              </div>
              
              {albumInputMode === 'select' ? (
                <select
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                >
                  <option value="">-- Pilih Album --</option>
                  {albumsByYear.map((yearGroup) => (
                    <optgroup key={yearGroup.year} label={`📅 Tahun ${yearGroup.year}`}>
                      {yearGroup.albums.map((album) => (
                        <option key={`${yearGroup.year}-${album}`} value={album}>
                          {album}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Masukkan judul album baru"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none"
                />
              )}
              <p className="text-xs text-gray-400">
                {albumInputMode === 'select'
                  ? albumsByYear.length === 0
                    ? 'Belum ada album. Buat album baru terlebih dahulu.'
                    : `${albumsByYear.reduce((sum, ay) => sum + ay.albums.length, 0)} album tersedia`
                  : 'Album baru akan dibuat saat upload'}
              </p>
            </div>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center bg-gray-700/50 hover:bg-gray-700/70 transition-colors cursor-pointer"
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-white font-semibold">Drag & drop atau klik untuk pilih foto</p>
            <p className="text-gray-400 text-sm mt-1">Support: JPG, PNG, WebP, GIF (Max 5MB per foto)</p>
          </label>
        </div>

        {/* Preview Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Preview ({selectedFiles.length} foto)
              </h3>
              <button
                onClick={clearPreview}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded border border-gray-600"
                  />
                  <p className="text-xs text-gray-300 mt-1 truncate">{selectedFiles[idx].name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-2">{uploadProgress}%</p>
              </div>
            )}
            <button
              onClick={handleUpload}
              disabled={loading || !albumTitle.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition"
            >
              {loading ? 'Uploading...' : `Upload ${selectedFiles.length} Foto`}
            </button>
          </div>
        )}
      </div>

      {/* Gallery Display - Grouped by Year and Album */}
      <div className="space-y-10">
        <h2 className="text-2xl font-bold text-white mb-8">📷 Galeri Foto</h2>
        
        {gallery.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Belum ada foto gallery. Mulai upload foto pertama Anda!</p>
          </div>
        ) : (
          Object.entries(groupByYearAndAlbum())
            .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA)) // Sort by year descending
            .map(([year, albumsInYear]) => (
              <div key={year} className="bg-gray-800 rounded-lg overflow-hidden">
                {/* Year Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h3 className="text-2xl font-bold text-white">📅 {year}</h3>
                </div>
                
                {/* Albums within Year */}
                <div className="p-6 space-y-8">
                  {Object.entries(albumsInYear)
                    .sort(([albumA], [albumB]) => albumA.localeCompare(albumB))
                    .map(([albumTitle, photos]) => {
                      const albumKey = `${year}-${albumTitle}`;
                      const isExpanded = expandedAlbums.has(albumKey);
                      const PHOTOS_PER_PAGE = 5;
                      const visiblePhotos = isExpanded ? photos : photos.slice(0, PHOTOS_PER_PAGE);
                      const hasMorePhotos = photos.length > PHOTOS_PER_PAGE;
                      
                      return (
                        <div key={albumKey}>
                          {/* Album Title */}
                          <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                            <span className="inline-block w-1 h-6 bg-blue-400 rounded"></span>
                            {albumTitle}
                            <span className="text-sm text-gray-400 ml-2">({photos.length} foto)</span>
                          </h4>
                          
                          {/* Photos Grid with Lazy Loading */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {visiblePhotos.map((photo) => (
                              <div
                                key={photo.id}
                                className="relative group rounded-lg overflow-hidden bg-gray-700 aspect-square cursor-pointer"
                                onClick={() => setSelectedPhoto(photo)}
                              >
                                {/* Lazy Loading Image */}
                                <img
                                  src={photo.photoPath}
                                  alt={`Gallery photo - ${albumTitle}`}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                  <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
                                </div>
                                
                                {/* Delete Button - X in top right corner */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePhoto(photo.id);
                                  }}
                                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                  title="Hapus foto"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          {/* Load More Button */}
                          {hasMorePhotos && (
                            <div className="mt-4 flex justify-center">
                              <button
                                onClick={() => toggleAlbumExpand(albumKey)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                              >
                                {isExpanded
                                  ? `▲ Tampilkan lebih sedikit (${PHOTOS_PER_PAGE})`
                                  : `▼ Muat lebih banyak (+${photos.length - PHOTOS_PER_PAGE})`}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Photo Modal - Fullsize View */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg z-10"
              title="Tutup"
            >
              ×
            </button>

            {/* Image Container */}
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={selectedPhoto.photoPath}
                alt="Full view"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Info at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 rounded-b-lg">
              <p className="text-white text-sm">
                📅 {new Date(selectedPhoto.uploadedAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Navigation hint */}
            <div className="absolute bottom-4 right-4 text-gray-300 text-xs">
              Klik di area gelap untuk tutup
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete.show && confirmDelete.photoId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmDelete({ show: false, photoId: null })}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-xl font-bold text-white">Hapus Foto</h3>
            </div>

            <p className="text-gray-300 mb-6">
              Apakah Anda yakin ingin menghapus foto ini? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ show: false, photoId: null })}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              >
                Batal
              </button>
              <button
                onClick={() => confirmDeletePhoto(confirmDelete.photoId!)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar Notification */}
      {snackbar.show && (
        <div
          className={`fixed bottom-4 right-4 flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 z-50 ${
            snackbar.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {snackbar.type === 'success' ? (
            <span className="text-xl">✅</span>
          ) : (
            <span className="text-xl">❌</span>
          )}
          <span className="font-medium">{snackbar.message}</span>
        </div>
      )}
    </div>
  );
}
