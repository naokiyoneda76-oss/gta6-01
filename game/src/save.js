export class SaveStore{
 constructor(){this.key='palmera-heat-save-v1';}
 load(){try{return JSON.parse(localStorage.getItem(this.key)||'null');}catch{return null;}}
 save(data){try{localStorage.setItem(this.key,JSON.stringify(data));}catch{}}
 reset(){try{localStorage.removeItem(this.key);}catch{}}
}
