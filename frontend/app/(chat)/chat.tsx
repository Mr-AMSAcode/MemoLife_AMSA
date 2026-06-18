// ─────────────────────────────────────────
// MemoLife — Écran Chat IA
// ─────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Alert,
} from 'react-native';
import { ChatAPI } from '../services/api';
import { Message, PropositionIA } from '../types';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../Constants/theme';

// ── Bulle de message ──────────────────────
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAI]}>
      {!isUser && <View style={styles.aiAvatar}><Text>🤖</Text></View>}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
          {message.contenu}
        </Text>
        <Text style={styles.bubbleTime}>
          {new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

// ── Carte proposition IA ──────────────────
function PropositionCard({
  proposition,
  onValider,
  onRefuser,
}: {
  proposition: PropositionIA;
  onValider: () => void;
  onRefuser: () => void;
}) {
  const task = proposition.donnees?.tache_proposee ?? proposition.donnees ?? {};
  return (
    <View style={propStyles.card}>
      <View style={propStyles.header}>
        <Text style={propStyles.headerIcon}>💡</Text>
        <Text style={propStyles.headerText}>Proposition de l'IA</Text>
      </View>

      <View style={propStyles.body}>
        {task.titre && <Text style={propStyles.taskTitle}>{task.titre}</Text>}
        {task.description && <Text style={propStyles.taskDesc}>{task.description}</Text>}
        {task.date_echeance && (
          <View style={propStyles.detailRow}>
            <Text style={propStyles.detailIcon}>📅</Text>
            <Text style={propStyles.detailText}>
              {new Date(task.date_echeance).toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
        )}
        {task.priorite && (
          <View style={propStyles.detailRow}>
            <Text style={propStyles.detailIcon}>🎯</Text>
            <Text style={propStyles.detailText}>Priorité : {task.priorite}</Text>
          </View>
        )}
      </View>

      <Text style={propStyles.question}>Voulez-vous ajouter cette tâche à votre planning ?</Text>

      <View style={propStyles.actions}>
        <TouchableOpacity style={propStyles.btnRefuser} onPress={onRefuser}>
          <Text style={propStyles.btnRefuserText}>✗ Non, modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={propStyles.btnValider} onPress={onValider}>
          <Text style={propStyles.btnValiderText}>✓ Oui, ajouter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const propStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    margin: Spacing.md, borderLeftWidth: 4, borderLeftColor: Colors.warning,
    ...Shadow.md,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, backgroundColor: Colors.warning + '15',
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
  },
  headerIcon: { fontSize: 18 },
  headerText: { ...Typography.button, color: Colors.warning },
  body: { padding: Spacing.md },
  taskTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.sm },
  taskDesc: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  detailIcon: { fontSize: 14 },
  detailText: { ...Typography.bodySmall, color: Colors.textSecondary },
  question: { ...Typography.bodySmall, color: Colors.textSecondary, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, fontStyle: 'italic' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border },
  btnRefuser: {
    flex: 1, padding: Spacing.md, alignItems: 'center',
    borderRightWidth: 0.5, borderRightColor: Colors.border,
  },
  btnRefuserText: { ...Typography.button, color: Colors.danger },
  btnValider: { flex: 1, padding: Spacing.md, alignItems: 'center', backgroundColor: Colors.accent + '10' },
  btnValiderText: { ...Typography.button, color: Colors.accent },
});

