// yare.io bot v10 - tighter kill allocation, anti-overkill, hard separation, simple pod retreat

function dsq(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1]; return dx * dx + dy * dy; }
function dist(a, b) { return Math.sqrt(dsq(a, b)); }
function aliveMine() { var r = []; for (var i = 0; i < my_cats.length; i++) if (my_cats[i] && my_cats[i].hp > 0) r.push(my_cats[i]); return r; }
function aliveEnemies() {
    var r = [], all = Object.values(cats);
    for (var i = 0; i < all.length; i++) if (all[i].hp > 0 && all[i].player_id !== this_player_id) r.push(all[i]);
    return r;
}
function canPew(a, b) { return dsq(a.position, b.position) <= 40000; }
function center(units) {
    if (!units.length) return [0, 0];
    var sx = 0, sy = 0;
    for (var i = 0; i < units.length; i++) { sx += units[i].position[0]; sy += units[i].position[1]; }
    return [sx / units.length, sy / units.length];
}
function stepToward(from, to, s) {
    var dx = to[0] - from[0], dy = to[1] - from[1];
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d <= s || d === 0) return [to[0], to[1]];
    var k = s / d;
    return [from[0] + dx * k, from[1] + dy * k];
}
function clampCircle(p, margin) {
    var lim = death_circle - margin;
    var r = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
    if (r > lim && r > 0) return [p[0] * lim / r, p[1] * lim / r];
    return p;
}
function nearestPod(pos) {
    var best = pods[0], bd = 1e18;
    for (var i = 0; i < pods.length; i++) {
        var d = dsq(pos, pods[i]);
        if (d < bd) { bd = d; best = pods[i]; }
    }
    return best;
}
function inPod(pos, pod) { return Math.abs(pos[0] - pod[0]) <= 20 && Math.abs(pos[1] - pod[1]) <= 20; }

if (!memory.v10) {
    memory.v10 = {
        side: 0,
        laneY: {},
        retreatPod: {},
        spin: 1
    };
}

var mine = aliveMine();
var enemies = aliveEnemies();

if (mine.length > 0 && memory.v10.side === 0) {
    memory.v10.side = center(mine)[0] < 0 ? -1 : 1;
}
if (tick % 6 === 0) memory.v10.spin *= -1;

