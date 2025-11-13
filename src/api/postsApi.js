import axios from 'axios';

// API con 100 posts disponibles
const BASE_URL = 'https://jsonplaceholder.typicode.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Genera imágenes consistentes basadas en el ID del post
const getPostImage = (postId) => {
  const categories = ['nature', 'city', 'technology', 'food', 'people', 'animals', 'business', 'abstract'];
  const category = categories[postId % categories.length];
  return `https://picsum.photos/seed/post${postId}/800/600`;
};

// Genera tags aleatorios pero consistentes
const getPostTags = (postId) => {
  const allTags = ['tecnología', 'viajes', 'comida', 'lifestyle', 'negocios', 'salud', 'educación', 'entretenimiento'];
  const tagCount = (postId % 3) + 1;
  return allTags.slice(postId % 5, (postId % 5) + tagCount);
};

export const postsApi = {
  // Obtener posts con paginación (JSONPlaceholder tiene 100 posts)
  getPosts: async (page = 1, limit = 10) => {
    const start = (page - 1) * limit;
    const response = await api.get('/posts', {
      params: { 
        _start: start, 
        _limit: limit 
      },
    });
    
    // Enriquecer posts con imágenes y tags
    return response.data.map(post => ({
      ...post,
      image: getPostImage(post.id),
      tags: getPostTags(post.id),
      reactions: { likes: Math.floor(Math.random() * 100), dislikes: Math.floor(Math.random() * 10) },
      views: Math.floor(Math.random() * 500) + 50,
    }));
  },

  // Obtener un post por ID
  getPostById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return {
      ...response.data,
      image: getPostImage(response.data.id),
      tags: getPostTags(response.data.id),
      reactions: { likes: Math.floor(Math.random() * 100), dislikes: Math.floor(Math.random() * 10) },
      views: Math.floor(Math.random() * 500) + 50,
    };
  },

  // Crear un post
  createPost: async (post) => {
    const response = await api.post('/posts', {
      title: post.title,
      body: post.body,
      userId: post.userId || 1,
    });
    return {
      ...response.data,
      image: post.image || getPostImage(101),
      tags: post.tags || [],
      reactions: { likes: 0, dislikes: 0 },
      views: 0,
    };
  },

  // Actualizar un post
  updatePost: async (id, post) => {
    const response = await api.put(`/posts/${id}`, {
      title: post.title,
      body: post.body,
      userId: post.userId || 1,
    });
    return {
      ...response.data,
      image: post.image || getPostImage(id),
      tags: post.tags || [],
    };
  },

  // Eliminar un post
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Obtener usuario por ID con toda la información
  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return {
        id: response.data.id,
        name: response.data.name,
        username: response.data.username,
        email: response.data.email,
        phone: response.data.phone,
        website: response.data.website,
        company: response.data.company?.name || '',
        address: response.data.address?.city || '',
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Obtener comentarios de un post
  getComments: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  },
};