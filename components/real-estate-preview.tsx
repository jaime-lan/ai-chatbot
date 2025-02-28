import { HomeIcon } from '@/components/icons';
import { useEffect, useState, CSSProperties } from 'react';

interface RealEstateResult {
  listingId: number;
  detailed_address: string;
  price: number;
  phone_numbers: string[];
  url: string;
  images: string[];
  features: string[];
  description: string;
}

export function RealEstatePreview({ results }: { results: RealEstateResult[] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getCardStyle = (index: number): CSSProperties => {
    const baseStyle: CSSProperties = {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: '12px',
      padding: '8px',
      borderRadius: '8px',
      border: '1px solid',
      width: '100%',
    };

    if (index === 0) return { ...baseStyle, borderColor: 'rgba(16, 185, 129, 0.5)', backgroundColor: 'rgba(16, 185, 129, 0.05)' };
    if (index === 1) return { ...baseStyle, borderColor: 'rgba(59, 130, 246, 0.5)', backgroundColor: 'rgba(59, 130, 246, 0.05)' };
    if (index === 2) return { ...baseStyle, borderColor: 'rgba(245, 158, 11, 0.5)', backgroundColor: 'rgba(245, 158, 11, 0.05)' };
    return { ...baseStyle, borderColor: 'rgb(229, 231, 235)', backgroundColor: 'rgba(249, 250, 251, 0.5)' };
  };

  const getBadgeStyle = (index: number): CSSProperties => {
    const baseStyle: CSSProperties = {
      padding: '4px 12px',
      fontSize: '14px',
      fontWeight: 500,
      borderRadius: '6px',
      whiteSpace: 'nowrap',
    };

    if (index === 0) return { ...baseStyle, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'rgb(4, 120, 87)' };
    if (index === 1) return { ...baseStyle, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'rgb(29, 78, 216)' };
    if (index === 2) return { ...baseStyle, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'rgb(180, 83, 9)' };
    return { ...baseStyle, backgroundColor: 'rgb(243, 244, 246)', color: 'rgb(55, 65, 81)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {results.map((property, i) => (
        <div key={i} style={getCardStyle(i)}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgb(243, 244, 246)',
            borderRadius: '6px',
            flexShrink: 0
          }}>
            {property.images[0] ? (
              <img 
                src={property.images[0]} 
                alt={property.detailed_address}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '6px'
                }}
              />
            ) : (
              <HomeIcon size={16} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? '8px' : '0'
            }}>
              <h3 style={{
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: isMobile ? '100%' : '70%'
              }}>
                {property.detailed_address}
              </h3>
              <span style={getBadgeStyle(i)}>
                ID: {property.listingId}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: 'rgb(107, 114, 128)', marginTop: '4px' }}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {property.features.join(' • ')}
              </p>
              <p style={{ fontWeight: 500, marginTop: '2px' }}>
                {property.price === 0 ? 'Cijena na upit' : `$${property.price.toLocaleString()}`}
              </p>
              {property.phone_numbers.length > 0 && (
                <p style={{ 
                  fontSize: '12px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginTop: '2px'
                }}>
                  {property.phone_numbers.join(' • ')}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 