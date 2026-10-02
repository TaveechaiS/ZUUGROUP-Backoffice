import definitions from './modules.json';
import type { RecordModule } from '@/types/api/records';
export const RECORD_MODULES = definitions as RecordModule[];
export const moduleFor = (key: string) => RECORD_MODULES.find((m) => m.key === key);
