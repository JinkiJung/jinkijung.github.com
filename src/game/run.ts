export function createRun(isDeveloper:()=>boolean = ()=>false) {
  let lives=2, ended=false, seconds=0;
  return {
    get lives(){return lives;}, get ended(){return ended;}, get seconds(){return Math.floor(seconds);},
    advance(dt:number){if(!ended)seconds+=dt;},
    finish(){ended=true;},
    die(developer = isDeveloper()){
      // Read the live mode at the death boundary; developer deaths never end a run.
      if(developer || ended)return false;
      lives=Math.max(0,lives-1);ended=lives===0;return ended;
    },
  };
}
