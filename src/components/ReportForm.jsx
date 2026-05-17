import React, { useState } from 'react';
import { Send, Loader2, AlertCircle, Check } from 'lucide-react';
import { ILLER, OKUL_TIPLERI, DURUMLAR } from '../lib/constants.js';
import { supabase, getClientHash } from '../lib/supabase.js';

const UNIVERSITELER_ALMANCA = [
  "Hacettepe Üniversitesi",
  "Marmara Üniversitesi",
  "Gazi Üniversitesi",
  "Anadolu Üniversitesi",
  "Çukurova Üniversitesi",
  "Uludağ Üniversitesi",
  "Atatürk Üniversitesi",
  "Trakya Üniversitesi",
  "Dicle Üniversitesi",
  "Necmettin Erbakan Üniversitesi",
  "Ondokuz Mayıs Üniversitesi",
  "Mersin Üniversitesi",
  "İstanbul Üniversitesi",
  "Selçuk Üniversitesi",
  "Çanakkale Onsekiz Mart Üniversitesi",
  "Süleyman Demirel Üniversitesi",
  "Diğer"
];

const initialForm = {
  il: '',
  ilce: '',
  durum: '',
  kurum_tipi: '',
  is_dsd: false,
  eski_ders_saati: '',
  yeni_ders_saati: '',
  etkilenen_ogrenci: '',
  universite: '',
  sinif: '',
  yorum: ''
};

