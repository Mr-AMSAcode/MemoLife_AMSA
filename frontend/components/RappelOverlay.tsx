// ─────────────────────────────────────────
// FICHIER : frontend/components/RappelOverlay.tsx
// Affiche le texte du rappel a l'ecran PENDANT que
// l'alarme sonne et que Piper lit la tache a voix haute.
// ─────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors, Font, Spacing, Radius, Shadow } from '../Constants/theme';
import { RappelDeclenche } from '../app/types';

interface Props {
  rappel: RappelDeclenche | null;
  onConfirmer: () => void;
}

export default function RappelOverlay({ rappel, onConfirmer }: Props) {
  if (!rappel) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <Text style={styles.icon}>🔔</Text>
            <Text style={styles.icon}>🔊</Text>
          </View>

          <Text style={styles.label}>Rappel</Text>
          <Text style={styles.texte}>{rappel.texte_a_lire}</Text>

          <Text style={styles.sousTexte}>
            {rappel.audio_url ? 'Lecture vocale en cours...' : 'Alarme sonore'}
          </Text>

          <TouchableOpacity style={styles.bouton} onPress={onConfirmer}>
            <Text style={styles.boutonTexte}>J'ai vu, merci ✓</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26,26,46,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    ...Shadow.lg,
  },
  iconRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  icon: { fontSize: 40 },
  label: {
    fontSize: Font.xs, fontWeight: Font.semibold, color: Colors.accent,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm,
  },
  texte: {
    fontSize: Font.xl, fontWeight: Font.bold, color: Colors.text,
    textAlign: 'center', marginBottom: Spacing.sm, lineHeight: 30,
  },
  sousTexte: {
    fontSize: Font.sm, color: Colors.textSec,
    marginBottom: Spacing.xl, fontStyle: 'italic',
  },
  bouton: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingVertical: 14, paddingHorizontal: Spacing.xl, width: '100%',
    alignItems: 'center', ...Shadow.accent,
  },
  boutonTexte: { fontSize: Font.md, fontWeight: Font.semibold, color: Colors.primary },
});
