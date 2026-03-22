{
    // Initialize memory for logging and state tracking
    if (typeof memory.initialized === 'undefined') {
        memory.initialized = true;
        memory.retreating = {};
        console.log("Bot initialized v10. Final Perfected Bot.");
    }

    // 1. Parse and categorize cats
    let my_alive = [];
    let enemy_alive = [];
    
    for (let key in cats) {
        let c = cats[key];
        if (c.hp > 0) {
            if (c.player_id === this_player_id) {
                my_alive.push(c);
            } else {
                enemy_alive.push(c);
            }
        }
    }

    let cat_marks = {};
    for (let c of my_alive) {
        cat_marks[c.id] = "IDLE";
    }

    // Track predicted energy to prevent wasteful over-healing and overkill
    let predicted_energy = {};
    for (let c of my_alive) {
        predicted_energy[c.id] = c.energy;
    }

    // 2. State Machine: Retreating for Pod Energy
    for (let c of my_alive) {
        let is_retreating = memory.retreating[c.id] || false;
        
        // Safety buffer: retreat at 4 energy to ensure survival to the pod
        if (c.energy <= 4) {
            is_retreating = true;
        } else if (c.energy >= 9) {
            is_retreating = false;
        }

        let best_pod = null;
        if (is_retreating) {
            let best_pod_score = Infinity;
            for (let p of pods) {
                let d = Math.hypot(c.position[0] - p[0], c.position[1] - p[1]);
                let ticks_to_reach = d / 20;
                let future_circle = Math.max(50, death_circle - (ticks_to_reach + 10) * 2);
                if (Math.hypot(p[0], p[1]) > future_circle - 20) continue;
                
                let penalty = 0;
                for (let e of enemy_alive) {
                    let ed = Math.hypot(e.position[0] - p[0], e.position[1] - p[1]);
                    if (ed < 200) penalty += (200 - ed) * 5; // Heavily penalize pods under enemy fire
                }
                
                if (d + penalty < best_pod_score) {
                    best_pod_score = d + penalty;
                    best_pod = p;
                }
            }
            if (!best_pod) {
                // If the zone swallowed all pods or they're too dangerous, fight to the death
                is_retreating = false;
            }
        }
        
        memory.retreating[c.id] = is_retreating;
    }

    // 3. Targeting and Pew Logic
    let predicted_damage = {};
    for (let e of enemy_alive) {
        predicted_damage[e.id] = 0;
    }

    for (let c of my_alive) {
        let is_retreating = memory.retreating[c.id];
        if (c.energy < 1) {
            if (!is_retreating) cat_marks[c.id] = "E_LOW";
            continue; // Prevent suicide
        }

        let best_target = null;
        let best_score = Infinity;
        
        // If critical and retreating, only shoot if we can guarantee a kill (eff_energy <= 1)
        let requires_kill = (is_retreating && c.energy <= 4);

        for (let e of enemy_alive) {
            let eff_energy = e.energy - predicted_damage[e.id];
            if (eff_energy < 0) continue; // Already dying
            if (requires_kill && eff_energy > 1) continue;

            let dx = c.position[0] - e.position[0];
            let dy = c.position[1] - e.position[1];
            let distSq = dx * dx + dy * dy;

            if (distSq <= 200 * 200) {
                let splash_cnt = 0;
                for (let oe of enemy_alive) {
                    if (oe.id !== e.id && (oe.energy - predicted_damage[oe.id] >= 0)) {
                        let odx = e.position[0] - oe.position[0];
                        let ody = e.position[1] - oe.position[1];
                        // Engine AOE logic applies to targets <= 20 units from main target
                        if (odx * odx + ody * ody <= 20 * 20) {
                            splash_cnt++;
                        }
                    }
                }
                
                let will_kill = (eff_energy <= 1);
                // Heavily reward splash and guaranteed kills, deeply prioritizes low energy targets
                let score = (eff_energy * 20) - (splash_cnt * 90) + (Math.sqrt(distSq) * 0.01) - (will_kill ? 100 : 0);

                if (score < best_score) {
                    best_score = score;
                    best_target = e;
                }
            }
        }

        if (best_target) {
            c.pew(best_target.id);
            if (!is_retreating) cat_marks[c.id] = "ATK";
            
            predicted_energy[c.id] -= 1;
            predicted_damage[best_target.id] += 2;
            
            for (let oe of enemy_alive) {
                if (oe.id !== best_target.id) {
                    let odx = best_target.position[0] - oe.position[0];
                    let ody = best_target.position[1] - oe.position[1];
                    if (odx * odx + ody * ody <= 20 * 20) {
                        predicted_damage[oe.id] += 2;
                    }
                }
            }
        } else if (!is_retreating && c.energy > 6) {
            // Friendly energy relay: Backliners heal frontliners taking damage or retreating cats
            let best_friend = null;
            let best_f_score = Infinity;
            for (let f of my_alive) {
                if (f.id === c.id || predicted_energy[f.id] >= 9) continue;
                if (predicted_energy[f.id] >= predicted_energy[c.id] - 1) continue;
                
                let dx = c.position[0] - f.position[0];
                let dy = c.position[1] - f.position[1];
                let distSq = dx * dx + dy * dy;
                
                if (distSq <= 200 * 200) {
                    let f_score = predicted_energy[f.id] + Math.sqrt(distSq) * 0.01;
                    if (f_score < best_f_score) {
                        best_f_score = f_score;
                        best_friend = f;
                    }
                }
            }
            if (best_friend) {
                c.pew(best_friend.id);
                cat_marks[c.id] = "HEAL";
                predicted_energy[c.id] -= 1;
                predicted_energy[best_friend.id] += 1;
            }
        }
    }

    // 4. Movement Strategy Base Targets
    let targets = {};
    for (let c of my_alive) {
        let is_retreating = memory.retreating[c.id];
        
        if (is_retreating) {
            let best_pod = null;
            let best_pod_score = Infinity;
            for (let p of pods) {
                let d = Math.hypot(c.position[0] - p[0], c.position[1] - p[1]);
                let ticks = d / 20;
                let future_circle = Math.max(50, death_circle - (ticks + 10) * 2);
                if (Math.hypot(p[0], p[1]) > future_circle - 20) continue;
                
                let penalty = 0;
                for (let e of enemy_alive) {
                    let ed = Math.hypot(e.position[0] - p[0], e.position[1] - p[1]);
                    if (ed < 200) penalty += (200 - ed) * 5;
                }
                
                if (d + penalty < best_pod_score) { 
                    best_pod_score = d + penalty; 
                    best_pod = p; 
                }
            }
            
            if (best_pod) {
                // Determine designated pod slot to prevent separation logic from pushing cats out of the 40x40 pod
                let hash = parseInt(c.id.split('_')[1] || "0");
                let offset_x = (hash % 2 === 0) ? 15 : -15;
                let offset_y = (hash % 4 < 2) ? 15 : -15;
                
                let slot_x = best_pod[0] + offset_x;
                let slot_y = best_pod[1] + offset_y;
                
                let pdx = slot_x - c.position[0];
                let pdy = slot_y - c.position[1];
                let pd = Math.hypot(pdx, pdy);
                if (pd === 0) { pdx = 1; pdy = 0; pd = 1; }
                
                let tgt_x, tgt_y;
                if (pd > 20) {
                    tgt_x = c.position[0] + (pdx / pd) * 100;
                    tgt_y = c.position[1] + (pdy / pd) * 100;
                } else {
                    tgt_x = slot_x;
                    tgt_y = slot_y;
                }
                
                // Active repulsion from enemies while retreating
                for (let e of enemy_alive) {
                    let edx = c.position[0] - e.position[0];
                    let edy = c.position[1] - e.position[1];
                    let edist = Math.hypot(edx, edy);
                    if (edist < 220) {
                        if (edist === 0) { edist = 1; edx = 1; edy = 0; }
                        let push = (220 - edist) * 0.8;
                        tgt_x += (edx / edist) * push;
                        tgt_y += (edy / edist) * push;
                    }
                }
                
                targets[c.id] = [tgt_x, tgt_y];
            } else {
                targets[c.id] = [0, 0];
            }
            if (cat_marks[c.id] === "IDLE") cat_marks[c.id] = "POD";
            
        } else {
            // Strictly find the absolute closest physical threat for safe kiting
            let closest_e = null;
            let min_d = Infinity;
            
            for (let e of enemy_alive) {
                let d = Math.hypot(c.position[0] - e.position[0], c.position[1] - e.position[1]);
                if (d < min_d) {
                    min_d = d;
                    closest_e = e;
                }
            }

            if (closest_e) {
                let dx = closest_e.position[0] - c.position[0];
                let dy = closest_e.position[1] - c.position[1];
                let len = Math.hypot(dx, dy);
                if (len === 0) { dx = 1; dy = 0; len = 1; }

                // Ideal distance is 190, providing a very safe buffer inside the 200 pew range
                let ideal_x = closest_e.position[0] - (dx / len) * 190;
                let ideal_y = closest_e.position[1] - (dy / len) * 190;
                
                let to_ideal_x = ideal_x - c.position[0];
                let to_ideal_y = ideal_y - c.position[1];
                let to_ideal_len = Math.hypot(to_ideal_x, to_ideal_y);
                
                let tgt_x, tgt_y;
                
                if (to_ideal_len > 20) {
                    // Extrapolate to ensure we move at maximum velocity towards the optimal ring
                    tgt_x = c.position[0] + (to_ideal_x / to_ideal_len) * 100;
                    tgt_y = c.position[1] + (to_ideal_y / to_ideal_len) * 100;
                } else {
                    // Prevent jittering when roughly at exact range
                    tgt_x = ideal_x;
                    tgt_y = ideal_y;
                }
                
                // Repulsion from ALL OTHER nearby enemies prevents getting flanked or walking into an ambush
                for (let e of enemy_alive) {
                    if (e.id === closest_e.id) continue;
                    let edx = c.position[0] - e.position[0];
                    let edy = c.position[1] - e.position[1];
                    let edist = Math.hypot(edx, edy);
                    if (edist < 195) {
                        if (edist === 0) { edist = 1; edx = 1; edy = 0; }
                        let push = (195 - edist) * 0.8;
                        tgt_x += (edx / edist) * push;
                        tgt_y += (edy / edist) * push;
                    }
                }
                
                targets[c.id] = [tgt_x, tgt_y];
                if (cat_marks[c.id] === "IDLE") cat_marks[c.id] = "KITE";
            } else {
                targets[c.id] = [0, 0];
                if (cat_marks[c.id] === "IDLE") cat_marks[c.id] = "HOLD";
            }
        }
    }

    // 5. Relaxation Loop for Constraints (Separation, Barricades, Death Circle)
    let deltas = {};
    for (let c of my_alive) {
        let dx = targets[c.id][0] - c.position[0];
        let dy = targets[c.id][1] - c.position[1];
        let d = Math.hypot(dx, dy);
        
        // Base movement up to max engine speed
        if (d > 20) {
            dx = (dx / d) * 20;
            dy = (dy / d) * 20;
        }
        deltas[c.id] = [dx, dy];
    }

    let safe_sep = 30; // Crucial anti-splash buffer, guarantees absolute immunity to 20-radius splash
    
    for (let iter = 0; iter < 10; iter++) {
        // Enforce anti-clumping separation
        for (let i = 0; i < my_alive.length; i++) {
            for (let j = i + 1; j < my_alive.length; j++) {
                let c1 = my_alive[i]; 
                let c2 = my_alive[j];
                
                let p1x = c1.position[0] + deltas[c1.id][0];
                let p1y = c1.position[1] + deltas[c1.id][1];
                let p2x = c2.position[0] + deltas[c2.id][0];
                let p2y = c2.position[1] + deltas[c2.id][1];

                let dx = p1x - p2x;
                let dy = p1y - p2y;
                let d = Math.hypot(dx, dy);
                if (d < safe_sep) {
                    if (d === 0) { dx = 1; dy = 0; d = 1; }
                    let overlap = safe_sep - d;
                    
                    let pushX = (dx / d) * (overlap / 2);
                    let pushY = (dy / d) * (overlap / 2);
                    
                    deltas[c1.id][0] += pushX; 
                    deltas[c1.id][1] += pushY;
                    deltas[c2.id][0] -= pushX; 
                    deltas[c2.id][1] -= pushY;
                }
            }
        }

        // Enforce barricade and death circle avoidance
        for (let c of my_alive) {
            let px = c.position[0] + deltas[c.id][0];
            let py = c.position[1] + deltas[c.id][1];
            
            // Barricades
            for (let b of barricades) {
                let bx = px - b[0];
                let by = py - b[1];
                let d = Math.hypot(bx, by);
                if (d < 115) { 
                    if (d === 0) { bx = 1; by = 0; d = 1; }
                    let overlap = 115 - d;
                    let nx = bx / d;
                    let ny = by / d;
                    
                    // Outward repulsion + Tangential sliding force aligned with intended travel
                    let tx = -ny;
                    let ty = nx;
                    let dot = deltas[c.id][0] * tx + deltas[c.id][1] * ty;
                    let sign = dot > 0 ? 1 : -1;
                    
                    deltas[c.id][0] += nx * overlap + tx * (4 + overlap * 0.2) * sign;
                    deltas[c.id][1] += ny * overlap + ty * (4 + overlap * 0.2) * sign;
                }
            }

            // Death Circle ensures cats are never pushed outside
            let curr_px = c.position[0] + deltas[c.id][0];
            let curr_py = c.position[1] + deltas[c.id][1];
            let rad = Math.hypot(curr_px, curr_py);
            let limit = death_circle - 15;
            if (rad > limit && limit > 0) {
                let factor = limit / rad;
                deltas[c.id][0] = (curr_px * factor) - c.position[0];
                deltas[c.id][1] = (curr_py * factor) - c.position[1];
            }
        }

        // Crucial: Clamp deltas to engine max speed so the separation physics in the 
        // next iteration accurately reflects the game engine's strict velocity capping.
        for (let c of my_alive) {
            let dx = deltas[c.id][0];
            let dy = deltas[c.id][1];
            let d = Math.hypot(dx, dy);
            if (d > 20) {
                deltas[c.id][0] = (dx / d) * 20;
                deltas[c.id][1] = (dy / d) * 20;
            }
        }
    }

    // 6. Apply Final Computed Moves & Marks
    for (let c of my_alive) {
        c.set_mark(cat_marks[c.id]);
        let nx = c.position[0] + deltas[c.id][0];
        let ny = c.position[1] + deltas[c.id][1];
        c.move([nx, ny]);
    }

    // Logging & Analytics
    if (tick % 50 === 0) {
        let retreating_count = my_alive.filter(c => memory.retreating[c.id]).length;
        console.log(`--- Tick ${tick} ---`);
        console.log(`Us: ${my_alive.length} (${retreating_count} retreating) | Enemy: ${enemy_alive.length}`);
        let total_e = my_alive.reduce((s, c) => s + c.energy, 0);
        let enemy_e = enemy_alive.reduce((s, c) => s + c.energy, 0);
        console.log(`Total Energy -> Us: ${total_e} | Enemy: ${enemy_e}`);
        console.log(`Death Circle Rad: ${death_circle.toFixed(1)}`);
    }
}