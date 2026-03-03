

//globals

var client = {};

const min_beam = 200;
const aoe_radius = 10;
const h_square = min_beam / Math.sqrt(2);
var started = 0;
var game_duration = -10;
var base_speed = 20;
var ticks = {};
var tick = 0;
var energy_value = 1;
var circle_radius = 1200;
var death_circle = circle_radius;
const CIRCLE_MIN_RADIUS = 50;
const CIRCLE_SHRINK_RATE = 2;
const CIRCLE_DRAIN = 1;
var top_s = 0;
var top_q = 0;
var rawCats1 = {};
var rawCats2 = {};
var my_cats1 = [];
var my_cats2 = [];
var barricades = [];
var BARRICADE_COLLISION_RADIUS = 100;
var pods = [];
var living_cats = [];
var cat_lookup = {};
var barricade_lookup = {};
var structure_lookup = {};

var all_commands = {};

var birth_queue = [];
var death_queue = [];

var players = {};
var colors = {};

var user_error1 = [];
var user_error2 = [];

var render_data3 = {};

var memory1 = {};
var memory2 = {};

var game_file = [];

var stop_engine = 1;


var yd = {};
yd.commands = {
    cat: {},
    channels: {},
};
yd.errors = [];
yd.logs = [];
yd.deprecates = {};
yd.channels = {};
yd.channels_in = {};
function command(id) {
    if (!(id in yd.commands.cat)) {
        yd.commands.cat[id] = {};
    }
    return yd.commands.cat[id];
}

var p1_defend = 0;
var p2_defend = 0;

var temp_flag = 0;
var end_winner = 0;

var game_duration = -50;
var game_activity = 1;



var _real_console_log = console.log;
var _real_console_error = console.error;
console.log = function(...args) {
    yd.logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    _real_console_log.apply(console, args);
};
console.error = function(...args) {
    _real_console_error.apply(console, args);
};

function soft_error(msg) {
    yd.errors.push(msg);
}


function shuffle_array(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


class Cat {
	constructor(id, position, player, color){
		this.id = id;
		this.position = position;
		this.energy = 10;
		this.energy_capacity = 10;
		this.last_pewed = '';
		this.color = color;
		this.mark = '';
		this.range = min_beam;
	
		this.sight = {
			friends: [],
			enemies: [],
		}
		this.qcollisions = [];
	
		this.hp = 1;
		this.move_speed = 1;
		this.player_id = player;
	
		living_cats.push(this);
		birth_queue.push(this);
	}

    move(target) {
        if (!Array.isArray(target) || target.length != 2){
            soft_error('.move() argument must be an array of 2 numbers.\n > E.g. my_cats[0].move([100, 100]) or my_cats[0].move(my_cats[1].position).\n > Received: ' + target);
            return;
        }

        const tarX = Number(target[0]);
        const tarY = Number(target[1]);
        
        if(isNaN(tarX) || isNaN(tarY)){
            soft_error('.move() arguments must be numbers, got ['+ tarX + ", " + tarY + ']');
            return;
        }

        command(this.id).move = [tarX, tarY];
    }

    pew(target) {		
        let target_id = null;
		if (Array.isArray(target) && target.length == 2){
			target_id = target;
		} else if (typeof target == 'object'){
            target_id = target.id;
        } else if (typeof target == 'string'){
            target_id = target;
        } 

        let bad = target_id == null || target == null;
        if(bad){
            let example_id = this.player_id + "_2";
            soft_error(".pew() argument must be a game object (e.g. cat) with id or a position (e.g. [250, 350]).\n > E.g. my_cats[0].pew(my_cats[0])\n > or my_cats[0].pew(cats['" + example_id + "'])\n > or my_cats[0].pew('" + example_id + "')\n > Received: " + target);
            return;
        }
        
        command(this.id).pew = target_id;
    }
    
    set_mark(mrk){
        if (typeof mrk !== 'string'){
            soft_error("mark must be a string. Received: " + mrk);
            return;
        }
        if (mrk.length > "60"){
            soft_error("Max length of mark is 60 characters");
            return;
        }
        
        command(this.id).mark = mrk;
        this.mark = mrk;
    }
    
    
    shout(msg){
        if (typeof msg !== 'string'){
            soft_error("Shout argument must be a string. Received: " + msg);
            return;
        }
        if (msg.length > "20"){
            soft_error("Max length of shout message is 20 characters");
            return;
        }
        
        if (this.hp != 0){
            command(this.id).shout = msg;
        }
    }
}

var POD_HALF_SIZE = 20;


function dist_sq(item1, item2){
	return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2);
}

