import React from 'react';
import { Slot } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import HomeTabs from '../common/HomeTabs';

export default function ClientLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <View style={styles.tabBarWrapper}>
        <HomeTabs />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },
  content: {
    flex: 1,
  },
  tabBarWrapper: {
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    height: 60, 
  },
});
