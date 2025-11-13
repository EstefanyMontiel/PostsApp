import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

export function SearchBar({ value, onChangeText, placeholder = 'Buscar posts...' }) {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value && value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});