function fast_dist_lt(item1, item2, range){
	return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2) < range**2;
}

function fast_dist_leq(item1, item2, range){
	return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2) <= range**2;
}

function fast_dist_simp(item1, item2, range){
	return ((Math.abs(item1[0] - item2[0]) <= range) && (Math.abs(item1[1] - item2[1]) <= range))
}

function norm_sq(coor){
	return coor[0]**2 + coor[1]**2;
}

function normalize(coor){
	let norm = Math.sqrt(norm_sq(coor));
	return [coor[0]/norm, coor[1]/norm];
}

function mult(a, coor){
	return [a * coor[0], a*coor[1]];
}

function add(coor1, coor2){
	return [coor1[0] + coor2[0], coor1[1] + coor2[1]];
}

function linc(coor1, coor2, alpha){
	return add(mult(alpha, coor1), mult(1-alpha, coor2));
}

function sub(coor1, coor2){
	return [coor1[0] - coor2[0], coor1[1] - coor2[1]];
}

function round_to(number, places){
	return +number.toFixed(places);
}


function intersection(x0, y0, r0, x1, y1, r1) {
    let a, dx, dy, d, h, rx, ry;
    let x2, y2;

    /* dx and dy are the vertical and horizontal distances between
     * the circle centers.
     */
    dx = x1 - x0;
    dy = y1 - y0;

    /* Determine the straight-line distance between the centers. */
    d = Math.sqrt((dy*dy) + (dx*dx));

    /* Check for solvability. */
    if (d > (r0 + r1)) {
        /* no solution. circles do not intersect. */
        return false;
    }
    if (d < Math.abs(r0 - r1)) {
        /* no solution. one circle is contained in the other */
        return false;
    }

    /* 'point 2' is the point where the line through the circle
     * intersection points crosses the line between the circle
     * centers.  
     */

    /* Determine the distance from point 0 to point 2. */
    a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

    /* Determine the coordinates of point 2. */
    x2 = x0 + (dx * a/d);
    y2 = y0 + (dy * a/d);

    /* Determine the distance from point 2 to either of the
     * intersection points.
     */
    h = Math.sqrt((r0*r0) - (a*a));

    /* Now determine the offsets of the intersection points from
     * point 2.
     */
    rx = -dy * (h/d);
    ry = dx * (h/d);

    /* Determine the absolute intersection points. */
    let xi = x2 + rx;
    let xi_prime = x2 - rx;
    let yi = y2 + ry;
    let yi_prime = y2 - ry;

    return [[xi, yi], [xi_prime, yi_prime]];
}

function is_in_sight(item1, item2, range = 400){
	return fast_dist_leq(item1.position, item2.position, range);
}

