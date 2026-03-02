

// UI

let manual_css = " .ico_man_bolt {background: url(../asset/ico_manui_bolt.png);background-size: cover;}.ico_man_jump {background: url(../asset/ico_manui_jump.png);background-size: cover;}.ico_man_merge {background: url(../asset/ico_manui_merge.png);background-size: cover;}.ico_man_divide {background: url(../asset/ico_manui_divide.png);background-size: cover;}.ico_man_lock {background: url(../asset/ico_manui_lock.png);background-size: cover;}.ico_man_unlock {background: url(../asset/ico_manui_unlock.png);background-size: cover;}.ico_man_explode {background: url(../asset/ico_manui_explode.png);background-size: cover;}.ico_man_chip {background: url(../asset/ico_manui_chip.png);background-size: cover;}.ico_man_done {background: url(../asset/ico_manui_done.png);background-size: cover;}.ico_man_close {background: url(../asset/ico_manui_close.png);background-size: cover;}#man_action_special_merge, #man_action_special_divide, #man_action_special_lock, #man_action_special_unlock, #man_action_special_explode, #man_action_special_jump {display: none;}#man_ui_wrap {position: fixed;right: 20px;top: 50%;transform: translateY(-50%);pointer-events: none;z-index: 1;opacity: 0;}.man_square_btn {width: 56px;height: 56px;background-color: rgba(212, 236, 255, 0.1);border-radius: 12px;margin-bottom: 4px;position: relative;cursor: pointer;}.btn_label {font-size: 12px;font-weight: 500;color: rgba(242, 246, 250, 0.55);position: absolute;top: 50%;right: 68px;text-align: right;transform: translateY(-50%);opacity: 0;transition: opacity 0.2s;pointer-events: none;}.man_square_btn:hover {background-color: rgba(212, 236, 255, 0.16);}.man_square_btn:hover span {opacity: 0.9;}.man_square_btn:hover p {opacity: 1;}.man_square_btn span {display: block;width: 24px;height: 24px;line-height: 24px;text-align: center;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);opacity: 0.69;pointer-events: none !important;}#man_action_harvest:hover p#tut_help_harv {opacity: 0;}#man_select_count {background-color: rgba(212, 236, 255, 0.2);margin-bottom: 12px;position: absolute;top: 0;right: 0;transition: all 0.2s;z-index: 5;}#man_select_count.man_count_slided {height: 156px;right: 8px;top: 20px;border-radius: 4px 4px 12px 12px;}.man_count_slided #man_select_slider_val, .man_count_slided #man_select_slider_expand, .man_count_slided #man_select_slider_lbls {opacity: 1;}#man_select_count_swap {position: absolute;top: -44px;right: 0;width: 40px;height: 40px;font-size: 12px;font-weight: 500;z-index: 10;}#man_select_slider_expand {background-color: rgba(212, 246, 255, 0.08);width: 56px;height: 56px;position: absolute;top: -58px;left: 0;border-radius: 12px 12px 4px 4px;opacity: 0;}#man_select_slider_expand_val {background-color: rgba(212, 246, 255, 0.6);width: 56px;height: 0px;position: absolute;bottom: 0;left: 0;border-radius: 4px;opacity: 1;}#man_select_slider_val {width: 56px;height: 120px;background-color: rgba(212, 246, 255, 0.6);position: absolute;bottom: 0;left: 0;border-radius: 4px 4px 12px 12px;opacity: 0;}#man_select_slider_lbls {position: absolute;left: -40px;bottom: 0;width: 24px;height: 156px;font-size: 11px;font-weight: 500;color: rgba(242, 246, 250, 0.69);opacity: 0;}span#man_count_current {position: absolute;top: 4px;left: -16px;font-size: 14px;font-weight: 500;color: rgba(242, 246, 250, 0.96);}span#man_count_max {display: block;position: absolute;top: -6px;transform: none;}span#man_count_half {transform: translateY(-50%);}span#man_count_one {display: block;position: absolute;top: auto;bottom: -6px;transform: none;}#man_action_group1 {margin-top: 68px;}#man_action_group2 {margin-top: 12px;}#man_action_done {margin-top: 12px;background-color: rgba(206, 245, 208, 0.1);}#man_action_done:hover {background-color: rgba(206, 245, 208, 0.16);}#man_action_ui_close {background-color: rgba(246, 206, 206, 0.1);position: absolute;right: 20px;top: 50%;transform: translateY(-50%);}"
+ "#man_action_ui_close:hover {background-color: rgba(246, 206, 206, 0.16);}#man_protection_full{width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.1);position: fixed;top: 0;left: 0;pointer-events: none;opacity: 0;}#man_protection_full_sliding {width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.6);position: fixed;top: 0;left: 0;pointer-events: none;opacity: 0;}#man_protection_gradient {width: 100%;max-width: 400px;height: 100%;position: absolute;top: 0;right: 0;background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%);opacity: 0.48;pointer-events: none;opacity: 0;}#man_protection_gradient_soft {width: 100%;max-width: 400px;height: 100%;position: absolute;top: 0;right: 0;background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%);pointer-events: none;opacity: 0;}#man_layer2, #man_layer3, #man_layer2_base {position: absolute;top: 50%;right: 0;opacity: 0;pointer-events: none;}#man_layer2 {transform: translateY(-20%);}#man_layer3 {opacity: 0;right: -20px;}h2.man_head2 {font-size: 24px;font-weight: 500;line-height: 30px;width: 180px;text-align: right;position: absolute;top: calc(50% + 40px);right: 24px;pointer-events: none;}#man_newborn_point {opacity: 0;}h3.man_head3 {font-size: 11px;font-weight: 500;letter-spacing: 1px;text-transform: uppercase;color: rgba(242, 246, 250, 0.72);margin-bottom: 14px;text-align: right;}.man_layer_option {line-height: 39px;background-color: rgba(212, 238, 255, 0.1);padding: 0px 12px 1px 12px;display: inline-block;float: right;font-size: 14px;font-weight: 500;color: rgba(242, 246, 250, 0.89);margin-left: 2px;border-radius: 4px;}.man_layer_option:hover {background-color: rgba(212, 238, 255, 0.16);cursor: pointer;}.man_option_left {border-top-left-radius: 12px;border-bottom-left-radius: 12px;}.man_option_right {border-top-right-radius: 12px;border-bottom-right-radius: 12px;}.man_option_secondary {border-radius: 12px;float: right;margin-top: 12px;}.man_option_active {background-color: rgba(212, 238, 255, 0.86) !important;color: rgba(0, 0, 0, 0.89);}.man_layer_section_desc {font-size: 11px;line-height: 15px;font-weight: 500;color: rgba(242, 246, 250, 0.69);text-align: right;margin-top: 8px;float: right;display: inline-block;}#man_action_ui_close {}#tut_help_harv {font-size: 16px;font-weight: 500;color: rgba(242, 246, 250, 1);line-height: 16px;position: absolute;top: 22px;right: 64px;width: 260px;pointer-events: none;transition: opacity 0.2;}#tut_arrow {position: absolute;top: 50% !important;left: auto !important;right: -6px !important;width: 16px !important;height: 16px !important;}#tut_help_selection_desktop, #tut_help_selection_mobile, #tut_help_move_desktop, #tut_help_move_mobile, #tut_help_attack_desktop {line-height: 26px;font-size: 16px;position: absolute;top: 45%;left: 50%;transform: translate(-50%, -50%);min-width: 400px;text-align: center;opacity: 0;pointer-events: none;}.keyboard_btn {display: inline-block;border: 1px solid rgba(242, 246, 250, 0.25);color: rgba(242, 246, 250, 0.69);padding: 0px 8px;font-size: 12px;font-weight: 500;border-radius: 8px;margin: 0px 4px;}.tut_text {font-size: 16px;font-weight: 500;color: rgba(242, 246, 250, 1);line-height: 26px;pointer-events: none;}"
document.head.insertAdjacentHTML("beforeend", "<style>" + manual_css + "</style>");


