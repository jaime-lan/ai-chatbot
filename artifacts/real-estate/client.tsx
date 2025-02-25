import { Artifact } from '@/components/create-artifact';
import { CopyIcon, RedoIcon, UndoIcon, LinkIcon } from '@/components/icons';
import { toast } from 'sonner';
import Image from 'next/image';
import { useState } from 'react';

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
    description: string
  }>;
}

// Add this near the top, after imports
const ImageSlideshow = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => setCurrentIndex((i) => (i + 1) % images.length);
  const prevImage = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="w-[500px] h-[200px] relative">
      <img
        src={images[currentIndex]}
        alt="Property"
        className="w-full h-full object-cover rounded-lg"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      {images.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 flex items-center z-10">
            <button
              onClick={prevImage}
              className="h-full px-6 bg-black/50 hover:bg-black/70 text-white text-4xl transition-all duration-200"
            >
              ‹
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center z-10">
            <button
              onClick={nextImage}
              className="h-full px-6 bg-black/50 hover:bg-black/70 text-white text-4xl transition-all duration-200"
            >
              ›
            </button>
          </div>
        </>
      )}
    </div>
  );
};

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
            
            // Validate data structure
            if (!data?.listings || !Array.isArray(data.listings)) {
              console.error('Invalid data structure:', data);
              return <div>Invalid data format</div>;
            }

            return (
              <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700" style={{ gap: '3vh' }}>
                {data.listings.map((listing: RealEstateMetadata['listings'][0], index: number) => {
                  // Validate each listing
                  if (!listing) return null;

                  return (
                    <div key={index} className="flex gap-6 pt-[8vh] first:pt-0">
                      <div className="w-1/2">
                        {Array.isArray(listing.images) && listing.images.length > 0 ? (
                          <ImageSlideshow images={listing.images} />
                        ) : (
                          <div className="h-[200px] w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                            <p className="text-sm text-zinc-500">No images available</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-1/2 space-y-4">
                        <div className="flex justify-between items-start">
                          <h2 className="text-2xl font-bold">{listing.detailed_address || 'No address'}</h2>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-xl font-semibold">
                              {typeof listing.price === 'number' 
                                ? `${listing.price.toLocaleString('en-US')}€`
                                : listing.price}
                            </div>
                            {listing.url && (
                              <a 
                                href={listing.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
                              >
                                <LinkIcon size={16} />
                                <span>View listing</span>
                              </a>
                            )}
                            <span className={`px-3 py-1 text-sm font-medium rounded-md ${
                              index === 0 ? 'bg-emerald-100 text-emerald-700' :
                              index === 1 ? 'bg-blue-100 text-blue-700' :
                              index === 2 ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              ID: {listing.listingId}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Features:</h3>
                          <ul className="list-disc pl-5">
                            {Array.isArray(listing.features) && listing.features.map((feature: string, featureIndex: number) => (
                              <li key={featureIndex}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold">Description:</h3>
                          <p className="mt-2 whitespace-pre-wrap">{listing.description || 'No description available'}</p>
                        </div>

                        {Array.isArray(listing.phone_numbers) && listing.phone_numbers.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold">Contact:</h3>
                            <div className="mt-2 space-y-1">
                              {listing.phone_numbers.map((phone, phoneIndex) => (
                                <a 
                                  key={phoneIndex} 
                                  href={`tel:${phone}`}
                                  className="block text-blue-500 hover:text-blue-600 transition-colors"
                                >
                                  {phone}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          } catch (e) {
            console.error('Failed to parse listing:', e);
            return <div>Failed to load listing</div>;
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
});