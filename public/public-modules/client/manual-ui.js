function man_ui_crossroad(e){
	e.stopPropagation();
    e = e || window.event;
    let el = (e.target || e.srcElement);
	console.log(el.id);
	let b_val = '';
	
	switch (el.id){
	case 'man_action_group_behaviour':
		show_group_options();
		break;
	case 'man_action_harvest':
		energize_pair_selecting();
		break;
	case 'man_protection_full':
		if (base_selection){
			hide_newborn_options();
		} else {
			hide_group_options();
		}
		break;
	case 'man_action_ui_close':
		energize_pair_cancelled();
		break;
	case 'man_action_done':
		selection_done();
		selected_group = [];
		total_group = [];
		break;
	case 'man_select_count':
		//case 'man_select_slider_val':
		slider_open();
		break;
	case 'man_select_count_swap':
		console.log('hhh');
		break;
	case 'man_attitude_nothing':
	case 'man_attitude_keepdist':
	case 'man_attitude_chase':
		b_val = el.id.split('_');
		assign_behaviour(selected_group, 'attitude', b_val[b_val.length - 1]);
		get_behaviour_selection(selected_group);
		break;
	case 'man_attitude_jump':
		assign_behaviour(selected_group, 'attitude_jump', 1);
		get_behaviour_selection(selected_group);
		break;
	case 'man_targetting_nothing':
	case 'man_targetting_nearest':
	case 'man_targetting_lowest':
		b_val = el.id.split('_');
		assign_behaviour(selected_group, 'targetting', b_val[b_val.length - 1]);
		get_behaviour_selection(selected_group);
		break;
	case 'man_priority_manual':
	case 'man_priority_attitude':
		b_val = el.id.split('_');
		assign_behaviour(selected_group, 'action_priority', b_val[b_val.length - 1]);
		get_behaviour_selection(selected_group);
		break;
	case 'man_newborn_goto':
		assign_newborn_behaviour(base_selection, 'goto');
		get_newborn_behaviour(base_selection);
		break;
	case 'man_newborn_harvest':
		assign_newborn_behaviour(base_selection, 'harvest');
		get_newborn_behaviour(base_selection);
		break;
	case 'man_newborn_where':
		choose_newborn_point();
		break;
	case 'man_action_special_merge':
		merge_group(selected_group);
		document.getElementById('man_action_special_merge').style.display = 'none';
		document.getElementById('man_action_special_divide').style.display = 'block';
		break;
	case 'man_action_special_divide':
		assign_behaviour(selected_group, 'merge', '');
		//TODO: update local_memory of mergees (now it's only updating the one big spirit);
		document.getElementById('man_action_special_merge').style.display = 'block';
		document.getElementById('man_action_special_divide').style.display = 'none';
		break;
	case 'man_action_special_lock':
		assign_behaviour(selected_group, 'lock', 1);
		document.getElementById('man_action_special_lock').style.display = 'none';
		document.getElementById('man_action_special_unlock').style.display = 'block';
		break;
	case 'man_action_special_unlock':
		assign_behaviour(selected_group, 'lock', 0);
		document.getElementById('man_action_special_lock').style.display = 'block';
		document.getElementById('man_action_special_unlock').style.display = 'none';
		break;
	case 'man_action_special_explode':
		assign_behaviour(selected_group, 'explode', 1);
		selection_done();
		break;
	case 'man_action_special_jump':
		assign_behaviour(selected_group, 'jump', 1);
		break;
	}
	
}

