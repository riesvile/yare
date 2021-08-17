var start = new Date().getTime();

var section = new Date().getTime();

function dist(p1, p2) {
    let dx = p1[0] - p2[0];
    let dy = p1[1] - p2[1];
    return Math.sqrt(dx*dx + dy*dy);
}
graphics.style='red';

function dist2(p1, p2) {
    let dx = p1[0] - p2[0];
    let dy = p1[1] - p2[1];
    return dx*dx + dy*dy;
}

function mid(p1, p2) {
    return [(p1[0] + p2[0])/2, (p1[1] + p2[1])/2]
}

function add(p1, p2) {
    return [p1[0] + p2[0], p1[1] + p2[1]];
}

function sub(p1, p2) {
    return [p1[0] - p2[0], p1[1] - p2[1]];
}

function len(p) {
    return Math.sqrt(p[0]*p[0] + p[1]*p[1]);
}

function mul(p1, f) {
    return [p1[0] * f, p1[1] * f]
}

function interp(p1, p2, p) {
    let d = dist(p1, p2);
    let shift = [(p2[0] - p1[0])/(d/p), (p2[1] - p1[1])/(d/p)];
    return [p1[0] + shift[0], p1[1] + shift[1]];
}

memory.tick = (memory.tick || 0) + 1;

var defdist = (outpost.energy > 300) ? -10 : -200;

var things = {
    star: star_zxq,
    enemy_star: star_a1c,

    base_defend: interp(base.position, star_zxq.position, defdist),

    out_base_pos: outpost.position,
    out_star_pos: star_p89.position
}

if (base.position[0] == 2600) {
    things = {
        star: star_a1c,
        enemy_star: star_zxq,

        base_defend: interp(base.position, star_a1c.position, defdist),

        out_base_pos: star_p89.position,
        out_star_pos: outpost.position
    };
}

mine = my_spirits.filter(s => s.hp > 0).map(s => s.id);
var mySize = mine.reduce((a, s) => a + spirits[s].size, 0);
var enemySize = Object.values(spirits).filter(s => s.hp > 0 && s.player_id != this_player_id).reduce((a, s) => a + s.size, 0);

/*
var my_energy = mine.reduce((a, s) => a + spirits[s].energy, 0);
var enemy_ene = Object.values(spirits).filter(s => s.hp > 0 && s.player_id != this_player_id).reduce((a, s) => a + s.size, 0);
*/

var basePos = [base.position[0], base.position[1]];
var enemybasePos = [enemy_base.position[0], enemy_base.position[1]];



function buildListFromList(all, filter, weight) {
    list = [];
    for(var s of all) {
        if(s.hp < 0.5) {
            continue;
        }
        if(filter(s)) {
            list.push({w: weight(s), s: s});
        }
    }
    list.sort((a, b) => a.w - b.w);
    return list;
}

function buildList(filter, weight) {
    return buildListFromList(Object.values(spirits), filter, weight);
}

function findClosest(list, p, f) {
    let min = 1000000000;
    let minid = -1;
    for (var i=0; i<list.length; i++) {
        if(spirits[list[i]].hp == 0) {
            continue;
        }
        if(f(list[i])) {
            continue;
        }
        let d = dist2(p, spirits[list[i]].position);
        if (d < min) {
            min = d;
            minid = i;
        }
    }
    if(minid == -1) {
        return null;
    }
    return spirits[list[minid]];
}

function findweight(list, weight, f) {
    let min = 1000000000;
    let minid = -1;
    for (var i=0; i<list.length; i++) {
        if(spirits[list[i]].hp == 0) {
            continue;
        }
        if(f(spirits[list[i]])) {
            continue;
        }
        let d = weight(spirits[list[i]]);
        if (d < min) {
            min = d;
            minid = i;
        }
    }
    if(minid == -1) {
        return null;
    }
    return spirits[list[minid]];
}





