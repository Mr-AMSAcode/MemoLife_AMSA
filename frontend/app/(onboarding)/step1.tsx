// ─────────────────────────────────────────
// MemoLife — Onboarding complet (5 étapes)
// Style inspiré Todoist, identité MemoLife
// ─────────────────────────────────────────
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Dimensions, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Font, Spacing, Radius, Shadow } from '../../Constants/theme';

const { width, height } = Dimensions.get('window');

// ─────────────────────────────────────────
// Données de configuration des étapes
// ─────────────────────────────────────────
const PROFILES = [
  { key: 'etudiant',   label: 'Étudiant(e)',   icon: '🎓', desc: 'Cours, devoirs, formations' },
  { key: 'travailleur',label: 'Travailleur(se)',icon: '💼', desc: 'Réunions, projets, deadlines' },
  { key: 'parent',     label: 'Parent',         icon: '👨‍👩‍👧', desc: 'Famille, enfants, maison' },
  { key: 'entrepreneur',label:'Entrepreneur',   icon: '🚀', desc: 'Business, objectifs, croissance' },
  { key: 'retraite',   label: 'Retraité(e)',    icon: '🌿', desc: 'Santé, loisirs, famille' },
  { key: 'autre',      label: 'Autre',          icon: '✨', desc: 'Mon propre rythme' },
];

const OCCUPATIONS = [
  { key: 'ecole',   label: 'École / Cours',   icon: '🏫' },
  { key: 'eglise',  label: 'Église / Prière', icon: '⛪' },
  { key: 'sport',   label: 'Sport',           icon: '⚽' },
  { key: 'travail', label: 'Travail',         icon: '🏢' },
  { key: 'famille', label: 'Famille',         icon: '👨‍👩‍👧' },
  { key: 'marche',  label: 'Marché',          icon: '🛒' },
];

const WAKE_TIMES = [
  { key: '5h',  label: '5h00',  icon: '🌑', desc: 'Très tôt lève' },
  { key: '6h',  label: '6h00',  icon: '🌅', desc: 'Lève-tôt' },
  { key: '7h',  label: '7h00',  icon: '☀️', desc: 'Matinal(e)' },
  { key: '8h',  label: '8h00',  icon: '🌤', desc: 'Normal' },
  { key: '9h',  label: '9h00',  icon: '⛅', desc: 'Pas pressé(e)' },
  { key: '10h', label: '10h+',  icon: '🌥', desc: 'Tard lève' },
];

const LANGUAGES = [
  { key: 'fr', label: 'Français', flag: '🇫🇷', desc: 'L\'IA vous parle en français' },
  { key: 'en', label: 'English',  flag: '🇬🇧', desc: 'The AI speaks English to you' },
];

// ─────────────────────────────────────────
// Composant barre de progression
// ─────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={progStyles.container}>
      <View style={progStyles.track}>
        <Animated.View style={[progStyles.fill, { width: `${(current / total) * 100}%` }]} />
      </View>
      <Text style={progStyles.label}>{current} / {total}</Text>
    </View>
  );
}

const progStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  track: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.accent, borderRadius: Radius.full },
  label: { fontSize: Font.xs, color: Colors.textTer, fontWeight: Font.medium, minWidth: 32, textAlign: 'right' },
});

