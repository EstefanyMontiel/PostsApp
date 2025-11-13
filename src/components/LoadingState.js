import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../styles/theme';
import { globalStyles } from '../styles/components';

export function LoadingState({ message = 'Cargando...' }) {
  return (
    <View style={[globalStyles.centerContent, styles.container]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <View style={[globalStyles.centerContent, styles.container]}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={globalStyles.button} onPress={onRetry}>
          <Text style={globalStyles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function EmptyState({ message = 'No hay posts disponibles' }) {
  return (
    <View style={[globalStyles.centerContent, styles.container]}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorMessage: {
    fontSize: typography.sizes.base,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyMessage: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});