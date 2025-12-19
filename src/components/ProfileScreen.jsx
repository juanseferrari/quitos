// components/ProfileScreen.jsx - Pantalla de perfil (placeholder)
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-full bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]">
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-[#D4A574] border-opacity-30 px-4 py-4">
        <h1 className="text-2xl font-bold text-[#D4A574] text-center">
          MI PERFIL
        </h1>
      </div>
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Información del Usuario */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-xl font-bold text-[#D4A574] mb-2">
            {user.name || user.username || 'Usuario'}
          </h2>
          <p className="text-[#F5DEB3] text-sm opacity-70">
            {user.email}
          </p>
          <p className="text-[#F5DEB3] text-xs opacity-50 mt-2">
            Miembro desde {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        {/* Configuración */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
          <h3 className="text-lg font-bold text-[#D4A574] mb-3">
            ⚙️ CONFIGURACIÓN
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-[#F5DEB3]">Notificaciones</span>
              <div className="w-10 h-6 bg-[#1a1a1a] rounded-full relative">
                <div className="w-4 h-4 bg-[#D4A574] rounded-full absolute top-1 left-1 transition-all"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-[#F5DEB3]">Sonidos</span>
              <div className="w-10 h-6 bg-[#1a1a1a] rounded-full relative">
                <div className="w-4 h-4 bg-[#D4A574] rounded-full absolute top-1 left-1 transition-all"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-[#F5DEB3]">Tema oscuro</span>
              <div className="w-10 h-6 bg-[#D4A574] rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-all"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Próximamente */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20 text-center">
          <div className="text-4xl mb-3">🚧</div>
          <h3 className="text-lg font-bold text-[#D4A574] mb-2">
            Más opciones próximamente
          </h3>
          <p className="text-[#F5DEB3] text-sm opacity-70 mb-4">
            Editar perfil, preferencias avanzadas, soporte y más.
          </p>
        </div>
        
        {/* Cerrar Sesión */}
        <div className="pt-4">
          <button
            onClick={signOut}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300"
          >
            🚪 CERRAR SESIÓN
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;