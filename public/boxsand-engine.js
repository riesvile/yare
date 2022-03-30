

//globals

var client = {};

const min_beam = 200;
const h_square = min_beam / Math.sqrt(2);
var started = 0;
var game_duration = -10;
var base_speed = 20;
var ticks = {};
var tick = 0;
var energy_value = 1;
var top_s = 0;
var top_q = 0;
var rawSpirits1 = {};
var rawSpirits2 = {};
var my_spirits1 = [];
var my_spirits2 = [];
var stars = [];
var bases = [];
var outposts = [];
var pylons = [];
var fragments = [];
var living_spirits = [];
var spirit_lookup = {};
var star_lookup = {};
var base_lookup = {};
var outpost_lookup = {};
var pylon_lookup = {};
var structure_lookup = {};

var all_commands = {};

var birth_queue = [];
var death_queue = [];
var star_zxq;
var star_a2c;
var star_p89;
var star_nua;
var outpost_mdo;
var pylon_u3p;

var players = {};
var shapes = {};
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
    merge: new Map(),
    spirit: {},
    channels: {},
};
yd.errors = [];
yd.logs = [];
yd.deprecates = {};
yd.channels = {};
yd.channels_in = {};
function command(id) {
    if (!(id in yd.commands.spirit)) {
        yd.commands.spirit[id] = {};
    }
    return yd.commands.spirit[id];
}

function spirit_cost(p_num, alives){
	let shape = shapes["player" + p_num];
	for (let b = 0; b < bases.length; b++){
		if (bases[b].control != players["p" + p_num]) continue;
		if (shape == 'circles'){
			if (alives <= 50) bases[b].current_spirit_cost = 25;
			if (alives > 50) bases[b].current_spirit_cost = 50;
			if (alives > 100) bases[b].current_spirit_cost = 90;
			if (alives > 200) bases[b].current_spirit_cost = 150;
			if (alives > 500) bases[b].current_spirit_cost = 1000;
		} else if (shape == 'squares'){
			if (alives <= 10) bases[b].current_spirit_cost = 360;
			if (alives > 10) bases[b].current_spirit_cost = 500;
			if (alives > 16) bases[b].current_spirit_cost = 700;
			if (alives > 400) bases[b].current_spirit_cost = 1100;
		} else if (shape == 'triangles'){
			if (alives <= 30) bases[b].current_spirit_cost = 90;
			if (alives > 30) bases[b].current_spirit_cost = 160;
			if (alives > 120) bases[b].current_spirit_cost = 300;
			if (alives > 300) bases[b].current_spirit_cost = 1000;
		}
	}
		
}

function get_def_size(pshape){
	if (pshape == 'circles') return 1;
	if (pshape == 'squares') return 10;
	if (pshape == 'triangles') return 3;
}


var spirit_p1_cost = 100;
var spirit_p2_cost = 100;
var p1_defend = 0;
var p2_defend = 0;

var temp_flag = 0;
var end_winner = 0;

var game_duration = -50;
var game_activity = 1;



function soft_error(msg) {
    try {
		console.log(msg);
        //throw Error(msg);
    } catch(e) {
        //errChan.send(e.message + "\n" + e.stack);
    };
    //yd.errors.push(msg);
}


function jump_danger_zone(loc){
	if (Math.abs(stars[0].position[0] - loc[0]) < 100 && Math.abs(stars[0].position[1] - loc[1]) < 100
 	 || Math.abs(stars[1].position[0] - loc[0]) < 100 && Math.abs(stars[1].position[1] - loc[1]) < 100
	 || Math.abs(stars[2].position[0] - loc[0]) < 100 && Math.abs(stars[2].position[1] - loc[1]) < 100
	 || Math.abs(stars[3].position[0] - loc[0]) < 100 && Math.abs(stars[3].position[1] - loc[1]) < 100
	 || Math.abs(bases[0].position[0] - loc[0]) < 50 && Math.abs(bases[0].position[1] - loc[1]) < 50
	 || Math.abs(bases[1].position[0] - loc[0]) < 50 && Math.abs(bases[1].position[1] - loc[1]) < 50
	 || Math.abs(bases[2].position[0] - loc[0]) < 50 && Math.abs(bases[2].position[1] - loc[1]) < 50
	 || Math.abs(bases[3].position[0] - loc[0]) < 50 && Math.abs(bases[3].position[1] - loc[1]) < 50
	 || Math.abs(outposts[0].position[0] - loc[0]) < 50 && Math.abs(outposts[0].position[1] - loc[1]) < 50
	 || Math.abs(pylons[0].position[0] - loc[0]) < 50 && Math.abs(pylons[0].position[1] - loc[1]) < 50){
		return true;
	} else {
		return false;
	}
}

