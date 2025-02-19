import { tool } from 'ai';
import { z } from 'zod';

export const findRealEstate = tool({
  description: 'Find the best real estate offers in a given city based on price per square meter and other criteria',
  parameters: z.object({
    city: z.string().describe('City to search in'),
    minPricePerSqM: z.number().describe('Minimum price per square meter in USD'),
    maxPricePerSqM: z.number().describe('Maximum price per square meter in USD'),
    minSquareMeters: z.number().optional().describe('Minimum size of property in square meters'),
    maxDistanceToCenter: z.number().optional().describe('Maximum distance to city center in kilometers'),
  }),
  execute: async ({ city, minPricePerSqM, maxPricePerSqM, minSquareMeters, maxDistanceToCenter }) => {
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Find real estate in ${city} with price between $${minPricePerSqM}-${maxPricePerSqM}/m²${
            minSquareMeters ? `, min size ${minSquareMeters}m²` : ''
          }${maxDistanceToCenter ? `, max ${maxDistanceToCenter}km from center` : ''}`,
          conversation: []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to find real estate offers');
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error finding real estate:', error);
      return 'Sorry, there was an error searching for real estate. Please try again.';
    }
  },
});
