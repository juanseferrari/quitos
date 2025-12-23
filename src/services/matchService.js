// src/services/matchService.js - Service for match CRUD operations with Supabase
import { supabase, isSupabaseConfigured } from '../config/supabase';
import authService from './authService';

class MatchService {
  constructor() {
    this.supabase = supabase;
    this.isConfigured = isSupabaseConfigured();
  }

  // Create a new match record
  async createMatch(matchData) {
    if (!this.isConfigured) {
      console.log('Supabase not configured, skipping match creation');
      return { id: `local-${Date.now()}`, ...matchData };
    }

    try {
      const userProfile = await authService.getUserProfile();
      if (!userProfile) {
        console.log('No user profile, skipping match creation');
        return null;
      }

      const match = {
        created_by: userProfile.id,
        team_nosotros_ids: matchData.teamNosotros?.map(u => u.id) || [],
        team_ellos_ids: matchData.teamEllos?.map(u => u.id) || [],
        total_points: matchData.puntosTotales || 30,
        score_nosotros: 0,
        score_ellos: 0,
        winner: null,
        notes: null,
        game_data: null,
        started_at: new Date().toISOString(),
      };

      console.log('Creating match:', match);

      const { data, error } = await this.supabase
        .from('matches')
        .insert([match])
        .select()
        .single();

      if (error) {
        console.error('Error creating match:', error);
        throw error;
      }

      console.log('Match created:', data.id);
      return data;
    } catch (error) {
      console.error('createMatch error:', error);
      return null;
    }
  }

  // Update an ongoing match
  async updateMatch(matchId, updates) {
    if (!this.isConfigured || !matchId || matchId.startsWith('local-')) {
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('matches')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single();

      if (error) {
        console.error('Error updating match:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('updateMatch error:', error);
      return null;
    }
  }

  // Finish a match with final scores
  async finishMatch(matchId, finalData) {
    if (!this.isConfigured || !matchId || matchId.startsWith('local-')) {
      console.log('Skipping finishMatch - not configured or local match');
      return null;
    }

    try {
      const duration = finalData.startedAt
        ? Math.round((Date.now() - new Date(finalData.startedAt).getTime()) / 60000)
        : null;

      const updates = {
        score_nosotros: finalData.puntosNos || 0,
        score_ellos: finalData.puntosEllos || 0,
        winner: finalData.ganador === 'nos' ? 'nosotros' : finalData.ganador === 'ellos' ? 'ellos' : null,
        notes: finalData.notes || null,
        game_data: finalData.historial ? { historial: finalData.historial } : null,
        finished_at: new Date().toISOString(),
        duration_minutes: duration,
      };

      console.log('Finishing match:', matchId, updates);

      const { data, error } = await this.supabase
        .from('matches')
        .update(updates)
        .eq('id', matchId)
        .select()
        .single();

      if (error) {
        console.error('Error finishing match:', error);
        throw error;
      }

      console.log('Match finished:', data.id);
      return data;
    } catch (error) {
      console.error('finishMatch error:', error);
      return null;
    }
  }

  // Get user's match history
  async getMyMatches(limit = 20) {
    if (!this.isConfigured) {
      return [];
    }

    try {
      const userProfile = await authService.getUserProfile();
      if (!userProfile) {
        return [];
      }

      // Get matches where user is creator or participant
      const { data, error } = await this.supabase
        .from('matches')
        .select('*')
        .or(`created_by.eq.${userProfile.id},team_nosotros_ids.cs.{${userProfile.id}},team_ellos_ids.cs.{${userProfile.id}}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting matches:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('getMyMatches error:', error);
      return [];
    }
  }

  // Get head-to-head history with a specific user
  async getMatchesWith(userId, limit = 10) {
    if (!this.isConfigured) {
      return [];
    }

    try {
      const userProfile = await authService.getUserProfile();
      if (!userProfile) {
        return [];
      }

      // Get matches where both users participated (on any team)
      const { data, error } = await this.supabase
        .from('matches')
        .select('*')
        .or(`team_nosotros_ids.cs.{${userProfile.id}},team_ellos_ids.cs.{${userProfile.id}}`)
        .or(`team_nosotros_ids.cs.{${userId}},team_ellos_ids.cs.{${userId}}`)
        .not('winner', 'is', null)
        .order('finished_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting matches with user:', error);
        throw error;
      }

      // Filter to only matches where both users actually played
      const filteredData = (data || []).filter(match => {
        const allPlayers = [...(match.team_nosotros_ids || []), ...(match.team_ellos_ids || [])];
        return allPlayers.includes(userProfile.id) && allPlayers.includes(userId);
      });

      return filteredData;
    } catch (error) {
      console.error('getMatchesWith error:', error);
      return [];
    }
  }

  // Get match statistics for a user
  async getMatchStats(userId = null) {
    if (!this.isConfigured) {
      return null;
    }

    try {
      const userProfile = userId ? { id: userId } : await authService.getUserProfile();
      if (!userProfile) {
        return null;
      }

      const matches = await this.getMyMatches(100);

      let wins = 0;
      let losses = 0;

      matches.forEach(match => {
        if (!match.winner) return;

        const wasInNosotros = (match.team_nosotros_ids || []).includes(userProfile.id);
        const wasInEllos = (match.team_ellos_ids || []).includes(userProfile.id);

        if (wasInNosotros && match.winner === 'nosotros') wins++;
        else if (wasInEllos && match.winner === 'ellos') wins++;
        else if (wasInNosotros || wasInEllos) losses++;
      });

      return {
        totalMatches: matches.length,
        wins,
        losses,
        winRate: matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0,
      };
    } catch (error) {
      console.error('getMatchStats error:', error);
      return null;
    }
  }
}

// Create singleton instance
const matchService = new MatchService();

export default matchService;
