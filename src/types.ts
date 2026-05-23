export interface StackTask {
  id: string;
  clientId?: string;
  text: string;
  createdAt: number;
}

export interface Task {
  id: number;
  clientId?: string;
  text: string;
  done: boolean;
  date: string; // YYYY-MM-DD
}
