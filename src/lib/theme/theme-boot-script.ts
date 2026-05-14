/**
 * Blocking theme bootstrap for <head>. Must stay aligned with
 * <ThemeProvider attribute="class" defaultTheme="system" enableSystem /> in layout.
 * Logic is the same as next-themes’ bundled `script` (see next-themes `dist/index.mjs` `M`).
 */
const M = `(e,i,s,u,m,a,l,h)=>{let d=document.documentElement,w=["light","dark"];function p(n){(Array.isArray(e)?e:[e]).forEach(y=>{let k=y==="class",S=k&&a?m.map(f=>a[f]||f):m;k?(d.classList.remove(...S),d.classList.add(a&&a[n]?a[n]:n)):d.setAttribute(y,n)}),R(n)}function R(n){h&&w.includes(n)&&(d.style.colorScheme=n)}function c(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(u)p(u);else try{let n=localStorage.getItem(i)||s,y=l&&n==="system"?c():n;p(y)}catch(n){}}`;

/** Serialized args: attribute, storageKey, defaultTheme, forcedTheme, themes, value, enableSystem, enableColorScheme */
const ARGS = `"class","theme","system",null,["light","dark"],null,true,true`;

export const THEME_BOOT_SCRIPT = `(${M})(${ARGS})`;
