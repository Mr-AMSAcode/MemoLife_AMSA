// ─────────────────────────────────────────
// MemoLife — Écran Welcome
// ─────────────────────────────────────────
import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Font, Spacing, Radius, Shadow } from '../../Constants/theme';

const { height } = Dimensions.get('window');

// Carte fonctionnalité
function FeatureChip({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

export default function WelcomeScreen() {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Zone haute — fond sombre avec illustration */}
      <View style={styles.heroZone}>
        {/* Cercles décoratifs */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <Animated.View style={[styles.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>M</Text>
          </View>
          <Text style={styles.heroTitle}>MemoLife</Text>
          <Text style={styles.heroSub}>
            L'assistant qui organise votre vie,{'\n'}sans effort de votre part.
          </Text>
        </Animated.View>
      </View>

      {/* Zone basse — fond blanc arrondi */}
      <Animated.View style={[styles.bottomSheet, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Fonctionnalités clés */}
        <View style={styles.features}>
          <FeatureChip icon="🤖" text="Assistant IA" />
          <FeatureChip icon="🔔" text="Rappels auto" />
          <FeatureChip icon="📅" text="Planning" />
          <FeatureChip icon="🌍" text="FR / EN" />
        </View>

        {/* Boutons principaux */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Commencer gratuitement</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSecondaryText}>J'ai déjà un compte</Text>
        </TouchableOpacity>

        {/* Mention légale */}
        <Text style={styles.legal}>
          En continuant, vous acceptez nos{' '}
          <Text style={styles.legalLink}>Conditions d'utilisation</Text>
          {' '}et notre{' '}
          <Text style={styles.legalLink}>Politique de confidentialité</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  heroZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.accent + '10',
    top: -80,
    right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.warm + '08',
    bottom: 20,
    left: -60,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.accent,
  },
  logoLetter: {
    fontSize: 44,
    fontWeight: Font.black,
    color: Colors.primary,
    letterSpacing: -1,
  },
  heroTitle: {
    fontSize: Font.xxxl,
    fontWeight: Font.black,
    color: Colors.textInv,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  heroSub: {
    fontSize: Font.md,
    fontWeight: Font.regular,
    color: Colors.textInv,
    opacity: 0.65,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    ...Shadow.lg,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipIcon: { fontSize: 14 },
  chipText: {
    fontSize: Font.sm,
    fontWeight: Font.medium,
    color: Colors.textSec,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.md,
  },
  btnPrimaryText: {
    fontSize: Font.md,
    fontWeight: Font.semibold,
    color: Colors.textInv,
    letterSpacing: 0.2,
  },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: Colors.borderMed,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  btnSecondaryText: {
    fontSize: Font.md,
    fontWeight: Font.semibold,
    color: Colors.text,
  },
  legal: {
    fontSize: Font.xs,
    color: Colors.textTer,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: Colors.accent,
    fontWeight: Font.medium,
  },
});
