
function start_engine(){
	store_state();
	boxsand_engine = new Worker("../boxsand-engine.js");
	
	pla1 = players['player1'];
	pla2 = players['player2'];
	
	//animations.js
	start_boxsand()
	
	//rendering3.js
	initiate_from_sandbox();
	
	let cunt = 3;
	if (boxsanded['pl1'] == 'live-input' || boxsanded['pl2'] == 'live-input'){
		cunt = 2;
		document.getElementById('panel').style.display = 'block';
		document.getElementById('update_switch_wrapper').style.display = 'block'
	    document.getElementById('update_switch_wrapper').classList.add('update_switch_wrapper_real');
	    document.getElementById('update_code').classList.add('update_code_real');
	    document.getElementById('shortcut_info').classList.add('shortcut_info_real');
	}
	document.getElementById('stop_bs').style.display = 'block';
	
	boxsand_engine.postMessage({
		meta: 'initiate',
		meta2: cunt, //countdown
		boxsanded: boxsanded,
		tick_rate: game_tick,
		code_pl1: 'code1',
		code_pl2: 'code2'
	});
	
	boxsand_engine.onmessage = function(e) {
		if (e.data.meta == 'rendering'){
			live_render = 1;
			render_world(e.data.incoming);
			update_console(e.data.incoming, e.data.chan);
		}
	}
}

function stop_engine(){
	stop_boxsand();
	live_render = 0;
	document.getElementById('panel').style.display = 'none';
	document.getElementById('update_switch_wrapper').style.display = 'none';
	
	boxsand_engine.postMessage({
		meta: 'stop'
	})
}

function update_code(){
  update_success();
  user_code = ' ' + editor.getValue();
  localStorage.setItem("code_code", user_code);
  boxsand_engine.postMessage({
	  meta: 'live-input',
	  code_string: "client[ttick] = " + JSON.stringify(client) + "\n " + user_code + "\n"
  });
}

