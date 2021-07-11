var yd = {};
global.spirits = {};
global.my_spirits = [];
global.stars = {};
global.bases = {};
global.outposts = {};

yd.commands = {};

yd.errors = [];
yd.logs = [];
yd.gqueue = [];
yd.deprecates = {};

global.console = {
    log: function(...args) {
        yd.logs.push(args);
    }
};

function command(id) {
    if (!(id in yd.commands)) {
        yd.commands[id] = {};
    }
    return yd.commands[id];
}

function send_error(msg) {
    throw Error(msg);
    //yd.errors.push(msg);
}

function soft_error(msg) {
    try {
        throw Error(msg);
    } catch(e) {
        yd.errors.push(e);
    };
    //yd.errors.push(msg);
}

function deprecate(id, msg) {
    // if not already warned, soft warn once
    if (!(id in yd.deprecates)) {
        yd.deprecates[id] = true;
        soft_error(msg);
    }
}


class Graphics {
	set style(s) {
		yd.gqueue.push(['st', s]);
	}
	set linewidth(w) {
		yd.gqueue.push(['lw', w]);
	}

	circle(pos, r) {
		yd.gqueue.push(['c', pos[0], pos[1], r]);
	}
	line(start, end) {
		yd.gqueue.push(['l', start[0], start[1], end[0], end[1]]);
	}
    /**
     * @deprecated Use .rect() instead
     */
	square(tl, br) {
        deprecate('graphics.square', 'Use .rect() instead');
		yd.gqueue.push(['s', tl[0], tl[1], br[0], br[1]]);
	}
    rect(tl, size) {
		yd.gqueue.push(['s', tl[0], tl[1], size[0], size[1]]);
	}
}

/** Spirits are your mobile units 
 * @hideconstructor
*/
class Spirit {
    constructor(id){
        this.id = id;
    }

    /** Moves spirit to target with a speed of 20 units per tick
     * @param {number[]} target - Position to move to/towards
     */
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
     * @param {(Spirit|Base|Outpose)} target - target to energize
     */
    energize(target) {
        let target_id = null;
        if(typeof target == 'object'){
            target_id = target.id;
        }else if(typeof target == 'string'){
            target_id = target;
        }

        let bad = Array.isArray(target) || target_id == null || target == null;
        if(bad){
            let example_id = this.player_id + "_2";
            soft_error(".energize() argument must be a game object (e.g. spirit) with id, or its id (string).\n > E.g. my_spirits[0].energize(my_spirits[0])\n > or my_spirits[0].energize(spirits['" + example_id + "'])\n > or my_spirits[0].energize('" + example_id + "')\n > Received: " + target);
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
            command(this.id).merge = target.id
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
        if (this.shape != 'squares'){
            soft_error("Only squaress can use jump(). See Documentation for available methods.");
            return;
        }
        
        if (Array.isArray(target) == false){
            soft_error('.jump() argument must be an array. E.g. my_spirits[0].jump([100, 100]). Received: ' + target);
            return;
        } else if (target.length != 2){
            soft_error('.jump() argument must be an array of length 2. E.g. my_spirits[0].jump([100, 100]). Received: ' + target);
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
    constructor(id){
        this.id = id;
    }
}

class Outpost {
    constructor(id){
        this.id = id
    }
}

class Base {
    constructor(id){
        this.id = id;
    }
}

yd.init = function(playerID) {
    global.this_player_id = playerID;
    global.graphics = new Graphics();
};

yd.loadData = function(data) {
    var sd = data.spirits;
    for(var id in sd) {
        if(!(id in global.spirits)) {
            global.spirits[id] = new Spirit(id);
            if(sd[id].player_id == global.this_player_id) {
                global.my_spirits.push(global.spirits[id]);
            }
        }
        Object.assign(global.spirits[id], sd[id]);
    }
    var sd = data.stars;
    for(var id in sd) {
        if(!(id in global.stars)) {
            global.stars[id] = new Star(id);
            global[id] = global.stars[id];
        }
        Object.assign(global.stars[id], sd[id]);
    }
    var od = data.outposts;
    for(var id in od) {
        if(!(id in global.outposts)) {
            global.outposts[id] = new Outpost(id);
            global[id] = global.outposts[id];
            global.outpost = global.outposts[id];
        }
        Object.assign(global.outposts[id], od[id]);
    }
    var bd = data.bases;
    for(var id in bd) {
        if(!(id in global.bases)) {
            global.bases[id] = new Base(id);
            if(bd[id].player_id == global.this_player_id) {
                global.base = global.bases[id];
            } else {
                global.enemy_base = global.bases[id];
            }
        }
        Object.assign(global.bases[id], bd[id]);
    }
    global.players = data.players;
    global.tick = data.tick;
};

yd.getOutput = function() {
    var output = {
        commands: yd.commands,
        logs: yd.logs,
        errors: yd.errors,
        gqueue: yd.gqueue
    };
    yd.commands = {};
    yd.logs = [];
    yd.errors = [];
    yd.gqueue = [];
    yd.deprecates = {};
    return output;
};

  
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

/** Convert a base64 encoded input string into a Uint8Array
 * 
 * @param {string} input - base64 encoded input
 */
function atob(input) {
    var output = [];
    var chr1, chr2, chr3 = '';
    var enc1, enc2, enc3, enc4 = '';
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    while (i < input.length) {
        enc1 = chars.indexOf(input.charAt(i++));
        enc2 = chars.indexOf(input.charAt(i++));
        enc3 = chars.indexOf(input.charAt(i++));
        enc4 = chars.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output.push(chr1);

        if (enc3 != 64) {
            output.push(chr2);
        }
        if (enc4 != 64) {
            output.push(chr3);
        }
    }

    return new Uint8Array(output);
}

global.atob = atob;

return yd;