function get_sight_fast(){
	const pewable_sq = min_beam**2;
	const visible_sq = (2*min_beam)**2;
	const living_length = living_cats.length;

	for (let h = 0; h < living_length; h++){
	  living_cats[h].sight = {
			friends_pewable: [],
			enemies_pewable: [],
			friends: [],
			enemies: [],
	  }
	  living_cats[h].qcollisions = [];
	}

	function work(i, j){
		let pi = living_cats[i].player_id;
		let pj = living_cats[j].player_id;
		if (pi == pj){
			living_cats[i].sight.friends.push(living_cats[j].id);
			living_cats[j].sight.friends.push(living_cats[i].id);
		}
		else{
			living_cats[i].sight.enemies.push(living_cats[j].id);
			living_cats[j].sight.enemies.push(living_cats[i].id);
		}
	}

	function work_pewable(i, j){
		let pi = living_cats[i].player_id;
		let pj = living_cats[j].player_id;
		if (pi == pj){
			living_cats[i].sight.friends_pewable.push(living_cats[j].id);
			living_cats[j].sight.friends_pewable.push(living_cats[i].id);
		}
		else{
			living_cats[i].sight.enemies_pewable.push(living_cats[j].id);
			living_cats[j].sight.enemies_pewable.push(living_cats[i].id);
		}
	}

	let hist = {};
	for (let i = 0; i < living_length; i++){
		let cat = living_cats[i];
		if (cat.hp == 0) continue;
		let pos = cat.position;

		let xbin = Math.floor(pos[0] / h_square);
		let ybin = Math.floor(pos[1] / h_square);
		if (hist[[xbin, ybin]] == undefined){
			hist[[xbin, ybin]] = [[xbin, ybin, -1]];
		}
		hist[[xbin, ybin]].push(i);
	}

	Object.values(hist).forEach(function(bin){
		for(let i = 1; i <bin.length;i++){
			for(let j = i+1; j <bin.length;j++){
				work(bin[i],bin[j]);
				work_pewable(bin[i],bin[j]);
			}
		}

		for(let s = 3; s < 7*4-1 ; s++){
			if(s==21) continue;

			let dy = Math.floor(s / 7);
			let dx = (s % 7) - 3;
			if(dx==0 && dy==0) continue;

			let nb = hist[[bin[0][0]+dx, bin[0][1]+dy]];
			if(nb == undefined)
				continue;

			for(let i = 1; i <bin.length;i++){
				for(let j = 1; j <nb.length;j++){
					let dsq = dist_sq(
						living_cats[bin[i]].position,
						living_cats[nb[j]].position,
					);
					if(dsq <= visible_sq)
						work(bin[i],nb[j]);
					if(dsq <= pewable_sq)
						work_pewable(bin[i],nb[j]);
				}
			}
		}
	});
}

function get_sight(){
	var living_length = living_cats.length;
	for (let h = 0; h < living_length; h++){
	  living_cats[h].sight = {
			friends_pewable: [],
			friends: [],
			enemies: [],
			enemies_pewable: [],
	  }
	  living_cats[h].qcollisions = [];
	}

	for (let i = 0; i < living_length; i++){
		for (let j = i+1; j < living_length; j++){
			if (living_cats[j].hp == 0) continue;
			if (is_in_sight(living_cats[i], living_cats[j])){
				if (living_cats[j].player_id == players['p1']){
					if (living_cats[i].player_id == players['p1']){
						living_cats[i].sight.friends.push(living_cats[j].id);
						living_cats[j].sight.friends.push(living_cats[i].id);
						if (is_in_sight(living_cats[i], living_cats[j], 50)){
							living_cats[i].qcollisions.push(living_cats[j].id);
							living_cats[j].qcollisions.push(living_cats[i].id);
						}
					} else if (living_cats[i].player_id == players['p2']){
						living_cats[i].sight.enemies.push(living_cats[j].id);
						living_cats[j].sight.enemies.push(living_cats[i].id);
					}
				} else if (living_cats[j].player_id == players['p2']){
					if (living_cats[i].player_id == players['p2']){
						living_cats[i].sight.friends.push(living_cats[j].id);
						living_cats[j].sight.friends.push(living_cats[i].id);
					} else if (living_cats[i].player_id == players['p1']){
						living_cats[i].sight.enemies.push(living_cats[j].id);
						living_cats[j].sight.enemies.push(living_cats[i].id);
					}
				}
			}
		}
	
	}
}