function render_world(dat){
	incoming = dat;
	tick_counter = incoming.t;

	if (tick_counter < 0) return;

	game_blocks['t' + tick_counter] = {
		'p1': {},
		'p2': {},
		'e': [],
		's': [],
		'a': [],
		'units': [],
		'g1': [],
		'g2': []
	}

	for (var i = 0; i < incoming.p1.length; i++){
		var spir_id = incoming.pl1 + '_' + incoming.p1[i][0];
		game_blocks['t' + tick_counter].p1[spir_id] = [incoming.p1[i][1], incoming.p1[i][2], incoming.p1[i][3]];
		game_blocks['t' + tick_counter].units.push(spir_id);

		if (cats[spir_id] == undefined && players['player1'] != undefined){
			create_cat_p1(spir_id);
		}

		var oldLoc = [0, 0];
		var newLoc = game_blocks['t' + tick_counter].p1[spir_id][0];
		var oldEnergy = game_blocks['t' + tick_counter].p1[spir_id][1];

		if (game_blocks['t' + (tick_counter - 1)] != undefined && game_blocks['t' + (tick_counter - 1)].p1 != undefined && game_blocks['t' + (tick_counter - 1)].p1[spir_id] != undefined){
			oldLoc = game_blocks['t' + (tick_counter - 1)].p1[spir_id][0];
			oldEnergy = game_blocks['t' + (tick_counter - 1)].p1[spir_id][1];
		} else {
			oldLoc = [newLoc[0], newLoc[1]];
		}

		game_blocks['t' + tick_counter].p1[spir_id][0][2] = newLoc[0] - oldLoc[0];
		game_blocks['t' + tick_counter].p1[spir_id][0][3] = newLoc[1] - oldLoc[1];
		game_blocks['t' + tick_counter].p1[spir_id][0][4] = oldLoc[0];
		game_blocks['t' + tick_counter].p1[spir_id][0][5] = oldLoc[1];
		game_blocks['t' + tick_counter].p1[spir_id][3] = oldEnergy;
	}

	for (var j = 0; j < incoming.p2.length; j++){
		var spir_id = incoming.pl2 + '_' + incoming.p2[j][0];
		game_blocks['t' + tick_counter].p2[spir_id] = [incoming.p2[j][1], incoming.p2[j][2], incoming.p2[j][3]];
		game_blocks['t' + tick_counter].units.push(spir_id);

		if (cats[spir_id] == undefined && players['player2'] != undefined){
			create_cat_p2(spir_id);
		}

		var oldLoc = [0, 0];
		var newLoc = game_blocks['t' + tick_counter].p2[spir_id][0];
		var oldEnergy = game_blocks['t' + tick_counter].p2[spir_id][1];

		if (game_blocks['t' + (tick_counter - 1)] != undefined && game_blocks['t' + (tick_counter - 1)].p2 != undefined && game_blocks['t' + (tick_counter - 1)].p2[spir_id] != undefined){
			oldLoc = game_blocks['t' + (tick_counter - 1)].p2[spir_id][0];
			oldEnergy = game_blocks['t' + (tick_counter - 1)].p2[spir_id][1];
		} else {
			oldLoc = [newLoc[0], newLoc[1]];
		}

		game_blocks['t' + tick_counter].p2[spir_id][0][2] = newLoc[0] - oldLoc[0];
		game_blocks['t' + tick_counter].p2[spir_id][0][3] = newLoc[1] - oldLoc[1];
		game_blocks['t' + tick_counter].p2[spir_id][0][4] = oldLoc[0];
		game_blocks['t' + tick_counter].p2[spir_id][0][5] = oldLoc[1];
		game_blocks['t' + tick_counter].p2[spir_id][3] = oldEnergy;
	}

	game_blocks['t' + tick_counter]['e'] = incoming.e;
	game_blocks['t' + tick_counter]['s'] = incoming.s;
	game_blocks['t' + tick_counter]['a'] = incoming.a;
	game_blocks['t' + tick_counter]['cr'] = incoming.cr;

	active_block = 't' + tick_counter;
	tick_local = tick_counter;
	total_time = 0;
}

	  
function set_stage(){
  scale = 1;
  prevScale = scale;
  multiplier = 1 / scale;
  
  //top indexes (s = p1, q = p2)
  let top_s = 0;
  let top_q = 0;
  
  
  let brow_width = window.innerWidth || document.documentElement.clientWidth || 
document.body.clientWidth;
  let brow_height = window.innerHeight || document.documentElement.clientHeight || 
document.body.clientHeight;


  offsetX = brow_width / 2;
  offsetY = brow_height / 2;
  
  game_blocks[active_block] = {
	 'p1': {},
	 'p2': {},
	 'e': [],
	 's': [],
	 'st': [100, 100, 100, 100],
	 'units': [],
	 'g1': [],
	 'g2': [],
	 'start_tick': start_tick
  }
  
  //
  // fill p1 and p2
  //
  
  players['player1'] = boxsanded['pl1'];
  players['player2'] = boxsanded['pl2'];
  colors['color1'] = col1;
  colors['color2'] = col2;
  
  if (players['player1'] == 'live-input' && players['player2'] == 'live-input') bs_error('You can control only one player with live input');
  if (players['player1'] == players['player2']) players['player2'] += '2';
  
  if (boxsanded['p1_def']){
	  fill_defaults(0);
  } else {
	  game_blocks[active_block]['p1'] = {};
	  for (let s = 0; s<boxsanded['p1_units'].length; s++){
		  let spi = boxsanded['p1_units'][s]; 
		  game_blocks[active_block]['p1'][players['player1'] + '_' + spi[0]] = [spi[1], spi[2], spi[3], spi[2]];
	  }
  }
  
  if (boxsanded['p2_def']){
	  fill_defaults(1);
  } else {
  	  game_blocks[active_block]['p2'] = {};
	  for (let q = 0; q<boxsanded['p2_units'].length; q++){
		  let spi = boxsanded['p2_units'][q]; 
		  game_blocks[active_block]['p2'][players['player2'] + '_' + spi[0]] = [spi[1], spi[2], spi[3], spi[2]];
	  }
  }
  
  
  barricades = boxsanded['barricades'] || [];
  pods = boxsanded['pods'] || [];

  let all_sp1 = game_blocks[active_block]['p1'];
  let all_sp2 = game_blocks[active_block]['p2'];
  
  for (let bi = 0; bi < barricades.length; bi++){
	  draw_barricade(barricades[bi]);
  }
  for (let pi = 0; pi < pods.length; pi++){
	  draw_pod(pods[pi]);
  }
  
  for (let sp_id of Object.keys(all_sp1)) {
	  cats[sp_id] = new Cat(sp_id, all_sp1[sp_id][0], all_sp1[sp_id][1], players['player1'], col1, all_sp1[sp_id][2]);
	  game_blocks[active_block].units.push(sp_id);
  }
  
  for (let sp_id of Object.keys(all_sp2)) {
	  cats[sp_id] = new Cat(sp_id, all_sp2[sp_id][0], all_sp2[sp_id][1], players['player2'], col2, all_sp2[sp_id][2]);
	  game_blocks[active_block].units.push(sp_id);
  }
  
  render_state();
  offsetUpdate();
  
}

