// components/SocialScreen.jsx - Sistema social completo con tema cinematográfico
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';
import { useUserSearch } from '../hooks/useUserSearch';
import { useRankings } from '../hooks/useRankings';
import { useChallenges } from '../hooks/useChallenges';

const SocialScreen = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('rankings');
  const [showFriendRequests, setShowFriendRequests] = useState(false);

  // Hooks sociales
  const {
    friends,
    friendRequests,
    isLoading: friendsLoading,
    sendFriendRequest,
    respondToRequest,
    pendingRequestsCount,
    onlineFriendsCount
  } = useFriends();

  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    suggestions,
    isLoading: searchLoading,
    hasSearchTerm,
    hasResults
  } = useUserSearch();

  const {
    currentRanking,
    currentUserRank,
    selectedLocation,
    setSelectedLocation,
    availableLocations,
    isLoading: rankingsLoading
  } = useRankings();

  const {
    challenges,
    pendingChallenges,
    sendChallenge,
    acceptChallenge,
    rejectChallenge,
    hasPendingChallenges
  } = useChallenges();

  // Redirigir a autenticación si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-full bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-[#D4A574] mb-4">
            Acceso Restringido
          </h2>
          <p className="text-[#F5DEB3] opacity-80 mb-6">
            Necesitas iniciar sesión para acceder a las funciones sociales
          </p>
          <div className="text-sm text-[#F5DEB3] opacity-60">
            • Amigos y rivalidades
            <br />
            • Rankings y leaderboards
            <br />
            • Desafíos y torneos
          </div>
        </div>
      </div>
    );
  }

  // Tabs de navegación
  const tabs = [
    { id: 'rankings', label: 'Rankings', icon: '🏆', badge: null },
    { id: 'friends', label: 'Amigos', icon: '👥', badge: onlineFriendsCount },
    { id: 'challenges', label: 'Desafíos', icon: '⚔️', badge: hasPendingChallenges ? pendingChallenges.length : null },
    { id: 'search', label: 'Buscar', icon: '🔍', badge: null }
  ];

  return (
    <div className="min-h-full rey-premium-layout-mobile">
      {/* Header con navegación */}
      <div className="bg-[#0a0a0a] border-b border-[#D4A574] border-opacity-30 px-4 py-4">
        <h1 className="text-2xl font-bold text-[#D4A574] text-center mb-4" style={{ fontFamily: '"Tilt Warp", sans-serif' }}>
          👥 SISTEMA SOCIAL
        </h1>
        
        {/* Tabs */}
        <div className="flex justify-center space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#D4A574] text-[#0a0a0a] shadow-lg'
                  : 'text-[#F5DEB3] hover:bg-[#D4A574] hover:bg-opacity-20'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
              {tab.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* TAB: RANKINGS */}
        {activeTab === 'rankings' && (
          <div className="space-y-4">
            {/* Selector de ubicación */}
            <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
              <h3 className="text-lg font-bold text-[#D4A574] mb-3">
                📍 Seleccionar Ubicación
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {availableLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => setSelectedLocation(location.id)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      selectedLocation === location.id
                        ? 'bg-[#D4A574] text-[#0a0a0a]'
                        : 'bg-[#1a1a1a] text-[#F5DEB3] hover:bg-[#D4A574] hover:bg-opacity-20'
                    }`}
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Ranking actual */}
            {currentRanking && (
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
                <h2 className="text-lg font-bold text-[#D4A574] mb-3">
                  🏆 RANKING {currentRanking.ranking.location.toUpperCase()}
                </h2>
                <div className="text-xs text-[#F5DEB3] opacity-70 mb-4">
                  {currentRanking.ranking.total_players} jugadores • 
                  Mínimo {currentRanking.ranking.min_games} partidos
                </div>
                
                <div className="space-y-2">
                  {currentRanking.players.map((player) => (
                    <div 
                      key={player.rank} 
                      className={`bg-[#1a1a1a] rounded-lg p-3 ${
                        player.user.is_current_user ? 'border border-[#D4A574] border-opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{player.badge}</span>
                          <span className={`text-lg font-bold ${
                            player.rank === 1 ? 'text-yellow-400' :
                            player.rank === 2 ? 'text-gray-300' :
                            player.rank === 3 ? 'text-amber-600' :
                            'text-[#F5DEB3]'
                          }`}>
                            #{player.rank}
                          </span>
                          <div>
                            <div className={`font-semibold ${
                              player.user.is_current_user ? 'text-[#D4A574]' : 'text-[#F5DEB3]'
                            }`}>
                              {player.user.name}
                            </div>
                            <div className="text-xs text-[#F5DEB3] opacity-70">
                              {player.stats.total_games} partidos
                              {player.stats.current_streak > 0 && (
                                <span className="ml-2 text-orange-400">
                                  🔥 {player.stats.current_streak}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-400">
                            {player.stats.win_rate}%
                          </div>
                          {player.rank_change !== 0 && (
                            <div className={`text-xs ${
                              player.rank_change > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {player.rank_change > 0 ? '↗' : '↘'} {Math.abs(player.rank_change)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progreso del usuario */}
                {currentUserRank && (
                  <div className="mt-4 bg-[#1a1a1a] rounded-lg p-3">
                    <h4 className="text-sm font-bold text-[#D4A574] mb-2">
                      📈 Tu Progreso
                    </h4>
                    <div className="text-xs text-[#F5DEB3] opacity-80">
                      Puesto {currentUserRank.rank} de {currentUserRank.total_players}
                      <br />
                      Top {((currentUserRank.total_players - currentUserRank.rank) / currentUserRank.total_players * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            )}

            {rankingsLoading && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⏳</div>
                <div className="text-[#F5DEB3] opacity-70">Cargando ranking...</div>
              </div>
            )}
          </div>
        )}

        {/* TAB: AMIGOS */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            {/* Resumen de amigos */}
            <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#D4A574]">
                  👥 Mis Amigos ({friends.length})
                </h3>
                {pendingRequestsCount > 0 && (
                  <button
                    onClick={() => setShowFriendRequests(!showFriendRequests)}
                    className="bg-red-500 text-white px-2 py-1 rounded-full text-xs"
                  >
                    {pendingRequestsCount} solicitudes
                  </button>
                )}
              </div>
              
              <div className="text-sm text-[#F5DEB3] opacity-70 mb-4">
                {onlineFriendsCount} en línea • {friends.length - onlineFriendsCount} desconectados
              </div>

              {/* Solicitudes de amistad */}
              {showFriendRequests && pendingRequestsCount > 0 && (
                <div className="mb-4 space-y-2">
                  <h4 className="text-sm font-bold text-[#D4A574]">Solicitudes pendientes:</h4>
                  {friendRequests.filter(req => req.type === 'received').map((request) => (
                    <div key={request.id} className="bg-[#1a1a1a] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-[#F5DEB3]">
                            {request.user.name}
                          </div>
                          <div className="text-xs text-[#F5DEB3] opacity-70">
                            @{request.user.username}
                          </div>
                        </div>
                        <div className="text-xs text-[#F5DEB3] opacity-60">
                          {request.mutual_friends} amigos en común
                        </div>
                      </div>
                      {request.message && (
                        <div className="text-xs text-[#F5DEB3] opacity-80 mb-3">
                          "{request.message}"
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => respondToRequest(request.id, 'accept')}
                          className="flex-1 bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => respondToRequest(request.id, 'reject')}
                          className="flex-1 bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lista de amigos */}
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">😔</div>
                  <div className="text-[#F5DEB3] opacity-70">
                    No tienes amigos agregados
                  </div>
                  <div className="text-xs text-[#F5DEB3] opacity-60 mt-2">
                    Ve a "Buscar" para encontrar usuarios
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.slice(0, 5).map((friend) => (
                    <div key={friend.id} className="bg-[#1a1a1a] rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            friend.is_online ? 'bg-green-400' : 'bg-gray-500'
                          }`} />
                          <div>
                            <div className="font-semibold text-[#F5DEB3]">
                              {friend.name}
                            </div>
                            <div className="text-xs text-[#F5DEB3] opacity-70">
                              {friend.city} • {friend.win_rate}% WR
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[#F5DEB3] opacity-60">
                            H2H: {friend.head_to_head.wins}-{friend.head_to_head.losses}
                          </div>
                          <div className="text-xs text-[#F5DEB3] opacity-60">
                            {friend.games_played_together} partidos
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {friends.length > 5 && (
                    <div className="text-center text-xs text-[#F5DEB3] opacity-60">
                      Y {friends.length - 5} amigos más...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: DESAFÍOS */}
        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {/* Desafíos pendientes */}
            <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
              <h3 className="text-lg font-bold text-[#D4A574] mb-3">
                ⚔️ Desafíos Pendientes
              </h3>
              
              {pendingChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🕊️</div>
                  <div className="text-[#F5DEB3] opacity-70">
                    No tienes desafíos pendientes
                  </div>
                  <div className="text-xs text-[#F5DEB3] opacity-60 mt-2">
                    Ve a "Amigos" para desafiar a alguien
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingChallenges.map((challenge) => (
                    <div key={challenge.id} className="bg-[#1a1a1a] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-[#F5DEB3]">
                            {challenge.challenger.name}
                          </div>
                          <div className="text-xs text-[#F5DEB3] opacity-70">
                            {challenge.challenge_details.type === 'revenge' ? '💀 Revancha' : 
                             challenge.challenge_details.type === 'friendly' ? '🤝 Amistoso' : 
                             '🏆 Ranking'}
                          </div>
                        </div>
                        <div className="text-xs text-[#F5DEB3] opacity-60">
                          {new Date(challenge.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {challenge.challenge_details.message && (
                        <div className="text-xs text-[#F5DEB3] opacity-80 mb-3">
                          "{challenge.challenge_details.message}"
                        </div>
                      )}
                      
                      {challenge.challenge_details.context && (
                        <div className="text-xs text-[#F5DEB3] opacity-70 mb-3">
                          H2H: {challenge.challenge_details.context.head_to_head.record}
                          {challenge.challenge_details.context.last_game && (
                            <span className="ml-2">
                              • Último: {challenge.challenge_details.context.last_game.score}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => acceptChallenge(challenge.id)}
                          className="flex-1 bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => rejectChallenge(challenge.id)}
                          className="flex-1 bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: BUSCAR */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            {/* Buscador */}
            <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
              <h3 className="text-lg font-bold text-[#D4A574] mb-3">
                🔍 Buscar Usuarios
              </h3>
              
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre o username..."
                className="w-full bg-[#1a1a1a] text-[#F5DEB3] px-3 py-2 rounded-lg border border-[#D4A574] border-opacity-30 focus:border-[#D4A574] focus:outline-none"
              />
              
              {searchLoading && (
                <div className="text-center py-4">
                  <div className="text-[#F5DEB3] opacity-70">Buscando...</div>
                </div>
              )}
              
              {/* Resultados de búsqueda */}
              {hasSearchTerm && !searchLoading && (
                <div className="mt-4 space-y-2">
                  {hasResults ? (
                    searchResults.map((user) => (
                      <div key={user.id} className="bg-[#1a1a1a] rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-[#F5DEB3]">
                              {user.name}
                            </div>
                            <div className="text-xs text-[#F5DEB3] opacity-70">
                              @{user.username} • {user.city}
                            </div>
                          </div>
                          <div className="text-xs text-[#F5DEB3] opacity-60">
                            {user.win_rate}% WR
                          </div>
                        </div>
                        
                        {user.mutual_friends > 0 && (
                          <div className="text-xs text-[#F5DEB3] opacity-70 mb-2">
                            {user.mutual_friends} amigos en común
                          </div>
                        )}
                        
                        <button
                          onClick={() => sendFriendRequest(user.id, '¡Hola! ¿Jugamos una partida?')}
                          className="w-full bg-[#D4A574] text-[#0a0a0a] px-3 py-1 rounded-lg text-xs hover:bg-[#E6C589] transition-colors"
                          disabled={user.relationship_status !== 'none'}
                        >
                          {user.relationship_status === 'friend' ? 'Ya son amigos' :
                           user.relationship_status === 'pending_sent' ? 'Solicitud enviada' :
                           user.relationship_status === 'pending_received' ? 'Te envió solicitud' :
                           'Enviar solicitud'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-[#F5DEB3] opacity-70">
                        No se encontraron usuarios
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Sugerencias */}
              {!hasSearchTerm && suggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-[#D4A574] mb-2">
                    Sugerencias para ti:
                  </h4>
                  <div className="space-y-2">
                    {suggestions.slice(0, 3).map((suggestion) => (
                      <div key={suggestion.id} className="bg-[#1a1a1a] rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-[#F5DEB3]">
                              {suggestion.name}
                            </div>
                            <div className="text-xs text-[#F5DEB3] opacity-70">
                              {suggestion.reason}
                            </div>
                          </div>
                          <div className="text-xs text-[#F5DEB3] opacity-60">
                            {suggestion.win_rate}% WR
                          </div>
                        </div>
                        
                        <button
                          onClick={() => sendFriendRequest(suggestion.id, '¡Hola! El algoritmo nos sugirió conocernos.')}
                          className="w-full bg-[#D4A574] text-[#0a0a0a] px-3 py-1 rounded-lg text-xs hover:bg-[#E6C589] transition-colors"
                        >
                          Enviar solicitud
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialScreen;