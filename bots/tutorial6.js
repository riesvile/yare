
my_cats[0].move(barricade_b.position);
my_cats[0].pew(my_cats[0]);

if (!memory['attacker']){
    memory['attacker'] = my_cats[1];
}

memory['attacker'].move(barricade_b.position);
memory['attacker'].pew(memory['attacker']);
