import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import { usePosts } from '../context/PostsContext';
import { useSync } from '../context/SyncContext';
import { PostCard } from '../components/PostCard';
import { SearchBar } from '../components/SearchBar';
import { SyncIndicator } from '../components/SyncIndicator';
import { LoadingState, EmptyState, ErrorState } from '../components/LoadingState';
import { colors, spacing, typography } from '../styles/theme';
import { globalStyles } from '../styles/components';

export function PostsListScreen({ navigation }) {
  const {
    filteredPosts,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    searchQuery,
    loadPosts,
    loadMorePosts,
    setSearchQuery,
    clearError,
  } = usePosts();

  const { performSync, loadSyncInfo, pendingCount } = useSync();

  useEffect(() => {
    loadPosts(false);
    
    // Configurar header con mejor espaciado
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
      },
    });
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadSyncInfo();
    });

    return unsubscribe;
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    await loadPosts(true);
    await performSync();
    await loadSyncInfo();
  }, [loadPosts, performSync, loadSyncInfo]);

  const handlePostPress = useCallback((post) => {
    navigation.navigate('PostDetail', { post });
  }, [navigation]);

  const handleCreatePost = useCallback(() => {
    navigation.navigate('PostDetail', { post: null });
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore && searchQuery === '') {
      console.log('Cargando más posts...');
      loadMorePosts();
    }
  }, [loading, loadingMore, hasMore, searchQuery, loadMorePosts]);

  const renderPost = useCallback(({ item }) => (
    <PostCard post={item} onPress={handlePostPress} />
  ), [handlePostPress]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.footerText}>Cargando más posts...</Text>
      </View>
    );
  }, [loadingMore]);

  const ListHeaderComponent = useMemo(() => (
    <View style={styles.listHeader}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Posts</Text>
          <Text style={styles.subtitle}>
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
            {pendingCount > 0 && ` • ${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <SyncIndicator />
      </View>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar posts..."
      />
    </View>
  ), [searchQuery, setSearchQuery, filteredPosts.length, pendingCount]);

  const ListEmptyComponent = useMemo(() => {
    if (loading) return null;
    
    if (searchQuery && searchQuery.length > 0) {
      return <EmptyState message="No se encontraron posts con esa búsqueda" />;
    }
    
    return <EmptyState message="No hay posts disponibles" />;
  }, [loading, searchQuery]);

  const keyExtractor = useCallback((item, index) => {
    if (item && item.id) {
      return `post-${item.id}`;
    }
    return `post-index-${index}`;
  }, []);

  if (loading && !refreshing && (!filteredPosts || filteredPosts.length === 0)) {
    return <LoadingState message="Cargando posts..." />;
  }

  if (error && (!filteredPosts || filteredPosts.length === 0)) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          clearError();
          loadPosts(false);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom']}>
      <FlatList
        data={filteredPosts || []}
        renderItem={renderPost}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
      
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleCreatePost}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listHeader: {
    backgroundColor: colors.background,
    paddingTop: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: colors.background,
    fontWeight: '300',
  },
});