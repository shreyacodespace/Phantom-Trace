// Hand-drawn style doodles. Decorative only, hidden from screen readers.
const p = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
type P = { className?: string };
export const Squiggle = ({ className }: P) => <svg aria-hidden viewBox="0 0 124 20" className={className}><path {...p} d="M2 10Q12 0 22 10T42 10T62 10T82 10T102 10T122 10" /></svg>;
export const Star = ({ className }: P) => <svg aria-hidden viewBox="0 0 40 40" className={className}><path {...p} d="M20 3l4 11 11-4-7 10 10 6-12 1 2 12-8-9-8 9 2-12-12-1 10-6-7-10 11 4z" /></svg>;
export const Nazar = ({ className }: P) => <svg aria-hidden viewBox="0 0 44 44" className={className}><circle {...p} cx="22" cy="22" r="19" /><circle {...p} cx="22" cy="22" r="12" /><circle {...p} cx="22" cy="22" r="5" fill="currentColor" /><path {...p} d="M22 1v-0M6 6l-3-3M38 6l3-3" /></svg>;
export const Paisley = ({ className }: P) => <svg aria-hidden viewBox="0 0 50 60" className={className}><path {...p} d="M30 4C10 6 3 28 13 43c8 12 27 9 31-6 2-9-5-13-11-9-5 3-4 9 1 9" /><path {...p} d="M27 16c-7 2-10 10-6 17M20 50c4 4 11 3 14-1" /></svg>;
