export const ILLER = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan","Artvin",
  "Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis","Bolu","Burdur",
  "Bursa","Çanakkale","Çankırı","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan",
  "Erzurum","Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul",
  "İzmir","Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis","Kırıkkale","Kırklareli",
  "Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş",
  "Nevşehir","Niğde","Ordu","Osmaniye","Rize","Sakarya","Samsun","Siirt","Sinop","Sivas",
  "Şanlıurfa","Şırnak","Tekirdağ","Tokat","Trabzon","Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak"
];

// İl adı normalize etmek için (GeoJSON'daki adlarla uyumluluk)
export const IL_NORMALIZE = {
  "Afyon": "Afyonkarahisar",
  "K. Maraş": "Kahramanmaraş",
  "Kahramanmaras": "Kahramanmaraş",
  "Sanliurfa": "Şanlıurfa",
  "Urfa": "Şanlıurfa"
};

export function normalizeIl(name) {
  if (!name) return name;
  return IL_NORMALIZE[name] || name;
}

export const OKUL_TIPLERI = [
  "Anadolu Lisesi",
  "Fen Lisesi",
  "Sosyal Bilimler Lisesi",
  "Anadolu İmam Hatip Lisesi",
  "Mesleki ve Teknik Anadolu Lisesi",
  "Çok Programlı Anadolu Lisesi",
  "Spor Lisesi",
  "Güzel Sanatlar Lisesi",
  "Özel Lise",
  "Ortaokul (ÇYDEM)",
  "Diğer"
];

export const DURUMLAR = [
  { 
    key: "aktif", 
    label: "Aktif - norm dahilinde ders veriyorum",
    short: "Aktif",
    color: "#4a5d3f",
    description: "Hâlâ Almanca dersleri veriyorum, norm sorunu yaşamıyorum."
  },
  { 
    key: "norm_fazlasi", 
    label: "Norm fazlasıyım",
    short: "Norm Fazlası",
    color: "#8b1e3f",
    description: "Ders saatim azaldığı için norm fazlası durumdayım."
  },
  { 
    key: "atama_bekleyen", 
    label: "Atama bekliyorum",
    short: "Atama Bekliyor",
    color: "#c9a961",
    description: "Mezun oldum, KPSS adayıyım, atama bekliyorum."
  },
  { 
    key: "akademide", 
    label: "Üniversitede Almanca öğretmenliği okuyorum",
    short: "Akademide",
    color: "#3d5a80",
    description: "Hâlâ üniversite öğrencisiyim, mesleğin geleceği belirsiz."
  },
  { 
    key: "brans_degistirdi", 
    label: "Branş değişikliği yapmak zorunda kaldım",
    short: "Branş Değiştirdi",
    color: "#6b4226",
    description: "Almanca öğretmenliği olarak devam edemediğim için başka branşa geçtim."
  },
  { 
    key: "gelecek_yil_norm", 
    label: "Önümüzdeki yıl norm fazlası olacağım",
    short: "Gelecek Yıl Norm",
    color: "#d97706",
    description: "Şu an aktif olarak çalışıyorum ama gelecek yıl norm fazlası olacağımı biliyorum/söylendi."
  }
];

export function getDurum(key) {
  return DURUMLAR.find(d => d.key === key);
}

// İl coğrafi bölgeleri (haritada bölge filtresi için)
export const BOLGELER = {
  "Marmara": ["İstanbul","Edirne","Kırklareli","Tekirdağ","Çanakkale","Balıkesir","Bursa","Yalova","Kocaeli","Sakarya","Bilecik"],
  "Ege": ["İzmir","Manisa","Aydın","Muğla","Denizli","Uşak","Kütahya","Afyonkarahisar"],
  "Akdeniz": ["Antalya","Burdur","Isparta","Mersin","Adana","Osmaniye","Hatay","Kahramanmaraş"],
  "İç Anadolu": ["Ankara","Konya","Eskişehir","Kayseri","Sivas","Yozgat","Çankırı","Kırıkkale","Aksaray","Nevşehir","Niğde","Kırşehir","Karaman"],
  "Karadeniz": ["Zonguldak","Bartın","Karabük","Kastamonu","Sinop","Samsun","Amasya","Tokat","Çorum","Bolu","Düzce","Ordu","Giresun","Trabzon","Rize","Artvin","Gümüşhane","Bayburt"],
  "Doğu Anadolu": ["Erzurum","Erzincan","Ağrı","Kars","Iğdır","Ardahan","Malatya","Elazığ","Tunceli","Bingöl","Muş","Bitlis","Van","Hakkari"],
  "Güneydoğu Anadolu": ["Gaziantep","Kilis","Şanlıurfa","Diyarbakır","Mardin","Batman","Siirt","Şırnak","Adıyaman"]
};
