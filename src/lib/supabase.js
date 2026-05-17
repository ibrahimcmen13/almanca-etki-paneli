import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('⚠️ Supabase ayarları eksik. .env dosyasını kontrol edin.');
}

export const supabase = createClient(url, key);

// Basit istemci tarafı IP hash (gerçek IP değil, oturum bazlı bir kimlik)
// Spam korumasına yardımcı olur ama anonimliği korur
export function getClientHash() {
  let hash = localStorage.getItem('client_hash');
  if (!hash) {
    hash = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem('client_hash', hash);
  }
  return hash;
}
