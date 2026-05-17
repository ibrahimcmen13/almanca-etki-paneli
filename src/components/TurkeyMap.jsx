import React, { useEffect, useState, useRef, useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import { scaleSequential } from 'd3-scale';
import { normalizeIl } from '../lib/constants.js';

// Bir ile karşılık gelen ad alanını esnek olarak bulur (GeoJSON kaynağına göre değişir)
function getProvinceName(props) {
  return props.name || props.NAME_1 || props.name_tr || props.il || props.ad || '';
}

// Renk skalası: krem zemin → şarap kırmızısı
function getColorScale(maxValue, baseColor = '#8b1e3f') {
  return scaleSequential(t => {
    if (t === 0) return '#faf6e9';
    // Manuel interpolasyon: cream → wine
    const r = Math.round(250 + (139 - 250) * t);
    const g = Math.round(246 + (30 - 246) * t);
    const b = Math.round(233 + (63 - 233) * t);
    return `rgb(${r},${g},${b})`;
  }).domain([0, Math.max(1, maxValue)]);
}

export default function TurkeyMap({ reports, activeFilter, selectedIl, onProvinceClick, activeColor }) {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    // GeoJSON dosyasını yükle
    fetch('/tr-provinces.geojson')
      .then(r => {
        if (!r.ok) throw new Error('GeoJSON yüklenemedi (' + r.status + ')');
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        // Topojson veya GeoJSON olabilir
        let features;
        if (data.type === 'Topology') {
          const key = Object.keys(data.objects)[0];
          features = topojson.feature(data, data.objects[key]).features;
        } else if (data.type === 'FeatureCollection') {
          features = data.features;
        } else {
          throw new Error('Bilinmeyen GeoJSON formatı');
        }
        setGeoData(features);
        setLoading(false);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // İl bazında sayım hesapla (filtreye göre)
  const ilCounts = useMemo(() => {
    const counts = {};
    reports.forEach(r => {
      if (activeFilter === 'tum' || r.durum === activeFilter) {
        const key = normalizeIl(r.il);
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [reports, activeFilter]);

  const maxValue = Math.max(0, ...Object.values(ilCounts));
  const colorScale = useMemo(() => getColorScale(maxValue, activeColor), [maxValue, activeColor]);

  if (loading) {
    return (
      <div className="map-wrap" style={{ textAlign: 'center', padding: 60 }}>
        <span style={{ fontFamily: 'Fraunces', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
          Harita yükleniyor…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-wrap">
        <div className="alert">
          <strong>Harita yüklenemedi.</strong> {error}<br/>
          <small>Public klasöründe <code>tr-provinces.geojson</code> dosyası olduğundan emin olun. README'deki indirme adımına bakın.</small>
        </div>
      </div>
    );
  }

  if (!geoData || geoData.length === 0) {
    return <div className="map-wrap"><div className="alert">Coğrafi veri boş.</div></div>;
  }

  // Türkiye için projection
  const width = 980;
  const height = 480;
  const projection = geoMercator()
    .center([35.5, 39])
    .scale(2400)
    .translate([width / 2, height / 2]);
  const pathGen = geoPath().projection(projection);

  return (
    <div className="map-wrap">
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="map-svg">
        <rect width={width} height={height} fill="var(--surface)" />
        {geoData.map((feature, i) => {
          const name = getProvinceName(feature.properties);
          const normalized = normalizeIl(name);
          const count = ilCounts[normalized] || 0;
          const fill = count === 0 ? '#faf6e9' : colorScale(count);
          const isSelected = selectedIl === normalized;
          
          return (
            <path
              key={i}
              d={pathGen(feature)}
              fill={fill}
              className={`map-province ${isSelected ? 'selected' : ''}`}
              onMouseEnter={(e) => {
                const rect = svgRef.current.getBoundingClientRect();
                setTooltip({
                  name: normalized,
                  count,
                  x: e.clientX - rect.left + 12,
                  y: e.clientY - rect.top + 12
                });
              }}
              onMouseMove={(e) => {
                const rect = svgRef.current.getBoundingClientRect();
                setTooltip(prev => prev ? {
                  ...prev,
                  x: e.clientX - rect.left + 12,
                  y: e.clientY - rect.top + 12
                } : null);
              }}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => onProvinceClick && onProvinceClick(normalized)}
            />
          );
        })}
      </svg>
      
      {tooltip && (
        <div className="map-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="map-tooltip-title">{tooltip.name}</div>
          <div>{tooltip.count} bildirim</div>
        </div>
      )}
      
      <div className="map-legend">
        <span>0</span>
        <span 
          className="legend-gradient" 
          style={{ 
            background: `linear-gradient(to right, #faf6e9, ${activeColor})` 
          }} 
        />
        <span>{maxValue}</span>
        <span style={{ marginLeft: 12 }}>bildirim</span>
      </div>
    </div>
  );
}
