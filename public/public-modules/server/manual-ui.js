
// manual ui game code (server-side)

// basics

enemy_living = Object.values(spirits).filter(s => s.player_id != this_player_id && s.hp != 0);
my_living = Object.values(spirits).filter(s => s.player_id == this_player_id && s.hp != 0);
if (memory['behaviour'] == undefined){
	memory['behaviour'] = {};
	memory['newborn_base_zxq'] = [];
	memory['newborn_base_a2c'] = [];
	memory['newborn_base_p89'] = [];
	memory['newborn_base_nua'] = [];
	memory['harvesting_groups'] = {};
	stars_array = [star_zxq, star_a2c, star_p89, star_nua];
	bases_array = [base_zxq, base_a2c, base_p89, base_nua];
	structures_array = [base_zxq, base_a2c, base_p89, base_nua, outpost, pylon];
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

function find_closest_star(from_spirit){
	let zxq_dist = get_distance_fast(from_spirit.position, star_zxq.position);
	let a2c_dist = get_distance_fast(from_spirit.position, star_a2c.position);
	let p89_dist = get_distance_fast(from_spirit.position, star_p89.position);
	let nua_dist = get_distance_fast(from_spirit.position, star_nua.position);
	let temp_arr = [zxq_dist, a2c_dist, p89_dist, nua_dist];
	let smallest_dist = Math.min(...temp_arr);
	let idx = temp_arr.indexOf(smallest_dist);
	return stars_array[idx];
}

function find_closest_base(from_spirit){
	let zxq_dist = get_distance_fast(from_spirit.position, base_zxq.position);
	let a2c_dist = get_distance_fast(from_spirit.position, base_a2c.position);
	let p89_dist = get_distance_fast(from_spirit.position, base_p89.position);
	let nua_dist = get_distance_fast(from_spirit.position, base_nua.position);
	let temp_arr = [zxq_dist, a2c_dist, p89_dist, nua_dist];
	let smallest_dist = Math.min(...temp_arr);
	let idx = temp_arr.indexOf(smallest_dist);
	return bases_array[idx];
}

function find_weakest(from_group){
	let weakest = '';
	let weakest_energy = 1000;
	for (let sp_id of from_group){
		let spi = spirits[sp_id];
		if (spi.energy < weakest_energy && spi.energy > -1){
			weakest_energy = spi.energy;
			weakest = spi.id;
		}
	}
	return weakest;
}

function find_nearest(from_spirit, from_group){
	let nearest = '';
	let nearest_dist = 80000;
	for (let sp_id of from_group){
		let spi = spirits[sp_id];
		let temp_dist = get_distance_fast(from_spirit.position, spi.position);
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
		let sp = spirits[sp_id];
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
		energize_chain: [],
		attitude: 'nothing',
		attitude_jump: 0,
		targetting: 'nearest',
		action_priority: 'manual',
		merge: '',
		divide: 0,
		lock: 0,
		explode: 0,
		obj_energize: ''
	}
	
	let closest_base_id = find_closest_base(sp).id;
	let closest_star_id = find_closest_star(sp).id;
	let newborn_beh = memory['newborn_' + closest_base_id];
	if (newborn_beh == []) return;
	if (newborn_beh[0] == ['harvest']){
		memory['behaviour'][sp.id]['energize_chain'] = [closest_base_id, closest_star_id];
	} else if (newborn_beh[0] == 'goto'){
		memory['behaviour'][sp.id]['move'] = newborn_beh[1];
	}
}

function charge_friend(sp){
	if (sp.energy <= 0 || sp.hp != 1) return;
	//charging friendly spirits if sp close to star (and friends further away)
	let closest_star = find_closest_star(sp);
	let friend_candidates = [];
	if (get_distance(sp.position, closest_star.position) <= 200) {
		
		for (let friend_id of sp.sight.friends_beamable){
			let friend = spirits[friend_id];
			let star_dist_sp = get_distance_fast(sp.position, closest_star.position);
			let star_dist_friend = get_distance_fast(friend.position, closest_star.position);
			if (star_dist_friend > star_dist_sp && (Math.abs(sp.position[0] - friend.position[0]) > 20 || Math.abs(sp.position[1] - friend.position[1]) > 20)){
				friend_candidates.push(friend)
			}
		}
		
		friend_candidates.sort(function(a,b) {
				return a[1]-b[1];
		});
		
		for (let candidate of friend_candidates){
			let closest_star_fr = find_closest_star(candidate);
			if (get_distance(candidate.position, closest_star.position) > 200 && candidate.energy < candidate.energy_capacity){
				sp.energize(candidate);
				sp.energy -= 1;
				candidate.energy += 1;
				break;
			}
		}
	}
}

function man_universal(sp){
	if (sp.energy < sp.energy_capacity) sp.energize(sp);
	if (sp.sight.friends_beamable.length > 0) charge_friend(sp); 
	
	if (memory['behaviour'][sp.id]['energize_chain'].length > 0) {
		let closest_base = find_closest_base(sp);
		if (get_distance(sp.position, closest_base.position) <= 200) {
			if (sp.energy > 0) sp.energize(closest_base);
			sp.energy -= 1;
		}
	}
	
	
	
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
	if (beh_value == '' || beh_value == sp.id) return;
	sp.merge(spirits[beh_value]);
}

function man_divide(sp){
	let beh_value = memory['behaviour'][sp.id]['merge'];
	if (beh_value == '' && sp.size > 1){
		for (let sp_id of sp.merged){
			memory['behaviour'][sp_id]['merge'] = '';
			memory['behaviour'][sp_id]['move'] = memory['behaviour'][sp.id]['move'];
		}
		sp.divide();
	}
}

function man_energize_structure(sp){
	let beh_value = memory['behaviour'][sp.id]['obj_energize'];
	if (beh_value != '' && sp.energy > 0) sp.energize(globalThis[beh_value]);
}


function man_enemy_triggered_actions(sp){
	if (sp.sight.enemies.length == 0) return;
	let beh_move = memory['behaviour'][sp.id]['move'];
	let beh_target = memory['behaviour'][sp.id]['targetting'];
	let beh_attitude = memory['behaviour'][sp.id]['attitude'];
	let beh_priority = memory['behaviour'][sp.id]['action_priority'];
	let enemy_target_id = '';
	
	if (beh_target == 'nearest'){
		enemy_target_id = find_nearest(sp, sp.sight.enemies_beamable);
	} else if (beh_target == 'lowest'){
		enemy_target_id = find_weakest(sp.sight.enemies_beamable);
	}
	
	if (sp.energy > 0 && enemy_target_id != ''){
		let enemy = spirits[enemy_target_id];
		sp.energize(enemy);
		sp.energy -= 1;
		enemy.energy -= 2;
	}
	
	//if ()
	if (beh_attitude == 'keepdist'){
		if (!(beh_priority == 'manual' && beh_move.length != 0)) basic_escape(sp);
	}
	
}

function basic_escape(sp, howfar = 241){
	let nearest_enemy = find_nearest(sp, sp.sight.enemies);
	let towards_point = 0;
	let vectorish = [];
	let away_point = [];
	if (nearest_enemy != ''){
		let attacker = spirits[nearest_enemy]
		towards_point = circle_line_intersect(sp.position, attacker.position, 20);
		vectorish = [towards_point[0] - sp.position[0], towards_point[1] - sp.position[1]];
		away_point = [sp.position[0] + (-1 * vectorish[0]), sp.position[1] + (-1 * vectorish[1])];
		
		if (get_distance(sp.position, attacker.position) < howfar) sp.move(away_point);
	}
}


function create_harvesting_group(star_id, structure_id){
	let harv_star = globalThis[star_id];
	let harv_structure = globalThis[structure_id];
	let obj_distance = get_distance(harv_star.position, harv_structure.position);
	let num_points = Math.floor(obj_distance / 200);
	let harv_points = [];
	
	for (let i = 1; i <= num_points; i++){
		let temp_point = circle_line_intersect(harv_star.position, harv_structure.position, 199 * i);
		harv_points.push([Math.round(temp_point[0] * 10) / 10, Math.round(temp_point[1] * 10) / 10]);
	}
	
	memory['harvesting_groups'][star_id + '|' + structure_id] = {
		points: harv_points,
		spirits: []
	}
	
	//console.log('num_point = ' + num_points);
	//console.log('distance = ' + obj_distance);
	//console.log(JSON.stringify(memory['harvesting_groups']));
}

function man_populate_harvesting_groups(sp){
	let beh_value = memory['behaviour'][sp.id]['energize_chain'];
	if (beh_value.length > 0){
		//console.log('populate: ' + beh_value);
		if (memory['harvesting_groups'][beh_value[1] + '|' + beh_value[0]] == undefined)
			create_harvesting_group(beh_value[1], beh_value[0]);
		memory['harvesting_groups'][beh_value[1] + '|' + beh_value[0]]['spirits'].push(sp.id)
	}
}


function man_harvest(){
	
	let chains = Object.keys(memory['harvesting_groups']);
	for (let chain of chains){
		let star_obj = globalThis[chain.split('|')[0]];
		let structure_obj = globalThis[chain.split('|')[1]];
		let chain_points = memory['harvesting_groups'][chain]['points'];
		let spirit_pool = memory['harvesting_groups'][chain]['spirits'];
		let per_point = Math.floor(spirit_pool.length / (chain_points.length + 1));
		let leftover = spirit_pool.length % (chain_points.length + 1);
		let spirits_at_point = [] //array of spirit arrays
		
		if (per_point > 0){
			for (let i = (chain_points.length - 1); i >= 0; i--){
				let temp_mult = (i == 0) ? 2 : 1;
				let chosens = gather_friends(chain_points[i], per_point * temp_mult, spirit_pool);
				spirits_at_point.unshift(chosens);
				for (let sp_id of chosens){
					let link = spirits[sp_id];
					link.set_mark(chain + i);
					link.move(chain_points[i]);
					if (i == (chain_points.length - 1)){
						if (link.energy > 0){
							 link.energize(structure_obj);
							 link.energy -= 1;
						}
					} else {
						let target = find_weakest(spirits_at_point[1]);
						if (link.energy > 0){
							 link.energize(target);
							 link.energy -= 1;
							 target.energy += 1;
						}
					}
				}
			}
		}
		
		if (leftover > 0){
			for (let i = (leftover - 1); i >= 0; i--){
				let chosens = gather_friends(chain_points[i], 1, spirit_pool);
				for (let sp_id of chosens){
					let link = spirits[sp_id];
					link.set_mark(chain + i);
					link.move(chain_points[i]);
				}
			}
		}
		
		for (let unit of spirit_pool){
			
		}
		
		//console.log('str = ' + star_obj.id)
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

// item will be an array with [spirit.id, behaviour type (e.g. 'move'), value]
for (let item of client[ttick]['behaviour']){
	memory['behaviour'][item[0]][item[1]] = item[2];
	
	if (item[1] == 'move'){
		memory['behaviour'][item[0]]['energize_chain'] = [];
		let target_structure = get_structure_at_position(item[2])
		if (target_structure == false){
			memory['behaviour'][item[0]]['obj_energize'] = '';
		} else {
			memory['behaviour'][item[0]]['obj_energize'] = target_structure;
		}
	}
	
	
}

memory['newborn_base_zxq'] = client[ttick]['newborn_base_zxq'];
memory['newborn_base_a2c'] = client[ttick]['newborn_base_a2c'];
memory['newborn_base_p89'] = client[ttick]['newborn_base_p89'];
memory['newborn_base_nua'] = client[ttick]['newborn_base_nua'];

for (let sp of my_living){
	sp.set_mark('');
	man_universal(sp);
	man_move(sp);
	man_jump(sp);
	man_merge(sp);
	man_divide(sp);
	//man_lock(sp);
	//man_unlock(sp);
	//man_explode(sp);
	man_energize_structure(sp);
	man_enemy_triggered_actions(sp);
	man_populate_harvesting_groups(sp);
}

man_harvest();

man_resets();




