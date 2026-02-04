import { supabaseService } from './supabaseService';

export interface Guide {
  id: string;
  title: string;
  description: string;
  category: 'VAT' | 'PAYE' | 'CAC' | 'WHT' | 'General';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  steps: string[];
  requirements: string[];
  youtube_url?: string;
  is_active: boolean;
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  warning?: string;
  documents?: string[];
  videoUrl?: string;
}

export const guidesService = {
  async getGuides(): Promise<Guide[]> {
    try {
      const response = await fetch(`${supabaseService.supabaseUrl}/rest/v1/guides?is_active=eq.true&select=*`, {
        headers: {
          'apikey': supabaseService.supabaseKey,
          'Authorization': `Bearer ${supabaseService.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch guides');
        return [];
      }

      const guides = await response.json();
      return guides || [];
    } catch (error) {
      console.error('Error fetching guides:', error);
      return [];
    }
  },

  async createGuide(guide: Omit<Guide, 'id'>): Promise<boolean> {
    try {
      const response = await fetch(`${supabaseService.supabaseUrl}/rest/v1/guides`, {
        method: 'POST',
        headers: {
          'apikey': supabaseService.supabaseKey,
          'Authorization': `Bearer ${supabaseService.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(guide)
      });

      return response.ok;
    } catch (error) {
      console.error('Error creating guide:', error);
      return false;
    }
  },

  async updateGuide(id: string, guide: Partial<Guide>): Promise<boolean> {
    try {
      const response = await fetch(`${supabaseService.supabaseUrl}/rest/v1/guides?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseService.supabaseKey,
          'Authorization': `Bearer ${supabaseService.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(guide)
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating guide:', error);
      return false;
    }
  },

  async deleteGuide(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${supabaseService.supabaseUrl}/rest/v1/guides?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseService.supabaseKey,
          'Authorization': `Bearer ${supabaseService.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting guide:', error);
      return false;
    }
  }
};