function update_stage(){
  delete_all_cats();
  living_cats = [];
  players['player1'] = boxsanded['pl1'];
  players['player2'] = boxsanded['pl2'];
  if (players['player1'] == players['player2']) players['player2'] += '2';
  
  
  
  if (boxsanded['p1_def']){
	  fill_defaults(0);
  } else {
	  game_blocks[active_block]['p1'] = {};
	  for (let s = 0; s<boxsanded['p1_units'].length; s++){
		  let spi = boxsanded['p1_units'][s]; 
		  game_blocks[active_block]['p1'][players['player1'] + '_' + spi[0]] = [spi[1], spi[2], spi[3], spi[2]];
	  }
  }
  if (boxsanded['p2_def']){
	  fill_defaults(1);
  } else {
  	  game_blocks[active_block]['p2'] = {};
	  for (let q = 0; q<boxsanded['p2_units'].length; q++){
		  let spi = boxsanded['p2_units'][q]; 
		  game_blocks[active_block]['p2'][players['player2'] + '_' + spi[0]] = [spi[1], spi[2], spi[3], spi[2]];
	  }
  }
  
  //generate cats objects
  
  let all_sp1 = game_blocks[active_block]['p1'];
  let all_sp2 = game_blocks[active_block]['p2'];
  
  for (let sp_id of Object.keys(all_sp1)) {
  	  cats[sp_id] = new Cat(sp_id, all_sp1[sp_id][0], all_sp1[sp_id][1], players['player1'], col1, all_sp1[sp_id][2]);
  	  game_blocks[active_block].units.push(sp_id);
  }
  
  for (let sp_id of Object.keys(all_sp2)) {
  	  cats[sp_id] = new Cat(sp_id, all_sp2[sp_id][0], all_sp2[sp_id][1], players['player2'], col2, all_sp2[sp_id][2]);
  	  game_blocks[active_block].units.push(sp_id);
  }
}

function delete_all_cats(){
  game_blocks[active_block].units = [];
  for (let ds in cats){
	  delete cats[ds];
  }
}

function fill_defaults(pl2 = 1){
  let start_num_cats = 9;
  
  if (pl2 == 0){
	  boxsanded['p1_units'] = [];
	  game_blocks[active_block]['p1'] = {};
	  for (let s = 1; s <= start_num_cats; s++){
		  let y = -100 + (s - 1) * 25;
		  game_blocks[active_block]['p1'][players['player1'] + '_' + s] = [[-200, y], 10, 1, 10];
		  boxsanded['p1_units'].push([s, [-200, y], 10, 1]);
		  
		  let newLoc = game_blocks[active_block].p1[players['player1'] + '_' + s][0];
		  let oldEnergy = game_blocks[active_block].p1[players['player1'] + '_' + s][1];
		  game_blocks[active_block].p1[players['player1'] + '_' + s][0][2] = 0;
		  game_blocks[active_block].p1[players['player1'] + '_' + s][0][3] = 0;
		  game_blocks[active_block].p1[players['player1'] + '_' + s][0][4] = newLoc[0];
		  game_blocks[active_block].p1[players['player1'] + '_' + s][0][5] = newLoc[1];
		  game_blocks[active_block].p1[players['player1'] + '_' + s][3] = oldEnergy;
		  
	  }
  } else if (pl2 == 1){
	  boxsanded['p2_units'] = [];
	  game_blocks[active_block]['p2'] = {};
	  for (let q = 1; q <= start_num_cats; q++){
		  let y = -100 + (q - 1) * 25;
		  game_blocks[active_block]['p2'][players['player2'] + '_' + q] = [[200, y], 10, 1, 10];
		  boxsanded['p2_units'].push([q, [200, y], 10, 1]);
		  
		  let newLoc = game_blocks[active_block].p2[players['player2'] + '_' + q][0];
		  let oldEnergy = game_blocks[active_block].p2[players['player2'] + '_' + q][1];
		  game_blocks[active_block].p2[players['player2'] + '_' + q][0][2] = 0;
		  game_blocks[active_block].p2[players['player2'] + '_' + q][0][3] = 0;
		  game_blocks[active_block].p2[players['player2'] + '_' + q][0][4] = newLoc[0];
		  game_blocks[active_block].p2[players['player2'] + '_' + q][0][5] = newLoc[1];
		  game_blocks[active_block].p2[players['player2'] + '_' + q][3] = oldEnergy;
	  }
  }
}

