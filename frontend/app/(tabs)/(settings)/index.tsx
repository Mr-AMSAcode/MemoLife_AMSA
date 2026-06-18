// ─────────────────────────────────────────
// FICHIER : frontend/app/(settings)/index.tsx
// ─────────────────────────────────────────
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Font, Spacing, Radius, Shadow } from '../../../Constants/theme';

function SettingRow({
  icon, label, value, onPress, danger,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{icon}</Text>
        <Text style={[styles.rowLabel, danger && styles.rowDanger]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Text style={styles.rowArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Profil */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>
            {user?.prenom?.[0]?.toUpperCase() || 'M'}
          </Text>
        </View>
        <View>
          <Text style={styles.profileName}>
            {user?.prenom} {user?.nom}
          </Text>
          <Text style={styles.profileEmail}>
            {user?.email || user?.telephone || '—'}
          </Text>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>{user?.plan || 'FREE'}</Text>
          </View>
        </View>
      </View>

      {/* Section Compte */}
      <Text style={styles.sectionTitle}>Compte</Text>
      <View style={styles.section}>
        <SettingRow icon="👤" label="Mon profil" onPress={() => {}} />
        <SettingRow
          icon="🌍"
          label="Langue"
          value={user?.langue === 'FR' ? 'Français' : 'English'}
          onPress={() => {}}
        />
        <SettingRow icon="🔔" label="Notifications" onPress={() => {}} />
      </View>

      {/* Section IA */}
      <Text style={styles.sectionTitle}>Assistant IA</Text>
      <View style={styles.section}>
        <SettingRow icon="🤖" label="Comportement de l'IA" onPress={() => {}} />
        <SettingRow icon="⏰" label="Heure du résumé quotidien" onPress={() => {}} />
        <SettingRow icon="📊" label="Mes statistiques" onPress={() => {}} />
      </View>

      {/* Section Abonnement */}
      <Text style={styles.sectionTitle}>Abonnement</Text>
      <View style={styles.section}>
        <SettingRow
          icon="👑"
          label="Passer en Premium"
          value="500 FCFA/mois"
          onPress={() => {}}
        />
      </View>

      {/* Déconnexion */}
      <View style={styles.section}>
        <SettingRow
          icon="🚪"
          label="Se déconnecter"
          onPress={handleLogout}
          danger
        />
      </View>

      <Text style={styles.version}>MemoLife v1.0.0 — IAI-Cameroun 2025</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.lg,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.xl, ...Shadow.sm,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontSize: Font.xl, fontWeight: Font.bold, color: Colors.textInv },
  profileName: { fontSize: Font.lg, fontWeight: Font.bold, color: Colors.text },
  profileEmail: { fontSize: Font.sm, color: Colors.textSec, marginTop: 2 },
  planBadge: {
    marginTop: Spacing.sm, backgroundColor: Colors.accent + '20',
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  planText: { fontSize: Font.xs, color: Colors.accent, fontWeight: Font.semibold },
  sectionTitle: {
    fontSize: Font.xs, fontWeight: Font.semibold,
    color: Colors.textTer, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: Spacing.sm, marginTop: Spacing.md,
  },
  section: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    marginBottom: Spacing.sm, overflow: 'hidden', ...Shadow.xs,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowIcon: { fontSize: 18, width: 28 },
  rowLabel: { fontSize: Font.md, color: Colors.text },
  rowDanger: { color: Colors.warm },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowValue: { fontSize: Font.sm, color: Colors.textTer },
  rowArrow: { fontSize: 20, color: Colors.textTer },
  version: {
    fontSize: Font.xs, color: Colors.textTer,
    textAlign: 'center', marginTop: Spacing.xl,
  },
});
