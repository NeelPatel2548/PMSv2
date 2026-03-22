import { X } from 'lucide-react';
import { SKILLS_LIST } from '../../utils/constants';

const SkillsSelector = ({ selected = [], onChange, maxSkills = 10, readOnly = false }) => {
  const sorted = [...SKILLS_LIST].sort();
  const isMaxed = selected.length >= maxSkills;

  const toggle = (skill) => {
    if (readOnly) return;
    if (selected.includes(skill)) {
      onChange(selected.filter(s => s !== skill));
    } else if (!isMaxed) {
      onChange([...selected, skill]);
    }
  };

  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">
        {readOnly ? `${selected.length} skill${selected.length !== 1 ? 's' : ''} selected` : `Select your skills (${selected.length}/${maxSkills})`}
      </p>
      <div className="flex flex-wrap gap-2">
        {sorted.map(skill => {
          const isSelected = selected.includes(skill);
          const disabled = !isSelected && isMaxed;
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggle(skill)}
              disabled={readOnly || disabled}
              title={disabled ? `Maximum ${maxSkills} skills selected` : ''}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : disabled
                    ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }
                ${readOnly ? 'cursor-default' : ''}
              `}
            >
              {skill}
              {isSelected && !readOnly && <X className="w-3 h-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsSelector;