function store_state(){
  sessionStorage.setItem('boxsand_state', JSON.stringify(boxsanded));
}

function reset_to_def(){
	boxsanded['p1_def'] = 1;
	boxsanded['p2_def'] = 1;
	
	update_stage();
	document.getElementById('bs_load_prev').style.display = 'none';
}

function pick_pl1(){
  bs_player_selection();
  currently_picking = 'pl1';
  document.getElementById('ps_pl_lbl').innerHTML = "Player 1";
  get_pick_state('pl1');
}

function pick_pl2(){
  bs_player_selection();
  currently_picking = 'pl2';
  document.getElementById('ps_pl_lbl').innerHTML = "Player 2";
  get_pick_state('pl2');
}

function get_pick_state(pl){
  reset_pl_sel();
  reset_bot_sel();
  reset_upload_name();
  
  set_sel(pl, 'ps_' + boxsanded[pl]);
}

function reset_pl_sel(){
  document.getElementById('ps_live-input').classList.remove('card_active');
  document.getElementById('ps_upload-bot').classList.remove('card_active');
}

function reset_upload_name(){
	document.getElementById('bot_file_name').innerHTML = "Upload your bot";
}

function reset_bot_sel(){
  document.getElementById('ps_dumb-bot').classList.remove('card_active');
  document.getElementById('ps_medium-bot').classList.remove('card_active');
  document.getElementById('ps_hard-bot').classList.remove('card_active');
  document.getElementById('ps_lego-bot').classList.remove('card_active');
  document.getElementById('ps_andersgee-bot').classList.remove('card_active');
}

function set_sel(pl, elname){
  reset_pl_sel();
  reset_bot_sel();
  document.getElementById(elname).classList.add('card_active');
  
  if (!elname.includes("_")) return;

  el_option = elname.split("_")[1];
  //console.log('elopt ' + el_option);
  boxsanded[pl] = el_option;
  
  if (el_option == 'live-input') el_option = "You";
  let plnumtext = "Player 1";
  if (pl == 'pl2') plnumtext = "player 2"
	  
  if (el_option == 'upload-bot'){
	  if (boxsanded[pl + '_uploaded_name'] == ''){
		  el_option = 'no file';
		  document.getElementById('bot_file_name').innerHTML = "Upload your bot";
	  } else {
	  	  el_option = boxsanded[pl + '_uploaded_name'];
		  document.getElementById('bot_file_name').innerHTML = el_option;
	  }
  }	  
	  
  document.getElementById('bs_' + pl + '_name').innerHTML = "<span class='lowlight'>" + plnumtext + " · </span>" + el_option;
  
}

function set_ele(ele){
  document.getElementById('bs_placing_pl1').classList.remove('ele_active');
  document.getElementById('bs_placing_pl2').classList.remove('ele_active');
  
  document.getElementById('bs_placing_' + ele).classList.add('ele_active');
}


function player_selection_crossroad(e){
  e = e || window.event;
  let el = (e.target || e.srcElement);
  
  switch (el.id){
  	case 'ps_live-input':
	case 'ps_upload-bot':
	case 'ps_dumb-bot':
  	case 'ps_medium-bot':
	case 'ps_hard-bot':
	case 'ps_andersgee-bot':
	case 'ps_lego-bot':
		set_sel(currently_picking, el.id);
		break;
	case '':
	case 'ps_bot_options':
	case 'ps_main_options':
	case 'player_selection_wrap':
		update_stage();
		dismissals();
		break;
	case 'upload_bot_box':
		break;
	default:
		break;
  }
  
}

