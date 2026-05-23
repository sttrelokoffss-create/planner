import { supabase } from '../lib/supabase';
import { getTelegramUserId } from '../lib/telegram';

export const loadTasks = async () => {
  const userId = getTelegramUserId();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('telegram_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createTask = async (text: string) => {
  const userId = getTelegramUserId();
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ text, telegram_id: userId, done: false }])
    .select();
    
  if (error) throw error;
  return data?.[0];
};

export const updateTask = async (id: number, updates: any) => {
  const userId = getTelegramUserId();
  
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('telegram_id', userId)
    .select();
    
  if (error) throw error;
  return data?.[0];
};

export const deleteTask = async (id: number) => {
  const userId = getTelegramUserId();
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('telegram_id', userId);
    
  if (error) throw error;
};
