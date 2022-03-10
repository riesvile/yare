
var my_base = base_zxq;
var e_base = base_a2c;

//this_player_id is your user name
if (base_a2c.control == this_player_id){
	my_base = base_a2c;
	e_base = base_zxq;
}

if (client['t' + tick]['attacking'] == undefined) client['t' + tick]['attacking'] = [];

console.log(JSON.stringify(client['t' + tick]));
for (let i = 0; i < client['t' + tick]['attacking'].length; i++){
    let attacker = spirits[client['t' + tick]['attacking'][i]];
    attacker.set_mark('attack');
    attacker.move(base_zxq.position);
}

for (let spirit of my_spirits){
    if (spirit.mark == 'attack'){
        spirit.move(e_base.position);
        spirit.energize(e_base);
    }
}

console.log(tick)