import { CONFIG } from './config.js';
export const MenuScreens = class MenuScreens {
  drawTitle(ctx,world,renderer,camera,t) {
    renderer.draw(ctx,world,camera);
    renderer.frame(c=>{const g=c.createLinearGradient(0,390,0,800);g.addColorStop(0,'rgba(20,22,25,0)');g.addColorStop(.2,'rgba(20,22,25,.72)');g.addColorStop(1,'rgba(20,22,25,.94)');c.fillStyle=g;c.fillRect(0,340,1280,460);c.textAlign='center';c.fillStyle='#fff0cb';c.shadowColor='rgba(91,43,28,.45)';c.shadowBlur=16;c.font='900 78px Impact, "Arial Narrow", sans-serif';c.fillText('P A L M E R A   H E A T',640,500);c.shadowBlur=0;c.fillStyle='#f2d9ad';c.font='22px Georgia,serif';c.fillText('An open-world crime story in Palmera City',640,545);c.fillStyle='#ffe2a2';c.font='bold 20px sans-serif';if(Math.floor(t*1.5)%2===0)c.fillText('Press Enter to start',640,625);c.fillStyle='#c8c2b6';c.font='16px sans-serif';c.fillText('WASD move  -  E enter car  -  Shift dash  -  Esc pause',640,674);});
  }
  drawPause(ctx) { ctx.fillStyle='rgba(13,17,20,.66)';ctx.fillRect(0,0,CONFIG.width,CONFIG.height);ctx.fillStyle='#fff0cb';ctx.textAlign='center';ctx.font='bold 44px sans-serif';ctx.fillText('PAUSED',640,380);ctx.font='20px sans-serif';ctx.fillText('Press Esc or Enter to return',640,425); }
  drawBusted(ctx) { ctx.fillStyle='rgba(18,12,12,.8)';ctx.fillRect(0,0,CONFIG.width,CONFIG.height);ctx.fillStyle='#fff0cb';ctx.textAlign='center';ctx.font='900 72px sans-serif';ctx.fillText('BUSTED',640,400); }
};
