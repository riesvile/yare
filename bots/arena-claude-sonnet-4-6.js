{
  function dist_sq(pos1, pos2) {
    return (pos2[0]-pos1[0])**2 + (pos2[1]-pos1[1])**2;
  }
  function distance(pos1, pos2) {
    return Math.sqrt(dist_sq(pos1, pos2));
  }

  const POD_LIST = [[-110,-300],[110,-300],[-260,320],[260,320],[-500,84],[500,84]];

  function nearest_pod(pos) {
    let best = null, best_d = Infinity;
    for (const pod of POD_LIST) {
      const d = distance(pos, pod);
      if (d < best_d) { best_d = d; best = pod; }
    }
    return best;
  }

  function in_pod(pos) {
    for (const pod of POD_LIST) {
      if (Math.abs(pos[0]-pod[0]) <= 20 && Math.abs(pos[1]-pod[1]) <= 20) return true;
    }
    return false;
  }

  const enemy_cats = Object.values(cats).filter(c => c.player_id !== this_player_id && c.hp > 0);
  const alive_cats = my_cats.filter(c => c.hp > 0);

  if (alive_cats.length === 0 || enemy_cats.length === 0) {
    // nothing to do
  } else {

    function get_splash_bonus(enemy) {
      let count = 0;
      for (const e of enemy_cats) {
        if (e.id !== enemy.id && distance(e.position, enemy.position) <= 20) count++;
      }
      return count;
    }

    // Sort enemies: lowest energy first, tiebreak by splash potential
    const sorted_enemies = [...enemy_cats].sort((a, b) => {
      if (a.energy !== b.energy) return a.energy - b.energy;
      return get_splash_bonus(b) - get_splash_bonus(a);
    });
    const primary_target = sorted_enemies[0];

    // ---- DETERMINE MOVE TARGETS ----
    const retreat_set = new Set();
    const move_targets = {};
    const modes = {};

    // Use offsets to spread cats around target so they don't clump
    const attack_offsets = [
      [0, 0], [0, 30], [0, -30], [30, 0], [-30, 0],
      [0, 60], [0, -60], [30, 30], [-30, 30]
    ];
    let attack_idx = 0;

    // Count how many enemies can shoot at each of our cats
    // A cat is "focused" if multiple enemies are targeting it
    function enemy_fire_on(cat) {
      let count = 0;
      for (const e of enemy_cats) {
        if (dist_sq(e.position, cat.position) <= 200*200) count++;
      }
      return count;
    }

    for (const cat of alive_cats) {
      // Always retreat if outside death circle
      const dist_center = Math.sqrt(cat.position[0]**2 + cat.position[1]**2);
      if (dist_center > death_circle - 20) {
        retreat_set.add(cat.id);
        modes[cat.id] = 'circle_retreat';
        move_targets[cat.id] = [0, 0];
        continue;
      }

      // Retreat if energy critically low
      // More aggressive retreat threshold: retreat at <=1 energy
      // But if we have numerical advantage, also retreat at 2 if being focused
      const incoming_fire = enemy_fire_on(cat);
      const num_advantage = alive_cats.length > enemy_cats.length;
      
      if (cat.energy <= 1) {
        retreat_set.add(cat.id);
        modes[cat.id] = 'retreat';
        move_targets[cat.id] = nearest_pod(cat.position);
        continue;
      }
      
      // Retreat at 2 energy if being focused by multiple enemies and we have advantage
      if (cat.energy <= 2 && incoming_fire >= 2 && num_advantage) {
        retreat_set.add(cat.id);
        modes[cat.id] = 'retreat';
        move_targets[cat.id] = nearest_pod(cat.position);
        continue;
      }

      // If in pod and energy low, stay to charge
      if (in_pod(cat.position) && cat.energy < 7) {
        modes[cat.id] = 'charge';
        move_targets[cat.id] = cat.position;
        continue;
      }

      // Attack: move toward primary target with slight stagger offset
      modes[cat.id] = 'attack';
      const offset = attack_offsets[attack_idx % attack_offsets.length];
      attack_idx++;
      move_targets[cat.id] = [primary_target.position[0] + offset[0], primary_target.position[1] + offset[1]];
    }

    // ---- HARD SEPARATION ----
    const MIN_SEP = 27;
    const MAX_MOVE = 20;

    // Compute next positions
    const next_pos = {};
    for (const cat of alive_cats) {
      const target = move_targets[cat.id];
      if (!target) {
        next_pos[cat.id] = [...cat.position];
        continue;
      }
      const d = distance(cat.position, target);
      if (d <= 1) {
        next_pos[cat.id] = [...cat.position];
      } else {
        const speed = Math.min(d, MAX_MOVE);
        const dx = (target[0] - cat.position[0]) / d * speed;
        const dy = (target[1] - cat.position[1]) / d * speed;
        next_pos[cat.id] = [cat.position[0] + dx, cat.position[1] + dy];
      }
    }

    // Iteratively push apart cats that are too close
    const SEP_ITERS = 60;
    for (let iter = 0; iter < SEP_ITERS; iter++) {
      let any_viol = false;
      for (let i = 0; i < alive_cats.length; i++) {
        for (let j = i+1; j < alive_cats.length; j++) {
          const ci = alive_cats[i];
          const cj = alive_cats[j];
          const pi = next_pos[ci.id];
          const pj = next_pos[cj.id];
          const d = distance(pi, pj);
          if (d < MIN_SEP) {
            any_viol = true;
            const overlap = (MIN_SEP - d) / 2 + 0.5;
            let dx, dy;
            if (d < 0.001) {
              const angle = (i * 2.1 + j * 1.3);
              dx = Math.cos(angle);
              dy = Math.sin(angle);
            } else {
              dx = (pi[0]-pj[0])/d;
              dy = (pi[1]-pj[1])/d;
            }
            const ci_fixed = retreat_set.has(ci.id) || modes[ci.id] === 'charge';
            const cj_fixed = retreat_set.has(cj.id) || modes[cj.id] === 'charge';
            if (!ci_fixed && !cj_fixed) {
              next_pos[ci.id] = [pi[0] + dx*overlap, pi[1] + dy*overlap];
              next_pos[cj.id] = [pj[0] - dx*overlap, pj[1] - dy*overlap];
            } else if (!ci_fixed) {
              next_pos[ci.id] = [pi[0] + dx*overlap*2, pi[1] + dy*overlap*2];
            } else if (!cj_fixed) {
              next_pos[cj.id] = [pj[0] - dx*overlap*2, pj[1] - dy*overlap*2];
            } else {
              next_pos[ci.id] = [pi[0] + dx*overlap, pi[1] + dy*overlap];
              next_pos[cj.id] = [pj[0] - dx*overlap, pj[1] - dy*overlap];
            }
          }
        }
      }
      if (!any_viol) break;
    }

    for (const cat of alive_cats) {
      move_targets[cat.id] = next_pos[cat.id];
    }

    // ---- FOCUS FIRE TARGETING ----
    const damage_committed = {};
    for (const e of enemy_cats) damage_committed[e.id] = 0;

    const pew_assignments = {};

    // Sort shooters: attacking cats first, then by energy descending
    const shooters = alive_cats.filter(c => c.energy >= 1).sort((a, b) => {
      const a_atk = modes[a.id] === 'attack' ? 0 : 1;
      const b_atk = modes[b.id] === 'attack' ? 0 : 1;
      if (a_atk !== b_atk) return a_atk - b_atk;
      return b.energy - a.energy;
    });

    // Build priority list fresh each shooter assignment
    for (const cat of shooters) {
      // Retreating cats with very low energy skip shooting to preserve energy for survival
      // But at energy=2, if we can get a kill shot, it's worth it
      if (retreat_set.has(cat.id) && cat.energy <= 1) continue;

      let assigned = false;

      // Find best target: prioritize killing (lowest effective remaining health that isn't already dead)
      // Sort: not-yet-dead by ascending eff_remaining, then already-dead ones last
      const prioritized = [...sorted_enemies].sort((a, b) => {
        const a_eff = a.energy - damage_committed[a.id];
        const b_eff = b.energy - damage_committed[b.id];
        const a_dead = a_eff < 0;
        const b_dead = b_eff < 0;
        if (a_dead !== b_dead) return a_dead ? 1 : -1;
        // Both alive: prefer lower effective energy
        if (!a_dead && !b_dead) return a_eff - b_eff;
        return 0;
      });

      for (const enemy of prioritized) {
        if (dist_sq(cat.position, enemy.position) > 200*200) continue;

        const eff_remaining = enemy.energy - damage_committed[enemy.id];

        // Skip if already effectively dead (will die this tick), pick next target
        // unless no other targets exist in range
        if (eff_remaining < 0) {
          // Check if any non-dead target is in range
          const has_live_target_in_range = prioritized.some(e => 
            e.id !== enemy.id && 
            (e.energy - damage_committed[e.id]) >= 0 &&
            dist_sq(cat.position, e.position) <= 200*200
          );
          if (has_live_target_in_range) continue;
        }

        pew_assignments[cat.id] = enemy;
        damage_committed[enemy.id] += 2;
        // Account for splash
        for (const e of enemy_cats) {
          if (e.id !== enemy.id && distance(enemy.position, e.position) <= 20) {
            damage_committed[e.id] += 2;
          }
        }
        assigned = true;
        break;
      }

      // Last resort: any enemy in range
      if (!assigned) {
        for (const enemy of enemy_cats) {
          if (dist_sq(cat.position, enemy.position) <= 200*200) {
            pew_assignments[cat.id] = enemy;
            damage_committed[enemy.id] += 2;
            assigned = true;
            break;
          }
        }
      }
    }

    // ---- HEALING ----
    // Only heal if: no pew target, enough energy, and ally is significantly damaged
    for (const cat of alive_cats) {
      if (pew_assignments[cat.id]) continue;
      if (cat.energy < 8) continue;
      let best_ally = null, best_deficit = 0;
      for (const ally of alive_cats) {
        if (ally.id === cat.id) continue;
        if (ally.energy >= 9) continue;
        if (dist_sq(cat.position, ally.position) > 200*200) continue;
        const deficit = 10 - ally.energy;
        if (deficit > best_deficit) {
          best_deficit = deficit;
          best_ally = ally;
        }
      }
      if (best_ally && best_deficit >= 3) {
        pew_assignments[cat.id] = { _heal: true, _target: best_ally };
      }
    }

    // ---- ISSUE COMMANDS ----
    for (const cat of alive_cats) {
      const move_pos = move_targets[cat.id];
      const pew_target = pew_assignments[cat.id];

      if (move_pos) {
        const d = distance(cat.position, move_pos);
        if (d > 1) {
          cat.move(move_pos);
        }
      }

      if (pew_target && cat.energy >= 1) {
        if (pew_target._heal) {
          if (dist_sq(cat.position, pew_target._target.position) <= 200*200) {
            cat.pew(pew_target._target);
          }
        } else {
          if (dist_sq(cat.position, pew_target.position) <= 200*200) {
            cat.pew(pew_target);
          }
        }
      }
    }

    // ---- LOGGING ----
    const my_e = alive_cats.reduce((s,c)=>s+c.energy,0);
    const opp_e = enemy_cats.reduce((s,c)=>s+c.energy,0);
    const total_pews = Object.keys(pew_assignments).length;
    const shooting_primary = Object.values(pew_assignments).filter(t => t && !t._heal && t.id === primary_target.id).length;
    const in_range_count = alive_cats.filter(c => dist_sq(c.position, primary_target.position) <= 200*200).length;
    console.log(`T${tick}: mine=${alive_cats.length}(${my_e}e) opp=${enemy_cats.length}(${opp_e}e) tgt=${primary_target.id}(${primary_target.energy}e,eff=${primary_target.energy-damage_committed[primary_target.id]}) inrange=${in_range_count} pews=${total_pews}(${shooting_primary}->tgt)`);
  }
}