let manual_html = "<div id='man_ui_module'> <div id='man_protection_gradient_soft'></div><p id='tut_help_selection_desktop' class='tut_text'>Hold <span class='keyboard_btn'>CTRL</span> and move mouse to select units</p><p id='tut_help_selection_mobile' class='tut_text'>Tap on units to select them</p><p id='tut_help_move_desktop' class='tut_text'><span class='keyboard_btn'>RIGHT-CLICK</span> to move</p><p id='tut_help_move_mobile' class='tut_text'>Tap anywhere to move</p><p id='tut_help_attack_desktop' class='tut_text'>Attack enemy when you have enough units. Good luck!</p><div id='man_ui_wrap'> <div id='man_select_count' class='man_square_btn'> <div id='man_select_count_swap' class='man_square_btn'><span id='man_f2'>2</span></div><span id='man_f1'>9</span> <div id='man_select_slider_expand'><div id='man_select_slider_expand_val'></div></div><div id='man_select_slider_val'><span id='man_count_current'>8</span></div><div id='man_select_slider_lbls'> <span id='man_count_max'>9</span> <span id='man_count_half'>5</span> <span id='man_count_one'>1</span> </div></div><div id='man_action_group1'> <div id='man_action_harvest' class='man_square_btn'><span class='ico_man_bolt'></span><p class='btn_label'>harvest</p><p id='tut_help_harv'>Get energy from barricade to base<span id='tut_arrow' class='ico_right_arrow'></span></p></div><div id='man_action_special_merge' class='man_square_btn'><span class='ico_man_merge'></span><p class='btn_label'>merge</p></div><div id='man_action_special_divide' class='man_square_btn'><span class='ico_man_divide'></span><p class='btn_label'>divide</p></div><div id='man_action_special_lock' class='man_square_btn'><span class='ico_man_lock'></span><p class='btn_label'>lock</p></div><div id='man_action_special_unlock' class='man_square_btn'><span class='ico_man_unlock'></span><p class='btn_label'>unlock</p></div><div id='man_action_special_explode' class='man_square_btn'><span class='ico_man_explode'></span><p class='btn_label'>explode</p></div><div id='man_action_special_jump' class='man_square_btn'><span class='ico_man_jump'></span><p class='btn_label'>jump</p></div></div><div id='man_action_group2'> <div id='man_action_group_behaviour' class='man_square_btn'><span class='ico_man_chip'></span><p class='btn_label'>behaviour</p></div></div><div id='man_action_done' class='man_square_btn'><span class='ico_man_done'></span></div></div>" 
+ "<div id='man_protection_full_sliding'></div><div id='man_protection_full'><div id='man_protection_gradient'></div></div><div id='man_layer2'> <h3 class='man_head3'>Attitude towards enemies</h3> <div class='man_layer_section' id='man_attitude'> <div id='man_attitude_chase' class='man_layer_option man_option_right'>Chase</div><div id='man_attitude_keepdist' class='man_layer_option man_option_mid man_option_active'>Keep distance</div><div id='man_attitude_nothing' class='man_layer_option man_option_left'>Nothing</div></div><div id='man_attitude_jump' class='man_layer_option man_option_secondary'>Use jump to stay out of range</div><div class='sep_medium'></div><h3 class='man_head3'>Pew enemy targets</h3> <div class='man_layer_section' id='man_targets'> <div id='man_targetting_lowest' class='man_layer_option man_option_right'>Lowest energy</div><div id='man_targetting_nearest' class='man_layer_option man_option_mid'>Nearest</div><div id='man_targetting_nothing' class='man_layer_option man_option_left man_option_active'>Nothing</div></div><div class='sep_medium'></div><h3 class='man_head3'>Move priority</h3> <div class='man_layer_section' id='man_priority'> <div id='man_priority_attitude' class='man_layer_option man_option_right'>Attitude setting</div><div id='man_priority_manual' class='man_layer_option man_option_left man_option_active'>Touch/Mouse</div></div><p class='man_layer_section_desc'>Manual actions overwrite 'Keep distance' attitude</p></div><div id='man_layer2_base'> <h3 class='man_head3'>Newborn's behaviour</h3> <div class='man_layer_section' id='man_newborn'> <div id='man_newborn_harvest' class='man_layer_option man_option_right'>Harvest from nearest barricade</div><div id='man_newborn_goto' class='man_layer_option man_option_left'>Go to position</div></div><div id='man_newborn_where' class='man_layer_option man_option_secondary'>Choose point on board</div></div><h2 class='man_head2' id='man_newborn_point'>Choose point for newborn cats</h2> <div id='man_layer3'> <div id='man_pew_pairing'> <h2 class='man_head2'>Select a <span id='e_pair_barricade'>barricade</span> and <span id='e_pair_structure'>structure</span></h2> <div id='man_action_ui_close' class='man_square_btn'><span class='ico_man_close'></span></div></div></div></div>";
document.getElementById("modules_plate").insertAdjacentHTML('beforeend', manual_html);

