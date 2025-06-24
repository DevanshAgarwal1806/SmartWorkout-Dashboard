export interface WorkoutEntry {
  id: string;
  date: string;
  duration: number;
  calories: number;
  type?: string;
  notes?: string;
  exercises?: Record<string, any>;
}

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export interface Goal {
  id: string;
  user_id: string;
  goal: string;
  target_date: string;
  completed: boolean;
  created_at?: string;
}
