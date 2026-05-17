import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { DURUMLAR, getDurum, normalizeIl, BOLGELER } from '../lib/constants.js';

const tooltipStyle = { 
  background: '#fdfaf2', 
  border: '1px solid #1a1a2e', 
  borderRadius: 0, 
  fontFamily: 'Manrope', 
  fontSize: 12 
};

export function IlBarChart({ reports }) {
  const data = useMemo(() => {
    const counts = {};
    reports.forEach(r => {
      const il = normalizeIl(r.il);
      counts[il] = (counts[il] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([il, sayi]) => ({ il, sayi }))
      .sort((a, b) => b.sayi - a.sayi)
      .slice(0, 15);
  }, [reports]);

  if (data.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
        <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'Manrope', fill: '#5a5a6e' }} 
               axisLine={{ stroke: '#d4cdb8' }} tickLine={false} />
        <YAxis dataKey="il" type="category" width={110} 
               tick={{ fontSize: 12, fontFamily: 'Fraunces', fill: '#1a1a2e' }} 
               axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="sayi" fill="#8b1e3f" name="Bildirim" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DurumPieChart({ reports }) {
  const data = useMemo(() => {
    return DURUMLAR.map(d => ({
      name: d.short,
      value: reports.filter(r => r.durum === d.key).length,
      color: d.color
    })).filter(d => d.value > 0);
  }, [reports]);

  if (data.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="48%" 
             outerRadius={90} innerRadius={48}
             label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Manrope' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function OkulTipiChart({ reports }) {
  const data = useMemo(() => {
    const counts = {};
    reports.forEach(r => {
      if (r.durum === 'akademide') return; // okul tipi yok
      counts[r.kurum_tipi] = (counts[r.kurum_tipi] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([tip, sayi]) => ({ tip, sayi }))
      .sort((a, b) => b.sayi - a.sayi);
  }, [reports]);

  if (data.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
        <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'Manrope', fill: '#5a5a6e' }} 
               axisLine={{ stroke: '#d4cdb8' }} tickLine={false} />
        <YAxis dataKey="tip" type="category" width={180} 
               tick={{ fontSize: 11, fontFamily: 'Manrope', fill: '#1a1a2e' }} 
               axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="sayi" fill="#4a5d3f" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DersSaatiChart({ reports }) {
  const data = useMemo(() => {
    const grouped = {};
    reports.forEach(r => {
      if (r.durum === 'akademide') return;
      if (r.eski_ders_saati != null && r.yeni_ders_saati != null) {
        if (!grouped[r.kurum_tipi]) {
          grouped[r.kurum_tipi] = { eski: 0, yeni: 0, sayi: 0 };
        }
        grouped[r.kurum_tipi].eski += r.eski_ders_saati;
        grouped[r.kurum_tipi].yeni += r.yeni_ders_saati;
        grouped[r.kurum_tipi].sayi += 1;
      }
    });
    return Object.entries(grouped).map(([tip, g]) => ({
      tip: tip.length > 22 ? tip.substring(0, 20) + '…' : tip,
      eski: +(g.eski / g.sayi).toFixed(1),
      yeni: +(g.yeni / g.sayi).toFixed(1)
    }));
  }, [reports]);

  if (data.length === 0) return <EmptyChart message="Henüz ders saati verisi yok." />;

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, data.length * 50)}>
      <BarChart data={data} margin={{ left: 20, right: 30, top: 20, bottom: 60 }}>
        <XAxis dataKey="tip" tick={{ fontSize: 11, fontFamily: 'Manrope', fill: '#1a1a2e' }} 
               axisLine={{ stroke: '#d4cdb8' }} angle={-20} textAnchor="end" height={80} />
        <YAxis tick={{ fontSize: 11, fontFamily: 'Manrope', fill: '#5a5a6e' }} 
               axisLine={{ stroke: '#d4cdb8' }} tickLine={false}
               label={{ value: 'Saat / hafta', angle: -90, position: 'insideLeft', 
                        style: { fontFamily: 'Fraunces', fontSize: 12, fill: '#5a5a6e' } }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontFamily: 'Manrope', fontSize: 12 }} />
        <Bar dataKey="eski" fill="#4a5d3f" name="Karar Öncesi" />
        <Bar dataKey="yeni" fill="#8b1e3f" name="Karar Sonrası" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BolgeChart({ reports }) {
  const data = useMemo(() => {
    const counts = {};
    Object.entries(BOLGELER).forEach(([bolge, iller]) => {
      counts[bolge] = reports.filter(r => iller.includes(normalizeIl(r.il))).length;
    });
    return Object.entries(counts)
      .map(([bolge, sayi]) => ({ bolge, sayi }))
      .sort((a, b) => b.sayi - a.sayi);
  }, [reports]);

  if (data.every(d => d.sayi === 0)) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ left: 20, right: 30, top: 20, bottom: 40 }}>
        <XAxis dataKey="bolge" tick={{ fontSize: 11, fontFamily: 'Manrope', fill: '#1a1a2e' }} 
               axisLine={{ stroke: '#d4cdb8' }} angle={-15} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 11, fontFamily: 'Manrope', fill: '#5a5a6e' }} 
               axisLine={{ stroke: '#d4cdb8' }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="sayi" fill="#3d5a80" name="Bildirim" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ message = "Henüz veri yok." }) {
  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      height: 220, color: 'var(--ink-faint)', fontStyle: 'italic',
      fontFamily: 'Fraunces, serif'
    }}>
      {message}
    </div>
  );
}
