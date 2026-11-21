export function drawFigure(c,o={}){
 const torso=o.torso||'#4b8290',skin=o.skin||'#dca77f',pants=o.pants||'#394653',hair=o.hair||'#49352b',style=o.hairStyle||'short',accent=o.accent||shade(torso,.72),outline=o.outline||shade(torso,.55),legs=o.legs||0;
 c.save();c.lineJoin='round';c.lineCap='round';
 // Feet and trousers retain a compact, top-down silhouette.
 c.fillStyle=shade(pants,.48);c.beginPath();c.roundRect(-2.7,1.25,2.15,1.7,.55);c.roundRect(.55,1.25,2.15,1.7,.55);c.fill();
 c.fillStyle=pants;c.beginPath();c.moveTo(-2.35,-2);c.lineTo(-.15,-2);c.lineTo(-.3,1.9+legs);c.lineTo(-2.25,1.9+legs);c.closePath();c.fill();c.beginPath();c.moveTo(.15,-2);c.lineTo(2.35,-2);c.lineTo(2.25,1.9-legs);c.lineTo(.3,1.9-legs);c.closePath();c.fill();
 c.strokeStyle=shade(pants,.42);c.lineWidth=.65;c.beginPath();c.moveTo(-.15,-1.4);c.lineTo(-.25,1.5);c.moveTo(.15,-1.4);c.lineTo(.25,1.5);c.stroke();
 // Sleeves and hands are integrated into one outlined upper-body silhouette.
 c.fillStyle=outline;c.beginPath();c.moveTo(-2.45,-8.2);c.quadraticCurveTo(-3.55,-8.3,-3.45,-6.7);c.lineTo(-3.05,-3.8);c.quadraticCurveTo(-2.9,-3.2,-2.35,-3.55);c.lineTo(-2,-5.1);c.lineTo(-1.65,-3.3);c.quadraticCurveTo(0,-2.65,1.65,-3.3);c.lineTo(2,-5.1);c.lineTo(2.35,-3.55);c.quadraticCurveTo(2.9,-3.2,3.05,-3.8);c.lineTo(3.45,-6.7);c.quadraticCurveTo(3.55,-8.3,2.45,-8.2);c.quadraticCurveTo(0,-9.1,-2.45,-8.2);c.closePath();c.fill();
 c.fillStyle=skin;c.beginPath();c.ellipse(-2.68,-3.48,.53,.7,-.1,0,Math.PI*2);c.ellipse(2.68,-3.48,.53,.7,.1,0,Math.PI*2);c.fill();
 c.fillStyle=torso;c.beginPath();c.moveTo(-2.45,-8);c.quadraticCurveTo(0,-9.05,2.45,-8);c.lineTo(2.08,-5.35);c.lineTo(1.45,-3.45);c.quadraticCurveTo(0,-3.05,-1.45,-3.45);c.lineTo(-2.08,-5.35);c.closePath();c.fill();
 c.fillStyle=accent;c.beginPath();c.moveTo(-2.42,-7.8);c.lineTo(-1.25,-7.65);c.lineTo(-.75,-5.5);c.lineTo(-1.7,-4.55);c.lineTo(-2.35,-5.4);c.closePath();c.fill();c.beginPath();c.moveTo(2.42,-7.8);c.lineTo(1.25,-7.65);c.lineTo(.75,-5.5);c.lineTo(1.7,-4.55);c.lineTo(2.35,-5.4);c.closePath();c.fill();
 c.strokeStyle=shade(torso,.47);c.lineWidth=.48;c.beginPath();c.moveTo(-.7,-7.65);c.lineTo(0,-6.9);c.lineTo(.7,-7.65);c.stroke();
 c.fillStyle=accent;c.fillRect(.65,-5.35,.72,.85);c.strokeStyle=shade(torso,.48);c.lineWidth=.35;c.strokeRect(.65,-5.35,.72,.85);
 // Hair and face, including side locks for long styles.
 c.fillStyle=outline;c.beginPath();c.ellipse(0,-10.15,2.35,2.25,0,0,Math.PI*2);c.fill();c.fillStyle=skin;c.beginPath();c.ellipse(0,-9.95,1.75,1.72,0,0,Math.PI*2);c.fill();
 c.fillStyle=hair;c.beginPath();if(style==='cap'){c.ellipse(0,-11.25,2.45,1.35,0,Math.PI,Math.PI*2);c.closePath();c.fill();c.fillRect(-2.25,-11.35,3.1,.6);}else if(style==='bun'){c.ellipse(0,-11.2,2.25,1.3,0,Math.PI,Math.PI*2);c.closePath();c.fill();c.beginPath();c.arc(1.7,-10.7,.72,0,Math.PI*2);c.fill();}else if(style==='long'){c.beginPath();c.moveTo(-2.15,-10.2);c.quadraticCurveTo(-2.5,-12.7,0,-12.55);c.quadraticCurveTo(2.45,-12.5,2.15,-10.2);c.lineTo(2.25,-7.75);c.lineTo(1.3,-7.35);c.lineTo(.95,-9.7);c.lineTo(-1,-9.7);c.lineTo(-1.4,-7.35);c.lineTo(-2.25,-7.75);c.closePath();c.fill();}else if(style!=='bald'){c.beginPath();c.ellipse(0,-11,2.25,1.45,0,Math.PI,Math.PI*2);c.closePath();c.fill();c.beginPath();c.moveTo(-1.85,-10.85);c.lineTo(-1.7,-9.7);c.lineTo(-1.15,-9.35);c.lineTo(-1.1,-10.7);c.closePath();c.fill();}
 c.restore();
}
function shade(hex,k){if(!/^#[0-9a-f]{6}$/i.test(hex))return '#344448';const n=parseInt(hex.slice(1),16),r=Math.max(0,Math.min(255,Math.round((n>>16)*k))),g=Math.max(0,Math.min(255,Math.round(((n>>8)&255)*k))),b=Math.max(0,Math.min(255,Math.round((n&255)*k)));return `rgb(${r},${g},${b})`;}
