
try {
    received = channels.recv("MANUALUI")
    client[ttick] = received?.length > 0 ? received.reverse()[0] : memory["MANUALUI"]
} catch (e) {
    
}
memory["MANUALUI"] = client[ttick]

// manual ui game code (server-side)

// basics

enemy_living = Object.values(cats).filter(s => s.player_id != this_player_id && s.hp != 0);
my_living = Object.values(cats).filter(s => s.player_id == this_player_id && s.hp != 0);
if (memory['behaviour'] == undefined){
	memory['behaviour'] = {};
	memory['harvesting_groups'] = {};
	barricades_array = [barricade_a, barricade_b, barricade_c, barricade_d];
	structures_array = [barricade_a, barricade_b, barricade_c, barricade_d];
}

//helper functions
function get_distance(pos1, pos2) {
    let dx = pos1[0] - pos2[0];
    let dy = pos1[1] - pos2[1];
    return Math.sqrt(dx*dx + dy*dy);
}

function get_distance_fast(pos1, pos2) {
    let dx = pos1[0] - pos2[0];
    let dy = pos1[1] - pos2[1];
    return dx*dx + dy*dy;
}

function find_closest_barricade(from_cat){
	let a_dist = get_distance_fast(from_cat.position, barricade_a.position);
	let b_dist = get_distance_fast(from_cat.position, barricade_b.position);
	let c_dist = get_distance_fast(from_cat.position, barricade_c.position);
	let d_dist = get_distance_fast(from_cat.position, barricade_d.position);
	let temp_arr = [a_dist, b_dist, c_dist, d_dist];
	let smallest_dist = Math.min(...temp_arr);
	let idx = temp_arr.indexOf(smallest_dist);
	return barricades_array[idx];
}


function find_weakest(from_group){
	let weakest = '';
	let weakest_energy = 1000;
	for (let sp_id of from_group){
		let spi = cats[sp_id];
		if (spi.energy < weakest_energy && spi.energy > -1){
			weakest_energy = spi.energy;
			weakest = spi.id;
		}
	}
	return weakest;
}

function find_nearest(from_cat, from_group){
	let nearest = '';
	let nearest_dist = 80000;
	for (let sp_id of from_group){
		let spi = cats[sp_id];
		let temp_dist = get_distance_fast(from_cat.position, spi.position);
		if (temp_dist < nearest_dist && spi.energy > -1){
			nearest_dist = temp_dist;
			nearest = spi.id;
		}
	}
	return nearest;
}

function circle_line_intersect(circle_origin, line_target, radius){
    let a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
    v1 = {};
    v2 = {};
    v1.x = line_target[0] - circle_origin[0];
    v1.y = line_target[1] - circle_origin[1];
    v2.x = circle_origin[0] - circle_origin[0];
    v2.y = circle_origin[1] - circle_origin[1];
    b = (v1.x * v2.x + v1.y * v2.y);
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - radius * radius));
    if(isNaN(d)){ // no intercept
        return [];
    }
    u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line_target
    u2 = (b + d) / c;    
    retP1 = {};   // return points
    retP2 = {}  
    ret = []; // return array
    if(u1 <= 1 && u1 >= 0){  // add point if on the line_target segment
        retP1.x = circle_origin[0] + v1.x * u1;
        retP1.y = circle_origin[1] + v1.y * u1;
        ret[0] = retP1;
    }
    if(u2 <= 1 && u2 >= 0){  // second add point if on the line_target segment
        retP2.x = circle_origin[0] + v1.x * u2;
        retP2.y = circle_origin[1] + v1.y * u2;
        ret[ret.length] = retP2;
    }       
	try {
        return [ret[0].x, ret[0].y];
    } catch(e) {
        return 0;
    }
}

function gather_friends(point, howmany, from_group){
	
	let temp_array = [];
	let final_array = []; // ordered array of closest friends
	
	for (let sp_id of from_group){
		let sp = cats[sp_id];
		if (sp.mark != '') continue;
		temp_array.push([sp_id, get_distance_fast(sp.position, point)]);
	}
	temp_array.sort(function(a,b) {
		return a[1]-b[1];
	});
	
	for (let item of temp_array){
		final_array.push(item[0]);
	}
	
	final_array.length = howmany;
	return final_array;
}

