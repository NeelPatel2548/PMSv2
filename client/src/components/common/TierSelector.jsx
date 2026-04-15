import { CheckCircle } from 'lucide-react';

const TIERS = [
  {
    value: 'tier1',
    label: 'Tier 1',
    description: 'Premium companies — typically offer packages above 10 LPA. Students already placed in Tier 2 may also be eligible.',
    color: 'blue',
  },
  {
    value: 'tier2',
    label: 'Tier 2',
    description: 'Standard companies — good packages and career growth opportunities.',
    color: 'black',
  },
  {
    value: 'mass_recruiter',
    label: 'Mass Recruiter',
    description: 'Open recruitment — all eligible students can apply regardless of other placements.',
    color: 'yellow',
  },
];

const colorMap = {
  blue: {
    active: 'bg-bauhaus-blue text-white border-bauhaus-black shadow-hard-sm',
    inactive: 'bg-white text-bauhaus-blue border-bauhaus-black hover:bg-bauhaus-blue/10',
  },
  black: {
    active: 'bg-bauhaus-black text-white border-bauhaus-black shadow-hard-sm',
    inactive: 'bg-white text-bauhaus-black border-bauhaus-black hover:bg-bauhaus-muted',
  },
  yellow: {
    active: 'bg-bauhaus-yellow text-bauhaus-black border-bauhaus-black shadow-hard-sm',
    inactive: 'bg-white text-bauhaus-black border-bauhaus-black hover:bg-bauhaus-yellow/10',
  },
};

const TierSelector = ({ selected, onChange, readOnly = false }) => {
  const selectedTier = TIERS.find(t => t.value === selected) || TIERS[1];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {TIERS.map(tier => {
          const isSelected = selected === tier.value;
          const colors = colorMap[tier.color];

          return (
            <button
              key={tier.value}
              type="button"
              onClick={() => !readOnly && onChange(tier.value)}
              disabled={readOnly}
              className={`px-4 py-2 text-sm font-bold border-2 transition-all duration-200 flex items-center gap-1.5 uppercase tracking-wider ${
                isSelected
                  ? colors.active
                  : `${colors.inactive} ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
              }`}
            >
              {isSelected && <CheckCircle className="w-4 h-4" />}
              {tier.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-bauhaus-black/60 leading-relaxed bg-bauhaus-muted px-3 py-2 border-2 border-bauhaus-black font-medium">
        {selectedTier.description}
      </p>
    </div>
  );
};

export default TierSelector;

// Helper for formatting tier display across the app
export const formatTier = (tier) => {
  const map = {
    tier1: { label: 'Tier 1', classes: 'bg-bauhaus-blue text-white border-2 border-bauhaus-black' },
    tier2: { label: 'Tier 2', classes: 'bg-bauhaus-muted text-bauhaus-black border-2 border-bauhaus-black' },
    mass_recruiter: { label: 'Mass Recruiter', classes: 'bg-bauhaus-yellow text-bauhaus-black border-2 border-bauhaus-black' },
  };
  return map[tier] || { label: tier || 'Tier 2', classes: 'bg-bauhaus-muted text-bauhaus-black border-2 border-bauhaus-black' };
};
