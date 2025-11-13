import { postsStorage } from '../storage/postsStorage';
import { syncService } from './syncService';
import { postsApi } from '../api/postsApi';

export const postsRepository = {
  getAllPosts: async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        const result = await syncService.syncFromServer(1, 10);
        return result;
      }
      
      const localPosts = await postsStorage.getPosts();
      
      if (localPosts.length > 0) {
        // Sincronizar en segundo plano
        syncService.syncFromServer(1, 10).catch(console.error);
        return { posts: localPosts, source: 'local' };
      }
      
      return await syncService.syncFromServer(1, 10);
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  },

  getMorePosts: async (page = 2) => {
    try {
      console.log(`Cargando página ${page}...`);
      const posts = await postsApi.getPosts(page, 10);
      
      // Obtener posts locales y evitar duplicados
      const localPosts = await postsStorage.getPosts();
      const postsMap = new Map();
      
      // Agregar posts existentes
      localPosts.forEach(post => {
        postsMap.set(post.id, post);
      });
      
      // Agregar nuevos posts
      posts.forEach(post => {
        if (!postsMap.has(post.id)) {
          postsMap.set(post.id, post);
        }
      });
      
      const allPosts = Array.from(postsMap.values());
      await postsStorage.savePosts(allPosts);
      
      return { posts, source: 'server' };
    } catch (error) {
      console.error('Error loading more posts:', error);
      throw error;
    }
  },

  createPost: async (post) => {
    try {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newPost = {
        ...post,
        id: tempId,
        userId: 1,
        authorName: post.authorName || 'Usuario Anónimo',
        createdBy: 'custom',
        createdAt: new Date().toISOString(),
        synced: false,
        localOnly: true,
        reactions: { likes: 0, dislikes: 0 },
        views: 0,
      };
      
      await postsStorage.savePost(newPost);
      
      await postsStorage.savePendingAction({
        type: 'CREATE',
        data: newPost,
      });
      
      // Sincronizar en segundo plano
      syncService.syncToServer().catch(console.error);
      
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  updatePost: async (post) => {
    try {
      const updatedPost = {
        ...post,
        updatedAt: new Date().toISOString(),
        synced: false,
      };
      
      await postsStorage.savePost(updatedPost);
      
      await postsStorage.savePendingAction({
        type: 'UPDATE',
        data: updatedPost,
      });
      
      syncService.syncToServer().catch(console.error);
      
      return updatedPost;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      await postsStorage.deletePost(postId);
      
      await postsStorage.savePendingAction({
        type: 'DELETE',
        data: { id: postId },
      });
      
      syncService.syncToServer().catch(console.error);
      
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },
};