import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePosts } from '../context/PostsContext';
import { postsApi } from '../api/postsApi';
import { colors, spacing, typography, borderRadius } from '../styles/theme';
import { globalStyles } from '../styles/components';

export function PostDetailScreen({ route, navigation }) {
  const { post } = route.params || {};
  const { createPost, updatePost, deletePost } = usePosts();

  const [title, setTitle] = useState(post?.title || '');
  const [body, setBody] = useState(post?.body || '');
  const [imageUri, setImageUri] = useState(post?.image || '');
  const [avatarUri, setAvatarUri] = useState(post?.avatarUri || '');
  const [authorName, setAuthorName] = useState(post?.authorName || '');
  const [isEditing, setIsEditing] = useState(!post);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingAuthor, setLoadingAuthor] = useState(false);

  const isNewPost = !post;

  useEffect(() => {
    if (post && post.userId && !isEditing && !post.authorName && !post.createdBy) {
      loadAuthorFromAPI();
    }
  }, [post?.userId, isEditing]);

  const loadAuthorFromAPI = async () => {
    try {
      setLoadingAuthor(true);
      const userData = await postsApi.getUser(post.userId);
      setAuthorName(userData?.name || `Usuario ${post.userId}`);
    } catch (error) {
      console.error('Error loading author:', error);
      setAuthorName(`Usuario ${post.userId}`);
    } finally {
      setLoadingAuthor(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: post ? (isEditing ? 'Editar Post' : 'Detalle del Post') : 'Nuevo Post',
      headerRight: () => (
        <View style={styles.headerButtons}>
          {post && !isEditing && (
            <>
              <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteConfirm} style={styles.headerButton}>
                <Text style={[styles.headerButtonText, styles.deleteText]}>🗑️</Text>
              </TouchableOpacity>
            </>
          )}
          {isEditing && (
            <>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>✕</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSave} 
                style={styles.headerButton}
                disabled={isSaving}
              >
                <Text style={[styles.headerButtonText, styles.saveText]}>
                  {isSaving ? '⏳' : '✓'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ),
    });
  }, [isEditing, isSaving, title, body, imageUri, authorName, avatarUri, post]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (post) {
      setTitle(post.title || '');
      setBody(post.body || '');
      setImageUri(post.image || '');
      setAuthorName(post.authorName || '');
      setAvatarUri(post.avatarUri || '');
      setIsEditing(false);
    } else {
      navigation.goBack();
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title || title.trim() === '') {
      Alert.alert('Error', 'El título no puede estar vacío');
      return;
    }

    if (!body || body.trim() === '') {
      Alert.alert('Error', 'El contenido no puede estar vacío');
      return;
    }

    if (isNewPost && (!authorName || authorName.trim() === '')) {
      Alert.alert('Error', 'El nombre del autor no puede estar vacío');
      return;
    }

    try {
      setIsSaving(true);

      const postData = {
        title: title.trim(),
        body: body.trim(),
        image: imageUri || `https://picsum.photos/seed/${Date.now()}/800/600`,
        authorName: authorName.trim(),
        avatarUri: avatarUri || null,
        tags: post?.tags || [],
      };

      if (post) {
        await updatePost({
          ...post,
          ...postData,
        });
        Alert.alert('✓ Guardado', 'El post se guardó correctamente.');
        setIsEditing(false);
      } else {
        await createPost(postData);
        Alert.alert('✓ Creado', 'El post se creó correctamente.');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar: ' + (error?.message || 'Error desconocido'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este post?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: handleDelete,
        },
      ]
    );
  };

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      Alert.alert('✓ Eliminado', 'El post se eliminó correctamente.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  };

  const getStatusInfo = () => {
    if (!post) return null;
    
    const isLocal = post.localOnly === true;
    const isSynced = post.synced !== false;

    if (isLocal && !isSynced) {
      return {
        icon: '⏳',
        text: 'Pendiente de sincronizar',
        color: colors.warning,
      };
    }
    if (!isSynced) {
      return {
        icon: '🔄',
        text: 'Sincronizando...',
        color: colors.info,
      };
    }
    return {
      icon: '✓',
      text: 'Sincronizado',
      color: colors.success,
    };
  };

  const statusInfo = getStatusInfo();
  
  const getReactionsCount = () => {
    if (!post?.reactions) return 0;
    if (typeof post.reactions === 'object' && post.reactions.likes !== undefined) {
      return post.reactions.likes || 0;
    }
    if (typeof post.reactions === 'number') {
      return post.reactions;
    }
    return 0;
  };

  const getAvatarUrl = () => {
    if (avatarUri) {
      return avatarUri;
    }
    if (post?.avatarUri) {
      return post.avatarUri;
    }
    if (post?.authorName || post?.createdBy) {
      return null;
    }
    return `https://i.pravatar.cc/150?img=${post?.userId || 1}`;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Imagen del post */}
        <View style={styles.imageSection}>
          {imageUri ? (
            <Image 
              source={{ uri: imageUri }}
              style={styles.postImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderIcon}>🖼️</Text>
              <Text style={styles.placeholderText}>Sin imagen</Text>
            </View>
          )}
          
          {isEditing && (
            <TouchableOpacity 
              style={styles.imageButton}
              onPress={pickImage}
            >
              <Text style={styles.imageButtonText}>
                {imageUri ? '📷 Cambiar' : '📷 Añadir'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Información del autor (solo cuando NO está editando) */}
        {!isEditing && post && (
          <View style={styles.authorSection}>
            <TouchableOpacity disabled>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {authorName ? authorName.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.authorInfo}>
              {loadingAuthor ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <View style={styles.authorNameRow}>
                    <Text style={styles.authorNameText}>{authorName || 'Usuario'}</Text>
                    {(post.authorName || post.createdBy) && (
                      <View style={styles.customBadge}>
                        <Text style={styles.customBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>
                  {post.createdAt && (
                    <Text style={styles.date}>
                      {`📅 ${formatDate(post.createdAt)}`}
                    </Text>
                  )}
                </>
              )}
            </View>

            {statusInfo && (
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
              </View>
            )}
          </View>
        )}

        {/* Stats del post */}
        {!isEditing && post && (
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>❤️</Text>
              <Text style={styles.statText}>{getReactionsCount()}</Text>
            </View>
            {statusInfo && (
              <View style={styles.statItem}>
                <Text style={[styles.statStatus, { color: statusInfo.color }]}>
                  {statusInfo.text}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Campo de Avatar (solo cuando está editando o creando) */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.label}>Foto de perfil</Text>
            <View style={styles.avatarPickerContainer}>
              <TouchableOpacity onPress={pickAvatar}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarPreview}
                  />
                ) : (
                  <View style={styles.avatarPreviewPlaceholder}>
                    <Text style={styles.avatarPreviewIcon}>📷</Text>
                    <Text style={styles.avatarPreviewText}>Añadir foto</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
              Toca para {avatarUri ? 'cambiar' : 'seleccionar'} tu foto de perfil (opcional)
            </Text>
          </View>
        )}

        {/* Campo de Autor */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.label}>Nombre del autor *</Text>
            <TextInput
              style={[globalStyles.input, styles.authorInput]}
              value={authorName}
              onChangeText={setAuthorName}
              placeholder="Ej: Estefany Montiel"
              placeholderTextColor={colors.textTertiary}
              editable={!isSaving && (isNewPost || !post?.userId)}
            />
            <Text style={styles.hint}>
              {isNewPost 
                ? 'Ingresa tu nombre o el nombre del autor del post' 
                : post?.authorName || post?.createdBy
                  ? 'Puedes editar el nombre del autor'
                  : 'Este post fue creado desde la API'
              }
            </Text>
          </View>
        )}

        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>Título *</Text>
          {isEditing ? (
            <TextInput
              style={[globalStyles.input, styles.titleInput]}
              value={title}
              onChangeText={setTitle}
              placeholder="Escribe un título interesante..."
              placeholderTextColor={colors.textTertiary}
              editable={!isSaving}
              multiline={true}
            />
          ) : (
            <Text style={styles.titleText}>{title}</Text>
          )}
        </View>

        {/* Contenido */}
        <View style={styles.section}>
          <Text style={styles.label}>Contenido</Text>
          {isEditing ? (
            <TextInput
              style={[globalStyles.input, styles.bodyInput]}
              value={body}
              onChangeText={setBody}
              placeholder="Comparte tu historia..."
              placeholderTextColor={colors.textTertiary}
              editable={!isSaving}
              multiline={true}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.bodyText}>{body}</Text>
          )}
        </View>

        {/* Tags */}
        {!isEditing && post && post.tags && post.tags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{`#${tag}`}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  imageSection: {
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.backgroundSecondary,
  },
  placeholderImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  imageButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  imageButtonText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.sm,
    backgroundColor: colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholderText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  avatarPickerContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundSecondary,
  },
  avatarPreviewPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  avatarPreviewIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  avatarPreviewText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorNameText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  customBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  customBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  date: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    color: colors.background,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  statStatus: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: spacing.md,
  },
  headerButtonText: {
    fontSize: 22,
    color: colors.primary,
  },
  saveText: {
    color: colors.success,
  },
  deleteText: {
    color: colors.error,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  authorInput: {
    fontSize: typography.sizes.base,
  },
  titleInput: {
    minHeight: 80,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  titleText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    lineHeight: typography.sizes.xxl * 1.3,
  },
  bodyInput: {
    minHeight: 200,
    fontSize: typography.sizes.base,
  },
  bodyText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    lineHeight: typography.sizes.base * 1.7,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});