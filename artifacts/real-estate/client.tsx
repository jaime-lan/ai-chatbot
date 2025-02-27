import { useState } from 'react';
import { ListingPage } from './listing-page';
import { toast } from 'sonner';
import { CopyIcon, RedoIcon, UndoIcon, LinkIcon } from 'lucide-react';

// Define interfaces for type safety
interface RealEstateMetadata {
  listings: Array<{
    listingId: number,
    detailed_address: string,
    price: number,
    phone_numbers: string[],
    url: string,
    images: string[],
    features: string[],
    description: string,
    publish_date: string,
    seen: number
  }>;
}

export const realEstateArtifact = {
  kind: 'real-estate',
  description: 'Useful for real estate listings',
  initialize: async () => {},
  onStreamPart: ({ streamPart, setArtifact }: { streamPart: { type: string; content: string }; setArtifact: (updater: (draftArtifact: any) => any) => void }) => {
    if (streamPart.type === 'real-estate-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  content: ({ content }: { content: string; status: any }) => {
    if (!content) return null;

    try {
      const data = typeof content === 'string' ? JSON.parse(content) : content;
      
      if (!data?.listings || !Array.isArray(data.listings)) {
        console.error('Invalid data structure:', data);
        return <div>Invalid data format</div>;
      }

      return <ListingPage listings={data.listings} />;
    } catch (e) {
      console.error('Failed to parse listing:', e);
      return <div>Failed to load listing</div>;
    }
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }: { handleVersionChange: (direction: 'prev' | 'next') => void }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }: { currentVersionIndex: number }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }: { handleVersionChange: (direction: 'prev' | 'next') => void }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }: { isCurrentVersion: boolean }) => isCurrentVersion,
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy listing to clipboard',
      onClick: ({ content }: { content: string }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied listing to clipboard!');
      },
    },
    {
      icon: <LinkIcon size={18} />,
      description: 'Copy listing URL',
      onClick: ({ content }: { content: string }) => {
        try {
          const data = JSON.parse(content);
          const url = data.listings[0].url;
          navigator.clipboard.writeText(url);
          toast.success('Copied listing URL to clipboard!');
        } catch (e) {
          console.error('Failed to copy URL:', e);
          toast.error('Failed to copy URL');
        }
      },
    },
  ],
  toolbar: [],
};