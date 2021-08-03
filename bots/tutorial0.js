var this_player_id = players['p2'];		

global['base'] = Object.values(bases)[1];
global['enemy_base'] = Object.values(bases)[0];
global['star_zxq'] = stars['star_zxq'];
global['star_a1c'] = stars['star_a1c'];
global['star_p89'] = stars['star_p89'];
global['outpost'] = outposts['outpost_mdo'];

my_spirits[0].move(star_a1c.position);
my_spirits[0].energize(my_spirits[0]);
if (my_spirits[0].energy == my_spirits[0].energy_capacity) {
    my_spirits[0].move(base.position)
    my_spirits[0].energize(base);
}

if (spirits['anonymous_2'].energy == 0){
    my_spirits[1].move(enemy_base.position);
}