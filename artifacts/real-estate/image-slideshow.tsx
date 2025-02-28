import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageSlideshowProps {
  images: string[];
}

export const ImageSlideshow = ({ images }: ImageSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
    setPreviewIndex(0);
    setShowPreview(false);
    setFailedImages(new Set());
  }, [images]);

  const handleImageError = (key: string) => {
    setFailedImages(prev => new Set([...prev, key]));
  };

  const renderImage = (src: string, alt: string, key: string, style: CSSProperties, index: number) => {
    if (failedImages.has(key) || !src) {
      return (
        <div style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          borderRadius: '12px',
          width: '100%',
          height: '100%'
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          openPreview(index);
        }}
        >
          {alt}
        </div>
      );
    }

    return (
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px'
      }}>
        <img
          src={src}
          alt={alt}
          style={{
            ...style,
            position: 'absolute',
            top: 0,
            left: 0
          }}
          onClick={(e: React.MouseEvent<HTMLImageElement>) => {
            e.stopPropagation();
            openPreview(index);
          }}
          onError={() => handleImageError(key)}
        />
      </div>
    );
  };

  const nextImage = () => setPreviewIndex((i) => (i + 1) % images.length);
  const prevImage = () => setPreviewIndex((i) => (i - 1 + images.length) % images.length);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setShowPreview(false);
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  }, [nextImage, prevImage]);

  useEffect(() => {
    if (showPreview) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [showPreview, handleKeyPress]);

  const openPreview = (index: number) => {
    if (images && images.length > 0) {
      setPreviewIndex(index);
      setShowPreview(true);
    }
  };

  const containerStyle: CSSProperties = {
    width: '100%',
    position: 'relative',
    height: '100%'
  };

  const galleryContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: '8px',
    height: isMobile ? 'auto' : '400px', // Set a fixed height for non-mobile
    padding: '0'
  };

  const mainImageStyle: CSSProperties = {
    width: isMobile ? '100%' : '50%',
    height: isMobile ? '300px' : '100%',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden'
  };

  const gridContainerStyle: CSSProperties = {
    display: isMobile ? 'none' : 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '8px',
    width: '50%',
    height: '100%'
  };

  const gridItemStyle: CSSProperties = {
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%'
  };

  const mobileIndicatorsStyle: CSSProperties = {
    display: isMobile ? 'flex' : 'none',
    justifyContent: 'center',
    gap: '4px',
    marginTop: '8px',
    position: 'absolute',
    bottom: '16px',
    left: '0',
    right: '0',
    zIndex: 10
  };

  const indicatorStyle = (isActive: boolean): CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.7)',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  const previewOverlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50
  };

  const previewContainerStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: isMobile ? '48px 16px' : '48px',
    pointerEvents: 'none'
  };

  const previewButtonStyle: CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50%',
    padding: '12px',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    pointerEvents: 'auto'
  };

  const imageStyle = (isPreview: boolean = false): CSSProperties => ({
    width: '100%',
    height: '100%',
    objectFit: isPreview ? 'contain' : 'cover',
    cursor: 'pointer',
    pointerEvents: 'auto'
  });

  return (
    <div style={containerStyle}>
      <div style={galleryContainerStyle}>
        {/* Main large image - left side */}
        <div style={mainImageStyle}>
          {renderImage(
            images?.[currentIndex] || '',
            "Main property view",
            `main-${currentIndex}`,
            imageStyle(),
            currentIndex
          )}
          {/* Mobile indicators */}
          {isMobile && (
            <div style={mobileIndicatorsStyle}>
              {images?.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={indicatorStyle(idx === currentIndex)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right side 2x2 grid */}
        <div style={gridContainerStyle}>
          {[1, 2, 3].map((offset) => (
            <div key={`grid-${offset}`} style={gridItemStyle}>
              {renderImage(
                images?.[currentIndex + offset],
                `Property view ${offset + 1}`,
                `thumb-${currentIndex}-${offset}`,
                imageStyle(),
                currentIndex + offset
              )}
            </div>
          ))}
          {/* Last image with overlay */}
          <div 
            style={gridItemStyle}
            onClick={images?.length ? () => openPreview(currentIndex + 4) : undefined}
          >
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              {renderImage(
                images?.[currentIndex + 4],
                "Property view 4",
                `last-${currentIndex}`,
                {
                  ...imageStyle(),
                  filter: images?.length > 5 ? 'brightness(0.5)' : 'none'
                },
                currentIndex + 4
              )}
              
              {/* Only show overlay if there are actually more images */}
              {images && images.length > 5 && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 2
                }}>
                  +{images.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full screen preview */}
      {showPreview && images && images.length > 0 && (
        <div 
          onClick={() => setShowPreview(false)}
          style={previewOverlayStyle}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={previewContainerStyle}
          >
            {renderImage(
              images[previewIndex],
              "Preview",
              `preview-${previewIndex}`,
              imageStyle(true),
              previewIndex
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            style={{
              ...previewButtonStyle,
              position: 'absolute',
              left: isMobile ? '16px' : '5vw'
            }}
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            style={{
              ...previewButtonStyle,
              position: 'absolute',
              right: isMobile ? '16px' : '5vw'
            }}
          >
            <ChevronRight size={24} />
          </button>

          <button
            onClick={() => setShowPreview(false)}
            style={{
              ...previewButtonStyle,
              position: 'absolute',
              top: '16px',
              right: '16px'
            }}
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSlideshow;