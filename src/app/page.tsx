'use client';

import { useState, useEffect, useMemo } from 'react';
import { GitBranch, Users, Search as SearchIcon, Home as HomeIcon, Heart, ChevronDown } from 'lucide-react';
import { familyData } from '@/data/familyData';
import { Navbar } from '@/components/Navbar';
import { FamilyTree } from '@/components/FamilyTree';
import { FamilySearch } from '@/components/FamilySearch';
import { InteractiveTreeVisualizer } from '@/components/InteractiveTreeVisualizer';
import { Tawasul } from '@/components/Tawasul';
import { GenerasiSilsilah } from '@/components/GenerasiSilsilah';

export default function Page() {
  const [currentView, setCurrentView] = useState<'home' | 'tree' | 'search' | 'tawasul' | 'generasi'>('home');
  const [isDark, setIsDark] = useState(true); // Default dark mode
  const [mounted, setMounted] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<Set<number>>(new Set());
  const [expandedAbout, setExpandedAbout] = useState(false);

  // Calculate statistics dynamically
  const stats = useMemo(() => {
    const totalMembers = familyData.length;
    const generations = new Set(familyData.map(m => m.generation)).size;
    const maleCount = familyData.filter(m => m.gender === 'male').length;
    const femaleCount = familyData.filter(m => m.gender === 'female').length;
    
    return {
      totalMembers,
      generations,
      maleCount,
      femaleCount
    };
  }, []);

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

            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Feature 1: Pohon Silsilah */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div
                  className="hidden md:block w-full p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <GitBranch className="w-8 h-8 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pohon Silsilah</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Visualisasi lengkap silsilah keluarga besar dengan {stats.generations} generasi yang dapat diperluas dan di-scroll.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(0)}
                  className="md:hidden w-full p-6 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 text-left">
                    <GitBranch className="w-8 h-8 text-purple-600 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pohon Silsilah</h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFeatures.has(0) ? 'rotate-180' : ''}`} />
                </button>
                {expandedFeatures.has(0) && (
                  <div className="md:hidden px-6 pb-6 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Visualisasi lengkap silsilah keluarga besar dengan {stats.generations} generasi yang dapat diperluas dan di-scroll.
                    </p>
                  </div>
                )}
              </div>

              {/* Feature 2: Profil Anggota */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div
                  className="hidden md:block w-full p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Users className="w-8 h-8 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profil Anggota</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Informasi detail setiap anggota keluarga termasuk nama arab, tanggal lahir, pasangan, dan alamat.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(1)}
                  className="md:hidden w-full p-6 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 text-left">
                    <Users className="w-8 h-8 text-blue-600 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profil Anggota</h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFeatures.has(1) ? 'rotate-180' : ''}`} />
                </button>
                {expandedFeatures.has(1) && (
                  <div className="md:hidden px-6 pb-6 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Informasi detail setiap anggota keluarga termasuk nama arab, tanggal lahir, pasangan, dan alamat.
                    </p>
                  </div>
                )}
              </div>

              {/* Feature 3: Pencarian Cepat */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div
                  className="hidden md:block w-full p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <SearchIcon className="w-8 h-8 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pencarian Cepat</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Cari anggota keluarga berdasarkan nama, nama arab, pasangan, atau deskripsi dengan mudah.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(2)}
                  className="md:hidden w-full p-6 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 text-left">
                    <SearchIcon className="w-8 h-8 text-green-600 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pencarian Cepat</h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFeatures.has(2) ? 'rotate-180' : ''}`} />
                </button>
                {expandedFeatures.has(2) && (
                  <div className="md:hidden px-6 pb-6 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Cari anggota keluarga berdasarkan nama, nama arab, pasangan, atau deskripsi dengan mudah.
                    </p>
                  </div>
                )}
              </div>

              {/* Feature 4: Tawasul */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div
                  className="hidden md:block w-full p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Heart className="w-8 h-8 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tawasul</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Daftar dan informasi lengkap anggota keluarga yang telah meninggal (Alm/Almh) untuk tujuan tawasul.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(3)}
                  className="md:hidden w-full p-6 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 text-left">
                    <Heart className="w-8 h-8 text-red-600 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tawasul</h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFeatures.has(3) ? 'rotate-180' : ''}`} />
                </button>
                {expandedFeatures.has(3) && (
                  <div className="md:hidden px-6 pb-6 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Daftar dan informasi lengkap anggota keluarga yang telah meninggal (Alm/Almh) untuk tujuan tawasul.
                    </p>
                  </div>
                )}
              </div>

              {/* Feature 5: Generasi Silsilah */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div
                  className="hidden md:block w-full p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Users className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generasi</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Lihat anggota keluarga yang dikelompokkan berdasarkan generasi dengan detail lengkap untuk masing-masing.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(4)}
                  className="md:hidden w-full p-6 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 text-left">
                    <Users className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generasi</h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFeatures.has(4) ? 'rotate-180' : ''}`} />
                </button>
                {expandedFeatures.has(4) && (
                  <div className="md:hidden px-6 pb-6 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Lihat anggota keluarga yang dikelompokkan berdasarkan generasi dengan detail lengkap untuk masing-masing.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Statistics */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-purple-100 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <p className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">{stats.totalMembers}</p>
                <p className="text-sm sm:text-base text-purple-600 dark:text-purple-300 font-semibold">Total Anggota</p>
              </div>
              <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-blue-100 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">{stats.generations}</p>
                <p className="text-sm sm:text-base text-blue-600 dark:text-blue-300 font-semibold">Generasi</p>
              </div>
              <div className="p-4 sm:p-6 bg-gradient-to-br from-pink-50 dark:from-pink-900/20 to-pink-100 dark:to-pink-800/20 rounded-lg border border-pink-200 dark:border-pink-700">
                <p className="text-2xl sm:text-3xl font-bold text-pink-700 dark:text-pink-400 mb-2">{stats.maleCount}</p>
                <p className="text-sm sm:text-base text-pink-600 dark:text-pink-300 font-semibold">Laki-laki</p>
              </div>
              <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 dark:from-green-900/20 to-green-100 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400 mb-2">{stats.femaleCount}</p>
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
          </div>
        )}

        {/* Tree View */}
        {currentView === 'tree' && <InteractiveTreeVisualizer />}

        {/* Search View */}
        {currentView === 'search' && <FamilySearch />}

        {/* Tawasul View */}
        {currentView === 'tawasul' && <Tawasul />}

        {/* Generasi Silsilah View */}
        {currentView === 'generasi' && <GenerasiSilsilah />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 Silsilah Keluarga Besar H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh). Semua hak dilindungi.</p>
          <p className="text-sm mt-2">Dibuat dengan teknologi modern untuk melestarikan sejarah keluarga</p>
        </div>
      </footer>
    </div>
  );
}
