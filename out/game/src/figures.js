import {ART} from './art.js';
import {LIGHTING,shade} from './lighting.js';
const POSES={idle:{lean:0,arm:0,leg:0},walk:{lean:0,arm:1.8,leg:2},run:{lean:2,arm:3,leg:3},stumble:{lean:3,arm:2.8,leg:2.5},'car-entry':{lean:4,arm:2.5,leg:2.5},aim:{lean:1,arm:4,leg:0},cover:{lean:2.5,arm:3.2,leg:1.8}};
export function drawFigure(c,o={}){
 const hero=!!o.hero,litHero=LIGHTING&&hero,skin=litHero?shade(o.skin||ART.palette.skin,1.07):o.skin||ART.palette.skin,shirt=litHero?shade(o.torso||'#cf694f',1.07):o.torso||'#cf694f',pants=litHero?shade(o.pants||ART.palette.pants,1.07):o.pants||ART.palette.pants,hair=litHero?shade(o.hair||ART.palette.hair,1.07):o.hair||ART.palette.hair,outline=litHero?shade(ART.palette.outline,1.07):ART.palette.outline,pose=POSES[o.pose]||POSES.idle,phase=o.phase||0;
 c.save();c.scale(ART.figureScale,ART.figureScale);c.lineCap='round';c.lineJoin='round';
 // Ground-plane projection: the head is a top-facing oval, with body mass trailing toward the feet.
 const lean=pose.lean,head={x:lean*.22,y:-14.2},shoulders=[{x:-4.5+lean*.45,y:-10.5},{x:4.5+lean*.45,y:-10.5}],hip={x:lean*.3,y:-2.2};
 const joints=o.joints||null,shorten=p=>hero?{x:p.x,y:hip.y+(p.y-hip.y)*.78}:p;
 const elbow=joints?.elbow||[{x:-5.6-pose.arm*.3,y:-7.5},{x:5.6+pose.arm*.3,y:-7.5}],hand=joints?.hand||[{x:-6-pose.arm*.42,y:-4.1},{x:6+pose.arm*.42,y:-4.1}],knee=(joints?.knee||[{x:-2.3-pose.leg+phase,y:1.1},{x:2.3-phase,y:1.1}]).map(shorten),feet=joints?.foot?.map(shorten);
 const shoulder=(joints?.shoulder||shoulders).map(p=>hero?{x:p.x*1.08,y:p.y}:p), headPoint=joints?.head||head, hipPoint=joints?.hip||hip;
 const shadow=ART.shadow.person;c.fillStyle=LIGHTING?'rgba(13,20,31,.23)':`rgba(25,30,29,${shadow.alpha})`;c.beginPath();c.ellipse(shadow.x+(LIGHTING?2:0),shadow.y+(LIGHTING?3:0),5.5,2.6,0,0,Math.PI*2);c.fill();
 const limb=(a,b,w,color)=>{c.strokeStyle=outline;c.lineWidth=w+ART.outline.detail*2;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();};
 // Rear legs sit beneath the torso; shoes are short and overlap toward the front edge.
 for(let i=0;i<2;i++){const foot=feet?.[i]||shorten({x:knee[i].x+phase*.18,y:3});limb(hipPoint,knee[i],3.5,pants);limb(knee[i],foot,3,pants);c.fillStyle='#29363a';c.beginPath();c.ellipse(foot.x+1,foot.y+.15,1.8,1,0,0,Math.PI*2);c.fill();}
 c.fillStyle=outline;c.beginPath();c.moveTo(shoulder[0].x-1,-11.6);c.quadraticCurveTo(shoulder[0].x,-8,hipPoint.x-3.8,-3.1);c.quadraticCurveTo(hipPoint.x,-1.1,hipPoint.x+3.8,-3.1);c.quadraticCurveTo(shoulder[1].x,-8,shoulder[1].x+1,-11.6);c.quadraticCurveTo(0,-13.1,shoulder[0].x-1,-11.6);c.fill();
 c.fillStyle=shirt;c.beginPath();c.moveTo(shoulder[0].x,-11.2);c.quadraticCurveTo(shoulder[0].x+.5,-8,hipPoint.x-3.1,-3.5);c.quadraticCurveTo(hipPoint.x,-2,hipPoint.x+3.1,-3.5);c.quadraticCurveTo(shoulder[1].x,-8,shoulder[1].x,-11.2);c.quadraticCurveTo(0,-12.2,shoulder[0].x,-11.2);c.fill();
 if(hero){c.fillStyle=litHero?shade(o.inner||'#24292D',1.07):o.inner||'#24292D';c.beginPath();c.moveTo(shoulder[0].x+1.1,-11);c.lineTo(shoulder[1].x-1.1,-11);c.lineTo(hipPoint.x+1.7,-3.7);c.quadraticCurveTo(hipPoint.x,-3.1,hipPoint.x-1.7,-3.7);c.closePath();c.fill();}
 // Shoulder/back plane and restrained upper-chest plane create a top-down read.
 c.fillStyle=hero?(litHero?shade(o.inner||'#24292D',1.07):o.inner||'#24292D'):shirt;c.beginPath();c.ellipse((shoulder[0].x+shoulder[1].x)/2,-10.25,4.45,2.15,0,Math.PI,Math.PI*2);c.fill();c.fillStyle='rgba(20,35,38,.19)';c.beginPath();c.ellipse(hipPoint.x,-8.15,3.4,1.1,0,0,Math.PI);c.fill();
 limb(shoulder[0],elbow[0],2.4,shirt);limb(elbow[0],hand[0],1.9,shirt);limb(shoulder[1],elbow[1],2.4,shirt);limb(elbow[1],hand[1],1.9,shirt);
 c.fillStyle=skin;c.beginPath();c.arc(hand[0].x,hand[0].y,.9,0,Math.PI*2);c.arc(hand[1].x,hand[1].y,.9,0,Math.PI*2);c.fill();
 // Broad crown is dominant. A slim skin crescent at the lower edge is the only facial cue.
 const hs=hero?1.35:1;c.fillStyle=outline;c.beginPath();c.ellipse(headPoint.x,headPoint.y,3.65*hs,3.15*hs,0,0,Math.PI*2);c.fill();c.fillStyle=skin;c.beginPath();c.ellipse(headPoint.x,headPoint.y+.65*hs,2.65*hs,1.7*hs,0,0,Math.PI);c.fill();
 c.fillStyle=hair;c.beginPath();if(hero){c.moveTo(headPoint.x-3.5,headPoint.y-.35);c.quadraticCurveTo(headPoint.x-4.2,headPoint.y-4.7,headPoint.x-.4,headPoint.y-5.5);c.quadraticCurveTo(headPoint.x+1.2,headPoint.y-5.4,headPoint.x+2.1,headPoint.y-3.9);c.quadraticCurveTo(headPoint.x+3.8,headPoint.y-3.2,headPoint.x+3.6,headPoint.y-.35);c.quadraticCurveTo(headPoint.x,headPoint.y-1.5,headPoint.x-3.5,headPoint.y-.35);c.fill();c.strokeStyle='#665044';c.lineWidth=.8;c.beginPath();c.moveTo(headPoint.x-2.7,headPoint.y-3.6);c.quadraticCurveTo(headPoint.x-.7,headPoint.y-5.15,headPoint.x+1.25,headPoint.y-4.15);c.stroke();}else{c.ellipse(headPoint.x,headPoint.y-.65,3.3,2.65,0,Math.PI,Math.PI*2);c.fill();}if(!hero&&(o.hairStyle||'short')==='long'){c.fillRect(headPoint.x-3.2,headPoint.y-.7,1.2,3.4);c.fillRect(headPoint.x+2,headPoint.y-.7,1.2,3.4);}
 c.restore();
}
