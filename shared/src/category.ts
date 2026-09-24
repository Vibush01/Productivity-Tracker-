// ─── Category ──────────────────────────────────
export interface Category {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  isDefault: boolean;
  habitCount?: number;
}
