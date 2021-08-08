function dist_sq(coor1, coor2){
    let a = coor1[0] - coor2[0];
    let b = coor1[1] - coor2[1];
    return a*a + b*b;
}

var my_star = star_zxq;
var e_star = star_a1c;

if(dist_sq(star_a1c.position, base.position) < dist_sq(star_zxq.position, base.position)){
    my_star = star_a1c;
    e_star = star_zxq;
}

var mine = my_spirits.filter(s => s.hp > 0);

var miners = 40;

for (var s of mine){
    if(memory[s.id] == 'harvesting' || memory[s.id] == 'charging') {
        miners--;
    }
    if (memory[s.id] == 'attacker') {
        if(base.sight.enemies.length == 0) {
            memory[s.id] = 'charging';
        }
    } else if (s.energy == s.energy_capacity){
        if(miners > 0) {
            memory[s.id] = 'charging';
            miners--;
        } else {
            memory[s.id] = 'defending';
        }
    } else if (s.energy == 0){
        memory[s.id] = 'harvesting';
    } 

    if (memory[s.id] == 'charging'){
        s.move(base.position);
        s.energize(base);
    } else if(memory[s.id] == 'harvesting'){
        s.move(my_star.position);
        s.energize(s);
    } else if(memory[s.id] == 'defending'){
        s.move(base.position);
    }
}

if (base.sight.enemies.length > 0){
    console.log('i see you');
    var i = 0;
    for (var s of mine){
        if (s.energy == s.energy_capacity){
            memory[s.id] = 'attacker';
        }
        if(memory[s.id] == 'attacker'){
            var invader = spirits[base.sight.enemies[i%base.sight.enemies.length]];
            s.move(invader.position);
            s.energize(invader);
            i++;
        }
    }

}

/*else {
    memory['atck'] = 0; 
}

if (my_spirits.length >= 600 && memory['phase'] != 1){
    if (memory['phase'] == undefined || memory['phase'] == ''){
        memory['phase'] = 1;
    }
}

if (memory['phase'] == 1){
    for (j = 0; j < 11; j++){
        if (my_spirits[j].energy == my_spirits[j].energy_capacity){
            memory[my_spirits[j].id] = 'invader';
            my_spirits[j].move([2600, 1050]);
        }
        memory[my_spirits[0].id] = 'bait';
        my_spirits[0].move([2150,1250]);
    }
}

if (memory['phase'] == 1 && my_spirits[1].position[0] == 2600 && my_spirits[5].position[0] == 2600){
    memory['phase'] = 2;
}

if (memory['phase'] == 2){
    for (j=1; j<11; j++){
        my_spirits[j].move(enemy_base.position);
        my_spirits[j].energize(enemy_base)
    }
    
    if (my_spirits[0].sight.enemies.length > 0){
        var enemy = spirits[my_spirits[0].sight.enemies[0]];
        if (Math.abs(enemy.position[0] - my_spirits[0].position[0]) < 250 && Math.abs(enemy.position[1] - my_spirits[0].position[1]) < 250){
            my_spirits[0].move(base.position);
        } else {
            my_spirits[0].move([1000, 800])
        }
    } else {
        my_spirits[0].move([1000, 800])
    }
    
}*/