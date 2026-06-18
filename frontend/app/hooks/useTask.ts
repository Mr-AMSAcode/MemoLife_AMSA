// ─────────────────────────────────────────
// FICHIER : frontend/app/hooks/useTask.ts
// ─────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { TaskAPI } from '../services/api';
import { Task } from '../types';

export function useTask(filters?: { statut?: string; date?: string }) {
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await TaskAPI.getAll(filters);
      setTasks(data);
    } catch (e: any) {
      setError(e.message);
      // En développement : retourner des données mock si le backend n'est pas lancé
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.statut, filters?.date]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const marquerAchevee = async (id: string) => {
    try {
      const updated = await TaskAPI.marquerAchevee(id);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const supprimerTask = async (id: string) => {
    try {
      await TaskAPI.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Tâches filtrées
  const tasksDuJour = tasks.filter(t => {
    if (!t.date_echeance) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.date_echeance.startsWith(today);
  });

  const tasksAFaire   = tasks.filter(t => t.statut === 'A_FAIRE');
  const tasksAchevees = tasks.filter(t => t.statut === 'FAITE');
  const tauxCompletion = tasks.length > 0
    ? Math.round((tasksAchevees.length / tasks.length) * 100) : 0;

  return {
    tasks,
    tasksDuJour,
    tasksAFaire,
    tasksAchevees,
    tauxCompletion,
    isLoading,
    error,
    refresh: fetchTasks,
    marquerAchevee,
    supprimerTask,
  };
}
