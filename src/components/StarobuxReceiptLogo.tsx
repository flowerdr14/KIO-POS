import React from 'react';

export const StarobuxReceiptLogo: React.FC<{ size?: number; className?: string }> = ({ 
  size = 72, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Circular Badge with Drink Illustration */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-slate-400 stroke-current"
      >
        {/* Outer Circular Ring */}
        <circle cx="50" cy="50" r="46" strokeWidth="2.5" className="stroke-slate-300 fill-slate-50/50" />
        <circle cx="50" cy="50" r="43" strokeWidth="0.8" strokeDasharray="2 2" className="stroke-slate-300" />

        {/* Straw */}
        <path
          d="M 52 28 L 59 10 L 64 12 L 56 29"
          fill="#cbd5e1"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />

        {/* Whipped Cream / Foam Dome */}
        <path
          d="M 33 42 C 31 34, 40 24, 50 24 C 60 24, 69 34, 67 42 Z"
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
        {/* Whipped Cream Swirls */}
        <path
          d="M 40 34 C 44 28, 54 28, 58 35"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M 36 39 C 42 35, 52 35, 62 40"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Cup Rim / Lid Base */}
        <rect
          x="30"
          y="41"
          width="40"
          height="4.5"
          rx="2"
          fill="#e2e8f0"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />

        {/* Cup Body (Tapered) */}
        <path
          d="M 33 45.5 L 38 82 C 38.5 84, 40 85, 42 85 L 58 85 C 60 85, 61.5 84, 62 82 L 67 45.5 Z"
          fill="#f1f5f9"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

        {/* Beverage Wave / Liquid Level */}
        <path
          d="M 35 56 Q 42 53, 50 56 T 65 56 L 62 82 L 38 82 Z"
          fill="#e2e8f0"
          opacity="0.8"
        />

        {/* Ice Cubes inside cup */}
        <rect x="42" y="60" width="7" height="7" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" transform="rotate(12 45 63)" />
        <rect x="52" y="66" width="6" height="6" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" transform="rotate(-8 55 69)" />

        {/* Hanging Star Charm from cup side */}
        <path d="M 34 50 L 27 60" stroke="#94a3b8" strokeWidth="1" strokeDasharray="1 1" />
        <polygon
          points="27,57 28.5,60 31.5,60.5 29,62.5 30,65.5 27,63.8 24,65.5 25,62.5 22.5,60.5 25.5,60"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="0.8"
        />

        {/* Sparkles / Stars around cup */}
        <path d="M 23 28 Q 25 31, 28 31 Q 25 31, 23 34 Q 25 31, 23 28 Z" fill="#94a3b8" />
        <path d="M 73 26 Q 74.5 28, 77 28 Q 74.5 28, 73 30 Q 74.5 28, 73 26 Z" fill="#94a3b8" />
        <circle cx="21" cy="40" r="1" fill="#94a3b8" />
        <circle cx="78" cy="38" r="1.2" fill="#94a3b8" />
        <circle cx="75" cy="54" r="1" fill="#94a3b8" />
      </svg>

      {/* Brand Text below Circle */}
      <span className="text-[12px] font-black tracking-[0.2em] text-slate-400 mt-1 uppercase font-sans">
        STAROBUX
      </span>
    </div>
  );
};