function player_owns_cat(id, name){
	if(!id.startsWith(name))
		return false;
	// if the id does start with name, it is still not ok
	// consider players "pepa" and "pepa_the_best"
	let cat_num = Number(id.slice(name.length + 1));
	return id == (name + "_" + cat_num);
}

function move_objects(){
	const prev_position = {};
	for (let player in all_commands){
		let queue = all_commands[player].cat;

		Object.keys(queue).forEach((id) => {
			if(id == 'merge') return;
			if(!id || !player_owns_cat(id, player)){
				//TODO: COMMENTING THIS OUT DOES NOT SOLVE THE ISSUE, MORON!
				// Figure out why this is firing...
				//console.log("WTF: null or cheating: player " + player + " calls "  + id + ".move()");
				return;
			}

			const cat = cat_lookup[id];
			if (cat.hp == 0)	return;
			const tpos = queue[id].move;
			if(!tpos) return;
			const pos = cat.position;
			prev_position[id] = pos;

			
			let incr = sub(tpos, pos);

			let len_sq = norm_sq(incr);
			// work with data only if there is movement
			if (len_sq > 0){
				// if not getting there in one tick
				if(len_sq > base_speed**2){
					// norm the incr vector so that its len is base_speed
					incr = mult(base_speed / Math.sqrt(len_sq), incr);
				}
				cat.position = add(pos, incr).map((c) => round_to(c, 5));

				for (let k = 0; k < barricades.length; k++){
					let object_position = barricades[k];
					if (fast_dist_lt(cat.position, object_position, BARRICADE_COLLISION_RADIUS)){
						let inter_coor = intersection(pos[0], pos[1], base_speed,
														object_position[0], object_position[1], BARRICADE_COLLISION_RADIUS);
						if (inter_coor == false) continue;
						
						let quick_dist1 = dist_sq(inter_coor[0], tpos);
						let quick_dist2 = dist_sq(inter_coor[1], tpos);
						
						let pick_first = quick_dist1 < quick_dist2 || Math.abs(quick_dist1 - quick_dist2) <= 5;
						cat.position = inter_coor[pick_first ? 0 : 1];
					}
				}
			}
		});
	}

	return prev_position;
}

function pew_objects(){
	let pew_apply = [];
	
	for(let cat of Object.values(cat_lookup)){
		cat.last_pewed = '';
	}

	let last_beam = {};
	for (let player in all_commands){
		let queue = all_commands[player].cat;

		Object.keys(queue).forEach((from_id) => {
			if (from_id == 'merge') return;
			
			const to_id = queue[from_id].pew;

			if(!to_id) return;
			if(!from_id || !player_owns_cat(from_id, player) || !to_id) return;

			if(last_beam[from_id] != undefined)
				return;
			last_beam[from_id] = to_id;
			
			const from_obj = cat_lookup[from_id];
			var to_obj;
			
			if (Array.isArray(to_id) && to_id.length == 2){
				to_obj = to_id;
			} else {
				to_obj = cat_lookup[to_id];
			}

			if(!from_obj || !to_obj || from_obj.hp == 0 || to_obj.hp == 0){
				return;
			}

			if (from_id == to_id){
				return;
			}
			
			let to_check = to_obj.position;
			if (Array.isArray(to_obj)) to_check = to_obj;

			let target_close = fast_dist_leq(from_obj.position, to_check, from_obj.range);
			if(! target_close){
				return;
			}

			let beam_strength = Math.min(energy_value, from_obj.energy);
			if(beam_strength <= 0)
				return;

			from_obj.last_pewed = to_id;

			let friendly_beam = from_obj.player_id == to_obj.player_id;

			if (!friendly_beam){
				pew_apply.push([from_obj, -beam_strength]);
				pew_apply.push([to_obj, -2 * beam_strength]);
				render_data3.e.push([from_id, to_id, 2 * beam_strength]);

				if (!Array.isArray(to_obj)){
					for (let i = 0; i < living_cats.length; i++){
						let s = living_cats[i];
						if (s.hp == 0 || s.id == to_id || s.id == from_id) continue;
						if (s.player_id == from_obj.player_id) continue;
						if (!fast_dist_leq(s.position, to_obj.position, aoe_radius)) continue;
						pew_apply.push([s, -2 * beam_strength]);
						render_data3.a.push([from_id, to_id, s.id, 2 * beam_strength]);
					}
				}
			}
			else {
				pew_apply.push([from_obj, -beam_strength]);
				pew_apply.push([to_obj, beam_strength]);
				render_data3.e.push([from_id, to_id, beam_strength]);
			}
		});
	}

	//
	// apply 
	//	

	let applied_to = {};
	let check = [];

	for (let i = pew_apply.length - 1; i >= 0; i--){
		let target = pew_apply[i][0];
		let amount = pew_apply[i][1];
		
		target.energy += amount;

		if(!applied_to[target.id]){
			applied_to[target.id] = true;
			check.push(target);
		}
	}
	
	// check death & energy cap
	for (let i = 0; i < check.length; i++){
		let target = check[i];
		target.energy = Math.min(target.energy, target.energy_capacity);

		if (target.energy < 0){
			death_queue.push(target);
		}
	}
}


