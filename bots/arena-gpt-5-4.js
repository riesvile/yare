// yare.io bot - iteration 10
// Final revision goals:
// - Never enter "regroup-heal death spiral" during first contact.
// - Hard-focus fire for first kill, with explicit anti-overkill shot allocation.
// - Exploit enemy clumps with splash-aware target choice.
// - Maintain hard separation with lane formation and post-process spacing.
// - Retreat only individually; team keeps fighting unless truly lost.
// - Low-energy cats run to safer pods instead of donating endless heals.

function dist2(a, b) {
    var dx = a[0] - b[0], dy = a[1] - b[1];
    return dx * dx + dy * dy;
}
function dist(a, b) { return Math.sqrt(dist2(a, b)); }
function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
function alive(c) { return c && c.hp > 0; }

function friendsAlive() {
    var out = [];
    for (var i = 0; i < my_cats.length; i++) if (my_cats[i].hp > 0) out.push(my_cats[i]);
    return out;
}
function enemiesAlive() {
    var vals = Object.values(cats), out = [];
    for (var i = 0; i < vals.length; i++) {
        if (vals[i].hp > 0 && vals[i].player_id !== this_player_id) out.push(vals[i]);
    }
    return out;
}
function canPew(a, b) {
    return alive(a) && alive(b) && a.energy >= 1 && dist2(a.position, b.position) <= 200 * 200;
}
function towards(from, to, step) {
    var dx = to[0] - from[0], dy = to[1] - from[1];
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d === 0) return [from[0], from[1]];
    if (d <= step) return [to[0], to[1]];
    return [from[0] + dx * step / d, from[1] + dy * step / d];
}
function away(from, threat, step) {
    var dx = from[0] - threat[0], dy = from[1] - threat[1];
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d === 0) return [from[0] + step, from[1]];
    return [from[0] + dx * step / d, from[1] + dy * step / d];
}
function centerOfCats(arr) {
    var c = [0, 0];
    if (!arr.length) return c;
    for (var i = 0; i < arr.length; i++) {
        c[0] += arr[i].position[0];
        c[1] += arr[i].position[1];
    }
    c[0] /= arr.length;
    c[1] /= arr.length;
    return c;
}
function nearestEnemy(pos, enemies) {
    var best = null, bestD = 1e18;
    for (var i = 0; i < enemies.length; i++) {
        var d = dist2(pos, enemies[i].position);
        if (d < bestD) { bestD = d; best = enemies[i]; }
    }
    return best;
}
function insidePod(pos, pod) {
    return Math.abs(pos[0] - pod[0]) <= 20 && Math.abs(pos[1] - pod[1]) <= 20;
}
function nearestPod(pos) {
    var best = pods[0], bestD = 1e18;
    for (var i = 0; i < pods.length; i++) {
        var d = dist2(pos, pods[i]);
        if (d < bestD) { bestD = d; best = pods[i]; }
    }
    return best;
}
function safestPod(pos, enemies) {
    var best = pods[0], bestScore = -1e18;
    for (var i = 0; i < pods.length; i++) {
        var pod = pods[i];
        var minEnemy = 1e18;
        for (var j = 0; j < enemies.length; j++) {
            var d = dist2(pod, enemies[j].position);
            if (d < minEnemy) minEnemy = d;
        }
        var score = minEnemy - dist2(pos, pod) * 0.7;
        if (score > bestScore) { bestScore = score; best = pod; }
    }
    return best;
}
function enemyThreatAt(pos, enemies) {
    var n = 0;
    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].energy >= 1 && dist2(pos, enemies[i].position) <= 200 * 200) n++;
    }
    return n;
}
function sortByEnergyDesc(arr) {
    return arr.slice().sort(function (a, b) {
        if (b.energy !== a.energy) return b.energy - a.energy;
        return a.id < b.id ? -1 : 1;
    });
}
function avoidBarricades(pos) {
    var out = [pos[0], pos[1]];
    for (var i = 0; i < barricades.length; i++) {
        var b = barricades[i];
        var dx = out[0] - b[0], dy = out[1] - b[1];
        var d = Math.sqrt(dx * dx + dy * dy);
        var minR = 114;
        if (d < minR) {
            if (d === 0) out = [b[0] + minR, b[1]];
            else out = [b[0] + dx * minR / d, b[1] + dy * minR / d];
        }
    }
    return out;
}
function limitInsideCircle(pos, margin) {
    var r = death_circle - margin;
    var d = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1]);
    if (d <= r || d === 0) return pos;
    return [pos[0] * r / d, pos[1] * r / d];
}
function enemySplashCount(target, enemies) {
    var c = 0;
    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].id !== target.id && dist2(target.position, enemies[i].position) <= 20 * 20) c++;
    }
    return c;
}
function countShooters(target, friends, minEnergyAfter) {
    var c = 0;
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].energy > minEnergyAfter && dist2(friends[i].position, target.position) <= 200 * 200) c++;
    }
    return c;
}
function countMyNeighborsWithin(pos, friends, radius, ignoreId) {
    var r2 = radius * radius, c = 0;
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].id === ignoreId) continue;
        if (dist2(pos, friends[i].position) <= r2) c++;
    }
    return c;
}
function projectedMove(from, to, step) {
    return towards(from, to, step);
}
function chooseBestTarget(friends, enemies) {
    var best = null, bestScore = -1e18;
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        var inRange = countShooters(e, friends, 0);
        var strong = countShooters(e, friends, 1);
        var need = Math.floor(e.energy / 2) + 1;
        var splash = enemySplashCount(e, enemies);
        var closest = 1e18;
        for (var j = 0; j < friends.length; j++) {
            var d = dist2(friends[j].position, e.position);
            if (d < closest) closest = d;
        }

        var score = 0;
        score += Math.min(inRange, need) * 80;
        score += Math.max(0, inRange - need) * 10;
        score += strong * 15;
        score += (10 - e.energy) * 24;
        score += splash * 95; // aggressively prefer enemy clumps
        if (inRange >= need) score += 180;
        else if (inRange === need - 1) score += 55;
        if (memory.lastPrimary === e.id) score += 18;
        score -= Math.sqrt(closest) * 0.08;

        if (score > bestScore) {
            bestScore = score;
            best = e;
        }
    }
    return best;
}
function chooseHealTarget(donor, friends, enemies) {
    var best = null, bestScore = -1e18;
    for (var i = 0; i < friends.length; i++) {
        var f = friends[i];
        if (f.id === donor.id) continue;
        if (f.energy >= f.energy_capacity) continue;
        if (dist2(donor.position, f.position) > 200 * 200) continue;
        var threat = enemyThreatAt(f.position, enemies);
        var score = 0;
        if (f.energy <= 0) score += 120;
        else if (f.energy === 1) score += 90;
        else if (f.energy === 2) score += 35;
        score += threat * 16;
        score -= f.energy * 3;
        if (score > bestScore) { bestScore = score; best = f; }
    }
    return bestScore >= 60 ? best : null;
}
function hardSeparate(liveCats, desiredMap) {
    var ids = [];
    for (var i = 0; i < liveCats.length; i++) ids.push(liveCats[i].id);

    var changed = true, iter = 0;
    while (changed && iter < 36) {
        changed = false;
        iter++;
        for (var a = 0; a < ids.length; a++) {
            for (var b = a + 1; b < ids.length; b++) {
                var pa = desiredMap[ids[a]] || cats[ids[a]].position;
                var pb = desiredMap[ids[b]] || cats[ids[b]].position;
                var dx = pb[0] - pa[0], dy = pb[1] - pa[1];
                var d = Math.sqrt(dx * dx + dy * dy);
                if (d < 33) {
                    changed = true;
                    if (d === 0) { dx = 1; dy = 0; d = 1; }
                    var push = (33 - d) / 2 + 1.1;
                    var ux = dx / d, uy = dy / d;
                    desiredMap[ids[a]] = [pa[0] - ux * push, pa[1] - uy * push];
                    desiredMap[ids[b]] = [pb[0] + ux * push, pb[1] + uy * push];
                }
            }
        }
    }

    for (var j = 0; j < ids.length; j++) {
        desiredMap[ids[j]] = avoidBarricades(limitInsideCircle(desiredMap[ids[j]], 10));
    }
}

