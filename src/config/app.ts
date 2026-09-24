export const APP_CONFIG = {
  name: 'ZUUGROUP',
  locale: 'th-TH',
  timeZone: 'Asia/Bangkok',
  supabaseProjectRef: 'wiikzseotpjxssbcdayk',
  supabaseUrl: 'https://wiikzseotpjxssbcdayk.supabase.co',
} as const;

export function formatThaiDate(value: Date): string {
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'long',
    timeZone: APP_CONFIG.timeZone,
  }).format(value);
}
