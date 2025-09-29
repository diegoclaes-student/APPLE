import { supabase, supabaseAdmin } from '../config/supabase.js';

class DatabaseService {
  constructor() {
    this.client = supabase;
    this.adminClient = supabaseAdmin;
  }

  // Helper to use admin client when needed
  getClient(useAdmin = false) {
    if (useAdmin && this.adminClient) {
      return this.adminClient;
    }
    return this.client;
  }

  async createPresence({ location, date, startTime, endTime }) {
    try {
      const client = this.getClient(true); // Use admin for write operations
      
      // Insert presence
      const { data: presence, error: presenceError } = await client
        .from('presences')
        .insert({
          location,
          date,
          start_time: startTime,
          end_time: endTime
        })
        .select()
        .single();

      if (presenceError) throw presenceError;

      // Generate 15-minute slots
      const slots = [];
      const startDate = new Date(`${date}T${startTime}:00`);
      const endDate = new Date(`${date}T${endTime}:00`);

      for (let time = new Date(startDate); time < endDate; time = new Date(time.getTime() + 15 * 60 * 1000)) {
        slots.push({
          presence_id: presence.id,
          start_at: time.toISOString()
        });
      }

      if (slots.length > 0) {
        const { error: slotsError } = await client
          .from('slots')
          .insert(slots);

        if (slotsError) throw slotsError;
      }

      return presence;
    } catch (error) {
      console.error('Error creating presence:', error);
      throw error;
    }
  }

  async listUpcomingSlots({ dateFilter = null, locationFilter = '' } = {}) {
    try {
      if (!this.client) {
        // Without DB, return empty list so the site still renders
        return [];
      }
      let query = this.client
        .from('slots')
        .select(`
          id,
          start_at,
          presences!inner (
            id,
            location,
            date
          )
        `)
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true });

      if (dateFilter) {
        const startOfDay = new Date(`${dateFilter}T00:00:00`).toISOString();
        const endOfDay = new Date(`${dateFilter}T23:59:59`).toISOString();
        query = query.gte('start_at', startOfDay).lte('start_at', endOfDay);
      }

      if (locationFilter) {
        query = query.ilike('presences.location', `%${locationFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform data to match expected format
      return data.map(slot => ({
        slot_id: slot.id,
        start_at: slot.start_at,
        location: slot.presences.location,
        date: slot.presences.date
      }));
    } catch (error) {
      console.error('Error listing upcoming slots:', error);
      throw error;
    }
  }

  async getSlotById(slotId) {
    try {
      if (!this.client) return null;
      const { data, error } = await this.client
        .from('slots')
        .select(`
          *,
          presences (
            location,
            date
          )
        `)
        .eq('id', slotId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting slot by ID:', error);
      throw error;
    }
  }

  async createReservation({ slot_id, first_name, last_name, phone, quantity, comment, token }) {
    try {
      if (!this.adminClient) {
        throw new Error('Database not configured');
      }
      const client = this.getClient(true);
      
      const { data, error } = await client
        .from('reservations')
        .insert({
          slot_id,
          first_name,
          last_name,
          phone,
          quantity,
          comment,
          token
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  async getReservationByToken(token) {
    try {
      if (!this.client) return null;
      const { data, error } = await this.client
        .from('reservations')
        .select(`
          *,
          slots!inner (
            start_at,
            presences!inner (
              location,
              date
            )
          )
        `)
        .eq('token', token)
        .single();

      if (error) throw error;

      // Transform data to match expected format
      return {
        ...data,
        start_at: data.slots.start_at,
        location: data.slots.presences.location,
        date: data.slots.presences.date
      };
    } catch (error) {
      console.error('Error getting reservation by token:', error);
      throw error;
    }
  }

  async deletePresenceById(presenceId) {
    try {
      if (!this.adminClient) throw new Error('Database not configured');
      const client = this.getClient(true);
      // Delete related slots first (FK constraints)
      const { error: slotsErr } = await client
        .from('slots')
        .delete()
        .eq('presence_id', presenceId);
      if (slotsErr) throw slotsErr;

      // Then delete the presence
      const { error: presErr } = await client
        .from('presences')
        .delete()
        .eq('id', presenceId);
      if (presErr) throw presErr;
    } catch (error) {
      console.error('Error deleting presence:', error);
      throw error;
    }
  }

  async updateReservation(token, { first_name, last_name, phone, quantity, comment }) {
    try {
      if (!this.adminClient) {
        throw new Error('Database not configured');
      }
      const client = this.getClient(true);
      
      const { error } = await client
        .from('reservations')
        .update({
          first_name,
          last_name,
          phone,
          quantity,
          comment
        })
        .eq('token', token);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  async deleteReservationByToken(token) {
    try {
      if (!this.adminClient) {
        throw new Error('Database not configured');
      }
      const client = this.getClient(true);
      
      const { error } = await client
        .from('reservations')
        .delete()
        .eq('token', token);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  }

  async listReservations({ date = null, location = '' } = {}) {
    try {
      let query = this.client
        .from('reservations')
        .select(`
          *,
          slots!inner (
            start_at,
            presences!inner (
              location,
              date
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('slots.presences.date', date);
      }

      if (location) {
        query = query.ilike('slots.presences.location', `%${location}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform data to match expected format
      return data.map(reservation => ({
        ...reservation,
        start_at: reservation.slots.start_at,
        location: reservation.slots.presences.location,
        date: reservation.slots.presences.date
      }));
    } catch (error) {
      console.error('Error listing reservations:', error);
      throw error;
    }
  }

  async listPresences() {
    try {
      if (!this.client) return [];
      const { data, error } = await this.client
        .from('presences')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error listing presences:', error);
      throw error;
    }
  }
}

export const db = new DatabaseService();