// ============================================================
//  Clowder Bot — each cat has its own mind (and name)
// ============================================================

// ----- Geometry helpers -----

function dist(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
}

function distSq(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return dx * dx + dy * dy;
}

function towards(from, to, amount) {
    const d = dist(from, to);
    if (d <= amount) return to;
    const ratio = amount / d;
    return [
        from[0] + (to[0] - from[0]) * ratio,
        from[1] + (to[1] - from[1]) * ratio,
    ];
}

function away(from, threat, amount) {
    const d = dist(from, threat);
    if (d === 0) return [from[0] + amount, from[1]];
    const ratio = amount / d;
    return [
        from[0] + (from[0] - threat[0]) * ratio,
        from[1] + (from[1] - threat[1]) * ratio,
    ];
}

function centroid(positions) {
    let sx = 0, sy = 0;
    for (const p of positions) { sx += p[0]; sy += p[1]; }
    return [sx / positions.length, sy / positions.length];
}

// ----- Entity query helpers -----

function aliveOf(list) {
    return list.filter(c => c.hp > 0);
}

function livingEnemies() {
    const out = [];
    for (const id in cats) {
        const c = cats[id];
        if (c.player_id !== this_player_id && c.hp > 0) out.push(c);
    }
    return out;
}

function energyDiff() {
    let ours = 0, theirs = 0;
    for (const id in cats) {
        const c = cats[id];
        if (c.hp === 0) continue;
        if (c.player_id === this_player_id) ours += c.energy;
        else theirs += c.energy;
    }
    return ours - theirs;
}

function energyAdvantageRatio() {
    let ours = 0, theirs = 0;
    for (const id in cats) {
        const c = cats[id];
        if (c.hp === 0) continue;
        if (c.player_id === this_player_id) ours += c.energy;
        else theirs += c.energy;
    }
    const total = ours + theirs;
    if (total === 0) return 0;
    return (ours - theirs) / total;
}

function endgameState() {
    let ours = 0, theirs = 0;
    for (const id in cats) {
        const c = cats[id];
        if (c.hp === 0) continue;
        if (c.player_id === this_player_id) ours++;
        else theirs++;
    }
    if (ours <= 2 && theirs >= ours + 2) return 'losing';
    if (theirs <= 2 && ours >= theirs + 2) return 'winning';
    const diff = energyDiff();
    if (diff <= -50) return 'losing';
    if (diff >= 50) return 'winning';
    return null;
}

function enemiesInRange(pos, range) {
    let count = 0;
    for (const e of livingEnemies()) {
        if (dist(pos, e.position) <= range) count++;
    }
    return count;
}

function friendsInRange(pos, range) {
    let count = 0;
    for (const c of aliveOf(my_cats)) {
        if (dist(pos, c.position) <= range) count++;
    }
    return count;
}

function aggressionMod() {
    const diff = energyDiff();
    if (diff > 30) return -25;
    if (diff > 15) return -15;
    if (diff > 0)  return -5;
    if (diff > -15) return 5;
    if (diff > -30) return 15;
    return 25;
}

function closestTo(pos, list) {
    let best = null, bestD = Infinity;
    for (const c of list) {
        const d = distSq(pos, c.position);
        if (d < bestD) { bestD = d; best = c; }
    }
    return best;
}

function weakestOf(list) {
    let best = null, bestE = Infinity;
    for (const c of list) {
        if (c.energy < bestE) { bestE = c.energy; best = c; }
    }
    return best;
}

function pewableEnemies(cat) {
    return (cat.sight.enemies_pewable || []).map(id => cats[id]).filter(c => c && c.hp > 0);
}

function pewableFriends(cat) {
    return (cat.sight.friends_pewable || []).map(id => cats[id]).filter(c => c && c.hp > 0);
}

// ----- Map helpers -----

function nearestPod(pos) {
    let best = pods[0], bestD = distSq(pos, pods[0]);
    for (let i = 1; i < pods.length; i++) {
        const d = distSq(pos, pods[i]);
        if (d < bestD) { bestD = d; best = pods[i]; }
    }
    return best;
}

function isOnPod(pos) {
    for (const p of pods) {
        if (Math.abs(pos[0] - p[0]) <= 20 && Math.abs(pos[1] - p[1]) <= 20) return true;
    }
    return false;
}

function isOutsideCircle(pos) {
    return dist(pos, [0, 0]) > death_circle;
}

// ============================================================
//  Cat identities & roles
// ============================================================

const ROLES = {
    'Shadow':   'support',
    'Luna':     'aggro',
    'Pouncer':  'aggro',
    'Fikyou':   'aggro',
    'Ziggy':    'crazy',
    'Hilli':    'healer',
    'Whiskers': 'healer',
    'Claw':     'connector',
    'Scar':     'connector',
};

const CAT_NAMES = [
    'Whiskers', 'Shadow', 'Luna', 'Hilli', 'Pouncer',
    'Ziggy', 'Fikyou', 'Scar', 'Claw',
];

if (!memory.initialized) {
    memory.initialized = true;
    memory.cats = {};
    memory.mourning = {};
    for (let i = 0; i < my_cats.length; i++) {
        const name = CAT_NAMES[i] || ('Cat' + i);
        memory.cats[my_cats[i].id] = {
            name: name,
            index: i,
            role: ROLES[name] || 'default',
        };
    }
}

function identity(cat) {
    return memory.cats[cat.id];
}

function catByName(name) {
    for (const c of my_cats) {
        const me = identity(c);
        if (me && me.name === name && c.hp > 0) return c;
    }
    return null;
}

function catsByRole(role) {
    return my_cats.filter(c => {
        const me = identity(c);
        return me && me.role === role && c.hp > 0;
    });
}

// ============================================================
//  Smart Pew Ledger — coordinate fire, avoid overkill
//
//  Each tick we snapshot every enemy's energy into pewLedger.
//  When a cat claims a pew, the ledger decrements by 2 (the
//  damage dealt).  Cats skip enemies whose projected energy is
//  already ≤ −1 so no extra shots are wasted.  Sorting by
//  projected energy focuses fire on the weakest targets first.
// ============================================================

const pewLedger = {};

function initLedger() {
    for (const e of livingEnemies()) {
        pewLedger[e.id] = e.energy;
    }
}

function aoeNeighbors(target) {
    let count = 0;
    for (const e of livingEnemies()) {
        if (e.id !== target.id && dist(e.position, target.position) <= 20) count++;
    }
    return count;
}

function pickPewTarget(cat) {
    const targets = pewableEnemies(cat);
    if (targets.length === 0 || cat.energy <= 0) return null;

    let best = null, bestAoe = -1, bestProj = Infinity;
    for (const t of targets) {
        const projected = pewLedger[t.id];
        if (projected === undefined || projected <= -1) continue;
        const aoe = aoeNeighbors(t);
        if (aoe > bestAoe || (aoe === bestAoe && projected < bestProj)) {
            best = t;
            bestAoe = aoe;
            bestProj = projected;
        }
    }
    return best;
}

function commitPew(cat, target) {
    cat.pew(target);
    if (pewLedger[target.id] !== undefined) {
        pewLedger[target.id] -= 2;
    }
    const tid = String(target.id);
    for (const id in pewLedger) {
        if (id === tid) continue;
        const e = cats[id];
        if (e && e.hp > 0 && dist(e.position, target.position) <= 20) {
            pewLedger[id] -= 2;
        }
    }
}

// ============================================================
//  Aggro trio coordination
// ============================================================

function aggroSharedTarget() {
    const trio = catsByRole('aggro');
    const enemies = livingEnemies();
    if (trio.length === 0 || enemies.length === 0) return null;
    const center = centroid(trio.map(c => c.position));
    return closestTo(center, enemies);
}

function teamCanEngage(target) {
    if (!target) return false;
    const friends = aliveOf(my_cats);
    const enemies = livingEnemies();

    let convergers = 0;
    for (const f of friends) {
        if (dist(f.position, target.position) <= 280) convergers++;
    }

    const nearbyEnemies = enemies.filter(e => dist(e.position, target.position) <= 260);
    const enemiesNear = nearbyEnemies.length;

    let clustered = 0;
    for (const e of nearbyEnemies) {
        for (const other of nearbyEnemies) {
            if (other.id !== e.id && dist(e.position, other.position) <= 20) {
                clustered++;
                break;
            }
        }
    }
    const effectiveEnemies = Math.max(1, enemiesNear - Math.floor(clustered / 2));

    const diff = energyDiff();
    if (diff > 20) return convergers >= effectiveEnemies;
    if (diff > -20) return convergers > effectiveEnemies;
    return convergers >= effectiveEnemies + 2;
}

// ============================================================
//  Role behaviours
// ============================================================

// --- Shadow: Luna's bodyguard ---

function thinkShadow(cat) {
    const luna = catByName('Luna');
    if (!luna) { thinkDefault(cat); return; }

    const enemies = livingEnemies();
    const adj = aggressionMod();
    const closestEnemy = closestTo(cat.position, enemies);
    const podBonus = (closestEnemy && isOnPod(closestEnemy.position)) ? 20 : 0;
    const nearbyEnemies = enemiesInRange(cat.position, 225 + adj + podBonus);
    const alliesHere = friendsInRange(cat.position, 265);

    if (nearbyEnemies >= 2 && alliesHere <= nearbyEnemies) {
        const healers = catsByRole('healer');
        const retreatPoint = healers.length > 0
            ? centroid(healers.map(c => c.position))
            : nearestPod(cat.position);
        cat.move(retreatPoint);
        return;
    }

    if (enemies.length > 0) {
        const threat = closestTo(luna.position, enemies);
        if (threat) {
            const behindDist = Math.max(25, 50 + adj + podBonus);
            cat.move(away(luna.position, threat.position, behindDist));
            return;
        }
    }
    cat.move(luna.position);
}

// --- Aggro trio: Luna, Pouncer, Fikyou ---

function thinkAggro(cat) {
    const enemies = livingEnemies();
    if (enemies.length === 0) { cat.move([0, 0]); return; }

    const closest = closestTo(cat.position, enemies);
    const closestDist = closest ? dist(cat.position, closest.position) : Infinity;

    const inKillZone   = enemiesInRange(cat.position, 200);
    const inDangerZone = enemiesInRange(cat.position, 260);
    const alliesHere   = friendsInRange(cat.position, 280);
    const adj = aggressionMod();

    // How many nearby enemies are clustered (AOE-vulnerable)?
    const nearby = enemies.filter(e => dist(cat.position, e.position) < 260);
    let clustered = 0;
    for (const e of nearby) {
        for (const other of nearby) {
            if (other.id !== e.id && dist(e.position, other.position) <= 20) {
                clustered++;
                break;
            }
        }
    }
    const effectiveThreats = Math.max(1, inDangerZone - Math.floor(clustered / 2));

    // RETREAT only when outnumbered in kill zone AND enemies aren't clustered
    if (inKillZone >= 2 && alliesHere <= inKillZone && clustered === 0) {
        const healers = catsByRole('healer');
        const retreatPoint = healers.length > 0
            ? centroid(healers.map(c => c.position))
            : nearestPod(cat.position);
        cat.move(retreatPoint);
        return;
    }

    // FLEE only when outnumbered AND enemies are spread out
    if (effectiveThreats >= 3 && alliesHere < effectiveThreats) {
        const threatCenter = centroid(nearby.map(e => e.position));
        cat.move(away(cat.position, threatCenter, 100));
        return;
    }

    // TEAM ENGAGE: if the team has converged and has numbers, strike
    // (skip if target is camping a pod — let the circle flush them out)
    const sharedTarget = aggroSharedTarget();
    if (sharedTarget && teamCanEngage(sharedTarget) && !isOnPod(sharedTarget.position)) {
        const d = dist(cat.position, sharedTarget.position);
        if (d > 190) cat.move(sharedTarget.position);
        return;
    }

    // STALK MODE — use effectiveThreats for distance decisions
    const myTarget = closestTo(cat.position, enemies);
    if (!myTarget) return;

    const podBonus = isOnPod(myTarget.position) ? 20 : 0;
    let minSafe, maxSafe;
    if (alliesHere > effectiveThreats) {
        minSafe = 225 + adj + podBonus; maxSafe = 255 + adj + podBonus;
    } else if (alliesHere >= effectiveThreats) {
        minSafe = 250 + adj + podBonus; maxSafe = 280 + adj + podBonus;
    } else {
        minSafe = 280 + adj + podBonus; maxSafe = 310 + adj + podBonus;
    }

    if (closestDist < minSafe) {
        cat.move(away(cat.position, closest.position, 100));
    } else if (dist(cat.position, myTarget.position) > maxSafe) {
        cat.move(myTarget.position);
    }
}

// --- Healers: Hilli, Whiskers ---

function thinkHealer(cat) {
    const friends = aliveOf(my_cats);
    const nonHealers = friends.filter(c => {
        const fid = identity(c);
        return fid && fid.role !== 'healer';
    });

    const teamCenter = nonHealers.length > 0
        ? centroid(nonHealers.map(c => c.position))
        : cat.position;
    const targetPod = nearestPod(teamCenter);

    if (!isOnPod(cat.position) || dist(cat.position, targetPod) > 30) {
        cat.move(targetPod);
    }
}

// --- Connectors: Claw & Scar ---
//     Form a two-link energy bridge between healers and aggressors.
//     Scar sits at 1/3 (healer side), Claw at 2/3 (aggro side).

function thinkConnector(cat) {
    const aggroCats = catsByRole('aggro');
    const healerCats = catsByRole('healer');

    if (aggroCats.length === 0 || healerCats.length === 0) {
        thinkDefault(cat);
        return;
    }

    const aggroCenter = centroid(aggroCats.map(c => c.position));
    const healerCenter = centroid(healerCats.map(c => c.position));

    const me = identity(cat);
    const t = me.name === 'Claw' ? 2 / 3 : 1 / 3;
    const bridgePoint = [
        healerCenter[0] + (aggroCenter[0] - healerCenter[0]) * t,
        healerCenter[1] + (aggroCenter[1] - healerCenter[1]) * t,
    ];

    if (dist(cat.position, bridgePoint) > 20) {
        cat.move(bridgePoint);
    }
}

// --- Ziggy: the crazy flanker ---
//     Targets the furthest enemy and navigates toward it while
//     keeping at least 230 units from every other enemy.  Uses
//     angle-sweeping (±90° in 10° increments) to find a safe
//     step each tick.  If cornered, retreats from the nearest
//     non-target enemy.

function thinkCrazy(cat) {
    const enemies = livingEnemies();
    if (enemies.length === 0) { cat.move([0, 0]); return; }

    let target = null, maxD = -1;
    for (const e of enemies) {
        const d = dist(cat.position, e.position);
        if (d > maxD) { maxD = d; target = e; }
    }
    if (!target) return;

    const others = enemies.filter(e => e.id !== target.id);

    if (others.length > 0) {
        const closestOther = closestTo(cat.position, others);
        if (closestOther && dist(cat.position, closestOther.position) < 235) {
            cat.move(away(cat.position, closestOther.position, 25));
            return;
        }
    }

    if (maxD <= 200) return;

    if (others.length === 0) {
        cat.move(target.position);
        return;
    }

    const dx = target.position[0] - cat.position[0];
    const dy = target.position[1] - cat.position[1];
    const baseAngle = Math.atan2(dy, dx);

    function isSafe(pos) {
        for (const e of others) {
            if (dist(pos, e.position) < 235) return false;
        }
        return true;
    }

    const directStep = [
        cat.position[0] + Math.cos(baseAngle) * 20,
        cat.position[1] + Math.sin(baseAngle) * 20,
    ];
    if (isSafe(directStep)) {
        cat.move(directStep);
        return;
    }

    for (let offset = 10; offset <= 90; offset += 10) {
        for (const sign of [1, -1]) {
            const angle = baseAngle + offset * sign * Math.PI / 180;
            const step = [
                cat.position[0] + Math.cos(angle) * 20,
                cat.position[1] + Math.sin(angle) * 20,
            ];
            if (isSafe(step)) {
                cat.move(step);
                return;
            }
        }
    }

    const threat = closestTo(cat.position, others);
    if (threat) cat.move(away(cat.position, threat.position, 20));
}

// --- Default fallback (used by any unnamed cats) ---

function thinkDefault(cat) {
    const enemies = livingEnemies();
    if (enemies.length === 0) { cat.move([0, 0]); return; }

    const target = closestTo(cat.position, enemies);
    if (target && dist(cat.position, target.position) > 210) {
        cat.move(target.position);
    }
}

// ============================================================
//  Centralized friendly pew (heal / relay)
// ============================================================

function supportPew(cat, me) {
    if (cat.energy <= 0) return;
    const nearby = pewableFriends(cat);

    switch (me.role) {
        case 'support': {
            const luna = catByName('Luna');
            if (luna && luna.energy < 10
                && dist(cat.position, luna.position) <= 200) {
                cat.pew(luna);
            }
            break;
        }
        case 'healer': {
            if (cat.energy < 3) break;
            if (cat.energy >= 6) {
                const connectors = nearby.filter(f => {
                    const fid = identity(f);
                    return fid && fid.role === 'connector'
                        && f.energy < f.energy_capacity && f.id !== cat.id;
                });
                if (connectors.length > 0) {
                    cat.pew(weakestOf(connectors));
                    break;
                }
                const wounded = nearby.filter(f => f.energy < 8 && f.id !== cat.id);
                if (wounded.length > 0) {
                    cat.pew(weakestOf(wounded));
                    break;
                }
            }
            const critical = nearby.filter(f => f.energy <= 2 && f.id !== cat.id);
            if (critical.length > 0) cat.pew(weakestOf(critical));
            break;
        }
        case 'connector': {
            if (cat.energy <= 2) break;
            const recipients = nearby.filter(f => {
                const fid = identity(f);
                if (!fid || f.id === cat.id) return false;
                if (fid.role === 'healer') return false;
                return f.energy < f.energy_capacity;
            });
            if (recipients.length > 0) cat.pew(weakestOf(recipients));
            break;
        }
    }
}

// ============================================================
//  Shouts — endgame, mourning & banter
// ============================================================

const ENDGAME_WINNING = [
    // --- emojis ---
    '😹', '😹😹', '😹😹😹', '🤣', '😂', '💀', '👑', '🏆',
    '😎', '💅', '😏', '🫡', '👋', '✌️', '😼', '🥱', '😴',
    '🐔', '🔪', '🐱', '🎉', '🥇', '🪦', '⚰️', '🤡',
    // --- short ---
    'GG', 'gg ez', 'lol', 'lmao', 'HAHA', 'hahaha',
    'ez', 'free', 'L', 'big L', 'huge L', 'LLLL',
    'owned', 'rekt', 'bozo', 'noob', 'ratio', 'diff',
    'gap', 'yawn', 'zzz', 'F', 'RIP', 'cya', 'bye',
    'gn', 'purr', 'meow', 'clean', 'crispy',
    // --- taunts ---
    'too easy', 'get rekt', 'bye bye', 'sit down',
    'stay down', 'gg no re', 'outplayed', 'skill diff',
    'skill issue', 'mad?', 'cry more', 'is that it?',
    'snoozefest', 'boring', 'next!', 'free win',
    'ez game', 'ez clap', 'hold this L', 'take the L',
    'go next', 'rip bozo', 'just ff', 'ff go next',
    'give up yet?', 'surrender?', 'no mercy',
    'scared?', 'where u going?', 'come back!',
    'dont run!', 'running?', 'chicken',
    'dance for me', 'kneel', 'bow down',
    // --- sarcastic / patronizing ---
    'nice try ig', 'A for effort', 'cute attempt',
    'adorable', 'aww', 'poor thing', 'so sad',
    'u tried', 'good effort!', 'almost! jk',
    'not even close', 'wow.', 'yikes', 'tragic',
    'unlucky!', 'sadge', 'oof for u',
    '*pats head*', '*slow clap*', '*claps*',
    // --- cocky ---
    'built different', 'just better', 'simply better',
    'flawless', 'calculated', 'as expected',
    'all planned', 'too ez', 'surgical',
    'perfection', 'masterpiece', 'like butter',
    '*chefs kiss*', 'beautiful', 'poetry',
    // --- cat-themed ---
    'meow diff', 'cat gap', '*purrs loudly*',
    'meow meow 😼', 'paws > yours', 'hiss',
    'cat supremacy', '*licks paw*', 'purr purr',
    // --- questions / teasing ---
    'first time?', 'new here?', 'need tips?',
    'tutorial?', 'is this ranked?', 'git gud',
    'try harder', 'practice more', 'that all?',
    'want advice?', 'need a hug?', 'u ok?',
    'having fun?', 'warm up done?',
    // --- actions ---
    '*dances*', '*yawns*', '*naps*', '*stretches*',
    '*does a flip*', '*moonwalks*', 'nap time 😴',
    // --- dismissive ---
    'whatever', 'who?', 'boring!', 'next pls',
    'thanks!', 'fun!', 'again?', 'or not lol',
    'moving on', 'anyways', 'so anyway',
    'where was i', 'oh right', 'as i was saying',
    // --- savage ---
    'pathetic', 'weak', 'so weak', 'embarrassing',
    'cringe', 'pain to watch', 'yikes forever',
    'delete ur code', 'alt+f4', 'ctrl+z urself',
    'refund pls', 'ur code is mid', 'mid',
    'imagine losing', 'couldnt be me', 'skill gap',
    'levels above', 'not the same', 'different breed',
    'elite', 'top diff', 'massive gap',
];

