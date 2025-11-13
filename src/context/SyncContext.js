import React, { createContext, useReducer, useContext, useCallback, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncService } from '../services/syncService';
import { postsStorage } from '../storage/postsStorage';

const SyncContext = createContext(null);

const SYNC_STATUS = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  ERROR: 'error',
};

const ACTIONS = {
  SET_CONNECTED: 'SET_CONNECTED',
  SET_STATUS: 'SET_STATUS',
  SET_PENDING_COUNT: 'SET_PENDING_COUNT',
  SET_LAST_SYNC: 'SET_LAST_SYNC',
};

const initialState = {
  isConnected: true,
  status: SYNC_STATUS.IDLE,
  pendingCount: 0,
  lastSync: null,
  error: null,
};

function syncReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_CONNECTED:
      return { 
        ...state, 
        isConnected: Boolean(action.payload) 
      };
      
    case ACTIONS.SET_STATUS:
      return {
        ...state,
        status: action.payload.status || SYNC_STATUS.IDLE,
        error: action.payload.error || null,
      };
      
    case ACTIONS.SET_PENDING_COUNT:
      return { 
        ...state, 
        pendingCount: Number(action.payload) || 0 
      };
      
    case ACTIONS.SET_LAST_SYNC:
      return { 
        ...state, 
        lastSync: action.payload 
      };
      
    default:
      return state;
  }
}

export function SyncProvider({ children }) {
  const [state, dispatch] = useReducer(syncReducer, initialState);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(netState => {
      const isConnected = Boolean(netState.isConnected);
      dispatch({ 
        type: ACTIONS.SET_CONNECTED, 
        payload: isConnected 
      });
      
      // Sincronizar automáticamente cuando se recupera la conexión
      if (isConnected === true && state.pendingCount > 0) {
        console.log('Conexión recuperada - iniciando sincronización automática');
        setTimeout(() => {
          performSync().catch(console.error);
        }, 1000);
      }
    });

    loadSyncInfo().catch(console.error);

    // Sincronizar periódicamente cada 30 segundos si hay cambios pendientes
    const syncInterval = setInterval(() => {
      if (state.isConnected && state.pendingCount > 0) {
        console.log('Sincronización periódica automática');
        performSync().catch(console.error);
      }
    }, 30000);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      clearInterval(syncInterval);
    };
  }, [state.pendingCount, state.isConnected]);

  const loadSyncInfo = useCallback(async () => {
    try {
      const pendingActions = await postsStorage.getPendingActions();
      const lastSync = await postsStorage.getLastSync();
      
      dispatch({ 
        type: ACTIONS.SET_PENDING_COUNT, 
        payload: Array.isArray(pendingActions) ? pendingActions.length : 0 
      });
      dispatch({ 
        type: ACTIONS.SET_LAST_SYNC, 
        payload: lastSync 
      });
    } catch (error) {
      console.error('Error loading sync info:', error);
    }
  }, []);

  const performSync = useCallback(async () => {
    try {
      dispatch({ 
        type: ACTIONS.SET_STATUS, 
        payload: { status: SYNC_STATUS.SYNCING } 
      });

      const result = await syncService.fullSync();

      if (result && result.success === true) {
        await loadSyncInfo();
        dispatch({ 
          type: ACTIONS.SET_STATUS, 
          payload: { status: SYNC_STATUS.SUCCESS } 
        });
        
        setTimeout(() => {
          dispatch({ 
            type: ACTIONS.SET_STATUS, 
            payload: { status: SYNC_STATUS.IDLE } 
          });
        }, 2000);
        
        return true;
      } else {
        dispatch({
          type: ACTIONS.SET_STATUS,
          payload: { 
            status: SYNC_STATUS.ERROR, 
            error: result?.message || 'Error desconocido' 
          },
        });
        return false;
      }
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_STATUS,
        payload: { 
          status: SYNC_STATUS.ERROR, 
          error: error?.message || 'Error de sincronización' 
        },
      });
      return false;
    }
  }, [loadSyncInfo]);

  const value = {
    isConnected: state.isConnected,
    status: state.status,
    pendingCount: state.pendingCount,
    lastSync: state.lastSync,
    error: state.error,
    performSync,
    loadSyncInfo,
    SYNC_STATUS,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === null) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}