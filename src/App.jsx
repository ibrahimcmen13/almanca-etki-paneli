import React, { useState, useEffect, useMemo } from 'react';
import { Download, Printer, RefreshCw, Send, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase.js';
import { DURUMLAR, getDurum, normalizeIl } from './lib/constants.js';
import TurkeyMap from './components/TurkeyMap.jsx';
import ReportForm from './components/ReportForm.jsx';
import RecentFeed from './components/RecentFeed.jsx';
import { 
  IlBarChart, DurumPieChart, OkulTipiChart, DersSaatiChart, BolgeChart 
} from './components/Charts.jsx';
import { Analytics } from "@vercel/analytics/react";
export default function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('panel');
  const [activeFilter, setActiveFilter] = useState('tum');
  const [selectedIl, setSelectedIl] = useState(null);

  // Veriyi yükle
  async function loadReports() {
    setLoading(true);
    setError('');
    const { data, error: dbError } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000);
    
    if (dbError) {
      setError('Veri yüklenemedi: ' + dbError.message);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadReports();

    // Realtime: yeni kayıt geldiğinde paneli yenile
    const channel = supabase
      .channel('reports-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'reports' 
      }, (payload) => {
        setReports(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // İstatistikler
  const stats = useMemo(() => {
    const total = reports.length;
    const byDurum = {};
    DURUMLAR.forEach(d => {
      byDurum[d.key] = reports.filter(r => r.durum === d.key).length;
    });

    const etkilenenToplam = reports.reduce((s, r) => s + (r.etkilenen_ogrenci || 0), 0);
    const dersSaatiKayipToplam = reports.reduce((sum, r) => {
      if (r.eski_ders_saati != null && r.yeni_ders_saati != null) {
        return sum + Math.max(0, r.eski_ders_saati - r.yeni_ders_saati);
      }
      return sum;
    }, 0);

    const ilSayisi = new Set(reports.map(r => normalizeIl(r.il))).size;

    return { total, byDurum, etkilenenToplam, dersSaatiKayipToplam, ilSayisi };
  }, [reports]);

  // Filtre uygulanmış rapor listesi
  const filteredReports = useMemo(() => {
    let list = reports;
    if (activeFilter !== 'tum') {
      list = list.filter(r => r.durum === activeFilter);
    }
    if (selectedIl) {
      list = list.filter(r => normalizeIl(r.il) === selectedIl);
    }
    return list;
  }, [reports, activeFilter, selectedIl]);

  const activeColor = activeFilter === 'tum' 
    ? '#8b1e3f' 
    : (getDurum(activeFilter)?.color || '#8b1e3f');

  function exportCSV() {
    const headers = ['Tarih','İl','İlçe','Kurum Tipi','DSD/PASCH','Durum','Eski Saat','Yeni Saat','Etkilenen Öğrenci','Üniversite','Sınıf','Yorum'];
    const rows = reports.map(r => [
      new Date(r.created_at).toLocaleString('tr-TR'),
      r.il, r.ilce || '', r.kurum_tipi, r.is_dsd ? 'Evet' : 'Hayır',
      getDurum(r.durum)?.label || r.durum,
      r.eski_ders_saati ?? '', r.yeni_ders_saati ?? '', r.etkilenen_ogrenci ?? '',
      r.universite || '', r.sinif ?? '',
      (r.yorum || '').replace(/[\r\n,]/g, ' ')
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `almanca_etki_raporu_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const today = new Date().toLocaleDateString('tr-TR', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '120px 20px' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--wine)' }} />
        <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, marginTop: 16, color: 'var(--ink-soft)' }}>
          Veriler yükleniyor…
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="masthead">
        <div className="masthead-meta">
          <span>Türkiye • Almanca Öğretmenleri İnisiyatifi</span>
          <span>Anonim · Gerçek zamanlı</span>
        </div>
        <h1 className="masthead-title">Almanca Öğretmenleri Norm Durum Paneli</h1>
        <p className="masthead-subtitle">
          Norm fazlası, atama bekleyen ve aktif Almanca öğretmenlerinin durumu,
          sahadan toplanan anonim verilerle 81 ilde gerçek zamanlı izleniyor.
        </p>
      </header>
      
      <div className="dateline">
        {today} · {stats.total} Bildirim · {stats.ilSayisi} İl
      </div>

      <nav className="tabs">
        <button className={`tab ${activeTab === 'panel' ? 'active' : ''}`} 
                onClick={() => setActiveTab('panel')}>Veri Paneli</button>
        <button className={`tab ${activeTab === 'harita' ? 'active' : ''}`} 
                onClick={() => setActiveTab('harita')}>Türkiye Haritası</button>
        <button className={`tab ${activeTab === 'form' ? 'active' : ''}`} 
                onClick={() => setActiveTab('form')}>Veri Bildir</button>
        <button className={`tab ${activeTab === 'akis' ? 'active' : ''}`} 
                onClick={() => setActiveTab('akis')}>Son Bildirimler</button>
      </nav>

      {error && (
        <div className="alert">
          {error}
          <button className="button button-ghost" onClick={loadReports} style={{ marginLeft: 16, padding: '6px 12px' }}>
            Yeniden dene
          </button>
        </div>
      )}

      {activeTab === 'panel' && (
        <>
          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Toplam Bildirim</div>
              <div className="kpi-value">{stats.total}</div>
              <div className="kpi-suffix">{stats.ilSayisi} ilden</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Norm Fazlası</div>
              <div className="kpi-value wine">{stats.byDurum.norm_fazlasi}</div>
              <div className="kpi-suffix">öğretmen</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Atama Bekleyen</div>
              <div className="kpi-value" style={{ color: '#c9a961' }}>{stats.byDurum.atama_bekleyen}</div>
              <div className="kpi-suffix">aday</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Akademide</div>
              <div className="kpi-value navy">{stats.byDurum.akademide}</div>
              <div className="kpi-suffix">öğrenci</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Ders Saati Kaybı</div>
              <div className="kpi-value wine">{stats.dersSaatiKayipToplam}</div>
              <div className="kpi-suffix">haftalık saat</div>
            </div>
          </div>

          {stats.total === 0 ? (
            <div className="empty">
              <div className="empty-title">Henüz veri yok.</div>
              <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 20 }}>
                İlk bildirimi yapmak için "Veri Bildir" sekmesine geçin.
              </p>
              <button className="button" onClick={() => setActiveTab('form')}>
                <Send size={14} /> İlk Bildirimi Yap
              </button>
            </div>
          ) : (
            <>
              <div className="action-bar">
                <button className="button button-ghost" onClick={exportCSV}>
                  <Download size={14} /> CSV İndir
                </button>
                <button className="button button-ghost" onClick={() => window.print()}>
                  <Printer size={14} /> Rapor Yazdır
                </button>
                <button className="button button-ghost" onClick={loadReports}>
                  <RefreshCw size={14} /> Yenile
                </button>
              </div>

              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">İl bazında dağılım</h2>
                  <span className="section-meta">En çok bildirim alan 15 il</span>
                </div>
                <div className="chart-card">
                  <IlBarChart reports={reports} />
                </div>
              </section>

              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Coğrafi yayılım</h2>
                  <span className="section-meta">Bölge bazında</span>
                </div>
                <div className="chart-card">
                  <BolgeChart reports={reports} />
                </div>
              </section>

              <section className="section">
                <div className="two-col">
                  <div className="chart-card">
                    <div className="chart-title">Okul tipine göre</div>
                    <OkulTipiChart reports={reports} />
                  </div>
                  <div className="chart-card">
                    <div className="chart-title">Öğretmen durum dağılımı</div>
                    <DurumPieChart reports={reports} />
                  </div>
                </div>
              </section>

              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Ders saati: önce ve sonra</h2>
                  <span className="section-meta">2022-23 karşı 2025-26</span>
                </div>
                <div className="chart-card">
                  <DersSaatiChart reports={reports} />
                </div>
              </section>

              {stats.dersSaatiKayipToplam > 0 && (
                <div className="pull-quote">
                  {stats.ilSayisi} ilde {stats.byDurum.norm_fazlasi} norm fazlası bildirimi,
                  haftalık toplam {stats.dersSaatiKayipToplam} saat Almanca ders kaybı.
                  Bu rakamlar sahadan, doğrudan öğretmenlerin kendi beyanından geliyor.
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'harita' && (
        <>
          <div className="filter-bar">
            <span className="filter-label">Kategori:</span>
            <button className={`chip ${activeFilter === 'tum' ? 'active' : ''}`}
                    onClick={() => { setActiveFilter('tum'); setSelectedIl(null); }}>
              Tümü <span className="chip-count">({stats.total})</span>
            </button>
            {DURUMLAR.map(d => (
              <button key={d.key}
                      className={`chip ${activeFilter === d.key ? 'active' : ''}`}
                      onClick={() => { setActiveFilter(d.key); setSelectedIl(null); }}
                      style={activeFilter === d.key ? { background: d.color, borderColor: d.color } : {}}>
                {d.short} <span className="chip-count">({stats.byDurum[d.key]})</span>
              </button>
            ))}
          </div>

          <section className="section">
            <div className="section-header">
              <h2 className="section-title">
                {activeFilter === 'tum' ? 'Tüm bildirimler' : getDurum(activeFilter)?.short}
              </h2>
              <span className="section-meta">
                {selectedIl ? `${selectedIl} seçili — tıkla kaldır` : 'İle tıklayarak filtreleyin'}
              </span>
            </div>
            <TurkeyMap 
              reports={reports} 
              activeFilter={activeFilter}
              selectedIl={selectedIl}
              onProvinceClick={(il) => setSelectedIl(prev => prev === il ? null : il)}
              activeColor={activeColor}
            />
          </section>

          {selectedIl && (
            <section className="section">
              <div className="section-header">
                <h2 className="section-title">{selectedIl} bildirimleri</h2>
                <span className="section-meta">{filteredReports.length} kayıt</span>
              </div>
              <RecentFeed reports={filteredReports} />
            </section>
          )}
        </>
      )}

      {activeTab === 'form' && (
        <section className="section">
          <ReportForm onSubmitted={loadReports} />
        </section>
      )}

      {activeTab === 'akis' && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Son bildirimler</h2>
            <span className="section-meta">Anonim · en yeniden eskiye · {reports.length} kayıt</span>
          </div>
          <RecentFeed reports={reports} />
        </section>
      )}

      <div className="ornament">§ § §</div>

      <footer className="footer-note">
        Bu panel Almanca öğretmenlerinin sahadan bildirdiği verilerle çalışan açık bir izleme aracıdır.
        Veriler anonimdir ve yalnızca toplu istatistik için kullanılır. Karar alıcılara, kamuoyuna ve
        basına sunulmak üzere hazırlanmıştır.<br/>
       <strong>Verileri kötüye kullanmayın · Yanlış bildirim yapmayın · Hareketin güvenilirliği herkesin sorumluluğundadır.</strong>
        
        <div className="signature">
          Bu panel, <strong>İbrahim Çimen</strong> tarafından Almanca öğretmenleri ve geleceği için kurulmuştur. <br/>
          Veriler tüm meslektaşların ortak emeğidir.
          <div className="signature-date">Mayıs 2026</div>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}
