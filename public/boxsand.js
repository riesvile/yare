

function start_engine(){
	boxsand_engine = new Worker("../boxsand-engine.js");
	
	let cunt = 3;
	if (boxsanded['pl1'] == 'live-input' || boxsanded['pl2'] == 'live-input') cunt = 2;
	
	boxsand_engine.postMessage({
		meta: 'initiate',
		meta2: cunt, //countdown
		boxsanded: boxsanded,
		tick_rate: game_tick,
		code_pl1: 'code1',
		code_pl2: 'code2'
	});
	
	//consume incoming data the same way as game.html?
	boxsand_engine.onmessage = function(e) {
		console.log('engine data');
		console.log(e.data)
	}
}

	  
function set_stage(){
  scale = 0.5;
  prevScale = scale;
  multiplier = 1 / scale;
  
  //top indexes (s = p1, q = p2)
  let top_s = 0;
  let top_q = 0;
  
  
  let brow_width = window.innerWidth || document.documentElement.clientWidth || 
document.body.clientWidth;
  let brow_height = window.innerHeight || document.documentElement.clientHeight || 
document.body.clientHeight;


  offsetX = brow_width;
  offsetY = brow_height;
  
  game_blocks[active_block] = {
	 'p1': {},
	 'p2': {},
	 'b1': [0, 50, 0, 'pl1', 0],
	 'b2': [0, 50, 0, 'pl2', 0],
	 'b3': [0, 0, 0, '', 0],
	 'b4': [0, 0, 0, '', 0],
	 'e': [],
	 's': [],
	 'st': [100, 100, 100, 100],
	 'ou': [0, ''],
	 'py': [0, ''],
	 'ef': [],
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
  shapes['shape1'] = boxsanded['pl1_sh'];
  shapes['shape2'] = boxsanded['pl2_sh'];
  colors['color1'] = col1;
  colors['color2'] = col2;
  
  if (players['player1'] == 'live-input' && players['player2'] == 'live-input') bs_error('You can control only one player with live input');
  if (players['player1'] == players['player2']) players['player2'] += '2';
  
  if (boxsanded['p1_def']){
	  fill_defaults(0);
  }
  
  if (boxsanded['p2_def']){
	  fill_defaults(1);
  }
  
  
  let bas = boxsanded['bases'];
  let sta = boxsanded['stars'];
  let out = boxsanded['outposts'];
  let pyl = boxsanded['pylons'];
  let all_sp1 = game_blocks[active_block]['p1'];
  let all_sp2 = game_blocks[active_block]['p2'];
  
  for (let b of bas){
	  if (b[3] == 'pl1'){
	  	  b[3] = players['player1'];
	  } else if (b[3] == 'pl2'){
		  b[3] = players['player2'];
	  }
	  console.log(b);
	  base_lookup[b[0]] = new Base(b[0], b[1], b[2], b[3], b[4], b[5]);
	  base_lookup[b[0]].draw(b[3]);
  }
  
  game_blocks[active_block]['b1'][3] = players['player1'];
  game_blocks[active_block]['b2'][3] = players['player2'];
  
  for (let s of sta){
	  star_lookup[s[0]] = new Star(s[0], s[1], s[2], s[3]);
	  star_lookup[s[0]].draw();
  }
  
  for (let o of out){
	  outpost_lookup[o[0]] = new Outpost(o[0], o[1], o[2]);
	  outpost_lookup[o[0]].draw();
  }
  
  for (let py of pyl){
	  pylon_lookup[py[0]] = new Pylon(py[0], py[1], py[2]);
	  pylon_lookup[py[0]].draw();
  }
  
  for (let sp_id of Object.keys(all_sp1)) {
	  spirits[sp_id] = new Spirit(sp_id, all_sp1[sp_id][0], all_sp1[sp_id][1], all_sp1[sp_id][2], players['player1'], col1, boxsanded['pl1_sh'], all_sp1[sp_id][3]);
	  game_blocks[active_block].units.push(sp_id);
  }
  
  for (let sp_id of Object.keys(all_sp2)) {
	  spirits[sp_id] = new Spirit(sp_id, all_sp2[sp_id][0], all_sp2[sp_id][1], all_sp2[sp_id][2], players['player2'], col2, boxsanded['pl2_sh'], all_sp2[sp_id][3]);
	  game_blocks[active_block].units.push(sp_id);
  }
  
  render_state();
  offsetUpdate();
  
}

function update_stage(){
  delete_all_spirits();
  living_spirits = [];
  players['player1'] = boxsanded['pl1'];
  players['player2'] = boxsanded['pl2'];
  if (players['player1'] == players['player2']) players['player2'] += '2';
  
  game_blocks[active_block]['b1'][3] = players['player1'];
  game_blocks[active_block]['b2'][3] = players['player2'];
  
  if (boxsanded['p1_def']){
	  fill_defaults(0);
  } else {
	  game_blocks[active_block]['p1'] = {};
	  for (let s = 1; s<=boxsanded['p1_units'].length; s++){
		  let spi = boxsanded['p1_units'][s]; 
		  game_blocks[active_block]['p1'][players['player1'] + '_' + spi[0]] = [spi[1], spi[2], spi[3], 1, 1, 1];
	  }
  }
  if (boxsanded['p2_def']){
	  fill_defaults(1);
  } else {
  	  game_blocks[active_block]['p2'] = {};
	  for (let q = 1; q<=boxsanded['p2_units'].length; q++){
		  let spi = boxsanded['p2_units'][q]; 
		  game_blocks[active_block]['p2'][players['player2'] + '_' + spi[0]] = [spi[1], spi[2], spi[3], 1, 1, 1];
	  }
  }
  
  //generate spirits objects
  
  let all_sp1 = game_blocks[active_block]['p1'];
  let all_sp2 = game_blocks[active_block]['p2'];
  
  for (let sp_id of Object.keys(all_sp1)) {
  	  spirits[sp_id] = new Spirit(sp_id, all_sp1[sp_id][0], all_sp1[sp_id][1], all_sp1[sp_id][2], players['player1'], col1, boxsanded['pl1_sh'], all_sp1[sp_id][3]);
  	  game_blocks[active_block].units.push(sp_id);
  }
  
  for (let sp_id of Object.keys(all_sp2)) {
  	  spirits[sp_id] = new Spirit(sp_id, all_sp2[sp_id][0], all_sp2[sp_id][1], all_sp2[sp_id][2], players['player2'], col2, boxsanded['pl2_sh'], all_sp2[sp_id][3]);
  	  game_blocks[active_block].units.push(sp_id);
  }
  
  
  
  update_game_shapes(0)
  update_game_shapes(1);
}

function delete_all_spirits(){
  game_blocks[active_block].units = [];
  for (let ds in spirits){
	  delete spirits[ds];
  }
}

function get_def_size(pshape){
if (pshape == 'circles') return 1;
if (pshape == 'squares') return 10;
if (pshape == 'triangles') return 3;
}

function get_def_cost(pshape){
if (pshape == 'circles') return 25;
if (pshape == 'squares') return 360;
if (pshape == 'triangles') return 90;
}

function update_game_shapes(pl2 = 1){
  if (pl2 == 0){
  	  for (let sp_id of Object.keys(spirits)) {
		  let sp = spirits[sp_id];
		  if (sp.player_id != players['player1']) continue;
		  sp.shape = boxsanded['pl1_sh'];
		  sp.energy_capacity = get_def_size(boxsanded['pl1_sh']) * 10;
		  sp.energy = get_def_size(boxsanded['pl1_sh']) * 10;
		  game_blocks[active_block]['p1'][sp_id][1] = get_def_size(boxsanded['pl1_sh']);
		  game_blocks[active_block]['p1'][sp_id][2] = get_def_size(boxsanded['pl1_sh']) * 10;
		  game_blocks[active_block]['p1'][sp_id][4] = get_def_size(boxsanded['pl1_sh']);
		  sp.size = get_def_size(boxsanded['pl1_sh']);
		  sp.final_size = get_def_size(boxsanded['pl1_sh']);
		  sp.temp_size = get_def_size(boxsanded['pl1_sh']);
	  }
	  shapes['shape1'] = boxsanded['pl1_sh'];
	  bases[0].shape = boxsanded['pl1_sh'];
	  game_blocks[active_block]['b1'][1] = get_def_cost(boxsanded['pl1_sh']);
	  
  } else if (pl2 == 1){
  	  for (let sp_id of Object.keys(spirits)) {
		  let sp = spirits[sp_id];
		  if (sp.player_id != players['player2']) continue;
		  sp.shape = boxsanded['pl2_sh'];
		  sp.energy_capacity = get_def_size(boxsanded['pl2_sh']) * 10;
		  sp.energy = get_def_size(boxsanded['pl2_sh']) * 10;
		  game_blocks[active_block]['p2'][sp_id][1] = get_def_size(boxsanded['pl2_sh']);
		  game_blocks[active_block]['p2'][sp_id][2] = get_def_size(boxsanded['pl2_sh']) * 10;
		  game_blocks[active_block]['p2'][sp_id][4] = get_def_size(boxsanded['pl2_sh']);
		  sp.size = get_def_size(boxsanded['pl2_sh']);
		  sp.final_size = get_def_size(boxsanded['pl2_sh']);
		  sp.temp_size = get_def_size(boxsanded['pl2_sh']);
	  }
	  shapes['shape2'] = boxsanded['pl2_sh'];
	  bases[1].shape = boxsanded['pl2_sh'];
	  game_blocks[active_block]['b2'][1] = get_def_cost(boxsanded['pl2_sh']);
  }
}

function fill_defaults(pl2 = 1){
  let start_num_spirits = 12;
  let start_num_adjust1 = 0;
  let start_num_adjust2 = 0;
  if (boxsanded['pl1_sh'] == 'squares') start_num_adjust1 = 9;
  if (boxsanded['pl2_sh'] == 'squares') start_num_adjust2 = 9;
  if (boxsanded['pl1_sh'] == 'triangles') start_num_adjust1 = 6;
  if (boxsanded['pl2_sh'] == 'triangles') start_num_adjust2 = 6;
  
  if (pl2 == 0){
	  boxsanded['p1_units'] = [];
	  game_blocks[active_block]['p1'] = {};
	  for (let s = 1; s < 1+start_num_spirits-start_num_adjust1; s++){
		  if (s > 6){
			  game_blocks[active_block]['p1'][players['player1'] + '_' + s] = [[-620-s*20,-600], get_def_size(boxsanded['pl1_sh']), get_def_size(boxsanded['pl1_sh']) * 10, 1, 1, 1];
			  boxsanded['p1_units'].push([s, [-620-s*20,-600], get_def_size(boxsanded['pl1_sh']), get_def_size(boxsanded['pl1_sh'])*10, 1]);
		  } else {
		  	  game_blocks[active_block]['p1'][players['player1'] + '_' + s] = [[-750-s*20,-580], get_def_size(boxsanded['pl1_sh']), get_def_size(boxsanded['pl1_sh']) * 10, 1, 1, 1];
			   boxsanded['p1_units'].push([s, [-750-s*20,-580], get_def_size(boxsanded['pl1_sh']), get_def_size(boxsanded['pl1_sh'])*10, 1]);
		  }
		  
		  
		  
		  let oldLoc = [0, 0];
		  let newLoc = game_blocks[active_block].p1[players['player1'] + '_' + s][0];
		  let oldEnergy = game_blocks[active_block].p1[players['player1'] + '_' + s][2];
		  let oldSize = game_blocks[active_block].p1[players['player1'] + '_' + s][1];
		  game_blocks[active_block].p1[players['player1'] + '_' + s][0][2] = 0;
		  game_blocks[active_block].p1[players['player1'] + '_' + s][0][3] = 0;
		  game_blocks[active_block].p1[players['player1'] + '_' + s][0][4] = newLoc[0];
		  game_blocks[active_block].p1[players['player1'] + '_' + s][0][5] = newLoc[1];
		  game_blocks[active_block].p1[players['player1'] + '_' + s][4] = oldSize;
		  game_blocks[active_block].p1[players['player1'] + '_' + s][5] = oldEnergy;
		  
	  }
  } else if (pl2 == 1){
	  boxsanded['p2_units'] = [];
	  game_blocks[active_block]['p2'] = {};
	  for (let q = 1; q < 1+start_num_spirits-start_num_adjust2; q++){
		  if (q > 6){
			  game_blocks[active_block]['p2'][players['player2'] + '_' + q] = [[450+q*20,770], get_def_size(boxsanded['pl2_sh']), get_def_size(boxsanded['pl2_sh']) * 10, 1, 1, 1];
			  boxsanded['p2_units'].push([q, [450+q*20,770], get_def_size(boxsanded['pl2_sh']), get_def_size(boxsanded['pl2_sh'])*10, 1]);
		  } else {
		  	  game_blocks[active_block]['p2'][players['player2'] + '_' + q] = [[580+q*20,750], get_def_size(boxsanded['pl2_sh']), get_def_size(boxsanded['pl2_sh']) * 10, 1, 1, 1];
			  boxsanded['p2_units'].push([q, [580+q*20,750], get_def_size(boxsanded['pl2_sh']), get_def_size(boxsanded['pl2_sh'])*10, 1]);
		  }
		  
		  let oldLoc = [0, 0];
		  let newLoc = game_blocks[active_block].p2[players['player2'] + '_' + q][0];
		  let oldEnergy = game_blocks[active_block].p2[players['player2'] + '_' + q][2];
		  let oldSize = game_blocks[active_block].p2[players['player2'] + '_' + q][1];
		  game_blocks[active_block].p2[players['player2'] + '_' + q][0][2] = 0;
		  game_blocks[active_block].p2[players['player2'] + '_' + q][0][3] = 0;
		  game_blocks[active_block].p2[players['player2'] + '_' + q][0][4] = newLoc[0];
		  game_blocks[active_block].p2[players['player2'] + '_' + q][0][5] = newLoc[1];
		  game_blocks[active_block].p2[players['player2'] + '_' + q][4] = oldSize;
		  game_blocks[active_block].p2[players['player2'] + '_' + q][5] = oldEnergy;
	  }
  }
}

function store_state(){
  sessionStorage.setItem('boxsand_state', JSON.stringify(boxsanded));
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

function insert_shape(pl, shapename){
  document.getElementById('bs_ico_' + pl).classList.remove('ico_circles');
  document.getElementById('bs_ico_' + pl).classList.remove('ico_squares');
  document.getElementById('bs_ico_' + pl).classList.remove('ico_triangles');
  document.getElementById('bs_ele_' + pl).classList.remove('ico_circles');
  document.getElementById('bs_ele_' + pl).classList.remove('ico_squares');
  document.getElementById('bs_ele_' + pl).classList.remove('ico_triangles');
  
  document.getElementById('bs_ico_' + pl).classList.add('ico_' + shapename);
  document.getElementById('bs_ele_' + pl).classList.add('ico_' + shapename);
}

function get_pick_state(pl){
  reset_pl_sel();
  reset_bot_sel();
  reset_upload_shape_sel();
  reset_live_shape_sel();
  reset_upload_name();
  
  if (boxsanded[pl] == 'live-input'){
	  document.getElementById('live_shape_' + live_bot_shape[pl]).parentNode.classList.add('ps_shape_active');
  } else if (boxsanded[pl] == 'upload-bot'){
	  document.getElementById('upload_shape_' + upload_bot_shape[pl]).parentNode.classList.add('ps_shape_active');
  }
  set_sel(pl, 'ps_' + boxsanded[pl]);
}

function reset_live_shape_sel(){
  document.getElementById('live_shape_circles').parentNode.classList.remove('ps_shape_active');
  document.getElementById('live_shape_squares').parentNode.classList.remove('ps_shape_active');
  document.getElementById('live_shape_triangles').parentNode.classList.remove('ps_shape_active');
}

function reset_upload_shape_sel(){
  document.getElementById('upload_shape_circles').parentNode.classList.remove('ps_shape_active');
  document.getElementById('upload_shape_squares').parentNode.classList.remove('ps_shape_active');
  document.getElementById('upload_shape_triangles').parentNode.classList.remove('ps_shape_active');
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
}

function set_sel(pl, elname){
  reset_pl_sel();
  reset_bot_sel();
  document.getElementById(elname).classList.add('card_active');
  
  if (!elname.includes("_")) return;

  el_option = elname.split("_")[1];
  console.log('elopt ' + el_option);
  boxsanded[pl] = el_option;
  
  let plshape = '';
  if (el_option == 'live-input'){
	  console.log('gothere')
	  plshape = live_bot_shape[pl];
  } else if (el_option == 'upload-bot'){
	  plshape = upload_bot_shape[pl];
  } else {
	  plshape = shape_match[el_option];
  }
  console.log('plshape = ' + plshape)
  insert_shape(pl, plshape);
  boxsanded[pl + '_sh'] = plshape;
  
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
  document.getElementById('bs_placing_frag').classList.remove('ele_active');
  
  document.getElementById('bs_placing_' + ele).classList.add('ele_active');
}


function player_selection_crossroad(e){
  e = e || window.event;
  let el = (e.target || e.srcElement);
  console.log(el.id)
  
  switch (el.id){
  	case 'ps_live-input':
	case 'ps_upload-bot':
	case 'ps_dumb-bot':
  	case 'ps_medium-bot':
	case 'ps_hard-bot':
	case 'ps_lego-bot':
		set_sel(currently_picking, el.id);
		break;
	case 'live_shape_circles':
		reset_live_shape_sel();
		document.getElementById('live_shape_circles').parentNode.classList.add('ps_shape_active');
		live_bot_shape[currently_picking] = 'circles';
		set_sel(currently_picking, 'ps_live-input');
		break;
	case 'live_shape_squares':
		reset_live_shape_sel();
		document.getElementById('live_shape_squares').parentNode.classList.add('ps_shape_active');
		live_bot_shape[currently_picking] = 'squares';
		set_sel(currently_picking, 'ps_live-input');
		break;
	case 'live_shape_triangles':
		reset_live_shape_sel();
		document.getElementById('live_shape_triangles').parentNode.classList.add('ps_shape_active');
		live_bot_shape[currently_picking] = 'triangles';
		set_sel(currently_picking, 'ps_live-input');
		break;
	case 'upload_shape_circles':
		reset_upload_shape_sel();
		document.getElementById('upload_shape_circles').parentNode.classList.add('ps_shape_active');
		upload_bot_shape[currently_picking] = 'circles';
		set_sel(currently_picking, 'ps_upload-bot');
		break;
	case 'upload_shape_squares':
		reset_upload_shape_sel();
		document.getElementById('upload_shape_squares').parentNode.classList.add('ps_shape_active');
		upload_bot_shape[currently_picking] = 'squares';
		set_sel(currently_picking, 'ps_upload-bot');
		break;
	case 'upload_shape_triangles':
		reset_upload_shape_sel();
		document.getElementById('upload_shape_triangles').parentNode.classList.add('ps_shape_active');
		upload_bot_shape[currently_picking] = 'triangles';
		set_sel(currently_picking, 'ps_upload-bot');
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
		console.log('defaulted');
		break;
  }
  
}

function element_selection_crossroad(e){
  e = e || window.event;
  let el = (e.target || e.srcElement);
  console.log(el.id)
  
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
	  case 'bs_placing_frag':
	  case 'bs_ele_frag':
		  set_ele('frag');
		  currently_placing = 'frag';
		  break;
	  default:
		  console.log('defaulted');
		  break;
  }
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
			game_tick = "1200";
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
			//document.getElementById('tick_6').classList.add('tick_rate_active');
			game_tick = '100';
			break;
		default:
			console.log('defaulted');
			break;
	}
  }
  
function bs_error(emsg){
  //TODO: create actual error handling
  alert(emsg);
}