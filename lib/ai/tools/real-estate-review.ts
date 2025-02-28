import { tool } from 'ai';
import { z } from 'zod';

export const getRealEstateReview = tool({
  description: 'Provides a detailed review of the changes in the history of the real estate offer based on the listing id.',
  parameters: z.object({
    listingId: z.number().describe('Listing of the real estate offer ID')
  }),
  execute: async ({ listingId }) => {
    try {
      const response = await fetch('https://real-estate-agent-90r1.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Provide me a detailed review of the history of the real estate offer with ID ${listingId}.`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to find real estate offers');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error finding real estate:', error);
      return { error: 'Failed to find real estate offers' };
    }
  },
});
