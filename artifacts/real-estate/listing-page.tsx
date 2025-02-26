import { useState } from 'react';
import { ImageSlideshow } from './image-slideshow';
import { ChevronLeft, ChevronRight, ExternalLink, Hash } from 'lucide-react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./map'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      backgroundColor: '#f3f4f6',
      borderRadius: '12px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    }}>
      <p style={{ color: '#6b7280' }}>Loading map...</p>
    </div>
  )
});

interface ListingPageProps {
  listings: Array<{
    listingId: number;
    detailed_address: string;
    price: number;
    phone_numbers: string[];
    url: string;
    images: string[];
    features: string[];
    description: string;
  }>;
}

export const ListingPage = ({ listings }: ListingPageProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'next' && currentIndex < listings.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const listing = listings[currentIndex];
  if (!listing) return null;

  console.log('Current listing images:', listing.images);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '48px' }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 48px)',
        position: 'relative'
      }}>
        {/* Top Half - Image Gallery */}
        <div style={{ height: '45%', width: '100%', minHeight: '300px' }}>
          {listing.images && listing.images.length > 0 ? (
            <ImageSlideshow images={listing.images} />
          ) : (
            <div style={{
              height: '100%',
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              fontSize: '1.125rem'
            }}>
              No images available
            </div>
          )}
        </div>

        {/* Bottom Half - Content */}
        <div style={{ 
          height: '55%',
          overflowY: 'auto',
          position: 'relative',
          marginTop: '10%'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            paddingLeft: '16px',
            paddingRight: '16px'
          }}>
            {/* Left Column - Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  border: '1px solid #e5e7eb',
                  flex: 1,
                  marginRight: '1rem'
                }}>
                  <h1 style={{ 
                    fontSize: '1.675rem', 
                    fontWeight: 500, 
                    marginBottom: '0.5rem', 
                    lineHeight: '1.2',
                    color: '#111827'
                  }}>{listing.detailed_address}</h1>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    background: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    width: 'fit-content',
                    fontSize: '0.875rem',
                    letterSpacing: '0.025em'
                  }}>
                    <span style={{ color: '#6b7280', fontWeight: 400 }}>ID:</span>
                    <span style={{ color: '#4b5563', fontWeight: 600 }}>{listing.listingId}</span>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.75rem',
                  background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  border: '1px solid #e5e7eb',
                  minWidth: '200px'
                }}>
                  <p style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    lineHeight: '1.2', 
                    color: '#111827',
                    textAlign: 'center'
                  }}>
                    {typeof listing.price === 'number'
                      ? `${listing.price.toLocaleString('en-US')}€`
                      : listing.price}
                  </p>
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    View listing
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {listing.description && (
                <div style={{ 
                  maxWidth: 'none',
                  background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <h2 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 600, 
                    marginBottom: '0.75rem',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    Description
                  </h2>
                  <p style={{ 
                    color: '#4b5563',
                    lineHeight: '1.6',
                    fontSize: '0.9375rem',
                    whiteSpace: 'pre-line'
                  }}>{listing.description}</p>
                </div>
              )}

              {listing.features.length > 0 && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <h2 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 600, 
                    marginBottom: '0.75rem',
                    color: '#111827'
                  }}>Features</h2>
                  <ul style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
                    gap: '0.75rem',
                    background: 'white',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    {listing.features.map((feature, index) => (
                      <li key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        color: '#4b5563',
                        fontSize: '0.9375rem'
                      }}>
                        <span style={{ 
                          width: '0.5rem', 
                          height: '0.5rem', 
                          backgroundColor: '#3b82f6', 
                          borderRadius: '9999px' 
                        }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {listing.phone_numbers.length > 0 && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <h2 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 600, 
                    marginBottom: '0.75rem',
                    color: '#111827'
                  }}>Contact</h2>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem',
                    background: 'white',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    {listing.phone_numbers.map((phone, index) => (
                      <a
                        key={index}
                        href={`tel:${phone}`}
                        style={{ 
                          color: '#3b82f6',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9375rem',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Map */}
            <div style={{ 
              borderRadius: '12px',
              height: '100%',
              width: '100%',
              minHeight: '400px'
            }}>
              <Map 
                address={listing.detailed_address} 
                key={listing.listingId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Updated Navigation Bar - More Compact */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.05)',
        height: '35px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '4px 16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          height: '100%'
        }}>
          <button
            onClick={() => handleNavigation('prev')}
            disabled={currentIndex === 0}
            style={{
              padding: '4px',
              borderRadius: '9999px',
              backgroundColor: '#f3f4f6',
              cursor: 'pointer',
              opacity: currentIndex === 0 ? 0.5 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            <ChevronLeft size={16} />
          </button>
          
          <div style={{ display: 'flex', gap: '6px' }}>
            {listings.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '9999px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: idx === currentIndex ? '#3b82f6' : '#f3f4f6',
                  color: idx === currentIndex ? 'white' : '#6b7280',
                  fontSize: '0.875rem'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleNavigation('next')}
            disabled={currentIndex === listings.length - 1}
            style={{
              padding: '4px',
              borderRadius: '9999px',
              backgroundColor: '#f3f4f6',
              cursor: 'pointer',
              opacity: currentIndex === listings.length - 1 ? 0.5 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingPage;