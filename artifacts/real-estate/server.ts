import { myProvider } from '@/lib/ai/models';
import { realEstatePrompt } from '@/lib/ai/prompts';
import { findRealEstate } from '@/lib/ai/tools/real-estate-offer';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamText } from 'ai';
import { z } from 'zod';

const listingSchema = z.array(z.object({
  listingId: z.number().default(0),
  detailed_address: z.string().default(''),
  price: z.number().default(0),
  phone_numbers: z.array(z.string()).default([]),
  url: z.string().default(''),
  images: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  description: z.string().default('')
}));

export const realEstateDocumentHandler = createDocumentHandler<'real-estate'>({
  kind: 'real-estate',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';
    
    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: realEstatePrompt,
      prompt: title,
      experimental_activeTools: ['findRealEstate'],
      tools: {
        findRealEstate,
      },
    });


    for await (const delta of fullStream) {
      if (delta.type === 'tool-result') {
        const listings = delta.result;
        // console.log('Tool result:', delta);
        // console.log('Raw listings:', listings);
        
        // Validate the array directly
        const parsed = listingSchema.safeParse(listings);
        if (!parsed.success) {
          console.error('Invalid listing data:', parsed.error);
          return '';
        }
        
        // Wrap the validated listings in an object for the client
        const content = JSON.stringify({ listings: parsed.data }, null, 2);
        
        dataStream.writeData({
          type: 'real-estate-delta',
          content,
        });

        draftContent = content;
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: 'Update the real estate listing based on the new information while preserving the existing structure.',
      prompt: description,
      experimental_activeTools: ['findRealEstate'],
      tools: {
        findRealEstate,
      },
    });

    for await (const delta of fullStream) {
      if (delta.type === 'tool-result') {
        const listings = delta.result;
        // console.log('Raw listings:', listings);
        
        // Validate the array directly
        const parsed = listingSchema.safeParse(listings);
        if (!parsed.success) {
          console.error('Invalid listing data:', parsed.error);
          return '';
        }
        
        // Wrap the validated listings in an object for the client
        const content = JSON.stringify({ listings: parsed.data }, null, 2);
        
        dataStream.writeData({
          type: 'real-estate-delta',
          content,
        });

        draftContent = content;
      }
    }

    return draftContent;
  },
}); 