//
//







function man_ui_crossroad(e){
	e.stopPropagation();
    e = e || window.event;
    let el = (e.target || e.srcElement);
	//console.log(el.id);
	let b_val = '';
	
	switch (el.id){
	case 'man_action_group_behaviour':
		show_group_options();
		break;
	case 'man_action_harvest':
		pew_pair_selecting();
		break;
	case 'man_protection_full':
		if (base_selection){
			hide_newborn_options();
		} else {
			hide_group_options();
		}
		break;
	case 'man_action_ui_close':
		pew_pair_cancelled();
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
		//console.log('hhh');
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
		//TODO: update local_memory of mergees (now it's only updating the one big cat);
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

// mapping values from one scale to another (used for cat-select slider)
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

function get_group_center(cat_group){
	let temp_sum_x = 0;
	let temp_sum_y = 0;
	for (let spi of cat_group){
		temp_sum_x += spi.position[0];
		temp_sum_y += spi.position[1];
	}
	return [Math.round(temp_sum_x/cat_group.length), Math.round(temp_sum_y/cat_group.length)]
}

function get_closest_cat_id(cat_group, the_point){
	let spi_closest = '';
	let spi_distance = 100000000;
	for (let spi of cat_group){
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
		if (man_distance_within_square(pos, structure.position, 20) && structure.structure_type != 'barricade') clicked_structure = structure.id;
	}
	return clicked_structure;
}

// ------






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

function pew_pair_selecting(){
	pew_pair_selection = true;
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

function pew_pair_cancelled(){
	pew_pair_selection = false;
	pew_pair = {
		structure: '',
		barricade: ''
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
	for (let spi of selected_group){
		if (local_memory['behaviour'][spi.id] == undefined) set_default_behaviour([spi]);
		document.getElementById('man_action_special_explode').style.display = 'block';
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
	man_mobile_cat_selection(touch_point[0], touch_point[1], over_radius);
}

function get_slider_bounding_box(){
	let slider_el_box = document.getElementById('man_select_count').getBoundingClientRect();
	slider_y_100 = slider_el_box.top;
	slider_y_0 = slider_el_box.bottom;
}

function is_base_click(p_x, p_y){ //bases removed
	return false;
}

function man_canvas_click(e){
	let mouse_x = e.clientX;
	let mouse_y = e.clientY;
	let gameboard_x = mouse_x*multiplier - offsetX;
	let gameboard_y = mouse_y*multiplier - offsetY;
	
	//console.log(gameboard_x + ', ' + gameboard_y);
	
	if (newborn_point_selection){
		assign_newborn_behaviour(base_selection, 'goto', [Math.round(gameboard_x), Math.round(gameboard_y)]);
		document.getElementById('man_newborn_point').style.opacity = 0;
		newborn_point_selection = false;
	}
	
	base_selection = false;
	let temp_base = is_base_click(gameboard_x, gameboard_y);
	if (temp_base && !(pew_pair_selection)) {
		base_selection = temp_base;
		get_newborn_behaviour(temp_base);
		show_newborn_options();
		selected_group = [];
		selection_done();
	}
	
	if (pew_pair_selection) man_select_pew_pair(gameboard_x, gameboard_y);
	
	
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
	//console.log('rightclicked');	
	let mouse_x = e.clientX;
	let mouse_y = e.clientY;
	let gameboard_x = mouse_x*multiplier - offsetX;
	let gameboard_y = mouse_y*multiplier - offsetY;
	
	if (selected_group.length > 0){
		assign_behaviour(selected_group, 'move', [Math.round(gameboard_x), Math.round(gameboard_y)]);
		let structure_clicked = get_structure_at_position([Math.round(gameboard_x), Math.round(gameboard_y)])
		if (structure_clicked == false) {
			for (let sp of selected_group) local_memory['behaviour'][sp.id]['obj_pew'] = '';
		} else {
			for (let sp of selected_group) local_memory['behaviour'][sp.id]['obj_pew'] = structure_clicked;
		}
		
		if (guidance_shown[3] == 0 && guidance_shown[2] == 1){
			show_guidance(5);
		}
	}
}

function man_desktop_cat_selection(e){
	if (!(e.metaKey || e.ctrlKey)) return;
	if (behaviour_selection) return;
	//if (pew_pair_selection) return;
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
	
	for (let man_sp of Object.keys(cats)){
		let mm_sp = cats[man_sp];
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
	
	if (selected_group.length > 0){
		selection_invoke();
		if (guidance_shown[0] == 0){
			guidance_shown[0] = 1;
			show_guidance(2);
		} 
	} else {
		selection_done();
	}
	
}

function man_mobile_touchstart(e){
	e = e || window.event;
    let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
    let touch = evt.touches[0] || evt.changedTouches[0];
    touch_point[0] = Math.round(touch.pageX);
    touch_point[1] = Math.round(touch.pageY);
	
	//console.log('start')
	//console.log(touch_point);
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
			assign_behaviour(selected_group, 'move', [Math.round(gameboard_x), Math.round(gameboard_y)]);
			if (guidance_shown[1] != 0){
				show_guidance(5);
			}
		} else {
			man_mobile_cat_selection(touch_point[0], touch_point[1], 80);
		}
		
	}
}

function man_mobile_cat_selection(man_t_x, man_t_y, t_rad = 20){
	if (pew_pair_selection) return;
	if (behaviour_selection) return;
	let temp_selected_group = [];
	for (let man_sp of Object.keys(cats)){
		let mm_sp = cats[man_sp];
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
	if (selected_group.length > 0){
		selection_invoke();
		if (guidance_shown[0] == 0){
			guidance_shown[0] = 1;
			show_guidance(2);
		} else if (guidance_shown[2] == 0 && guidance_shown[1] != 0){
			guidance_shown[2] = 1;
			show_guidance(4);
		} 
	} else {
		selection_done();
	}
	update_labels();
}

function man_desktop_selection_finish(e){
	selection_corners = [0, 0, 0, 0];
	cmd_ctrl_down = false;
	if (e.key != 'Escape' && e.key != "Control") return;
	if (pew_pair_selection) pew_pair_cancelled();
	if (selected_group.length > 0) get_behaviour_selection(selected_group);
	
	if (guidance_shown[2] == 0 && guidance_shown[0] != 0 && guidance_shown[1] != 0){
		guidance_shown[2] = 1;
		show_guidance(4);
	} 
}

function man_desktop_keydown(e){
	if (e.key == 'Escape'){
		if (pew_pair_selection){
			pew_pair_cancelled();
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

function fill_pew_pair(man_type, man_thing){
	if (man_type == 'structure'){
		pew_pair.structure == man_thing ? pew_pair.structure = '' : pew_pair.structure = man_thing;
	}
}

function man_select_pew_pair(man_x, man_y){
	for (let e_s of barricades){
		if (Math.abs(man_x - e_s.position[0]) <= 70 && Math.abs(man_y - e_s.position[1]) <= 70){
			pew_pair.barricade == e_s ? pew_pair.barricade = '' : pew_pair.barricade = e_s;
		}
	}
	
	let e_structure_lbl = document.getElementById('e_pair_structure');
	let e_barricade_lbl = document.getElementById('e_pair_barricade');
	
	pew_pair.structure == '' ? e_structure_lbl.style.opacity = 1 : e_structure_lbl.style.opacity = 0.49;
	pew_pair.barricade == '' ? e_barricade_lbl.style.opacity = 1 : e_barricade_lbl.style.opacity = 0.49;
	
	if (pew_pair.structure != '' && pew_pair.barricade != ''){
		assign_behaviour(selected_group, 'pew_chain', [pew_pair.structure.id, pew_pair.barricade.id]);
		pew_pair_cancelled();
		if (guidance_shown[1] == 0){
			guidance_shown[1] = 1;
			show_guidance(3);
		}
		
		pew_pair = {
			structure: '',
			barricade: ''
		}
	}
	
}

function man_plate_click(e){
	e.stopPropagation();
    e = e || window.event;
    let el = (e.target || e.srcElement);
	//console.log(el.id);
	if (el.id == 'man_attack_base'){
		man_attack(man_selected_cats);
	}
}

//function man_select_cat(x_point, y_point){
//	for (i = 0; i < living_cats.length; i++){
//		if (living_cats[i].hp == 0) continue;
//		if (Math.abs(living_cats[i].position[0] - x_point) <= 5 && Math.abs(living_cats[i].position[1] - y_point) <= 5){
//			//man_selected_cats = [living_cats[i].id];
//		}
//	}
//}

function set_default_behaviour(sp_group = living_cats){
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
			pew_chain: [],
			obj_pew: ''
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
		//console.log(beh_newborn.position.length);
		document.getElementById('man_newborn_where').classList.add('man_option_active');
		document.getElementById('man_newborn_where').innerHTML = beh_newborn.position;
	}
}

function man_attitude(selected_val){
	//console.log('attitude = ' + selected_val);
	document.getElementById('man_attitude_nothing').classList.remove('man_option_active');
}


function assign_behaviour(cat_group, beh_type, beh_value){
	//cat_group is an array of ids
	if (assignment_tick == active_block){
		
	} else {
		assignment_tick = active_block;
		client['behaviour'] = [];
	}
	
	if (beh_type == 'attitude_jump') beh_value = beh_value - local_memory['behaviour'][cat_group[0].id]['attitude_jump'];
	
	for (let sp of cat_group){
		if (local_memory['behaviour'][sp.id] === undefined) local_memory['behaviour'][sp.id] = {};
		local_memory['behaviour'][sp.id][beh_type] = beh_value;
		client['behaviour'].push([sp.id, beh_type, beh_value]);
		if (beh_type == 'move'){
			if (!man_distance_within_square(local_memory['behaviour'][sp.id]['move'], sp.position, 20)){
				document.getElementById('man_action_special_jump').style.display = 'block';
			} else {
				document.getElementById('man_action_special_jump').style.display = 'none';
			}
			local_memory['behaviour'][sp.id]['pew_chain'] = [];
		}
		if (beh_type == 'jump') local_memory['behaviour'][sp.id]['jump'] = 0;
		if (beh_type == 'pew_chain'){
			local_memory['behaviour'][sp.id]['move'] = [];
		}
		if (beh_type == 'merge' && beh_value == ''){
			local_memory['behaviour'][sp.id]['move'] = [];
		}
		//console.log('stored');
	}	
	// update_code(); not needed, using channels now
	try {
		sendData("MANUALUI", client)
	} catch (e) {
		
	}
	update_code();
}

function assign_newborn_behaviour(base_id, beh_value, beh_position = []){
	client['newborn_' + base_id] = [beh_value, beh_position];
	//console.log('base_id = ' + base_id);
	//console.log('beh_val = ' + beh_value);
	//console.log('beh_position = ' + beh_position);
	local_memory['newborn_' + base_id].role = beh_value;
	if (beh_position.length != 0) local_memory['newborn_' + base_id].position = beh_position;
	// update_code(); not needed, using channels now
	try {
		sendData("MANUALUI", client)
	} catch (e) {
		
	}
	update_code();
}

function choose_newborn_point(){
	newborn_point_selection = true;
	document.getElementById('man_newborn_where').classList.add('man_option_active');
	document.getElementById('man_newborn_point').style.opacity = 1;
	newborn_point();
}

function man_attack(attackers){
	//console.log('attackers = ');
	//console.log(attackers);
	//client['attacking'] = man_selected_cats;
	// update_code(); not needed, using channels now
	try {
		sendData("MANUALUI", client)
	} catch (e) {
		
	}
	update_code();
}


function merge_group(grp){
	let center_point = get_group_center(grp);
	let the_one = get_closest_cat_id(grp, center_point);
	assign_behaviour(grp, 'merge', the_one);
	assign_behaviour(grp, 'move', center_point);
}


// tutorial

function reset_tut(){
	try {
		document.getElementById('tut_help_selection_desktop').style.opacity = 0;
		document.getElementById('tut_help_selection_mobile').style.opacity = 0;
		document.getElementById('tut_help_move_desktop').style.opacity = 0;
		document.getElementById('tut_help_move_mobile').style.opacity = 0;	
		
		//document.getElementById('tut_help_attack_desktop').style.opacity = 0;
	} catch (e) {
		//console.log(e)
	}
	
}

function show_guidance(guide_num){
	reset_tut();
	if (tick_counter > 500) return;
	if (guidance_shown[4] == 1) return;
	switch (guide_num){
		case 1:
			document.getElementById('tut_help_selection_desktop').style.opacity = 1;
			document.getElementById('tut_help_selection_mobile').style.opacity = 1;
			break;
		case 2:
			//document.getElementById('tut_help_harv').style.opacity = 1;
			break;
		case 3:
			document.getElementById('tut_help_harv').style.opacity = 0;
			break;
		case 4:
			document.getElementById('tut_help_move_desktop').style.opacity = 1;
			document.getElementById('tut_help_move_mobile').style.opacity = 1;	
			break;
		case 5:
			document.getElementById('tut_help_attack_desktop').style.opacity = 1;
			setTimeout(show_guidance(6), 3000);
			break;
		case 6:
			guidance_shown[4] = 1;
			anime({
				targets: '#tut_help_attack_desktop',
				opacity: 0,
				easing: 'easeOutQuad',
				delay: 3000,
				duration: 600
			});
			break;
		default:
			break;
	}
}





//module_draw['man_selected_cats'] = function() {
//	for (let i = 0; i < man_selected_cats.length; i++){
//		//console.log('rendering around cat ' + man_selected_cats[i]);
//		let cat_x = cats[man_selected_cats[i]].position[0];
//		let cat_y = cats[man_selected_cats[i]].position[1];
//		let cat_size = cats[man_selected_cats[i]].size;
//		let color_parts = cats[man_selected_cats[i]].color.match(/[.?\d]+/g);
//		c.beginPath();
//		c.arc(cat_x, cat_y, cat_size + 5, Math.PI * 0, Math.PI * 2, false);
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
		//console.log('rendering around cat ' + selected_group[i]);	
		let move_dest = local_memory['behaviour'][selected_group[i].id]['move'];
		
		
		let color_parts = selected_group[i].color.match(/[.?\d]+/g);
		let stroke_color = cmd_ctrl_down ? 'rgba(94, 245, 255, 0.89)' : 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.72 + ')';
		let move_color = 'rgba(94, 245, 255, 0.44)';
		let charge_color = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.20 + ')';
		let line_dash_ptrn = 2 + Math.abs(-3 + Math.floor(dumb_cycler / 10));
		man_draw_circle(selected_group[i].position, 25, 1, stroke_color);
		if (move_dest.length > 0){
			man_draw_line(selected_group[i].position, move_dest, move_color, line_dash_ptrn);
			man_draw_cross(move_dest, move_color);
		}
		
	}	
	if (selected_group.length > 0){
		let chained = local_memory['behaviour'][selected_group[0].id]['pew_chain'];
		let target_structure = local_memory['behaviour'][selected_group[0].id]['obj_pew'];
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

module_draw['man_pew_pair_selection'] = function () {
	if (!pew_pair_selection) return;
	
	for (let man_s of barricades){
		man_draw_circle(man_s.position, 50, 2, 'rgba(144, 118, 255, 0.49)', 'rgba(144, 118, 255, 0.04)', true);
	}
	
	if (pew_pair.structure != '') man_draw_circle(pew_pair.structure.position, 50, 2, 'rgba(164, 138, 255, 0.96)', 'rgba(164, 138, 255, 0.08)', true);
	if (pew_pair.barricade != '') man_draw_circle(pew_pair.barricade.position, 50, 2, 'rgba(164, 138, 255, 0.96)', 'rgba(164, 138, 255, 0.08)', true);
}

module_draw['man_base_selection'] = function() {
	return;
}


// Client memory object duplicates what this script is storing into the server memory object.
// This is used purely for rendering graphics to help the user understand what's going on.
let local_memory = {
	behaviour: {},
};

if (typeof client === 'undefined') var client = {};
client['behaviour'] = [];
// newborn base data removed (bases removed from game)


//local_memory['behaviour']['sp_id'] = {
//	move: [],
//  jump: [],
//	pew_chain: [],
//	attitude: 'nothing',
//	targetting: 'nearest',
//	action_priority: 'manual',
//	merge: [],
//	divide: 0,
//	explode: 0,
//	lock: 0,
//  obj_pew: ''	
//}

const touch_input = matchMedia('(hover: none)').matches;

let man_selected_cats = [];
let slider_el = document.getElementById('man_select_count');
let slider_val_el = document.getElementById('man_select_slider_val');
let slider_val_over_el = document.getElementById('man_select_slider_expand_val');
let slider_y_100 = 0;
let slider_y_0 = 0;
let sliding = false;

//currently selected cats
let select_current_amount = 0;
let selected_group = [];
let temp_selected_group = []; //used during sliding
let selected_sub_group = [];

//cats in the swap group
let swap_group = [];
let temp_swap_group = []; //used during sliding

//temp value while sliding;
let slider_changing_amount = 0;
let bg_helper = false; //not important, just a visual thing for slider over max
let over_radius = 0; //rendering selection circle

//total amount of selectable cats within the current group (TODO: better explanation)
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

//4 corner coordinates for cat selection ([x1, y1, x2, y2])
let selection_corners = [0, 0, 0, 0]

//other useful flags and vars
let this_player = getCookie('user_id');
let pew_pair_selection = false;
let pew_pair = {
	structure: '',
	barricade: '',
};
let behaviour_selection = false;
let base_selection = false;
let newborn_point_selection = false; //selecting a point on map where newborn cats should go
let assignment_tick = 0; //for stacking multiple commands in the same tick
let guidance_shown = [0, 0, 0, 0, 0] //prepared as flags for onboarding/tutorial guidance

//set base and cat default behaviour - change this to better suit your playing style
set_default_behaviour();
set_newborn_default();

setTimeout(() => {
  if (tick_counter < 10 && tick_counter >= 0) show_guidance(1);
}, 1000)


//let attack_btn = document.createElement('div');
//attack_btn.innerHTML = "<span id='man_attack_base' style='display: block; width: 100%; height: 100%; background-color: #f00;'></span>";
//attack_btn.style.cssText = 'position:absolute; top: 50%; right: 28px; width:52px; height:52px; opacity:1; z-index:100;';
//document.getElementById('modules_plate').appendChild(attack_btn);
//
//


//event handlers
document.getElementById('base_canvas').addEventListener("click", man_canvas_click, false);
document.getElementById('base_canvas').addEventListener("contextmenu", man_canvas_rightclick, false);
document.getElementById('base_canvas').addEventListener("mousemove", man_desktop_cat_selection, false);
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
	//console.log('works');
	swap_array(selected_group, swap_group);
	select_current_amount = selected_group.length;
	swap_amount = swap_group.length;
	update_labels();
}, false);


// Send manual ui data for every tick
try {
	sendData("MANUALUI", client)
} catch (e) {
	
}
// document.addEventListener('chan', (e) => {
//   sendData("MANUALUI", client)
// });









//html:

/*
    <div id='man_ui_module'>
  		<div id='man_protection_gradient_soft'></div>
		<p id='tut_help_selection_desktop' class='tut_text'>Hold <span class='keyboard_btn'>CTRL</span> and move mouse to select units</p>
		<p id='tut_help_selection_mobile' class='tut_text'>Tap on units to select them</p>
		<p id='tut_help_move_desktop' class='tut_text'><span class='keyboard_btn'>RIGHT-CLICK</span> to move</p>
		<p id='tut_help_move_mobile' class='tut_text'>Tap anywhere to move</p>
		<p id='tut_help_attack_desktop' class='tut_text'>Attack enemy when you have enough units. Good luck!</p>
    	<div id='man_ui_wrap'>
  		<div id='man_select_count' class='man_square_btn'>
  			<div id='man_select_count_swap' class='man_square_btn'><span id='man_f2'>2</span></div>
  			<span id='man_f1'>9</span>
  			<div id='man_select_slider_expand'><div id='man_select_slider_expand_val'></div></div>
  			<div id='man_select_slider_val'><span id='man_count_current'>8</span></div>
  			<div id='man_select_slider_lbls'>
  				<span id='man_count_max'>9</span>
  				<span id='man_count_half'>5</span>
  				<span id='man_count_one'>1</span>
  			</div>
  		</div>
  		<div id='man_action_group1'>
  			<div id='man_action_harvest' class='man_square_btn'><span class='ico_man_bolt'></span><p class='btn_label'>harvest</p><p id='tut_help_harv'>Start harvesting from the barricade to the base <span id='tut_arrow' class='ico_right_arrow'></span></p></div>
  			<div id='man_action_special_merge' class='man_square_btn'><span class='ico_man_merge'></span><p class='btn_label'>merge</p></div>
  			<div id='man_action_special_divide' class='man_square_btn'><span class='ico_man_divide'></span><p class='btn_label'>divide</p></div>
  			<div id='man_action_special_lock' class='man_square_btn'><span class='ico_man_lock'></span><p class='btn_label'>lock</p></div>
  			<div id='man_action_special_unlock' class='man_square_btn'><span class='ico_man_unlock'></span><p class='btn_label'>unlock</p></div>
  			<div id='man_action_special_explode' class='man_square_btn'><span class='ico_man_explode'></span><p class='btn_label'>explode</p></div>
  			<div id='man_action_special_jump' class='man_square_btn'><span class='ico_man_jump'></span><p class='btn_label'>jump</p></div>
  		</div>
  		<div id='man_action_group2'>
  			<div id='man_action_group_behaviour' class='man_square_btn'><span class='ico_man_chip'></span><p class='btn_label'>behaviour</p></div>
  		</div>
  		<div id='man_action_done' class='man_square_btn'><span class='ico_man_done'></span></div>
  	</div>
  	<div id='man_protection_full_sliding'></div>
  	<div id='man_protection_full'><div id='man_protection_gradient'></div></div>
  	<div id='man_layer2'>
  		<h3 class='man_head3'>Attitude towards enemies</h3>
  		<div class='man_layer_section' id='man_attitude'>
  			<div id='man_attitude_chase' class='man_layer_option man_option_right'>Chase</div>
  			<div id='man_attitude_keepdist' class='man_layer_option man_option_mid man_option_active'>Keep distance</div>
  			<div id='man_attitude_nothing' class='man_layer_option man_option_left'>Nothing</div>
  		</div>
  		<div id='man_attitude_jump' class='man_layer_option man_option_secondary'>Use jump to stay out of range</div>
		
  		<div class='sep_medium'></div>
		
  		<h3 class='man_head3'>Pew enemy targets</h3>
  		<div class='man_layer_section' id='man_targets'>
  			<div id='man_targetting_lowest' class='man_layer_option man_option_right'>Lowest energy</div>
  			<div id='man_targetting_nearest' class='man_layer_option man_option_mid'>Nearest</div>
  			<div id='man_targetting_nothing' class='man_layer_option man_option_left man_option_active'>Nothing</div>
  		</div>
		
  		<div class='sep_medium'></div>
		
  		<h3 class='man_head3'>Move priority</h3>
  		<div class='man_layer_section' id='man_priority'>
  			<div id='man_priority_attitude' class='man_layer_option man_option_right'>Attitude setting</div>
  			<div id='man_priority_manual' class='man_layer_option man_option_left man_option_active'>Touch/Mouse</div>
  		</div>
  		<p class='man_layer_section_desc'>Manual actions overwrite 'Keep distance' attitude</p>
  	</div>
  	<div id='man_layer2_base'>
  		<h3 class='man_head3'>Newborn's behaviour</h3>
  		<div class='man_layer_section' id='man_newborn'>
  			<div id='man_newborn_harvest' class='man_layer_option man_option_right'>Harvest from nearest barricade</div>
  			<div id='man_newborn_goto' class='man_layer_option man_option_left'>Go to position</div>
  		</div>
  		<div id='man_newborn_where' class='man_layer_option man_option_secondary'>Choose point on board</div>
  	</div>
  	<h2 class='man_head2' id='man_newborn_point'>Choose point for newborn cats</h2>
  	<div id='man_layer3'>
  		<div id='man_pew_pairing'>
  			<h2 class='man_head2'>Select a <span id='e_pair_barricade'>barricade</span> and <span id='e_pair_structure'>structure</span></h2>
  			<div id='man_action_ui_close' class='man_square_btn'><span class='ico_man_close'></span></div>
  		</div>
  	</div>
    </div>

*/


