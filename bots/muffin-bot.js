var alive = my_cats.filter(s => s.hp > 0);
for (var s of alive) {
  var closest = null, best = Infinity;
  for (var id in cats) {
    var e = cats[id];
    if (e.player_id === this_player_id || e.hp === 0) continue;
    var d = (s.position[0]-e.position[0])**2 + (s.position[1]-e.position[1])**2;
    if (d < best) { best = d; closest = e; }
  }
  if (closest) {
    var dist = Math.sqrt(best);
    if (dist > 50) {
      var dx = closest.position[0] - s.position[0];
      var dy = closest.position[1] - s.position[1];
      s.move([closest.position[0] - (dx / dist) * 50, closest.position[1] - (dy / dist) * 50]);
    }
  }
}
