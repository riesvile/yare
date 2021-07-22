var bot_code = true;
if(memory['time'] == undefined)
    memory['time'] = 0;
memory['time'] += 1;

function dist_sq(coor1, coor2){
    let a = coor1[0] - coor2[0];
    let b = coor1[1] - coor2[1];
    return a*a + b*b;
}

function norm_sq(coor){
    return coor[0]**2 + coor[1]**2;
}

function dist(coor1, coor2){
    return Math.sqrt(dist_sq(coor1, coor2));
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
    return [+coor[0].toFixed(places), +coor[1].toFixed(places)];
}

var min_beam = 200;
var min_beam_sq = min_beam**2;

var my_star = star_zxq;
var e_star = star_a1c;

if(dist_sq(star_a1c.position, base.position) < dist_sq(star_zxq.position, base.position)){
    my_star = star_a1c;
    e_star = star_zxq;
}

function minimizing_unit(l, objective, selector){
    var min = null;
    var min_val = null;

    for(var i = 0; i< l.length ;i++){
        var unit = spirits[l[i]];
        if(selector != null && !selector(unit))
            continue;

        var val = objective(unit);
        if(min_val == null || val < min_val){
            min_val =  val;
            min = unit;
        }
    }
    return min;
}


function closest_unit(ref, l, min_dist,  pred){
    var pick = null;
    var pickd = null;

    for(var i = 0; i< l.length ;i++){
        var unit = spirits[l[i]];
        var ud = dist_sq(unit.position, ref.position);

        if(min_dist > 0 &&  ud >= min_dist**2)
            continue;

        if(pred != null && !pred(unit))
            continue;

        if(pickd==null ||ud < pickd){
            pickd = ud;
            pick = unit;
        }
    }
    return pick;
}

function beam_from_to(from, to, shorten=1){
    return mult(shorten/dist(from.position, to.position), add(mult(-1, from.position), to.position));
}

var base_to_star_beam = beam_from_to(base, my_star, 0.99*min_beam);
var h_pos = add(base.position, mult(2.6, base_to_star_beam));
var h0_pos = add(my_star.position, beam_from_to(my_star, base, 0.99*min_beam));

var l = [-100, 0];
var r = [100, 0];
var u = [0, -100];
var d = [0, 100];
var n = [0, 0];
var dr = [100,100];
var dl = [100,-100];
var ur = [-100,100];
var ul = [-100,-100];

var default_plan = 'b';
var teams = [1000];
var attack_groups = []

if(bot_code){
    teams = [5, 2, 5,
        5, 10, 16, 20, 1000];
    attack_groups = [3, 5, 7];
    if(memory['plans'] == undefined)
        memory['plans'] = ['B', 'B', 'B',
            default_plan, 'B', default_plan, 'B', default_plan];

    // do not waste time on start
    if(memory['time'] > 40){
        memory['plans'][1] ='b';
    }
} else {
    // H - harvest star
    // d - defend star, only visible
    // D - defend star, seek all in unit.sight
    // b - defend base, only visible, harvest
    // B - defend base, seek all in base.sight, harvest
    // g - gather point
    // A - attack enemy star
    // a - attack enemy base
    // S - attack supply chain :-)
    // n - no seek, attack on sight, move by moves
    // s - seek attack enemy, move by moves

    // PLAYER CONSOLE
    teams = [5, 2, 15, 10, 1000]
    memory['plans'] = ['H', 'a', 'H', 'H', 'a'];
}
var moves = [];


var a_min_life = 0.2;
var h_min_life = 0.0;
var gather_prop = 0.5;
var gather_pos = linc(base.position, enemy_base.position, gather_prop);
// enemy
var supply_pos = linc(enemy_base.position, e_star.position, 0.4);
// our - for defense
//var supply_pos = linc(base.position, my_star.position, 0.2);

// END OF CONSOLE


if(bot_code){
    supply_pos = linc(enemy_base.position, e_star.position, 0.4);
}

var plans = memory['plans'];
var my_alive = [];
var team_counts = teams.map(function(e){return 0;});
var no_teams = [];

