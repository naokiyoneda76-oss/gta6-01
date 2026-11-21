import {ART} from './art.js';
const POSES={idle:{lean:0,arm:0,leg:0},walk:{lean:0,arm:2.5,leg:2.5},run:{lean:2,arm:4,leg:4},stumble:{lean:4,arm:3,leg:3},'car-entry':{lean:5,arm:3,leg:3},aim:{lean:1,arm:5,leg:0},cover:{lean:3,arm:4,leg:2}};
export function drawFigure(c,o={}){const skin=o.skin||ART.palette.skin,shirt=o.torso||'#cf694f',pants=o.pants||ART.palette.pants,hair=o.hair||ART.palette.hair,outline=ART.palette.outline,pose=POSES[o.pose]||POSES.idle,phase=o.phase||0;
 c.save();c.scale(ART.figureScale,ART.figureScale);c.lineCap='round';c.lineJoin='round';
 // Ten shared joints: head, neck, paired shoulders/elbows/hands/knees and hip.
 const lean=pose.lean, hip={x:lean*.25,y:-3}, neck={x:lean*.65,y:-12}, head={x:lean,y:-15.4};const sh=[{x:-4.1+lean*.55,y:-11.7},{x:4.1+lean*.55,y:-11.7}],el=[{x:-6-pose.arm*.35,y:-8.3},{x:6+pose.arm*.35,y:-8.3}],hand=[{x:-6.6-pose.arm*.5,y:-5.4},{x:6.6+pose.arm*.5,y:-5.4}],knee=[{x:-2.5-pose.leg+phase,y:1},{x:2.5-phase,y:1}];
 c.fillStyle=`rgba(25,30,29,${ART.shadow.person.alpha})`;c.beginPath();c.ellipse(ART.shadow.person.x-2,ART.shadow.person.y-3,5.6,2.6,0,0,Math.PI*2);c.fill();
 const limb=(a,b,w,color)=>{c.strokeStyle=outline;c.lineWidth=w+1.5;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();};
 // Far legs, near legs, torso/hip, far arm, head, near arm.
 for(let i=0;i<2;i++){const x=i?1:-1;limb({x:x*1.8,y:-3},knee[i],4.3, pants);limb(knee[i],{x:knee[i].x+phase*.25,y:3.2},3.7,pants);c.fillStyle='#343b40';c.beginPath();c.ellipse(knee[i].x+1.2,3.5,2.2,1.25,0,0,Math.PI*2);c.fill();}
 c.fillStyle=outline;c.beginPath();c.roundRect(-4.3,-12.4,8.6,9.8,2);c.fill();c.fillStyle=shirt;c.beginPath();c.roundRect(-3.7,-12.1,7.4,8.6,1.8);c.fill();c.fillStyle=pants;c.beginPath();c.ellipse(hip.x,hip.y,3.4,2,0,0,Math.PI*2);c.fill();
 limb(sh[0],el[0],2.8,shirt);limb(el[0],hand[0],2.2,shirt);limb(sh[1],el[1],2.8,shirt);limb(el[1],hand[1],2.2,shirt);
 c.fillStyle=skin;c.beginPath();c.arc(hand[0].x,hand[0].y,1.25,0,7);c.arc(hand[1].x,hand[1].y,1.25,0,7);c.fill();c.fillStyle=skin;c.beginPath();c.ellipse(neck.x,neck.y,1.4,1.5,0,0,7);c.fill();c.fillStyle=outline;c.beginPath();c.arc(head.x,head.y,3.5,0,7);c.fill();c.fillStyle=skin;c.beginPath();c.arc(head.x,head.y-.1,2.75,0,7);c.fill();
 c.fillStyle=hair;c.beginPath();if((o.hairStyle||'short')==='long'){c.ellipse(head.x,head.y-1.25,3.1,2.15,0,Math.PI,Math.PI*2);c.fillRect(head.x-3,head.y,1.35,5.3);c.fillRect(head.x+1.7,head.y,1.35,5.3);}else if((o.hairStyle||'short')!=='bald'){c.ellipse(head.x,head.y-1.35,3,2,0,Math.PI,Math.PI*2);c.fill();}c.restore();}