function distance_within_square(point1, point2, dist){
	return (Math.abs(point1[0] - point2[0]) < dist && Math.abs(point1[1] - point2[1]) < dist)
}

function get_structure_at_position(pos){
	let clicked_structure = false;
	for (let structure of structures_array){
		if (distance_within_square(pos, structure.position, 20)) clicked_structure = structure.id;
	}
	return clicked_structure;
}

// ----------

function set_newborn_behaviour(sp){
	memory['behaviour'][sp.id] = {
		move: [],
		jump: 0,
		pew_chain: [],
		attitude: 'nothing',
		attitude_jump: 0,
		targetting: 'nearest',
		action_priority: 'manual',
		merge: '',
		divide: 0,
		lock: 0,
		explode: 0,
		obj_pew: ''
	}
	
	let closest_barricade_id = find_closest_barricade(sp).id;
}

function charge_friend(sp){
	if (sp.energy <= 0 || sp.hp != 1) return;
	//charging friendly cats if sp close to barricade (and friends further away)
	let closest_barricade = find_closest_barricade(sp);
	let friend_candidates = [];
	if (get_distance(sp.position, closest_barricade.position) <= 200) {
		
		for (let friend_id of sp.sight.friends_pewable){
			let friend = cats[friend_id];
			let barricade_dist_sp = get_distance_fast(sp.position, closest_barricade.position);
			let barricade_dist_friend = get_distance_fast(friend.position, closest_barricade.position);
			if (barricade_dist_friend > barricade_dist_sp && (Math.abs(sp.position[0] - friend.position[0]) > 20 || Math.abs(sp.position[1] - friend.position[1]) > 20)){
				friend_candidates.push(friend)
			}
		}
		
		friend_candidates.sort(function(a,b) {
				return a[1]-b[1];
		});
		
		for (let candidate of friend_candidates){
			let closest_barricade_fr = find_closest_barricade(candidate);
			if (get_distance(candidate.position, closest_barricade.position) > 200 && candidate.energy < candidate.energy_capacity){
				sp.pew(candidate);
				sp.energy -= 1;
				candidate.energy += 1;
				break;
			}
		}
	}
}

function man_universal(sp){
	if (sp.energy < sp.energy_capacity) sp.pew(sp);
	if (sp.sight.friends_pewable.length > 0) charge_friend(sp); 
	
	
}

function man_move(sp){
	let beh_value = memory['behaviour'][sp.id]['move'];
	if (beh_value.length > 0) sp.move(beh_value);
	//if (sp.position == beh_value) memory['behaviour'][sp.id]['move'] = [];
}

function man_jump(sp){
	let beh_value = memory['behaviour'][sp.id]['jump'];
	if (beh_value){
		let jump_dest = memory['behaviour'][sp.id]['move'];
		if (get_distance(sp.position, jump_dest) > 25) sp.jump(jump_dest);
		memory['behaviour'][sp.id]['jump'] = 0;
	}
}

function man_merge(sp){
	let beh_value = memory['behaviour'][sp.id]['merge'];
	if (beh_value == '' || beh_value == sp.id) return false;
	sp.merge(cats[beh_value]);
}

function man_divide(sp){
}

function man_lock(sp){
	let beh_value = memory['behaviour'][sp.id]['lock'];
	if (beh_value == '') return;
	if (beh_value == 1) sp.lock();
}

function man_unlock(sp){
	let beh_value = memory['behaviour'][sp.id]['lock'];
	if (beh_value == 0) sp.unlock();
}

function man_explode(sp){
	let beh_value = memory['behaviour'][sp.id]['explode'];
	if (beh_value == '') return;
	if (beh_value == 1) sp.explode();
}

