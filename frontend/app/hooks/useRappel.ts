// ─────────────────────────────────────────
// FICHIER : frontend/app/hooks/useRappel.ts
// Gere le declenchement des rappels : alarme sonore
// ET lecture vocale (Piper TTS via backend) en meme temps,
// avec le texte affiche simultanement a l'ecran.
// ─────────────────────────────────────────
import { useState, useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { RappelAPI, getBaseUrl } from '../services/api';
import { RappelAVenir, RappelDeclenche } from '../types';

export function useRappel() {
  const [rappelsAVenir, setRappelsAVenir] = useState<RappelAVenir[]>([]);
  const [rappelActif, setRappelActif] = useState<RappelDeclenche | null>(null);
  const sonRef = useRef<Audio.Sound | null>(null);

  const chargerRappels = useCallback(async () => {
    try {
      const data = await RappelAPI.aVenir();
      setRappelsAVenir(data);
    } catch (e) {
      console.error('Erreur chargement rappels', e);
    }
  }, []);

  useEffect(() => {
    chargerRappels();
    const intervalle = setInterval(chargerRappels, 60_000); // verifie chaque minute
    return () => clearInterval(intervalle);
  }, [chargerRappels]);

  /**
   * Declenche un rappel : recupere l'audio Piper genere par le backend
   * (texte_a_lire) et joue l'alarme + la voix en meme temps.
   * Le texte reste affiche a l'ecran tant que rappelActif n'est pas null.
   */
  const declencherRappel = useCallback(async (rappelId: string) => {
    try {
      const resultat = await RappelAPI.declencher(rappelId);
      setRappelActif(resultat);

      // Jouer l'audio genere par Piper, s'il existe
      if (resultat.audio_url) {
        const urlComplete = `${getBaseUrl()}${resultat.audio_url}`;
        const { sound } = await Audio.Sound.createAsync(
          { uri: urlComplete },
          { shouldPlay: true, volume: resultat.volume_alarme / 100 }
        );
        sonRef.current = sound;
      }
    } catch (e) {
      console.error('Erreur declenchement rappel', e);
    }
  }, []);

  const confirmerRappel = useCallback(async (rappelId: string) => {
    try {
      await RappelAPI.confirmer(rappelId);
      setRappelActif(null);
      if (sonRef.current) {
        await sonRef.current.stopAsync();
        await sonRef.current.unloadAsync();
        sonRef.current = null;
      }
      await chargerRappels();
    } catch (e) {
      console.error('Erreur confirmation rappel', e);
    }
  }, [chargerRappels]);

  return {
    rappelsAVenir,
    rappelActif,
    declencherRappel,
    confirmerRappel,
    refresh: chargerRappels,
  };
}
