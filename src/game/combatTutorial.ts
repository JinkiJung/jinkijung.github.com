export function createCombatTutorial(){
  let stage:'waiting'|'melee'|'shoot'|'done'='waiting';
  return {
    get hint(){return stage==='melee'?'Z':stage==='shoot'?'X':null;},
    spaceOpened(){if(stage==='waiting')stage='melee';},
    press(code:string){
      if(stage==='melee' && code==='KeyZ')stage='shoot';
      else if(stage==='shoot' && code==='KeyX')stage='done';
    },
  };
}
// One introduction per page visit, including retries and leaving/reopening the game.
export const combatTutorial=createCombatTutorial();
