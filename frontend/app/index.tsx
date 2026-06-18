// ─────────────────────────────────────────
// MemoLife — Splash Screen
// ─────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Font, Spacing } from '../Constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Séquence d'animation
    Animated.sequence([
      // Logo apparaît
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Nom de l'app
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Tagline
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Redirection après 2.5 secondes
    const timer = setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const onboardingDone = await AsyncStorage.getItem('onboarding_done');

        if (token && onboardingDone === 'true') {
          router.replace('/(tabs)/home');
        } else if (token) {
          router.replace('/onboarding/step1');
        } else {
          router.replace('/(auth)/welcome');
        }
      } catch {
        router.replace('/(auth)/welcome');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Logo animé */}
      <Animated.View style={[
        styles.logoWrap,
        { opacity: logoOpacity, transform: [{ scale: logoScale }] },
      ]}>
        <View style={styles.logoOuter}>
          <View style={styles.logoInner}>
            <Text style={styles.logoLetter}>M</Text>
          </View>
        </View>
      </Animated.View>

      {/* Nom */}
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        MemoLife
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        Votre vie, organisée intelligemment
      </Animated.Text>

      {/* Point décoratif bas */}
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    marginBottom: Spacing.lg,
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: Colors.accent + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 42,
    fontWeight: Font.black,
    color: Colors.primary,
    letterSpacing: -1,
  },
  appName: {
    fontSize: Font.xxxl,
    fontWeight: Font.black,
    color: Colors.textInv,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: Font.md,
    fontWeight: Font.regular,
    color: Colors.textInv,
    opacity: 0.65,
    letterSpacing: 0.2,
  },
  dots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textInv,
    opacity: 0.3,
  },
  dotActive: {
    opacity: 1,
    backgroundColor: Colors.accent,
    width: 20,
  },
});
