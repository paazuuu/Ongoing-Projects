import { VehicleCategory } from '../types';

export const VEHICLE_CATEGORIES: { code: VehicleCategory; label: string; color: string }[] = [
  { code: 'sales', label: '営業車', color: '#2563eb' },
  { code: 'liaison', label: '連絡車', color: '#0891b2' },
  { code: 'wcab', label: 'Wキャブ', color: '#7c3aed' },
  { code: 'rental', label: 'レンタカー', color: '#f59e0b' },
  { code: 'mobile', label: '機動', color: '#dc2626' },
  { code: 'other', label: 'その他', color: '#6b7280' },
];

export const vehicleCategoryLabel = (cat: VehicleCategory): string =>
  VEHICLE_CATEGORIES.find((c) => c.code === cat)?.label ?? 'その他';

export const vehicleCategoryColor = (cat: VehicleCategory): string =>
  VEHICLE_CATEGORIES.find((c) => c.code === cat)?.color ?? '#6b7280';