function element_selection_crossroad(e){
  e = e || window.event;
  let el = (e.target || e.srcElement);
  
  switch (el.id){
	  case 'bs_placing_pl1':
	  case 'bs_ele_pl1':
		  set_ele('pl1');
		  currently_placing = 'pl1';
		  break;
	  case 'bs_placing_pl2':
	  case 'bs_ele_pl2':
		  set_ele('pl2');
		  currently_placing = 'pl2';
		  break;
	  default:
		  break;
  }
}

function canvas_down(e){
	e = e || window.event;
	if (e.which === 3) return;
	let mouse_x = e.clientX;
    let mouse_y = e.clientY;
    let gameboard_x = mouse_x*multiplier - offsetX;
	let gameboard_y = mouse_y*multiplier - offsetY;
	
	mmmx = mouse_x;
	mmmy = mouse_y;
}

function canvas_up(e){
	let mouse_x = e.clientX;
    let mouse_y = e.clientY;
    let gameboard_x = mouse_x*multiplier - offsetX;
	let gameboard_y = mouse_y*multiplier - offsetY;
	
	if (Math.abs(mouse_x - mmmx) <= 2 && Math.abs(mouse_y - mmmy) <= 2){
		place_element([gameboard_x, gameboard_y]);
	}
	
	mmmx = 0;
	mmmy = 0;
}

function place_element(loc){
	if (live_render == 1) return;
	if (shift_active){
		delete_element(loc);
		return;
	}
	
	let pla_num = '1';
	if (currently_placing == 'pl2') pla_num = '2';
	
	boxsanded['p' + pla_num + '_def'] = 0;
	document.getElementById('bs_load_prev').style.display = 'block';
	
	let highest = 0;
	highest = get_highest_cat('p' + pla_num);
	
	let spnum = highest + 1;
	let sp_id = players['player' + pla_num] + '_' + spnum;
	
    game_blocks[active_block]['p' + pla_num][sp_id] = [loc, 100, 1, 100];
    boxsanded['p' + pla_num + '_units'].push([spnum, loc, 100, 1]);
	
	cats[sp_id] = new Cat(sp_id, loc, 100, players['player' + pla_num], colors['color' + pla_num], 1);
	cats[sp_id].position = [loc[0], loc[1], 0, 0, loc[0], loc[1]];
	game_blocks[active_block].units.push(sp_id);
	
}


function delete_element(loc){
	boxsanded['p1_def'] = 0;
	boxsanded['p2_def'] = 0;
    let all_sp1 = game_blocks[active_block]['p1'];
    let all_sp2 = game_blocks[active_block]['p2'];
	
	for (let sp_id of Object.keys(all_sp1)){
		let sp = cats[sp_id];
		if (max_abs_dist(sp.position, loc) <= 10) {
			game_blocks[active_block]['units'] = game_blocks[active_block]['units'].filter(e => e != sp_id);
			boxsanded['p1_units'] = boxsanded['p1_units'].filter(e => max_abs_dist(e[1], loc) > 10);
			living_cats = living_cats.filter(e => max_abs_dist(e.position, loc) > 10);
			delete game_blocks[active_block]['p1'][sp_id];
			delete cats[sp_id];
		}
	}
	
	for (let sp_id of Object.keys(all_sp2)){
		let sp = cats[sp_id];
		if (max_abs_dist(sp.position, loc) <= 10) {
			game_blocks[active_block]['units'] = game_blocks[active_block]['units'].filter(e => e != sp_id);
			boxsanded['p2_units'] = boxsanded['p2_units'].filter(e => max_abs_dist(e[1], loc) > 10);
			living_cats = living_cats.filter(e => max_abs_dist(e.position, loc) > 10);
			delete game_blocks[active_block]['p2'][sp_id];
			delete cats[sp_id];
		}
	}
}

function check_shift(e){
	if (e.shiftKey) shift_active = 1;
}

function max_abs_dist(loc1, loc2){
	return Math.max(Math.abs(loc2[0] - loc1[0]), Math.abs(loc2[1] - loc1[1]));
}

function get_highest_cat(pl_short){
	let arr = boxsanded[pl_short + '_units'];
	return arr[arr.length - 1][0];
}

function reset_tick_ui(){
  document.getElementById('tick_05').classList.remove('tick_rate_active');
  document.getElementById('tick_1').classList.remove('tick_rate_active');
  document.getElementById('tick_2').classList.remove('tick_rate_active');
  document.getElementById('tick_3').classList.remove('tick_rate_active');
}

