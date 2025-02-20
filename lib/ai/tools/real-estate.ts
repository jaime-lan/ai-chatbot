import { tool } from 'ai';
import { z } from 'zod';

interface Property {
  address: string;
  price: number;
  squareMeters: number;
  pricePerSqM: number;
  distanceFromCenter?: number;
  furnished: boolean;
  score: number;
  link: string;
  description: string;
  floor?: string;
  totalFloors?: number;
  hasElevator: boolean;
}

export const findRealEstate = tool({
  description: 'Find real estate offers in a given city based on price per square meter and other criteria',
  parameters: z.object({
    city: z.string().describe('City to search in'),
    minPricePerSqM: z.number().describe('Minimum price per square meter'),
    maxPricePerSqM: z.number().describe('Maximum price per square meter'),
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to find real estate offers');
      }

      const properties: Property[] = await response.json();
      
      // Return all properties sorted by score
      return properties.map(property => ({
        price: `$${property.price.toLocaleString()}`,
        location: property.address,
        features: [
          `${property.squareMeters}m²`,
          `$${Math.round(property.pricePerSqM)}/m²`,
          property.furnished ? 'Furnished' : 'Unfurnished',
          property.floor ? `Floor: ${property.floor}` : null,
          property.hasElevator ? 'Has elevator' : 'No elevator',
        ].filter(Boolean),
        description: property.description,
        externalUrl: property.link,
        score: property.score // Include score for sorting
      }));

    } catch (error) {
      console.error('Error finding real estate:', error);
      return [{
        price: 'N/A',
        location: city,
        features: [],
        description: 'Sorry, there was an error searching for real estate. Please try again.',
        externalUrl: null,
        score: 0
      }];
    }
  },
});
