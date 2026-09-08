import React from 'react';

const ReefFish: React.FC<{ className?: string; color?: string }> = ({ className = '', color = '#38bdf8' }) => (
  <svg viewBox="0 0 180 92" className={`reef-real-fish ${className}`} aria-hidden="true">
    <defs><linearGradient id={`fish-${color.replace('#', '')}`} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity="0.55" /><stop offset="0.3" stopColor={color} /><stop offset="1" stopColor="#172554" /></linearGradient></defs>
    <path className="fish-tail" d="M35 46 L4 18 Q15 46 4 74 Z" fill={`url(#fish-${color.replace('#', '')})`} opacity="0.95" />
    <ellipse cx="92" cy="46" rx="62" ry="30" fill={`url(#fish-${color.replace('#', '')})`} stroke="#e0f2fe" strokeOpacity="0.35" strokeWidth="2" />
    <path d="M78 19 Q94 0 111 20 Q95 15 78 19 Z" fill={color} opacity="0.9" />
    <path d="M78 73 Q96 91 112 71 Q95 77 78 73 Z" fill="#172554" opacity="0.8" />
    <path d="M68 28 Q91 46 68 64" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.25" />
    <ellipse cx="104" cy="27" rx="25" ry="7" fill="#fff" opacity="0.22" transform="rotate(-12 104 27)" />
    <circle cx="130" cy="37" r="6" fill="#f8fafc" />
    <circle cx="132" cy="37" r="2.5" fill="#082f49" />
    <path d="M139 54 Q148 58 156 53" stroke="#082f49" strokeWidth="3" fill="none" opacity="0.55" />
  </svg>
);

const ReefJellyfish: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`reef-real-jelly reef-avatar-jelly ${className}`} aria-hidden="true">🪼</div>
);

const ReefSquid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 120 150" className={`reef-real-squid ${className}`} aria-hidden="true">
    <defs><linearGradient id="squid-gloss" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#f5d0fe" /><stop offset="0.4" stopColor="#c084fc" /><stop offset="1" stopColor="#701a75" /></linearGradient></defs>
    <path d="M60 8 Q96 18 91 65 Q86 94 60 102 Q34 94 29 65 Q24 18 60 8 Z" fill="url(#squid-gloss)" opacity="0.96" stroke="#f5d0fe" strokeWidth="2" />
    <path d="M42 20 Q60 6 78 20" stroke="#f5d0fe" strokeWidth="4" fill="none" opacity="0.65" />
    <circle cx="48" cy="52" r="5" fill="#fff" /><circle cx="72" cy="52" r="5" fill="#fff" />
    <circle cx="49" cy="53" r="2" fill="#312e81" /><circle cx="73" cy="53" r="2" fill="#312e81" />
    <ellipse cx="48" cy="27" rx="18" ry="6" fill="#fff" opacity="0.25" transform="rotate(-18 48 27)" />
    <path className="squid-tentacle" d="M37 88 Q18 112 28 143" stroke="#a855f7" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path className="squid-tentacle squid-tentacle-delay" d="M50 95 Q40 123 48 148" stroke="#d946ef" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path className="squid-tentacle" d="M70 95 Q80 123 72 148" stroke="#a855f7" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path className="squid-tentacle squid-tentacle-delay" d="M83 88 Q102 112 92 143" stroke="#d946ef" strokeWidth="7" fill="none" strokeLinecap="round" />
  </svg>
);

