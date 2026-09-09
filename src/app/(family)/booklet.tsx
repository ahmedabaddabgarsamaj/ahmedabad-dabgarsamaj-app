import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { BookletTabView } from '@/components/family/tabs/BookletTabView';

export default function BookletScreen() {
  const theme = useTheme();
  const { q, code } = useLocalSearchParams<{ q?: string; code?: string }>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar
        title="અમદાવાદ ડબગર સમાજ પરિચય પુસ્તિકા"
        onRefresh={handleRefresh}
      />

      <View style={styles.content}>
        <BookletTabView
          key={refreshKey}
          initialQuery={q || code}
          onRefresh={handleRefresh}
        />
      </View>

      <BottomTabBar activeTab="booklet" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
