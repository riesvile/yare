function canvas_click(e){
  let mouse_x = e.clientX;
  let mouse_y = e.clientY;
  let gameboard_x = mouse_x*multiplier - offsetX;
  let gameboard_y = mouse_y*multiplier - offsetY;
  select_cat(gameboard_x, gameboard_y);
}

function select_cat(x_point, y_point){
  for (i = 0; i < living_cats.length; i++){
    let s_id = living_cats[i].id;
    let s_pos = living_cats[i].position;
    if (Math.abs(s_pos[0] - x_point) <= 8
     && Math.abs(s_pos[1] - y_point) <= 8){
        client['expl'] = s_id;
        update_code();
    }
  }
}

let canv = document.getElementById('base_canvas');
canv.addEventListener("click", canvas_click, false);