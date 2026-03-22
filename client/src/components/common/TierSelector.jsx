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
    color: 'slate',
  },
  {
    value: 'mass_recruiter',
    label: 'Mass Recruiter',
    description: 'Open recruitment — all eligible students can apply regardless of other placements.',
    color: 'green',
  },
];

const colorMap = {
  blue: {
    active: 'bg-blue-600 text-white border-blue-600 shadow-blue-200',
    inactive: 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50',
  },
  slate: {
    active: 'bg-slate-700 text-white border-slate-700 shadow-slate-200',
    inactive: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
  },
  green: {
    active: 'bg-green-600 text-white border-green-600 shadow-green-200',
    inactive: 'bg-white text-green-700 border-green-200 hover:bg-green-50',
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
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 flex items-center gap-1.5 ${
                isSelected
                  ? `${colors.active} shadow-md`
                  : `${colors.inactive} ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
              }`}
            >
              {isSelected && <CheckCircle className="w-4 h-4" />}
              {tier.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
        {selectedTier.description}
      </p>
    </div>
  );
};

export default TierSelector;

// Helper for formatting tier display across the app
export const formatTier = (tier) => {
  const map = {
    tier1: { label: 'Tier 1', classes: 'bg-blue-100 text-blue-700' },
    tier2: { label: 'Tier 2', classes: 'bg-slate-100 text-slate-600' },
    mass_recruiter: { label: 'Mass Recruiter', classes: 'bg-green-100 text-green-700' },
  };
  return map[tier] || { label: tier || 'Tier 2', classes: 'bg-slate-100 text-slate-600' };
};