// ─────────────────────────────────────────
// ÉTAPE 1 — Prénom
// ─────────────────────────────────────────
function Step1({ onNext }: { onNext: (data: any) => void }) {
  const [prenom, setPrenom] = useState('');
  return (
    <KeyboardAvoidingView style={stepStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={stepStyles.illustration}>
        <Text style={stepStyles.illEmoji}>👋</Text>
      </View>
      <Text style={stepStyles.stepLabel}>Étape 1 sur 5</Text>
      <Text style={stepStyles.title}>Comment vous appelez-vous ?</Text>
      <Text style={stepStyles.subtitle}>
        MemoLife personnalisera votre expérience en fonction de votre prénom.
      </Text>
      <View style={stepStyles.inputWrap}>
        <TextInput
          style={stepStyles.input}
          placeholder="Votre prénom..."
          placeholderTextColor={Colors.textTer}
          value={prenom}
          onChangeText={setPrenom}
          autoFocus
          autoCapitalize="words"
        />
      </View>
      <TouchableOpacity
        style={[stepStyles.btn, !prenom.trim() && stepStyles.btnDisabled]}
        onPress={() => prenom.trim() && onNext({ prenom: prenom.trim() })}
        disabled={!prenom.trim()}
      >
        <Text style={stepStyles.btnText}>Continuer →</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────
// ÉTAPE 2 — Profil
// ─────────────────────────────────────────
function Step2({ prenom, onNext }: { prenom: string; onNext: (data: any) => void }) {
  const [selected, setSelected] = useState('');
  return (
    <ScrollView contentContainerStyle={stepStyles.container} showsVerticalScrollIndicator={false}>
      <View style={stepStyles.illustration}>
        <Text style={stepStyles.illEmoji}>🎯</Text>
      </View>
      <Text style={stepStyles.stepLabel}>Étape 2 sur 5</Text>
      <Text style={stepStyles.title}>{prenom}, vous êtes plutôt…</Text>
      <Text style={stepStyles.subtitle}>
        L'IA adapte ses suggestions à votre profil de vie.
      </Text>
      <View style={gridStyles.grid}>
        {PROFILES.map(p => (
          <TouchableOpacity
            key={p.key}
            style={[gridStyles.card, selected === p.key && gridStyles.cardSelected]}
            onPress={() => setSelected(p.key)}
          >
            <Text style={gridStyles.cardIcon}>{p.icon}</Text>
            <Text style={[gridStyles.cardLabel, selected === p.key && gridStyles.cardLabelSelected]}>
              {p.label}
            </Text>
            <Text style={gridStyles.cardDesc}>{p.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[stepStyles.btn, !selected && stepStyles.btnDisabled]}
        onPress={() => selected && onNext({ profil: selected })}
        disabled={!selected}
      >
        <Text style={stepStyles.btnText}>Continuer →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─────────────────────────────────────────
// ÉTAPE 3 — Occupations régulières
// ─────────────────────────────────────────
function Step3({ onNext }: { onNext: (data: any) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(key: string) {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  return (
    <ScrollView contentContainerStyle={stepStyles.container} showsVerticalScrollIndicator={false}>
      <View style={stepStyles.illustration}>
        <Text style={stepStyles.illEmoji}>📌</Text>
      </View>
      <Text style={stepStyles.stepLabel}>Étape 3 sur 5</Text>
      <Text style={stepStyles.title}>Qu'est-ce qui occupe votre semaine ?</Text>
      <Text style={stepStyles.subtitle}>
        L'IA respectera ces créneaux et ne vous planifiera rien dessus.
      </Text>
      <View style={chipStyles.wrap}>
        {OCCUPATIONS.map(o => {
          const active = selected.includes(o.key);
          return (
            <TouchableOpacity
              key={o.key}
              style={[chipStyles.chip, active && chipStyles.chipActive]}
              onPress={() => toggle(o.key)}
            >
              <Text style={chipStyles.chipIcon}>{o.icon}</Text>
              <Text style={[chipStyles.chipText, active && chipStyles.chipTextActive]}>
                {o.label}
              </Text>
              {active && <Text style={chipStyles.check}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        style={stepStyles.btn}
        onPress={() => onNext({ occupations: selected })}
      >
        <Text style={stepStyles.btnText}>
          {selected.length > 0 ? `Continuer (${selected.length} sélectionné${selected.length > 1 ? 's' : ''}) →` : 'Passer cette étape →'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─────────────────────────────────────────
// ÉTAPE 4 — Heure de réveil
// ─────────────────────────────────────────
function Step4({ onNext }: { onNext: (data: any) => void }) {
  const [selected, setSelected] = useState('');
  return (
    <ScrollView contentContainerStyle={stepStyles.container} showsVerticalScrollIndicator={false}>
      <View style={stepStyles.illustration}>
        <Text style={stepStyles.illEmoji}>⏰</Text>
      </View>
      <Text style={stepStyles.stepLabel}>Étape 4 sur 5</Text>
      <Text style={stepStyles.title}>À quelle heure vous réveillez-vous ?</Text>
      <Text style={stepStyles.subtitle}>
        L'IA calera votre résumé matinal et vos rappels à la bonne heure.
      </Text>
      <View style={gridStyles.grid}>
        {WAKE_TIMES.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[gridStyles.card, selected === t.key && gridStyles.cardSelected, { width: '30%' }]}
            onPress={() => setSelected(t.key)}
          >
            <Text style={gridStyles.cardIcon}>{t.icon}</Text>
            <Text style={[gridStyles.cardLabel, selected === t.key && gridStyles.cardLabelSelected]}>
              {t.label}
            </Text>
            <Text style={gridStyles.cardDesc}>{t.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[stepStyles.btn, !selected && stepStyles.btnDisabled]}
        onPress={() => selected && onNext({ heure_reveil: selected })}
        disabled={!selected}
      >
        <Text style={stepStyles.btnText}>Continuer →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─────────────────────────────────────────
// ÉTAPE 5 — Langue
// ─────────────────────────────────────────
function Step5({ onNext }: { onNext: (data: any) => void }) {
  const [selected, setSelected] = useState('fr');
  return (
    <View style={stepStyles.container}>
      <View style={stepStyles.illustration}>
        <Text style={stepStyles.illEmoji}>🌍</Text>
      </View>
      <Text style={stepStyles.stepLabel}>Étape 5 sur 5</Text>
      <Text style={stepStyles.title}>Quelle langue préférez-vous ?</Text>
      <Text style={stepStyles.subtitle}>
        L'IA et l'interface s'adapteront à votre choix.
      </Text>
      <View style={langStyles.container}>
        {LANGUAGES.map(l => (
          <TouchableOpacity
            key={l.key}
            style={[langStyles.card, selected === l.key && langStyles.cardSelected]}
            onPress={() => setSelected(l.key)}
          >
            <Text style={langStyles.flag}>{l.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[langStyles.label, selected === l.key && langStyles.labelSelected]}>
                {l.label}
              </Text>
              <Text style={langStyles.desc}>{l.desc}</Text>
            </View>
            <View style={[langStyles.radio, selected === l.key && langStyles.radioSelected]}>
              {selected === l.key && <View style={langStyles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={stepStyles.btn}
        onPress={() => onNext({ langue: selected })}
      >
        <Text style={stepStyles.btnText}>Terminer la configuration →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────
// ÉCRAN DE BIENVENUE FINAL
// ─────────────────────────────────────────
function WelcomeFinal({ data, onStart }: { data: any; onStart: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={finalStyles.container}>
      {/* Fond animé */}
      <View style={finalStyles.bg} />

      <Animated.View style={[finalStyles.content, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={finalStyles.checkCircle}>
          <Text style={finalStyles.checkIcon}>✓</Text>
        </View>

        <Text style={finalStyles.greeting}>
          Bienvenue, {data.prenom} ! 🎉
        </Text>
        <Text style={finalStyles.message}>
          Votre assistant personnel est prêt.{'\n'}
          L'IA a tout compris — parlez-lui simplement.
        </Text>

        {/* Ce que l'IA sait déjà */}
        <View style={finalStyles.summaryCard}>
          <Text style={finalStyles.summaryTitle}>Ce que je sais de vous :</Text>
          {data.profil && (
            <View style={finalStyles.summaryRow}>
              <Text style={finalStyles.summaryIcon}>
                {PROFILES.find(p => p.key === data.profil)?.icon}
              </Text>
              <Text style={finalStyles.summaryText}>
                {PROFILES.find(p => p.key === data.profil)?.label}
              </Text>
            </View>
          )}
          {data.heure_reveil && (
            <View style={finalStyles.summaryRow}>
              <Text style={finalStyles.summaryIcon}>⏰</Text>
              <Text style={finalStyles.summaryText}>Réveil vers {data.heure_reveil}</Text>
            </View>
          )}
          {data.occupations?.length > 0 && (
            <View style={finalStyles.summaryRow}>
              <Text style={finalStyles.summaryIcon}>📌</Text>
              <Text style={finalStyles.summaryText}>
                {data.occupations.length} occupation{data.occupations.length > 1 ? 's' : ''} enregistrée{data.occupations.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          <View style={finalStyles.summaryRow}>
            <Text style={finalStyles.summaryIcon}>🌍</Text>
            <Text style={finalStyles.summaryText}>
              {data.langue === 'fr' ? 'Interface en Français' : 'Interface in English'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={finalStyles.btn} onPress={onStart}>
          <Text style={finalStyles.btnText}>Commencer maintenant 🚀</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const finalStyles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', padding: Spacing.lg,
  },
  bg: {
    position: 'absolute', top: -100, right: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: Colors.accent + '15',
  },
  content: { width: '100%', alignItems: 'center' },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.accent, alignItems: 'center',
    justifyContent: 'center', marginBottom: Spacing.lg, ...Shadow.accent,
  },
  checkIcon: { fontSize: 40, color: Colors.primary, fontWeight: Font.bold },
  greeting: {
    fontSize: Font.xxl, fontWeight: Font.bold,
    color: Colors.textInv, textAlign: 'center', marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Font.md, color: Colors.textInv, opacity: 0.75,
    textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xl,
  },
  summaryCard: {
    backgroundColor: Colors.surface + '15',
    borderRadius: Radius.lg, padding: Spacing.lg,
    width: '100%', marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.accent + '30',
  },
  summaryTitle: {
    fontSize: Font.sm, fontWeight: Font.semibold,
    color: Colors.accent, marginBottom: Spacing.md,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, marginBottom: Spacing.sm,
  },
  summaryIcon: { fontSize: 16, width: 24 },
  summaryText: { fontSize: Font.md, color: Colors.textInv, opacity: 0.85 },
  btn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingVertical: 16, paddingHorizontal: Spacing.xl,
    width: '100%', alignItems: 'center', ...Shadow.accent,
  },
  btnText: { fontSize: Font.md, fontWeight: Font.semibold, color: Colors.primary },
});

// ─────────────────────────────────────────
// ORCHESTRATEUR — Gère les 5 étapes + final
// ─────────────────────────────────────────
export default function OnboardingScreen() {
  const [step, setStep]     = useState(1);
  const [data, setData]     = useState<any>({});
  const [loading, setLoading] = useState(false);
  const TOTAL = 5;

  function nextStep(newData: any) {
    const merged = { ...data, ...newData };
    setData(merged);
    if (step < TOTAL) {
      setStep(s => s + 1);
    } else {
      setStep(TOTAL + 1); // écran final
    }
  }

  async function handleStart() {
    try {
      setLoading(true);
      // Sauvegarder les préférences utilisateur
      await AsyncStorage.setItem('onboarding_done', 'true');
      await AsyncStorage.setItem('user_prefs', JSON.stringify(data));
      // await UserAPI.saveOnboarding(data);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Écran final de bienvenue
  if (step > TOTAL) {
    return <WelcomeFinal data={data} onStart={handleStart} />;
  }

  return (
    <View style={styles.screen}>
      {/* Barre de progression */}
      <View style={styles.progressWrap}>
        <ProgressBar current={step} total={TOTAL} />
      </View>

      {/* Étapes */}
      {step === 1 && <Step1 onNext={nextStep} />}
      {step === 2 && <Step2 prenom={data.prenom || ''} onNext={nextStep} />}
      {step === 3 && <Step3 onNext={nextStep} />}
      {step === 4 && <Step4 onNext={nextStep} />}
      {step === 5 && <Step5 onNext={nextStep} />}
    </View>
  );
}

// ─────────────────────────────────────────
// STYLES PARTAGÉS
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  progressWrap: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
});

const stepStyles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg },
  illustration: {
    alignSelf: 'center', width: 90, height: 90,
    borderRadius: 45, backgroundColor: Colors.accent + '18',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  illEmoji: { fontSize: 44 },
  stepLabel: {
    fontSize: Font.xs, fontWeight: Font.semibold,
    color: Colors.accent, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Font.xl, fontWeight: Font.bold,
    color: Colors.text, marginBottom: Spacing.sm,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: Font.md, color: Colors.textSec,
    lineHeight: 22, marginBottom: Spacing.xl,
  },
  inputWrap: { marginBottom: Spacing.xl },
  input: {
    borderWidth: 2, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    paddingVertical: 16, fontSize: Font.lg,
    color: Colors.text, backgroundColor: Colors.surface,
    ...Shadow.xs,
  },
  btn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 'auto', ...Shadow.md,
  },
  btnDisabled: { backgroundColor: Colors.border, ...Shadow.xs },
  btnText: { fontSize: Font.md, fontWeight: Font.semibold, color: Colors.textInv },
});

const gridStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: Spacing.sm, marginBottom: Spacing.xl,
  },
  card: {
    width: '47%', backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', ...Shadow.xs,
  },
  cardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '10',
  },
  cardIcon: { fontSize: 28, marginBottom: Spacing.sm },
  cardLabel: {
    fontSize: Font.sm, fontWeight: Font.semibold,
    color: Colors.text, textAlign: 'center', marginBottom: 2,
  },
  cardLabelSelected: { color: Colors.primary },
  cardDesc: {
    fontSize: Font.xs, color: Colors.textTer,
    textAlign: 'center', lineHeight: 16,
  },
});

const chipStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    borderWidth: 2, borderColor: Colors.border, ...Shadow.xs,
  },
  chipActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '10' },
  chipIcon: { fontSize: 18 },
  chipText: { fontSize: Font.sm, fontWeight: Font.medium, color: Colors.textSec },
  chipTextActive: { color: Colors.primary, fontWeight: Font.semibold },
  check: { fontSize: 12, color: Colors.accent, fontWeight: Font.bold },
});

const langStyles = StyleSheet.create({
  container: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.xl },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 2, borderColor: Colors.border,
    gap: Spacing.md, ...Shadow.xs,
  },
  cardSelected: { borderColor: Colors.accent, backgroundColor: Colors.accent + '08' },
  flag: { fontSize: 32 },
  label: { fontSize: Font.md, fontWeight: Font.semibold, color: Colors.text },
  labelSelected: { color: Colors.primary },
  desc: { fontSize: Font.sm, color: Colors.textSec, marginTop: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.accent },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.accent,
  },
});