function process_stuff(){
	
		let birthlings = birth_queue.length;
		for (let i = birthlings - 1; i >= 0; i--){
			let spt = birth_queue[i];
			cat_lookup[spt.id] = spt;
			birth_queue.splice(i, 1);
		}
	
		//
		// shout and mark
		//
		
		for(let player in all_commands) {
			let commands = all_commands[player].cat;
			for(let cat in commands) {
				if(cat == 'merge') continue;
				if(!player_owns_cat(cat, player)) continue;
				if(!(cat in cat_lookup) || cat_lookup[cat].hp == 0) continue;
				if(commands[cat].shout) render_data3.s.push(['sh', cat, commands[cat].shout]);
				if(commands[cat].mark) cat_lookup[cat].mark = commands[cat].mark;
			}
		}
		//
		// objects pew
		//
		
		pew_objects();

		//
		// objects move
		//

		let prev_position = move_objects();

		//
		// death circle shrink + drain
		//

		circle_radius = Math.max(CIRCLE_MIN_RADIUS, circle_radius - CIRCLE_SHRINK_RATE);
		death_circle = circle_radius;
		const circle_radius_sq = circle_radius * circle_radius;
		for (let i = 0; i < living_cats.length; i++){
			let spt = living_cats[i];
			if (spt.hp == 0) continue;
			let dx = spt.position[0];
			let dy = spt.position[1];
			if (dx * dx + dy * dy > circle_radius_sq){
				spt.energy -= CIRCLE_DRAIN;
				if (spt.energy < 0){
					death_queue.push(spt);
				}
			}
		}

		for (let i = 0; i < living_cats.length; i++){
			let spt = living_cats[i];
			if (spt.hp == 0) continue;
			for (let p = 0; p < pods.length; p++){
				if (Math.abs(spt.position[0] - pods[p][0]) <= POD_HALF_SIZE &&
					Math.abs(spt.position[1] - pods[p][1]) <= POD_HALF_SIZE){
					spt.energy = Math.min(spt.energy + 1, spt.energy_capacity);
					break;
				}
			}
		}

		//objects death & vm sandbox objects update
		for (let i = death_queue.length - 1; i >= 0; i--){
			death_queue[i].hp = 0;
			death_queue.splice(i, 1);
		}

		let sight_t0 = performance.now();
		get_sight_fast();
}