const ENDGAME_LOSING = [
    // --- emojis ---
    '😭', '😭😭😭', '💀', '😤', '😡', '🤬', '😢', '😿',
    '💔', '🥺', '🫠', '🔥🔥🔥', '☠️', '🪦', '😵',
    '🥀', '🖤', '💢', '👊', '🤡',
    // --- angry / profane ---
    'fuck', 'fuck you', 'fuck you!', 'fuck off',
    'fk u', 'screw this', 'bullshit', 'bs', 'wtf',
    'go to hell', 'eat shit', 'bite me', 'kiss my ass',
    'eat my dust', 'shove it', 'drop dead',
    // --- pleading ---
    'pls', 'please', 'pls stop', 'stop it', 'enough',
    'mercy', 'mercy!', 'have mercy', 'spare me',
    'no more', 'i beg', 'let me live', 'dont do this',
    'ill do anything', 'take my lunch', 'be gentle',
    // --- resignation ---
    'im done', 'done.', 'over it', 'nope.', 'cant.',
    'gg', 'gg i guess', 'gg...', 'welp', 'well then',
    'ok then', 'sure.', 'cool.', 'nice.', 'great.',
    'fantastic.', 'wonderful.', 'lovely.', 'perfect.',
    'just perfect', 'ofc', 'of course', 'typical',
    'every time', 'always', 'knew it', 'figures',
    'as usual', 'why not', 'add it to the list',
    'im not even mad', 'just disappointed', 'wow ok',
    // --- sarcasm ---
    'proud of yourself?', 'happy now?', 'feel good?',
    'worth it?', 'wow so cool', 'so brave',
    'real original', 'creative.', 'so honorable',
    'very fair', 'totally fair', 'much skill',
    'wow skill', 'so talent', 'such honor',
    'clap clap', '👏👏', '*slow clap*', 'bravo.',
    'real impressive', 'groundbreaking', 'genius.',
    'wow big brain', 'so strategic', '10/10',
    // --- screaming ---
    '*screams*', '*cries*', '*dies inside*',
    'aaaaaaa', 'AAAA', 'AAAAHHH', 'nooo', 'NOOO',
    'noooooo', 'HELP', 'halp', 'SOS', 'mayday',
    'send help', '911', 'hello??', 'anyone??',
    '*panics*', '*flails*', 'CODE RED',
    // --- defiant ---
    'never give up', 'never!', 'NEVER',
    'ill be back', 'revenge.', 'mark my words',
    'remember me', 'witness me', 'YOLO',
    'for glory!', 'not like this', 'not today',
    'you wish', '1v1 me', '1v1 coward',
    'cowards', 'fight fair', 'all of you??',
    'gang up more', 'real brave btw', 'scared 1v1?',
    'come 1 by 1', 'at least i tried', 'i tried',
    'no regrets', 'worth it', 'id do it again',
    // --- excuses ---
    'lucky', 'so lucky', 'pure luck', 'lag',
    'i lagged', 'its lag', 'cheater', 'hacker',
    'broken', 'so broken', 'unfair', 'nerf pls',
    'balanced btw', 'wasnt trying', 'not even trying',
    'that was warmup', 'round 2?', 'bad rng',
    'my cat walked on', 'sun in my eyes', 'dog ate my code',
    'keyboard broke', 'mouse died', 'wifi pls',
    // --- pain ---
    'pain.', 'suffering.', 'agony', 'this hurts',
    'why', 'WHYYY', 'whyyy', 'fml', 'hate it here',
    'i hate this', 'this is bs', 'end me',
    'just end it', 'kill me', 'make it stop',
    'this is fine 🔥', 'fine.', 'all good',
    'totally fine', 'everything is fine',
    'im fine really', 'its fine', '*nervous laugh*',
    // --- quitting ---
    'i quit', 'im out', 'thats it', 'flips table',
    'rage quit', 'uninstall', 'bye', 'peace out',
    'nvm', 'forget this', 'im leaving', 'adios',
    'sayonara', 'au revoir', 'tschuss',
    // --- misc ---
    'bruh', 'bruhhh', 'bro.', 'come on', 'cmon',
    'really?', 'seriously?', 'rly?', '*sigh*', 'sigh',
    'rip me', 'rip', 'press F', 'big F', 'oof',
    'ow', 'ouch', 'that hurt', 'mom pick me up',
    'want my mom', 'dad help', 'not again',
    'here we go again', 'deja vu', 'oh no', 'oh no no',
    'nonono', 'nah', 'nah nah nah', 'smh', 'facepalm',
    'unbelievable', 'are u serious', 'are u kidding',
    'give me a break', 'what even', 'how even',
    'explain.', 'logic?', 'physics??', 'rigged',
    'this game man', 'i s2g', 'on god', 'bro please',
];

const SHOUT_TIERS = [
    ['GG 🏆', '😹', 'bow down', 'flawless', '💀 rip',
     'get rekt', 'gg no re', '👑', 'too easy', 'lmao'],
    ['💅', 'gg?', 'is that all?', 'yawn 🥱', '😏',
     'ez', '*yawns*', 'snoozefest'],
    ['heh', '😼', 'not bad', '*purrs*', '🐱',
     'nyeh heh', 'we vibin'],
    ['hmm.', '😤', 'watch me', 'just wait', '🙄',
     'ok ok ok', 'bruh'],
    ['this is fine 🔥', 'ow ow ow', 'help??', '😿',
     'rude.', 'not like this', 'oof'],
    ['pls stop 😭', 'mercy!', '😭😭😭', 'whyyy',
     'no no no', 'have mercy', '💀', 'i surrender'],
];