function man_pew_structure(sp){
	let beh_value = memory['behaviour'][sp.id]['obj_pew'];
	if (beh_value != '' && sp.energy > 0) sp.pew(globalThis[beh_value]);
}


function man_enemy_triggered_actions(sp){
	if (sp.sight.enemies.length == 0) return;
	let beh_move = memory['behaviour'][sp.id]['move'];
	let beh_target = memory['behaviour'][sp.id]['targetting'];
	let beh_attitude = memory['behaviour'][sp.id]['attitude'];
	let beh_attitude_jump = memory['behaviour'][sp.id]['attitude_jump'];
	let beh_priority = memory['behaviour'][sp.id]['action_priority'];
	let enemy_target_id = '';
	
	if (beh_target == 'nearest'){
		enemy_target_id = find_nearest(sp, sp.sight.enemies_pewable);
	} else if (beh_target == 'lowest'){
		enemy_target_id = find_weakest(sp.sight.enemies_pewable);
	}
	
	if (sp.energy > 0 && enemy_target_id != ''){
		let enemy = cats[enemy_target_id];
		sp.pew(enemy);
		sp.energy -= 1;
		enemy.energy -= 2;
	}
	
	// automatic behaviour settings
	if (beh_attitude == 'keepdist'){
		if (!(beh_priority == 'manual' && beh_move.length != 0)) basic_escape(sp, beh_attitude_jump);
		if (beh_priority == 'attitude') basic_escape(sp, beh_attitude_jump);
		if (beh_priority == 'manual' && beh_move == sp.position) basic_escape(sp, beh_attitude_jump);
	} else if (beh_attitude == 'chase'){
		if (!(beh_priority == 'manual' && beh_move.length != 0)) chase_enemy(sp, beh_attitude_jump, beh_move);
		if (beh_priority == 'attitude') chase_enemy(sp, beh_attitude_jump, sp.position);
		if (beh_priority == 'manual' && beh_move == sp.position) chase_enemy(sp, beh_attitude_jump, beh_move);
	}
	
}

function basic_escape(sp, jumpy, howfar = 241){
	let nearest_enemy = find_nearest(sp, sp.sight.enemies);
	let towards_point = 0;
	let vectorish = [];
	let away_point = [];
	if (nearest_enemy != ''){
		let attacker = cats[nearest_enemy];
		towards_point = circle_line_intersect(sp.position, attacker.position, 40);
		vectorish = [towards_point[0] - sp.position[0], towards_point[1] - sp.position[1]];
		away_point = [sp.position[0] + (-1 * vectorish[0]), sp.position[1] + (-1 * vectorish[1])];
		
		if (get_distance(sp.position, attacker.position) < howfar) sp.move(away_point);
		if (get_distance(sp.position, attacker.position) < 200 && jumpy) sp.jump(away_point)
	}
}

function chase_enemy(sp, jumpy, anchor, howfar = 200){
	let nearest_enemy = find_nearest(sp, sp.sight.enemies);
	let towards_point = 0;
	if (nearest_enemy != ''){
		let victim = cats[nearest_enemy];
		towards_point = circle_line_intersect(sp.position, victim.position, 40);
		if (get_distance(sp.position, anchor) <= howfar){
			sp.move(victim.position);
		} 
		if (get_distance(sp.position, victim.position) >= 200 && jumpy){
			sp.jump(towards_point);
		}
	}
	
}

function create_harvesting_group(barricade_id, structure_id){
	let harv_barricade = globalThis[barricade_id];
	let harv_structure = globalThis[structure_id];
	let obj_distance = get_distance(harv_barricade.position, harv_structure.position);
	let num_points = Math.floor(obj_distance / 200);
	let harv_points = [];
	
	for (let i = 1; i <= num_points; i++){
		let temp_point = circle_line_intersect(harv_barricade.position, harv_structure.position, 199 * i);
		harv_points.push([Math.round(temp_point[0] * 10) / 10, Math.round(temp_point[1] * 10) / 10]);
	}
	
	memory['harvesting_groups'][barricade_id + '|' + structure_id] = {
		points: harv_points,
		cats: []
	}
	
	//console.log('num_point = ' + num_points);
	//console.log('distance = ' + obj_distance);
	//console.log(JSON.stringify(memory['harvesting_groups']));
}