function update_vm_sandbox(){
	if (temp_flag == 0){
		my_cats1 = [];
		my_cats2 = [];
		for (let i = 0; i < living_cats.length; i++){
			let spt = living_cats[i];
			let cutoff_parts = spt.id.split('_');
			let cutoff_id = cutoff_parts.pop();
			if (spt.player_id == players['p2']){
				render_data3.p2.push([cutoff_id, [Math.round(spt.position[0] * 100) / 100, Math.round(spt.position[1] * 100) / 100], spt.energy, spt.hp]);
				my_cats2.push(spt);
				rawCats2[spt.id] = spt;
				var tempJSON = JSON.stringify(spt);
				rawCats1[spt.id] = JSON.parse(tempJSON);

			} else if (spt.player_id == players['p1']) {
				render_data3.p1.push([cutoff_id, [Math.round(spt.position[0] * 100) / 100, Math.round(spt.position[1] * 100) / 100], spt.energy, spt.hp]);
				my_cats1.push(spt);
				rawCats1[spt.id] = spt;
				var tempJSON = JSON.stringify(spt);
				rawCats2[spt.id] = JSON.parse(tempJSON);
			}
		}
		temp_flag = 0;
	} 
}




function initiate_world(){
	
	barricades = boxsanded_copy['barricades'] || [];
	pods = boxsanded_copy['pods'] || [];

	let p1sp = boxsanded_copy['p1_units'];
	let p2sp = boxsanded_copy['p2_units'];
	
	for (let sp = 0; sp < p1sp.length; sp++){
		let sp_num = sp + 1;
		globalThis[players['p1'] + "_" + sp_num] = new Cat(players['p1'] + "_" + sp_num, p1sp[sp][1], players['p1'], colors['player1']);
		top_s = sp_num;
	}
	
	for (let sp = 0; sp < p2sp.length; sp++){
		let sp_num = sp + 1;
		globalThis[players['p2'] + "_" + sp_num] = new Cat(players['p2'] + "_" + sp_num, p2sp[sp][1], players['p2'], colors['player2']);
		top_q = sp_num;
	}
	
}



function getSyntaxErrorLine(code) {
	try {
		eval('(function(){\n' + code + '\n})');
		return null;
	} catch (e) {
		if (typeof e.lineNumber === 'number') {
			return e.lineNumber - 1;
		}
		var match = (e.stack || '').match(/<anonymous>:(\d+):(\d+)/);
		if (match) {
			return parseInt(match[1]) - 1;
		}
		return null;
	}
}

function getRuntimeErrorLine(e) {
	var trace = (e.stack || '').split('\n')[1] || '';
	var match = trace.match(/:(\d+):(\d+)\)$/);
	if (match) {
		return parseInt(match[1]) - 2;
	}
	return null;
}

function run_code(){
	//user_code in game.js
	yd.commands = {
	    merge: new Map(),
	    cat: {},
	    channels: {},
	};
	yd.errors = [];
	yd.logs = [];
	all_commands = {};
	
	var pl1_code = player_codes['pl1_code'] + "memory1 = memory;";
	var fn1;
	try {
		fn1 = Function(pl1_code);
	} catch (e) {
		var line = getSyntaxErrorLine(pl1_code);
		yd.errors.push(e.message + (line !== null ? ' (line ' + line + ')' : ''));
		fn1 = null;
	}
	if (fn1) {
		try {
			fn1(
				memory = memory1, cats = rawCats1, my_cats = my_cats1, this_player_id = players['p1'], ttick = 't' + tick
			);
			all_commands[players['p1']] = yd.commands;
		} catch (e) {
			var line = getRuntimeErrorLine(e);
			yd.errors.push(e.message + (line !== null ? ' (line ' + line + ')' : ''));
		}
	}
	
	
	
	var pl2_code = player_codes['pl2_code'] + "memory2 = memory;";
	var fn2;
	try {
		fn2 = Function(pl2_code);
	} catch (e) {
		var line = getSyntaxErrorLine(pl2_code);
		yd.errors.push(e.message + (line !== null ? ' (line ' + line + ')' : ''));
		fn2 = null;
	}
	if (fn2) {
		try {
			fn2(
				memory = memory2, cats = rawCats2, my_cats = my_cats2, this_player_id = players['p2'], ttick = 't' + tick
			);
			all_commands[players['p2']] = yd.commands;
		} catch (e) {
			var line = getRuntimeErrorLine(e);
			yd.errors.push(e.message + (line !== null ? ' (line ' + line + ')' : ''));
		}
	}
	
}

