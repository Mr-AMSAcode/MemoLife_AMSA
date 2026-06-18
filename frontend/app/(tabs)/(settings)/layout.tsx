// ─────────────────────────────────────────
// FICHIER : frontend/app/(settings)/layout.tsx
// ─────────────────────────────────────────
import { Stack } from 'expo-router';
import { Colors } from '../../../Constants/theme';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    />
  );
}
