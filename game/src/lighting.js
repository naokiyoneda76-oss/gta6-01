export const LIGHTING = new URLSearchParams(location.search).get('lighting') !== '0';
export const FIGURES_V2 = new URLSearchParams(location.search).get('figures') !== '1';
export const UNIFIED_SHADOWS = new URLSearchParams(location.search).get('shadow') === '1';

// Shared world-space light: down-right on screen. Long shapes stay low and soft.
export const SHADOW_DIRECTION = {x:.6,y:.8};
export function drawGroundShadow(c,x,y,width,length,contactAlpha=.23,longAlpha=.12,grade=1){
  const angle=Math.atan2(SHADOW_DIRECTION.y,SHADOW_DIRECTION.x),dx=SHADOW_DIRECTION.x*length,dy=SHADOW_DIRECTION.y*length;
  c.save();c.fillStyle=`rgba(20,24,28,${contactAlpha*grade})`;c.beginPath();c.ellipse(x,y,width*.5,width*.22,0,0,Math.PI*2);c.fill();
  const gradient=c.createLinearGradient(x,y,x+dx,y+dy);gradient.addColorStop(0,`rgba(20,24,28,${longAlpha*grade})`);gradient.addColorStop(1,'rgba(20,24,28,0)');c.fillStyle=gradient;c.beginPath();c.ellipse(x+dx*.5,y+dy*.5,Math.max(1,width*.28),Math.max(1,length*.5),angle,0,Math.PI*2);c.fill();c.restore();
}

export function shade(hex, factor) {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = Math.floor((value >> 16) * factor);
  const green = Math.floor(((value >> 8) & 255) * factor);
  const blue = Math.floor((value & 255) * factor);
  return `rgb(${red},${green},${blue})`;
}
