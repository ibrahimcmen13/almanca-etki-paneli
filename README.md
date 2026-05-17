# Türkiye Almanca Eğitimi Etki İzleme Paneli

Sahadan toplanan anonim verilerle Türkiye'de Almanca öğretmenlerinin durumunu
gerçek zamanlı izleyen açık kaynak panel.

**Teknolojiler:** React + Vite (frontend) · Supabase (veritabanı) · Vercel (hosting)

**Maliyet:** Hepsi ücretsiz katmanda çalışır. Alan adı için yıllık ~10-15 USD opsiyonel.

---

## İçindekiler

1. [Önkoşullar](#1-önkoşullar)
2. [Supabase veritabanı kurulumu](#2-supabase-veritabanı-kurulumu)
3. [Projeyi yerel makinede çalıştırma](#3-projeyi-yerel-makinede-çalıştırma)
4. [Türkiye haritası dosyasını ekleme](#4-türkiye-haritası-dosyasını-ekleme)
5. [Vercel'e deploy etme](#5-vercele-deploy-etme)
6. [Özel alan adı bağlama (opsiyonel)](#6-özel-alan-adı-bağlama-opsiyonel)
7. [Sahaya çıkış kontrol listesi](#7-sahaya-çıkış-kontrol-listesi)
8. [Bakım ve veri yedekleme](#8-bakım-ve-veri-yedekleme)
9. [Sık karşılaşılan sorunlar](#9-sık-karşılaşılan-sorunlar)

---

## 1. Önkoşullar

Geliştiricinin bilgisayarında bulunması gerekenler:

- **Node.js 18+** — https://nodejs.org/tr (LTS sürümünü indirin)
- **Git** — https://git-scm.com (komut satırı yeterli)
- **Bir kod editörü** — Visual Studio Code önerilir

Açılacak hesaplar (üçü de ücretsiz):

- **GitHub** hesabı — https://github.com (kodu burada saklayacaksınız)
- **Supabase** hesabı — https://supabase.com (veritabanı için)
- **Vercel** hesabı — https://vercel.com (canlı yayın için)

GitHub ile Vercel'e giriş yapmak işleri kolaylaştırır.

---

## 2. Supabase veritabanı kurulumu

Bu adım 10 dakika sürer.

**2.1.** https://supabase.com adresine gidip GitHub hesabınızla giriş yapın.

**2.2.** "New Project" tıklayın. Doldurun:
- Name: `almanca-etki-paneli` (istediğiniz isim)
- Database Password: güçlü bir parola seçin, **bir kenara not edin**
- Region: `Central EU (Frankfurt)` — Türkiye'ye en yakın

"Create new project" tıklayın. Birkaç dakika kurulum bekler.

**2.3.** Proje hazır olduğunda sol menüden **SQL Editor** simgesine tıklayın → **+ New query**.

**2.4.** Bu repodaki `supabase/schema.sql` dosyasının tüm içeriğini editöre yapıştırın → sağ üstte yeşil **RUN** butonuna basın.

"Success. No rows returned." görmelisiniz. Bu, veritabanı tablosunun ve güvenlik politikalarının kurulduğu anlamına gelir.

**2.5.** Sol menüden **Settings** → **API** sekmesine geçin. İki değeri kopyalayın:
- **Project URL** (örn. `https://abcxyz.supabase.co`)
- **anon public** key (uzun bir JWT string'i — `eyJ...` ile başlar)

Bunları bir yere kaydedin. Birazdan kullanacağız.

**Önemli güvenlik notu:** Bu iki değer **kamuya açık olabilir** — anon key, RLS politikalarımız sayesinde yalnızca veri okuma ve ekleme yetkisine sahiptir, silme veya güncelleme yapamaz.

---

## 3. Projeyi yerel makinede çalıştırma

**3.1.** Bu projeyi GitHub'a yükleyin (veya zip olarak indirip kullanın):

```bash
git clone https://github.com/KENDI-KULLANICINIZ/almanca-etki-paneli.git
cd almanca-etki-paneli
```

**3.2.** Paketleri yükleyin:

```bash
npm install
```

Bu, 1-3 dakika sürebilir.

**3.3.** Çevre değişkenlerini ayarlayın:

```bash
cp .env.example .env
```

`.env` dosyasını açın ve yukarıda Supabase'den aldığınız iki değeri yapıştırın:

```
VITE_SUPABASE_URL=https://abcxyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...buraya_anon_key
```

**3.4.** Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Tarayıcıda http://localhost:5173 açılacak. Panel görünmeli ama harita gözükmeyecek — bir sonraki adımda onu hallediyoruz.

---

## 4. Türkiye haritası dosyasını ekleme

Bu, harita görselleştirmesi için kritik adım.

**4.1.** Açık kaynak Türkiye il sınırları GeoJSON dosyasını indirin. Önerilen kaynaklardan biri:

- https://github.com/cihadturhan/tr-geojson → `tr-cities.json`
- veya https://gist.github.com/ismailbaskin/2492196

**4.2.** İndirdiğiniz dosyayı **`public/tr-provinces.geojson`** adıyla kaydedin.

**4.3.** Tarayıcıyı yenileyin (Ctrl+R). "Türkiye Haritası" sekmesine geçince harita gözükmeli.

**Harita görünmüyor mu?** Tarayıcının developer console'unu açın (F12). Hata mesajına bakın:
- "404 not found" → dosya `public` klasöründe değil veya adı yanlış
- "Bilinmeyen GeoJSON formatı" → dosya bozuk veya farklı bir formatta
- "Provinces gözükmüyor ama harita yükleniyor" → GeoJSON'daki il isimleri farklı bir alanda (örn. `NAME_TR` yerine `Province`). `src/components/TurkeyMap.jsx` içindeki `getProvinceName` fonksiyonunda yeni alanı ekleyin.

---

## 5. Vercel'e deploy etme

Bu adım 10 dakika. Sonunda site canlı olacak.

**5.1.** Projenizi GitHub'a push edin (henüz yapmadıysanız):

```bash
git add .
git commit -m "İlk yayın"
git push origin main
```

**5.2.** https://vercel.com → "Add New..." → "Project" tıklayın.

**5.3.** GitHub deponuzu seçin → "Import".

**5.4.** Configure Project ekranında:

- **Framework Preset:** Vite (otomatik bulmalı)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables** kısmına iki değişken ekleyin:
  - `VITE_SUPABASE_URL` → Supabase URL'iniz
  - `VITE_SUPABASE_ANON_KEY` → Supabase anon key'iniz

**5.5.** "Deploy" tıklayın. 1-2 dakikada site canlı olur.

Vercel size `https://almanca-etki-paneli.vercel.app` benzeri bir URL verir. Bu URL'yi WhatsApp ve Telegram gruplarınıza paylaşabilirsiniz — herkes anında veri girebilir.

---

## 6. Özel alan adı bağlama (opsiyonel)

Daha profesyonel görünmek için kendi alan adınızı bağlayın (örn. `almancaegitimi.org`).

**6.1.** Bir kayıt firmasından alan adı satın alın:
- https://www.namecheap.com (yıllık ~10 USD)
- https://www.cloudflare.com/products/registrar (kâr marjsız fiyat)

**6.2.** Vercel projenizin **Settings** → **Domains** sekmesinde "Add" → alan adınızı yazın.

**6.3.** Vercel'in verdiği DNS kayıtlarını (genellikle bir CNAME ve A kaydı) kayıt firmasının panelinde ekleyin.

DNS yayılması 1-24 saat sürebilir. Vercel otomatik olarak SSL sertifikası (https) sağlar.

---

## 7. Sahaya çıkış kontrol listesi

Linki gruplara dağıtmadan önce şunları kontrol edin:

- [ ] Tüm sekmeler çalışıyor (Panel, Harita, Form, Akış)
- [ ] Form ile test bildirimi gönderebildiniz
- [ ] Yeni bildirim panele yansıdı (anlık güncelleme)
- [ ] Türkiye haritasında iller gözüküyor
- [ ] Kategori filtreleri (Norm Fazlası, Akademide, vb.) çalışıyor
- [ ] CSV indirme çalışıyor
- [ ] Mobil cihazda da düzgün gözüküyor
- [ ] Test bildirimlerini Supabase'den silin (Table Editor → reports → satırları seçip Delete)

**Topluluk için kısa rehber metni** (WhatsApp/Telegram mesajı):

> 📊 Almanca öğretmenleri olarak ilk kez sahadan veri topluyoruz.
>
> 2 dakikanızı ayırın, durumunuzu girin:
> 👉 [SİZİN-LINKİNİZ.vercel.app]
>
> Tamamen anonim — ad, e-posta, telefon sorulmuyor. Sadece il, durumunuz ve ders saatleri.
>
> Bu rapor MEB'e ve milletvekillerine sunulacak. Norm fazlası, atama bekleyen, akademide olan, branş değiştirenler de katılsın.

---

## 8. Bakım ve veri yedekleme

**Haftalık:**
- Supabase Dashboard → Table Editor → reports tablosunu inceleyin, spam veya saçma kayıtları silin
- CSV indir butonuyla veri yedeği alın

**Aylık:**
- Supabase free tier veritabanı boyutunu kontrol edin (Settings → Usage). 500MB limit var — 50.000+ kayıt sığar.
- Bağış toplayarak veya gönüllü bütçesiyle Pro plana geçebilirsiniz (8 USD/ay).

**Veri yedek otomasyonu (ileri seviye):**
- Supabase → Database → Backups (Pro planda otomatik)
- Veya GitHub Actions ile haftalık otomatik CSV export

---

## 9. Sık karşılaşılan sorunlar

**"Supabase ayarları eksik" konsol hatası**
→ `.env` dosyası eksik veya Vercel'de environment variables eklenmedi.

**Form gönderiliyor ama panele yansımıyor**
→ Realtime aboneliği başlamamış olabilir. Sayfayı yenileyin. Eğer sürekli sorun varsa Supabase → Database → Replication kısmında `reports` tablosunun realtime'ı etkin mi kontrol edin.

**"Çok fazla bildirim" hatası**
→ Spam koruması devrede. Aynı tarayıcıdan 1 saat içinde 3'ten fazla bildirim engelleniyor. `schema.sql` içindeki `check_rate_limit()` fonksiyonunu düzenleyebilirsiniz.

**Harita yavaş yükleniyor**
→ GeoJSON dosyası büyüktür. https://mapshaper.org adresinde dosyayı %5-10 sadeleştirin.

**Birisi panel dışından (veritabanına direkt) saçma veri ekledi**
→ Supabase Dashboard'dan elle silin. Anon key her ne kadar herkese açık olsa da, sadece insert/select izni var — silme yok.

---

## Lisans ve katkı

Bu proje **MIT lisansı** ile açık kaynak. İstediğiniz gibi değiştirip dağıtabilirsiniz.

Hatalar, öneriler ve katkılar için GitHub Issues kullanın.

Tasarım: Editöryal/gazete estetiği. Font: Fraunces (display) + Manrope (body).

---

**Almanca öğretmeni dayanışması için**
