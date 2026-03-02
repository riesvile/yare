let my_id = getCookie('player_id');
let plr = (my_id == players['player1']) ? 'p1' : 'p2';


module_draw['direction'] = function() {
	
  for (sp_id in game_blocks[active_block][plr]){
	   let rendered_pos = cats[sp_id].position;
	   let cat_data = game_blocks[active_block][plr][sp_id];
	   c.beginPath();
	   c.moveTo(rendered_pos[0], rendered_pos[1]);
       // [2] and [3] are the x and y of the direction vector
	   c.lineTo(rendered_pos[0] + cat_data[0][2], 
	            rendered_pos[1] + cat_data[0][3]);
	   c.strokeStyle = 'white';
	   c.stroke();
  }
	 
}