import NetInfo from '@react-native-community/netinfo';
import { postsApi } from '../api/postsApi';
import { postsStorage } from '../storage/postsStorage';

export const syncService = {
  checkConnection: async () => {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  },

  syncFromServer: async (page = 1, limit = 10) => {
    try {
      const isConnected = await syncService.checkConnection();
      
      if (!isConnected) {
        const localPosts = await postsStorage.getPosts();
        return { posts: localPosts, source: 'local' };
      }

      const posts = await postsApi.getPosts(page, limit);
      
      // Obtener posts locales
      const localPosts = await postsStorage.getPosts();
      
      // Filtrar posts locales que NO vienen del servidor (posts personalizados)
      const customPosts = localPosts.filter(p => {
        // Mantener posts con ID temporal o con autor personalizado
        const isTempId = typeof p.id === 'string' && p.id.startsWith('temp_');
        const isCustom = p.createdBy === 'custom' || p.authorName;
        return isTempId || isCustom;
      });
      
      if (page === 1) {
        // Primera página: combinar posts personalizados con posts del servidor
        // Evitar duplicados usando un Map por ID
        const postsMap = new Map();
        
        // Primero agregar posts personalizados
        customPosts.forEach(post => {
          postsMap.set(post.id, post);
        });
        
        // Luego agregar posts del servidor (no sobrescribe los personalizados)
        posts.forEach(post => {
          if (!postsMap.has(post.id)) {
            postsMap.set(post.id, post);
          }
        });
        
        const combinedPosts = Array.from(postsMap.values());
        await postsStorage.savePosts(combinedPosts);
        
        await postsStorage.saveLastSync();
        return { posts: combinedPosts, source: 'server' };
      } else {
        // Páginas adicionales: agregar sin duplicar
        const postsMap = new Map();
        
        // Agregar posts existentes
        localPosts.forEach(post => {
          postsMap.set(post.id, post);
        });
        
        // Agregar nuevos posts del servidor
        posts.forEach(post => {
          if (!postsMap.has(post.id)) {
            postsMap.set(post.id, post);
          }
        });
        
        const allPosts = Array.from(postsMap.values());
        await postsStorage.savePosts(allPosts);
        
        return { posts: allPosts, source: 'server' };
      }
      
    } catch (error) {
      console.error('Error syncing from server:', error);
      const localPosts = await postsStorage.getPosts();
      return { posts: localPosts, source: 'local', error: error.message };
    }
  },

  syncToServer: async () => {
    try {
      const isConnected = await syncService.checkConnection();
      
      if (!isConnected) {
        console.log('Sin conexión - sincronización pospuesta');
        return { success: false, message: 'Sin conexión' };
      }

      const pendingActions = await postsStorage.getPendingActions();
      
      if (pendingActions.length === 0) {
        return { success: true, synced: 0 };
      }

      console.log(`Sincronizando ${pendingActions.length} acciones pendientes...`);
      const results = [];
      
      for (const action of pendingActions) {
        try {
          const isTempId = typeof action.data?.id === 'string' && 
                          action.data.id.startsWith('temp_');
          
          let result;
          
          switch (action.type) {
            case 'CREATE':
              if (isTempId) {
                console.log(`Creando post: ${action.data.title}`);
                result = await postsApi.createPost(action.data);
                
                // Actualizar el post local con el ID real del servidor
                const updatedPost = {
                  ...action.data,
                  id: result.id,
                  synced: true,
                  localOnly: false,
                };
                
                // Eliminar el post con ID temporal
                await postsStorage.deletePost(action.data.id);
                
                // Guardar con el nuevo ID
                await postsStorage.savePost(updatedPost);
                
                console.log(`Post creado con ID: ${result.id}`);
              }
              break;
              
            case 'UPDATE':
              if (!isTempId) {
                try {
                  console.log(`Actualizando post ID: ${action.data.id}`);
                  result = await postsApi.updatePost(action.data.id, action.data);
                  await postsStorage.savePost({ ...action.data, synced: true });
                  console.log(`Post ${action.data.id} actualizado`);
                } catch (error) {
                  if (error.response?.status === 500 || error.response?.status === 404) {
                    console.log(`Post ${action.data.id} no existe en servidor, marcando como sincronizado`);
                    await postsStorage.savePost({ ...action.data, synced: true, localOnly: false });
                  } else {
                    throw error;
                  }
                }
              } else {
                await postsStorage.savePost({ ...action.data, synced: true, localOnly: false });
              }
              break;
              
            case 'DELETE':
              if (!isTempId) {
                try {
                  console.log(`Eliminando post ID: ${action.data.id}`);
                  await postsApi.deletePost(action.data.id);
                } catch (error) {
                  console.log(`Error eliminando post ${action.data.id}, eliminando localmente`);
                }
              }
              await postsStorage.deletePost(action.data.id);
              break;
          }
          
          await postsStorage.removePendingAction(action.id);
          results.push({ action: action.id, success: true });
          
        } catch (error) {
          console.error(`Error syncing action ${action.id}:`, error.message);
          
          if (error.response?.status === 500 || error.response?.status === 404) {
            await postsStorage.removePendingAction(action.id);
            results.push({ 
              action: action.id, 
              success: true, 
              note: 'Sincronizado localmente' 
            });
          } else {
            results.push({ 
              action: action.id, 
              success: false, 
              error: error.message 
            });
          }
        }
      }
      
      await postsStorage.saveLastSync();
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      console.log(`Sincronización completada: ${successCount} exitosas, ${failCount} fallidas`);
      
      return {
        success: failCount === 0,
        synced: successCount,
        failed: failCount,
        results,
      };
      
    } catch (error) {
      console.error('Error syncing to server:', error);
      return { success: false, message: error.message };
    }
  },

  fullSync: async () => {
    try {
      console.log('Iniciando sincronización completa...');
      
      const uploadResult = await syncService.syncToServer();
      const downloadResult = await syncService.syncFromServer();
      
      console.log('Sincronización completa finalizada');
      
      return {
        success: true,
        upload: uploadResult,
        download: downloadResult,
      };
    } catch (error) {
      console.error('Error in full sync:', error);
      return { success: false, message: error.message };
    }
  },
};