function update_state(){
	//console.log('update_state called');
	game_duration++;
	ticks['now'] = game_duration;
	tick = game_duration;
	
	render_data3 = {
		't': 0,
		'pl1': players['p1'],
		'pl2': players['p2'],
		'p1': [],
		'p2': [],
		'st': [],
		'e': [],
		's': [],
		'a': [],
		'cr': circle_radius,
		'end': end_winner
	};
	
	if (game_duration >= 0) {
		process_stuff();
	}
	
	//render_data3 stuff
	//
	//
	//
	
	render_data3.t = game_duration;
	
	update_vm_sandbox();
	
	game_file.push(render_data3);
	postMessage({
		meta: 'rendering',
		incoming: render_data3,
		chan: { log: yd.logs.length ? yd.logs : undefined, err: yd.errors.length ? yd.errors : undefined }
	});
	
	run_code();
}

async function main_loop() {
	const t1 = (+new Date());
	//console.log("tick ");
	await update_state();
	if (stop_engine == 1) return;
	setTimeout(main_loop, Math.max(0, game_tick - (+new Date()) + t1));
}

function live_code_update(){
	
}

function prefill_code(pl){
	if (boxsanded_copy[pl] == 'upload-bot'){
		player_codes[pl + '_code'] = boxsanded_copy[pl + '_uploaded_code'];
	} else if (boxsanded_copy[pl] == 'live-input'){
		live_input = pl;
	} else {
		get_bot_code(boxsanded_copy[pl], 'local', pl);
	}
}

function start_engine(){
	//console.log('starting');
	
	//console.log('played_codes');
	//console.log(player_codes);
	
	game_duration = -1;
	main_loop();
}

function get_bot_code(botname, sour = 'local', pl = 'pl1'){
	if (sour == 'local'){
		try {
			fetch("./bots/" + botname + ".js")
				.then(function(response) {
					if (!response.ok){
						console.error('failed to load bot code');
						return;
					}
	    			return response.text().then(function(text) {
						let b_code = text;
						//console.log(b_code);
						player_codes[pl + '_code'] = b_code;
						
	   				});
	  		    });
		} catch (e){
			console.error(e);
		}
	}
	
}



function countdown(num){
	//wtf
	num--;
	if (num == -1){
		start_engine();
		return;
	}
    setTimeout(function(){
		let tempnum = num;
		postMessage({
			meta: 'countdown',
			val: num
		});
		countdown(num);
    }, 1000);
}







player_codes = {
	pl1_code: '',
	pl2_code: ''
};


var boxsanded_copy = {};
var game_tick = 0;
var live_input = '';



onmessage = function(message){
	
	let msg = message.data;
	
	//console.log('received msg:');
	//console.log(msg);
	
	if (msg.meta == 'initiate'){
		boxsanded_copy = msg.boxsanded;
		game_tick = msg.tick_rate;
		players['p1'] = boxsanded_copy['pl1'];
		players['p2'] = boxsanded_copy['pl2'];
		colors['player1'] = boxsanded_copy['pl1_color'];
		colors['player2'] = boxsanded_copy['pl2_color'];
		
		prefill_code('pl1');
		prefill_code('pl2');
		initiate_world();
		
		countdown(msg.meta2);
		stop_engine = 0;
		
	} else if (msg.meta == 'live-input'){
		player_codes[live_input + '_code'] = msg.code_string;
		live_code_update();
	} else if (msg.meta == 'stop'){
		stop_engine = 1;
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	//postMessage({
	//	pl1: 'val1',
	//	pl2: 'val2',
	//	meta: msg.meta
	//});
	
	
	
	
	
	
	
	
	
	
}