import { Artifact } from '@/components/create-artifact';
import { CopyIcon, RedoIcon, UndoIcon, LinkIcon } from '@/components/icons';
import { toast } from 'sonner';

// Define interfaces for type safety
interface RealEstateMetadata {
  listings: Array<{
    price: string;
    location: string;
    features: string[];
    description: string;
    externalUrl?: string;
    score: number;
  }>;
}

// Create the artifact
export const realEstateArtifact = new Artifact<'real-estate', RealEstateMetadata>({
  kind: 'real-estate',
  description: 'Useful for real estate listings',
  initialize: async () => {},
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'real-estate-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  content: ({ content, status }) => {
    return (
      <div className="p-6">
        {content && (() => {
          try {
            const data = typeof content === 'string' ? JSON.parse(content) : content;
            
            return (
              <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700" style={{ gap: '3vh' }}>
                {data.listings.map((listing: RealEstateMetadata['listings'][0], index: number) => (
                  <div key={index} className="flex gap-6 pt-[8vh] first:pt-0">
                    <div className="w-1/2 h-[450px] rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <iframe 
                        src={listing.externalUrl}
                        className="w-full h-full border-0"
                        title={`Property Preview ${index + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onError={(e) => {
                          const target = e.target as HTMLIFrameElement;
                          target.parentElement!.innerHTML = `
                            <div class="w-full h-full flex flex-col gap-4 items-center justify-center">
                              <p class="text-sm text-zinc-500">Unable to load preview</p>
                              <a 
                                href="${listing.externalUrl}" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                View Property →
                              </a>
                            </div>
                          `;
                        }}
                      />
                    </div>
                    
                    <div className="w-1/2 space-y-4">
                      <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold">{listing.location}</h2>
                        <div className="flex items-center gap-3">
                          <div className="text-xl font-semibold">{listing.price}</div>
                          <a 
                            href={listing.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <LinkIcon size={16} />
                            <span>View listing</span>
                          </a>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Features:</h3>
                        <ul className="list-disc pl-5">
                          {listing.features.map((feature: string, featureIndex: number) => (
                            <li key={featureIndex}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Description:</h3>
                        <p className="mt-2 whitespace-pre-wrap">{listing.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          } catch (e) {
            console.error('Failed to parse listing:', e);
            return null;
          }
        })()}
      </div>
    );
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy listing to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied listing to clipboard!');
      },
    },
    {
      icon: <LinkIcon size={18} />,
      description: 'Copy listing URL',
      onClick: ({ content }) => {
        try {
          const data = JSON.parse(content);
          const url = data.listings[0].externalUrl;
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
});