function tick_rate_select(e){
  	e = e || window.event;
	var el_id = (e.target || e.srcElement).id;
	//console.log(el_id);

	switch (el_id){
		case 'tick_05':
			reset_tick_ui();
			document.getElementById("tick_sec_desc").innerHTML = "1 tick = <span class='highlight'>1000ms</span>";
			document.getElementById("tick_05").classList.add("tick_rate_active");
			game_tick = "1000";
			break;
		case "tick_1":
			reset_tick_ui();
			document.getElementById("tick_sec_desc").innerHTML = "1 tick = <span class='highlight'>500ms</span>";
			document.getElementById("tick_1").classList.add("tick_rate_active");
			game_tick = "600";
			break;
		case "tick_2":
			reset_tick_ui();
			document.getElementById("tick_sec_desc").innerHTML = "1 tick = <span class='highlight'>250ms</span>";
			document.getElementById("tick_2").classList.add("tick_rate_active");
			game_tick = "300";
			break;
		case "tick_3":
			reset_tick_ui();
			document.getElementById("tick_sec_desc").innerHTML = "1 tick = <span class='highlight'>100ms</span>";
			document.getElementById("tick_3").classList.add("tick_rate_active");
			game_tick = "200";
			break;
		case "tick_6":
			reset_tick_ui();
			document.getElementById("tick_sec_desc").innerHTML = "1 tick = <span class='highlight'>50ms</span>";
			document.getElementById('tick_6').classList.add('tick_rate_active');
			game_tick = '50';
			break;
		default:
			break;
	}
}

function console_window_toggle(){
  document.getElementById("console2_view_toggle").classList.toggle("c2_view_open");
  document.getElementById("console2_window").classList.toggle("c2_window_open");
}

function console_window_close(){
  document.getElementById("console2_view_toggle").classList.remove("c2_view_open");
  document.getElementById("console2_window").classList.remove("c2_window_open");
}

function console_view_current(){
  document.getElementById('c2_option_current').classList.add('c2_option_active');
  document.getElementById('c2_option_all').classList.remove('c2_option_active');
  
  document.getElementById('console2_tick_in').style.display = "block";
  document.getElementById('console2_all_in').style.display = "none";
}

function console_view_all(){
  document.getElementById('c2_option_current').classList.remove('c2_option_active');
  document.getElementById('c2_option_all').classList.add('c2_option_active');
  
  document.getElementById('console2_tick_in').style.display = "none";
  document.getElementById('console2_all_in').style.display = "block";
}
  
var has_error = 0;

function update_console(incoming_data, chan){
  var cnsl_in = document.getElementById('console2_tick_in');
  var cnsl_all_in = document.getElementById('console2_all_in');
  cnsl_in.innerHTML = '';

  var temp_group = document.createElement("div");
  temp_group.classList.add('console_item_group');
  temp_group.innerHTML = "<span class='console_item_tick'>" + incoming_data.t + "</span>";

  if (chan && chan.err){
    has_error = 1;
    var err_lbl = chan.err.length == 1 ? "Error" : "Errors";
    document.getElementById('console2_lbl').innerHTML = chan.err.length + " " + err_lbl;
    document.getElementById('console2_lbl').classList.add('c2_lbl_error');
    document.getElementById('console2_view_toggle').classList.add('c2_view_error');

    for (var i = 0; i < chan.err.length; i++){
      cnsl_in.innerHTML += "<p class='console_item console_error'>" + chan.err[i] + "</p>";
      temp_group.innerHTML += "<p class='console_item console_error'>" + chan.err[i] + "</p>";
    }
  } else {
    has_error = 0;
    document.getElementById('console2_lbl').innerHTML = "Console";
    document.getElementById('console2_lbl').classList.remove('c2_lbl_error');
    document.getElementById('console2_view_toggle').classList.remove('c2_view_error');
  }

  if (chan && chan.log){
    for (var i = 0; i < chan.log.length; i++){
      cnsl_in.innerHTML += "<p class='console_item'>" + chan.log[i] + "</p>";
      temp_group.innerHTML += "<p class='console_item'>" + chan.log[i] + "</p>";
    }
  }

  cnsl_all_in.prepend(temp_group);
}

function bs_error(emsg){
  //TODO: create actual error handling
  alert(emsg);
}