//get point on line bounded by p1-p2 closest to point p
function closestOnLine(p1, p2, p) {
    let shift = [p2[0] - p1[0], p2[1] - p1[1]];
    let shift2 = [p[0] - p1[0], p[1] - p1[1]];
    let len = shift[0]*shift[0] + shift[1]*shift[1];
    let dot = (shift[0]*shift2[0] + shift[1]*shift2[1]);
    let scale = dot / len;
    if(scale > 1) {
        return p2;
    }
    if(scale < 0) {
        return p1;
    }
    return [p1[0] + (shift[0] * scale), p1[1] + (shift[1] * scale)]
}

function getDanger(s) {
    var d = {};
    var dang_vec = [0, 0];
    var count = 0;
    var danger = 0;
    for(var e of s.sight.enemies) {
        dang_vec = add(dang_vec, sub(spirits[e].position, s.position));
        danger += spirits[e].energy;
    }
    for(var f of s.sight.friends) {
        danger -= spirits[f].energy;
    }
    if(count > 0) {
        d.safe = add(s.position, mul(dang_pos, -20/len(dang_vec)));
    }
    d.danger = danger;
    return d;
}

var globs = [];
var globbed = {};
var all_globs = [];

console.log("init " + (new Date().getTime() - section));
section = new Date().getTime();

var enemiesInRange = buildList(s => s.player_id != this_player_id, s => dist2(s.position, basePos));


graphics.style = 'red';


for(var e of enemiesInRange) {
    if(globbed[e.s.id]) {
        continue;
    }
    var glob = [e.s.id];
    var queue = [e.s.id];
    globbed[e.s.id] = true;
    while(queue.length > 0) {
        var next = queue.pop();
        for(var f of spirits[next].sight.friends_beamable) {
            if(globbed[f]) {
                continue;
            }
            if(dist2(spirits[next].position, spirits[f].position) > (100*100)) {
                continue;
            }
            glob.push(f);
            queue.push(f);
            globbed[f] = true;
        }
    }
    var energy = glob.reduce((a, s) => a + spirits[s].energy, 0);
    var p = energy;
    glob = {
        position: mul(glob.reduce((p, a) => {return add(p, spirits[a].position)}, [0, 0]), 1 / glob.length),
        members: glob,
        energy: Math.round(p),
    };
    if(dist2(glob.position, outpost.position) < 400**2) {
        glob.outpost = true;
    }
    all_globs.push(glob);
    var m = Math.sqrt(glob.members.reduce((p, a) => {return Math.max(p, dist2(glob.position, spirits[a].position))}, 400));
    graphics.circle(glob.position, m);

    //attackers += Math.round(glob.length * 1.2);
    //memory.aggress = Math.max(memory.aggress, Math.sqrt(dist2(glob.position, base.position)) + 50);
}

if(!memory.globTrack) {
    memory.globTrack = {};
    memory.globs = {};
}

var id = 1;
for(var g of all_globs) {
    g.id = id++;
}

var newData = {};

for(var g of all_globs) {
    var globCount = {};
    for(var u of g.members) {
        if(!memory.globTrack[u]) {
            memory.globTrack[u] = g.id;
            continue;
        }
        globCount[memory.globTrack[u]] = (globCount[memory.globTrack[u]] || 0) + 1;
        memory.globTrack[u] = g.id;
    }
    var best = -1;
    var bestCount = -1;
    for(var u in globCount) {
        if(globCount[u] > bestCount) {
            best = u;
            bestCount = globCount[u];
        }
    }
    g.lastID = best;
    newData[g.id] = {...memory.globs[best]} || {};
}

newData["outpost"] = memory.globs["outpost"] || {};
newData["drain_enemy"] = memory.globs["drain_enemy"] || {};

memory.globs = newData;

console.log(JSON.stringify(newData));

if(!memory.aggress) {
    memory.aggress = 800;
}

if(mySize > 2 * enemySize) {
    memory.ATTACK=true;
}

