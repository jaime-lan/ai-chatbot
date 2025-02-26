import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageSlideshowProps {
  images: string[];
}

export const ImageSlideshow = ({ images }: ImageSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCurrentIndex(0);
    setPreviewIndex(0);
    setShowPreview(false);
    setFailedImages(new Set());
  }, [images]);

  const handleImageError = (key: string) => {
    setFailedImages(prev => new Set([...prev, key]));
  };

  const renderImage = (src: string, alt: string, key: string, style: React.CSSProperties, index: number) => {
    if (failedImages.has(key) || !src) {
      return (
        <div style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          borderRadius: '12px'
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
      <img
        src={src}
        alt={alt}
        style={style}
        onClick={(e: React.MouseEvent<HTMLImageElement>) => {
          e.stopPropagation();
          openPreview(index);
        }}
        onError={() => handleImageError(key)}
      />
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

  // When opening preview, set initial preview index
  const openPreview = (index: number) => {
    // Only open preview if there are images
    if (images && images.length > 0) {
      setPreviewIndex(index);
      setShowPreview(true);
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '16px', padding: '16px', height: '50%' }}>
        {/* Main large image - left side */}
        <div style={{ 
          width: '50%',
          backgroundColor: '#f3f4f6',
          borderRadius: '12px',
          position: 'relative'
        }}>
          {renderImage(
            images?.[currentIndex] || '',
            "Main property view",
            `main-${currentIndex}`,
            {
              width: '100%',
              height: '400px',
              objectFit: 'cover',
              borderRadius: '12px',
              cursor: images?.length ? 'pointer' : 'default'
            },
            currentIndex
          )}
        </div>

        {/* Right side 2x2 grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gridTemplateRows: '1fr 1fr',
          gap: '8px', 
          width: '50%',
          height: '400px'
        }}>
          {[0, 1, 2].map((offset) => (
            <div key={`grid-${offset}`} style={{ 
              height: '196px',
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              position: 'relative'
            }}>
              {renderImage(
                images?.[currentIndex + offset] || '',
                `Property view ${offset + 1}`,
                `thumb-${currentIndex}-${offset}`,
                {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  cursor: images?.length ? 'pointer' : 'default'
                },
                currentIndex + offset
              )}
            </div>
          ))}
          {/* Last image with overlay */}
          <div style={{ 
            height: '196px', 
            position: 'relative',
            backgroundColor: '#f3f4f6',
            borderRadius: '12px'
          }} onClick={images?.length ? (e: React.MouseEvent<HTMLDivElement>) => openPreview((currentIndex + 4) % (images?.length || 1)) : undefined}>
            {renderImage(
              images?.[(currentIndex + 4) % (images?.length || 1)] || '',
              "Property view 4",
              `last-${currentIndex}`,
              {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '12px',
                filter: 'brightness(0.5)',
                cursor: images?.length ? 'pointer' : 'default'
              },
              (currentIndex + 4) % (images?.length || 1)
            )}
            {/* Only show overlay if there are actually more images */}
            {images && images.length > (currentIndex + 5) && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                +{images.length - (currentIndex + 5)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full screen preview */}
      {showPreview && images && images.length > 0 && (
        <div 
          onClick={() => setShowPreview(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
        >
          {/* Stop propagation to prevent closing when clicking the image */}
          <div onClick={e => e.stopPropagation()}>
            {renderImage(
              images[previewIndex],
              "Preview",
              `preview-${previewIndex}`,
              {
                maxHeight: '90vh',
                maxWidth: '90vw',
                objectFit: 'contain'
              },
              previewIndex
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            style={{
              position: 'absolute',
              left: '24px',
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: '12px',
              cursor: 'pointer',
              border: 'none'
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
              position: 'absolute',
              right: '24px',
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: '12px',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSlideshow;