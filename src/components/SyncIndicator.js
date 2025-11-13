import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSync } from '../context/SyncContext';
import { colors, typography, spacing } from '../styles/theme';

export function SyncIndicator() {
  const { isConnected, status, pendingCount, performSync, SYNC_STATUS } = useSync();

  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        text: 'Sin conexión',
        color: colors.textSecondary,
        showActivity: false,
      };
    }

    switch (status) {
      case SYNC_STATUS.SYNCING:
        return {
          text: 'Sincronizando...',
          color: colors.info,
          showActivity: true,
        };
      case SYNC_STATUS.SUCCESS:
        return {
          text: 'Sincronizado',
          color: colors.success,
          showActivity: false,
        };
      case SYNC_STATUS.ERROR:
        return {
          text: 'Error al sincronizar',
          color: colors.error,
          showActivity: false,
        };
      default:
        if (pendingCount > 0) {
          return {
            text: `${pendingCount} cambios pendientes`,
            color: colors.warning,
            showActivity: false,
          };
        }
        return {
          text: 'Sincronizado',
          color: colors.success,
          showActivity: false,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={performSync}
      disabled={status === SYNC_STATUS.SYNCING}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {statusInfo.showActivity === true && (
          <ActivityIndicator 
            size="small" 
            color={statusInfo.color} 
            style={styles.spinner} 
          />
        )}
        <View style={[styles.dot, { backgroundColor: statusInfo.color }]} />
        <Text style={[styles.text, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  spinner: {
    marginRight: spacing.xs,
  },
});