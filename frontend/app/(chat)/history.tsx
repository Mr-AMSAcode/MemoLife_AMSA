// ─────────────────────────────────────────
// MemoLife — Historique conversations IA
// ─────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ChatAPI } from '../services/api';
import { Conversation } from '../types';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../Constants/theme';

export default function HistoryScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading]         = useState(true);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      setIsLoading(true);
      const data = await ChatAPI.getConversations();
      setConversations(data);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>Aucune conversation</Text>
          <Text style={styles.emptySub}>Vos échanges avec l'IA apparaîtront ici</Text>
          <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/(chat)/chat')}>
            <Text style={styles.startBtnText}>Démarrer une conversation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.convCard}
              onPress={() => router.push({ pathname: '/(chat)/chat', params: { conv_id: item.id } })}
            >
              <View style={styles.convIcon}>
                <Text style={{ fontSize: 20 }}>🤖</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.convTitle} numberOfLines={1}>
                  {item.titre || 'Conversation sans titre'}
                </Text>
                <Text style={styles.convMeta}>
                  {item.nb_messages ?? 0} message{item.nb_messages !== 1 ? 's' : ''} · {' '}
                  {new Date(item.updated_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md },
  convCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm,
  },
  convIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center',
  },
  convTitle: { ...Typography.button, color: Colors.textPrimary },
  convMeta: { ...Typography.caption, color: Colors.textTertiary, marginTop: 2 },
  arrow: { fontSize: 20, color: Colors.textTertiary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.h2, color: Colors.textPrimary, marginBottom: 4 },
  emptySub: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  startBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  startBtnText: { ...Typography.button, color: '#fff' },
});