if (!memory.init) {
    memory.init = 1;
    memory.roles = {};
    memory.spawnSide = null;
    memory.prevFriendCount = 9;
    memory.prevEnemyCount = 9;
    memory.lastPrimary = null;
    memory.lastMode = "";
}

var liveFriends = friendsAlive();
var liveEnemies = enemiesAlive();

if (memory.spawnSide === null && liveFriends.length) {
    var sx = 0;
    for (var i0 = 0; i0 < liveFriends.length; i0++) sx += liveFriends[i0].position[0];
    sx /= liveFriends.length;
    memory.spawnSide = sx < 0 ? "left" : "right";
}

var sortedFriends = liveFriends.slice().sort(function (a, b) {
    return a.id < b.id ? -1 : 1;
});
for (var r = 0; r < sortedFriends.length; r++) {
    if (memory.roles[sortedFriends[r].id] === undefined) memory.roles[sortedFriends[r].id] = r;
}

var myEnergy = 0, enemyEnergy = 0;
for (var i1 = 0; i1 < liveFriends.length; i1++) myEnergy += liveFriends[i1].energy;
for (var i2 = 0; i2 < liveEnemies.length; i2++) enemyEnergy += liveEnemies[i2].energy;

var friendCenter = centerOfCats(liveFriends);
var enemyCenter = centerOfCats(liveEnemies);
var sign = memory.spawnSide === "left" ? -1 : 1;

