for (i=0; i<my_spirits.length; i++){
    my_spirits[i].move(star_a1c.position);
    my_spirits[i].energize(my_spirits[i]);

    if (my_spirits[i].energy == my_spirits[i].energy_capacity){
        memory[my_spirits[i].id] = 'charging';
    } else if (my_spirits[i].energy == 0){
        memory[my_spirits[i].id] = 'harvesting';
    }

    if (memory[my_spirits[i].id] == 'charging'){
        my_spirits[i].move(base.position);
        my_spirits[i].energize(base);
    } else if (memory[my_spirits[i].id] == 'harvesting'){
        my_spirits[i].move(star_a1c.position);
        my_spirits[i].energize(my_spirits[i]);
    }
}

if (base.sight.enemies.length > 0){
    console.log('i see you');
    var invader = spirits[base.sight.enemies[0]];
    for (j=0; j<my_spirits.length; j++){
        if (my_spirits[j].energy == my_spirits[j].energy_capacity){
            memory[my_spirits[j].id] = "attacker";
        }
        if (memory[my_spirits[j].id] == "attacker" && j < my_spirits.length / 2){
            console.log('this should be last');
            my_spirits[j].move(invader.position);
            my_spirits[j].energize(invader);
        }
    }

} else {
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
    
}