if(mySize < 0.9 * enemySize) {
    memory.ATTACK=false;
}

console.log(mySize);
console.log(enemySize);
console.log(enemySize * 2);

memory.aggress = Math.max(600, (200 * mySize/enemySize));

var toos = [];

if(!memory.globs["outpost"]) {
    memory.globs["outpost"] = {};
}

if(outpost.control != this_player_id && tick > 200) {
    var out_mid = mid(outpost.position, star_p89.position);
    var en = (outpost.energy / 2) + (Object.values(spirits).reduce((a, s) => a + (((s.hp > 0 && s.player_id != this_player_id && dist2(s.position, out_mid) < 400*400)) ? s.energy: 0), 0));
    if(en < 30) {
        en = 30;
    }
    //console.log(en);
    var g = {
        position: out_mid,
        energy: 10000,
        minEnergy: en * (memory.globs.outpost.attack ? 0.5 : 1.25) ,
        id: "outpost",
    };
    console.log(g.minEnergy, g.minEnergy / 30);
    toos.push(g);
}

var midPos = mid(base.position, things.star.position);

var baseRange = 500;
var starRange = 400;

var out_mid = mid(star_p89.position, outpost.position);

for(var g of all_globs) {
    if(memory.ATTACK) {
        globs.push(g);
        memory.globs[g.id].attack = true;
    } else {
        var p = closestOnLine(things.base_defend, things.star.position, g.position);
        var d = dist2(p, g.position);

        if(outpost.control == this_player_id) {
            let tp = closestOnLine(things.base_defend, things.out_base_pos, g.position);
            var td = dist2(tp, g.position);
            if(td < d) {
                d = td;
                p = tp;
            }

            tp = closestOnLine(things.star.position, things.out_star_pos, g.position);
            td = dist2(tp, g.position);
            if(td < d) {
                d = td;
                p = tp;
            }

            tp = closestOnLine(things.out_base_pos, things.out_star_pos, g.position);
            td = dist2(tp, g.position);
            if(td < d) {
                d = td;
                p = tp;
            }
        }
        graphics.line(g.position, p);
        if(d < 600**2) {/* HIDE LINEAR RAILS*/
            if(base.energy < base.energy_capacity*2/3) {
                g.position = interp(p, g.position, 110);
            } else {
                g.position = interp(p, g.position, 200);
            }/**/
            globs.push(g);
        } /*else if (d < (750)**2) {
            g.position = interp(p, g.position, 100);
            g.minEnergy = 0.5 * g.energy;
            toos.push(g);
        } */else {
            /*
            if(dist2(g.position, midPos) < ((400 * mySize/enemySize) ** 2)) {
                g.minEnergy = g.energy * 0.75;
                toos.push(g);
            } else if(outpost.control == this_player_id && dist2(g.position, outpost.position) < (400**2)) {
                g.minEnergy = g.energy * 0.75;
                toos.push(g);
            } else if(mySize > enemySize * 2) {
                g.minEnergy = g.energy * 0.75;
                toos.push(g);
            }*/
            memory.globs[g.id].attack = false;/*
            if(dist2(g.position, basePos) < ((memory.aggress + 200) ** 2)) {
                var vec = sub(g.position, basePos);
                vec = mul(vec, 200 / len(vec));
                globs.push({
                    position: add(basePos, vec),   
                    energy: g.energy * 0.5,
                });
            }*/
        }
    }
}

if(memory.ATTACK) {
    globs.push({
        position: enemy_base.position,
        energy: Object.values(spirits).filter(s => s.hp > 0 && s.player_id != this_player_id).reduce((a, s) => a + s.energy_capacity, 0) * 1 + enemy_base.energy * 1,
    });
}

var e = {};
var chosen = {};

var relayers = [];

var attackerers = [];

var isAttacker = {};

var attackers = 0;