var primary = liveEnemies.length ? chooseBestTarget(liveFriends, liveEnemies) : null;
if (primary) memory.lastPrimary = primary.id;

var earlyFight = tick <= 18 && liveFriends.length >= 6 && liveEnemies.length >= 6;
var hardLosing = liveFriends.length + 2 <= liveEnemies.length || myEnergy + liveFriends.length * 0.2 < enemyEnergy - 10;
var softLosing = liveFriends.length < liveEnemies.length || myEnergy + liveFriends.length * 0.7 < enemyEnergy;
var teamRetreat = !earlyFight && hardLosing;

var commit = false;
var lethalNeed = primary ? (Math.floor(primary.energy / 2) + 1) : 99;
var readyShooters = primary ? countShooters(primary, liveFriends, 0) : 0;
var strongShooters = primary ? countShooters(primary, liveFriends, 1) : 0;

if (primary) {
    if (readyShooters >= lethalNeed) commit = true;
    else if (earlyFight && readyShooters >= 7) commit = true;
    else if (!teamRetreat && readyShooters >= Math.min(6, liveFriends.length)) commit = true;
}
if (teamRetreat) commit = false;

// ---------- shot planning ----------
var shotPlan = {};
var healPlan = {};
var targetIncoming = {};
for (var te0 = 0; te0 < liveEnemies.length; te0++) targetIncoming[liveEnemies[te0].id] = 0;

if (commit && primary) {
    var shooters = [];
    for (var s = 0; s < liveFriends.length; s++) {
        if (canPew(liveFriends[s], primary)) shooters.push(liveFriends[s]);
    }
    shooters = sortByEnergyDesc(shooters);

    // primary lethal allocation: exactly enough if possible
    var assigned = 0;
    for (var sp = 0; sp < shooters.length && assigned < lethalNeed; sp++) {
        shotPlan[shooters[sp].id] = primary.id;
        targetIncoming[primary.id] += 2;
        assigned++;
    }

    // extra shots only if they gain splash value or no better option
    for (var sp2 = assigned; sp2 < shooters.length; sp2++) {
        var sh = shooters[sp2];
        if (sh.energy <= 1) continue;
        var best = null, bestScore = -1e18;
        for (var et = 0; et < liveEnemies.length; et++) {
            var e = liveEnemies[et];
            if (!canPew(sh, e)) continue;
            var remaining = e.energy - targetIncoming[e.id];
            var need = Math.floor(Math.max(0, remaining) / 2) + 1;
            var splash = enemySplashCount(e, liveEnemies);
            var score = 0;
            if (remaining > 0) score += 90 - remaining * 4;
            else score -= 30;
            score += splash * 95;
            if (e.id === primary.id) score -= 40;
            score += countShooters(e, liveFriends, 0) * 4;
            if (score > bestScore) { bestScore = score; best = e; }
        }
        if (best && bestScore >= 25) {
            shotPlan[sh.id] = best.id;
            targetIncoming[best.id] += 2;
        }
    }
} else {
    // Opportunistic only: if a lethal or splash-heavy shot exists, take it.
    for (var os = 0; os < liveFriends.length; os++) {
        var shooter = liveFriends[os];
        if (shooter.energy < 2) continue;
        var best2 = null, bestScore2 = -1e18;
        for (var et2 = 0; et2 < liveEnemies.length; et2++) {
            var e2 = liveEnemies[et2];
            if (!canPew(shooter, e2)) continue;
            var need2 = Math.floor(e2.energy / 2) + 1;
            var inRange2 = countShooters(e2, liveFriends, 0);
            var splash2 = enemySplashCount(e2, liveEnemies);
            var score2 = 0;
            if (inRange2 >= need2) score2 += 170;
            score2 += splash2 * 85;
            score2 += (10 - e2.energy) * 14;
            if (score2 > bestScore2) { bestScore2 = score2; best2 = e2; }
        }
        if (best2 && bestScore2 >= 150) {
            shotPlan[shooter.id] = best2.id;
            targetIncoming[best2.id] += 2;
        }
    }
}