function handleShouts(cat, me) {
    // --- Endgame: ALL cats shout when it's hopeless ---
    const endgame = endgameState();
    if (endgame) {
        if (tick % 3 !== me.index % 3) return;
        const pool = endgame === 'winning' ? ENDGAME_WINNING : ENDGAME_LOSING;
        const idx = ((tick * 31 + me.index * 17) >>> 0) % pool.length;
        cat.shout(pool[idx]);
        return;
    }

    // --- Mourning: Shadow ↔ Luna (5-tick window) ---
    if (me.name === 'Shadow') {
        if (!memory.mourning.luna && !catByName('Luna')) {
            memory.mourning.luna = tick;
        }
        if (memory.mourning.luna && tick - memory.mourning.luna < 5) {
            cat.shout('Nooo! Luna!');
            return;
        }
    }
    if (me.name === 'Luna') {
        if (!memory.mourning.shadow && !catByName('Shadow')) {
            memory.mourning.shadow = tick;
        }
        if (memory.mourning.shadow && tick - memory.mourning.shadow < 5) {
            cat.shout('Noo! Shadow!');
            return;
        }
    }

    // --- Banter: Hilli & Pouncer shout every ~6 ticks, staggered ---
    if (me.name !== 'Hilli' && me.name !== 'Pouncer') return;

    const offset = me.name === 'Hilli' ? 0 : 3;
    if ((tick + offset) % 6 !== 0) return;

    const diff = energyDiff();
    let tier;
    if (diff > 30)       tier = 0;
    else if (diff > 15)  tier = 1;
    else if (diff > 0)   tier = 2;
    else if (diff > -15) tier = 3;
    else if (diff > -30) tier = 4;
    else                 tier = 5;

    const pool = SHOUT_TIERS[tier];
    const idx = (tick * 7 + me.index * 13) % pool.length;
    cat.shout(pool[idx]);
}

// ============================================================
//  All-In Mode — 12%+ energy advantage: press the kill
// ============================================================

function allInTarget() {
    const enemies = livingEnemies();
    if (enemies.length === 0) return null;

    let bestTarget = null, bestScore = -Infinity;
    for (const e of enemies) {
        const projected = pewLedger[e.id] !== undefined ? pewLedger[e.id] : e.energy;
        if (projected <= -1) continue;
        const aoe = aoeNeighbors(e);
        const score = (10 - projected) * 3 + aoe * 8;
        if (score > bestScore) { bestScore = score; bestTarget = e; }
    }
    return bestTarget || weakestOf(enemies);
}

function thinkAllInCombat(cat) {
    const target = allInTarget();
    if (!target) { cat.move([0, 0]); return; }

    const d = dist(cat.position, target.position);
    if (d > 185) {
        cat.move(target.position);
    }
}

function thinkAllInConnector(cat) {
    const aggroCats = catsByRole('aggro');
    const healerCats = catsByRole('healer');
    if (aggroCats.length === 0 || healerCats.length === 0) {
        thinkAllInCombat(cat);
        return;
    }
    const aggroCenter = centroid(aggroCats.map(c => c.position));
    const healerCenter = centroid(healerCats.map(c => c.position));
    const me = identity(cat);
    const t = me.name === 'Claw' ? 0.8 : 0.5;
    const bridgePoint = [
        healerCenter[0] + (aggroCenter[0] - healerCenter[0]) * t,
        healerCenter[1] + (aggroCenter[1] - healerCenter[1]) * t,
    ];
    if (dist(cat.position, bridgePoint) > 15) cat.move(bridgePoint);
}

function thinkAllInHealer(cat) {
    const aggroCats = catsByRole('aggro');
    if (aggroCats.length === 0) return;
    const aggroCenter = centroid(aggroCats.map(c => c.position));
    const bestPod = nearestPod(aggroCenter);
    if (!isOnPod(cat.position) || dist(cat.position, bestPod) > 30) {
        cat.move(bestPod);
    }
}

// ============================================================
//  The Mind — pew → evade → charge → role movement
// ============================================================

