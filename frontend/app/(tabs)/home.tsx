// ─────────────────────────────────────────
// FICHIER : frontend/app/(tabs)/home.tsx
// Dashboard principal + gestion des rappels (alarme + vocal Piper)
// ─────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useTask } from '../hooks/useTask';
import { useRappel } from '../hooks/useRappel';
import { Colors, Font, Spacing, Radius, Shadow } from '../../Constants/theme';
import { Task } from '../types';
import RappelOverlay from '../../components/RappelOverlay';

function TaskCard({ task, onCheck }: { task: Task; onCheck: () => void }) {
  const isDone = task.statut === 'FAITE';
  const priorityColor: Record<string, string> = {
    HAUTE: Colors.warm,
    NORMALE: Colors.accent,
    BASSE: Colors.textTer,
  };
  const color = priorityColor[task.priorite] || Colors.accent;

  return (
    <View style={cardStyles.wrap}>
      <TouchableOpacity style={[cardStyles.check, { borderColor: color }]} onPress={onCheck}>
        {isDone && <Text style={{ color: Colors.success, fontSize: 12, fontWeight: Font.bold }}>✓</Text>}
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[cardStyles.titre, isDone && cardStyles.done]} numberOfLines={1}>{task.titre}</Text>
        <View style={cardStyles.meta}>
          {task.source === 'IA' && (
            <View style={cardStyles.iaTag}><Text style={cardStyles.iaTagText}>IA</Text></View>
          )}
          {task.date_echeance && (
            <Text style={cardStyles.heure}>
              {new Date(task.date_echeance).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </View>
      <View style={[cardStyles.priority, { backgroundColor: color + '20' }]}>
        <View style={[cardStyles.priorityDot, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm, ...Shadow.xs },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: Font.md, fontWeight: Font.medium, color: Colors.text },
  done: { textDecorationLine: 'line-through', color: Colors.textTer },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 3 },
  iaTag: { backgroundColor: Colors.purpleLight, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 1 },
  iaTagText: { fontSize: Font.xs, color: Colors.purple, fontWeight: Font.semibold },
  heure: { fontSize: Font.xs, color: Colors.textTer },
  priority: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
});

function StatPill({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <View style={[statStyles.pill, { borderTopColor: color }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  pill: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderTopWidth: 3, ...Shadow.xs },
  value: { fontSize: Font.xl, fontWeight: Font.bold, marginBottom: 2 },
  label: { fontSize: Font.xs, color: Colors.textTer, textAlign: 'center' },
});

export default function HomeScreen() {
  const { user } = useAuth();
  const { tasksDuJour, tasksAFaire, tauxCompletion, isLoading, refresh, marquerAchevee } = useTask();
  const { rappelsAVenir, rappelActif, declencherRappel, confirmerRappel } = useRappel();
  const [refreshing, setRefreshing] = useState(false);

  const heure = new Date().getHours();
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.salut}>{salut} 👋</Text>
            <Text style={styles.nom}>{user?.prenom || 'Vous'}</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/(settings)')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{user?.prenom?.[0]?.toUpperCase() || 'M'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.chatBtn} onPress={() => router.push('/(tabs)/chat')} activeOpacity={0.88}>
          <View style={styles.chatBtnLeft}>
            <View style={styles.chatDot} />
            <View>
              <Text style={styles.chatBtnTitle}>Parler à votre assistant</Text>
              <Text style={styles.chatBtnSub}>Dites ce que vous voulez faire...</Text>
            </View>
          </View>
          <Text style={styles.chatBtnArrow}>›</Text>
        </TouchableOpacity>

        {/* Rappels à venir — déclenchement manuel pour démo, le CRON backend gère l'auto */}
        {rappelsAVenir.length > 0 && (
          <View style={styles.rappelsBox}>
            <Text style={styles.rappelsTitle}>📅 Prochain rappel</Text>
            <Text style={styles.rappelsTexte}>{rappelsAVenir[0].texte_a_lire}</Text>
            <Text style={styles.rappelsHeure}>
              {new Date(rappelsAVenir[0].planifie_a).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <TouchableOpacity style={styles.rappelsBtn} onPress={() => declencherRappel(rappelsAVenir[0].id)}>
              <Text style={styles.rappelsBtnText}>Tester maintenant 🔔🔊</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statsRow}>
          <StatPill value={tasksDuJour.length} label="Aujourd'hui" color={Colors.accent} />
          <StatPill value={`${tauxCompletion}%`} label="Complétées" color={Colors.success} />
          <StatPill value={tasksAFaire.length} label="À faire" color={Colors.warm} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Votre journée</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.voirTout}>Tout voir</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: Spacing.xl }} />
        ) : tasksDuJour.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>Journée non planifiée</Text>
            <Text style={styles.emptySub}>Parlez à votre assistant pour organiser votre journée</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/chat')}>
              <Text style={styles.emptyBtnText}>Planifier avec l'IA</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tasksDuJour.slice(0, 6).map(task => (
            <TaskCard key={task.id} task={task} onCheck={() => marquerAchevee(task.id)} />
          ))
        )}
      </ScrollView>

      {/* Overlay plein écran : texte affiché + alarme + vocal en même temps */}
      <RappelOverlay
        rappel={rappelActif}
        onConfirmer={() => rappelsAVenir[0] && confirmerRappel(rappelsAVenir[0].id)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xl },
  salut: { fontSize: Font.sm, color: Colors.textSec },
  nom: { fontSize: Font.xxl, fontWeight: Font.bold, color: Colors.text, marginTop: 2 },
  date: { fontSize: Font.xs, color: Colors.textTer, marginTop: 2, textTransform: 'capitalize' },
  avatarBtn: {},
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  avatarLetter: { fontSize: Font.lg, fontWeight: Font.bold, color: Colors.textInv },
  chatBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, ...Shadow.md },
  chatBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  chatDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  chatBtnTitle: { fontSize: Font.md, fontWeight: Font.semibold, color: Colors.textInv },
  chatBtnSub: { fontSize: Font.sm, color: Colors.textInv, opacity: 0.6, marginTop: 2 },
  chatBtnArrow: { fontSize: 28, color: Colors.textInv, opacity: 0.6 },
  rappelsBox: { backgroundColor: Colors.warmLight, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.warm + '40' },
  rappelsTitle: { fontSize: Font.sm, fontWeight: Font.semibold, color: Colors.warm, marginBottom: 4 },
  rappelsTexte: { fontSize: Font.md, fontWeight: Font.medium, color: Colors.text, marginBottom: 2 },
  rappelsHeure: { fontSize: Font.sm, color: Colors.textSec, marginBottom: Spacing.sm },
  rappelsBtn: { backgroundColor: Colors.warm, borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center' },
  rappelsBtnText: { fontSize: Font.sm, fontWeight: Font.semibold, color: '#fff' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Font.lg, fontWeight: Font.semibold, color: Colors.text },
  voirTout: { fontSize: Font.sm, color: Colors.accent, fontWeight: Font.medium },
  emptyState: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg, ...Shadow.xs },
  emptyIcon: { fontSize: 36, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: Font.lg, fontWeight: Font.semibold, color: Colors.text, marginBottom: 4 },
  emptySub: { fontSize: Font.sm, color: Colors.textSec, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  emptyBtnText: { fontSize: Font.sm, fontWeight: Font.semibold, color: Colors.textInv },
});