console.log("blob enemies " + (new Date().getTime() - section));
section = new Date().getTime();

for(var g of globs) {
    g.units = [];
    var energyGotten = 0;
    for(var h of buildList(s => s.player_id == this_player_id && !chosen[s.id], s => dist2(s.position, g.position) + ((s.energy_capacity - s.energy) * 20*20))) {
        chosen[h.s.id] = true;
        g.units.push(h.s);
        isAttacker[h.s.id] = true;
        energyGotten += h.s.energy;
        attackers++;
        if(energyGotten >= g.energy) {
            break;
        }
    }
}

var ratio = 26/36;

var size = my_spirits[0].size;

var maxHarvest = Math.ceil((things.star.energy / 100) + 1);
var prepRate = Math.ceil(maxHarvest/size) * size;

if(tick < 100) {
    prepRate = 6;
}

if(things.star.energy > 800) {
    prepRate = 15;
}

if(things.star.energy > 900) {
    maxHarvest = 10 + (things.star.energy-950) / 3;
    prepRate = 15;
}

var diff = size - (maxHarvest % size);

if(tick % size < (size - diff)) {
    maxHarvest += diff;
}

maxUnits = (prepRate * 3.6) / size;

var units = Math.round(Math.max(5, Math.min(maxUnits, (mine.length - (attackers)))));

var miners = Math.round(ratio * units);
var relays = units - miners;

console.log("Harvest info: " + maxHarvest +" " + prepRate);

console.log(units + " " + miners +" " + relays);

if(relays == 0) {
    relays = 1;
    miners--;
}

var relayPos = interp(basePos, things.star.position, 198.5);
var minePos = interp(things.star.position, basePos, 198.5);
var mineRelayPos = interp(relayPos, things.star.position, 198.5);

console.log("build globs " + (new Date().getTime() - section))
section = new Date().getTime();

var relayersNotInPos = [];

for(var next of buildList(s => s.player_id == this_player_id && (!chosen[s.id]), s => dist2(s.position, relayPos)).slice(0, relays)) {
    chosen[next.s.id] = true;
    next.s.move(relayPos);
    if(next.s.energy > next.s.energy_capacity/2) {
        if(dist2(next.s.position, base.position) < 200*200) {
            next.s.energize(base);
            e[next.s.id] = -1;
        }
    }
    if(next.w > 1) {
        relayersNotInPos.push(next.s);
    } else {
        relayers.push(next.s);
    }
}

console.log("relays " + (new Date().getTime() - section))
section = new Date().getTime();

var miners = buildList(s => s.player_id == this_player_id && (!chosen[s.id]), s => dist2(s.position, minePos)).slice(0, miners);

var forwardminers = buildList(s => s.player_id == this_player_id && (!chosen[s.id]) && dist2(s.position, basePos) < 375*375, s => dist2(s.position, basePos));

e["star"] = 0;