function mind(cat) {
    const me = identity(cat);
    if (!me || cat.hp === 0) return;

    // ── Death circle guardrail + anti-splash spacing ──
    const safeRadius = death_circle - 10;
    const rawMove = cat.move.bind(cat);
    const inCombat = enemiesInRange(cat.position, 300) > 0;
    cat.move = function(target) {
        let t = target;

        if (inCombat) {
            let closestAlly = null, closestAllyDist = Infinity;
            for (const f of aliveOf(my_cats)) {
                if (f.id === cat.id) continue;
                const d = dist(cat.position, f.position);
                if (d < closestAllyDist) { closestAllyDist = d; closestAlly = f; }
            }
            if (closestAlly && closestAllyDist < 25) {
                const nudge = away(t, closestAlly.position, 25 - closestAllyDist);
                t = nudge;
            }
        }

        const d = dist(t, [0, 0]);
        if (d > safeRadius) {
            rawMove(towards(t, [0, 0], d - safeRadius));
        } else {
            rawMove(t);
        }
    };

    // If already outside or too close to edge, rush inward immediately
    if (dist(cat.position, [0, 0]) > safeRadius) {
        cat.move(towards(cat.position, [0, 0], 50));
        return;
    }

    cat.set_mark(me.name);

    if (tick <= 3) {
        cat.shout(me.name + '!');
        return;
    }

    handleShouts(cat, me);

    // ── Phase 1: ENEMY PEW (always top priority for every cat) ──
    let pewedEnemy = false;
    const pewTarget = pickPewTarget(cat);
    if (pewTarget) {
        commitPew(cat, pewTarget);
        pewedEnemy = true;
    }

    // ── Phase 2: FRIENDLY PEW (heal / relay, only when no enemy pewed) ──
    if (!pewedEnemy) supportPew(cat, me);

    // ── Phase 2.1: PATIENCE MODE — enemy mass-camping pods, wait for circle ──
    {
        const enemies = livingEnemies();
        let enemiesOnPods = 0;
        for (const e of enemies) if (isOnPod(e.position)) enemiesOnPods++;
        if (enemiesOnPods >= 3) {
            const safeBuffer = enemiesOnPods >= 5 ? 40 : 20;
            const nearest = closestTo(cat.position, enemies);
            if (nearest && dist(cat.position, nearest.position) < 200 + safeBuffer) {
                cat.move(away(cat.position, nearest.position, 30));
            }
            return;
        }
    }

    // ── Phase 2.5: ALL-IN MODE when 12%+ energy advantage ──
    if (energyAdvantageRatio() >= 0.12) {
        switch (me.role) {
            case 'healer':    thinkAllInHealer(cat);    break;
            case 'connector': thinkAllInConnector(cat);  break;
            default:          thinkAllInCombat(cat);     break;
        }
        return;
    }

    // ── Phase 3: DANGER EVASION (non-frontline cats) ──
    if (me.role !== 'aggro' && me.role !== 'crazy' && me.role !== 'support') {
        const enemies = livingEnemies();
        const adj = aggressionMod();
        const nearestE = closestTo(cat.position, enemies);
        const podBon = (nearestE && isOnPod(nearestE.position)) ? 20 : 0;
        const fleeRange = 255 + adj + podBon;
        const threats = enemies.filter(e => dist(cat.position, e.position) < fleeRange);
        if (threats.length > 0) {
            const alliesHere = friendsInRange(cat.position, 260);
            if (alliesHere <= threats.length) {
                const threatCenter = centroid(threats.map(e => e.position));
                cat.move(away(cat.position, threatCenter, 100));
                return;
            }
        }
    }

    // ── Phase 4: POD CHARGING (all cats, when safe) ──
    if (isOnPod(cat.position) && cat.energy < cat.energy_capacity
        && enemiesInRange(cat.position, 200) === 0) {
        return;
    }
    if (cat.energy < cat.energy_capacity && !isOnPod(cat.position)) {
        const pod = nearestPod(cat.position);
        if (dist(cat.position, pod) <= 100 && enemiesInRange(pod, 200) === 0) {
            cat.move(pod);
            return;
        }
    }

    // ── Phase 5: ROLE MOVEMENT ──
    switch (me.role) {
        case 'support':   thinkShadow(cat);   break;
        case 'aggro':     thinkAggro(cat);     break;
        case 'crazy':     thinkCrazy(cat);     break;
        case 'healer':    thinkHealer(cat);    break;
        case 'connector': thinkConnector(cat); break;
        default:          thinkDefault(cat);   break;
    }
}

// ============================================================
//  Main loop
// ============================================================

initLedger();

const alive = aliveOf(my_cats);
for (const cat of alive) {
    mind(cat);
}