function shuffle_array(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


class Spirit {
	constructor(id, position, size, energy, player, color, shape){
		this.shape = shape;
		this.id = id
		this.position = position;
		this.size = size;
		this.energy = energy;
		this.last_energized = '';
		this.color = color;
		this.mark = '';
		this.locked = false;
		this.range = min_beam;
	
		this.sight = {
			friends: [],
			enemies: [],
			structures: [],
			fragments: []
		}
		this.merged = [];
		this.qcollisions = [];
	
		//const properties
		this.hp = 1;
		this.move_speed = 1;
		this.energy_capacity = size * 10;
		this.player_id = player;
	
		living_spirits.push(this);
		birth_queue.push(this);
	}

    move(target) {
        if (!Array.isArray(target) || target.length != 2){
            soft_error('.move() argument must be an array of 2 numbers.\n > E.g. my_spirits[0].move([100, 100]) or my_spirits[0].move(my_spirits[1].position).\n > Received: ' + target);
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

    /**
     * Transfers (1 × spirit's size) energy unit from itself into target. Max distance of the energy transfer is 200 units.
     * If target is an enemy spirit or a base, the target takes damage (loses energy) equivalent to (2 × attacking spirit's size)
     * If target is the same spirit as origin, the spirit will attempt harvesting energy from a star.
     * @param {(Spirit|Base|Outpost)} target - target to energize
     */
    energize(target) {		
        let target_id = null;
		if (Array.isArray(target) && target.length == 2){
			target_id = target;
		} else if (typeof target == 'object'){
            target_id = target.id;
        } else if (typeof target == 'string'){
            target_id = target;
        } 
		
		
		//console.log(typeof target);

        let bad = target_id == null || target == null;
        if(bad){
            let example_id = this.player_id + "_2";
            soft_error(".energize() argument must be a game object (e.g. spirit) with id or a position (e.g. [250, 350]).\n > E.g. my_spirits[0].energize(my_spirits[0])\n > or my_spirits[0].energize(spirits['" + example_id + "'])\n > or my_spirits[0].energize('" + example_id + "')\n > Received: " + target);
            return;
        }
        
        command(this.id).energize = target_id;
    }
    
    merge(target){
        if (target.id == this.id){
            soft_error("You can't merge spirit into itself");
            return;
        } else if (this.shape != 'circles'){
            soft_error("Only circles can use merge(). See Documentation for available methods.");
            return;
        }
        
        try {
            if (Array.isArray(target) == true){
                soft_error(".merge() argument must be a friendly spirit object, not an array. E.g. my_spirits[0].merge(my_spirits[1]). Received: " + target);
                return;
            } else if (typeof target !== 'object' || target === null){
                soft_error(".merge() argument must be a friendly spirit object. E.g. my_spirits[0].merge(my_spirits[1]). Received: " + target);
                return;
            }
        
            if (Math.abs(target.position[0] - this.position[0]) < 12 && Math.abs(target.position[1] - this.position[1]) < 12 && this.player_id == target.player_id){
            
            } else {
                return;
            }
        } catch (error){
            yd.errors.push(error);
            return;
        }
        
        if (target.hp != 0 && this.hp != 0){
            yd.commands.merge.set(this.id, target.id);
        }
        
    }
    
    divide(){
        
        if (this.shape != 'circles'){
            soft_error("Only circles can use divide(). See Documentation for available methods.");
            return;
        }
        
        if (this.hp != 0 && this.merged.length > 0){
            command(this.id).divide = true;
        }
        
    }
    
    jump(target){
        if (Array.isArray(target) == false){
            soft_error('.jump() argument must be an array. E.g. my_spirits[0].jump([100, 100]). Received: ' + target);
            return;
        } else if (target.length != 2){
            soft_error('.jump() argument must be an array of length 2. E.g. my_spirits[0].jump([100, 100]). Received: ' + target);
            return;
        } else if (isNaN(target[0]) || isNaN(target[1])){
            soft_error('.jump() argument array contains NaN. Received: ' + target);
            return;
        }

        if (this.hp != 0){
            command(this.id).jump = [Number(target[0]), Number(target[1])];
        }
    }

    explode(){
        if (this.shape != 'triangles'){
            soft_error("Only triangles can use explode(). See Documentation for available methods.");
            return;
        }
        
        if (this.hp != 0){
            command(this.id).explode = true;
        }
    }

    lock(){
        if (this.shape != 'squares'){
            soft_error("Only squares can use lock(). See Documentation for available methods.");
            return;
        }
        if (this.hp != 0){
            command(this.id).lock = true;
        }
    }

    unlock(){
        if (this.shape != 'squares'){
            soft_error("Only squares can use unlock(). See Documentation for available methods.");
            return;
        }
        if (this.hp != 0){
            command(this.id).unlock = true;
        }
    }
    
    //kill() { }???????
    /*
    kill(suid){
        delete spirit_lookup[suid];
        var index = living_spirits.findIndex(x => x.id == suid);
        living_spirits.splice(index);
    }
    */
    
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

class Star {
	constructor(id, position, energy, size, active_at){
		this.id = id
		this.position = position;
		this.size = size;
		this.structure_type = 'star';
		this.energy = energy;
		this.energy_capacity = this.size * 10;
		this.last_energized = '';
		this.active_in = 0;
		this.active_at = active_at;
		//this.energy = energy;
		this.collision_radius = 100;
	
		stars.push(this);
	}
}

class Outpost {
	constructor(id, position){
		this.id = id
		this.position = position;
		this.size = 20;
		this.control = '';
		this.range = 400;
		this.structure_type = 'outpost';
		this.energy = 0;
		this.energy_capacity = 1000;
		this.last_energized = '';
		//this.energy = energy;
		this.collision_radius = 50;
		
		this.sight = {
			enemies: []
		}
	
		outposts.push(this);
	}
}

class Pylon {
	constructor(id, position){
		this.id = id
		this.position = position;
		this.size = 20;
		this.control = '';
		this.range = 400;
		this.structure_type = 'pylon';
		this.energy = 0;
		this.energy_capacity = 1000;
		//this.energy = energy;
		this.collision_radius = 50;
		
		this.sight = {
			friends: []
		}
	
		pylons.push(this);
	}
}

class Base {
	constructor(id, position, player, color, shape){
		this.shape = shape;
		this.id = id
		this.position = position;
		this.size = 40;
		this.structure_type = 'base';
		this.energy = 0;
		this.sight = {
			friends: [],
			enemies: [],
			structures: []
		}
		this.collision_radius = 50;
		
		//this.hp = 8;
		if (this.shape == 'circles'){
			this.energy_capacity = 400;
		} else if (this.shape == 'squares'){
			this.energy_capacity = 1000;
		} else if (this.shape == 'triangles'){
			this.energy_capacity = 600;
		} else {
			this.energy_capacity = 100;
		}
		
		this.player_id = player;
		this.control = player;
		this.color = color;
		//this.energy = energy;
		
		this.current_spirit_cost = 100;
	
		bases.push(this);
	}
}


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
	const beamable_sq = min_beam**2;
	const visible_sq = (2*min_beam)**2;
	const low_range_sq = (250)**2;
	const high_range_sq = (600)**2;
	const pylon_range_sq = (400)**2;
	const living_length = living_spirits.length;

	for (let h = 0; h < living_length; h++){
	  living_spirits[h].sight = {
			friends_beamable: [],
			enemies_beamable: [],
			friends: [],
			enemies: [],
			structures: [],
		    fragments: []
	  }
	  living_spirits[h].qcollisions = [];
	}
	for (let m = 0; m < bases.length; m++){
	  	bases[m].sight = {
			friends_beamable: [],
			enemies_beamable: [],
			friends: [],
			enemies: [],
			structures: []
	    }
	}
	for (let o = 0; o < outposts.length; o++){
	  	outposts[o].sight = {
			enemies: []
	    }
	}
	for (let p = 0; p < pylons.length; p++){
	  	pylons[p].sight = {
			friends: []
	    }
	}

	function work(i, j){
		//console.log('work ' + living_spirits[i].id + " " + living_spirits[j].id)
		let pi = living_spirits[i].player_id;
		let pj = living_spirits[j].player_id;
		if (pi == pj){
			// friend
			living_spirits[i].sight.friends.push(living_spirits[j].id);
			living_spirits[j].sight.friends.push(living_spirits[i].id);
		}
		else{
			// enemy
			living_spirits[i].sight.enemies.push(living_spirits[j].id);
			living_spirits[j].sight.enemies.push(living_spirits[i].id);
		}
	}

	function work_beamable(i, j){
		let pi = living_spirits[i].player_id;
		let pj = living_spirits[j].player_id;
		if (pi == pj){
			// friend
			living_spirits[i].sight.friends_beamable.push(living_spirits[j].id);
			living_spirits[j].sight.friends_beamable.push(living_spirits[i].id);
		}
		else{
			// enemy
			living_spirits[i].sight.enemies_beamable.push(living_spirits[j].id);
			living_spirits[j].sight.enemies_beamable.push(living_spirits[i].id);
		}
	}

	let hist = {};
	// per spirit processing
	for (let i = 0; i < living_length; i++){
		let spirit = living_spirits[i];
		// ugh
		if (spirit.hp == 0) continue;
		let pos = spirit.position;

		// 1. init histogram

		let xbin = Math.floor(pos[0] / h_square);
		let ybin = Math.floor(pos[1] / h_square);
		if (hist[[xbin, ybin]] == undefined){
			// first element is the x,y, since js has no tuples
			// and converts the key to string
			hist[[xbin, ybin]] = [[xbin, ybin, -1]];
		}
		hist[[xbin, ybin]].push(i);

		// 2. compute sight for structures
		// (no need to use the histogram, there is only a few structs, so this is quick
		// O(1) for each spirit
		
		//stars
		for (let k = 0; k < stars.length; k++){
			if (is_in_sight(spirit, stars[k])){
				spirit.sight.structures.push(stars[k].id);
			}
		}
		//bases
		for (let b = 0; b < bases.length; b++){
			let dsq = dist_sq(pos, bases[b].position);
			// base sees spirit
			if(dsq <= visible_sq){
				let friend = bases[b].control == spirit.player_id;

				if (friend){
					bases[b].sight.friends.push(spirit.id);
				} else {
					bases[b].sight.enemies.push(spirit.id);
				}

				if (dsq <= beamable_sq){
					if (friend){
						bases[b].sight.friends_beamable.push(spirit.id);
					}else{
						bases[b].sight.enemies_beamable.push(spirit.id);
					}
					// spirit sees base
					spirit.sight.structures.push(bases[b].id);
				}
			}
		}
		//outposts
		for (let o = 0; o < outposts.length; o++){
			let outpost = outposts[o];
			let use_range = visible_sq;
			let dsq = dist_sq(spirit.position, outpost.position);
			
			if (outpost.energy >= 500) use_range = high_range_sq;
			
			if (dsq <= use_range){
				let friend = outpost.control == spirit.player_id;
				if (friend){
					//outposts[o].sight.friends.push(spirit.id);
				}else{
					outposts[o].sight.enemies.push(spirit.id);
				}

				if (dsq <= beamable_sq){
					spirit.sight.structures.push(outpost.id);
				}
			}
		}
		
		//pylons
		for (let p = 0; p < pylons.length; p++){
			let pylon = pylons[p];
			let use_range = pylon_range_sq;
			let dsq = dist_sq(spirit.position, pylon.position);
			//let dsqq = is_in_sight(spirit, pylon)
			
			//if (outpost.energy >= 500) use_range = high_range_sq;
			
			if (dsq <= use_range){
				let friend = pylon.control == spirit.player_id;
				if (friend){
					pylons[p].sight.friends.push(spirit.id);
				}else{
					//pylons[p].sight.enemies.push(spirit.id);
				}

				if (dsq <= beamable_sq){
					spirit.sight.structures.push(pylon.id);
				}
			}
		}
		
		//fragments
		for (let f = 0; f < fragments.length; f++){
			if (is_in_sight(spirit, fragments[f])){
				spirit.sight.fragments.push(fragments[f]);
			}
		}
		
		//fragments
		//for (let f = 0; f < fragments.length; f++){
		//	let fragment = fragments[f];
		//	let use_range = visible_sq;
		//	let dsq = dist_sq(spirit.position, fragment.position)
		//	
		//	if (dsq <= use_range){
		//		let friend = pylon.control == spirit.player_id;
		//		if (friend){
		//			pylons[p].sight.friends.push(spirit.id);
		//		}else{
		//			//pylons[p].sight.enemies.push(spirit.id);
		//		}
        //
		//		if (dsq <= beamable_sq){
		//			spirit.sight.fragments.push(fragment);
		//		}
		//	}
		//	
		//}
		
	}

	// histogram, handle sights for all
	// of the potentially O(N^2)-many spirit <> spirit pairs

	Object.values(hist).forEach(function(bin){
		// this bin, all are visible && beamable
		// because of h_square size
		for(let i = 1; i <bin.length;i++){
			for(j = i+1; j <bin.length;j++){
				work(bin[i],bin[j]);
				work_beamable(bin[i],bin[j]);
			}
		}

		// iterate neighboring bins
		// a rectangle 7x4, the bin is at position [3, 0] (top row, center)
		for(s = 3; s < 7*4-1 ; s++){
			// lower left corner, too far away
			if(s==21) continue;

			let dy = Math.floor(s / 7);
			let dx = (s % 7) - 3;
			if(dx==0 && dy==0) continue;

			// neighbor bin
			let nb = hist[[bin[0][0]+dx, bin[0][1]+dy]];
			if(nb == undefined)
				continue;

			//console.log("NB BIN: "+(bin[0][0]+dx)+ " " +(bin[0][1]+dy));
			// O(N^2) part
			for(let i = 1; i <bin.length;i++){
				for(let j = 1; j <nb.length;j++){
					let dsq = dist_sq(
						living_spirits[bin[i]].position,
						living_spirits[nb[j]].position,
					);
					if(dsq <= visible_sq)
						work(bin[i],nb[j]);
					if(dsq <= beamable_sq)
						work_beamable(bin[i],nb[j]);
				}
			}
		}
	});

	//base set defend flag
	for (let m = 0; m < bases.length; m++){
		// convert bool to number
		let trouble = 0 + (bases[m].sight.enemies.length > 0);

		if (bases[m].control == players['p1']){
			p1_defend = trouble;
		} else {
			p2_defend = trouble;
		}
	}
}

function get_sight(){
	var living_length = living_spirits.length;
	for (h = 0; h < living_length; h++){
	  living_spirits[h].sight = {
			friends_beamable: [],
			friends: [],
			enemies: [],
			enemies_beamable: [],
			structures: [],
		    fragments: []
	  }
	  living_spirits[h].qcollisions = [];
		
	}

	//spirits root (it's longer than you think)
	for (i = 0; i < living_length; i++){
		for (j = i+1; j < living_length; j++){
			if (living_spirits[j].hp == 0) continue;
			//console.log(i + ', ' + j);
			if (is_in_sight(living_spirits[i], living_spirits[j])){
				//maybe add distance stuff later
				//distance_approx = distance_nonrooted(living_spirits[i].position, living_spirits[j].position);
				//console.log('distance between ' + living_spirits[i].id + ' and ' + living_spirits[j].id + 'is ' + distance_approx);
				if (living_spirits[j].player_id == players['p1']){
					if (living_spirits[i].player_id == players['p1']){
						//is friend
						living_spirits[i].sight.friends.push(living_spirits[j].id);
						living_spirits[j].sight.friends.push(living_spirits[i].id);
						//collision-sight
						if (is_in_sight(living_spirits[i], living_spirits[j], 50)){
							living_spirits[i].qcollisions.push(living_spirits[j].id);
							living_spirits[j].qcollisions.push(living_spirits[i].id);
						}
					} else if (living_spirits[i].player_id == players['p2']){
						//is enemy
						living_spirits[i].sight.enemies.push(living_spirits[j].id);
						living_spirits[j].sight.enemies.push(living_spirits[i].id);
					}
					
				} else if (living_spirits[j].player_id == players['p2']){
					if (living_spirits[i].player_id == players['p2']){
						//is friend
						living_spirits[i].sight.friends.push(living_spirits[j].id);
						living_spirits[j].sight.friends.push(living_spirits[i].id);
					} else if (living_spirits[i].player_id == players['p1']){
						//is enemy
						living_spirits[i].sight.enemies.push(living_spirits[j].id);
						living_spirits[j].sight.enemies.push(living_spirits[i].id);
					}
				}
			}
		}
	
		//stars
		for (k = 0; k < stars.length; k++){
			if (is_in_sight(living_spirits[i], stars[k])){
				living_spirits[i].sight.structures.push(stars[k].id);
			}
		}
		
		//bases
		for (l = 0; l < bases.length; l++){
			if (is_in_sight(living_spirits[i], bases[l])){
				living_spirits[i].sight.structures.push(bases[l].id);
			}
		}
		
		//outposts
		for (o = 0; o < outposts.length; o++){
			if (is_in_sight(living_spirits[i], outposts[o])){
				living_spirits[i].sight.structures.push(outposts[o].id);
			}
		}
		
		//pylons
		for (p = 0; p < pylons.length; p++){
			if (is_in_sight(living_spirits[i], pylons[p])){
				living_spirits[i].sight.structures.push(pylons[p].id);
			}
		}
		
		//fragments
		for (f = 0; f < fragments.length; f++){
			if (is_in_sight(living_spirits[i], fragments[f])){
				living_spirits[i].sight.fragments.push(fragments[f]);
			}
		}
		
	}
	
	//bases sight
	for (m = 0; m < bases.length; m++){
	  bases[m].sight = {
			friends: [],
			enemies: [],
			structures: []
	  }
		  
		for (n = 0; n < living_length; n++){
			if (living_spirits[n].hp == 0) continue;
			
			if (is_in_sight(living_spirits[n], bases[m], 400)){
				//console.log(bases[m].id + ' controlled by ' + bases[m].control);
				if (bases[m].control == players['p1']){
					if (living_spirits[n].player_id == players['p1']){
						bases[m].sight.friends.push(living_spirits[n].id);
					} else {
						bases[m].sight.enemies.push(living_spirits[n].id);
					}
				} else if (bases[m].control == players['p2']){
					if (living_spirits[n].player_id == players['p1']){
						bases[m].sight.enemies.push(living_spirits[n].id);
					} else {
						bases[m].sight.friends.push(living_spirits[n].id);
					}
				} else {
					bases[m].sight.enemies.push(living_spirits[n].id);
				}
			}
		}
		
	}

}

function player_owns_spirit(id, name){
	if(!id.startsWith(name))
		return false;
	// if the id does start with name, it is still not ok
	// consider players "pepa" and "pepa_the_best"
	let spirit_num = Number(id.slice(name.length + 1));
	return id == (name + "_" + spirit_num);
}

function move_objects(){
	const prev_position = {};
	for (let player in all_commands){
		let queue = all_commands[player].spirit;

		Object.keys(queue).forEach((id) => {
			if(id == 'merge') return;
			if(!id || !player_owns_spirit(id, player)){
				//TODO: COMMENTING THIS OUT DOES NOT SOLVE THE ISSUE, MORON!
				// Figure out why this is firing...
				//console.log("WTF: null or cheating: player " + player + " calls "  + id + ".move()");
				return;
			}

			const spirit = spirit_lookup[id];
			if (spirit.hp == 0)	return;
			if (spirit.locked) return;
			const tpos = queue[id].move;
			if(!tpos) return;
			const pos = spirit.position;
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
				spirit.position = add(pos, incr).map((c) => round_to(c, 5));

				let potential_structure_collisions = spirit.sight.structures;
				for (let k = 0; k < potential_structure_collisions.length; k++){
					
					let object_name = potential_structure_collisions[k];
					// name prefix - safe (is structure)
					let min_distance = structure_lookup[object_name].collision_radius;
					let object_position = structure_lookup[object_name].position;
					let spirit_before = pos;

					if (fast_dist_lt(spirit.position, object_position, min_distance)){
						let inter_coor = intersection(spirit_before[0], spirit_before[1], base_speed,
														object_position[0], object_position[1], min_distance);
						if (inter_coor == false) continue;
						
						let quick_dist1 = dist_sq(inter_coor[0], tpos);
						let quick_dist2 = dist_sq(inter_coor[1], tpos);
						
						let pick_first = quick_dist1 < quick_dist2 || Math.abs(quick_dist1 - quick_dist2) <= 5;
						spirit.position = inter_coor[pick_first ? 0 : 1];
					}
				}
			}
		});
	}

	return prev_position;
}

function energize_objects(){
	let energize_apply = [];
	let energize_apply_star = [];
	let energize_apply_fragment = [];
	let energize_apply_outpost = [];
	let energize_apply_base = [];
	let energize_apply_pylon = [];
	let low_range_sq = (200)**2;
	
	for(let spirit of Object.values(spirit_lookup)){
		spirit.last_energized = '';
	}
	
	//explosions
	for(let player in all_commands) {
		let commands = all_commands[player].spirit;
		for(let spirit in commands) {
			if(spirit == 'merge') continue;
			if(!player_owns_spirit(spirit, player)) continue;
			if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
			if(spirit_lookup[spirit].shape != "triangles") continue;
			if(!commands[spirit].explode) continue;
			//console.log(spirit + ' is about to explode');
			let explodee = spirit_lookup[spirit];
			for (let j = 0; j < explodee.sight.enemies_beamable.length; j++){
				let potential_target = spirit_lookup[explodee.sight.enemies_beamable[j]];
				//console.log('boom check = ' + fast_dist_lt(explodee.position, potential_target.position, 100));
				if (fast_dist_leq(explodee.position, potential_target.position, 160)){
					energize_apply.push([potential_target, -10]);
				}
			}
			energize_apply.push([explodee, -100]);
			render_data3.s.push(['ex', spirit]);
		}
	}
	
	for (let i = 0; i < outposts.length; i++){
		let outpost = outposts[i];
		let enemies = outpost.sight.enemies;
		if (enemies.length == 0 || outpost.control == '')
			continue;

		let beam_strength = outpost.energy >= 500 ? 4 : 1;
		let enemy = spirit_lookup[enemies[Math.floor(enemies.length * Math.random())]];
		
		energize_apply.push([enemy, -2 * beam_strength]);
		outpost.energy -= beam_strength;
		render_data3.e.push([outpost.id, enemy.id, 2 * beam_strength]);
	}
	
	for (let p = 0; p < pylons.length; p++){
		let pylon = pylons[p];
		let friends = pylons[p].sight.friends;
		let friends_damaged = [];
		let friends_final = [];
		if (friends.length == 0 || pylon.control == '')
			continue;
		
		for (let f = 0; f < friends.length; f++){
			let friend_real = spirit_lookup[friends[f]];
			if (friend_real.energy < (friend_real.energy_capacity)){
				if (dist_sq(friend_real.position, pylon.position) > low_range_sq) friends_final.push(friend_real);
			}
			
		}
		
		let beam_strength = 1;
		let targets = pylon.energy;
		if (friends_final.length < pylon.energy) targets = friends_final.length;
		
		//TODO: order friends array by energy from lowest to highest
		
		for (let t = 0; t < targets; t++){
			energize_apply.push([friends_final[t], 1 * beam_strength]);
			pylon.energy -= beam_strength;
			render_data3.e.push([pylon.id, friends_final[t].id, 1 * beam_strength]);
		}
		 
	}

	let last_beam = {};
	for (let player in all_commands){
		let queue = all_commands[player].spirit;

		Object.keys(queue).forEach((from_id) => {
			let temp_target_id = [];
			
			if (from_id == 'merge') return;
			
			//if ()
			
			const to_id = queue[from_id].energize;

			if(!to_id){
				//console.log('thisss happened');
				return;
			} 
			if(!from_id || !player_owns_spirit(from_id, player) || !to_id){
				//TODO: COMMENTING THIS OUT DOES NOT SOLVE THE ISSUE, MORON!
				// Figure out why this is firing...
				//console.log("WTF: null or cheating " + player + " calls "  + from_id + ".energize(" + to_id+")");
				return;
			}

			if(last_beam[from_id] != undefined)
				return;
			last_beam[from_id] = to_id;
			
			const from_obj = spirit_lookup[from_id] || structure_lookup[from_id];
			var to_obj;
			
			if (Array.isArray(to_id) && to_id.length == 2){
				to_obj = to_id;
			} else {
				to_obj = spirit_lookup[to_id] || structure_lookup[to_id];
			}
			
			
			//console.log('from_obj.id = ' + from_obj.id);
			//console.log('to_obj.id = ' + to_obj.id);

			if(!from_obj || !to_obj || from_obj.hp == 0 || to_obj.hp == 0){
				console.log('tthis happened');
				return;
			}
			
			//console.log('from_obj.id = ' + from_obj.id);
			//console.log('to_obj.id = ' + to_obj.id);

			// harvest star or fragment (prioritize fragment)
			if (from_id == to_id){
				
				let is_harving = 0;
				
				for (let f = 0; f < from_obj.sight.fragments.length; f++){
					let fragment = from_obj.sight.fragments[f];
					let fragment_close = fast_dist_leq(from_obj.position, fragment.position, from_obj.range);
					if (!fragment_close) continue;
					
					from_obj.last_energized = to_id;
					energize_apply_fragment.push([from_obj, energy_value * from_obj.size, fragment]);
					is_harving = 1;
				}
				
				if (is_harving == 1) return;
				
				for (let j = 0; j < from_obj.sight.structures.length; j++){
					//console.log('ilook here');
					let struc_name = from_obj.sight.structures[j];

					// name prefix - safe (is structure)
					if (!struc_name.startsWith('star'))
						continue;

					let star = structure_lookup[struc_name];
					let star_close = fast_dist_leq(from_obj.position, star.position, from_obj.range);
					if (!star_close) continue;

					from_obj.last_energized = to_id;
					energize_apply_star.push([from_obj, energy_value * from_obj.size, star]);
					// only harvest one star at once
					break;
				}
				// no need to check other cases (outpost, friend, ...)
				return;
			}
			
			//console.log('to_obj is ' + to_obj);
			
			let to_check = to_obj.position;
			if (Array.isArray(to_obj)) to_check = to_obj;

			let target_close = fast_dist_leq(from_obj.position, to_check, from_obj.range);
			if(! target_close){
				//console.log('target not close enough');
				return;
			}
				

			let beam_strength = Math.min(energy_value * from_obj.size, from_obj.energy);
			if(beam_strength <= 0)
				return;

			from_obj.last_energized = to_id;

			let friendly_beam = from_obj.player_id == to_obj.player_id;
			let is_star = (to_obj.structure_type != undefined && to_obj.structure_type == 'star');
			let is_fragment = Array.isArray(to_id);
			
			
			//fragment first
			if (is_fragment){
				energize_apply.push([from_obj, -beam_strength]);
				energize_apply.push([to_obj, beam_strength]);
				render_data3.e.push([from_id, to_id, beam_strength]);
			}
			// name prefix - safe (is outpost)
			else if (to_obj.id.startsWith('outpost') && outpost_lookup[to_id]){
				energize_apply.push([from_obj, -beam_strength]);
				energize_apply_outpost.push([from_obj, beam_strength, to_obj]);
				render_data3.e.push([from_id, to_id, beam_strength]);
			} 
			else if (to_obj.id.startsWith('base') && base_lookup[to_id]){
				//console.log('energizing base---------------------------');
				energize_apply.push([from_obj, -beam_strength]);
				energize_apply_base.push([from_obj, beam_strength, to_obj]);
				render_data3.e.push([from_id, to_id, beam_strength]);
			} 
			// name prefix - safe (is pylon)
			else if (to_obj.id.startsWith('pylon') && pylon_lookup[to_id]){
				energize_apply.push([from_obj, -beam_strength]);
				energize_apply_pylon.push([from_obj, beam_strength, to_obj]);
				render_data3.e.push([from_id, to_id, beam_strength]);
			}
			else if (!friendly_beam){
				if (is_star){
					energize_apply.push([from_obj, -beam_strength]);
					energize_apply.push([to_obj, beam_strength]);
					render_data3.e.push([from_id, to_id, beam_strength]);
				} else {
					energize_apply.push([from_obj, -beam_strength]);
					energize_apply.push([to_obj, -2 * beam_strength]);
					render_data3.e.push([from_id, to_id, 2 * beam_strength]);
				}
			}
			else {
				//else: target is friend
				energize_apply.push([from_obj, -beam_strength]);
				energize_apply.push([to_obj, beam_strength]);
				render_data3.e.push([from_id, to_id, beam_strength]);

			}
		});
	}

	//
	// apply 
	//	

	let applied_to = {};
	let check = [];

	// apply energize call
	for (let i = energize_apply.length - 1; i >= 0; i--){
		let target = energize_apply[i][0];
		let is_fragment = (Array.isArray(target) && target.length == 2);
		let amount = energize_apply[i][1];
		
		if (is_fragment){
			console.log('energizing fragmentTTTTTT!!!!!!!!!!');
			let new_frag = 1;
			let frag_target = {
				'position': target,
				'energy': 0
			};
			for (let f = 0; f < fragments.length; f++){
				if (fast_dist_simp(target, fragments[f].position, 10)){
					frag_target = fragments[f];
					new_frag = 0;
					break;
				}
			}
			
			frag_target.energy += amount;
			
			if (new_frag) fragments.push(frag_target);
			
		} else {
			target.energy += amount;

			if(!applied_to[target.id]){
				applied_to[target.id] = true;
				check.push(target);
			}
		}
	}
	
	shuffle_array(energize_apply_star);

	// apply harvest
	// harvest fragment
	for (let i = energize_apply_fragment.length - 1; i >= 0; i--){
		let spirit = energize_apply_fragment[i][0];
		let amount = energize_apply_fragment[i][1];
		let fragment = energize_apply_fragment[i][2];

		let can_harvest = Math.min(amount, fragment.energy);
		if (can_harvest <= 0) continue;

		// 
		
		let to_full_capacity = Math.max(0, spirit.energy_capacity - spirit.energy);
		let actually_harvested = Math.min(can_harvest, to_full_capacity);

		spirit.energy += actually_harvested;
		fragment.energy -= actually_harvested;
		render_data3.e.push([fragment.position, spirit.id, actually_harvested]);

		if(!applied_to[spirit.id]){
			applied_to[spirit.id] = true;
			check.push(spirit);
		}
	}
	
	// harvest star
	for (let i = energize_apply_star.length - 1; i >= 0; i--){
		let spirit = energize_apply_star[i][0];
		let amount = energize_apply_star[i][1];
		let star = energize_apply_star[i][2];

		let can_harvest = Math.min(amount, star.energy);
		if (can_harvest <= 0) continue;

		let to_full_capacity = Math.max(0, spirit.energy_capacity - spirit.energy);
		let actually_harvested = Math.min(can_harvest, to_full_capacity);

		spirit.energy += actually_harvested;
		star.energy -= actually_harvested;
		render_data3.e.push([star.id, spirit.id, actually_harvested]);

		if(!applied_to[spirit.id]){
			applied_to[spirit.id] = true;
			check.push(spirit);
		}
	}

	// check death & energy cap
	for (let i = 0; i < check.length; i++){
		let target = check[i];
		target.energy = Math.min(target.energy, target.energy_capacity);

		if (target.energy < 0){
			
			
			death_queue.push(target);

			if (target.structure_type == 'base' && game_finished != 1){
				
				//console.log('find out whether player controls any other structures - otherwise end the game')
				
				//game_finished = 1;
				//console.log(target.player_id + ' lost');
                //
				//let p2won = target.player_id == players['p1'] ? 1 : 0;
				//end_game(1 - p2won, p2won);
			}
		}
	}
	
	
	// energize_apply_outpost.push([from_obj, strength, to_obj]);
	let incoming_p1 = {};
	let incoming_p2 = {};

	for (let i = energize_apply_outpost.length - 1; i >= 0; i--){
		let spirit = energize_apply_outpost[i][0];
		let amount = energize_apply_outpost[i][1];
		let outpost = energize_apply_outpost[i][2];

		if (spirit.player_id == players['p1']){
			if (incoming_p1[outpost.id] == undefined) incoming_p1[outpost.id] = 0;
			incoming_p1[outpost.id] += amount;
		} else {
			if (incoming_p2[outpost.id] == undefined) incoming_p2[outpost.id] = 0;
			incoming_p2[outpost.id] += amount;
		}
	}
	
	for (let i = 0; i < outposts.length; i++){
		let outpost = outposts[i];

		let from_p1 = incoming_p1[outpost.id] || 0;
		let from_p2 = incoming_p2[outpost.id] || 0;

		if (outpost.control == ''){
			// the case where from_p1 == from_p2 will have 0 energy and control '' set below
			outpost.control = (from_p1 > from_p2) ? players['p1'] : players['p2'];
			outpost.energy = Math.abs(from_p1 - from_p2);
		} else {
			let from_me = (outpost.control == players['p1']) ? from_p1 : from_p2;
			let from_enemy = (outpost.control == players['p1']) ? from_p2 : from_p1;

			outpost.energy += from_me;
			outpost.energy -= 2 * from_enemy;
		}

		if (outpost.energy <= 0)
			outpost.control = '';
		outpost.energy = Math.max(0, Math.min(outpost.energy, outpost.energy_capacity));
		outpost.range = outpost.energy <= 500 ? 400 : 600;
	}
	
	//-- same for pylon
	
	for (let i = energize_apply_pylon.length - 1; i >= 0; i--){
		let spirit = energize_apply_pylon[i][0];
		let amount = energize_apply_pylon[i][1];
		let pylon = energize_apply_pylon[i][2];
    
		if (spirit.player_id == players['p1']){
			if(incoming_p1[pylon.id] == undefined)
				incoming_p1[pylon.id] = 0;
			incoming_p1[pylon.id] += amount;
			//console.log('incoming amount 1 = ' + incoming_p1[pylon.id]);
		} else {
			if(incoming_p2[pylon.id] == undefined)
				incoming_p2[pylon.id] = 0;
			incoming_p2[pylon.id] += amount;
			//console.log('incoming amount 2 = ' + incoming_p2[pylon.id]);
		}
	}
	
	for (let i = 0; i < pylons.length; i++){
		let pylon = pylons[i];
    
		let from_p1_pylon = incoming_p1[pylon.id] || 0;
		let from_p2_pylon = incoming_p2[pylon.id] || 0;
    
		if(pylon.control == ''){
			// the case where from_p1 == from_p2 will have 0 energy and control '' set below
			pylon.control = (from_p1_pylon > from_p2_pylon) ? players['p1'] : players['p2'];
			pylon.energy = Math.abs(from_p1_pylon - from_p2_pylon);
		} else{
			let from_me_pylon = (pylon.control == players['p1']) ? from_p1_pylon : from_p2_pylon;
			let from_enemy_pylon = (pylon.control == players['p1']) ? from_p2_pylon : from_p1_pylon;
    
			pylon.energy += from_me_pylon;
			pylon.energy -= 2 * from_enemy_pylon;
		}
    
		if(pylon.energy <= 0)
			pylon.control = '';
		pylon.energy = Math.max(0, Math.min(pylon.energy, pylon.energy_capacity));
		//pylon.range = pylon.energy <= 500 ? 400 : 600;
	}
	
	
	// similar for bases
	
	for (let i = energize_apply_base.length - 1; i >= 0; i--){
		let spirit = energize_apply_base[i][0];
		let amount = energize_apply_base[i][1];
		let base = energize_apply_base[i][2];

		if (spirit.player_id == players['p1']){
			if (incoming_p1[base.id] == undefined) incoming_p1[base.id] = 0;
			incoming_p1[base.id] += amount;
		} else {
			if (incoming_p2[base.id] == undefined) incoming_p2[base.id] = 0;
			incoming_p2[base.id] += amount;
		}
	}
	
	for (let i = 0; i < bases.length; i++){
		let base = bases[i];

		let from_p1 = incoming_p1[base.id] || 0;
		let from_p2 = incoming_p2[base.id] || 0;
		
		if (from_p1 == 0 && from_p2 == 0) continue;

		if (base.control == ''){
			// the case where from_p1 == from_p2 will have 0 energy and control '' set below
			if (from_p1 - from_p2 != 0){
				base.control = (from_p1 > from_p2) ? players['p1'] : players['p2'];
				let owner_shape = shapes['player1'];
				if (players['p2'] == base.control) owner_shape = shapes['player2'];
				base.shape = owner_shape;
				
				if (owner_shape == 'circles') base.energy_capacity = 400;
				if (owner_shape == 'squares') base.energy_capacity = 1000;
				if (owner_shape == 'triangles') base.energy_capacity = 600;
				
			}
			base.energy = Math.abs(from_p1 - from_p2);
		} else {
			let from_me = (base.control == players['p1']) ? from_p1 : from_p2;
			let from_enemy = (base.control == players['p1']) ? from_p2 : from_p1;

			base.energy += from_me;
			base.energy -= 2 * from_enemy;
		}

		if (base.energy < 0){
			base.control = '';
			base.shape = 'neutral';
			console.log('find out whether player controls any other structures - otherwise end the game');
			check_structure_control();
		}
		base.energy = Math.max(0, Math.min(base.energy, base.energy_capacity));
		
	}
}

function check_structure_control(){
	
	let p1_ok = 0;
	let p2_ok = 0;
	
	//bases
	for (let b = 0; b < bases.length; b++){
		if (bases[b].control == players['p1']) p1_ok = 1;
		if (bases[b].control == players['p2']) p2_ok = 1;
	}
	if (p1_ok && p2_ok) return;
	
	//outpost
	for (let ou = 0; ou < outposts.length; ou++){
		if (outposts[ou].control == players['p1']) p1_ok = 1;
		if (outposts[ou].control == players['p2']) p2_ok = 1;
	}
	if (p1_ok && p2_ok) return;
	
	//pylon
	for (let py = 0; py < pylons.length; py++){
		if (pylons[py].control == players['p1']) p1_ok = 1;
		if (pylons[py].control == players['p2']) p2_ok = 1;
	}
	
	if (!p1_ok) end_game(0, 1);
	if (!p2_ok) end_game(1, 0);
}


function process_stuff(){
	
		//
		// objects birth -
		//
	
		for (i = 0; i < bases.length; i++){
			let bs = bases[i];
			if (bs.energy < bs.current_spirit_cost) continue;
			if (bs.sight.enemies.length > 0) continue;
			let x_axis = 1;
			let y_axis = 1;
			if (bs.position[0] < 0) x_axis = -1;
			if (bs.position[1] < 0) y_axis = -1;
			
			if (bs.control == players['p1']){
				top_s++;
				globalThis[players['p1'] + top_s] = new Spirit(players['p1'] + '_' + top_s, [bs.position[0] + (x_axis * 40), bs.position[1] + (y_axis * 40)], get_def_size(shapes['player1']), get_def_size(shapes['player1']) * 10, players['p1'], colors['player1'], shapes['player1']);
				bs.energy -= bs.current_spirit_cost;
			}
			
			if (bs.control == players['p2']){
				top_q++;
				globalThis[players['p2'] + top_q] = new Spirit(players['p2'] + '_' + top_q, [bs.position[0] + (x_axis * 40), bs.position[1] + (y_axis * 40)], get_def_size(shapes['player2']), get_def_size(shapes['player2']) * 10, players['p2'], colors['player2'], shapes['player2']);
				bs.energy -= bs.current_spirit_cost;
			}
		}
		
		//for (i = 0; i < bases.length; i++){
		//	let bs = bases[i];
		//	if (bs.energy < spirit_cost[bs.control])
		//
		//}
		
		
		
			
		
		birthlings = birth_queue.length;
		for (i = birthlings - 1; i >= 0; i--){
			spt = birth_queue[i];	
			//render_data2.birth.push(birth_queue[i]);
			spirit_lookup[spt.id] = spt;
			birth_queue.splice(i, 1);
		}
	
	
		//
		// shout and mark
		//
		
		for(let player in all_commands) {
			let commands = all_commands[player].spirit;
			for(let spirit in commands) {
				if(spirit == 'merge') continue;
				if(!player_owns_spirit(spirit, player)) continue;
				if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
				if(commands[spirit].shout) render_data3.s.push(['sh', spirit, commands[spirit].shout]);
				if(commands[spirit].mark) spirit_lookup[spirit].mark = commands[spirit].mark;
			}
		}
		//
		// objects energize
		//
		
		energize_objects();

		//
		// objects move
		//

		let prev_position = move_objects();
		
		//
		//objects sight
		//
		
		/*
		var start = process.hrtime();
		get_sight();
		var diff = process.hrtime(start);
		var took1 = (diff[0] * 1000000000 + diff[1]) / 1000000;
		console.log('get_sight took = ' + took1);
		*/



		//console.log('TIME: get_sight_fast = ' + elapsed_ms_from(sight_t0));

		//console.log('spirit_lookup[s1].sight');
		//console.log(spirit_lookup['s1'].sight);
		//console.log(spirit_lookup['sp1'].sight);
		
		
		// stars energy update
		
		for (let i = 0; i < stars.length; i++){
			stars[i].active_in = stars[i].active_at - game_duration;
			if(game_duration >= stars[i].active_at) {
				if (stars[i].id == 'star_nua'){
					stars[i].energy += Math.round(3 + (stars[i].energy * 0.03));
				} else {
					stars[i].energy += Math.round(2 + (stars[i].energy * 0.02));
					stars[i].active_in = 0;
				}
			}
			if (stars[i].energy >= stars[i].energy_capacity) stars[i].energy = stars[i].energy_capacity;

			render_data3.st[i] = stars[i].energy;
		}
		
		//fragments update
		for (let f = fragments.length - 1; f >= 0; f--){
			if (fragments[f].energy <= 0) fragments.splice(f, 1);
		}
		
	
		//objects death & vm sandbox objects update
		for (let i = death_queue.length - 1; i >= 0; i--){
			//console.log(death_queue[i].id + ' died');
			
//			if (!death_queue[i].structure_type == 'outpost') 
				death_queue[i].hp = 0;
			//console.log(death_queue[i]);
			//render_data2.death.push(death_queue[i].id);
			
			//delete spirit_lookup[suid];
			//var index = living_spirits.findIndex(x => x.id == death_queue[i].id);
			//living_spirits.splice(index);
			
		
			death_queue.splice(i, 1);
		}
		
		
		
		
		//
		// objects merge
		//
		let merged = {};
		for(let player in all_commands) {
			let commands = all_commands[player];
			for(let [sid, tid] of commands.merge) {
				if(!player_owns_spirit(sid, player)) continue;
				if(!player_owns_spirit(tid, player)) continue;
				if(!(sid in spirit_lookup)) continue;
				if(!(tid in spirit_lookup)) continue;

				if(merged[sid]) continue;

				let s = spirit_lookup[sid];
				let t = spirit_lookup[tid];

				if(s.hp == 0 || t.hp == 0) continue;
				if(s.shape != 'circles' || t.shape != 'circles') continue;
				if(t.merged.length + s.merged.length + 2 > 100) continue;

				if(dist_sq(t.position, s.position) > 10**2) continue;
				if(s.hp == 0 || t.hp == 0) continue;
				t.merged.push(s.id);
				t.merged = t.merged.concat(s.merged);
				s.merged = [];
				t.size += s.size;
				t.energy += s.energy;
				t.energy_capacity += s.energy_capacity;
				s.hp = 0;
				s.size = 0;
				s.energy = 0;
				s.position = t.position;
				merged[tid] = true;

				render_data3.s.push(['m', s.id, t.id]);
			}
		}
		
		
		//
		// objects divide
		//
		
		for(let player in all_commands) {
			let commands = all_commands[player].spirit;
			for(let spirit in commands) {
				if(spirit == 'merge') continue;
				if(!player_owns_spirit(spirit, player)) continue;
				if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
				if(!commands[spirit].divide) continue;
				
				// we are dividing the orig spirit
				// into orig.size spirits of size 1
				
				let orig = spirit_lookup[spirit];
				let capacity_per_one = orig.energy_capacity / orig.size;
				// right now, this holds:
				// assert(capacity_per_one == 10);
				
				let energy_per_one = Math.floor(orig.energy / orig.size);
				let energy_leftover = orig.energy % orig.size;

				for(let did of orig.merged) {
					var d = spirit_lookup[did];
					d.hp = 1;
					d.size = 1;
					d.energy_capacity = capacity_per_one;
					d.energy = energy_per_one;
					if(energy_leftover > 0){
						d.energy += 1;
						energy_leftover -= 1;
					}
					// implied by orig.energy <= orig.energy_capacity
					// assert(d.energy <= d.energy_capacity);

					d.position = [orig.position[0], orig.position[1]];
					let ang = Math.random() * Math.PI * 2;
					let dist = Math.random() * 10;
					d.position[0] += Math.sin(ang) * dist;
					d.position[1] += Math.cos(ang) * dist;
					for (let object_name in structure_lookup){
						let s = structure_lookup[object_name];
						let v = sub(d.position, s.position);
						let len_sq = norm_sq(v);
						if(len_sq < s.collision_radius**2) {
							v = mult(s.collision_radius / Math.sqrt(len_sq), v);
							d.position = add(s.position, v);
						}
					}
				}
				
				orig.merged = [];
				orig.size = 1;
				// otw, the energy per_one could be increased by one
				// assert(energy_leftover == 0);
				orig.energy = energy_per_one;
				orig.energy_capacity = capacity_per_one;

				render_data3.s.push(['d', orig.id]);
			}
		}
		
		//
		// objects jump
		//
		for(let player in all_commands) {
			let commands = all_commands[player].spirit;
			for(let spirit in commands) {
				if(spirit == 'merge') continue;
				if(!player_owns_spirit(spirit, player)) continue;
				if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
				if(!commands[spirit].jump) continue;
				if(spirit_lookup[spirit].locked) continue;
				if(spirit_lookup[spirit].energy == 0) continue;

				let s = spirit_lookup[spirit];

				let tpos = commands[spirit].jump;
				let incr = sub(tpos, s.position);

				let dist = Math.sqrt(norm_sq(incr));
				let cost = dist/5 + (s.size^2) / 5;
				if(cost > s.energy) {
					let remainder = s.energy - (s.size^2)/5;
					incr = mult((remainder * 5) / dist, incr);
					tpos = add(s.position, incr);
					dist = remainder * 5;
					cost = s.energy;
				}

				for (var object_name in structure_lookup){
					//console.log(' ------------------------------- structure potential collisions');
					//console.log(potential_structure_collisions[k]);
					
					// name prefix - safe (is structure)
					let min_distance = structure_lookup[object_name].collision_radius;
					let object_position = structure_lookup[object_name].position;

					if (fast_dist_lt(tpos, object_position, min_distance)){
						let inter_coor = intersection(s.position[0], s.position[1], dist,
														object_position[0], object_position[1], min_distance);
						if (inter_coor == false) continue;
						
						let quick_dist1 = dist_sq(inter_coor[0], tpos);
						let quick_dist2 = dist_sq(inter_coor[1], tpos);
						
						let pick_first = quick_dist1 < quick_dist2 || Math.abs(quick_dist1 - quick_dist2) <= 5;
						tpos = inter_coor[pick_first ? 0 : 1];
					}
				}
				s.position = tpos;

				s.energy -= Math.ceil(cost);

				render_data3.s.push(['j', spirit]);
			}
		}

		// update locked spirit ranges
		for(let sid in spirit_lookup) {
			let spirit = spirit_lookup[sid];
			if(!spirit.locked) continue;
			spirit.range += 25;
			if(spirit.range > 300) {
				spirit.range = 300;
			}
		}

		// spirit lock
		for(let player in all_commands) {
			let commands = all_commands[player].spirit;
			for(let spirit in commands) {
				if(spirit == 'merge') continue;
				if(!player_owns_spirit(spirit, player)) continue;
				if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
				if(!commands[spirit].lock) continue;

				let s = spirit_lookup[spirit];
				
				if(s.shape != 'squares') continue;

				if(s.locked) continue;

				s.locked = true;
			}
		}

		// spirit unlock
		for(let player in all_commands) {
			let commands = all_commands[player].spirit;
			for(let spirit in commands) {
				if(spirit == 'merge') continue;
				if(!player_owns_spirit(spirit, player)) continue;
				if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
				if(!commands[spirit].unlock) continue;

				let s = spirit_lookup[spirit];
				
				if(s.shape != 'squares') continue;

				if(!s.locked) continue;

				s.locked = false;
				s.range = min_beam;
			}
		}

		let sight_t0 = performance.now();
		get_sight_fast();
}

function update_vm_sandbox(){
	if (temp_flag == 0){
		var p1_living = 0;
		var p2_living = 0;
		my_spirits1 = [];
		my_spirits2 = [];
		for (i = 0; i < living_spirits.length; i++){
			spt = living_spirits[i];
			let cutoff_parts = spt.id.split('_');
			let cutoff_id = cutoff_parts.pop();
			//console.log(spt);	
			if (spt.player_id == players['p2']){
				
				//render3 part
				render_data3.p2.push([cutoff_id, [Math.round(spt.position[0] * 100) / 100, Math.round(spt.position[1] * 100) / 100], spt.size, spt.energy, spt.hp]);

				if (spt.hp == 1){
					p2_living++;
					if (spt.shape == 'circles' && spt.size > 1) p2_living += spt.size - 1;
				}
				my_spirits2.push(spt);
				rawSpirits2[spt.id] = spt;
				var tempJSON = JSON.stringify(spt);
				rawSpirits1[spt.id] = JSON.parse(tempJSON);

			} else if (spt.player_id == players['p1']) {
				
				//render3 part
				render_data3.p1.push([cutoff_id, [Math.round(spt.position[0] * 100) / 100, Math.round(spt.position[1] * 100) / 100], spt.size, spt.energy, spt.hp]);

				if (spt.hp == 1){
					p1_living++;
					if (spt.shape == 'circles' && spt.size > 1) p1_living += spt.size - 1;
				}
				my_spirits1.push(spt);
				rawSpirits1[spt.id] = spt;
				var tempJSON = JSON.stringify(spt);
				rawSpirits2[spt.id] = JSON.parse(tempJSON);
				
				
			}
			//var tempJSON = JSON.stringify(spt);
			//rawSpirits[spt.id] = JSON.parse(tempJSON);
			//rawSpirits[spt.id] = spt;
			//spirits[spt.id] = spt;

		}
		//console.log('objects processing');
		temp_flag = 0;
		//console.log('my_spirits1.length = ' + my_spirits1.length);
		//console.log('living_spirits.length = ' + living_spirits.length + " p1 = " + p1_living + " p2 = " + p2_living );
			spirit_cost(1, p1_living);
			spirit_cost(2, p2_living);
	} 
	//console.log(bases[2].id + " control = " + bases[2].control)
}




function initiate_world(){
	
	let bas = boxsanded_copy['bases'];
	let sta = boxsanded_copy['stars'];
	let outs = boxsanded_copy['outposts'];
	let pyl = boxsanded_copy['pylons'];
	let frg = boxsanded_copy['fragments'];
	let p1sp = boxsanded_copy['p1_units'];
	let p2sp = boxsanded_copy['p2_units'];
	

	for (let b = 0; b < bas.length; b++){
		globalThis[bas[b][0]] = new Base(bas[b][0], bas[b][1], bas[b][3], bas[b][4], bas[b][5]);
		base_lookup[bas[b][0]] = globalThis[bas[b][0]];
		structure_lookup[bas[b][0]] = globalThis[bas[b][0]];
	}
	
	for (let st = 0; st < sta.length; st++){
		globalThis[sta[st][0]] = new Star(sta[st][0], sta[st][1], sta[st][2], sta[st][3], 0);
		star_lookup[sta[st][0]] = globalThis[sta[st][0]];
		structure_lookup[sta[st][0]] = globalThis[sta[st][0]];
	}
	
	for (let ou = 0; ou < outs.length; ou++){
		globalThis[outs[ou][0]] = new Outpost(outs[ou][0], outs[ou][1]);
		outpost_lookup[outs[ou][0]] = globalThis[outs[ou][0]];
		structure_lookup[outs[ou][0]] = globalThis[outs[ou][0]];
	}
	
	for (let py = 0; py < pyl.length; py++){
		globalThis[pyl[py][0]] = new Pylon(pyl[py][0], pyl[py][1]);
		pylon_lookup[pyl[py][0]] = globalThis[pyl[py][0]];
		structure_lookup[pyl[py][0]] = globalThis[pyl[py][0]];
	}
	
	for (let sp = 0; sp < p1sp.length; sp++){
		let sp_num = sp + 1;
		globalThis[players['p1'] + "_" + sp_num] = new Spirit(players['p1'] + "_" + sp_num, p1sp[sp][1], p1sp[sp][2], p1sp[sp][3], players['p1'], colors['player1'], shapes['player1']);
		//spirits.push(globalThis[players['p1'] + "_" + sp_num])
		top_s = sp_num;
	}
	
	for (let sp = 0; sp < p2sp.length; sp++){
		let sp_num = sp + 1;
		globalThis[players['p2'] + "_" + sp_num] = new Spirit(players['p2'] + "_" + sp_num, p2sp[sp][1], p2sp[sp][2], p2sp[sp][3], players['p2'], colors['player2'], shapes['player2']);
		//spirits.push(globalThis[players['p1'] + "_" + sp_num])
		top_q = sp_num;
	}
	
}



function run_code(){
	//user_code in game.js
	yd.commands = {
	    merge: new Map(),
	    spirit: {},
	    channels: {},
	};
	all_commands = {};
	
	try {
		Function(player_codes['pl1_code'] + "memory1 = memory;")(
			memory = memory1, spirits = rawSpirits1, my_spirits = my_spirits1, this_player_id = players['p1'], ttick = 't' + tick
		);
		all_commands[players['p1']] = yd.commands;
	} catch (e){
		console.log(e);
	}
	
	
	
	try {
		Function(player_codes['pl2_code'] + "memory2 = memory;")(
			memory = memory2, spirits = rawSpirits2, my_spirits = my_spirits2, this_player_id = players['p2'], ttick = 't' + tick
		);
		all_commands[players['p2']] = yd.commands;
	} catch (e){
		console.log(e);
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
		'b1': [],
		'b2': [],
		'b3': [],
		'st': [],
		'ou': [],
		'py': [],
		'ef': [],
		'e': [],
		's': [],
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
	render_data3.b1 = [bases[0].energy, bases[0].current_spirit_cost, bases[0].sight.enemies.length, bases[0].control];
	render_data3.b2 = [bases[1].energy, bases[1].current_spirit_cost, bases[1].sight.enemies.length, bases[1].control];
	render_data3.b3 = [bases[2].energy, bases[2].current_spirit_cost, bases[2].sight.enemies.length, bases[2].control];
	render_data3.b4 = [bases[3].energy, bases[3].current_spirit_cost, bases[3].sight.enemies.length, bases[3].control];
	render_data3.ou = [outposts[0].energy, outposts[0].control];
	render_data3.py = [pylons[0].energy, pylons[0].control];
	
	for (let f = 0; f < fragments.length; f++){
		render_data3.ef.push([fragments[f].position, fragments[f].energy]);
	}
	
	update_vm_sandbox();
	
	game_file.push(render_data3);
	postMessage({
		meta: 'rendering',
		incoming: render_data3
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
	console.log('starting');
	
	console.log('played_codes');
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
						console.log('failed to load bot code');
						return;
					}
	    			return response.text().then(function(text) {
						let b_code = text;
						//console.log(b_code);
						player_codes[pl + '_code'] = b_code;
						
	   				});
	  		    });
		} catch (e){
			console.log(e);
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
	
	if (msg.meta == 'initiate'){
		boxsanded_copy = msg.boxsanded;
		game_tick = msg.tick_rate;
		players['p1'] = boxsanded_copy['pl1'];
		players['p2'] = boxsanded_copy['pl2'];
		shapes['player1'] = boxsanded_copy['pl1_sh'];
		shapes['player2'] = boxsanded_copy['pl2_sh'];
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