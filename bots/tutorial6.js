var this_player_id = players['p2'];		
var my_spirits = [];

for (q = 0; q < (Object.keys(spirits)).length; q++){
    if(spirits[Object.keys(spirits)[q]].hp > 0 && this_player_id == spirits[Object.keys(spirits)[q]].player_id){
        my_spirits.push(spirits[Object.keys(spirits)[q]]);
    }
}

global['base'] = Object.values(bases)[1];
global['enemy_base'] = Object.values(bases)[0];
global['star_zxq'] = stars['star_zxq'];
global['star_a1c'] = stars['star_a1c'];
global['star_p89'] = stars['star_p89'];

my_spirits[0].move(star_a1c.position);
my_spirits[0].energize(my_spirits[0]);
if (my_spirits[0].energy == my_spirits[0].energy_capacity) {
    my_spirits[0].move(base.position)
    my_spirits[0].energize(base);
}

if (!memory['attacker']){
    memory['attacker'] = my_spirits[1];
}

memory['attacker'].move(enemy_base.position);