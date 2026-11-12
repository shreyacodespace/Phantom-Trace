import type { Config } from "tailwindcss";
export default { content:["./app/**/*.{ts,tsx}","./lib/**/*.ts"],
 theme:{extend:{colors:{kaala:"#0C0A12",kaala2:"#171421",nimbu:"#6FD43A",jamun:"#8B5CF6",rani:"#FF3D8B",haldi:"#FFB703",safed:"#F0F0EC",dhuan:"#858A96"},
 fontFamily:{title:["var(--f-title)"],glitch:["var(--f-glitch)"],desi:["var(--f-desi)"],head:["var(--f-head)"],body:["var(--f-body)"],mono:["var(--f-mono)"]}}},plugins:[]} satisfies Config;
