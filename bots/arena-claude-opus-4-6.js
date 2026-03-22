function dist_sq(p1,p2){return(p2[0]-p1[0])**2+(p2[1]-p1[1])**2}
function distance(p1,p2){return Math.sqrt(dist_sq(p1,p2))}
function normalize(v,len){let m=Math.sqrt(v[0]*v[0]+v[1]*v[1]);if(m<.01)return[0,0];return[v[0]/m*len,v[1]/m*len]}
function add(a,b){return[a[0]+b[0],a[1]+b[1]]}
function sub(a,b){return[a[0]-b[0],a[1]-b[1]]}

let alive=my_cats.filter(c=>c.hp>0);
let enemies=Object.values(cats).filter(c=>c.player_id!==this_player_id&&c.hp>0);
let pods_list=[[-110,-300],[110,-300],[-260,320],[260,320],[-500,84],[500,84]];
let barricades_list=[[0,-200],[0,200],[370,0],[-370,0]];

function isInPod(pos){for(let p of pods_list){if(Math.abs(pos[0]-p[0])<=20&&Math.abs(pos[1]-p[1])<=20)return true}return false}

function avoidBarricade(pos){
    let r=[pos[0],pos[1]];
    for(let b of barricades_list){
        let d=distance(r,b);
        if(d<115){let push=normalize(sub(r,b),115-d+5);r=add(r,push)}
    }
    return r;
}

function clampCircle(pos){
    let d=Math.sqrt(pos[0]**2+pos[1]**2);
    let lim=death_circle-25;
    if(d>lim&&lim>0)return[pos[0]/d*lim,pos[1]/d*lim];
    return pos;
}

