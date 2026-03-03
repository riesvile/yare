var alive = my_cats.filter(function(c) { return c.hp > 0; });
function d2(a, b) { return (a[0]-b[0])**2 + (a[1]-b[1])**2; }
function nearPod(pos) {
  var bp = pods[0], bd = d2(pos, pods[0]);
  for (var j = 1; j < pods.length; j++) {
    var dd = d2(pos, pods[j]);
    if (dd < bd) { bd = dd; bp = pods[j]; }
  }
  return bp;
}
function onAnyPod(pos) {
  for (var j = 0; j < pods.length; j++) {
    if (Math.abs(pos[0]-pods[j][0]) <= 20 && Math.abs(pos[1]-pods[j][1]) <= 20) return true;
  }
  return false;
}

var enemies = [];
for (var id in cats) {
  var c = cats[id];
  if (c.player_id !== this_player_id && c.hp > 0) enemies.push(c);
}

if (alive.length && enemies.length) {
  var cx = 0, cy = 0;
  for (var i = 0; i < alive.length; i++) { cx += alive[i].position[0]; cy += alive[i].position[1]; }
  cx /= alive.length; cy /= alive.length;

  var pewCount = {};
  for (var i = 0; i < enemies.length; i++) pewCount[enemies[i].id] = 0;
  for (var i = 0; i < alive.length; i++) {
    var ep = alive[i].sight.enemies_pewable || [];
    for (var j = 0; j < ep.length; j++) {
      if (ep[j] in pewCount) pewCount[ep[j]]++;
    }
  }
  enemies.sort(function(a, b) {
    var aK = pewCount[a.id] >= Math.floor(a.energy / 2) + 1 ? 1 : 0;
    var bK = pewCount[b.id] >= Math.floor(b.energy / 2) + 1 ? 1 : 0;
    if (bK !== aK) return bK - aK;
    if (aK && bK) return a.energy - b.energy;
    if (pewCount[b.id] !== pewCount[a.id]) return pewCount[b.id] - pewCount[a.id];
    if (a.energy !== b.energy) return a.energy - b.energy;
    return d2(a.position, [cx,cy]) - d2(b.position, [cx,cy]);
  });
  var primary = enemies[0];
  var secondary = enemies.length > 1 ? enemies[1] : null;

  var pewTarget = {};
  var totalPews = {};
  var canOnlyPri = [], canOnlySec = [], canBoth = [];
  for (var i = 0; i < alive.length; i++) {
    if (alive[i].energy <= 0) continue;
    var ep = alive[i].sight.enemies_pewable || [];
    if (!ep.length) continue;
    var cp = ep.indexOf(primary.id) >= 0;
    var cs = secondary && ep.indexOf(secondary.id) >= 0;
    if (cp && cs) canBoth.push(i);
    else if (cp) canOnlyPri.push(i);
    else if (cs) canOnlySec.push(i);
  }
  var priKill = Math.floor(primary.energy / 2) + 1;
  var priLeft = priKill;
  for (var j = 0; j < canOnlyPri.length && priLeft > 0; j++) {
    pewTarget[canOnlyPri[j]] = primary.id; priLeft--;
  }
  for (var j = 0; j < canBoth.length && priLeft > 0; j++) {
    pewTarget[canBoth[j]] = primary.id; priLeft--;
  }
  if (secondary) {
    var secKill = Math.floor(secondary.energy / 2) + 1;
    var secLeft = secKill;
    for (var j = 0; j < canOnlySec.length && secLeft > 0; j++) {
      pewTarget[canOnlySec[j]] = secondary.id; secLeft--;
    }
    for (var j = 0; j < canBoth.length && secLeft > 0; j++) {
      if (!(canBoth[j] in pewTarget)) {
        pewTarget[canBoth[j]] = secondary.id; secLeft--;
      }
    }
  }
  for (var idx in pewTarget) {
    var tid = pewTarget[idx];
    totalPews[tid] = (totalPews[tid] || 0) + 1;
  }

  var PEW_SQ = 40000;
  var maxRunners = Math.min(3, Math.max(0, alive.length - priKill));
  var podRunners = 0;

  for (var i = 0; i < alive.length; i++) {
    var cat = alive[i];
    var pos = cat.position;
    var dcDist = Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1]);

    if (dcDist > death_circle - 50 && dcDist > 1) {
      var s = Math.max(0, death_circle - 100) / dcDist;
      cat.move([pos[0]*s, pos[1]*s]);
      if (i in pewTarget && cat.energy > 0) cat.pew(pewTarget[i]);
      continue;
    }

    var epew = cat.sight.enemies_pewable || [];
    var fpew = cat.sight.friends_pewable || [];
    var evis = cat.sight.enemies || [];
    var isOnPod = onAnyPod(pos);

    if (cat.energy > 0) {
      if (i in pewTarget) {
        cat.pew(pewTarget[i]);
      } else if (epew.length > 0) {
        var bestId = null, bestE = 99;
        for (var j = 0; j < epew.length; j++) {
          var eid = epew[j];
          var ec = cats[eid];
          if (!ec || ec.hp <= 0) continue;
          var needed = Math.floor(ec.energy / 2) + 1;
          if ((totalPews[eid] || 0) >= needed) continue;
          if (ec.energy < bestE) { bestE = ec.energy; bestId = eid; }
        }
        var healId = null;
        if (cat.energy >= 3) {
          for (var j = 0; j < fpew.length; j++) {
            var fc = cats[fpew[j]];
            if (fc && fc.hp > 0 && fc.energy <= 2) { healId = fpew[j]; break; }
          }
        }
        if (!bestId && healId) {
          cat.pew(healId);
        } else if (bestId) {
          cat.pew(bestId);
          totalPews[bestId] = (totalPews[bestId] || 0) + 1;
        } else if (healId) {
          cat.pew(healId);
        }
      } else if (fpew.length > 0) {
        var lf = null, le = 99;
        for (var j = 0; j < fpew.length; j++) {
          var fc = cats[fpew[j]];
          if (fc && fc.hp > 0 && fc.energy < le && fc.energy < cat.energy - 1) {
            le = fc.energy; lf = fpew[j];
          }
        }
        if (lf && le < 8) cat.pew(lf);
      }
    }

    if (isOnPod && epew.length > 0) continue;
    if (isOnPod && cat.energy < cat.energy_capacity && epew.length === 0) continue;
    if (isOnPod && cat.energy >= cat.energy_capacity && epew.length === 0) {
      cat.move(primary.position);
      continue;
    }

    if (cat.energy <= 2 && !(i in pewTarget) && podRunners < maxRunners) {
      cat.move(nearPod(pos));
      podRunners++;
      continue;
    }

    if (cat.energy <= 5 && epew.length === 0 && podRunners < maxRunners) {
      cat.move(nearPod(pos));
      podRunners++;
      continue;
    }

    if (epew.length > 0) {
      var np = nearPod(pos);
      var ox = ((i % 3) - 1) * 12;
      var oy = (Math.floor(i / 3) % 3 - 1) * 12;
      cat.move([np[0] + ox, np[1] + oy]);
      continue;
    }

    if (evis.length > 0) {
      cat.move(primary.position);
      continue;
    }

    cat.move(primary.position);
  }
} else if (alive.length) {
  for (var i = 0; i < alive.length; i++) alive[i].move([0, 0]);
}
