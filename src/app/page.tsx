'use client';

import { useState, useEffect, useMemo } from 'react';
import { GitBranch, Users, Search as SearchIcon, Home as HomeIcon, Heart, ChevronDown, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { FamilyTree } from '@/components/FamilyTree';
import { FamilySearch } from '@/components/FamilySearch';
import { DatabaseMemberSearch } from '@/components/DatabaseMemberSearch';
import { InteractiveTreeVisualizer } from '@/components/InteractiveTreeVisualizer';
import { Tawasul } from '@/components/Tawasul';
import { GenerasiSilsilah } from '@/components/GenerasiSilsilah';
import PublicGallery from '@/components/PublicGallery';

interface FamilyMember {
  id: number;
  name: string;
  gender?: string;
  generation: number;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: any;
}

export default function Page() {
  const [currentView, setCurrentView] = useState<'home' | 'tree' | 'search' | 'tawasul' | 'generasi' | 'gallery'>('home');
  const [isDark, setIsDark] = useState(true); // Default dark mode
  const [mounted, setMounted] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<Set<number>>(new Set());
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const FEATURES_COUNT = 6;
  const VISIBLE_CARDS = 2;

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
        setStatsLoading(false);
      }
    };
    
    loadMembers();
  }, []);

  // Auto-carousel animation every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % FEATURES_COUNT);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handler for next button
  const handleCarouselNext = () => {
    setCarouselIndex(prev => (prev + 1) % FEATURES_COUNT);
  };

  // Handler for previous button
  const handleCarouselPrev = () => {
    setCarouselIndex(prev => (prev - 1 + FEATURES_COUNT) % FEATURES_COUNT);
  };

  // Calculate statistics dynamically from database
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const generations = new Set(members.map(m => m.generation)).size;
    const maleCount = members.filter(m => m.gender === 'male').length;
    const femaleCount = members.filter(m => m.gender === 'female').length;
    // Get 3 latest updated members
    const sorted = [...members].sort((a, b) => {
      const aTime = new Date(a.updatedAt || 0).getTime();
      const bTime = new Date(b.updatedAt || 0).getTime();
      return bTime - aTime;
    });
    const latestUpdates = sorted.slice(0, 3);
    
    return {
      totalMembers,
      generations,
      maleCount,
      femaleCount,
      latestUpdates
    };
  }, [members]);

  // Features data
  const featuresData = [
    {
      icon: GitBranch,
      color: 'purple',
      title: 'Pohon Silsilah',
      description: `Visualisasi lengkap silsilah keluarga besar dengan ${stats.generations} generasi yang dapat diperluas dan di-scroll.`,
      view: 'tree' as const,
    },
    {
      icon: Users,
      color: 'blue',
      title: 'Profil Anggota',
      description: 'Informasi detail setiap anggota keluarga termasuk nama arab, tanggal lahir, pasangan, dan alamat.',
      view: 'search' as const,
    },
    {
      icon: SearchIcon,
      color: 'green',
      title: 'Pencarian Cepat',
      description: 'Cari anggota keluarga berdasarkan nama, nama arab, pasangan, atau deskripsi dengan mudah.',
      view: 'search' as const,
    },
    {
      icon: Heart,
      color: 'red',
      title: 'Tawasul',
      description: 'Daftar dan informasi lengkap anggota keluarga yang telah meninggal (Alm/Almh) untuk tujuan tawasul.',
      view: 'tawasul' as const,
    },
    {
      icon: Users,
      color: 'indigo',
      title: 'Generasi',
      description: 'Lihat anggota keluarga yang dikelompokkan berdasarkan generasi dengan detail lengkap untuk masing-masing.',
      view: 'generasi' as const,
    },
    {
      icon: ImageIcon,
      color: 'orange',
      title: 'Galeri Keluarga',
      description: 'Jelajahi koleksi foto keluarga yang diorganisir berdasarkan tahun dan acara khusus untuk mengabadikan momen berharga.',
      view: 'gallery' as const,
    },
  ];

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Detect if member was recently created or updated
  const getUpdateType = (member: FamilyMember) => {
    if (!member.createdAt || !member.updatedAt) return null;
    try {
      const created = new Date(member.createdAt).getTime();
      const updated = new Date(member.updatedAt).getTime();
      // If difference is less than 5 seconds, consider it as create
      return (updated - created) < 5000 ? 'created' : 'updated';
    } catch {
      return 'updated';
    }
  };

  useEffect(() => {
    setMounted(true);
    // Check localStorage and system preference, but default to dark
    const stored = localStorage.getItem('theme');
    const dark = stored ? stored === 'dark' : true; // Default to dark
    setIsDark(dark);
    
    // Apply immediately
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newDark = !prev;
      const html = document.documentElement;
      if (newDark) {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newDark;
    });
  };

  const toggleFeature = (index: number) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFeatures(newExpanded);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar - semua navigasi dalam satu bar */}
      <Navbar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Home View */}
        {currentView === 'home' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gray-900 dark:text-white">Silsilah Keluarga Besar</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh)</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Jelajahi sejarah dan genealogi keluarga besar H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh) melalui pohon silsilah interaktif. Temukan informasi detail tentang setiap anggota keluarga dan hubungan kekeluargaan mereka.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setCurrentView('tree')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  Lihat Pohon Silsilah
                </button>
                <button
                  onClick={() => setCurrentView('search')}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg font-semibold hover:border-purple-600 hover:text-purple-600 dark:hover:border-purple-400 dark:hover:text-purple-400 transition-all"
                >
                  Cari Anggota Keluarga
                </button>
              </div>
            </section>

            {/* Features Carousel */}
            <section className="space-y-4">
              {/* Desktop Carousel with Auto-scroll */}
              <div className="hidden md:block relative">
                <div className="overflow-hidden rounded-lg">
                  <style>{`
                    @keyframes carouselSlide {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    .carousel-track {
                      animation: carouselSlide 30s linear infinite;
                      display: flex;
                      width: 200%;
                    }
                    .carousel-track:hover {
                      animation-play-state: paused;
                    }
                  `}</style>
                  <div className="carousel-track">
                    {[...featuresData, ...featuresData].map((feature, idx) => {
                      const Icon = feature.icon;
                      const colorClasses = {
                        purple: 'text-purple-600',
                        blue: 'text-blue-600',
                        green: 'text-green-600',
                        red: 'text-red-600',
                        indigo: 'text-indigo-600',
                        orange: 'text-orange-600',
                      };
                      return (
                        <div key={idx} className="w-1/2 flex-shrink-0 px-3">
                          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50" onClick={() => setCurrentView(feature.view)}>
                            <div className="w-full p-6">
                              <div className="flex items-start gap-3">
                                <Icon className={`w-8 h-8 ${colorClasses[feature.color as keyof typeof colorClasses]} flex-shrink-0 mt-0.5`} />
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{feature.description}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-4 gap-2">
                  <button
                    onClick={handleCarouselPrev}
                    className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex gap-2">
                    {featuresData.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          carouselIndex % FEATURES_COUNT === idx
                            ? 'bg-purple-600 dark:bg-purple-400 w-6'
                            : 'bg-gray-300 dark:bg-slate-600'
                        }`}
                        aria-label={`Go to feature ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleCarouselNext}
                    className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mobile Accordion */}
              <div className="md:hidden space-y-3">
                {featuresData.map((feature, idx) => {
                  const Icon = feature.icon;
                  const colorClasses = {
                    purple: 'text-purple-600',
                    blue: 'text-blue-600',
                    green: 'text-green-600',
                    red: 'text-red-600',
                    indigo: 'text-indigo-600',
                    orange: 'text-orange-600',
                  };
                  return (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                      <button
                        onClick={() => toggleFeature(idx)}
                        className="w-full p-4 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1 text-left">
                          <Icon className={`w-8 h-8 ${colorClasses[feature.color as keyof typeof colorClasses]} flex-shrink-0 mt-0.5`} />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFeatures.has(idx) ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedFeatures.has(idx) && (
                        <div className="px-4 pb-4 border-t border-gray-200 dark:border-slate-700">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{feature.description}</p>
                          <button
                            onClick={() => setCurrentView(feature.view)}
                            className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
                          >
                            Buka Fitur
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Statistics */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-purple-100 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <p className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                  {statsLoading ? '...' : stats.totalMembers}
                </p>
                <p className="text-sm sm:text-base text-purple-600 dark:text-purple-300 font-semibold">Total Anggota</p>
              </div>
              <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-blue-100 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                  {statsLoading ? '...' : stats.generations}
                </p>
                <p className="text-sm sm:text-base text-blue-600 dark:text-blue-300 font-semibold">Generasi</p>
              </div>
              <div className="p-4 sm:p-6 bg-gradient-to-br from-pink-50 dark:from-pink-900/20 to-pink-100 dark:to-pink-800/20 rounded-lg border border-pink-200 dark:border-pink-700">
                <p className="text-2xl sm:text-3xl font-bold text-pink-700 dark:text-pink-400 mb-2">
                  {statsLoading ? '...' : stats.maleCount}
                </p>
                <p className="text-sm sm:text-base text-pink-600 dark:text-pink-300 font-semibold">Laki-laki</p>
              </div>
              <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 dark:from-green-900/20 to-green-100 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400 mb-2">
                  {statsLoading ? '...' : stats.femaleCount}
                </p>
                <p className="text-sm sm:text-base text-green-600 dark:text-green-300 font-semibold">Perempuan</p>
              </div>
            </section>

            {/* Info Section */}
            <section className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Tentang Silsilah Ini</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4 text-justify">
                <p className="italic text-center">
                  Assalamu'alaikum Wr. Wb.
                </p>
                
                <p>
                  Alhamdulillah puji syukur marilah kita panjatkan kehadirat Allah SWT atas semua Rahmad, Hidayah serta Inayah-Nya kepada kita semua, sehingga kami dapat menyelesaikan dokumentasi Silsilah Keluarga Besar H. Abdur Rochman (Alm) dan Hj. Fathmiyah (Almh). Sholawat serta salam semoga selalu terlimpahkan kepada junjungan kita Nabi Muhammad SAW.
                </p>

                <p>
                  Website silsilah ini telah kami buat untuk memudahkan anggota Keluarga Besar H. Abdur Rochman dan Hj. Fathmiyah dalam menjalin tali silaturahmi yang lebih erat. Mengingat karena waktu yang terbatas serta jarak yang jauh membuat kita selama ini belum bisa menjalin tali silaturahmi yang maksimal.
                </p>

                <div className="hidden md:block">
                  <p>
                    Melalui platform digital ini, kami berharap dapat mendekatkan hubungan keluarga dan mempererat ikatan silaturahmi di antara kita semua.
                  </p>

                  <p>
                    Website ini memuat dokumentasi genealogi lengkap dengan lebih dari {stats.totalMembers} anggota keluarga yang tersebar di {stats.generations} generasi. Setiap anggota keluarga tercatat dengan informasi detail termasuk nama lengkap dalam bahasa Indonesia dan Arab, tanggal lahir dan meninggal (jika ada), nama pasangan, dan alamat lengkap. Melalui fitur pencarian dan visualisasi pohon silsilah interaktif, Anda dapat dengan mudah menjelajahi hubungan kekeluargaan dan memahami garis keturunan dengan lebih baik.
                  </p>

                  <p>
                    Website ini telah kami susun berkat bantuan dari saudara-saudara semua sehingga dapat memperlancar pembuatan silsilah digital ini. Untuk itu kami menyampaikan banyak terima kasih kepada semua pihak yang telah berkontribusi.
                  </p>

                  <p>
                    Terlepas dari itu semua, kami menyadari sepenuhnya bahwa masih ada kekurangan disana sini. Kami juga menyadari bahwa masih ada kemungkinan anggota keluarga yang belum terdata, atau masih terdapat penulisan nama yang salah ataupun kurang lengkap. Untuk itu kami mohon maaf sebesar-besarnya. Dengan tangan terbuka kami menerima segala saran dan kritik dari saudara semua agar kami dapat memperbaiki data silsilah ini. Saran dan kritik dapat disampaikan melalui <a href="https://wa.me/6281334584361" className="text-purple-600 dark:text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">WhatsApp 081-334-584-361 (Bahril)</a>.
                  </p>

                  <p>
                    Akhir kata kami berharap semoga website silsilah ini dapat memberikan manfaat bagi kita semua dan membantu memperkuat ikatan keluarga kita. Aamiin.....
                  </p>

                  <p className="italic text-center">
                    Wassalamu'alaikum Wr. Wb.
                  </p>
                </div>

                {!expandedAbout && (
                  <div className="md:hidden text-center mt-4">
                    <button
                      onClick={() => setExpandedAbout(true)}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold underline"
                    >
                      Baca Selengkapnya
                    </button>
                  </div>
                )}

                {expandedAbout && (
                  <>
                    <p className="md:hidden">
                      Melalui platform digital ini, kami berharap dapat mendekatkan hubungan keluarga dan mempererat ikatan silaturahmi di antara kita semua.
                    </p>

                    <p className="md:hidden">
                      Website ini memuat dokumentasi genealogi lengkap dengan lebih dari {stats.totalMembers} anggota keluarga yang tersebar di {stats.generations} generasi. Setiap anggota keluarga tercatat dengan informasi detail termasuk nama lengkap dalam bahasa Indonesia dan Arab, tanggal lahir dan meninggal (jika ada), nama pasangan, dan alamat lengkap. Melalui fitur pencarian dan visualisasi pohon silsilah interaktif, Anda dapat dengan mudah menjelajahi hubungan kekeluargaan dan memahami garis keturunan dengan lebih baik.
                    </p>

                    <p className="md:hidden">
                      Website ini telah kami susun berkat bantuan dari saudara-saudara semua sehingga dapat memperlancar pembuatan silsilah digital ini. Untuk itu kami menyampaikan banyak terima kasih kepada semua pihak yang telah berkontribusi.
                    </p>

                    <p className="md:hidden">
                      Terlepas dari itu semua, kami menyadari sepenuhnya bahwa masih ada kekurangan disana sini. Kami juga menyadari bahwa masih ada kemungkinan anggota keluarga yang belum terdata, atau masih terdapat penulisan nama yang salah ataupun kurang lengkap. Untuk itu kami mohon maaf sebesar-besarnya. Dengan tangan terbuka kami menerima segala saran dan kritik dari saudara semua agar kami dapat memperbaiki data silsilah ini. Saran dan kritik dapat disampaikan melalui <a href="https://wa.me/6281334584361" className="text-purple-600 dark:text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">WhatsApp 081-334-584-361 (Bahril)</a>.
                    </p>

                    <p className="md:hidden">
                      Akhir kata kami berharap semoga website silsilah ini dapat memberikan manfaat bagi kita semua dan membantu memperkuat ikatan keluarga kita. Aamiin.....
                    </p>

                    <p className="md:hidden italic text-center">
                      Wassalamu'alaikum Wr. Wb.
                    </p>

                    <div className="md:hidden text-center mt-4">
                      <button
                        onClick={() => setExpandedAbout(false)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold underline"
                      >
                        Tutup
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Recent Updates Section */}
            <section className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">3 Pembaruan Terakhir</h3>
              {statsLoading ? (
                <p className="text-center text-gray-600 dark:text-gray-400">Memuat data...</p>
              ) : stats.latestUpdates && stats.latestUpdates.length > 0 ? (
                <div className="space-y-4">
                  {stats.latestUpdates.map((member) => {
                    const updateType = getUpdateType(member);
                    const isCreated = updateType === 'created';
                    return (
                      <div key={member.id} className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-800 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0">
                          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${isCreated ? 'bg-green-100 dark:bg-green-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                            {isCreated ? (
                              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{member.name}</p>
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${isCreated ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                              {isCreated ? 'Ditambahkan' : 'Diedit'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(member.updatedAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400">Belum ada pembaruan</p>
              )}
            </section>
          </div>
        )}

        {/* Tree View */}
        {currentView === 'tree' && <InteractiveTreeVisualizer />}

        {/* Search View - Using Database Members */}
        {currentView === 'search' && <DatabaseMemberSearch />}

        {/* Tawasul View */}
        {currentView === 'tawasul' && <Tawasul />}

        {/* Generasi Silsilah View */}
        {currentView === 'generasi' && <GenerasiSilsilah />}

        {/* Gallery View */}
        {currentView === 'gallery' && <PublicGallery />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>© 2026 Silsilah Keluarga Besar H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh). Semua hak dilindungi.</p>
          <p className="text-sm mt-2">Dibuat dengan teknologi modern untuk melestarikan sejarah keluarga</p>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-xs">
              Dikembangkan oleh{' '}
              <a
                href="https://dastrevas.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
              >
                dastrevas.coding ©
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
