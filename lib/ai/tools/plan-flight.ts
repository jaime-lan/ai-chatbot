import { tool } from 'ai';
import { z } from 'zod';

export const planFlight = tool({
  description: 'Plan a flight itinerary by sending request to flight planning service',
  parameters: z.object({
    source_city: z.string().describe('Departure city'),
    destination_city: z.string().describe('Destination city'),
    departure_date: z.string().describe('Date of departure'),
    return_date: z.string().describe('Date of return'),
    budget: z.number().describe('Maximum budget in USD'),
  }),
  execute: async ({ source_city, destination_city, departure_date, return_date, budget }) => {
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Plan a flight from ${source_city} to ${destination_city}, departing ${departure_date} and returning ${return_date} with a budget of $${budget}`,
          conversation: []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get flight plan');
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error planning flight:', error);
      return 'Sorry, there was an error planning your flight. Please try again.';
    }
  },
});
