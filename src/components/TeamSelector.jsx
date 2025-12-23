// src/components/TeamSelector.jsx - Team selection component with friend picker
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

const TeamSelector = ({
  teamNosotros = [],
  teamEllos = [],
  onTeamNosotrosChange,
  onTeamEllosChange,
  maxPerTeam = 3,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalTeam, setModalTeam] = useState(null); // 'nosotros' or 'ellos'
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // Load current user profile and friends on mount
  useEffect(() => {
    const loadData = async () => {
      setFriendsLoading(true);
      try {
        // Load current user profile
        const profile = await authService.getUserProfile();
        if (profile) {
          setCurrentUserProfile(profile);
          // Auto-add current user to Nosotros if not already there
          if (!teamNosotros.find(u => u.id === profile.id)) {
            onTeamNosotrosChange([{
              id: profile.id,
              display_name: profile.display_name,
              name: profile.name,
              avatar_url: profile.avatar_url,
              isCurrentUser: true
            }, ...teamNosotros]);
          }
        }

        // Load friends
        const friendsList = await authService.getFriends();
        setFriends(friendsList || []);
      } catch (error) {
        console.error('Error loading team data:', error);
      } finally {
        setFriendsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Open modal to add player to a team
  const openAddPlayerModal = (team) => {
    setModalTeam(team);
    setShowModal(true);
  };

  // Add a friend to a team
  const addToTeam = (friend) => {
    const playerData = {
      id: friend.id,
      display_name: friend.display_name,
      name: friend.name,
      avatar_url: friend.avatar_url,
    };

    if (modalTeam === 'nosotros') {
      if (teamNosotros.length < maxPerTeam) {
        onTeamNosotrosChange([...teamNosotros, playerData]);
      }
    } else {
      if (teamEllos.length < maxPerTeam) {
        onTeamEllosChange([...teamEllos, playerData]);
      }
    }
    setShowModal(false);
  };

  // Remove a player from a team
  const removeFromTeam = (playerId, team) => {
    // Don't allow removing current user
    if (currentUserProfile && playerId === currentUserProfile.id) {
      return;
    }

    if (team === 'nosotros') {
      onTeamNosotrosChange(teamNosotros.filter(p => p.id !== playerId));
    } else {
      onTeamEllosChange(teamEllos.filter(p => p.id !== playerId));
    }
  };

  // Check if a friend is already in any team
  const isInAnyTeam = (friendId) => {
    return teamNosotros.some(p => p.id === friendId) || teamEllos.some(p => p.id === friendId);
  };

  // Get available friends for selection (not already in a team)
  const getAvailableFriends = () => {
    return friends.filter(f => !isInAnyTeam(f.id));
  };

  // Player chip component
  const PlayerChip = ({ player, team, canRemove = true }) => (
    <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#D4A574] border-opacity-30 rounded-lg px-3 py-2">
      {/* Avatar */}
      {player.avatar_url ? (
        <img
          src={player.avatar_url}
          alt={player.display_name || player.name}
          className="w-8 h-8 rounded-full border border-[#D4A574] object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full border border-[#D4A574] bg-gradient-to-br from-[#D4A574] to-[#C59660] flex items-center justify-center">
          <span className="text-[#0a0a0a] text-sm font-bold">
            {(player.display_name || player.name || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-[#F5DEB3] text-sm font-medium truncate">
          {player.display_name ? `@${player.display_name}` : player.name || 'Jugador'}
        </p>
        {player.isCurrentUser && (
          <p className="text-[#D4A574] text-xs">(Vos)</p>
        )}
      </div>

      {/* Remove button */}
      {canRemove && !player.isCurrentUser && (
        <button
          onClick={() => removeFromTeam(player.id, team)}
          className="text-red-400 hover:text-red-300 text-lg font-bold"
        >
          x
        </button>
      )}
    </div>
  );

  // Add player button
  const AddPlayerButton = ({ team, disabled }) => (
    <button
      onClick={() => openAddPlayerModal(team)}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 bg-[#1a1a1a] border border-dashed border-[#D4A574] border-opacity-40 rounded-lg px-3 py-3 transition-all ${
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:border-opacity-70 hover:bg-[#D4A574] hover:bg-opacity-10'
      }`}
    >
      <span className="text-[#D4A574] text-lg">+</span>
      <span className="text-[#D4A574] text-sm">Agregar jugador</span>
    </button>
  );

  // If not authenticated, show simple message
  if (!isAuthenticated) {
    return (
      <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
        <h2 className="text-md font-bold text-[#D4A574] mb-3 text-center">
          👥 EQUIPOS
        </h2>
        <p className="text-[#F5DEB3] text-sm text-center opacity-70">
          Inicia sesion para seleccionar jugadores de tu lista de amigos
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
        <h2 className="text-md font-bold text-[#D4A574] mb-4 text-center">
          👥 EQUIPOS
        </h2>

        {friendsLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-[#F5DEB3] text-sm">Cargando...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Nosotros Column */}
            <div className="space-y-2">
              <h3 className="text-[#D4A574] text-sm font-bold text-center mb-2">
                NOSOTROS
              </h3>

              {/* Current players */}
              {teamNosotros.map(player => (
                <PlayerChip
                  key={player.id}
                  player={player}
                  team="nosotros"
                  canRemove={!player.isCurrentUser}
                />
              ))}

              {/* Add player button */}
              {teamNosotros.length < maxPerTeam && (
                <AddPlayerButton
                  team="nosotros"
                  disabled={getAvailableFriends().length === 0}
                />
              )}

              {/* Player count */}
              <p className="text-[#F5DEB3] text-xs text-center opacity-50">
                {teamNosotros.length}/{maxPerTeam} jugadores
              </p>
            </div>

            {/* Ellos Column */}
            <div className="space-y-2">
              <h3 className="text-[#D4A574] text-sm font-bold text-center mb-2">
                ELLOS
              </h3>

              {/* Current players */}
              {teamEllos.map(player => (
                <PlayerChip
                  key={player.id}
                  player={player}
                  team="ellos"
                />
              ))}

              {/* Add player button */}
              {teamEllos.length < maxPerTeam && (
                <AddPlayerButton
                  team="ellos"
                  disabled={getAvailableFriends().length === 0}
                />
              )}

              {/* Player count */}
              <p className="text-[#F5DEB3] text-xs text-center opacity-50">
                {teamEllos.length}/{maxPerTeam} jugadores
              </p>
            </div>
          </div>
        )}

        {/* No friends message */}
        {!friendsLoading && friends.length === 0 && (
          <p className="text-[#F5DEB3] text-xs text-center mt-3 opacity-60">
            No tenes amigos agregados. Podes agregar amigos desde tu perfil.
          </p>
        )}
      </div>

      {/* Friend Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-[#D4A574] rounded-xl w-full max-w-sm max-h-[70vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#D4A574] border-opacity-30">
              <h3 className="text-lg font-bold text-[#D4A574] text-center">
                Seleccionar jugador
              </h3>
              <p className="text-[#F5DEB3] text-xs text-center opacity-70 mt-1">
                Para {modalTeam === 'nosotros' ? 'Nosotros' : 'Ellos'}
              </p>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {getAvailableFriends().length === 0 ? (
                <p className="text-[#F5DEB3] text-sm text-center opacity-70 py-4">
                  No hay mas amigos disponibles
                </p>
              ) : (
                getAvailableFriends().map(friend => (
                  <button
                    key={friend.id}
                    onClick={() => addToTeam(friend)}
                    className="w-full flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#D4A574] hover:bg-opacity-20 border border-[#D4A574] border-opacity-30 rounded-lg p-3 transition-all"
                  >
                    {/* Avatar */}
                    {friend.avatar_url ? (
                      <img
                        src={friend.avatar_url}
                        alt={friend.display_name || friend.name}
                        className="w-10 h-10 rounded-full border border-[#D4A574] object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border border-[#D4A574] bg-gradient-to-br from-[#D4A574] to-[#C59660] flex items-center justify-center">
                        <span className="text-[#0a0a0a] font-bold">
                          {(friend.display_name || friend.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Name */}
                    <div className="flex-1 text-left">
                      {friend.display_name ? (
                        <>
                          <p className="text-[#D4A574] font-medium">@{friend.display_name}</p>
                          {friend.name && (
                            <p className="text-[#F5DEB3] text-xs opacity-60">{friend.name}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-[#F5DEB3] font-medium">{friend.name || 'Usuario'}</p>
                      )}
                    </div>

                    {/* Add indicator */}
                    <span className="text-[#D4A574] text-xl">+</span>
                  </button>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#D4A574] border-opacity-30">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-[#1a1a1a] border border-[#D4A574] border-opacity-50 text-[#F5DEB3] font-semibold rounded-lg hover:bg-[#D4A574] hover:bg-opacity-10 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamSelector;
