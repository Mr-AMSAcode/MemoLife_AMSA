// ─────────────────────────────────────────
// FICHIER : frontend/app/types/index.ts
// Types alignes sur le backend FastAPI (Qwen3 local)
// ─────────────────────────────────────────

export type Profil = 'PERSONNE_AGEE' | 'ETUDIANT' | 'TRAVAILLEUR';
export type Langue = 'FR' | 'EN';
export type NiveauDigital = 'FAIBLE' | 'MOYEN' | 'AVANCE';

export type TaskStatus = 'A_FAIRE' | 'EN_COURS' | 'FAITE' | 'RATEE' | 'REPORTEE';
export type TaskPriority = 'BASSE' | 'NORMALE' | 'HAUTE';
export type TaskSource = 'MANUELLE' | 'IA';

export type IntentionType =
  | 'CREER_TACHE'
  | 'CREER_ROADMAP'
  | 'ENREGISTRER_SUIVI'
  | 'MODIFIER_TACHE'
  | 'CONSULTER'
  | 'AMBIGU';

export type PropositionStatus = 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  profil: Profil;
  langue: Langue;
  onboarding_ok: boolean;
  plan: string;
}

export interface Task {
  id: string;
  titre: string;
  description?: string;
  statut: TaskStatus;
  priorite: TaskPriority;
  date_echeance?: string;
  source: TaskSource;
  roadmap_id?: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  contenu: string;
  type_media: 'TEXTE' | 'VOCAL';
  created_at: string;
}

export interface PropositionIA {
  id: string;
  intention: IntentionType;
  donnees: Record<string, any>;
}

export interface ChatResponse {
  message_ia: string;
  intention: IntentionType;
  proposition: PropositionIA | null;
}

export interface Roadmap {
  id: string;
  titre: string;
  type: 'FORMATION' | 'PROJET';
  date_debut: string;
  date_fin: string;
  progression_pct: number;
  nb_etapes: number;
  nb_etapes_faites: number;
  etapes?: { id: string; titre: string; statut: TaskStatus; date_echeance?: string }[];
}

export interface Medicament {
  id: string;
  nom: string;
  dosage?: string;
  frequence: 'QUOTIDIEN' | 'BIQUOTIDIEN' | 'HEBDO';
  heures_prise: string[];
  actif: boolean;
}

export interface SuiviPersonne {
  id: string;
  date: string;
  sante_etat?: 'BIEN' | 'MOYEN' | 'MAUVAIS';
  humeur?: 'JOYEUX' | 'NEUTRE' | 'TRISTE' | 'STRESSE';
  note_libre?: string;
}

export interface Budget {
  id: string;
  montant: number;
  categorie: string;
  date: string;
}

export interface Conversation {
  id: string;
  titre: string;
  created_at: string;
  updated_at: string;
  derniers_messages?: Message[];
  nb_messages?: number;
}
export interface Depense {
  id: string;
  libelle: string;
  montant_fcfa: number;
  categorie: 'ALIMENTAIRE' | 'TRANSPORT' | 'SANTE' | 'EDUCATION' | 'LOISIR' | 'AUTRE';
  date: string;
  source: 'MANUELLE' | 'IA';
}


export interface RappelAVenir {
  id: string;
  tache_id: string;
  planifie_a: string;
  texte_a_lire: string;
  canal: 'ALARME' | 'VOCAL' | 'VOCAL_TEXTE';
}

export interface RappelDeclenche {
  statut: string;
  texte_a_lire: string;
  audio_url: string | null;
  volume_alarme: number;
  vitesse_vocale: number;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}
