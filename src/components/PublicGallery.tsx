'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { FamilyGallery } from '@/lib/db';

interface AlbumGroup {
  year: number;
  albums: {
    title: string;
    photos: FamilyGallery[];
  }[];
}

export default function PublicGallery() {
  const [gallery, setGallery] = useState<FamilyGallery[]>([]);
  const [albumsByYear, setAlbumsByYear] = useState<AlbumGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<FamilyGallery | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselPhotos, setCarouselPhotos] = useState<FamilyGallery[]>([]);
  const [expandedAlbums, setExpandedAlbums] = useState<Set<string>>(new Set());
  const PHOTOS_PER_ALBUM = 5;

  useEffect(() => {
    loadGallery();
  }, []);

  // Auto-rotate carousel every 4 seconds
  useEffect(() => {
    if (carouselPhotos.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % carouselPhotos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselPhotos.length]);

  const loadGallery = async () => {
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data: FamilyGallery[] = await response.json();
        setGallery(data);

        // Group by year and album
        const grouped = groupByYearAndAlbum(data);
        setAlbumsByYear(grouped);

        // Get random photos for carousel (max 10)
        const randomPhotos = data.sort(() => Math.random() - 0.5).slice(0, 10);
        setCarouselPhotos(randomPhotos);
      }
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByYearAndAlbum = (photos: FamilyGallery[]): AlbumGroup[] => {
    const grouped: Record<number, Record<string, FamilyGallery[]>> = {};

    photos.forEach(photo => {
      const year = photo.year || new Date().getFullYear();
      const album = photo.albumTitle || 'Tanpa Label';

      if (!grouped[year]) {
        grouped[year] = {};
      }
      if (!grouped[year][album]) {
        grouped[year][album] = [];
      }
      grouped[year][album].push(photo);
    });

    // Convert to array and sort by year descending
    return Object.entries(grouped)
      .map(([yearStr, albums]) => ({
        year: parseInt(yearStr),
        albums: Object.entries(albums).map(([title, photos]) => ({
          title,
          photos: photos.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || '')),
        })),
      }))
      .sort((a, b) => b.year - a.year);
  };

  const handleCarouselPrev = () => {
    setCarouselIndex(prev => (prev - 1 + carouselPhotos.length) % carouselPhotos.length);
  };

  const handleCarouselNext = () => {
    setCarouselIndex(prev => (prev + 1) % carouselPhotos.length);
  };

  const toggleAlbumExpand = (albumKey: string) => {
    setExpandedAlbums(prev => {
      const newSet = new Set(prev);
      if (newSet.has(albumKey)) {
        newSet.delete(albumKey);
      } else {
        newSet.add(albumKey);
      }
      return newSet;
    });
  };

  const getDisplayedPhotos = (photos: FamilyGallery[], albumKey: string) => {
    const isExpanded = expandedAlbums.has(albumKey);
    return isExpanded ? photos : photos.slice(0, PHOTOS_PER_ALBUM);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat galeri...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-red-600">Galeri Keluarga</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Koleksi momen berharga keluarga besar H. Abdur Rochman & Hajjah Fathmiyah
          </p>
        </div>

        {/* Carousel Section */}
        {carouselPhotos.length > 0 && (
          <div className="mb-12">
            <div className="relative bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg">
              <div className="aspect-video bg-gray-100 dark:bg-slate-700 relative group">
                <img
                  src={carouselPhotos[carouselIndex].photoPath}
                  alt="Carousel"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>

              {/* Carousel Info */}
              <div className="p-4 bg-white dark:bg-slate-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {carouselPhotos[carouselIndex].albumTitle || 'Tanpa Label'} • {carouselPhotos[carouselIndex].year || new Date().getFullYear()}
                </p>
              </div>

              {/* Navigation */}
              <button
                onClick={handleCarouselPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>

              <button
                onClick={handleCarouselNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {carouselPhotos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === carouselIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Gallery by Year and Album */}
        <div className="space-y-12">
          {albumsByYear.map((yearGroup) => (
            <div key={yearGroup.year}>
              {/* Year Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  {yearGroup.year}
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mt-2" />
              </div>

              {/* Albums in Year */}
              <div className="space-y-8">
                {yearGroup.albums.map((album, albumIdx) => {
                  const albumKey = `${yearGroup.year}-${albumIdx}`;
                  const displayedPhotos = getDisplayedPhotos(album.photos, albumKey);
                  const hasMore = album.photos.length > PHOTOS_PER_ALBUM && !expandedAlbums.has(albumKey);
                  
                  return (
                    <div key={albumKey}>
                      {/* Album Title */}
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <span className="text-lg">🏷️</span>
                        {album.title}
                        <span className="text-sm text-gray-500 dark:text-gray-400">({album.photos.length} foto)</span>
                      </h3>

                      {/* Photos Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                        {displayedPhotos.map((photo) => (
                          <button
                            key={photo.id}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group relative overflow-hidden rounded-lg aspect-square bg-gray-100 dark:bg-slate-700 hover:shadow-lg transition-all"
                          >
                            <img
                              src={photo.photoPath}
                              alt={photo.albumTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>

                      {/* Load More Button */}
                      {hasMore && (
                        <button
                          onClick={() => toggleAlbumExpand(albumKey)}
                          className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                        >
                          Muat Lebih Banyak ({album.photos.length - PHOTOS_PER_ALBUM} foto lainnya)
                        </button>
                      )}

                      {/* Show Less Button */}
                      {expandedAlbums.has(albumKey) && album.photos.length > PHOTOS_PER_ALBUM && (
                        <button
                          onClick={() => toggleAlbumExpand(albumKey)}
                          className="w-full py-2 px-4 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-all"
                        >
                          Sembunyikan
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {albumsByYear.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">Galeri belum memiliki foto</p>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-slate-700/80 rounded-full hover:bg-white dark:hover:bg-slate-600 transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>

            <img
              src={selectedPhoto.photoPath}
              alt={selectedPhoto.albumTitle}
              className="w-full h-full object-contain"
              loading="lazy"
            />

            <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Album:</strong> {selectedPhoto.albumTitle || 'Tanpa Label'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Tahun:</strong> {selectedPhoto.year}
              </p>
              {selectedPhoto.uploadedAt && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Tanggal:</strong> {new Date(selectedPhoto.uploadedAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
