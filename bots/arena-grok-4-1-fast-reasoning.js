const dist_sq = (p1, p2) => (p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2;
const distance = (p1, p2) => Math.sqrt(dist_sq(p1, p2));

const pew_range_sq = 200 ** 2;
const proj_safe_sq = 45 ** 2;
const splash_sq = 20 ** 2;

const pods = [
  [-110, -300], [110, -300],
  [-260, 320], [260, 320],
  [-500, 84], [500, 84]
];

// Init side
if (!memory.side) {
  let avg_x = 0;
  for (let c of my_cats) avg_x += c.position[0];
  avg_x /= 9;
  memory.side = avg_x < 0 ? 'left' : 'right';
}

const own_pods = memory.side === 'left' ? pods.filter(p => p[0] < 0) : pods.filter(p => p[0] > 0);
const retreat_pods = pods;

// Alive cats
const my_alive = my_cats.filter(c => c.hp > 0);
const all_cats_list = Object.values(cats);
const enemy_alive = all_cats_list.filter(c => c.player_id !== this_player_id && c.hp > 0);

// Centers
let my_cent = [0, 0];
if (my_alive.length > 0) {
  my_cent[0] = my_alive.reduce((sum, c) => sum + c.position[0], 0) / my_alive.length;
  my_cent[1] = my_alive.reduce((sum, c) => sum + c.position[1], 0) / my_alive.length;
}

let enemy_cent = [0, 0];
if (enemy_alive.length > 0) {
  enemy_cent[0] = enemy_alive.reduce((sum, c) => sum + c.position[0], 0) / enemy_alive.length;
  enemy_cent[1] = enemy_alive.reduce((sum, c) => sum + c.position[1], 0) / enemy_alive.length;
}

let my_total_e = my_alive.reduce((sum, c) => sum + c.energy, 0);
let enemy_total_e = enemy_alive.reduce((sum, c) => sum + c.energy, 0);
let avg_my_e = my_alive.length ? my_total_e / my_alive.length : 0;
let avg_enemy_e = enemy_alive.length ? enemy_total_e / enemy_alive.length : 0;
let retreat_fraction = enemy_total_e > 0 ? my_total_e / enemy_total_e : 1;
let global_retreat = (my_alive.length + 1 < enemy_alive.length) || (my_total_e + 5 < enemy_total_e);

// Compute threats and metrics
my_alive.forEach(cat => {
  cat._threat = enemy_alive.filter(e => dist_sq(cat.position, e.position) <= pew_range_sq).length;
});
enemy_alive.forEach(e => {
  e._splash = enemy_alive.filter(other => other.id !== e.id && dist_sq(other.position, e.position) <= splash_sq).length;
  e._reach_me = my_alive.filter(c => dist_sq(c.position, e.position) <= pew_range_sq).length;
  e._dist_cent = dist_sq(my_cent, e.position);
  let low_e = 10 - e.energy;
  e._score = Math.pow(low_e, 1.5) * 15 + e._splash * 25 + e._reach_me * 20 - Math.sqrt(e._dist_cent) * 0.1;
  if (e.energy <= 1) e._score += 300;
});

// Pick sticky global target
let target = null;
if (enemy_alive.length > 0) {
  let candidate = memory.global_target_id ? cats[memory.global_target_id] : null;
  if (candidate && candidate.hp > 0 && candidate.player_id !== this_player_id && enemy_alive.some(e => e.id === candidate.id)) {
    target = candidate;
    let best_alt = enemy_alive.filter(e => e.id !== target.id)
                              .reduce((best, e) => e._score > best._score ? e : best, { _score: -Infinity });
    if (best_alt._score > target._score * 1.5) {
      target = best_alt;
      memory.global_target_id = target.id;
    }
  } else {
    enemy_alive.sort((a, b) => b._score - a._score);
    target = enemy_alive[0];
    memory.global_target_id = target.id;
  }
}

// Sort my_alive by id for consistent formation
my_alive.sort((a, b) => {
  const ia = parseInt(a.id.split('_')[1]);
  const ib = parseInt(b.id.split('_')[1]);
  return ia - ib;
});

// Formation params
let center_next = [my_cent[0], my_cent[1]];
let advance_dir = [0, 0];
let dx = enemy_cent[0] - my_cent[0];
let dy = enemy_cent[1] - my_cent[1];
let d = distance(my_cent, enemy_cent);
let num_diff = enemy_alive.length - my_alive.length;
let e_diff = avg_enemy_e - avg_my_e;
let safe_dist = Math.max(50, Math.min(200, 75 + num_diff * 18 + e_diff * 5));
let advance_dist = Math.min(20, Math.max(0, d - safe_dist));
if (d > 0) {
  let ux = dx / d;
  let uy = dy / d;
  center_next[0] += ux * advance_dist;
  center_next[1] += uy * advance_dist;
  advance_dir[0] = ux;
  advance_dir[1] = uy;
} else if (my_alive.length > 0) {
  advance_dir[0] = memory.side === 'left' ? 1 : -1;
  advance_dir[1] = 0;
}
let dir_norm_sq = advance_dir[0] ** 2 + advance_dir[1] ** 2;
if (dir_norm_sq < 0.1) {
  advance_dir[0] = memory.side === 'left' ? 1 : -1;
  advance_dir[1] = 0;
  dir_norm_sq = 1;
}
let perp_x = -advance_dir[1] / Math.sqrt(dir_norm_sq);
let perp_y = advance_dir[0] / Math.sqrt(dir_norm_sq);
let spacing = 30;
const mid_i = (my_alive.length - 1) / 2;

// First pass: pew and tentative targets
for (let i = 0; i < my_alive.length; i++) {
  const cat = my_alive[i];
  cat.set_mark(`#${i + 1} e:${Math.floor(cat.energy)} t:${cat._threat}`);

  let pewed = false;
  if (cat.energy <= 1) continue;

  // Heal critical low friend first
  let critical_friends = my_alive.filter(other => other !== cat &&
    dist_sq(cat.position, other.position) <= pew_range_sq &&
    other.energy < 2.5 &&
    cat.energy > other.energy);
  if (critical_friends.length > 0) {
    critical_friends.sort((a, b) => a.energy - b.energy || dist_sq(cat.position, a.position) - dist_sq(cat.position, b.position));
    cat.pew(critical_friends[0]);
    pewed = true;
  }

  // Attack only if energy sufficient and not pewed
  if (!pewed && cat.energy >= 3) {
    // Pew global target if possible
    if (target && dist_sq(cat.position, target.position) <= pew_range_sq) {
      cat.pew(target);
      pewed = true;
    }

    // Pew best local enemy if not pewed
    if (!pewed) {
      let best_enemy = null;
      let best_score = -Infinity;
      for (let e of enemy_alive) {
        let edsq = dist_sq(cat.position, e.position);
        if (edsq <= pew_range_sq) {
          let score = e._score * 0.8 + (pew_range_sq - edsq) / pew_range_sq * 50;  // prefer closer
          if (score > best_score) {
            best_score = score;
            best_enemy = e;
          }
        }
      }
      if (best_enemy) {
        cat.pew(best_enemy);
        pewed = true;
      }
    }
  }

  // Heal low friend if still not pewed
  if (!pewed) {
    let low_friends = my_alive.filter(other => other !== cat &&
      dist_sq(cat.position, other.position) <= pew_range_sq &&
      other.energy < cat.energy &&
      other.energy < 5);
    if (low_friends.length > 0) {
      low_friends.sort((a, b) => a.energy - b.energy || dist_sq(cat.position, a.position) - dist_sq(cat.position, b.position));
      cat.pew(low_friends[0]);
    }
  }

  // Tentative target_pos
  let target_pos;
  let retreat_e_thresh = global_retreat ? 4 : 2.5;
  let threat_thresh = global_retreat ? 2 : 3;
  let do_retreat = cat.energy < retreat_e_thresh || cat._threat >= threat_thresh;
  if (do_retreat) {
    // Nearest pod
    let best_pod_dist_sq = Infinity;
    let nearest_pod = [0, 0];
    for (let pod of retreat_pods) {
      let pdist_sq = dist_sq(cat.position, pod);
      if (pdist_sq < best_pod_dist_sq) {
        best_pod_dist_sq = pdist_sq;
        nearest_pod = pod.slice();
      }
    }
    target_pos = nearest_pod;
  } else {
    // Formation
    let rel_i = i - mid_i;
    let offset_perp_x = perp_x * rel_i * spacing;
    let offset_perp_y = perp_y * rel_i * spacing;
    let abs_rel = Math.abs(rel_i);
    let offset_depth = - (mid_i > 0 ? abs_rel / mid_i : 0) * 12;
    let offset_depth_x = advance_dir[0] * offset_depth;
    let offset_depth_y = advance_dir[1] * offset_depth;
    target_pos = [center_next[0] + offset_perp_x + offset_depth_x,
                  center_next[1] + offset_perp_y + offset_depth_y];
  }
  cat._target_pos = target_pos.slice();
}

// Second pass: projected separation adjustment and move
function projected_next(cat) {
  const tp = cat._target_pos;
  const dx = tp[0] - cat.position[0];
  const dy = tp[1] - cat.position[1];
  const dd = Math.sqrt(dx ** 2 + dy ** 2);
  if (dd === 0) return cat.position.slice();
  const move_dist = Math.min(20, dd);
  return [
    cat.position[0] + (dx / dd) * move_dist,
    cat.position[1] + (dy / dd) * move_dist
  ];
}

for (let cat of my_alive) {
  let rep_x = 0;
  let rep_y = 0;
  let count = 0;
  const my_next = projected_next(cat);
  for (let other of my_alive) {
    if (other.id === cat.id) continue;
    const o_next = projected_next(other);
    const dx = my_next[0] - o_next[0];
    const dy = my_next[1] - o_next[1];
    const dsq = dx ** 2 + dy ** 2;
    if (dsq < proj_safe_sq && dsq > 0) {
      const dist = Math.sqrt(dsq);
      rep_x += (dx / dist);
      rep_y += (dy / dist);
      count++;
    }
  }
  if (count > 0) {
    rep_x /= count;
    rep_y /= count;
    rep_x *= 45;
    rep_y *= 45;
    cat._target_pos[0] += rep_x;
    cat._target_pos[1] += rep_y;
  }
  cat.move(cat._target_pos);
}

let num_retreat = my_alive.filter(c => c.energy < 3 || c._threat >= 3).length;
let num_high_threat = my_alive.filter(c => c._threat >= 3).length;

// Debug
console.log(`tick:${tick} my:${my_alive.length}/${Math.floor(my_total_e)}(${avg_my_e.toFixed(1)}) opp:${enemy_alive.length}/${Math.floor(enemy_total_e)}(${avg_enemy_e.toFixed(1)}) tgt:${target ? target.id : 'none'} tgt_e:${target ? target.energy : '?'} tgt_score:${target ? target._score.toFixed(0) : '?'} retreat:${num_retreat} threat:${num_high_threat} global_retreat:${global_retreat} my_cent:${my_cent[0].toFixed(0)},${my_cent[1].toFixed(0)} tgt_id:${memory.global_target_id || 'none'}`);