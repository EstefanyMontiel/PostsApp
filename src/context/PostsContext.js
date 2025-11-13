import React, { createContext, useReducer, useContext, useCallback } from 'react';
import { postsRepository } from '../services/postsRepository';

const PostsContext = createContext(null);

const ACTIONS = {
  SET_POSTS: 'SET_POSTS',
  APPEND_POSTS: 'APPEND_POSTS',
  ADD_POST: 'ADD_POST',
  UPDATE_POST: 'UPDATE_POST',
  DELETE_POST: 'DELETE_POST',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_REFRESHING: 'SET_REFRESHING',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_LOADING_MORE: 'SET_LOADING_MORE',
  SET_HAS_MORE: 'SET_HAS_MORE',
};

const initialState = {
  posts: [],
  filteredPosts: [],
  loading: false,
  refreshing: false,
  loadingMore: false,
  hasMore: true,
  currentPage: 1,
  error: null,
  searchQuery: '',
  source: null,
};

function filterPosts(posts, query) {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return posts || [];
  }
  
  const lowerQuery = query.toLowerCase();
  return (posts || []).filter(post => {
    if (!post) return false;
    const title = post.title ? String(post.title).toLowerCase() : '';
    const body = post.body ? String(post.body).toLowerCase() : '';
    return title.includes(lowerQuery) || body.includes(lowerQuery);
  });
}

function postsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_POSTS:
      const posts = Array.isArray(action.payload?.posts) ? action.payload.posts : [];
      return {
        ...state,
        posts: posts,
        filteredPosts: filterPosts(posts, state.searchQuery),
        source: action.payload?.source || null,
        loading: false,
        refreshing: false,
        currentPage: 1,
        hasMore: posts.length >= 10, // Si recibimos 10 o más, hay más páginas
      };
      
    case ACTIONS.APPEND_POSTS:
      const newPosts = Array.isArray(action.payload?.posts) ? action.payload.posts : [];
      const allPosts = [...state.posts, ...newPosts];
      return {
        ...state,
        posts: allPosts,
        filteredPosts: filterPosts(allPosts, state.searchQuery),
        loadingMore: false,
        hasMore: newPosts.length >= 10,
        currentPage: state.currentPage + 1,
      };
      
    case ACTIONS.ADD_POST:
      if (!action.payload) return state;
      const postsWithNew = [action.payload, ...state.posts];
      return {
        ...state,
        posts: postsWithNew,
        filteredPosts: filterPosts(postsWithNew, state.searchQuery),
      };
      
    case ACTIONS.UPDATE_POST:
      if (!action.payload || !action.payload.id) return state;
      const updatedPosts = state.posts.map(post =>
        post && post.id === action.payload.id ? action.payload : post
      );
      return {
        ...state,
        posts: updatedPosts,
        filteredPosts: filterPosts(updatedPosts, state.searchQuery),
      };
      
    case ACTIONS.DELETE_POST:
      const remainingPosts = state.posts.filter(post => 
        post && post.id !== action.payload
      );
      return {
        ...state,
        posts: remainingPosts,
        filteredPosts: filterPosts(remainingPosts, state.searchQuery),
      };
      
    case ACTIONS.SET_LOADING:
      return { 
        ...state, 
        loading: Boolean(action.payload) 
      };
      
    case ACTIONS.SET_REFRESHING:
      return { 
        ...state, 
        refreshing: Boolean(action.payload) 
      };
      
    case ACTIONS.SET_LOADING_MORE:
      return { 
        ...state, 
        loadingMore: Boolean(action.payload) 
      };
      
    case ACTIONS.SET_HAS_MORE:
      return { 
        ...state, 
        hasMore: Boolean(action.payload) 
      };
      
    case ACTIONS.SET_ERROR:
      return { 
        ...state, 
        error: action.payload || null, 
        loading: false, 
        refreshing: false,
        loadingMore: false,
      };
      
    case ACTIONS.SET_SEARCH_QUERY:
      const newQuery = action.payload || '';
      return {
        ...state,
        searchQuery: newQuery,
        filteredPosts: filterPosts(state.posts, newQuery),
      };
      
    default:
      return state;
  }
}

export function PostsProvider({ children }) {
  const [state, dispatch] = useReducer(postsReducer, initialState);

  const loadPosts = useCallback(async (forceRefresh) => {
    try {
      const isRefresh = Boolean(forceRefresh);
      dispatch({ 
        type: isRefresh ? ACTIONS.SET_REFRESHING : ACTIONS.SET_LOADING, 
        payload: true 
      });

      const result = await postsRepository.getAllPosts(isRefresh);
      
      dispatch({
        type: ACTIONS.SET_POSTS,
        payload: { 
          posts: result?.posts || [], 
          source: result?.source || 'local' 
        },
      });
    } catch (error) {
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error?.message || 'Error desconocido' 
      });
    }
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (state.loadingMore || !state.hasMore) {
      return;
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING_MORE, payload: true });

      const result = await postsRepository.getMorePosts(state.currentPage + 1);
      
      dispatch({
        type: ACTIONS.APPEND_POSTS,
        payload: { 
          posts: result?.posts || [],
        },
      });
    } catch (error) {
      console.error('Error loading more posts:', error);
      dispatch({ type: ACTIONS.SET_LOADING_MORE, payload: false });
    }
  }, [state.currentPage, state.loadingMore, state.hasMore]);

  const createPost = useCallback(async (postData) => {
    try {
      const newPost = await postsRepository.createPost(postData);
      if (newPost) {
        dispatch({ type: ACTIONS.ADD_POST, payload: newPost });
      }
      return newPost;
    } catch (error) {
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error?.message || 'Error al crear post' 
      });
      throw error;
    }
  }, []);

  const updatePost = useCallback(async (post) => {
    try {
      const updatedPost = await postsRepository.updatePost(post);
      if (updatedPost) {
        dispatch({ type: ACTIONS.UPDATE_POST, payload: updatedPost });
      }
      return updatedPost;
    } catch (error) {
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error?.message || 'Error al actualizar post' 
      });
      throw error;
    }
  }, []);

  const deletePost = useCallback(async (postId) => {
    try {
      await postsRepository.deletePost(postId);
      dispatch({ type: ACTIONS.DELETE_POST, payload: postId });
    } catch (error) {
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error?.message || 'Error al eliminar post' 
      });
      throw error;
    }
  }, []);

  const setSearchQuery = useCallback((query) => {
    dispatch({ 
      type: ACTIONS.SET_SEARCH_QUERY, 
      payload: query || '' 
    });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });
  }, []);

  const value = {
    posts: state.posts,
    filteredPosts: state.filteredPosts,
    loading: state.loading,
    refreshing: state.refreshing,
    loadingMore: state.loadingMore,
    hasMore: state.hasMore,
    error: state.error,
    searchQuery: state.searchQuery,
    source: state.source,
    loadPosts,
    loadMorePosts,
    createPost,
    updatePost,
    deletePost,
    setSearchQuery,
    clearError,
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === null) {
    throw new Error('usePosts must be used within PostsProvider');
  }
  return context;
}