for(var n of miners) {
    var next = n.s;
    chosen[next.id] = true;
    if(dist2(next.position, things.star.position) <= 200*200) {
        if(e["star"] + next.size <= maxHarvest) {
            next.energize(next);
            e["star"]+=next.size;
        } else {
            var avail = 0;
            var p = null;
            if(dist2(relayPos, next.position) <= 200 * 200) {
                for(var m of relayers) {
                    if((m.energy_capacity) - (m.energy + (e[m.id] || 0)) > avail) {
                        avail = (m.energy_capacity) - (m.energy + (e[m.id] || 0));
                        p = m;
                    }
                }
            }
            for(var m of relayersNotInPos) {
                if(dist2(m.position, next.position) > 200*200) {
                    continue;
                }
                if((m.energy_capacity) - (m.energy + (e[m.id] || 0)) > avail) {
                    avail = (m.energy_capacity) - (m.energy + (e[m.id] || 0));
                    p = m;
                }
            }
            if(!p) {
                var mydist = dist2(next.position, basePos);
                var beamable = {};
                for(var f of next.sight.friends_beamable) {
                    beamable[f] = true;
                }
                for(var m of forwardminers) {
                    if(m.w > mydist - 5) {
                        break;
                    }
                    if(!beamable[m.s.id]) {
                        continue;
                    }
                    if((m.s.energy_capacity) - (m.s.energy + (e[m.s.id] || 0)) > avail) {
                        p = m.s;
                        break;
                    }
                }
            }
            if(p) {
                next.energize(p);
                e[p.id] = (e[p.id] || 0) + next.size;
            }
        }
        if(next.energy < next.energy_capacity-next.size) {
            next.move(minePos);
        } else {
            next.move(mineRelayPos);
        }
    } else {
        if(next.energy > 0) {
            var nextPos = mineRelayPos;
            if(dist(nextPos, next.position) > 20) {
                nextPos = interp(next.position, mineRelayPos, 20);
            }
            next.move(nextPos);
            var avail = 0;
            var p = null;
            if(dist2(relayPos, next.position) <= 200 * 200) {
                for(var m of relayers) {
                    if((m.energy_capacity+1) - (m.energy + (e[m.id] || 0)) > avail) {
                        avail = (m.energy_capacity+1) - (m.energy + (e[m.id] || 0));
                        p = m;
                    }
                }
            }
            for(var m of relayersNotInPos) {
                if(dist2(m.position, next.position) > 200*200) {
                    continue;
                }
                if((m.energy_capacity+1) - (m.energy + (e[m.id] || 0)) > avail) {
                    avail = (m.energy_capacity+1) - (m.energy + (e[m.id] || 0));
                    p = m;
                }
            }
            if(!p) {
                var mydist = dist2(next.position, basePos);
                var beamable = {};
                for(var f of next.sight.friends_beamable) {
                    beamable[f] = true;
                }
                for(var m of forwardminers) {
                    if(m.w > mydist - 5) {
                        break;
                    }
                    if(!beamable[m.s.id]) {
                        continue;
                    }
                    if((m.s.energy_capacity) - (m.s.energy + (e[m.s.id] || 0)) > avail) {
                        p = m.s;
                        break;
                    }
                }
            }
            if(p) {
                next.energize(p);
                e[p.id] = (e[p.id] || 0) + next.size;
            }
            if(next.energy <= next.size) {
                next.move(minePos);
            }
            if(dist2(next.position, basePos) < 200*200) {
                next.energize(base);   
            }
        } else {
            next.move(minePos);
        }
    }
}

var attackerMinePos = interp(things.star.position, enemybasePos, 198.5);

var energizing = {};

console.log("miners " + (new Date().getTime() - section))
section = new Date().getTime();

/*
{
    toos.push({
        id: "drain_enemy",
        position: interp(things.enemy_star.position, enemy_base.position, -198),
        energy: 600,
        minEnergy: 60,
        mode: "drain",
    });
}
*/

for(var g of toos) {
    g.units = [];
    var energyGotten = 0;
    for(var h of buildList(s => s.player_id == this_player_id && !chosen[s.id], s => dist2(s.position, g.position) + ((s.energy_capacity - s.energy) * 20*20))) {
        chosen[h.s.id] = true;
        g.units.push(h.s);
        isAttacker[h.s.id] = true;
        energyGotten += h.s.energy;
        attackers++;
        if(energyGotten >= g.energy) {
            break;
        }
    }
    if(g.id == "outpost") {
        for(var outg of globs) {
            if(!outg.outpost) {
                continue;
            }
            g.units = g.units.concat(outg.units);
            energyGotten += outg.units.reduce((a, s) => a + s.energy, 0);
        }
        console.log("Outpost energy: " + energyGotten);
    }
    if(energyGotten > g.minEnergy || (memory.globs[g.id].attack && energyGotten > g.minEnergy*0.5)) {
        globs.push(g);
        memory.globs[g.id].attack = true;
        if(g.id == "outpost") {
            for(var outg of globs) {
                if(!outg.outpost) {
                    continue;
                }
                outg.units = [];
            }
        }
    } else {
        memory.globs[g.id].attack = false;
        for(var u of g.units) {
            chosen[u.id] = false;
            isAttacker[u.id] = false;
            attackers--;
        }
        if(!g.retried && g.id != "outpost") {
            g.retried = true;
            g.minEnergy *= 0.5;
            g.position = interp(basePos, g.position, 100);
            toos.push(g);
        }
    }
}

