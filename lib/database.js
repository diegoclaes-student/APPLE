import { supabase } from '../config/supabase.js';

export class DatabaseService {
  // Presences
  async createPresence({ location, date, startTime, endTime }) {
    try {
      const { data, error } = await supabase
        .from('presences')
        .insert([{
          location,
          date,
          start_time: startTime,
          end_time: endTime
        }])
        .select()
        .single();

      if (error) throw error;

      // Generate 15-minute slots
      await this.generateSlots(data.id, date, startTime, endTime);
      
      return data;
    } catch (error) {
      console.error('Error creating presence:', error);
      throw error;
    }
  }

  async generateSlots(presenceId, date, startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startDate = new Date(`${date}T${startTime}:00`);
    const endDate = new Date(`${date}T${endTime}:00`);
    
    const slots = [];
    for (let time = new Date(startDate); time < endDate; time = new Date(time.getTime() + 15 * 60 * 1000)) {
      slots.push({
        presence_id: presenceId,
        start_at: time.toISOString()
      });
    }

    if (slots.length > 0) {
      const { error } = await supabase
        .from('slots')
        .insert(slots);
      
      if (error) throw error;
    }
  }

  async listUpcomingSlots({ dateFilter = null, locationFilter = '' } = {}) {
    try {
      let query = supabase
        .from('slots')
        .select(`
          id,
          start_at,
          presences!inner (
            location,
            date
          )
        `)
        .gte('start_at', new Date().toISOString())
        .order('start_at');

      if (dateFilter) {
        const startOfDay = new Date(`${dateFilter}T00:00:00`);
        const endOfDay = new Date(`${dateFilter}T23:59:59`);
        query = query
          .gte('start_at', startOfDay.toISOString())
          .lte('start_at', endOfDay.toISOString());
      }

      if (locationFilter) {
        query = query.ilike('presences.location', `%${locationFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

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
      const { data, error } = await supabase
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

  // Reservations
  async createReservation(reservationData) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          ...reservationData,
          created_at: new Date().toISOString()
        }])
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
      const { data, error } = await supabase
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

      // Flatten the data structure
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

  async updateReservation(token, updates) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('token', token)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  async deleteReservationByToken(token) {
    try {
      const { error } = await supabase
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
      let query = supabase
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
      const { data, error } = await supabase
        .from('presences')
        .select('*')
        .order('date')
        .order('start_time');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error listing presences:', error);
      throw error;
    }
  }
}

export const db = new DatabaseService();