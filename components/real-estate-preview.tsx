import { HomeIcon } from '@/components/icons';

interface RealEstateResult {
  title: string;
  price: string;
  location: string;
  features: string[];
  description: string;
  externalUrl?: string;
  score: number;
}

// Helper function to get color based on score
const getScoreColor = (score: number) => {
  const normalizedScore = score / 100;  // Convert 0-100 to 0-1
  if (normalizedScore >= 0.95) return "bg-emerald-500/20 text-emerald-700";
  if (normalizedScore >= 0.90) return "bg-green-500/20 text-green-700";
  if (normalizedScore >= 0.85) return "bg-teal-500/20 text-teal-700";
  if (normalizedScore >= 0.80) return "bg-blue-500/20 text-blue-700";
  if (normalizedScore >= 0.75) return "bg-cyan-500/20 text-cyan-700";
  if (normalizedScore >= 0.70) return "bg-sky-500/20 text-sky-700";
  if (normalizedScore >= 0.65) return "bg-indigo-500/20 text-indigo-700";
  if (normalizedScore >= 0.60) return "bg-violet-500/20 text-violet-700";
  if (normalizedScore >= 0.55) return "bg-purple-500/20 text-purple-700";
  if (normalizedScore >= 0.50) return "bg-yellow-500/20 text-yellow-700";
  if (normalizedScore >= 0.45) return "bg-amber-500/20 text-amber-700";
  if (normalizedScore >= 0.40) return "bg-orange-500/20 text-orange-700";
  if (normalizedScore >= 0.35) return "bg-red-500/20 text-red-700";
  if (normalizedScore >= 0.30) return "bg-rose-500/20 text-rose-700";
  return "bg-pink-500/20 text-pink-700";
};

export function RealEstatePreview({ results }: { results: RealEstateResult[] }) {
  return (
    <div className="flex flex-col gap-2">
      {results.map((property, i) => (
        <div 
          key={i} 
          className="flex items-center gap-3 p-2 rounded-lg border bg-card text-card-foreground"
        >
          <div className="flex items-center justify-center size-10 bg-muted rounded-md shrink-0">
            <HomeIcon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{property.title}</h3>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p className="truncate">{property.location}</p>
              <p className="truncate text-xs">{property.description}</p>
              <p className="font-medium">{property.price}</p>
            </div>
          </div>
          <div className={`flex flex-col items-center justify-center size-14 rounded-full shrink-0 ${getScoreColor(property.score)}`}>
            <span className="text-sm font-semibold">{Math.round(property.score)}</span>
          </div>
        </div>
      ))}
    </div>
  );
} 