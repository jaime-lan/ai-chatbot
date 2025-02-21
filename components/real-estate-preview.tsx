import { HomeIcon } from '@/components/icons';

interface RealEstateResult {
  detailed_address: string;
  price: number;
  phone_numbers: string[];
  url: string;
  images: string[];
  features: string[];
  description: string;
}

export function RealEstatePreview({ results }: { results: RealEstateResult[] }) {
  return (
    <div className="flex flex-col gap-2">
      {results.map((property, i) => (
        <div 
          key={i}
          className={`flex items-center gap-3 p-2 rounded-lg border text-foreground ${
            (() => {
              if (i === 0) return 'border-emerald-500/50 bg-emerald-50/50'
              if (i === 1) return 'border-blue-500/50 bg-blue-50/50'
              if (i === 2) return 'border-amber-500/50 bg-amber-50/50'
              return 'border-gray-200 bg-gray-50/50'
            })()
          }`}
        >
          <div className="flex items-center justify-center size-10 bg-muted rounded-md shrink-0">
            {property.images[0] ? (
              <img 
                src={property.images[0]} 
                alt={property.detailed_address}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <HomeIcon size={16} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">
              {property.detailed_address}
            </h3>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p className="truncate">{property.features.join(' • ')}</p>
              <p className="font-medium">${property.price.toLocaleString()}</p>
              {property.phone_numbers.length > 0 && (
                <p className="text-xs">{property.phone_numbers.join(' • ')}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 