// ─────────────────────────────────────────
// FICHIER : frontend/app/services/api.ts
// Communication avec le backend FastAPI local (Qwen3/Ollama).
// AUCUN appel a une API cloud payante.
// ─────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthTokens, User, Task, ChatResponse, Conversation, Roadmap,
  Medicament, SuiviPersonne, Budget, Depense,
  RappelAVenir, RappelDeclenche,
} from '../types';

// ⚠️ IMPORTANT : remplace par l'IP locale de ton PC (cf. ipconfig / ifconfig)
// Exemple : 'http://192.168.1.42:8000'
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.100:8000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erreur reseau' }));
    throw new Error(err.detail || `Erreur HTTP ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

// ───────── AUTH ─────────
export const AuthAPI = {
  async register(data: {
    nom: string; prenom: string; email?: string; telephone?: string;
    mot_de_passe: string; langue?: string;
  }): Promise<AuthTokens> {
    const tokens = await request<AuthTokens>('/auth/register', {
      method: 'POST', body: JSON.stringify(data),
    });
    await AsyncStorage.setItem('access_token', tokens.access_token);
    return tokens;
  },

  async login(identifiant: string, motDePasse: string): Promise<AuthTokens> {
    const form = new URLSearchParams({ username: identifiant, password: motDePasse });
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    if (!res.ok) throw new Error('Identifiants incorrects');
    const tokens: AuthTokens = await res.json();
    await AsyncStorage.setItem('access_token', tokens.access_token);
    return tokens;
  },

  async me(): Promise<User> {
    return request<User>('/auth/me');
  },

  async completerOnboarding(data: {
    profil: string; occupations?: string[]; heure_reveil: string; langue: string;
  }): Promise<{ statut: string }> {
    return request('/auth/onboarding', { method: 'POST', body: JSON.stringify(data) });
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['access_token', 'onboarding_done', 'user_prefs']);
  },
};

// ───────── CHAT / IA (Qwen3 local) ─────────
export const ChatAPI = {
  async envoyerMessage(contenu: string, typeMedia: 'TEXTE' | 'VOCAL' = 'TEXTE'): Promise<ChatResponse> {
    return request<ChatResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ contenu, type_media: typeMedia }),
    });
  },

  async validerProposition(propositionId: string): Promise<{ statut: string; resultat: any }> {
    return request(`/chat/proposition/${propositionId}/valider`, { method: 'POST' });
  },

  async refuserProposition(propositionId: string, raison?: string): Promise<{ statut: string }> {
    return request(`/chat/proposition/${propositionId}/refuser`, {
      method: 'POST',
      body: JSON.stringify({ raison }),
    });
  },

  async getConversations(): Promise<Conversation[]> {
    return request('/chat/conversations');
  },
};

// ───────── TÂCHES ─────────
export const TaskAPI = {
  async getAll(params?: { statut?: string; date?: string }): Promise<Task[]> {
    const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request(`/taches${q}`);
  },
  async create(data: Partial<Task>): Promise<Task> {
    return request('/taches', { method: 'POST', body: JSON.stringify(data) });
  },
  async update(id: string, data: Partial<Task>): Promise<Task> {
    return request(`/taches/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async marquerAchevee(id: string): Promise<Task> {
    return request(`/taches/${id}/achever`, { method: 'POST' });
  },
  async reporter(id: string, nouvelleDate: string): Promise<Task> {
    return request(`/taches/${id}/reporter`, { method: 'POST', body: JSON.stringify({ nouvelle_date: nouvelleDate }) });
  },
  async delete(id: string): Promise<void> {
    return request(`/taches/${id}`, { method: 'DELETE' });
  },
};

// ───────── SANTÉ (médicaments + suivi personne) ─────────
export const HealthAPI = {
  async getMedicaments(): Promise<Medicament[]> {
    return request('/sante/medicaments');
  },
  async createMedicament(data: Partial<Medicament>): Promise<Medicament> {
    return request('/sante/medicaments', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateMedicament(id: string, data: Partial<Medicament>): Promise<Medicament> {
    return request(`/sante/medicaments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async deleteMedicament(id: string): Promise<void> {
    return request(`/sante/medicaments/${id}`, { method: 'DELETE' });
  },
  async confirmerPrise(medicamentId: string): Promise<void> {
    return request(`/sante/medicaments/${medicamentId}/prise`, { method: 'POST' });
  },
  async enregistrerSuivi(data: Partial<SuiviPersonne>): Promise<{ id: string }> {
    return request('/sante/suivi', { method: 'POST', body: JSON.stringify(data) });
  },
  async historiqueSuivi(): Promise<SuiviPersonne[]> {
    return request('/sante/suivi/historique');
  },
};

// ───────── BUDGET ─────────
export const BudgetAPI = {
  async getCurrent(mois?: string): Promise<Budget | null> {
    try {
      const q = mois ? `?mois=${mois}` : '';
      return await request(`/budget/current${q}`);
    } catch {
      return null;
    }
  },
  async createOrUpdate(data: { plafond_fcfa: number; alerte_seuil_pct?: number }): Promise<Budget> {
    return request('/budget', { method: 'POST', body: JSON.stringify(data) });
  },
  async getDepenses(mois?: string): Promise<Depense[]> {
    const q = mois ? `?mois=${mois}` : '';
    return request(`/budget/depenses${q}`);
  },
  async addDepense(data: Partial<Depense>): Promise<Depense> {
    return request('/budget/depenses', { method: 'POST', body: JSON.stringify(data) });
  },
  async deleteDepense(id: string): Promise<void> {
    return request(`/budget/depenses/${id}`, { method: 'DELETE' });
  },
};

// ───────── ROADMAP ─────────
export const RoadmapAPI = {
  async getAll(): Promise<Roadmap[]> {
    return request('/roadmaps');
  },
  async getDetail(id: string): Promise<Roadmap> {
    return request(`/roadmaps/${id}`);
  },
};

// ───────── RAPPELS (alarme + vocal Piper) ─────────
export const RappelAPI = {
  async aVenir(): Promise<RappelAVenir[]> {
    return request('/rappels/a-venir');
  },
  async declencher(id: string): Promise<RappelDeclenche> {
    return request(`/rappels/${id}/declencher`, { method: 'POST' });
  },
  async confirmer(id: string): Promise<{ statut: string }> {
    return request(`/rappels/${id}/confirmer`, { method: 'POST' });
  },
};

export function getBaseUrl(): string {
  return BASE_URL;
}