// selective healing only, never whole-team heal spiral
for (var h = 0; h < liveFriends.length; h++) {
    var donor = liveFriends[h];
    if (shotPlan[donor.id]) continue;
    if (donor.energy < 3) continue;
    if (earlyFight && !teamRetreat) continue;

    var ht = chooseHealTarget(donor, liveFriends, liveEnemies);
    if (ht && (ht.energy <= 1 || (hardLosing && ht.energy <= 2))) {
        healPlan[donor.id] = ht.id;
    }
}

// execute pews
for (var p = 0; p < liveFriends.length; p++) {
    var c = liveFriends[p];
    if (shotPlan[c.id]) {
        var t = cats[shotPlan[c.id]];
        if (t && t.hp > 0 && c.energy >= 1 && dist2(c.position, t.position) <= 200 * 200) c.pew(t);
    } else if (healPlan[c.id]) {
        var a = cats[healPlan[c.id]];
        if (a && a.hp > 0 && c.energy >= 1 && dist2(c.position, a.position) <= 200 * 200) c.pew(a);
    }
}

// ---------- movement ----------
var desired = {};
var retreatIds = {};
var anchorEnemy = primary || nearestEnemy(friendCenter, liveEnemies);

for (var rf = 0; rf < sortedFriends.length; rf++) {
    var catr = sortedFriends[rf];
    var threat = enemyThreatAt(catr.position, liveEnemies);
    var nearPod = nearestPod(catr.position);
    var safePod = safestPod(catr.position, liveEnemies);

    var mustRetreat = false;
    if (catr.energy <= 0) mustRetreat = true;
    else if (catr.energy === 1 && threat >= 1) mustRetreat = true;
    else if (catr.energy === 2 && threat >= 2) mustRetreat = true;
    else if (!earlyFight && catr.energy <= 2 && threat >= 1) mustRetreat = true;
    else if (hardLosing && catr.energy <= 4) mustRetreat = true;
    else if (catr.energy <= 3 && !insidePod(catr.position, nearPod) && dist2(catr.position, nearPod) < 180 * 180) mustRetreat = true;

    if (mustRetreat) retreatIds[catr.id] = (threat >= 2 || hardLosing) ? safePod : nearPod;
}

var attackRange = commit ? 188 : 205;
if (teamRetreat) attackRange = 225;

var attackCenter = friendCenter;
if (anchorEnemy) {
    attackCenter = [
        anchorEnemy.position[0] - sign * attackRange,
        clamp(anchorEnemy.position[1], -145, 145)
    ];
}

