export interface PR {
  id: number;
  exercise: string;
  weight: number;
  reps: number;
  performed_at: string;
}

export interface PRCreate {
  exercise: string;
  weight: number;
  reps: number;
}

export interface PRUpdate {
  exercise?: string;
  weight?: number;
  reps?: number;
}
export interface Milestone {
  name: string;
  is_unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
  target: number;
  title: string;
  description: string;
  unit: string;
}
