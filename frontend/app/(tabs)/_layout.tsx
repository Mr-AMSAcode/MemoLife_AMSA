// ─────────────────────────────────────────
// MemoLife — Navigation Tabs principale
// 3 onglets : Accueil | Chat IA | Historique
// ─────────────────────────────────────────
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Font } from '../../Constants/theme';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Accueil" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🤖" label="Assistant" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" label="Historique" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', paddingTop: 4 },
  icon: { fontSize: 22, opacity: 0.4 },
  iconFocused: { opacity: 1 },
  label: {
    fontSize: Font.xs, color: Colors.textTer,
    fontWeight: Font.medium, marginTop: 2,
  },
  labelFocused: { color: Colors.primary, fontWeight: Font.semibold },
  dot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: Colors.accent, marginTop: 3,
  },
});
