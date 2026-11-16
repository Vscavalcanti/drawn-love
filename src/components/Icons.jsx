// Ícones em traço (SVG), sem emoji.
const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const Back = () => (<svg width="20" height="20" viewBox="0 0 24 24" strokeWidth="2.5" {...base}><path d="M15 18l-6-6 6-6" /></svg>);
export const Close = ({ size = 28 }) => (<svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="3" {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const Star = () => (<svg width="22" height="22" viewBox="0 0 24 24" strokeWidth="2.2" {...base}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>);
export const Heart = () => (<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.2 4.5 7 4.5c2.1 0 3.6 1.1 5 2.9 1.4-1.8 2.9-2.9 5-2.9 3.8 0 6 3.8 4.5 7.3C19.5 16.4 12 21 12 21z" /></svg>);
export const Clock = () => (<svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="2.5" {...base}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></svg>);
export const Pencil = () => (<svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="2.2" {...base}><path d="M3 21l3.5-1 11-11-2.5-2.5-11 11L3 21zM14 7.5L16.5 10" /></svg>);
export const Chat = () => (<svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="2.2" {...base}><path d="M21 12a8 8 0 01-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1121 12z" /></svg>);
export const User = () => (<svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="2.2" {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>);
export const Send = () => (<svg width="20" height="20" viewBox="0 0 24 24" strokeWidth="2.5" {...base}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>);
export const Lock = ({ size = 14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.5" {...base}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>);
export const Photo = ({ size = 26 }) => (<svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 17l-5-5-9 8" /></svg>);
export const Music = () => (<svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="2.2" {...base}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>);
