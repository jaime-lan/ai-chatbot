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
  description: 'Search for real estate listings based on user criteria',
  parameters: z.object({
    city: z.string().describe('City name (e.g. Podgorica, Nikšić)'),
    query: z.string().describe('Original user query'),
    minSize: z.number().optional().describe('Minimum size in square meters'),
    maxSize: z.number().optional().describe('Maximum size in square meters'),
    minPrice: z.number().optional().describe('Minimum price in EUR'),
    maxPrice: z.number().optional().describe('Maximum price in EUR'),
    rooms: z.number().optional().describe('Least required number of rooms'),
    furnished: z.boolean().optional().describe('Whether the property is furnished'),
    floor: z.number().optional().describe('Floor number (0 for ground floor)'),
  }),
  execute: async ({ city, query, minPrice, maxPrice, minSize, maxSize, rooms, furnished, floor }) => {
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Find properties in ${city}${
            minPrice || maxPrice ? ` with price ${minPrice ? `from €${minPrice}` : ''}${maxPrice ? ` up to €${maxPrice}` : ''}` : ''
          }${
            minSize || maxSize ? ` and size ${minSize ? `from ${minSize}m²` : ''}${maxSize ? ` up to ${maxSize}m²` : ''}` : ''
          }${
            rooms ? ` with at least ${rooms} rooms` : ''
          }${
            furnished ? ' that are furnished' : ''
          }${
            typeof floor === 'number' ? ` on floor ${floor}` : ''
          }. ${query}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to find real estate offers');
      }

      const properties: Property[] = await response.json();
      
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
