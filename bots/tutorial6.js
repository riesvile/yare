my_spirits[0].move(star_a1c.position);
my_spirits[0].energize(my_spirits[0]);
if (my_spirits[0].energy == my_spirits[0].energy_capacity) {
  my_spirits[0].move(base.position);
  my_spirits[0].energize(base);
}

if (!memory["attacker"]) {
  memory["attacker"] = my_spirits[1];
}

memory["attacker"].move(enemy_base.position);