var out_mid = mid(outpost.position, star_p89.position);

e["outpost"] = 0;


var outpost_vec = sub(star_p89.position, outpost.position);
var star_shift = mul(outpost_vec, 198/len(outpost_vec));
var outpost_harass_pos = add(star_p89.position, star_shift);

var outpost_harassers = [];

healing = {};
carriers = my_spirits.reduce((a, s) => a + ((!chosen[s.id] && s.hp > 0.5 && s.carrier) ? 1 : 0), 0);
console.log(carriers);

var left = my_spirits.filter(s => !chosen[s.id] && s.hp > 0.5);

var out_mine = [];
{
    let pos = out_mid;
    while(dist2(pos, base.position) > 198**2) {
        out_mine.push(pos);
        pos = interp(pos, base.position, 198);
    }
    out_mine.push(pos);
}


var outstargrowth = (star_p89.energy / 100) - 3;

if(star_p89.energy > 950) {
    outstargrowth = 12;
}

function getLowestAtPos(pos) {
    var lowest = 99999;
    var lowest_s = null;
    for(var s of my_spirits) {
        if(!chosen[s.id] && s.hp > 0.5 && s.energy < lowest && dist2(s.position, pos) < 20**2) {
            lowest = s.energy;
            lowest_s = s;
        }
    }
    return lowest_s;
}

var left = my_spirits.filter(s => !chosen[s.id] && s.hp > 0.5);

var chains = Math.min(Math.floor(left.length / 5), 4);

if(outpost.control != this_player_id) {
    for(var u of left) {
        u.move(base.position);
    }
} else if(outpost.energy < outpost.energy_capacity * 0.9) {
    for(var u of left) {
        u.move(out_mid);
        if(u.energy > u.energy_capacity * 0.5) {
            u.energize(outpost);
        } else {
            u.energize(u);
        }
    }
} else {/*  HIDE OUTPOST HARVESTING*/
    var i = 0;
    out_mine = out_mine.reverse();
    var prior = [];
    for(var p of out_mine) {
        var units = buildListFromList(left, s => !chosen[s.id], s => dist2(s.position, p)).slice(0, chains * ((i == out_mine.length-1) ? 2:1)).map(s => s.s);
        for(var u of units) {
            chosen[u.id] = true;
            u.move(p);
            if(i == 0) {
                if(u.energy > u.energy_capacity/2 && dist2(u.position, base.position) < 200**2) {
                    u.energize(base);
                }
            } else if(i < out_mine.length-1) {
                if(u.energy > u.energy_capacity/2) {
                    let lowest = null;
                    let loweste = 100000;
                    for(let n of prior) {
                        if(n.energy < loweste && dist2(u.position, n.position) < 200**2) {
                            loweste = n.energy;
                            lowest = n;
                        }
                    }
                    if(lowest && lowest.energy < lowest.energy_capacity) {
                        u.energize(lowest);
                        u.energy -= u.size;
                        lowest.energy += u.size;
                    }
                }
            } else {
                if(u.energy > u.energy_capacity/2) {
                    let lowest = null;
                    let loweste = 100000;
                    for(let n of prior) {
                        if(n.energy < loweste && dist2(u.position, n.position) < 200**2) {
                            loweste = n.energy;
                            lowest = n;
                        }
                    }
                    if(lowest && lowest.energy < lowest.energy_capacity) {
                        u.energize(lowest);
                        u.energy -= u.size;
                        lowest.energy += u.size;
                    }
                } else {
                    if(outstargrowth >= u.size && dist2(u.position, star_p89.position) < 200**2) {
                        u.energize(u);
                        outstargrowth -= u.size;
                    }
                }
            }
        }

        prior = units;
        i++;
    }/**/
    for(let s of my_spirits.filter(s => !chosen[s.id] && s.hp > 0.5)) {
        s.move(out_mid);
        if(s.energy < s.energy_capacity) {
            s.energize(s);
        }
    }
}
/*
    for(var u of buildListFromList(outpost_harassers, s => true, s => dist2(s.position, outpost_harass_pos)).slice(0, outpost_harassers.length/2)) {
        var d = getDanger(u.s);
        if(d.danger > 10) {
            console.log(d.safe);
            u.s.move(d.safe);
        } else {
            u.s.move(outpost_harass_pos);
            u.s.energize(u.s);
        }
    }
    */


