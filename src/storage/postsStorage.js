import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  POSTS: '@posts',
  PENDING_ACTIONS: '@pending_actions',
  LAST_SYNC: '@last_sync',
};

export const postsStorage = {
  savePosts: async (posts) => {
    try {
      await AsyncStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
      return true;
    } catch (error) {
      console.error('Error saving posts:', error);
      return false;
    }
  },

  getPosts: async () => {
    try {
      const posts = await AsyncStorage.getItem(KEYS.POSTS);
      return posts ? JSON.parse(posts) : [];
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  },

  savePost: async (post) => {
    try {
      const posts = await postsStorage.getPosts();
      const index = posts.findIndex(p => p.id === post.id);
      
      if (index >= 0) {
        posts[index] = post;
      } else {
        posts.unshift(post);
      }
      
      await postsStorage.savePosts(posts);
      return true;
    } catch (error) {
      console.error('Error saving post:', error);
      return false;
    }
  },

  deletePost: async (postId) => {
    try {
      const posts = await postsStorage.getPosts();
      const filtered = posts.filter(p => p.id !== postId);
      await postsStorage.savePosts(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  savePendingAction: async (action) => {
    try {
      const pending = await postsStorage.getPendingActions();
      pending.push({
        ...action,
        timestamp: Date.now(),
        id: `${action.type}_${Date.now()}`,
      });
      await AsyncStorage.setItem(KEYS.PENDING_ACTIONS, JSON.stringify(pending));
      return true;
    } catch (error) {
      console.error('Error saving pending action:', error);
      return false;
    }
  },

  getPendingActions: async () => {
    try {
      const actions = await AsyncStorage.getItem(KEYS.PENDING_ACTIONS);
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.error('Error getting pending actions:', error);
      return [];
    }
  },

  clearPendingActions: async () => {
    try {
      await AsyncStorage.setItem(KEYS.PENDING_ACTIONS, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('Error clearing pending actions:', error);
      return false;
    }
  },

  removePendingAction: async (actionId) => {
    try {
      const pending = await postsStorage.getPendingActions();
      const filtered = pending.filter(a => a.id !== actionId);
      await AsyncStorage.setItem(KEYS.PENDING_ACTIONS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing pending action:', error);
      return false;
    }
  },

  saveLastSync: async () => {
    try {
      await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Error saving last sync:', error);
      return false;
    }
  },

  getLastSync: async () => {
    try {
      const lastSync = await AsyncStorage.getItem(KEYS.LAST_SYNC);
      return lastSync;
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  },
};