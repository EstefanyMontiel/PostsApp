import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

export function PostCard({ post, onPress }) {
  if (!post) return null;
  
  const isSynced = post.synced !== false;
  const isLocal = post.localOnly === true;
  const hasCustomAuthor = post.createdBy === 'custom' || post.authorName;
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Hoy';
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
    } catch (e) {
      return '';
    }
  };

  const getStatusColor = () => {
    if (isLocal && !isSynced) return colors.warning;
    if (!isSynced) return colors.info;
    return colors.success;
  };

  const getStatusIcon = () => {
    if (isLocal && !isSynced) return '⏳';
    if (!isSynced) return '🔄';
    return '✓';
  };

  const getAvatarUrl = () => {
    if (post.avatarUri) {
      return post.avatarUri;
    }
    if (hasCustomAuthor) {
      return null;
    }
    return `https://i.pravatar.cc/150?img=${post.userId || 1}`;
  };

  const getUserName = () => {
    if (post.authorName) {
      return post.authorName;
    }
    
    const userId = post.userId;
    const names = [
      'Ana García', 'Carlos López', 'María Rodríguez', 'Juan Martínez',
      'Laura Sánchez', 'Pedro Gómez', 'Sofía Fernández', 'Diego Torres',
      'Carmen Ruiz', 'Javier Díaz', 'Elena Moreno', 'Miguel Álvarez'
    ];
    return names[(userId || 1) - 1] || `Usuario ${userId || 1}`;
  };

  const getReactionsCount = () => {
    if (!post.reactions) return 0;
    
    if (typeof post.reactions === 'object' && post.reactions.likes !== undefined) {
      return post.reactions.likes || 0;
    }
    
    if (typeof post.reactions === 'number') {
      return post.reactions;
    }
    
    return 0;
  };

  const avatarUrl = getAvatarUrl();
  const userName = getUserName();
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(post)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {userName ? userName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.userText}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{userName}</Text>
              {hasCustomAuthor && (
                <View style={styles.customBadge}>
                  <Text style={styles.customBadgeText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
          </View>
        </View>
        
        {(!isSynced || isLocal) && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          </View>
        )}
      </View>

      {post.image && (
        <Image 
          source={{ uri: post.image }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title || 'Sin título'}
        </Text>
        
        <Text style={styles.body} numberOfLines={3}>
          {post.body || 'Sin contenido'}
        </Text>

        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{`#${tag}`}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.reactions}>
            <Text style={styles.reactionText}>
              {`❤️ ${getReactionsCount()}`}
            </Text>
            <Text style={styles.reactionText}>
              {`💬 ${post.views || 0}`}
            </Text>
          </View>
          
          {(!isSynced || isLocal) && (
            <Text style={[styles.syncStatus, { color: getStatusColor() }]}>
              {isLocal && !isSynced ? 'Pendiente' : 'Sincronizando'}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.separator,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.sm,
    backgroundColor: colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholderText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  userText: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  customBadge: {
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  date: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 14,
    color: colors.background,
  },
  postImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    lineHeight: typography.sizes.lg * 1.3,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: typography.sizes.base * 1.5,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  syncStatus: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});