if(!alive.length||!enemies.length){
    alive.forEach(c=>c.move([0,0]));
}else{

    // Initialize memory tracking
    if(!memory.enemyLastE)memory.enemyLastE={};
    if(!memory.enemyPewTargets)memory.enemyPewTargets={};
    
    // Track enemy energy changes to predict their targeting
    for(let e of enemies){
        memory.enemyLastE[e.id]=e.energy;
    }

    let mc=[0,0],ec=[0,0];
    alive.forEach(c=>{mc[0]+=c.position[0];mc[1]+=c.position[1]});
    mc[0]/=alive.length;mc[1]/=alive.length;
    enemies.forEach(e=>{ec[0]+=e.position[0];ec[1]+=e.position[1]});
    ec[0]/=enemies.length;ec[1]/=enemies.length;

    let myTotalE=alive.reduce((s,c)=>s+c.energy,0);
    let enemyTotalE=enemies.reduce((s,c)=>s+c.energy,0);
    let advantage=alive.length-enemies.length;
    let energyAdvantage=myTotalE-enemyTotalE;

    // === DETERMINE ROLES ===
    let retreat_ids=new Set();
    
    for(let c of alive){
        let nearE=Infinity;
        for(let e of enemies){let d=distance(c.position,e.position);if(d<nearE)nearE=d}
        // Retreat if energy is critically low and enemies are near
        if(c.energy<=1&&nearE<250&&nearE>50)retreat_ids.add(c.id);
        if(isInPod(c.position)&&c.energy<4)retreat_ids.add(c.id);
    }
    
    // Allow some low-energy cats to retreat if we have numerical advantage
    if(advantage>=2){
        let sorted=[...alive].sort((a,b)=>a.energy-b.energy);
        let keepFighters=Math.min(alive.length, enemies.length+2);
        let maxRetreat=alive.length-keepFighters;
        let sent=0;
        for(let c of sorted){
            if(sent>=maxRetreat)break;
            if(c.energy<=2&&!isInPod(c.position)){
                retreat_ids.add(c.id);
                sent++;
            }
        }
    }else if(advantage>=1){
        let sorted=[...alive].sort((a,b)=>a.energy-b.energy);
        let keepFighters=Math.min(alive.length, enemies.length+1);
        let maxRetreat=alive.length-keepFighters;
        let sent=0;
        for(let c of sorted){
            if(sent>=maxRetreat)break;
            if(c.energy<=1&&!isInPod(c.position)){
                retreat_ids.add(c.id);
                sent++;
            }
        }
    }

    let fighters=alive.filter(c=>!retreat_ids.has(c.id));
    let retreaters=alive.filter(c=>retreat_ids.has(c.id));

    // === FOCUS FIRE TARGET SELECTION ===
    let shooters=fighters.filter(c=>c.energy>=2);
    
    function scoreEnemy(e){
        let inRange=shooters.filter(s=>dist_sq(s.position,e.position)<=200*200).length;
        let shotsToKill=Math.ceil((e.energy+0.01)/2);
        let killable=inRange>=shotsToKill?1:0;
        let splashTargets=enemies.filter(e2=>e2.id!==e.id&&dist_sq(e2.position,e.position)<=20*20).length;
        let dmc=distance(e.position,mc);
        // Prefer enemies closest to our centroid (most dangerous)
        return{e,inRange,shotsToKill,killable,splashTargets,dmc};
    }

    let scored=enemies.map(scoreEnemy);
    scored.sort((a,b)=>{
        // Priority: killable > fewest shots to kill > splash bonus > closest
        if(b.killable!==a.killable)return b.killable-a.killable;
        if(a.shotsToKill!==b.shotsToKill)return a.shotsToKill-b.shotsToKill;
        if(b.splashTargets!==a.splashTargets)return b.splashTargets-a.splashTargets;
        return a.dmc-b.dmc;
    });

    let pewMap=new Map();
    let dmgAlloc={};
    enemies.forEach(e=>dmgAlloc[e.id]=0);
    let unassigned=[...shooters];

    for(let sc of scored){
        let e=sc.e;
        let effectiveHP=e.energy-dmgAlloc[e.id];
        if(effectiveHP<=-0.01)continue;
        
        let needed=Math.ceil((effectiveHP+0.01)/2);
        
        let candidates=unassigned
            .filter(s=>dist_sq(s.position,e.position)<=200*200)
            .sort((a,b)=>dist_sq(a.position,e.position)-dist_sq(b.position,e.position));
        
        let count=0;
        for(let s of candidates){
            if(count>=needed)break;
            pewMap.set(s.id,e);
            dmgAlloc[e.id]+=2;
            // Account for splash damage
            for(let e2 of enemies){
                if(e2.id!==e.id&&dist_sq(e2.position,e.position)<=20*20)dmgAlloc[e2.id]+=2;
            }
            unassigned=unassigned.filter(u=>u.id!==s.id);
            count++;
        }
    }

    // Assign remaining shooters to best available target (highest remaining HP)
    for(let s of unassigned){
        let best=null,bestScore=-Infinity;
        for(let e of enemies){
            let d2=dist_sq(s.position,e.position);
            if(d2>200*200)continue;
            let effectiveHP=e.energy-(dmgAlloc[e.id]||0);
            // Prefer targets with more remaining HP (not overkilling)
            let score=effectiveHP*10-Math.sqrt(d2)*0.1;
            if(score>bestScore){bestScore=score;best=e}
        }
        if(best){pewMap.set(s.id,best);dmgAlloc[best.id]+=2;}
    }

    // Determine primary target for movement
    let primaryTarget=scored[0].e;
    let targetCounts={};
    for(let[,e]of pewMap){targetCounts[e.id]=(targetCounts[e.id]||0)+1}
    let maxCount=0;
    for(let eid in targetCounts){if(targetCounts[eid]>maxCount){maxCount=targetCounts[eid];primaryTarget=cats[eid]}}

    // Let 1-energy cats shoot if it confirms a kill or huge advantage
    let oneECats=fighters.filter(c=>c.energy===1&&!pewMap.has(c.id));
    for(let c of oneECats){
        let killableEs=enemies.filter(e=>dist_sq(c.position,e.position)<=200*200);
        killableEs.sort((a,b)=>{
            let aRemain=a.energy-(dmgAlloc[a.id]||0);
            let bRemain=b.energy-(dmgAlloc[b.id]||0);
            return aRemain-bRemain;
        });
        for(let e of killableEs){
            let allocDmg=dmgAlloc[e.id]||0;
            // Shoot if it confirms a kill (target will go below 0)
            if(allocDmg<e.energy+0.01&&allocDmg+2>=e.energy+0.01){
                pewMap.set(c.id,e);
                dmgAlloc[e.id]+=2;
                break;
            }
        }
        // If huge advantage, 1-energy cats can shoot freely
        if(!pewMap.has(c.id)&&advantage>=4){
            for(let e of killableEs){
                if(e.energy-(dmgAlloc[e.id]||0)>0){
                    pewMap.set(c.id,e);
                    dmgAlloc[e.id]+=2;
                    break;
                }
            }
        }
    }

    // === MOVEMENT ===
    let MIN_SEP=32;
    let front=normalize(sub(ec,mc),1);
    if(front[0]===0&&front[1]===0)front=[1,0];
    let side=[-front[1],front[0]];

    let desPos=new Map();
    
    let ENGAGE_RANGE=advantage>=3?60:advantage>=2?90:advantage>=1?120:150;

    function bestPodFor(cat){
        let bestPod=null,bestScore=-Infinity;
        for(let p of pods_list){
            let pd=Math.sqrt(p[0]**2+p[1]**2);
            if(pd>death_circle-40)continue;
            let minED=Infinity;
            for(let e of enemies){let d=distance(e.position,p);if(d<minED)minED=d}
            let score=minED*0.6-distance(cat.position,p)*1.5;
            if(score>bestScore){bestScore=score;bestPod=p}
        }
        if(!bestPod){
            let bestD=Infinity;
            for(let p of pods_list){let d=distance(cat.position,p);if(d<bestD){bestD=d;bestPod=p}}
        }
        return bestPod;
    }

    for(let cat of alive){
        if(retreat_ids.has(cat.id)){
            let bestPod=bestPodFor(cat);
            if(bestPod){
                if(isInPod(cat.position)&&cat.energy<4){
                    desPos.set(cat.id,[cat.position[0],cat.position[1]]);
                }else if(isInPod(cat.position)&&cat.energy>=4){
                    retreat_ids.delete(cat.id);
                    fighters.push(cat);
                    desPos.set(cat.id,ec);
                }else{
                    desPos.set(cat.id,bestPod);
                }
            }else{
                desPos.set(cat.id,[0,0]);
            }
        }
    }

    // Movement for fighters - advance aggressively with spread
    for(let cat of fighters){
        if(desPos.has(cat.id))continue;
        
        let myTarget=pewMap.has(cat.id)?pewMap.get(cat.id):primaryTarget;
        let dToTarget=distance(cat.position,myTarget.position);

        let nearestE=null,nearED=Infinity;
        for(let e of enemies){let d=distance(cat.position,e.position);if(d<nearED){nearED=d;nearestE=e}}

        let moveVec;

        if(dToTarget>200){
            // Out of range - close distance aggressively
            if(advantage>=3){
                moveVec=normalize(sub(myTarget.position,cat.position),20);
            }else{
                let toTarget=normalize(sub(myTarget.position,cat.position),18);
                let fi=fighters.indexOf(cat);
                let nf=fighters.length;
                let spreadOffset=(fi-(nf-1)/2)*3;
                moveVec=add(toTarget,[side[0]*spreadOffset,side[1]*spreadOffset]);
                let m=Math.sqrt(moveVec[0]**2+moveVec[1]**2);
                if(m>20)moveVec=normalize(moveVec,20);
            }
        }else if(nearED<40&&enemies.length>=fighters.length){
            // Too close and not advantaged - back off while staying in range
            let away=normalize(sub(cat.position,nearestE.position),14);
            let toTarget=normalize(sub(myTarget.position,cat.position),2);
            moveVec=add(away,toTarget);
            let m=Math.sqrt(moveVec[0]**2+moveVec[1]**2);
            if(m>20)moveVec=normalize(moveVec,20);
        }else{
            // In range - maintain formation at engagement range
            let fi=fighters.indexOf(cat);
            let nf=fighters.length;
            let offset=(fi-(nf-1)/2)*MIN_SEP;

            let effectiveRange=ENGAGE_RANGE;
            if(advantage>=2&&dToTarget<180)effectiveRange=Math.min(effectiveRange,70);
            if(advantage>=4)effectiveRange=Math.min(effectiveRange,40);

            let kitePoint=sub(primaryTarget.position,normalize(sub(primaryTarget.position,mc),effectiveRange));
            let formPos=add(kitePoint,[side[0]*offset,side[1]*offset]);

            moveVec=sub(formPos,cat.position);
            let m=Math.sqrt(moveVec[0]**2+moveVec[1]**2);
            if(m>20)moveVec=normalize(moveVec,20);
        }

        desPos.set(cat.id,add(cat.position,moveVec));
    }

    // === HARD SEPARATION ===
    let finalPos=new Map();
    alive.forEach(c=>finalPos.set(c.id,desPos.get(c.id)||c.position));

    for(let iter=0;iter<20;iter++){
        for(let i=0;i<alive.length;i++){
            for(let j=i+1;j<alive.length;j++){
                let a=alive[i],b=alive[j];
                let pa=finalPos.get(a.id),pb=finalPos.get(b.id);
                let d=distance(pa,pb);
                if(d<MIN_SEP){
                    let diff=sub(pa,pb);
                    if(d<0.1)diff=[1+i*0.7,-1+j*0.3];
                    let pushAmt=(MIN_SEP-d)/2+2;
                    let push=normalize(diff,pushAmt);
                    finalPos.set(a.id,add(pa,push));
                    finalPos.set(b.id,sub(pb,push));
                }
            }
        }
    }

    // === HEALING DECISIONS ===
    let healMap=new Map();
    // High energy cats not assigned to attack should heal low energy allies
    for(let c of fighters){
        if(c.energy>=7&&!pewMap.has(c.id)){
            let bestHeal=null,bestNeed=Infinity;
            for(let f of alive){
                if(f.id===c.id)continue;
                if(f.energy<=3&&f.energy<bestNeed&&dist_sq(c.position,f.position)<=200*200){
                    bestNeed=f.energy;bestHeal=f;
                }
            }
            if(bestHeal)healMap.set(c.id,bestHeal);
        }
    }
    
    // Medium energy cats not shooting can also heal critically low allies
    for(let c of fighters){
        if(c.energy>=5&&!pewMap.has(c.id)&&!healMap.has(c.id)){
            let bestHeal=null,bestNeed=Infinity;
            for(let f of alive){
                if(f.id===c.id)continue;
                if(f.energy<=2&&f.energy<bestNeed&&dist_sq(c.position,f.position)<=200*200){
                    bestNeed=f.energy;bestHeal=f;
                }
            }
            if(bestHeal)healMap.set(c.id,bestHeal);
        }
    }

    // Retreaters with high energy can heal nearby low-energy cats
    for(let c of retreaters){
        if(c.energy>=6&&!healMap.has(c.id)){
            let bestHeal=null,bestNeed=Infinity;
            for(let f of alive){
                if(f.id===c.id)continue;
                if(f.energy<=2&&f.energy<bestNeed&&dist_sq(c.position,f.position)<=200*200){
                    bestNeed=f.energy;bestHeal=f;
                }
            }
            if(bestHeal)healMap.set(c.id,bestHeal);
        }
    }

    // === EXECUTE ===
    for(let cat of alive){
        let tp=finalPos.get(cat.id)||cat.position;
        tp=avoidBarricade(tp);
        tp=clampCircle(tp);
        cat.move(tp);

        let didPew=false;

        // Priority 1: Attack assigned enemy target
        if(pewMap.has(cat.id)&&cat.energy>=1&&!retreat_ids.has(cat.id)){
            let target=pewMap.get(cat.id);
            if(target&&target.hp>0&&dist_sq(cat.position,target.position)<=200*200){
                if(cat.energy>=2||(cat.energy===1&&dmgAlloc[target.id]>=target.energy-1)){
                    cat.pew(target);
                    didPew=true;
                }
            }
        }

        // Priority 2: Heal allies
        if(!didPew&&healMap.has(cat.id)){
            let ht=healMap.get(cat.id);
            if(ht.hp>0&&dist_sq(cat.position,ht.position)<=200*200){
                cat.pew(ht);
                didPew=true;
            }
        }

        // Priority 3: Retreaters with decent energy shoot opportunistically
        if(!didPew&&cat.energy>=4&&retreat_ids.has(cat.id)){
            let best=null,bestD=Infinity;
            for(let e of enemies){let d2=dist_sq(cat.position,e.position);if(d2<=200*200&&d2<bestD){bestD=d2;best=e}}
            if(best){cat.pew(best);didPew=true;}
        }
        
        // Priority 4: Unassigned fighters shoot closest enemy
        if(!didPew&&cat.energy>=2&&!retreat_ids.has(cat.id)&&!pewMap.has(cat.id)){
            let best=null,bestD=Infinity;
            for(let e of enemies){let d2=dist_sq(cat.position,e.position);if(d2<=200*200&&d2<bestD){bestD=d2;best=e}}
            if(best){cat.pew(best);didPew=true;}
        }

        let role=retreat_ids.has(cat.id)?'R':'F';
        let t=pewMap.get(cat.id);
        let tn=t?t.id.split('_')[1]:'-';
        cat.set_mark(`${role} E:${cat.energy} ->${tn}`);
    }

    if(tick%5===0||tick<=2){
        console.log(`[T${tick}] ${alive.length}v${enemies.length} ${fighters.length}F ${retreaters.length}R adv=${advantage} eAdv=${energyAdvantage} dc=${death_circle.toFixed(0)}`);
        for(let c of alive){
            let t=pewMap.get(c.id);let tn=t?t.id.split('_')[1]:'-';
            let ne=Infinity;enemies.forEach(e=>{let d=distance(c.position,e.position);if(d<ne)ne=d});
            let pod=isInPod(c.position)?'POD':'';
            console.log(`  ${retreat_ids.has(c.id)?'R':'F'} ${c.id.split('_')[1]}: E=${c.energy} ne=${ne.toFixed(0)} ->${tn} ${pod} [${c.position[0].toFixed(0)},${c.position[1].toFixed(0)}]`);
        }
        for(let e of enemies){
            let d=dmgAlloc[e.id]||0;
            console.log(`  E${e.id.split('_')[1]}: E=${e.energy} dmg=${d} [${e.position[0].toFixed(0)},${e.position[1].toFixed(0)}]`);
        }
    }
}