explodeWeight = [];

for(var u of my_spirits) {
    if(u.hp < 0.5) {
        continue;
    }
    w = {s: u, targets: []};
    for(var s of u.sight.enemies_beamable) {
        if(dist2(spirits[s].position, u.position) > 160*160) {
            continue;
        }
        w.targets.push(s);
    }
    w.weight = w.targets.length*5 - u.energy;
    if (w.weight > 10) {
        explodeWeight.push(w);
    }
}

explodeWeight.sort((a, b) => a.weight - b.weight);

for(var w of explodeWeight) {
    var lt = 0;
    for(var t of w.targets) {
        if(spirits[t].energy - (e[t] || 0) >= 0) {
            lt++;
        }
    }
    if((lt*5) - w.s.energy > 10) {
        w.s.explode();
        for(var t of w.targets) {
            e[t] = (e[t] || 0) + 10;
        }
    }
}

for(var u of my_spirits) {
    if(u.hp < 0.5) {
        continue;
    }
    if(dist(u.position, enemybasePos) <= 198.5) {
        energizing[u.id] = true;
        u.energize(enemy_base);
        continue;
    }
    var p = findClosest(u.sight.enemies_beamable, nextPos, id => spirits[id].energy - (e[id]||0) < 0);
    if(p) {
        u.energize(p);
        energizing[u.id] = true;
        e[p.id] = (e[p.id] || 0) + u.size;
    } else {
        if((outpost.control != this_player_id || (u.energy > u.energy_capacity * 0.75 && outpost.energy+e["outpost"] < outpost.energy_capacity)) && dist2(u.position, outpost.position) < 200*200) {
            energizing[u.id] = true;
            u.energize(outpost);
            e["outpost"]+=u.size;
         }else {
            //u.energize(u);
        }
    }
}

console.log("beam enemies " + (new Date().getTime() - section));

