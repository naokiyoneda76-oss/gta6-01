import {ART} from './art.js';
const POSES={idle:{lean:0,arm:0,leg:0},walk:{lean:0,arm:1.8,leg:2},run:{lean:2,arm:3,leg:3},stumble:{lean:3,arm:2.8,leg:2.5},'car-entry':{lean:4,arm:2.5,leg:2.5},aim:{lean:1,arm:4,leg:0},cover:{lean:2.5,arm:3.2,leg:1.8}};
export function drawFigure(c,o={}){
 const skin=o.skin||ART.palette.skin,shirt=o.torso||'#cf694f',pants=o.pants||ART.palette.pants,hair=o.hair||ART.palette.hair,outline=ART.palette.outline,pose=POSES[o.pose]||POSES.idle,phase=o.phase||0;
 c.save();c.scale(ART.figureScale,ART.figureScale);c.lineCap='round';c.lineJoin='round';
 // Ground-plane projection: the head is a top-facing oval, with body mass trailing toward the feet.
 const lean=pose.lean,head={x:lean*.22,y:-14.2},shoulders=[{x:-4.5+lean*.45,y:-10.5},{x:4.5+lean*.45,y:-10.5}],hip={x:lean*.3,y:-2.2};
 const elbow=[{x:-5.6-pose.arm*.3,y:-7.5},{x:5.6+pose.arm*.3,y:-7.5}],hand=[{x:-6-pose.arm*.42,y:-4.1},{x:6+pose.arm*.42,y:-4.1}],knee=[{x:-2.3-pose.leg+phase,y:1.1},{x:2.3-phase,y:1.1}];
 const shadow=ART.shadow.person;c.fillStyle=`rgba(25,30,29,${shadow.alpha})`;c.beginPath();c.ellipse(shadow.x,shadow.y,5.5,2.6,0,0,Math.PI*2);c.fill();
 const limb=(a,b,w,color)=>{c.strokeStyle=outline;c.lineWidth=w+ART.outline.detail*2;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();};
 // Rear legs sit beneath the torso; shoes are short and overlap toward the front edge.
 for(let i=0;i<2;i++){const n=i?1:-1;limb({x:n*1.7,y:-3},knee[i],3.5,pants);limb(knee[i],{x:knee[i].x+phase*.18,y:3},3,pants);c.fillStyle='#29363a';c.beginPath();c.ellipse(knee[i].x+1,3.15,1.8,1,0,0,Math.PI*2);c.fill();}
 c.fillStyle=outline;c.beginPath();c.moveTo(-4.7,-11.6);c.quadraticCurveTo(-5.3,-8,-3.8,-3.1);c.quadraticCurveTo(0,-1.1,3.8,-3.1);c.quadraticCurveTo(5.3,-8,4.7,-11.6);c.quadraticCurveTo(0,-13.1,-4.7,-11.6);c.fill();
 c.fillStyle=shirt;c.beginPath();c.moveTo(-3.9,-11.2);c.quadraticCurveTo(-4.5,-8,-3.1,-3.5);c.quadraticCurveTo(0,-2,3.1,-3.5);c.quadraticCurveTo(4.5,-8,3.9,-11.2);c.quadraticCurveTo(0,-12.2,-3.9,-11.2);c.fill();
 // Shoulder/back plane and restrained upper-chest plane create a top-down read.
 c.fillStyle=shirt;c.beginPath();c.ellipse(0,-10.25,4.45,2.15,0,Math.PI,Math.PI*2);c.fill();c.fillStyle='rgba(20,35,38,.19)';c.beginPath();c.ellipse(0,-8.15,3.4,1.1,0,0,Math.PI);c.fill();
 limb(shoulders[0],elbow[0],2.4,shirt);limb(elbow[0],hand[0],1.9,shirt);limb(shoulders[1],elbow[1],2.4,shirt);limb(elbow[1],hand[1],1.9,shirt);
 c.fillStyle=skin;c.beginPath();c.arc(hand[0].x,hand[0].y,.9,0,Math.PI*2);c.arc(hand[1].x,hand[1].y,.9,0,Math.PI*2);c.fill();
 // Broad crown is dominant. A slim skin crescent at the lower edge is the only facial cue.
 c.fillStyle=outline;c.beginPath();c.ellipse(head.x,head.y,3.65,3.15,0,0,Math.PI*2);c.fill();c.fillStyle=skin;c.beginPath();c.ellipse(head.x,head.y+.65,2.65,1.7,0,0,Math.PI);c.fill();
 c.fillStyle=hair;c.beginPath();c.ellipse(head.x,head.y-.65,3.3,2.65,0,Math.PI,Math.PI*2);c.fill();if((o.hairStyle||'short')==='long'){c.fillRect(head.x-3.2,head.y-.7,1.2,3.4);c.fillRect(head.x+2,head.y-.7,1.2,3.4);}
 c.restore();
}