// mapping values from one scale to another (used for spirit-select slider)
function map_values(the_number, in_min, in_max, out_min, out_max) {
  return (the_number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function number_between(num, edge_a, edge_b) {
	return (num - edge_a) * (num - edge_b) <= 0;
}

function point_in_circle(point_x, point_y, circle_x, circle_y, circle_rad){
	let dis_sq = (point_x - circle_x) * (point_x - circle_x) + (point_y - circle_y) * (point_y - circle_y);
	return (dis_sq <= circle_rad * circle_rad);
}

function swap_array(arr1, arr2) {
    let temp_array = arr1.slice(0);
    arr1.length = 0;
    [].push.apply(arr1, arr2);
    arr2.length = 0;
    [].push.apply(arr2, temp_array); 
}

function man_get_distance_fast(point1, point2){
    let dx = point1[0] - point2[0];
    let dy = point1[1] - point2[1];
    return (dx*dx + dy*dy);
}

function man_distance_within_square(point1, point2, dist){
	return (Math.abs(point1[0] - point2[0]) < dist && Math.abs(point1[1] - point2[1]) < dist)
}

function get_group_center(spirit_group){
	let temp_sum_x = 0;
	let temp_sum_y = 0;
	for (let spi of spirit_group){
		temp_sum_x += spi.position[0];
		temp_sum_y += spi.position[1];
	}
	return [Math.round(temp_sum_x/spirit_group.length), Math.round(temp_sum_y/spirit_group.length)]
}

function get_closest_spirit_id(spirit_group, the_point){
	let spi_closest = '';
	let spi_distance = 100000000;
	for (let spi of spirit_group){
		let temp_distance = man_get_distance_fast(spi.position, the_point)
		if (temp_distance <= spi_distance){
			spi_distance = temp_distance;
			spi_closest = spi.id;
		}
	}
	return spi_closest;
}

function get_structure_at_position(pos){
	let clicked_structure = false;
	for (let ob in structure_lookup){
		let structure = structure_lookup[ob];
		if (man_distance_within_square(pos, structure.position, 20) && structure.structure_type != 'star') clicked_structure = structure.id;
	}
	return clicked_structure;
}

// ------

function get_shape_buttons(){
	let wtf_player_num = (players['player1'] == this_player || players['player1'] == 'live-input') ? 1 : 2 // this is really stupid, will rewrite later - used only for getting player's shape
	this_player_shape = shapes['shape' + wtf_player_num];
	//this_player_shape = 'squares';
	//if (this_player_shape == 'circles')	document.getElementById('man_action_special_merge').style.display = 'block';
	//if (this_player_shape == 'squares')	document.getElementById('man_action_special_lock').style.display = 'block';
	//if (this_player_shape == 'triangles') document.getElementById('man_action_special_explode').style.display = 'block';
}





//UI animations — using anime.js library that's already imported into yare.io

function protection_layer(state){
	anime({
		targets: '#man_protection_full',
		opacity: 1 * state,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#man_protection_gradient',
		opacity: 0.48 * state,
		easing: 'easeOutQuad',
		duration: 300
	});
}

function protection_layer_soft(state){
	anime({
		targets: '#man_protection_gradient',
		opacity: 0.16 * state,
		easing: 'easeOutQuad',
		duration: 300
	});
}


function show_main_options(){
	anime({
		targets: '#man_ui_wrap',
		opacity: 1,
		right: 20,
		easing: 'easeOutQuad',
		duration: 300
	});
}

function hide_main_options(state = 1){
	anime({
		targets: '#man_ui_wrap',
		opacity: 0,
		right: 40 * state,
		easing: 'easeOutQuad',
		duration: 300
	});
}

function show_group_options(){
	behaviour_selection = true;
	protection_layer(1);
	hide_main_options();
	anime({
		targets: '#man_layer2',
		opacity: 1,
		right: 20,
		easing: 'easeOutQuad',
		duration: 300
	});
	document.getElementById('man_ui_wrap').style.pointerEvents = 'none';
	document.getElementById('man_layer2').style.pointerEvents = 'auto';
	document.getElementById('man_protection_full').style.pointerEvents = 'auto';
	get_behaviour_selection(selected_group);
}

function hide_group_options(){
	behaviour_selection = false;
	protection_layer(0);
	show_main_options();
	anime({
		targets: '#man_layer2',
		opacity: 0,
		right: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	document.getElementById('man_ui_wrap').style.pointerEvents = 'auto';
	document.getElementById('man_layer2').style.pointerEvents = 'none';
	document.getElementById('man_protection_full').style.pointerEvents = 'none';
}

function show_newborn_options(){
	protection_layer(1);
	anime({
		targets: '#man_layer2_base',
		opacity: 1,
		right: 20,
		easing: 'easeOutQuad',
		duration: 300
	});
	document.getElementById('man_layer2_base').style.pointerEvents = 'auto';
	document.getElementById('man_protection_full').style.pointerEvents = 'auto';
}

function hide_newborn_options(){
	base_selection = false;
	protection_layer(0);
	anime({
		targets: '#man_layer2_base',
		opacity: 0,
		right: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	document.getElementById('man_layer2_base').style.pointerEvents = 'none';
	document.getElementById('man_protection_full').style.pointerEvents = 'none';
}

function newborn_point(){
	anime({
		targets: '#man_layer2_base',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	protection_layer(0);
	document.getElementById('man_layer2_base').style.pointerEvents = 'none';
	document.getElementById('man_protection_full').style.pointerEvents = 'none';
}

function energize_pair_selecting(){
	energize_pair_selection = true;
	hide_main_options();
	anime({
		targets: '#man_layer3',
		opacity: 1,
		right: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	document.getElementById('man_ui_wrap').style.pointerEvents = 'none';
	document.getElementById('man_layer3').style.pointerEvents = 'auto';
}

function energize_pair_cancelled(){
	energize_pair_selection = false;
	energize_pair = {
		structure: '',
		star: ''
	}
	anime({
		targets: '#man_layer3',
		opacity: 0,
		right: -20,
		easing: 'easeOutQuad',
		duration: 300
	});
	document.getElementById('man_layer3').style.pointerEvents = 'none';
	
	if (selected_group.length > 0){
		document.getElementById('man_ui_wrap').style.pointerEvents = 'auto';
		show_main_options();
	}
	
}

function selection_invoke(){
	show_main_options();
	protection_layer_soft(1);
	document.getElementById('man_ui_wrap').style.pointerEvents = 'auto';
	update_labels();
	update_ability_buttons();
}

function selection_done(){
	hide_main_options(0);
	protection_layer_soft(0);
	document.getElementById('man_ui_wrap').style.pointerEvents = 'none';
}

function update_labels(){
	document.getElementById('man_f1').innerHTML = selected_group.length;
	document.getElementById('man_f2').innerHTML = swap_group.length;
	document.getElementById('man_count_current').innerHTML = select_current_amount;
	document.getElementById('man_count_max').innerHTML = slider_total_amount;
	document.getElementById('man_count_half').innerHTML = Math.ceil(slider_total_amount/2);
	
	if (swap_group.length == 0){
		document.getElementById('man_select_count_swap').style.visibility = 'hidden';
		//document.getElementById('man_select_count_swap').style.pointerEvents = 'none';
	} else {
		document.getElementById('man_select_count_swap').style.visibility = 'visible';
		//document.getElementById('man_select_count_swap').style.pointerEvents = 'auto';
	}
}

function update_ability_buttons(){
	document.getElementById('man_action_special_jump').style.display = 'none';
	if (this_player_shape == 'circles'){
		if (selected_group.length > 1) document.getElementById('man_action_special_merge').style.display = 'block';
		let merged_spirit_part_of_selection = false;
		let moving_spirit_part_of_selection = false;
		for (let spi of selected_group){
			if (local_memory['behaviour'][spi.id] == undefined) set_default_behaviour([spi]);
			if (spi.size > 1 || local_memory['behaviour'][spi.id]['merge'] != '') merged_spirit_part_of_selection = true;
			if (!man_distance_within_square(local_memory['behaviour'][spi.id]['move'], spi.position, 20) && spi.energy != 0) moving_spirit_part_of_selection = true;
		}
		if (merged_spirit_part_of_selection) document.getElementById('man_action_special_divide').style.display = 'block';	
		if (moving_spirit_part_of_selection) document.getElementById('man_action_special_jump').style.display = 'block';
	} else if (this_player_shape == 'squares'){
		for (let spi of selected_group){
			if (local_memory['behaviour'][spi.id] == undefined) set_default_behaviour([spi]);
			if (!local_memory['behaviour'][spi.id]['lock']) document.getElementById('man_action_special_lock').style.display = 'block';
			if (local_memory['behaviour'][spi.id]['lock']) document.getElementById('man_action_special_unlock').style.display = 'block';
		}
	} else if (this_player_shape == 'triangles'){
		
	}
	
	
	
}

function slider_open(e){
    e = e || window.event;
    let el = (e.target || e.srcElement);
	if (el.id === 'man_select_count_swap') return;
	
	sliding = true;
	document.getElementById('man_select_count').classList.add('man_count_slided');
	get_slider_bounding_box();
	//console.log(slider_coords);
	slider_total_amount = select_current_amount + swap_amount;
	slider_changing_amount = select_current_amount;
	let slider_value = Math.round(map_values(select_current_amount, 0, slider_total_amount, 0, 156));
	slider_val_el.style.height = slider_value + 'px';
	update_labels();
	
	anime({
		targets: '#man_protection_full_sliding',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#man_select_slider_val',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#man_action_group1, #man_action_group2, #man_action_done, #man_select_count_swap, #man_f1',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	
	document.getElementById('man_protection_full_sliding').style.pointerEvents = 'auto';
}

function slider_close(){
	document.getElementById('man_select_count').classList.remove('man_count_slided');
	sliding = false;
	
	select_current_amount = slider_changing_amount;
	selected_amount_lbl.innerHTML = select_current_amount;
	swap_amount_lbl.innerHTML = swap_amount;
	over_radius = 0;
	slider_val_over_el.style.height = '0px';
	
	anime({
		targets: '#man_protection_full_sliding',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#man_select_slider_val',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 100
	});
	anime({
		targets: '#man_action_group1, #man_action_group2, #man_action_done, #man_select_count_swap, #man_f1',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 300
	});
	
	document.getElementById('man_protection_full_sliding').style.pointerEvents = 'none';
}

function hiding_slider_labels(val){
	anime({
		targets: '#man_count_one',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 50
	});
	anime({
		targets: '#man_count_half',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 50
	});
	anime({
		targets: '#man_count_max',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 50
	});
	if (val < 0.16){
		anime({
			targets: '#man_count_one',
			opacity: 0,
			easing: 'easeOutQuad',
			duration: 100
		});
	}
	if (val > 0.4 && val < 0.6){
		anime({
			targets: '#man_count_half',
			opacity: 0,
			easing: 'easeOutQuad',
			duration: 100
		});
	}
	if (val > 0.9){
		anime({
			targets: '#man_count_max',
			opacity: 0,
			easing: 'easeOutQuad',
			duration: 100
		});
	}
}

function slider_sliding(e){
	get_slider_bounding_box();
    let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
    let touch = evt.touches[0] || evt.changedTouches[0];
    let touch_y = touch.pageY;
	let slider_value = Math.round(map_values(touch_y, slider_y_0, slider_y_100, 0, 156));
	let over_value = 0;
	if (slider_value < 0) slider_value = 0;
	if (slider_value > 156){
		over_value = slider_value - 164 < 0 ? 0 : slider_value - 164;
		if (over_value > 56) over_value = 56;
		slider_value = 156;
		expand_select_radius(over_value);
		if (!bg_helper){
			anime({
				targets: '#man_protection_full_sliding',
				opacity: 0,
				easing: 'easeOutQuad',
				duration: 300
			});
			bg_helper = true;
		}
	} else {
		slider_val_over_el.style.height = '0px';
		over_radius = 0;
		if (bg_helper){
			anime({
				targets: '#man_protection_full_sliding',
				opacity: 1,
				easing: 'easeOutQuad',
				duration: 300
			});
			bg_helper = false;
		}
	}
	slider_val_el.style.height = slider_value + 'px';
	  
	let slider_percent = Math.round(map_values(slider_value, 0, 156, 0, 100)) / 100;
	
	hiding_slider_labels(slider_percent);
	
	
	slider_changing_amount = Math.round(slider_percent * slider_total_amount);
	swap_amount = slider_total_amount - slider_changing_amount;
	if (slider_changing_amount < 1) slider_changing_amount = 1;
	document.getElementById('man_count_current').innerHTML = slider_changing_amount;
	
	//selected_group = temp_selected_group;
	//swap_group = temp_swap_group;
	//console.log(slider_y_100);
	//console.log(slider_value);
	//console.log(slider_percent);
	value_changed = true;
}

function slider_finished(){
	if (!value_changed) return;
	slider_close();
	value_changed = false;
	
	selected_group = [];
	swap_group = [];
	
	for (let i = 0; i < slider_total_amount; i++){
		if (i < slider_changing_amount){
			selected_group.push(total_group[i]);
		} else {
			swap_group.push(total_group[i]);
		}
	}
	update_labels();
}

function expand_select_radius(over){
	slider_val_over_el.style.height = over + 'px';
	over_radius = 80 + over*3;
	man_mobile_spirit_selection(touch_point[0], touch_point[1], over_radius);
}

function get_slider_bounding_box(){
	let slider_el_box = document.getElementById('man_select_count').getBoundingClientRect();
	slider_y_100 = slider_el_box.top;
	slider_y_0 = slider_el_box.bottom;
}

function is_base_click(p_x, p_y){
	let clicked_base = false;
	for (let ba of bases){
		if (ba.control != this_player && ba.control != 'live-input') continue;
		let ba_x = ba.position[0];
		let ba_y = ba.position[1];
		if (Math.abs(p_x - ba_x) <= 40 && Math.abs(p_y - ba_y) <= 40){
			clicked_base = ba.id;
			//base_selection = ba.id;
			//get_newborn_behaviour(ba.id);
			//show_newborn_options();
		}
	}
	return clicked_base;
}

function man_canvas_click(e){
	let mouse_x = e.clientX;
	let mouse_y = e.clientY;
	let gameboard_x = mouse_x*multiplier - offsetX;
	let gameboard_y = mouse_y*multiplier - offsetY;
	
	console.log(gameboard_x + ', ' + gameboard_y);
	
	if (newborn_point_selection){
		assign_newborn_behaviour(base_selection, 'goto', [Math.round(gameboard_x), Math.round(gameboard_y)]);
		document.getElementById('man_newborn_point').style.opacity = 0;
		newborn_point_selection = false;
	}
	
	base_selection = false;
	let temp_base = is_base_click(gameboard_x, gameboard_y);
	if (temp_base && !(energize_pair_selection)) {
		console.log('got here')
		base_selection = temp_base;
		get_newborn_behaviour(temp_base);
		show_newborn_options();
	}
	
	if (energize_pair_selection) man_select_energize_pair(gameboard_x, gameboard_y);
	
	
	//for (let ba of bases){
	//	if (ba.control != this_player && ba.control != 'live-input') continue;
	//	let ba_x = ba.position[0];
	//	let ba_y = ba.position[1];
	//	if (Math.abs(gameboard_x - ba_x) <= 40 && Math.abs(gameboard_y - ba_y) <= 40){
	//		base_selection = ba.id;
	//		get_newborn_behaviour(ba.id);
	//		show_newborn_options();
	//	}
	//}
}

function man_canvas_rightclick(e){
	e.preventDefault();
	console.log('rightclicked');	
	let mouse_x = e.clientX;
	let mouse_y = e.clientY;
	let gameboard_x = mouse_x*multiplier - offsetX;
	let gameboard_y = mouse_y*multiplier - offsetY;
	
	if (selected_group.length > 0){
		assign_behaviour(selected_group, 'move', [Math.round(gameboard_x), Math.round(gameboard_y)]);
		let structure_clicked = get_structure_at_position([Math.round(gameboard_x), Math.round(gameboard_y)])
		if (structure_clicked == false) {
			for (let sp of selected_group) local_memory['behaviour'][sp.id]['obj_energize'] = '';
		} else {
			for (let sp of selected_group) local_memory['behaviour'][sp.id]['obj_energize'] = structure_clicked;
		}
	}
}

function man_desktop_spirit_selection(e){
	if (!(e.metaKey || e.ctrlKey)) return;
	if (behaviour_selection) return;
	if (this_player_shape == '') get_shape_buttons();
	//if (energize_pair_selection) return;
	let mouse_x = e.clientX;
	let mouse_y = e.clientY;
	let gameboard_x = mouse_x*multiplier - offsetX;
	let gameboard_y = mouse_y*multiplier - offsetY;
	let temp_selected_group = [];
	
	if (!cmd_ctrl_down) {
		cmd_ctrl_down = true;
		selection_corners[0] = Math.round(gameboard_x);
		selection_corners[1] = Math.round(gameboard_y);
	}
	selection_corners[2] = Math.round(gameboard_x);
	selection_corners[3] = Math.round(gameboard_y);
	
	for (let man_sp of Object.keys(spirits)){
		let mm_sp = spirits[man_sp];
		if (mm_sp.hp == 0) continue;
		if (mm_sp.player_id != this_player && mm_sp.player_id != 'live-input') continue;
		if ( number_between(mm_sp.position[0], selection_corners[0], selection_corners[2])
		  && number_between(mm_sp.position[1], selection_corners[1], selection_corners[3])){
			  temp_selected_group.push(mm_sp);
		}
		//console.log(mm_sp.player_id);
		//console.log(this_player);
	}
	
	selected_group = temp_selected_group;
	total_group = temp_selected_group;
	select_current_amount = selected_group.length;
	swap_group = [];
	swap_amount = 0;
	
	selected_group.length > 0 ? selection_invoke() : selection_done();
	
}

function man_mobile_touchstart(e){
	e = e || window.event;
    let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
    let touch = evt.touches[0] || evt.changedTouches[0];
    touch_point[0] = Math.round(touch.pageX);
    touch_point[1] = Math.round(touch.pageY);
	
	console.log('start')
	console.log(touch_point);
}

function man_mobile_touchend(e){
	e = e || window.event;
    let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
    let touch = evt.touches[0] || evt.changedTouches[0];
	let temp_touch_point = [Math.round(touch.pageX), Math.round(touch.pageY)];
	let temp_dist_x = Math.abs(temp_touch_point[0] - touch_point[0]);
	let temp_dist_y = Math.abs(temp_touch_point[1] - touch_point[1]);
	
	if (temp_dist_x <= 5 && temp_dist_y <= 5){
		let gameboard_x = temp_touch_point[0]*multiplier - offsetX;
		let gameboard_y = temp_touch_point[1]*multiplier - offsetY;
		if (is_base_click(gameboard_x, gameboard_y)) return;
		touch_point = [gameboard_x, gameboard_y];
		
		//select new units vs. move action
		if (selected_group.length > 0){
			assign_behaviour(selected_group, 'move', [Math.round(gameboard_x), Math.round(gameboard_y)])
		} else {
			man_mobile_spirit_selection(touch_point[0], touch_point[1], 80);
		}
		
	}
}

function man_mobile_spirit_selection(man_t_x, man_t_y, t_rad = 20){
	if (energize_pair_selection) return;
	if (behaviour_selection) return;
	if (this_player_shape == '') get_shape_buttons();
	let temp_selected_group = [];
	for (let man_sp of Object.keys(spirits)){
		let mm_sp = spirits[man_sp];
		if (mm_sp.hp == 0) continue;
		if (mm_sp.player_id != this_player && mm_sp.player_id != 'live-input') continue;
		if (Math.abs(man_t_x - mm_sp.position[0]) > t_rad) continue;
		if (Math.abs(man_t_y - mm_sp.position[1]) > t_rad) continue;
		if (point_in_circle(mm_sp.position[0], mm_sp.position[1], man_t_x, man_t_y, t_rad)){
			temp_selected_group.push(mm_sp);
		}	
	}
	
	selected_group = temp_selected_group;
	total_group = temp_selected_group;
	select_current_amount = selected_group.length;
	slider_total_amount = select_current_amount;
	swap_group = [];
	swap_amount = 0;
	selected_group.length > 0 ? selection_invoke() : selection_done();
	update_labels();
}

function man_desktop_selection_finish(e){
	selection_corners = [0, 0, 0, 0];
	cmd_ctrl_down = false;
	if (e.key != 'Escape' && e.key != "Control") return;
	if (energize_pair_selection) energize_pair_cancelled();
	if (selected_group.length > 0) get_behaviour_selection(selected_group);
}

function man_desktop_keydown(e){
	if (e.key == 'Escape'){
		if (energize_pair_selection){
			energize_pair_cancelled();
		} else if (behaviour_selection) {
			hide_group_options();
		} else if (base_selection){
			hide_newborn_options();
		} else {
			selected_group = [];
			total_group = 0;
			selection_done();
		}
		
	}
}

function fill_energize_pair(man_type, man_thing){
	if (man_type == 'structure'){
		energize_pair.structure == man_thing ? energize_pair.structure = '' : energize_pair.structure = man_thing;
	}
}

function man_select_energize_pair(man_x, man_y){
	for (let e_b of bases){
		if (Math.abs(man_x - e_b.position[0]) <= 70 && Math.abs(man_y - e_b.position[1]) <= 70){
			energize_pair.structure == e_b ? energize_pair.structure = '' : energize_pair.structure = e_b;
		}
	}
	for (let e_o of outposts){
		if (Math.abs(man_x - e_o.position[0]) <= 70 && Math.abs(man_y - e_o.position[1]) <= 70){
			energize_pair.structure == e_o ? energize_pair.structure = '' : energize_pair.structure = e_o;
		}
	}
	for (let e_p of pylons){
		if (Math.abs(man_x - e_p.position[0]) <= 70 && Math.abs(man_y - e_p.position[1]) <= 70){
			energize_pair.structure == e_p ? energize_pair.structure = '' : energize_pair.structure = e_p;
		}
	}
	for (let e_s of stars){
		if (Math.abs(man_x - e_s.position[0]) <= 70 && Math.abs(man_y - e_s.position[1]) <= 70){
			energize_pair.star == e_s ? energize_pair.star = '' : energize_pair.star = e_s;
		}
	}
	
	let e_structure_lbl = document.getElementById('e_pair_structure');
	let e_star_lbl = document.getElementById('e_pair_star');
	
	energize_pair.structure == '' ? e_structure_lbl.style.opacity = 1 : e_structure_lbl.style.opacity = 0.49;
	energize_pair.star == '' ? e_star_lbl.style.opacity = 1 : e_star_lbl.style.opacity = 0.49;
	
	if (energize_pair.structure != '' && energize_pair.star != ''){
		assign_behaviour(selected_group, 'energize_chain', [energize_pair.structure.id, energize_pair.star.id]);
		energize_pair_cancelled();
		energize_pair = {
			structure: '',
			star: ''
		}
	}
	
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

//function man_select_spirit(x_point, y_point){
//	for (i = 0; i < living_spirits.length; i++){
//		if (living_spirits[i].hp == 0) continue;
//		if (Math.abs(living_spirits[i].position[0] - x_point) <= 5 && Math.abs(living_spirits[i].position[1] - y_point) <= 5){
//			//man_selected_spirits = [living_spirits[i].id];
//		}
//	}
//}

function set_default_behaviour(sp_group = living_spirits){
	for (let sp of sp_group){
		if (sp.hp == 0) continue;
		if (sp.player_id != this_player && sp.player_id != 'live-input') continue;
		local_memory['behaviour'][sp.id] = {
			attitude: 'nothing',
			attitude_jump: 0,
			targetting: 'nearest',
			action_priority: 'manual',
			merge: '',
			move: sp.position,
			energize_chain: [],
			obj_energize: ''
		}
	}
}

function get_behaviour_selection(sp_group){
	//set default if missing
	for (let spi of sp_group){
		if (local_memory['behaviour'][spi.id] == undefined) set_default_behaviour([spi]);
	}
	
	let beh_attitude = local_memory['behaviour'][sp_group[0].id].attitude;
	let beh_attitude_jump = local_memory['behaviour'][sp_group[0].id].attitude_jump;
	let beh_targetting = local_memory['behaviour'][sp_group[0].id].targetting;
	let beh_act_priority = local_memory['behaviour'][sp_group[0].id].action_priority;
	for (let s = 1; s < sp_group.length; s++){
		//if (local_memory['behaviour'][sp_group[s].id] == undefined){
		//	set_default_behaviour(sp_group[s]);
		//	console.log('default was set');
		//}
		if (local_memory['behaviour'][sp_group[s].id].attitude != beh_attitude) beh_attitude = '';
		if (local_memory['behaviour'][sp_group[s].id].attitude_jump != beh_attitude_jump) beh_attitude_jump = 0;
		if (local_memory['behaviour'][sp_group[s].id].targetting != beh_targetting) beh_targetting = '';
		if (local_memory['behaviour'][sp_group[s].id].action_priority != beh_act_priority) beh_act_priority = '';
	}
	
	document.getElementById('man_attitude_nothing').classList.remove('man_option_active');
	document.getElementById('man_attitude_keepdist').classList.remove('man_option_active');
	document.getElementById('man_attitude_chase').classList.remove('man_option_active');
	document.getElementById('man_attitude_jump').classList.remove('man_option_active');
	document.getElementById('man_targetting_nothing').classList.remove('man_option_active');
	document.getElementById('man_targetting_nearest').classList.remove('man_option_active');
	document.getElementById('man_targetting_lowest').classList.remove('man_option_active');
	document.getElementById('man_priority_manual').classList.remove('man_option_active');
	document.getElementById('man_priority_attitude').classList.remove('man_option_active');
	
	if (beh_attitude != '') document.getElementById('man_attitude_' + beh_attitude).classList.add('man_option_active');
	if (beh_attitude_jump == 1) document.getElementById('man_attitude_jump').classList.add('man_option_active');
	if (beh_targetting != '') document.getElementById('man_targetting_' + beh_targetting).classList.add('man_option_active');
	if (beh_act_priority != '') document.getElementById('man_priority_' + beh_act_priority).classList.add('man_option_active');
	
	(beh_attitude == 'nothing') ? document.getElementById('man_attitude_jump').style.display = 'none' : document.getElementById('man_attitude_jump').style.display = 'block';
	
	if (beh_attitude == 'keepdist') document.getElementById('man_attitude_jump').innerHTML = 'Use jump to stay out of range';
	if (beh_attitude == 'chase') document.getElementById('man_attitude_jump').innerHTML = 'Use jump to get closer';
	
}

function set_newborn_default(){
	for (let ba of bases){
		local_memory['newborn_' + ba.id] = {
			role: 'goto',
			position: []
		};
	}
}

function get_newborn_behaviour(base_id){
	if (local_memory['newborn_' + base_id] == undefined) set_newborn_default();
	beh_newborn = local_memory['newborn_' + base_id];
	document.getElementById('man_newborn_goto').classList.remove('man_option_active');
	document.getElementById('man_newborn_harvest').classList.remove('man_option_active');
	document.getElementById('man_newborn_where').classList.remove('man_option_active');
	document.getElementById('man_newborn_where').style.display = 'inline-block';
	
	if (beh_newborn.role == 'goto') document.getElementById('man_newborn_goto').classList.add('man_option_active');
	if (beh_newborn.role == 'harvest'){
		document.getElementById('man_newborn_harvest').classList.add('man_option_active');
		document.getElementById('man_newborn_where').style.display = 'none';
	}
	if (beh_newborn.position.length == 0){
		document.getElementById('man_newborn_where').innerHTML = 'Choose point on board';
	} else {
		console.log(beh_newborn.position.length);
		document.getElementById('man_newborn_where').classList.add('man_option_active');
		document.getElementById('man_newborn_where').innerHTML = beh_newborn.position;
	}
}

function man_attitude(selected_val){
	console.log('attitude = ' + selected_val);
	document.getElementById('man_attitude_nothing').classList.remove('man_option_active');
}


function assign_behaviour(spirit_group, beh_type, beh_value){
	//spirit_group is an array of ids
	if (assignment_tick == active_block){
		
	} else {
		assignment_tick = active_block;
		client['behaviour'] = [];
	}
	
	if (beh_type == 'attitude_jump') beh_value = beh_value - local_memory['behaviour'][spirit_group[0].id]['attitude_jump'];
	
	for (let sp of spirit_group){
		if (local_memory['behaviour'][sp.id] === undefined) local_memory['behaviour'][sp.id] = {};
		local_memory['behaviour'][sp.id][beh_type] = beh_value;
		client['behaviour'].push([sp.id, beh_type, beh_value]);
		if (beh_type == 'move'){
			if (!man_distance_within_square(local_memory['behaviour'][sp.id]['move'], sp.position, 20)){
				document.getElementById('man_action_special_jump').style.display = 'block';
			} else {
				document.getElementById('man_action_special_jump').style.display = 'none';
			}
			local_memory['behaviour'][sp.id]['energize_chain'] = [];
		}
		if (beh_type == 'jump') local_memory['behaviour'][sp.id]['jump'] = 0;
		if (beh_type == 'energize_chain'){
			local_memory['behaviour'][sp.id]['move'] = [];
		}
		if (beh_type == 'merge' && beh_value == ''){
			local_memory['behaviour'][sp.id]['move'] = [];
		}
		console.log('stored');
	}	
	update_code();
}

function assign_newborn_behaviour(base_id, beh_value, beh_position = []){
	client['newborn_' + base_id] = [beh_value, beh_position];
	console.log('base_id = ' + base_id);
	console.log('beh_val = ' + beh_value);
	console.log('beh_position = ' + beh_position);
	local_memory['newborn_' + base_id].role = beh_value;
	if (beh_position.length != 0) local_memory['newborn_' + base_id].position = beh_position;
	update_code();
}

function choose_newborn_point(){
	newborn_point_selection = true;
	document.getElementById('man_newborn_where').classList.add('man_option_active');
	document.getElementById('man_newborn_point').style.opacity = 1;
	newborn_point();
}

function man_attack(attackers){
	console.log('attackers = ');
	console.log(attackers);
	//client['attacking'] = man_selected_spirits;
	update_code();
}


// Special shape abilities

function merge_group(grp){
	let center_point = get_group_center(grp);
	let the_one = get_closest_spirit_id(grp, center_point);
	assign_behaviour(grp, 'merge', the_one);
	assign_behaviour(grp, 'move', center_point);
}





//module_draw['man_selected_spirits'] = function() {
//	for (let i = 0; i < man_selected_spirits.length; i++){
//		//console.log('rendering around spirit ' + man_selected_spirits[i]);
//		let spirit_x = spirits[man_selected_spirits[i]].position[0];
//		let spirit_y = spirits[man_selected_spirits[i]].position[1];
//		let spirit_size = spirits[man_selected_spirits[i]].size;
//		let color_parts = spirits[man_selected_spirits[i]].color.match(/[.?\d]+/g);
//		c.beginPath();
//		c.arc(spirit_x, spirit_y, spirit_size + 5, Math.PI * 0, Math.PI * 2, false);
//		c.closePath();
//		c.lineWidth = 1;
//		c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.6 + ')';
//		c.stroke();
//	}	
//}

function man_draw_circle(cir_center, cir_radius, cir_line, cir_stroke_color, cir_fill_color = 'black', cir_fill = false){
	c.beginPath();
	c.arc(cir_center[0], cir_center[1], cir_radius, Math.PI * 0, Math.PI * 2, false);
	c.closePath();
	c.fillStyle = cir_fill_color;
	c.strokeStyle = cir_stroke_color;
	c.lineWidth = cir_line;
	if (cir_fill) c.fill();
	c.stroke();
}

function man_draw_line(point1, point2, line_color, dashed = false){
	c.beginPath();
	c.moveTo(point1[0], point1[1]);
	c.lineTo(point2[0], point2[1]);
	c.strokeStyle = line_color;
	if (dashed != false) c.setLineDash([dashed, 2]);
	c.stroke();
	c.setLineDash([]);
}

function man_draw_cross(center_point, cross_color){
	c.beginPath();
	c.moveTo(center_point[0], center_point[1] + 2);
	c.lineTo(center_point[0], center_point[1] + 6);
	c.moveTo(center_point[0], center_point[1] - 2);
	c.lineTo(center_point[0], center_point[1] - 6);
	c.moveTo(center_point[0] + 2, center_point[1]);
	c.lineTo(center_point[0] + 6, center_point[1]);
	c.moveTo(center_point[0] - 2, center_point[1]);
	c.lineTo(center_point[0] - 6, center_point[1]);
	c.closePath();
	
	c.strokeStyle = cross_color;
	c.stroke();
}

module_draw['selected_group'] = function() {
	for (let i = 0; i < selected_group.length; i++){
		if (selected_group[i].hp == 0) continue;
		//console.log('rendering around spirit ' + selected_group[i]);	
		let move_dest = local_memory['behaviour'][selected_group[i].id]['move'];
		
		
		let spirit_size = selected_group[i].size;
		let color_parts = selected_group[i].color.match(/[.?\d]+/g);
		let stroke_color = cmd_ctrl_down ? 'rgba(94, 245, 255, 0.89)' : 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.72 + ')';
		let move_color = 'rgba(94, 245, 255, ' + (0.24 + spirit_size/100) + ')';
		let charge_color = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.20 + ')';
		let line_dash_ptrn = 2 + Math.abs(-3 + Math.floor(dumb_cycler / 10));
		man_draw_circle(selected_group[i].position, spirit_size + 5, 1, stroke_color);
		if (move_dest.length > 0){
			man_draw_line(selected_group[i].position, move_dest, move_color, line_dash_ptrn);
			man_draw_cross(move_dest, move_color);
		}
		
	}	
	if (selected_group.length > 0){
		let chained = local_memory['behaviour'][selected_group[0].id]['energize_chain'];
		let target_structure = local_memory['behaviour'][selected_group[0].id]['obj_energize'];
		let color_parts = selected_group[i].color.match(/[.?\d]+/g);
		let charge_color = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.48 + ')';
		let target_color = 'rgba(94, 245, 255, 0.48)';
		if (chained.length > 0){
			man_draw_line(structure_lookup[chained[0]].position, structure_lookup[chained[1]].position, charge_color, 2);
		}
		if (target_structure != '') man_draw_circle(structure_lookup[target_structure].position, 40, 1, target_color);
	}
}

module_draw['man_selection_rectangle'] = function() {
	if (!cmd_ctrl_down) return;
	
	let select_corner_x = (selection_corners[0] < selection_corners[2]) ? selection_corners[0] : selection_corners[2];
	let select_corner_y = (selection_corners[1] < selection_corners[3]) ? selection_corners[1] : selection_corners[3];
	let select_width = Math.abs(selection_corners[0] - selection_corners[2]);
	let select_height = Math.abs(selection_corners[1] - selection_corners[3]);
	
	c.beginPath();
	c.rect(select_corner_x, select_corner_y, select_width, select_height);
	c.closePath();
	c.fillStyle = 'rgba(94, 245, 255, 0.08)';
	c.strokeStyle = 'rgba(94, 245, 255, 0.69)';
	c.lineWidth = 1;
	c.fill();
	c.stroke();
}

module_draw['man_selection_circle'] = function() {
	if (over_radius <= 0) return;
	man_draw_circle(touch_point, over_radius, 1, 'rgba(94, 245, 255, 0.69)', 'rgba(94, 245, 255, 0.08)', true);
}

module_draw['man_energize_pair_selection'] = function () {
	if (!energize_pair_selection) return;
	
	for (let man_b of bases){
		man_draw_circle(man_b.position, 50, 2, 'rgba(144, 118, 255, 0.49)', 'rgba(144, 118, 255, 0.04)', true);
	}
	for (let man_s of stars){
		man_draw_circle(man_s.position, 50, 2, 'rgba(144, 118, 255, 0.49)', 'rgba(144, 118, 255, 0.04)', true);
	}
	for (let man_o of outposts){
		man_draw_circle(man_o.position, 50, 2, 'rgba(144, 118, 255, 0.49)', 'rgba(144, 118, 255, 0.04)', true);
	}
	for (let man_p of pylons){
		man_draw_circle(man_p.position, 50, 2, 'rgba(144, 118, 255, 0.49)', 'rgba(144, 118, 255, 0.04)', true);
	}
	
	if (energize_pair.structure != '') man_draw_circle(energize_pair.structure.position, 50, 2, 'rgba(164, 138, 255, 0.96)', 'rgba(164, 138, 255, 0.08)', true);
	if (energize_pair.star != '') man_draw_circle(energize_pair.star.position, 50, 2, 'rgba(164, 138, 255, 0.96)', 'rgba(164, 138, 255, 0.08)', true);
}

module_draw['man_base_selection'] = function() {
	if (!base_selection) return;
	
	man_draw_circle(base_lookup[base_selection].position, 50, 2, 'rgba(144, 118, 255, 0.89)', 'rgba(144, 118, 255, 0.14)', true)
}


// Client memory object duplicates what this script is storing into the server memory object.
// This is used purely for rendering graphics to help the user understand what's going on.
let local_memory = {
	behaviour: {},
};

client['behaviour'] = [];
client['newborn_base_zxq'] = [];
client['newborn_base_a2c'] = [];
client['newborn_base_p89'] = [];
client['newborn_base_nua'] = [];


//local_memory['behaviour']['sp_id'] = {
//	move: [],
//  jump: [],
//	energize_chain: [],
//	attitude: 'nothing',
//	targetting: 'nearest',
//	action_priority: 'manual',
//	merge: [],
//	divide: 0,
//	explode: 0,
//	lock: 0,
//  obj_energize: ''	
//}

let man_selected_spirits = [];
let slider_el = document.getElementById('man_select_count');
let slider_val_el = document.getElementById('man_select_slider_val');
let slider_val_over_el = document.getElementById('man_select_slider_expand_val');
let slider_y_100 = 0;
let slider_y_0 = 0;
let sliding = false;

//currently selected spirits
let select_current_amount = 0;
let selected_group = [];
let temp_selected_group = []; //used during sliding
let selected_sub_group = [];

//spirits in the swap group
let swap_group = [];
let temp_swap_group = []; //used during sliding

//temp value while sliding;
let slider_changing_amount = 0;
let bg_helper = false; //not important, just a visual thing for slider over max
let over_radius = 0; //rendering selection circle

//total amount of selectable spirits within the current group (TODO: better explanation)
let total_group = []
let slider_total_amount = 0;

//the difference between currently selected and total
let swap_amount = 0;

let selected_amount_lbl = document.getElementById('man_f1');
let selected_amount_lbl_slider = document.getElementById('man_count_current');
let swap_amount_lbl = document.getElementById('man_f2');

//slide on collapsed block
let value_changed = false;

//selecting units on desktop
let cmd_ctrl_down = false;

//tracking touch point on mobile
let touch_point = [];

//4 corner coordinates for spirit selection ([x1, y1, x2, y2])
let selection_corners = [0, 0, 0, 0]

//other useful flags and vars
let this_player = getCookie('user_id');
let this_player_shape = '';
let energize_pair_selection = false;
let energize_pair = {
	structure: '',
	star: '',
};
let behaviour_selection = false;
let base_selection = false;
let newborn_point_selection = false; //selecting a point on map where newborn spirits should go
let assignment_tick = 0; //for stacking multiple commands in the same tick

//set base and spirit default behaviour - change this to better suit your playing style
set_default_behaviour();
set_newborn_default();


// UI













//
//
//let attack_btn = document.createElement('div');
//attack_btn.innerHTML = "<span id='man_attack_base' style='display: block; width: 100%; height: 100%; background-color: #f00;'></span>";
//attack_btn.style.cssText = 'position:absolute; top: 50%; right: 28px; width:52px; height:52px; opacity:1; z-index:100;';
//document.getElementById('modules_plate').appendChild(attack_btn);
//
//


//event handlers
document.getElementById('base_canvas').addEventListener("click", man_canvas_click, false);
document.getElementById('base_canvas').addEventListener("contextmenu", man_canvas_rightclick, false);
document.getElementById('base_canvas').addEventListener("mousemove", man_desktop_spirit_selection, false);
document.getElementById('base_canvas').addEventListener("touchstart", man_mobile_touchstart, false);
document.getElementById('base_canvas').addEventListener("touchend", man_mobile_touchend, false);

window.addEventListener("keydown", man_desktop_keydown, false);
window.addEventListener("keyup", man_desktop_selection_finish, false);
document.getElementById('man_ui_module').addEventListener("click", man_ui_crossroad, false);
document.getElementById('man_protection_full_sliding').addEventListener("click", slider_close, false);
document.getElementById('man_select_count').addEventListener("touchstart", slider_open, false);
document.getElementById('man_select_count').addEventListener("touchmove", slider_sliding, false);
document.getElementById('man_select_count').addEventListener("touchend", slider_finished, false);

document.getElementById('man_select_count_swap').addEventListener("click", function(e){
	e.stopPropagation();
	console.log('works');
	swap_array(selected_group, swap_group);
	select_current_amount = selected_group.length;
	swap_amount = swap_group.length;
	update_labels();
}, false);



