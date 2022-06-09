
function man_canvas_click(e){
	let mouse_x = e.clientX;
	let mouse_y = e.clientY;
	let gameboard_x = mouse_x*multiplier - offsetX;
	let gameboard_y = mouse_y*multiplier - offsetY;
	
	console.log(gameboard_x + ', ' + gameboard_y);
	
	man_select_spirit(gameboard_x, gameboard_y);
}

function man_plate_click(e){
	e.stopPropagation();
    e = e || window.event;
    let el = (e.target || e.srcElement);
	console.log(el.id);
	if (el.id == 'man_attack_base'){
		man_attack(man_selected_spirits);
	}
}

function man_select_spirit(x_point, y_point){
	for (i = 0; i < living_spirits.length; i++){
		if (living_spirits[i].hp == 0) continue;
		if (Math.abs(living_spirits[i].position[0] - x_point) <= 5 && Math.abs(living_spirits[i].position[1] - y_point) <= 5){
			man_selected_spirits = [living_spirits[i].id];
		}
	}
}

function man_attack(attackers){
	console.log('attackers = ');
	console.log(attackers);
	client['attacking'] = man_selected_spirits;
	update_code();
}


module_draw['man_spirit_selection'] = function() {
	for (let i = 0; i < man_selected_spirits.length; i++){
		//console.log('rendering around spirit ' + man_selected_spirits[i]);
		let spirit_x = spirits[man_selected_spirits[i]].position[0];
		let spirit_y = spirits[man_selected_spirits[i]].position[1];
		let spirit_size = spirits[man_selected_spirits[i]].size;
		let color_parts = spirits[man_selected_spirits[i]].color.match(/[.?\d]+/g);
		c.beginPath();
		c.arc(spirit_x, spirit_y, spirit_size + 5, Math.PI * 0, Math.PI * 2, false);
		c.closePath();
		c.lineWidth = 1;
		c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.6 + ')';
		c.stroke();
	}
	
}




var man_selected_spirits = [];




// UI













//
//
//let attack_btn = document.createElement('div');
//attack_btn.innerHTML = "<span id='man_attack_base' style='display: block; width: 100%; height: 100%; background-color: #f00;'></span>";
//attack_btn.style.cssText = 'position:absolute; top: 50%; right: 28px; width:52px; height:52px; opacity:1; z-index:100;';
//document.getElementById('modules_plate').appendChild(attack_btn);
//
//
////event handlers
//document.getElementById('base_canvas').addEventListener("click", man_canvas_click, false);
//document.getElementById('modules_plate').addEventListener("click", man_plate_click, false);