if (mine.length > 0 && enemies.length > 0) {
    var myC = center(mine), enC = center(enemies);

    // Stable lanes
    var sorted = mine.slice().sort(function (a, b) {
        return parseInt(a.id.split("_").pop(), 10) - parseInt(b.id.split("_").pop(), 10);
    });
    var gap = 46;
    for (var i = 0; i < sorted.length; i++) {
        var id0 = sorted[i].id;
        if (memory.v10.laneY[id0] === undefined) memory.v10.laneY[id0] = (i - 4) * gap;
    }

    var myE = 0, enE = 0;
    for (i = 0; i < mine.length; i++) myE += mine[i].energy;
    for (i = 0; i < enemies.length; i++) enE += enemies[i].energy;

    var losing = (mine.length < enemies.length) || (myE + 4 < enE);

    // Retreat policy: only truly low cats retreat, others keep firing to avoid DPS collapse
    var mode = {}, desired = {};
    for (i = 0; i < mine.length; i++) {
        var c = mine[i], cid = c.id;
        var eInRange = 0;
        for (var j = 0; j < enemies.length; j++) if (dsq(c.position, enemies[j].position) <= 40000) eInRange++;
        var ret = false;

        if (memory.v10.retreatPod[cid]) {
            var podKeep = memory.v10.retreatPod[cid];
            ret = !(c.energy >= 7 || (c.energy >= 5 && !losing)) || !inPod(c.position, podKeep);
        } else {
            if (c.energy <= 0) ret = true;
            else if (c.energy <= 1 && eInRange >= 2) ret = true;
            else if (c.energy <= 2 && eInRange >= 5) ret = true;
        }

        if (ret) {
            var pod = memory.v10.retreatPod[cid] || nearestPod(c.position);
            memory.v10.retreatPod[cid] = pod;
            mode[cid] = "R";
            var n = parseInt(cid.split("_").pop(), 10) % 4;
            var ox = (n === 0 ? -14 : n === 1 ? 14 : n === 2 ? -14 : 14);
            var oy = (n <= 1 ? -14 : 14);
            desired[cid] = [pod[0] + ox, pod[1] + oy];
        } else {
            delete memory.v10.retreatPod[cid];
            mode[cid] = "F";
        }
    }

    // Build fighter positions around weighted focus center (not single rigid target)
    var enemyByY = enemies.slice().sort(function (a, b) { return a.position[1] - b.position[1]; });
    var focus = enemyByY[Math.floor(enemyByY.length / 2)];

    for (i = 0; i < mine.length; i++) {
        var mc = mine[i], id = mc.id;
        if (mode[id] === "R") continue;

        var tx, ty;
        if (focus) {
            var ex = focus.position[0], ey = focus.position[1];
            var vx = mc.position[0] - ex, vy = mc.position[1] - ey;
            var d = Math.sqrt(vx * vx + vy * vy); if (d < 1) d = 1;

            var ring = losing ? 188 : 180;
            var rx = ex + vx / d * ring;
            var ry = ey + vy / d * ring;

            var lane = memory.v10.laneY[id] * 0.58 + enC[1] * 0.42;
            var px = -vy / d, py = vx / d;
            var sgn = (parseInt(id.split("_").pop(), 10) % 2 === 0 ? 1 : -1) * memory.v10.spin;
            var sideStep = 18 * sgn;

            tx = rx + px * sideStep;
            ty = ry * 0.45 + lane * 0.55 + py * sideStep * 0.35;

            var guardX = memory.v10.side === -1 ? -10 : 10;
            if (memory.v10.side === -1 && tx > guardX) tx = guardX;
            if (memory.v10.side === 1 && tx < guardX) tx = guardX;
        } else {
            tx = mc.position[0] - memory.v10.side * 10;
            ty = mc.position[1];
        }
        desired[id] = clampCircle([tx, ty], 18);
    }

    // Predict next positions
    var nextPos = {};
    for (i = 0; i < mine.length; i++) nextPos[mine[i].id] = stepToward(mine[i].position, desired[mine[i].id], 20);

    // HARD separation
    var ids = mine.map(function (c) { return c.id; });
    for (var it = 0; it < 30; it++) {
        var changed = false;
        for (var a = 0; a < ids.length; a++) for (var b = a + 1; b < ids.length; b++) {
            var ia = ids[a], ib = ids[b];
            var pa = nextPos[ia], pb = nextPos[ib];
            var dx = pb[0] - pa[0], dy = pb[1] - pa[1];
            var d2 = dx * dx + dy * dy;
            var minD = (mode[ia] === "R" || mode[ib] === "R") ? 30 : 35;
            if (d2 < minD * minD) {
                var d = Math.sqrt(d2); if (d < 0.001) d = 0.001;
                var nx = dx / d, ny = dy / d;
                var push = (minD - d) * 0.92;
                pa[0] -= nx * push; pa[1] -= ny * push;
                pb[0] += nx * push; pb[1] += ny * push;
                changed = true;
            }
        }
        if (!changed) break;
    }

    // Move first
    for (i = 0; i < mine.length; i++) {
        var cMove = mine[i], p = stepToward(cMove.position, nextPos[cMove.id], 20);
        p = clampCircle(p, 16);
        cMove.move(p);
        nextPos[cMove.id] = p;
    }

    // ---- Fire allocation: multi-target kill planner (fixes overkill/spread issues) ----
    var fighters = [];
    for (i = 0; i < mine.length; i++) if (mode[mine[i].id] === "F" && mine[i].energy > 0) fighters.push(mine[i]);

    // shooters sorted by energy high->low
    fighters.sort(function (a, b) { return b.energy - a.energy; });

    // Build candidate targets with required shots
    var targets = enemies.slice();
    targets.sort(function (a, b) {
        // Prefer killable low-energy and central clumps
        var ac = 0, bc = 0;
        for (var k = 0; k < enemies.length; k++) {
            if (enemies[k].id !== a.id && dsq(a.position, enemies[k].position) <= 400) ac++;
            if (enemies[k].id !== b.id && dsq(b.position, enemies[k].position) <= 400) bc++;
        }
        var sa = (10 - a.energy) * 30 + ac * 18 - Math.abs(a.position[1] - enC[1]) * 0.05;
        var sb = (10 - b.energy) * 30 + bc * 18 - Math.abs(b.position[1] - enC[1]) * 0.05;
        return sb - sa;
    });

    var assigned = {};
    for (i = 0; i < fighters.length; i++) assigned[fighters[i].id] = false;

    // Pass 1: secure guaranteed kills with exact/near-exact shots
    for (var t = 0; t < targets.length; t++) {
        var tar = targets[t];
        var need = Math.floor(tar.energy / 2) + 1;
        var avail = [];
        for (i = 0; i < fighters.length; i++) {
            var sh = fighters[i];
            if (assigned[sh.id]) continue;
            if (canPew(sh, tar)) avail.push(sh);
        }
        if (avail.length >= need) {
            // choose lowest-energy shooters that can still shoot to preserve high-energy anchors
            avail.sort(function (a, b) { return a.energy - b.energy; });
            for (i = 0; i < need; i++) {
                avail[i].pew(tar.id);
                assigned[avail[i].id] = true;
            }
        }
    }

    // Pass 2: leftover shooters all focus best reachable target (damage concentration)
    for (i = 0; i < fighters.length; i++) {
        var shooter = fighters[i];
        if (assigned[shooter.id]) continue;

        var best = null, bestScore = -1e18;
        for (t = 0; t < targets.length; t++) {
            var e = targets[t];
            if (!canPew(shooter, e)) continue;

            var cl = 0;
            for (var q = 0; q < enemies.length; q++) if (enemies[q].id !== e.id && dsq(e.position, enemies[q].position) <= 400) cl++;
            var score = (10 - e.energy) * 40 + cl * 20 - Math.abs(e.position[1] - shooter.position[1]) * 0.08;
            if (score > bestScore) { bestScore = score; best = e; }
        }
        if (best) shooter.pew(best.id);
    }

    // Minimal emergency heal: if no energy and in-range donor exists
    for (i = 0; i < mine.length; i++) {
        var weak = mine[i];
        if (weak.energy > 0 || mode[weak.id] !== "F") continue;
        var donor = null;
        for (j = 0; j < mine.length; j++) {
            var dcat = mine[j];
            if (dcat.id === weak.id || mode[dcat.id] !== "F") continue;
            if (dcat.energy <= 2) continue;
            if (canPew(dcat, weak)) { donor = dcat; break; }
        }
        if (donor) donor.pew(weak.id);
    }

    // Marks + concise debug
    var minSep = 9999;
    for (a = 0; a < ids.length; a++) for (b = a + 1; b < ids.length; b++) {
        var dd = dist(nextPos[ids[a]], nextPos[ids[b]]);
        if (dd < minSep) minSep = dd;
    }
    if (ids.length < 2) minSep = 9999;

    for (i = 0; i < mine.length; i++) {
        var mk = (mode[mine[i].id] || "?") + ":" + mine[i].energy;
        mine[i].set_mark(mk);
    }

    if (tick <= 30 || tick % 20 === 0 || mine.length <= 4 || enemies.length <= 4) {
        var fr = 0, rr = 0;
        for (i = 0; i < mine.length; i++) { if (mode[mine[i].id] === "R") rr++; else fr++; }
        console.log("[t" + tick + "] " + mine.length + "v" + enemies.length + " E " + myE + "v" + enE + " F/R " + fr + "/" + rr + " sep " + minSep.toFixed(1));
    }
}