for (var m = 0; m < sortedFriends.length; m++) {
    var catm = sortedFriends[m];
    var role = memory.roles[catm.id] || 0;
    var slot = role - 4;
    var nearest = nearestEnemy(catm.position, liveEnemies);
    var targetPos = [catm.position[0], catm.position[1]];

    if (!liveEnemies.length) {
        var restX = memory.spawnSide === "left" ? 120 : -120;
        targetPos = towards(catm.position, [restX, slot * 40], 20);
    } else if (retreatIds[catm.id]) {
        var pod = retreatIds[catm.id];
        if (insidePod(catm.position, pod) && catm.energy < 9) targetPos = [pod[0], pod[1]];
        else targetPos = towards(catm.position, pod, 20);
    } else if (anchorEnemy) {
        var laneY = clamp(anchorEnemy.position[1] + slot * 36, -175, 175);
        var laneX = attackCenter[0] + ((Math.abs(slot) % 2 === 0 ? -6 : 6) * sign);
        var slotAnchor = [laneX, laneY];

        var d = nearest ? dist(catm.position, nearest.position) : 999;
        var threatM = enemyThreatAt(catm.position, liveEnemies);
        var allyNear = countMyNeighborsWithin(catm.position, liveFriends, 24, catm.id);

        if (teamRetreat) {
            if (nearest && d < 195) {
                targetPos = away(catm.position, nearest.position, 20);
                targetPos[1] += slot * 2;
            } else {
                targetPos = towards(catm.position, slotAnchor, 18);
            }
        } else if (!commit) {
            if (nearest && d < 188) {
                targetPos = away(catm.position, nearest.position, 14);
                targetPos[1] += slot * 2;
            } else if (d > 215) {
                targetPos = towards(catm.position, slotAnchor, 18);
            } else {
                targetPos = towards(catm.position, slotAnchor, 8);
            }
        } else {
            if (d > 196) {
                targetPos = towards(catm.position, slotAnchor, 20);
            } else if (d > 186) {
                targetPos = towards(catm.position, slotAnchor, 9);
            } else if (d < 145 && (threatM >= 2 || catm.energy <= 3)) {
                targetPos = away(catm.position, nearest.position, 16);
                targetPos[1] += slot * 2;
            } else if (d < 130) {
                targetPos = away(catm.position, nearest.position, 12);
                targetPos[1] += slot * 2;
            } else {
                targetPos = towards(catm.position, slotAnchor, 5);
            }
        }

        if (allyNear >= 1) {
            targetPos[1] += slot >= 0 ? 4 : -4;
        }
    }

    desired[catm.id] = avoidBarricades(limitInsideCircle(targetPos, 10));
}

hardSeparate(sortedFriends, desired);

// execute moves + marks
for (var mv = 0; mv < sortedFriends.length; mv++) {
    var mc = sortedFriends[mv];
    if (desired[mc.id]) mc.move(desired[mc.id]);

    var mode = "F";
    if (retreatIds[mc.id]) mode = "P";
    else if (shotPlan[mc.id] && primary && shotPlan[mc.id] === primary.id) mode = "K";
    else if (shotPlan[mc.id]) mode = "S";
    else if (healPlan[mc.id]) mode = "H";
    else if (!commit && !teamRetreat) mode = "W";
    if (teamRetreat) mode = "R" + mode;
    mc.set_mark(mode + mc.energy);
}

// ---------- logging ----------
var modeLabel = teamRetreat ? "REG" : (commit ? "COM" : "WAIT");
var doLog =
    tick <= 16 ||
    liveFriends.length !== memory.prevFriendCount ||
    liveEnemies.length !== memory.prevEnemyCount ||
    modeLabel !== memory.lastMode ||
    tick % 25 === 0;

if (doLog) {
    console.log(
        "T", tick,
        "F", liveFriends.length, myEnergy,
        "E", liveEnemies.length, enemyEnergy,
        "M", modeLabel,
        "P", primary ? (primary.id.split("_")[1] + ":" + primary.energy + ":aoe" + enemySplashCount(primary, liveEnemies)) : "-",
        "RNG", readyShooters + "/" + lethalNeed,
        "RET", Object.keys(retreatIds).length
    );

    var bits = [];
    for (var z = 0; z < sortedFriends.length; z++) {
        var cc = sortedFriends[z];
        if (shotPlan[cc.id]) bits.push(cc.id.split("_")[1] + ">" + shotPlan[cc.id].split("_")[1]);
        else if (healPlan[cc.id]) bits.push(cc.id.split("_")[1] + ">H" + healPlan[cc.id].split("_")[1]);
    }
    console.log("PLAN", tick, bits.join(","));
}

memory.prevFriendCount = liveFriends.length;
memory.prevEnemyCount = liveEnemies.length;
memory.lastMode = modeLabel;