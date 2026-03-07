var yd = {};
global.cats = {};
global.my_cats = [];
global.barricades = [];
global.pods = [];

yd.commands = {
    cat: {},
    channels: {},
};

yd.errors = [];
yd.logs = [];
yd.deprecates = {};
yd.channels = {};
yd.channels_in = {};

yd.channel_in = function(name, data) {
    if(!(name in yd.channels_in)) {
        yd.channels_in[name] = [];
    }
    yd.channels_in[name] = yd.channels_in[name].concat((Array.isArray(data) ? data : [data]));
}

function command(id) {
    if (!(id in yd.commands.cat)) {
        yd.commands.cat[id] = {};
    }
    return yd.commands.cat[id];
}

class Channel {
    #id;

    constructor(id) {
        this.#id = id;
    }

    send(msg) {
        if(!(this.#id in yd.channels)) {
            yd.channels[this.#id] = [];
        }
        yd.channels[this.#id].push(msg);
    }
}

global.channels = {
    get(id) {
        return new Channel(id);
    },
    recv(id) {
        let data = yd.channels_in[id];
        delete yd.channels_in[id];
        return data;
    }
};

function send_error(msg) {
    throw Error(msg);
    //yd.errors.push(msg);
}

const errChan = global.channels.get("err");

function soft_error(msg) {
    try {
        throw Error(msg);
    } catch(e) {
        errChan.send(e.message + "\n" + e.stack);
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

/** Cats are your mobile units 
 * @hideconstructor
*/
class Cat {
    constructor(id){
        this.id = id;
    }

    /** Moves cat to target with a speed of 20 units per tick
     * @param {number[]} target - Position to move to/towards
     */
    move(target) {
        if (!Array.isArray(target) || target.length != 2){
            soft_error('.move() argument must be an array of 2 numbers.\n > E.g. my_cats[0].move([100, 100]) or my_cats[0].move(my_cats[1].position).\n > Received: ' + target);
            return;
        }

        const tarX = Number(target[0]);
        const tarY = Number(target[1]);
        
        if(!Number.isFinite(tarX) || !Number.isFinite(tarY)){
            soft_error('.move() arguments must be finite numbers, got ['+ tarX + ", " + tarY + ']');
            return;
        }

        command(this.id).move = [tarX, tarY];
    }

    /**
     * Transfers 1 energy unit from itself into target. Max distance of the energy transfer is 200 units.
     * If target is an enemy cat, the target takes damage of 2 energy. Nearby enemies within 20 units of the target also take splash damage.
     * @param {Cat} target - target to pew
     */
    pew(target) {		
        let target_id = null;
		if (typeof target == 'object' && target !== null){
            target_id = target.id;
        } else if (typeof target == 'string'){
            target_id = target;
        }

        if(target_id == null){
            let example_id = this.player_id + "_2";
            soft_error(".pew() argument must be a cat object.\n > E.g. my_cats[0].pew(my_cats[1])\n > or my_cats[0].pew(cats['" + example_id + "'])\n > Received: " + target);
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

yd.init = function(playerID) {
    global.this_player_id = playerID;
};

yd.loadData = function(data) {
    var sd = data.cats;
    for(var id in sd) {
        if(!(id in global.cats)) {
            global.cats[id] = new Cat(id);
            if(sd[id].player_id == global.this_player_id) {
                global.my_cats.push(global.cats[id]);
                if(sd[id].player_id == "anonymous") {
                    global["s" + (global.my_cats.length)] = global.cats[id];
                }
            }
            global[id] = global.cats[id];
        }
        Object.assign(global.cats[id], sd[id]);
    }
    if (data.barricades) {
        global.barricades = data.barricades;
    }
    if (data.pods) {
        global.pods = data.pods;
    }
    global.players = data.players;
    global.tick = data.tick;
	global.ttick = 't' + data.tick;
	global.death_circle = data.death_circle;
};

yd.getOutput = function() {
    var output = {
        commands: yd.commands,
        logs: yd.logs,
        errors: yd.errors,
        channels: yd.channels
    };
    yd.commands = {
        cat: {},
    };
    yd.logs = [];
    yd.errors = [];
    yd.deprecates = {};
    yd.channels = {};
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