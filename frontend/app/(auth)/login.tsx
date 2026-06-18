// ─────────────────────────────────────────
// FICHIER : frontend/app/(auth)/login.tsx
// Connexion reelle (email/telephone + mot de passe)
// ─────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { Colors, Font, Spacing, Radius, Shadow } from '../../Constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [contact, setContact] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!contact.trim() || !motDePasse) {
      Alert.alert('Champs requis', 'Email/telephone et mot de passe sont requis.');
      return;
    }
    try {
      setLoading(true);
      await login(contact.trim(), motDePasse);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Connexion echouee', e.message || 'Verifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Bon retour 👋</Text>
          <Text style={styles.subtitle}>Connectez-vous a votre compte MemoLife</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email ou telephone</Text>
          <TextInput
            style={styles.input}
            placeholder="vous@email.com ou 6XXXXXXXX"
            placeholderTextColor={Colors.textTer}
            value={contact} onChangeText={setContact}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.textTer}
            value={motDePasse} onChangeText={setMotDePasse}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.btnText}>Se connecter →</Text>}
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.lg, justifyContent: 'center' },
  back: { position: 'absolute', top: Spacing.lg, left: Spacing.lg, width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.xs },
  backIcon: { fontSize: 20, color: Colors.text },
  header: { marginBottom: Spacing.xl, marginTop: Spacing.xxl },
  title: { fontSize: Font.xxl, fontWeight: Font.bold, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: Font.md, color: Colors.textSec },
  fieldGroup: { marginBottom: Spacing.md },
  label: { fontSize: Font.sm, fontWeight: Font.medium, color: Colors.textSec, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: Font.md, color: Colors.text, ...Shadow.xs },
  btn: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginVertical: Spacing.lg, ...Shadow.accent },
  btnText: { fontSize: Font.md, fontWeight: Font.semibold, color: Colors.primary },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: Font.sm, color: Colors.textSec },
  registerLink: { fontSize: Font.sm, fontWeight: Font.semibold, color: Colors.accent },
});
