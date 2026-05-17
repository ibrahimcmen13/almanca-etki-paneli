-- ============================================================
-- Türkiye Almanca Eğitimi Etki İzleme Paneli
-- Supabase veritabanı kurulum betiği
-- ============================================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın.
-- (Supabase Dashboard → SQL Editor → New query → yapıştır → Run)
-- ============================================================

-- Bildirimler tablosu
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  
  -- Konum
  il text not null,
  ilce text,
  
  -- Kurum bilgisi
  kurum_tipi text not null,  -- okul tipi veya 'Üniversite'
  is_dsd boolean default false,
  
  -- Statü
  durum text not null check (durum in (
    'aktif', 'norm_fazlasi', 'atama_bekleyen', 
    'akademide', 'brans_degistirdi'
  )),
  
  -- Ders saati (sadece aktif/norm fazlası için anlamlı)
  eski_ders_saati integer check (eski_ders_saati >= 0 and eski_ders_saati <= 40),
  yeni_ders_saati integer check (yeni_ders_saati >= 0 and yeni_ders_saati <= 40),
  etkilenen_ogrenci integer check (etkilenen_ogrenci >= 0 and etkilenen_ogrenci <= 5000),
  
  -- Akademide ise
  universite text,
  sinif integer check (sinif >= 1 and sinif <= 5),
  
  -- Serbest metin
  yorum text check (char_length(yorum) <= 400),
  
  -- Spam koruması
  ip_hash text  -- istemci tarafında hashlenmiş, kişiselleştirilemez
);

-- İndeksler (sorgu performansı için)
create index if not exists idx_reports_il on reports(il);
create index if not exists idx_reports_durum on reports(durum);
create index if not exists idx_reports_created on reports(created_at desc);
create index if not exists idx_reports_ip on reports(ip_hash);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — kritik güvenlik katmanı
-- ============================================================
-- Anonim kullanıcılar ekleme ve okuma yapabilir; ama güncelleme/silme yapamaz.

alter table reports enable row level security;

-- Herkes okuyabilir
create policy "Herkes okuyabilir" on reports
  for select using (true);

-- Herkes anonim olarak ekleyebilir
create policy "Herkes ekleyebilir" on reports
  for insert with check (true);

-- Kimse güncelleyemez veya silemez (sadece admin Service Role)
-- (varsayılan olarak engellenmiştir)

-- ============================================================
-- Spam koruması: aynı IP hash'inden son 1 saatte 3'ten fazla 
-- bildirim engellensin
-- ============================================================
create or replace function check_rate_limit() 
returns trigger as $$
declare
  recent_count integer;
begin
  if NEW.ip_hash is not null then
    select count(*) into recent_count
    from reports
    where ip_hash = NEW.ip_hash
      and created_at > now() - interval '1 hour';
    
    if recent_count >= 3 then
      raise exception 'Çok fazla bildirim. Lütfen 1 saat sonra tekrar deneyin.';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger rate_limit_trigger
  before insert on reports
  for each row execute function check_rate_limit();

-- ============================================================
-- Materialized view: il bazında özet (hızlı sorgular için)
-- (opsiyonel — şu an client tarafında hesaplanıyor, ileride 
-- veri arttığında performans için açılabilir)
-- ============================================================
-- create materialized view il_ozet as
-- select 
--   il,
--   count(*) as toplam,
--   count(*) filter (where durum = 'norm_fazlasi') as norm_fazlasi,
--   count(*) filter (where durum = 'atama_bekleyen') as atama_bekleyen,
--   count(*) filter (where durum = 'akademide') as akademide,
--   count(*) filter (where durum = 'brans_degistirdi') as brans_degistirdi,
--   count(*) filter (where durum = 'aktif') as aktif
-- from reports
-- group by il;

-- ============================================================
-- Bitti. Dashboard → Table Editor → reports tablosunu görebilirsiniz.
-- ============================================================
