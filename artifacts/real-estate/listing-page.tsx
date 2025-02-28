import { useState, useEffect, CSSProperties } from 'react';
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
    publish_date: string;
    seen: number;
    source: string;
  }>;
}

export const ListingPage = ({ listings }: ListingPageProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkResponsive = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 768);
    };
    
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'next' && currentIndex < listings.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const listing = listings[currentIndex];
  if (!listing) return null;

  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    paddingBottom: '48px',
    display: 'flex',
    flexDirection: 'column'
  };

  const contentStyle: CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    height: isTablet ? 'auto' : 'calc(100vh - 48px)', // Make height auto on tablet/mobile
    position: 'relative'
  };
  
  const imageGalleryStyle: CSSProperties = {
    height: isTablet ? '35%' : '45%',
    width: '100%',
    minHeight: isTablet ? '250px' : '300px',
    padding: '0 16px',  // Match padding with content area
    marginBottom: isTablet ? '50px' : '10px' // Add bottom margin on tablet/mobile
  };
  
  const contentAreaStyle: CSSProperties = {
    height: isTablet ? 'auto' : '55%',
    overflowY: 'auto',
    position: 'relative',
    marginTop: isTablet ? '0' : '10%',
    display: 'flex',
    flexDirection: isTablet ? 'column' : 'row', // This already looks correct
    gap: '16px',
    padding: '0 16px'
  };

  const columnStyle: CSSProperties = {
    flex: 1,
    width: isTablet ? '100%' : '50%',
    marginBottom: isTablet ? '16px' : '0' // Add bottom margin on tablet/mobile to separate columns
  };

  const cardStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb'
  };

  const navigationBarStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTop: '1px solid #e5e7eb',
    boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.05)',
    height: '35px',
    zIndex: 1000
  };

  const navigationContentStyle: CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? '4px 8px' : '4px 16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: isMobile ? '6px' : '10px',
    height: '100%'
  };

  const navButtonStyle: CSSProperties = {
    padding: '4px',
    borderRadius: '9999px',
    backgroundColor: '#f3f4f6',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const mapContainerStyle: CSSProperties = {
    width: isTablet ? '100%' : '50%',
    borderRadius: '12px',
    height: isTablet ? '300px' : '100%', // Ensure full height on desktop, fixed height on mobile
    minHeight: '300px', // Ensure minimum height on all devices
    display: 'block',
    marginTop: isTablet ? '16px' : '0',
    marginBottom: isTablet ? '16px' : '0',
    position: 'relative', // Add this to ensure proper positioning
    overflow: 'hidden' // This helps ensure the map container doesn't overflow
  };
  

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Top Half - Image Gallery */}
        <div style={imageGalleryStyle}>
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
        <div style={contentAreaStyle}>
          {/* Left Column - Description */}
          <div style={columnStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: isMobile ? '8px' : '0'
              }}>
                <div style={{
                  ...cardStyle,
                  flex: 1,
                  marginRight: isMobile ? '0' : '16px',
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <h1 style={{ 
                    fontSize: isMobile ? '1.25rem' : '1.675rem',
                    fontWeight: 500,
                    marginBottom: '8px',
                    lineHeight: 1.2,
                    color: '#111827'
                  }}>
                    {listing.detailed_address}
                  </h1>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    letterSpacing: '0.025em'
                  }}>
                    <span style={{ color: '#6b7280', fontWeight: 400 }}>ID:</span>
                    <span style={{ color: '#4b5563', fontWeight: 600 }}>{listing.listingId}</span>
                  </div>
                </div>

                <div style={{
                  ...cardStyle,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  minWidth: isMobile ? '100%' : '200px'
                }}>
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    color: '#111827',
                    textAlign: 'center'
                  }}>
                    {listing.price === 0 ? 'Cijena na upit' : `${listing.price.toLocaleString('en-US')}€`}
                  </p>
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#3b82f6',
                      fontSize: '14px',
                      textDecoration: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s'
                    }}
                  >
                    View listing
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {listing.description && (
                <div style={cardStyle}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    marginBottom: '12px',
                    color: '#111827'
                  }}>
                    Description
                  </h2>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: 1.6,
                    fontSize: '0.9375rem',
                    whiteSpace: 'pre-line'
                  }}>
                    {listing.description}
                  </p>
                  <div style={{
                    marginTop: '16px',
                    display: 'flex',
                    gap: '16px',
                    fontSize: '14px',
                    color: '#6b7280',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Published:</span>
                      <span style={{ color: '#4b5563', fontWeight: 500 }}>{listing.publish_date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Views:</span>
                      <span style={{ color: '#4b5563', fontWeight: 500 }}>{listing.seen == 0 ? 'N/A' : listing.seen}</span>
                    </div>
                  </div>
                </div>
              )}

              {listing.features.length > 0 && (
                <div style={cardStyle}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    marginBottom: '12px',
                    color: '#111827'
                  }}>
                    Features
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: '12px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {listing.features.map((feature, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#4b5563',
                        fontSize: '0.9375rem'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          backgroundColor: '#3b82f6',
                          borderRadius: '9999px'
                        }} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '8px',
                width: '100%'
              }}>
                {listing.phone_numbers.length > 0 && (
                  <div style={{ ...cardStyle, flex: 1 }}>
                    <h2 style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      marginBottom: '12px',
                      color: '#111827'
                    }}>
                      Contact
                    </h2>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px',
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
                            gap: '8px',
                            fontSize: '0.9375rem'
                          }}
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {listing.source && (
                  <div style={{ ...cardStyle, flex: 1 }}>
                    <h2 style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      marginBottom: '12px',
                      color: '#111827'
                    }}>
                      Source
                    </h2>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <a
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#3b82f6',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.9375rem'
                        }}
                      >
                        {listing.source}
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div style={mapContainerStyle}>
            <Map 
              address={listing.detailed_address} 
              key={listing.listingId}
              containerId="map-container"
            />
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div style={navigationBarStyle}>
        <div style={navigationContentStyle}>
          <button
            onClick={() => handleNavigation('prev')}
            disabled={currentIndex === 0}
            style={{
              ...navButtonStyle,
              opacity: currentIndex === 0 ? 0.5 : 1
            }}
          >
            <ChevronLeft size={16} />
          </button>
          
          <div style={{ display: 'flex', gap: isMobile ? '4px' : '6px' }}>
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
                  border: 'none',
                  transition: 'background-color 0.2s',
                  backgroundColor: idx === currentIndex ? '#3b82f6' : '#f3f4f6',
                  color: idx === currentIndex ? 'white' : '#6b7280',
                  fontSize: '14px'
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
              ...navButtonStyle,
              opacity: currentIndex === listings.length - 1 ? 0.5 : 1
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