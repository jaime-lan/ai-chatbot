import { myProvider } from '@/lib/ai/models';
import { realEstatePrompt } from '@/lib/ai/prompts';
import { findRealEstate } from '@/lib/ai/tools/real-estate';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamText } from 'ai';
import { z } from 'zod';

const listingSchema = z.object({
  listings: z.array(z.object({
    price: z.string(),
    location: z.string(),
    features: z.array(z.string()),
    description: z.string(),
    externalUrl: z.string().optional(),
    score: z.number(),
  })),
});

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
        const sortedListings = listings?.filter(Boolean).sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0)) || [];
        const content = JSON.stringify({ listings: sortedListings }, null, 2);
        
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
        const sortedListings = listings?.filter(Boolean).sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0)) || [];
        const content = JSON.stringify({ listings: sortedListings }, null, 2);
        
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