// alive/counts/teamcounts
for (var i = 0; i < my_spirits.length;i++){

    //console.log(my_spirits[i]);
    var s = my_spirits[i];

    var t = memory[s.id+'team'];
    var no_team = t == undefined || t == null;

    var alive = s.hp == 1;

    if(no_team && alive){
        no_teams.push(s.id);
    }
    if (!no_team && !alive){
        memory[s.id+'team'] = null;
    }
    //console.log(t + " " +s.id + " " + alive + " " + no_team);

    if(!no_team && alive){
        if(team_counts[t] >= teams[t] || t >= team_counts.length){
            memory[s.id+'team'] = null;
            no_teams.push(s.id);
        }else
            team_counts[t] = team_counts[t] + 1;
    }
    if(alive){
        my_alive.push(s.id);
    }
}

// assign unasigned spirits to teams
for (var i = 0; i < no_teams.length;i++){
    for(var t=0 ; t<team_counts.length;t++){
        if(team_counts[t] < teams[t] && (attack_groups.indexOf(t) == -1 || plans[t] == default_plan)){
            //console.log(t + " " + no_teams[i])
            memory[no_teams[i]+'team'] = t;
            team_counts[t] += 1;
            break;
        }
    }
}
// attack plan
if(bot_code){
    for(var i = 0 ; i < attack_groups.length; i++){
        var idx = attack_groups[i];

        var long_ago = memory['plan_start'+idx] != undefined
                        && memory['time'] - memory['plan_start'+idx] > 200;
        if(memory['time'] > 50 && (team_counts[idx] == teams[idx] || team_counts[idx] > 15) &&
            (plans[idx] == default_plan || long_ago)){
            var rnd = Math.random();
            if(rnd < 0.66 && !(long_ago))
                plans[idx] =  'S';
            else
                plans[idx] =  'a';

            memory['plan']=plans;
            memory['plan_start'+idx]=memory['time'];
        }

        if(team_counts[idx] < 2 && plans[idx] != default_plan){
            plans[idx] = default_plan;
            memory['plan']=plans;
            memory['plan_start'+idx] = undefined;
        }

        console.log("bot attack group " +idx + " count = "
            +team_counts[idx] + " goal = " +teams[idx] + " plan = " + plans[idx]);
    }
}
if(!bot_code){
    console.log(team_counts);
    console.log(plans);
}

//

var damage_plan = {};
var seek_plan = {};
var help_plan = {};

function pick_enemy (e, follow=false){
    if(e.hp != 1)
        return false;

    if(damage_plan[e.id] == null || damage_plan[e.id] == undefined)
        damage_plan[e.id] = e.energy;

    if(follow && (seek_plan[e.id] == null || seek_plan[e.id] == undefined))
        seek_plan[e.id] = e.energy;

    return damage_plan[e.id] >= 0 && (!follow || seek_plan[e.id] >= 0);// && dist(spirits[e.position], s.position) <= min_beam;
}

