export interface StackTask {
  id: string;
  text: string;
  createdAt: number;
}

export interface Task {
  id: number;
  text: string;
  done: boolean;
  date: string; // YYYY-MM-DD
}