function man_populate_harvesting_groups(sp){
	let beh_value = memory['behaviour'][sp.id]['pew_chain'];
	if (beh_value.length > 0){
		//console.log('populate: ' + beh_value);
		if (memory['harvesting_groups'][beh_value[1] + '|' + beh_value[0]] == undefined)
			create_harvesting_group(beh_value[1], beh_value[0]);
		memory['harvesting_groups'][beh_value[1] + '|' + beh_value[0]]['cats'].push(sp.id)
	}
}


function man_harvest(){
	
	let chains = Object.keys(memory['harvesting_groups']);
	for (let chain of chains){
		let barricade_obj = globalThis[chain.split('|')[0]];
		let structure_obj = globalThis[chain.split('|')[1]];
		let chain_points = memory['harvesting_groups'][chain]['points'];
		let cat_pool = memory['harvesting_groups'][chain]['cats'];
		let per_point = Math.floor(cat_pool.length / (chain_points.length + 1));
		let leftover = cat_pool.length % (chain_points.length + 1);
		let cats_at_point = [] //array of cat arrays
		
		if (per_point > 0){
			for (let i = (chain_points.length - 1); i >= 0; i--){
				let temp_mult = (i == 0) ? 2 : 1;
				let chosens = gather_friends(chain_points[i], per_point * temp_mult, cat_pool);
				cats_at_point.unshift(chosens);
				for (let sp_id of chosens){
					//if (sp_id == '') continue;
					let link = cats[sp_id];
					link.set_mark(chain + i);
					link.move(chain_points[i]);
					if (i == (chain_points.length - 1)){
						if (link.energy > 0){
							 link.pew(structure_obj);
							 link.energy -= 1;
						}
					} else {
						let target = find_weakest(cats_at_point[1]);
						if (link.energy > 0){
							 link.pew(target);
							 link.energy -= 1;
							 target.energy += 1;
						}
					}
				}
			}
		}
		
		if (leftover > 0){
			for (let i = (leftover - 1); i >= 0; i--){
				let chosens = gather_friends(chain_points[i], 1, cat_pool);
				for (let sp_id of chosens){
					let link = cats[sp_id];
					link.set_mark(chain + i);
					link.move(chain_points[i]);
				}
			}
		}
		
		for (let unit of cat_pool){
			
		}
		
		//console.log('str = ' + barricade_obj.id)
		//console.log(chain_points);
	}
	
	//console.log('chains');
	//console.log(chains);
}





function man_resets(){
	memory['harvesting_groups'] = {};
}







for (let i = (my_living.length - 1); i >= 0; i--){
	if (memory['behaviour'][my_living[i].id] == undefined){
		set_newborn_behaviour(my_living[i])
	} else {
		break;
	} 
}

// item will be an array with [cat.id, behaviour type (e.g. 'move'), value]
for (let item of (client[ttick] && client[ttick]['behaviour']) || []){
	memory['behaviour'][item[0]][item[1]] = item[2];
	
	if (item[1] == 'move'){
		memory['behaviour'][item[0]]['pew_chain'] = [];
		let target_structure = get_structure_at_position(item[2])
		if (target_structure == false){
			memory['behaviour'][item[0]]['obj_pew'] = '';
		} else {
			memory['behaviour'][item[0]]['obj_pew'] = target_structure;
		}
	}
	
	
}


for (let sp of my_living){
	if (sp.hp == 0) continue;
	sp.set_mark('');
	man_universal(sp);
	man_move(sp);
	man_jump(sp);
	man_merge(sp);
	man_divide(sp);
	man_lock(sp);
	man_unlock(sp);
	man_explode(sp);
	man_pew_structure(sp);
	man_enemy_triggered_actions(sp);
	man_populate_harvesting_groups(sp);
}

man_harvest();

man_resets();