//plan
for (var i = 0; i < my_alive.length;i++){
    s = spirits[my_alive[i]];
    var t = memory[s.id+'team'];

    // disperse, so that they do not move in one batch
    if(bot_code && t == 0 && 3*(i+1) >= memory['time']){
        continue;
    }

    var plan = plans[t];
    var d2base = dist_sq(s.position, base.position);
    var d2star = dist_sq(s.position, my_star.position);
    var d2estar = dist_sq(s.position, e_star.position);
    var near_base = d2base < min_beam_sq;
    var near_star = d2star < min_beam_sq;
    var near_estar = d2estar < min_beam_sq;
    var base_in_trouble = base.sight.enemies.length > 0;
    // charge by default
    if(near_star || near_estar){
        s.energize(s);
    }

    if(plan == 'H' || (plan == 'B' && base.sight.enemies.length == 0)){
        // state
        if (memory[s.id] != 'charged' && memory[s.id] != 'harvestor') {
            if(d2base > d2star)
                memory[s.id] = 'harvestor';
            else
                memory[s.id] = 'charged';
        }

        if (s.energy <= h_min_life * s.energy_capacity) {
            memory[s.id] = 'harvestor';
        }

        if (s.energy == s.energy_capacity && memory[s.id] != 'charged'){
            memory[s.id] = 'charged';
        }

        // behavior
        var e = null;
        if(s.energy > h_min_life * s.energy_capacity){
            // pick unit that most needs help
            e = minimizing_unit(s.sight.friends_beamable, (u) => -help_plan[u.id], function(u){
                        if(memory[u.id] != 'fighter' || u.energy == u.energy_capacity)
                            return false;

                        if(help_plan[u.id]==undefined){
                            help_plan[u.id] = u.energy_capacity-u.energy;
                        }
                        return help_plan[u.id] > 0;
                    });
        }

        if(e != null){
            help_plan[e.id] -= s.size;
            s.energize(e);
        } else if (memory[s.id] == 'harvestor'){
            if(d2star > min_beam_sq)
                s.move(my_star.position);
            if(d2star < 0.8 * min_beam_sq)
                s.move(base.position);
        } else if (memory[s.id] == 'charged'){
            if(d2base < 0.8 * min_beam_sq)
                s.move(my_star.position);
            if(d2base > min_beam_sq)
                s.move(base.position);
            s.energize(base);
        }
    } else {
        // state transitions
        if(memory[s.id] != 'fighter' && memory[s.id] != 'recharging'){
            memory[s.id] = 'fighter';
        }
        if (s.energy == 0) {
            memory[s.id] = 'recharging';
        }
        if (s.energy == s.energy_capacity){
            memory[s.id] = 'fighter';
        }

        // behavior

        if (plan == 'D' || plan == 'd'){
            if(d2star > min_beam_sq)
                s.move(my_star.position);
            if(d2star < 0.8 * min_beam_sq)
                s.move(base.position);
        }
        if ( memory[s.id] == 'recharging' ){
            if(d2star < d2estar)
                s.move(my_star.position);
            else
                s.move(e_star.position);
        }

        if (memory[s.id] == 'fighter'){
            if(plan == 'g'){
                s.move(gather_pos);
            }

            if(plan == 'a'){
                var near_enemy = dist_sq(s.position, enemy_base.position) < min_beam_sq;
                if(!near_enemy)
                    s.move(enemy_base.position);
                else
                    s.energize(enemy_base);
            }

            if(plan == 'A'){
                if(!near_estar)
                    s.move(e_star.position);
            }

            if(plan == 'S'){
                s.move(supply_pos);
            }

            if(plan == 'b' || plan == 'B'){
                s.move(base.position);
                /*
                var min = 0;
                if(plan =='b')
                    min = min_beam;

                var e = closest_unit(s, base.sight.enemies, min, (e)=>pick_enemy(e, true));
                if(e != null){
                    s.move(e.position);
                    seek_plan[e.id] -= s.size;
                    if(dist_sq(s.position, e.position) < min_beam_sq)
                        damage_plan[e.id] -= 2*s.size;
                    s.energize(e);
                }else{
                    s.move(base.position);
                }
                */
            }

            if(plan == 'n' || plan == 's'){
                var move = moves[t];
                if(move != null && move != undefined){
                    if(move.length > 2){
                        var which = Math.floor(memory['time'] / move[0]) % (move.length - 1);
                        s.move(add(s.position, move[1+which]));
                    }else{
                        s.move(add(s.position, move));
                    }
                }
            }
        }
    }

    if(s.energy > 0){
        var seek = memory[s.id] == 'fighter' && plan != 'b' && plan != 'n';
        e = closest_unit(s, s.sight.enemies_beamable, 0, (e) => pick_enemy(e, seek));

        if(e != null){
            if(seek){
                s.move(e.position);
                seek_plan[e.id] -= s.size;
            }
            if(dist_sq(s.position, e.position) < min_beam_sq)
                damage_plan[e.id] -= 2* s.size;
            s.energize(e);
        }
    }
}


/*
console.log('T ' + memory['time'] + ' total ' +my_alive.length + " / H "+ harvestors +
' / C '+ beamers+ '-' + passers + '-'+chargers0 +' / A '+ attackers+
            ' / BE ' +base.sight.enemies.length + ' / ' + team_counts);
*/