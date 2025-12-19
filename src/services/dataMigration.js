// services/dataMigration.js
import authService from './authService';
import { supabase } from '../config/supabase';

export const startDataMigration = async (userId) => {
  try {
    // 1. Obtener datos locales existentes
    const localGameState = localStorage.getItem('rey-del-truco-state');
    
    if (!localGameState) {
      return { success: true, migrated: 0 };
    }
    
    const localData = JSON.parse(localGameState).localData;
    
    if (!localData || localData.partidasJugadas === 0) {
      return { success: true, migrated: 0 };
    }
    
    // 2. Validar integridad de datos
    const validatedData = validateLocalData(localData);
    
    // 3. Transformar a formato del servidor
    const serverData = transformToServerFormat(validatedData, userId);
    
    // 4. Verificar si ya se migró antes
    const existingMigration = await checkExistingMigration(userId);
    if (existingMigration) {
      console.log('📋 Datos ya migrados anteriormente');
      return { success: true, migrated: 0, alreadyMigrated: true };
    }
    
    // 5. Enviar datos reales a Supabase
    const result = await migrateToSupabase(userId, serverData);
    
    // 6. Mantener backup local por 30 días
    localStorage.setItem('migrated_backup', JSON.stringify({
      originalData: localData,
      migratedAt: Date.now(),
      userId,
      serverResponse: result
    }));
    
    return result;
    
  } catch (error) {
    console.error('Data migration error:', error);
    throw error;
  }
};

const validateLocalData = (data) => {
  if (!data.historialCompleto || !Array.isArray(data.historialCompleto)) {
    throw new Error('Invalid local data structure');
  }
  
  const validGames = data.historialCompleto.filter(game => {
    return game.fechaFin && 
           game.ganador && 
           (game.puntosNos >= 0 && game.puntosEllos >= 0);
  });
  
  return {
    ...data,
    historialCompleto: validGames
  };
};

const transformToServerFormat = (localData, userId) => {
  const games = localData.historialCompleto.map(game => ({
    id: `migrated_${game.fechaInicio}_${userId}`,
    user_id: userId,
    player1_name: game.jugador1,
    player1_points: game.puntosNos,
    player2_name: game.jugador2,
    player2_points: game.puntosEllos,
    winner: game.ganador,
    total_points: game.puntosTotales,
    started_at: new Date(game.fechaInicio).toISOString(),
    finished_at: new Date(game.fechaFin).toISOString(),
    duration_ms: game.fechaFin - game.fechaInicio,
    moves: JSON.stringify(game.historial || []),
    game_mode: '1v1',
    platform: 'web',
    app_version: process.env.REACT_APP_VERSION || '1.0.0',
    migrated: true
  }));
  
  // Calcular stats
  const stats = {
    games_played: games.length,
    games_won: games.filter(g => g.winner === 'nos').length,
    total_points_scored: games.reduce((sum, g) => sum + g.player1_points, 0),
    avg_game_duration: games.reduce((sum, g) => sum + g.duration_ms, 0) / games.length,
    favorite_total_points: getMostFrequent(games.map(g => g.total_points))
  };
  
  return { games, stats };
};

const getMostFrequent = (array) => {
  const frequency = {};
  let maxFreq = 0;
  let mostFrequent = null;
  
  array.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
    if (frequency[item] > maxFreq) {
      maxFreq = frequency[item];
      mostFrequent = item;
    }
  });
  
  return mostFrequent;
};

// Verificar si ya existe una migración para este usuario
const checkExistingMigration = async (userId) => {
  try {
    // Get the user profile to get the internal user ID
    const userProfile = await authService.getUserProfile(userId);
    if (!userProfile) return false;

    const { data, error } = await supabase
      .from('data_migrations')
      .select('*')
      .eq('user_id', userProfile.id)
      .eq('migration_type', 'local_games')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('🔥 Error checking migration:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('🔥 Error checking existing migration:', error);
    return false;
  }
};

// Migrar datos reales a Supabase
const migrateToSupabase = async (userId, serverData) => {
  try {
    console.log('🚀 Starting real migration to Supabase...');
    
    // Get the user profile to get the internal user ID
    const userProfile = await authService.getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    const { games } = serverData;
    let gamesMigrated = 0;
    let movesMigrated = 0;
    
    // Migrate games one by one to handle any potential conflicts
    for (const gameData of games) {
      try {
        // Transform to match database schema
        const dbGame = {
          user_id: userProfile.id,
          player1_name: gameData.player1_name || 'Nosotros',
          player2_name: gameData.player2_name || 'Ellos',
          player1_score: gameData.player1_points || 0,
          player2_score: gameData.player2_points || 0,
          total_points: gameData.total_points || 30,
          winner: gameData.winner === 'nos' ? 'player1' : 'player2',
          started_at: gameData.started_at,
          finished_at: gameData.finished_at,
          duration_minutes: Math.round((new Date(gameData.finished_at) - new Date(gameData.started_at)) / 60000),
          migrated_from_local: true,
          original_local_timestamp: new Date(gameData.started_at).getTime()
        };
        
        // Insert game
        const { data: insertedGame, error: gameError } = await supabase
          .from('games')
          .insert([dbGame])
          .select()
          .single();
          
        if (gameError) {
          console.error('🔥 Error inserting game:', gameError);
          continue;
        }
        
        gamesMigrated++;
        
        // Insert game moves if available
        if (gameData.moves && typeof gameData.moves === 'string') {
          try {
            const moves = JSON.parse(gameData.moves);
            if (Array.isArray(moves) && moves.length > 0) {
              const dbMoves = moves.map((move, index) => ({
                game_id: insertedGame.id,
                move_number: index + 1,
                timestamp_in_game: move.timestamp - new Date(gameData.started_at).getTime(),
                team: move.equipo || 'player1',
                action: move.accion || '+',
                score_before: move.puntoAnterior || 0,
                score_after: move.puntoNuevo || 0,
                points_scored: (move.puntoNuevo || 0) - (move.puntoAnterior || 0)
              }));
              
              const { error: movesError } = await supabase
                .from('game_moves')
                .insert(dbMoves);
                
              if (!movesError) {
                movesMigrated += dbMoves.length;
              }
            }
          } catch (parseError) {
            console.warn('⚠️ Could not parse moves for game:', parseError);
          }
        }
        
      } catch (gameError) {
        console.error('🔥 Error migrating individual game:', gameError);
        continue;
      }
    }
    
    // Record migration in tracking table
    const migrationRecord = {
      user_id: userProfile.id,
      migration_type: 'local_games',
      local_games_count: games.length,
      local_data_timestamp: Date.now(),
      games_migrated: gamesMigrated,
      moves_migrated: movesMigrated,
      status: gamesMigrated === games.length ? 'completed' : 'partial',
      backup_data: { originalGames: games }
    };
    
    const { error: migrationError } = await supabase
      .from('data_migrations')
      .insert([migrationRecord]);
      
    if (migrationError) {
      console.error('🔥 Error recording migration:', migrationError);
    }
    
    console.log(`✅ Migration completed: ${gamesMigrated}/${games.length} games, ${movesMigrated} moves`);
    
    return {
      success: true,
      migrated: gamesMigrated,
      totalGames: games.length,
      movesMigrated,
      status: gamesMigrated === games.length ? 'completed' : 'partial'
    };
    
  } catch (error) {
    console.error('🔥 Migration error:', error);
    throw error;
  }
};