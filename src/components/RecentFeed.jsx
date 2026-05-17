import React from 'react';
import { getDurum } from '../lib/constants.js';

export default function RecentFeed({ reports }) {
  if (reports.length === 0) {
    return (
      <div className="empty">
        <div className="empty-title">Henüz bildirim yok.</div>
      </div>
    );
  }

  const sorted = [...reports].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  ).slice(0, 50);

  return (
    <div className="recent-list">
      {sorted.map(r => {
        const durum = getDurum(r.durum);
        const time = new Date(r.created_at);
        const timeStr = time.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) 
          + ' · ' 
          + time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        
        return (
          <div key={r.id} className="recent-item">
            <div className="recent-time">{timeStr}</div>
            <div className="recent-content">
              <span className="recent-location">
                {r.il}{r.ilce ? ` · ${r.ilce}` : ''}
              </span>
              {' — '}
              {r.kurum_tipi}
              {r.is_dsd && ' (DSD/PASCH)'}
              {r.sinif != null && r.durum === 'akademide' && ` · ${r.sinif === 0 ? 'Hazırlık' : r.sinif + '. sınıf'}`}
              {(r.eski_ders_saati != null && r.yeni_ders_saati != null) && (
                <span style={{ color: 'var(--ink-soft)' }}>
                  {' · '}Ders saati:{' '}
                  <strong style={{ color: 'var(--olive)' }}>{r.eski_ders_saati}</strong>
                  {' → '}
                  <strong style={{ color: 'var(--wine)' }}>{r.yeni_ders_saati}</strong>
                </span>
              )}
              {r.yorum && <div className="recent-quote">"{r.yorum}"</div>}
            </div>
            <div className="recent-status" style={{ color: durum?.color }}>
              {durum?.short || r.durum}
            </div>
          </div>
        );
      })}
    </div>
  );
}