export const AquaticBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Deep Ocean Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080d1a] via-[#0c1427] to-[#060a14]" />

      {/* Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] bg-emerald-500/5 rounded-full blur-3xl" />

      {/* Playful underwater light rays and tiny reef details */}
      <div className="underwater-rays absolute inset-x-0 top-0 h-72" />
      <div className="reef-spark reef-spark-one absolute top-[22%] left-[22%]">✦</div>
      <div className="reef-spark reef-spark-two absolute top-[48%] right-[23%]">✧</div>
      <div className="reef-spark reef-spark-three absolute top-[68%] left-[72%]">✦</div>
      <div className="reef-bubble reef-bubble-one absolute top-[31%] left-[15%]">○</div>
      <div className="reef-bubble reef-bubble-two absolute top-[51%] left-[78%]">○</div>
      <div className="reef-bubble reef-bubble-three absolute top-[14%] left-[58%]">○</div>

      {/* Legacy illustration layer kept hidden while the reef scene renders below. */}
      <svg
        className="hidden"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Fish Shape 1 (Tuna/Marlin stream silhouette) */}
          <g id="fish-stream">
            <path
              d="M2,25 C22,4 70,0 105,22 C78,45 30,45 2,25 Z M104,22 L132,5 L122,24 L132,41 Z"
              fill="currentColor"
            />
            <path d="M44,13 Q57,-5 72,14 Q58,9 44,13 Z" fill="currentColor" opacity="0.8" />
            <path d="M43,35 Q56,48 71,34 Q58,39 43,35 Z" fill="currentColor" opacity="0.55" />
            <circle cx="87" cy="20" r="3.2" fill="#dffcff" opacity="0.9" />
            <circle cx="88" cy="20" r="1.3" fill="#07111f" />
            <path d="M12,25 Q24,27 34,25" stroke="#dffcff" strokeWidth="2" fill="none" opacity="0.45" />
          </g>

          {/* Fish Shape 2 (Small schooling fish) */}
          <g id="small-fish">
            <path
              d="M2,13 C12,1 34,-1 50,11 C36,25 13,24 2,13 Z M49,11 L64,2 L58,13 L64,23 Z"
              fill="currentColor"
            />
            <circle cx="40" cy="10" r="2" fill="#dffcff" opacity="0.9" />
            <path d="M15,5 Q23,-5 30,5" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8" />
          </g>

          {/* Jellyfish silhouette */}
          <g id="jellyfish">
            <path d="M8,40 Q40,-4 72,40 Q40,53 8,40 Z" fill="currentColor" />
            <path d="M18,35 Q40,22 62,35" stroke="#dffcff" strokeWidth="2" fill="none" opacity="0.55" />
            <circle cx="29" cy="28" r="3" fill="#dffcff" opacity="0.45" />
            <circle cx="51" cy="28" r="3" fill="#dffcff" opacity="0.45" />
            <path
              d="M20,40 Q15,70 25,90 M35,42 Q38,72 32,95 M50,42 Q48,72 55,95 M62,40 Q68,70 60,90"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>

          {/* Octopus silhouette */}
          <g id="octopus-bg">
            <path
              d="M25,35 C25,15 45,5 65,5 C85,5 105,15 105,35 C105,45 95,55 65,55 C35,55 25,45 25,35 Z"
              fill="currentColor"
            />
            {/* Curled tentacles */}
            <path
              d="M35,50 Q20,70 15,95 Q25,90 32,75 M50,52 Q42,80 40,105 Q50,95 52,75 M65,54 Q65,85 70,110 Q78,95 72,75 M80,52 Q88,80 92,105 Q82,95 80,75 M95,50 Q110,70 115,95 Q105,90 98,75"
              stroke="currentColor"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.8"
            />
            <circle cx="53" cy="29" r="4" fill="#dffcff" opacity="0.8" />
            <circle cx="79" cy="29" r="4" fill="#dffcff" opacity="0.8" />
            <circle cx="53" cy="29" r="1.5" fill="#07111f" />
            <circle cx="79" cy="29" r="1.5" fill="#07111f" />
            <path d="M61,39 Q66,43 71,39" stroke="#dffcff" strokeWidth="2" fill="none" opacity="0.55" />
          </g>

          {/* Manta ray */}
          <g id="manta-ray">
            <path
              d="M60,0 C85,25 120,40 130,50 C95,55 65,65 60,85 C55,65 25,55 -10,50 C0,40 35,25 60,0 Z"
              fill="currentColor"
            />
            <path
              d="M60,85 Q60,130 58,160"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            />
            <circle cx="42" cy="47" r="3" fill="#dffcff" opacity="0.75" />
            <circle cx="78" cy="47" r="3" fill="#dffcff" opacity="0.75" />
          </g>

          <g id="sea-turtle">
            <ellipse cx="48" cy="42" rx="32" ry="24" fill="currentColor" />
            <path d="M25,28 Q8,12 5,28 Q9,40 25,38 M71,28 Q88,12 91,28 Q87,40 71,38 M28,55 Q12,67 19,75 Q31,69 36,54 M68,55 Q84,67 77,75 Q65,69 60,54" fill="currentColor" opacity="0.9" />
            <circle cx="87" cy="40" r="12" fill="currentColor" />
            <circle cx="90" cy="37" r="2.5" fill="#dffcff" opacity="0.9" />
            <path d="M24,42 Q48,19 72,42 Q48,65 24,42 Z M48,19 V65 M24,42 H72" stroke="#dffcff" strokeWidth="1.5" fill="none" opacity="0.35" />
          </g>
        </defs>

        {/* Scattered background marine elements */}
        <g className="marine-drift marine-glow"><use href="#fish-stream" x="120" y="80" transform="scale(1.2)" /></g>
        <g className="marine-drift marine-drift-delay marine-glow"><use href="#small-fish" x="280" y="110" /></g>
        <g className="marine-drift marine-glow"><use href="#small-fish" x="320" y="130" transform="scale(0.85)" /></g>
        <g className="marine-drift marine-drift-delay marine-glow"><use href="#small-fish" x="300" y="90" transform="scale(0.9)" /></g>

        <g className="marine-float marine-glow"><use href="#octopus-bg" x="1100" y="120" transform="scale(1.1) rotate(5)" /></g>
        <g className="marine-float marine-float-delay marine-glow"><use href="#jellyfish" x="900" y="320" transform="scale(1.3)" /></g>
        <g className="marine-drift marine-glow"><use href="#manta-ray" x="450" y="480" transform="scale(0.9) rotate(-12)" /></g>

        <g className="marine-drift marine-drift-delay marine-glow"><use href="#fish-stream" x="780" y="650" transform="scale(1.4) scale(-1, 1) translate(-100, 0)" /></g>
        <g className="marine-drift marine-glow"><use href="#small-fish" x="650" y="680" transform="scale(-0.9, 0.9) translate(-50, 0)" /></g>
        <g className="marine-drift marine-drift-delay marine-glow"><use href="#small-fish" x="690" y="710" transform="scale(-0.8, 0.8) translate(-50, 0)" /></g>

        <g className="marine-float marine-glow"><use href="#jellyfish" x="180" y="580" transform="scale(1.1)" /></g>
        <g className="marine-float marine-float-delay marine-glow"><use href="#sea-turtle" x="1020" y="520" transform="scale(0.9) rotate(-8)" /></g>
        <g className="marine-drift marine-drift-delay marine-glow"><use href="#fish-stream" x="1180" y="700" transform="scale(1)" /></g>
      </svg>

      {/* Cute coral reef ecosystem */}
      <div className="reef-floor absolute inset-x-0 bottom-0 h-56 sm:h-72">
        <div className="reef-sand absolute inset-x-0 bottom-0 h-10" />
        <div className="reef-coral reef-coral-pink absolute bottom-5 left-[8%]">🪸</div>
        <div className="reef-coral reef-coral-orange absolute bottom-4 left-[18%]">🪸</div>
        <div className="reef-coral reef-coral-yellow absolute bottom-3 left-[29%]">🪸</div>
        <div className="reef-coral reef-coral-teal reef-coral-small absolute bottom-3 left-[38%]">🪸</div>
        <div className="reef-coral reef-coral-purple absolute bottom-5 right-[18%]">🪸</div>
        <div className="reef-coral reef-coral-blue absolute bottom-4 right-[29%]">🪸</div>
        <div className="reef-coral reef-coral-pink reef-coral-small absolute bottom-3 right-[38%]">🪸</div>
        <div className="reef-coral reef-coral-teal absolute bottom-4 right-[7%]">🪸</div>
        <div className="reef-seaweed absolute bottom-7 left-[31%]">〰</div>
        <div className="reef-seaweed reef-seaweed-alt absolute bottom-7 right-[34%]">〰</div>
        <div className="reef-seaweed reef-seaweed-third absolute bottom-7 left-[52%]">〰</div>
        <div className="reef-pebble absolute bottom-3 left-[43%]">•</div>
        <div className="reef-pebble absolute bottom-4 left-[56%]">•</div>
      </div>

      <ReefFish className="reef-fish-one absolute top-[24%] left-[9%]" color="#22d3ee" />
      <ReefFish className="reef-fish-two absolute top-[40%] right-[12%]" color="#2dd4bf" />
      <ReefFish className="reef-fish-three absolute top-[58%] left-[48%]" color="#facc15" />
      <ReefFish className="reef-fish-four absolute top-[32%] left-[58%]" color="#f472b6" />
      <div className="reef-life reef-whale absolute top-[13%] left-[38%]">🐳</div>
      <ReefFish className="reef-fish-five absolute top-[68%] left-[27%]" color="#60a5fa" />
      <ReefFish className="reef-fish-six absolute top-[28%] right-[43%]" color="#c084fc" />
      <ReefJellyfish className="reef-jelly absolute top-[18%] right-[29%]" />
      <ReefJellyfish className="reef-jelly-two absolute top-[54%] right-[6%]" />
      <ReefJellyfish className="reef-jelly-three absolute top-[36%] left-[28%]" />
      <ReefJellyfish className="reef-jelly-four absolute top-[66%] right-[36%]" />
      <ReefJellyfish className="reef-jelly-five absolute top-[72%] left-[6%]" />
      <ReefJellyfish className="reef-jelly-six absolute top-[27%] right-[7%]" />
      <ReefJellyfish className="reef-jelly-seven absolute top-[61%] left-[72%]" />
      <ReefJellyfish className="reef-jelly-eight absolute top-[10%] left-[14%]" />
      <ReefJellyfish className="reef-jelly-nine absolute top-[78%] left-[55%]" />
      <div className="reef-life reef-octopus absolute bottom-24 left-[39%]">🐙</div>
      <ReefSquid className="reef-squid-school squid-school-one absolute top-[33%] left-[62%]" />
      <ReefSquid className="reef-squid-school squid-school-two absolute top-[38%] left-[67%]" />
      <ReefSquid className="reef-squid-school squid-school-three absolute top-[43%] left-[64%]" />
      <ReefSquid className="reef-squid-school squid-school-four absolute top-[37%] left-[72%]" />
      <div className="reef-life reef-crab absolute bottom-12 left-[23%]">🦀</div>
      <div className="reef-life reef-turtle absolute bottom-14 right-[42%]">🐢</div>

      {/* Floating Underwater Bubbles */}
      <div className="absolute left-[15%] bottom-10 w-3 h-3 rounded-full border border-cyan-400/20 bg-cyan-400/5 animate-pulse" />
      <div className="absolute left-[35%] bottom-28 w-2 h-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 animate-pulse delay-300" />
      <div className="absolute left-[65%] bottom-16 w-4 h-4 rounded-full border border-cyan-400/20 bg-cyan-400/5 animate-pulse delay-700" />
      <div className="absolute left-[85%] bottom-36 w-2.5 h-2.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 animate-pulse delay-500" />
    </div>
  );
};
