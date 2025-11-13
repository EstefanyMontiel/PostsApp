# 📱 App de Posts con Sincronización Offline

Una aplicación móvil desarrollada con React Native y Expo que permite crear, editar y eliminar posts de blog con funcionalidad offline completa y sincronización automática.
---

## ✨ Características Principales

- 📝 **CRUD Completo**: Crear, leer, actualizar y eliminar posts
- 🔄 **Sincronización Automática**: Los cambios se sincronizan cuando hay conexión
- 💾 **Modo Offline**: Funciona sin conexión a internet
- 🔍 **Búsqueda en Tiempo Real**: Busca posts por título o contenido
- ♾️ **Scroll Infinito**: Carga automática de más posts al hacer scroll
- 📷 **Imágenes Personalizadas**: Sube fotos para posts y avatares
- 👤 **Autores Personalizados**: Configura tu nombre y foto de perfil
- 🎨 **Interfaz Moderna**: Diseño limpio y minimalista
- 🔔 **Indicadores de Estado**: Visual claro del estado de sincronización

---

## 🛠️ Tecnologías Utilizadas

- **React Native** - Framework para aplicaciones móviles
- **Expo** - Plataforma de desarrollo
- **AsyncStorage** - Almacenamiento local persistente
- **NetInfo** - Detección de conectividad
- **React Navigation** - Navegación entre pantallas
- **Axios** - Peticiones HTTP
- **Expo Image Picker** - Selección de imágenes

---

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Expo CLI
- Simulador iOS (macOS) o Android Studio (opcional)
- Dispositivo móvil con Expo Go (opcional)

---

## 🚀 Instalación

1. **Clonar el repositorio**
  git clone https://github.com/EstefanyMontiel/PostsApp
  cd PostUp
  
  2. **Instalar dependencias**
  npm install 
  
  3.- **Iniciar app**
  npm start
  npx expo start
---
  FUNCIONALIDAD OFFLINE
  **Almacenamiento Local**
  --Todos los posts se guardan automáticamente en el dispositivo
  --Los cambios se guardan instantáneamente en local
  --La app funciona completamente sin conexión
  
  **Sincronización Inteligente**
  --Automática: Se sincroniza cada 30 segundos si hay cambios pendientes
  --Al recuperar conexión: Sincroniza automáticamente al conectarse
  --Pull-to-refresh: Desliza hacia abajo para forzar sincronización
  --En segundo plano: No bloquea la interfaz de usuario
  
  **Cola de Acciones Pendientes**
  --Las acciones offline se guardan en una cola
  --Se procesan en orden cuando hay conexión
  --Los conflictos se resuelven con "last-write-wins"
  
  ## API utilizada
  -- JSONPlaceholder: https://jsonplaceholder.typicode.com
  
  -- Posts disponibles: 100 posts de ejemplo
  
  **Endpoints:
  
  GET /posts - Obtener lista de posts
  GET /posts/:id - Obtener un post específico
  POST /posts - Crear un nuevo post
  PUT /posts/:id - Actualizar un post
  DELETE /posts/:id - Eliminar un post



  **PANTALLA (interfaz)
  ![Imagen de WhatsApp 2025-11-12 a las 18 16 53_bbeaaa5b](https://github.com/user-attachments/assets/a162522a-08ad-456a-98a8-e151ff0b988d)
  ![Imagen de WhatsApp 2025-11-12 a las 18 16 53_2dc49515](https://github.com/user-attachments/assets/9393231f-0bd0-4a1c-acad-1afc3b890c1f)
![Imagen de WhatsApp 2025-11-12 a las 18 16 53_0bc4d74f](https://github.com/user-attachments/assets/24922221-30bc-4899-bdd2-c9a47a72683e)

  👨‍💻 Desarrollado por
  Estefany Montiel (@EstefanyMontiel)
  
