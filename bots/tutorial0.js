my_spirits[0].move(star_a1c.position);
my_spirits[0].energize(my_spirits[0]);
if (my_spirits[0].energy == my_spirits[0].energy_capacity) {
  my_spirits[0].move(base.position);
  my_spirits[0].energize(base);
}

if (spirits["anonymous_2"].energy == 0) {
  my_spirits[1].move(enemy_base.position);
}
