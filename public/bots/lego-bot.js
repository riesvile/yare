function distance(xy,xy2){
    return ((xy[0]-xy2[0])**2 + (xy[1]-xy2[1])**2)
}
function interceptCircleLineSeg(circle, line){// circle={center:{x:#,y:#},radius:#} && line={p1:{x:#,y#},p2:{x:#,y:#}}
    var a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
    v1 = {};
    v2 = {};
    v1.x = line.p2.x - line.p1.x;
    v1.y = line.p2.y - line.p1.y;
    v2.x = line.p1.x - circle.center.x;
    v2.y = line.p1.y - circle.center.y;
    b = (v1.x * v2.x + v1.y * v2.y);
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
    if(isNaN(d)){ // no intercept
        return [];
    }
    u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
    u2 = (b + d) / c;    
    retP1 = [];   // return points
    retP2 = [];  
    ret = []; // return array
    if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
        retP1[0] = line.p1.x + v1.x * u1;
        retP1[1] = line.p1.y + v1.y * u1;
        ret[0] = retP1;
    }
    if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
        retP2[0] = line.p1.x + v1.x * u2;
        retP2[1] = line.p1.y + v1.y * u2;
        ret[ret.length] = retP2;
    }       
    return ret;
}
function positionTowardsTarget(spiritPosition,targetPosition,distance){// (array,array,number)
    var circle = {center:{x:spiritPosition[0],y:spiritPosition[1]},radius:distance};
    var line = {p1:{x:spiritPosition[0],y:spiritPosition[1]},p2:{x:targetPosition[0],y:targetPosition[1]}};
    return interceptCircleLineSeg(circle,line);
}
if(tick === 0){
    memory.enemyId = base_zxq.control === this_player_id ? base_a2c.control : base_zxq.control;
    memory.startBase = base_zxq.control === this_player_id ? base_zxq : base_a2c;
    memory.enemyStartBase = base_zxq.control === this_player_id ? base_a2c : base_zxq;
}
var mySpirits = Object.values(spirits).filter(s => s.player_id == this_player_id && s.hp != 0);
var enemySpirits = Object.values(spirits).filter(s => s.player_id != this_player_id && s.hp != 0);
var targetStructure = base_zxq;
if(base_a2c.control === memory.enemyId){
    targetStructure = base_a2c;
}
if(base_nua.control === memory.enemyId){
    targetStructure = base_nua;
}

var roleIndex = 0;

for(spirit of mySpirits){
    spirit.move(targetStructure.position);
    if(distance(spirit.position,targetStructure.position) <= 90000){
        if(!spirit.locked){
            spirit.lock();
        }
        if(distance(spirit.position,targetStructure.position) <= spirit.range**2){
            spirit.energize(targetStructure);
        }
    }else if(distance(spirit.position,targetStructure.position) <= 250000){
        var newPosition = positionTowardsTarget(spirit.position,targetStructure.position,20);
        spirit.move(newPosition[0]);
        var jumpPosition = positionTowardsTarget(newPosition[0],targetStructure.position,200)
        spirit.jump(jumpPosition[0]);
    }
}
if(base_p89.control !== this_player_id && roleIndex < mySpirits.length){
    if(mySpirits[roleIndex].locked){
        mySpirits[roleIndex].unlock();
    }
    mySpirits[roleIndex].move(base_p89.position);
    if(distance(base_p89.position,mySpirits[roleIndex].position) <= 40000){
        mySpirits[roleIndex].energize(base_p89);
    }
    roleIndex++;
}

if(pylon_u3p.control === memory.enemyId && roleIndex < mySpirits.length){
    if(mySpirits[roleIndex].locked){
        mySpirits[roleIndex].unlock();
    }
    mySpirits[roleIndex].move(pylon_u3p.position);
    if(distance(pylon_u3p.position,mySpirits[roleIndex].position) <= 40000){
        mySpirits[roleIndex].energize(pylon_u3p);
    }
    roleIndex++;
}

if(roleIndex < mySpirits.length){
    if(distance(outpost_mdo.position,mySpirits[roleIndex].position) <= 40000 && outpost_mdo.energy === 0){
        mySpirits[roleIndex].energize(outpost_mdo);
        roleIndex++;
    }
}