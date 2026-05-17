# Türkiye GeoJSON

Harita çalışması için bu klasöre `tr-provinces.geojson` adında bir dosya gerekli.

## Hazır dosyayı nasıl indirirsiniz

İndirme bağlantıları (ücretsiz, açık kaynak):

1. https://github.com/cihadturhan/tr-geojson — `tr-cities.json` dosyasını indirin
2. https://gist.github.com/ismailbaskin/2492196 — alternatif

İndirdiğiniz dosyayı bu klasöre **`tr-provinces.geojson`** adıyla kaydedin.

## GeoJSON dosyasının yapısı

Dosya iki formattan biri olmalı:

- `FeatureCollection` (klasik GeoJSON)
- `Topology` (TopoJSON)

İl adlarının `properties.name` (veya `NAME_1`, `name_tr`, `il`, `ad`) içinde Türkçe karakterlerle bulunması gerekir.
Bizim TurkeyMap bileşeni bu alanlardan herhangi birini bulabilir, esnek çalışır.

## Dosya boyutu

Tipik bir Türkiye GeoJSON: 100KB - 500KB. Çok büyükse (>1MB) simplification (sadeleştirme) yapmak isteyebilirsiniz:
https://mapshaper.org adresinde dosyayı açıp "Simplify" düğmesiyle %5-10 oranında sadeleştirin.
