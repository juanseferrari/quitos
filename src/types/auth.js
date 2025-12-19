// types/auth.js
export const USER_STATES = {
  ANONYMOUS: 'anonymous',     // Usuario no autenticado (default)
  AUTHENTICATED: 'authenticated', // Usuario con cuenta
  MIGRATING: 'migrating',     // Migrando datos locales
  OFFLINE: 'offline'          // Sin conexión, usando cache
};

export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  APPLE: 'apple', 
  EMAIL: 'email',
  SMS: 'sms',
  ANONYMOUS: 'anonymous'
};