export default function ReportForm({ onSubmitted }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isAkademide = form.durum === 'akademide';
  const isCalisan = form.durum === 'aktif' || form.durum === 'norm_fazlasi';

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setError('');

    if (!form.il) return setError('İl seçimi zorunludur.');
    if (!form.durum) return setError('Durumunuzu seçmelisiniz.');
    if (isAkademide && !form.universite) return setError('Üniversitenizi seçmelisiniz.');
    if (!isAkademide && !form.kurum_tipi) return setError('Okul tipi zorunludur.');

    setSubmitting(true);

    const payload = {
      il: form.il,
      ilce: form.ilce.trim() || null,
      kurum_tipi: isAkademide ? (form.universite || 'Üniversite') : form.kurum_tipi,
      is_dsd: form.is_dsd && !isAkademide,
      durum: form.durum,
      eski_ders_saati: isCalisan && form.eski_ders_saati ? Number(form.eski_ders_saati) : null,
      yeni_ders_saati: isCalisan && form.yeni_ders_saati ? Number(form.yeni_ders_saati) : null,
      etkilenen_ogrenci: isCalisan && form.etkilenen_ogrenci ? Number(form.etkilenen_ogrenci) : null,
      universite: isAkademide ? form.universite : null,
      sinif: isAkademide && form.sinif ? Number(form.sinif) : null,
      yorum: form.yorum.trim().substring(0, 400) || null,
      ip_hash: getClientHash()
    };

    const { error: dbError } = await supabase.from('reports').insert(payload);

    if (dbError) {
      setError(dbError.message.includes('Çok fazla') 
        ? 'Çok fazla bildirim. Lütfen daha sonra tekrar deneyin.' 
        : 'Kayıt sırasında hata: ' + dbError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setForm(initialForm);
    setSubmitting(false);
    if (onSubmitted) onSubmitted();
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <div className="form-card">
      <h2 className="section-title" style={{ marginBottom: 8 }}>Durumumu bildiriyorum</h2>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 24 }}>
        Anonim bildirim — ad, okul adı, e-posta sorulmaz. Yalnızca toplu istatistik için kullanılır.
      </p>

      {error && <div className="alert"><AlertCircle size={16} /> {error}</div>}
      {success && <div className="alert success"><Check size={16} /> Bildiriminiz kaydedildi. Teşekkürler.</div>}

      <div className="form-grid">
        <div className="field">
          <label className="field-label">Durumunuz <span className="required">*</span></label>
          <select className="select" value={form.durum} onChange={e => update('durum', e.target.value)}>
            <option value="">Seçiniz…</option>
            {DURUMLAR.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="field-label">İl <span className="required">*</span></label>
          <select className="select" value={form.il} onChange={e => update('il', e.target.value)}>
            <option value="">Seçiniz…</option>
            {ILLER.map(il => <option key={il} value={il}>{il}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="field-label">İlçe <span className="optional">(opsiyonel)</span></label>
          <input className="input" type="text" value={form.ilce} maxLength={40}
                 onChange={e => update('ilce', e.target.value)} placeholder="örn. Kadıköy" />
        </div>

        {/* Akademide olanlar için */}
        {isAkademide && (
          <>
            <div className="field">
              <label className="field-label">Üniversite <span className="required">*</span></label>
              <select className="select" value={form.universite} onChange={e => update('universite', e.target.value)}>
                <option value="">Seçiniz…</option>
                {UNIVERSITELER_ALMANCA.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Sınıf <span className="optional">(opsiyonel)</span></label>
              <select className="select" value={form.sinif} onChange={e => update('sinif', e.target.value)}>
                <option value="">Seçiniz…</option>
                <option value="0">Hazırlık</option>
                <option value="1">1. sınıf</option>
                <option value="2">2. sınıf</option>
                <option value="3">3. sınıf</option>
                <option value="4">4. sınıf</option>
                <option value="5">5. sınıf</option>
              </select>
            </div>
          </>
        )}

        {/* Çalışan veya norm fazlası olanlar için */}
        {!isAkademide && form.durum && (
          <>
            <div className="field">
              <label className="field-label">Okul Tipi <span className="required">*</span></label>
              <select className="select" value={form.kurum_tipi} onChange={e => update('kurum_tipi', e.target.value)}>
                <option value="">Seçiniz…</option>
                {OKUL_TIPLERI.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <div className="checkbox-row" style={{ marginTop: 22 }}>
                <input type="checkbox" id="dsd" checked={form.is_dsd}
                       onChange={e => update('is_dsd', e.target.checked)} />
                <label htmlFor="dsd" style={{ fontSize: 13 }}>Okulum DSD veya PASCH okulu</label>
              </div>
            </div>
          </>
        )}

        {/* Sadece aktif veya norm fazlası için ders saati */}
        {isCalisan && (
          <>
            <div className="field">
              <label className="field-label">Eski Ders Saati <span className="optional">(haftalık, 2022-23)</span></label>
              <input className="input" type="number" min="0" max="40" value={form.eski_ders_saati}
                     onChange={e => update('eski_ders_saati', e.target.value)} placeholder="örn. 4" />
            </div>
            <div className="field">
              <label className="field-label">Yeni Ders Saati <span className="optional">(haftalık, şu an)</span></label>
              <input className="input" type="number" min="0" max="40" value={form.yeni_ders_saati}
                     onChange={e => update('yeni_ders_saati', e.target.value)} placeholder="örn. 2" />
            </div>
            <div className="field">
              <label className="field-label">Etkilenen Öğrenci <span className="optional">(tahmini)</span></label>
              <input className="input" type="number" min="0" max="5000" value={form.etkilenen_ogrenci}
                     onChange={e => update('etkilenen_ogrenci', e.target.value)} placeholder="örn. 120" />
            </div>
          </>
        )}
      </div>

      <div className="field" style={{ marginBottom: 24 }}>
        <label className="field-label">Ek not <span className="optional">(opsiyonel · 400 karakter)</span></label>
        <textarea className="textarea" maxLength={400} value={form.yorum}
                  onChange={e => update('yorum', e.target.value)}
                  placeholder="Yaşadığınız somut sorunu kısaca yazabilirsiniz." />
      </div>

      <button className="button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
        {submitting ? 'Gönderiliyor…' : 'Bildirimi Gönder'}
      </button>
    </div>
  );
}