section = new Date().getTime();
graphics.style = 'green';
for(var g of globs) {
    var attackBlob = [];
    var inGlob = {};
    for(var u of g.units) {
        inGlob[u.id] = true;
        if(u.energy == 0) {
            if(dist2(things.star.position, u.position) > 200*200) {
                if(dist2(u.position, things.star.position) < dist2(u.position, star_p89.position) || star_p89.energy == 0) {
                    if(dist2(u.position, things.star.position) > 198.5*198.5) {
                        u.move(things.star.position);
                    }
                } else {
                    if(dist2(u.position, star_p89.position) > 198.5*198.5) {
                        u.move(star_p89.position);
                    }
                }
            } else {
                
            }
            u.energize(u);
            continue;
        }
        
        if(u.energy < u.energy_capacity && !energizing[u.id]) {
            if(dist2(u.position, things.star.position) < 200*200){
                u.energize(u);
            };
            if(dist2(u.position, star_p89.position) < 200*200){
                u.energize(u);
            };
            if(u.energy / u.energy_capacity < 0.2 && u.sight.enemies.length == 0) {
                if(dist2(u.position, things.star.position) < dist2(u.position, star_p89.position) || star_p89.energy == 0) {
                    if(dist2(u.position, things.star.position) > 198.5*198.5) {
                        u.move(interp(things.star.position, g.position, 198));
                    }
                } else {
                    if(dist2(u.position, star_p89.position) > 198.5*198.5) {
                        u.move(interp(star_p89.position, g.position, 198));
                    }
                }
            } else {
                attackBlob.push(u);
            }
        } else {
            attackBlob.push(u);
        }
    }

    var closest = g.position;
    var d = 1000000000;
    for(var h of attackBlob) {
        var ad = dist2(h.position, g.position);
        if(ad < d) {
            closest = h.position;
            d = ad;
        }
    }
    //var allin = attackBlob.filter(a => dist2(a.position, closest) < 100*100)
    var blobAll = attackBlob.reduce((p, a) => {return add(p, a.position)}, [0, 0]);
    var blobCenter = mul(blobAll, 1/attackBlob.length);
    var attackPos = g.position;

    var m = g.units.reduce((p, a) => {return Math.max(p, dist2(blobCenter, a.position))}, 400);
    graphics.circle(blobCenter, Math.sqrt(m));
    
    graphics.line(blobCenter, g.position);

    /*
    var blobDist = dist(blobCenter, g.position);
    if(dist2(attackPos, base.position) < 500*500) {
        attackPos = interp(base.position, attackPos, 250)
    } else {
        var blobEnergy = allin.reduce((a, s) => a + s.energy, 0);
        var bdist = (blobEnergy / g.energy) * 0.5;
        attackPos = interp(blobCenter, attackPos, blobDist * bdist);
    }
    */

    /*if(dist2(blobCenter, attackPos) > 40*40) {
        attackPos = interp(blobCenter, attackPos, 40);
    }*/
    var max = 1;
    for(var u of attackBlob) {
        var d = dist(u.position, blobCenter)
        if(max < d) {
            max = d
        }
    }
    for(var u of attackBlob) {
        var nextPos = attackPos;
        var curPos = blobCenter;
        var d = dist(u.position, blobCenter);
        var adj = 15 * d/max;
        if(dist2(curPos, u.position) > adj*adj) {
            curPos = interp(u.position, curPos, adj)
        }

        if(dist2(nextPos, curPos) > 20*20) {
            nextPos = interp(curPos, nextPos, 20);
        }
        
        u.move(nextPos);
    }
    var allPassList = buildList(s => s.player_id == this_player_id, s => dist2(s.position, g.position));
    var passList = buildList(s => inGlob[s.id], s => dist2(s.position, attackPos));

    for(var i = 0; i < passList.length; i++) {
        var u = passList[i].s;
        if(u.energy + (e[u.id]||0) < u.energy_capacity) {
            for(var j = allPassList.length-1; j >= 0; j--) {
                var s = allPassList[j].s;
                if(s.id == u.id) {
                    break;
                }
                if(energizing[s.id]) {
                    continue;
                }
                if(dist2(s.position, u.position) > 200*200) {
                    continue;
                }
                if(u.energy + (e[u.id]||0) >= u.energy_capacity) {
                    break;
                }
                if(s.energy + (e[s.id]||0) > 0) {
                    e[s.id] = (e[s.id]||0) - s.size;
                    e[u.id] = (e[u.id]||0) + s.size;
                    s.energize(u);
                    energizing[s.id] = true;
                }
            }
        }
    }
    if(g.mode == "drain") {
        for (let u of g.units.slice(1)) {
            if(u.energy < u.energy_capacity-u.size) {
                u.energize(u);
            } else {
                u.energize(g.units[0]);
            }
        }
    }
}
console.log("globs " + (new Date().getTime() - section));

console.log('Execution time: ' + (new Date().getTime() - start));
