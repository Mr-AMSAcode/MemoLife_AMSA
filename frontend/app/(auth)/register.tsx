// ─────────────────────────────────────────
// FICHIER : frontend/app/(auth)/register.tsx
// Inscription reelle avec mot de passe (backend JWT classique)
// ─────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { Colors, Font, Spacing, Radius, Shadow } from '../../Constants/theme';

type Mode = 'email' | 'phone';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [mode, setMode] = useState<Mode>('email');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [contact, setContact] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);

  function isValid() {
    if (!nom.trim() || !prenom.trim() || motDePasse.length < 6) return false;
    if (mode === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    return /^[0-9]{8,15}$/.test(contact.replace(/\s/g, ''));
  }

  async function handleRegister() {
    if (!isValid()) {
      Alert.alert('Verifiez la saisie', 'Tous les champs sont requis (mot de passe : 6 caracteres minimum).');
      return;
    }
    try {
      setLoading(true);
      await register({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: mode === 'email' ? contact.trim().toLowerCase() : undefined,
        telephone: mode === 'phone' ? contact.trim() : undefined,
        mot_de_passe: motDePasse,
      });
      router.replace('/(onboarding)/step1');
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Inscription echouee.');
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
          <Text style={styles.title}>Creer un compte</Text>
          <Text style={styles.subtitle}>Quelques informations pour commencer</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Prenom</Text>
            <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholder="Cathy" placeholderTextColor={Colors.textTer} />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Nom</Text>
            <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Tsobgni" placeholderTextColor={Colors.textTer} />
          </View>
        </View>

        <View style={styles.toggle}>
          <TouchableOpacity style={[styles.toggleBtn, mode === 'email' && styles.toggleActive]} onPress={() => { setMode('email'); setContact(''); }}>
            <Text style={[styles.toggleText, mode === 'email' && styles.toggleTextActive]}>📧 Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, mode === 'phone' && styles.toggleActive]} onPress={() => { setMode('phone'); setContact(''); }}>
            <Text style={[styles.toggleText, mode === 'phone' && styles.toggleTextActive]}>📱 Telephone</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{mode === 'email' ? 'Adresse email' : 'Numero de telephone'}</Text>
          <TextInput
            style={styles.input}
            placeholder={mode === 'email' ? 'vous@email.com' : '6XX XXX XXX'}
            placeholderTextColor={Colors.textTer}
            value={contact} onChangeText={setContact}
            keyboardType={mode === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="6 caracteres minimum"
            placeholderTextColor={Colors.textTer}
            value={motDePasse} onChangeText={setMotDePasse}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={[styles.btn, !isValid() && styles.btnDisabled]} onPress={handleRegister} disabled={loading || !isValid()}>
          {loading ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.btnText}>Creer mon compte →</Text>}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Deja un compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.lg },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl, ...Shadow.xs },
  backIcon: { fontSize: 20, color: Colors.text },
  header: { marginBottom: Spacing.xl },
  title: { fontSize: Font.xxl, fontWeight: Font.bold, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: Font.md, color: Colors.textSec },
  row: { flexDirection: 'row', gap: Spacing.sm },
  toggle: { flexDirection: 'row', backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, padding: 4, marginBottom: Spacing.md },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.sm - 2 },
  toggleActive: { backgroundColor: Colors.surface, ...Shadow.xs },
  toggleText: { fontSize: Font.sm, fontWeight: Font.medium, color: Colors.textSec },
  toggleTextActive: { color: Colors.text, fontWeight: Font.semibold },
  fieldGroup: { marginBottom: Spacing.md },
  label: { fontSize: Font.sm, fontWeight: Font.medium, color: Colors.textSec, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: Font.md, color: Colors.text, ...Shadow.xs },
  btn: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginVertical: Spacing.md, ...Shadow.accent },
  btnDisabled: { backgroundColor: Colors.border, ...Shadow.xs },
  btnText: { fontSize: Font.md, fontWeight: Font.semibold, color: Colors.primary },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: Font.sm, color: Colors.textSec },
  loginLink: { fontSize: Font.sm, fontWeight: Font.semibold, color: Colors.accent },
});
