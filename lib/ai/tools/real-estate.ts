import { tool } from 'ai';
import { z } from 'zod';

const PropertySchema = z.object({
  detailed_address: z.string().default(''),
  price: z.number().default(0),
  phone_numbers: z.array(z.string()).default([]),
  url: z.string().default(''),
  images: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  description: z.string().default('')
});

type Property = z.infer<typeof PropertySchema>;

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
      
      // Transform to match our schema
      return properties.map(property => ({
        detailed_address: property.detailed_address,
        price: property.price,
        phone_numbers: property.phone_numbers || [],
        url: property.url,
        images: property.images || [],
        features: property.features || [],
        description: property.description
      }));

    } catch (error) {
      console.error('Error finding real estate:', error);
      return [{
        detailed_address: city,
        price: 0,
        phone_numbers: [],
        url: '',
        images: [],
        features: [],
        description: 'Sorry, there was an error searching for real estate. Please try again.'
      }];
    }
  },
});
