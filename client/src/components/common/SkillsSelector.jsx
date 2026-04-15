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
      <p className="text-sm text-bauhaus-black/60 mb-3 font-bold uppercase tracking-wider">
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
                inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold transition-all border-2
                ${isSelected
                  ? 'bg-bauhaus-blue text-white border-bauhaus-black shadow-hard-sm'
                  : disabled
                    ? 'bg-bauhaus-muted text-bauhaus-black/30 border-bauhaus-muted cursor-not-allowed'
                    : 'bg-white text-bauhaus-black border-bauhaus-black hover:bg-bauhaus-yellow/20'
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