// ── Écran principal Chat ──────────────────
export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [proposition, setProposition] = useState<PropositionIA | null>(null);
  const [input, setInput]             = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const flatRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation pulsation pendant que l'IA réfléchit
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTyping]);

  async function sendMessage() {
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    setInput('');

    // Message utilisateur immédiat
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      contenu: text,
      type_media: 'TEXTE',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setProposition(null);
    setIsTyping(true);

    try {
      const res = await ChatAPI.envoyerMessage(text);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        contenu: res.message_ia,
        type_media: 'TEXTE',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
      if (res.proposition) setProposition(res.proposition);
    } catch (e: any) {
      const errMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        contenu: `Désolé, une erreur est survenue : ${e.message}`,
        type_media: 'TEXTE',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  async function handleValider() {
    if (!proposition) return;
    try {
      await ChatAPI.validerProposition(proposition.id);
      setProposition(null);
      const confirmMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        contenu: '✅ Parfait ! La tâche a été ajoutée à votre planning. Vous recevrez un rappel en temps voulu.',
        type_media: 'TEXTE',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  }

  async function handleRefuser() {
    if (!proposition) return;
    try {
      await ChatAPI.refuserProposition(proposition.id);
      setProposition(null);
      const refusMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        contenu: "D'accord, je n'ajoute rien. Voulez-vous que je propose quelque chose de différent ?",
        type_media: 'TEXTE',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, refusMsg]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  }

  // Message d'accueil si vide
  const welcomeItems = messages.length === 0 ? [
    { id: 'w1', contenu: "Bonjour ! Je suis votre assistant MemoLife 🤖", role: 'assistant' as const },
    { id: 'w2', contenu: "Dites-moi ce que vous avez à faire — je m'occupe du reste !", role: 'assistant' as const },
  ] : [];

  const allItems: Message[] = [
    ...welcomeItems.map(w => ({
      ...w, type_media: 'TEXTE' as const, created_at: new Date().toISOString(),
    })),
    ...messages,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.aiInfo}>
          <View style={styles.aiDot} />
          <Text style={styles.aiName}>Assistant MemoLife</Text>
        </View>
        <Text style={styles.aiStatus}>En ligne</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={allItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          <>
            {isTyping && (
              <View style={[styles.bubbleRow, styles.bubbleRowAI]}>
                <View style={styles.aiAvatar}><Text>🤖</Text></View>
                <View style={styles.bubbleAI}>
                  <Animated.View style={[styles.typingDots, { opacity: pulseAnim }]}>
                    <Text style={styles.typingText}>L'IA réfléchit...</Text>
                  </Animated.View>
                </View>
              </View>
            )}
            {proposition && (
              <PropositionCard
                proposition={proposition}
                onValider={handleValider}
                onRefuser={handleRefuser}
              />
            )}
          </>
        }
      />

      {/* Suggestions rapides */}
      {messages.length === 0 && (
        <View style={styles.suggestionsRow}>
          {[
            "J'ai l'église dimanche",
            "Rappelle-moi de lire",
            "Cours de sport ce soir",
          ].map(s => (
            <TouchableOpacity
              key={s}
              style={styles.suggestionChip}
              onPress={() => { setInput(s); }}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Zone de saisie */}
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.voiceBtn} onPress={() => Alert.alert('Vocal', 'Maintenez pour dicter...')}>
          <Text style={{ fontSize: 20 }}>🎙️</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Écrivez ou dictez..."
          placeholderTextColor={Colors.textTertiary}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || isTyping}
        >
          <Text style={{ fontSize: 18, color: '#fff' }}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  aiInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  aiDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  aiName: { ...Typography.button, color: Colors.textPrimary },
  aiStatus: { ...Typography.caption, color: Colors.accent },
  messagesList: { padding: Spacing.md, paddingBottom: Spacing.lg },
  bubbleRow: { flexDirection: 'row', marginBottom: Spacing.md, alignItems: 'flex-end' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAI: { justifyContent: 'flex-start', gap: Spacing.sm },
  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  bubble: { maxWidth: '75%', borderRadius: Radius.lg, padding: Spacing.md },
  bubbleUser: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4, ...Shadow.sm },
  bubbleText: { ...Typography.body },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAI: { color: Colors.textPrimary },
  bubbleTime: { ...Typography.caption, marginTop: 4, opacity: 0.6 },
  typingDots: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm },
  typingText: { ...Typography.caption, color: Colors.textTertiary, fontStyle: 'italic' },
  suggestionsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm,
  },
  suggestionChip: {
    borderWidth: 1, borderColor: Colors.secondary,
    borderRadius: Radius.full, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  suggestionText: { ...Typography.caption, color: Colors.secondary },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    padding: Spacing.md, backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  voiceBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1, maxHeight: 100, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    ...Typography.body, color: Colors.textPrimary, backgroundColor: Colors.surfaceAlt,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.textTertiary },
});
