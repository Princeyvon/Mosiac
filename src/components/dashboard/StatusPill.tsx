import React from 'react';

interface StatusPillProps {
  active: boolean;
  activeLabel: string;
  inactiveLabel?: string;
  onClick: (e: React.MouseEvent) => void;
  title?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  active,
  activeLabel,
  inactiveLabel,
  onClick,
  title
}) => {
  const label = active ? activeLabel : (inactiveLabel || activeLabel);

  return (
    <button
      type="button"
      onClick={onClick}
      title={title || label}
      className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full border transition-all duration-150 select-none whitespace-nowrap focus:outline-none ${
        active
          ? 'bg-black text-white border-black hover:bg-neutral-800'
          : 'bg-white text-neutral-500 border-neutral-300 hover:border-black hover:text-black'
      }`}
    >
      {label}
    </button>
  );
};
