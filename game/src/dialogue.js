export class DialogueBox{
 constructor(){this.active=false;this.lines=[];this.index=0;this.shown=0;this.done=null;this.mouseWasDown=false;}
 play(lines,onDone=()=>{}){this.lines=lines||[];this.index=0;this.shown=0;this.done=onDone;this.active=this.lines.length>0;if(!this.active)onDone();}
 revealAll(){if(this.active&&this.lines[this.index])this.shown=this.lines[this.index].text.length;}
 update(dt,input){const mouse=!!(input.mouseButtons&1),click=mouse&&!this.mouseWasDown;this.mouseWasDown=mouse;if(!this.active)return;const line=this.lines[this.index];this.shown=Math.min(line.text.length,this.shown+dt*42);if((input.actions&4)||click){if(this.shown<line.text.length)this.shown=line.text.length;else if(++this.index>=this.lines.length){this.active=false;const cb=this.done;this.done=null;if(cb)cb();}else this.shown=0;}}
 draw(c){if(!this.active)return;const line=this.lines[this.index],x=24,y=650,w=790,h=126;c.fillStyle='rgba(12,20,22,.84)';c.fillRect(x,y,w,h);c.strokeStyle='rgba(245,198,91,.7)';c.lineWidth=2;c.strokeRect(x,y,w,h);c.fillStyle='#ffd05a';c.font='bold 20px sans-serif';c.fillText(line.who||'',x+24,y+32);c.fillStyle='#fff0ce';c.font='20px sans-serif';c.fillText(line.text.slice(0,Math.floor(this.shown)),x+24,y+70,w-48);c.font='13px sans-serif';c.fillStyle='#cfc4ad';c.textAlign='right';c.fillText('E / CLICK',x+w-20,y+108);c.textAlign='left';}
}
