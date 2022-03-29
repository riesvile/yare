
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
	
	//consume incoming data the same way as game.html?
	boxsand_engine.onmessage = function(e) {
		//console.log('engine data');
		//console.log(e.data)
		if (e.data.meta == 'rendering'){
			live_render = 1;
			render_world(e.data.incoming);
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

function update_live_code(){
  update_success();
  user_code = editor.getValue();
  localStorage.setItem("code_code", user_code);
  boxsand_engine.postMessage({
	  meta: 'live-input',
	  code_string: "client[ttick] = " + JSON.stringify(client) + "\n" + user_code
  });
}

function render_world(dat){
	elapsed = 0;
	incoming = dat;
	tick_counter = incoming.t;
	//console.log(incoming);
	//console.log('tick_counter = ' + tick_counter);
	
	if (tick_counter == 0){
		game_blocks['t0'] = game_blocks[active_block];
	}
	
    if (tick_counter > 1){
	 //game_blocks['t' + tick_counter] = incoming;
	 
	 game_blocks['t' + tick_counter] = {
		 'p1': {},
		 'p2': {},
		 'b1': [],
		 'b2': [],
		 'b3': [],
		 'b4': [],
		 'e': [],
		 's': [],
		 'units': [],
		 'g1': [],
		 'g2': []
	 }
	 
	 //
	 // Populating game_blocks
	 //
	 
	 for (i = 0; i < incoming.p1.length; i++){
		 var spir_id = incoming.pl1 + '_' + incoming.p1[i][0];
		 game_blocks['t' + tick_counter].p1[spir_id] = [incoming.p1[i][1], incoming.p1[i][2], incoming.p1[i][3], incoming.p1[i][4]];
		 game_blocks['t' + tick_counter].units.push(incoming.pl1 + '_' + incoming.p1[i][0]);
		 //console.log('previous tick');
		 if (game_blocks['t' + (tick_counter - 1)] != undefined){
			 //console.log('location');
			 //console.log(game_blocks['t' + tick_counter].p1[spir_id][0]);
			 var oldLoc = [0, 0];
			 var newLoc = game_blocks['t' + tick_counter].p1[spir_id][0];
			 var oldEnergy = 0;
			 var oldSize = 0;
			 
			 if (spirits[spir_id] == undefined && players['player1'] != undefined){
				 create_spirit_p1(spir_id);
			 }
			 
			 if (game_blocks['t' + (tick_counter - 1)].p1[spir_id] != undefined){
			 	oldLoc = game_blocks['t' + (tick_counter - 1)].p1[spir_id][0];
				oldEnergy = game_blocks['t' + (tick_counter - 1)].p1[spir_id][2];
				oldSize = game_blocks['t' + (tick_counter - 1)].p1[spir_id][1];
				
				game_blocks['t' + tick_counter].p1[spir_id][0][2] = newLoc[0] - oldLoc[0];
				game_blocks['t' + tick_counter].p1[spir_id][0][3] = newLoc[1] - oldLoc[1];
				game_blocks['t' + tick_counter].p1[spir_id][0][4] = oldLoc[0];
				game_blocks['t' + tick_counter].p1[spir_id][0][5] = oldLoc[1];
			 
				game_blocks['t' + tick_counter].p1[spir_id][4] = oldSize;
				game_blocks['t' + tick_counter].p1[spir_id][5] = oldEnergy;
			 } else {
				// new spirit instance
				//console.log('spirit born (probably)');
				 
				game_blocks['t' + tick_counter].p1[spir_id][0][2] = 0;
				game_blocks['t' + tick_counter].p1[spir_id][0][3] = 0;
				game_blocks['t' + tick_counter].p1[spir_id][0][4] = newLoc[0];
				game_blocks['t' + tick_counter].p1[spir_id][0][5] = newLoc[1];
			 
				game_blocks['t' + tick_counter].p1[spir_id][4] = oldSize;
				game_blocks['t' + tick_counter].p1[spir_id][5] = oldEnergy;
			 }
			 
		 }
	 }
	 
	 for (j = 0; j < incoming.p2.length; j++){
		 var spir_id = incoming.pl2 + '_' + incoming.p2[j][0];
		 game_blocks['t' + tick_counter].p2[spir_id] = [incoming.p2[j][1], incoming.p2[j][2], incoming.p2[j][3], incoming.p2[j][4]];
		 game_blocks['t' + tick_counter].units.push(incoming.pl2 + '_' + incoming.p2[j][0]);
		 
		 if (game_blocks['t' + (tick_counter - 1)] != undefined){
			 //console.log('location');
			 //console.log(game_blocks['t' + tick_counter].p1[spir_id][0]);
			 var oldLoc = [0, 0];
			 var newLoc = game_blocks['t' + tick_counter].p2[spir_id][0];
			 var oldEnergy = 0;
			 var oldSize = 0;
			 
			 if (spirits[spir_id] == undefined && players['player2'] != undefined){
				 create_spirit_p2(spir_id);
				 //console.log('spirit created ' + spir_id);
			 }
			 
			 if (game_blocks['t' + (tick_counter - 1)].p2[spir_id] != undefined){
			 	oldLoc = game_blocks['t' + (tick_counter - 1)].p2[spir_id][0];
				oldEnergy = game_blocks['t' + (tick_counter - 1)].p2[spir_id][2];
				oldSize = game_blocks['t' + (tick_counter - 1)].p2[spir_id][1];
				
				game_blocks['t' + tick_counter].p2[spir_id][0][2] = newLoc[0] - oldLoc[0];
				game_blocks['t' + tick_counter].p2[spir_id][0][3] = newLoc[1] - oldLoc[1];
				game_blocks['t' + tick_counter].p2[spir_id][0][4] = oldLoc[0];
				game_blocks['t' + tick_counter].p2[spir_id][0][5] = oldLoc[1];
			 
				game_blocks['t' + tick_counter].p2[spir_id][4] = oldSize;
				game_blocks['t' + tick_counter].p2[spir_id][5] = oldEnergy;
			 } else {
				// new spirit instance
				 //console.log('spirit born (probably)');
				 
				 game_blocks['t' + tick_counter].p2[spir_id][0][2] = 0;
				 game_blocks['t' + tick_counter].p2[spir_id][0][3] = 0;
				 game_blocks['t' + tick_counter].p2[spir_id][0][4] = newLoc[0];
				 game_blocks['t' + tick_counter].p2[spir_id][0][5] = newLoc[1];
			 
				 game_blocks['t' + tick_counter].p2[spir_id][4] = oldSize;
				 game_blocks['t' + tick_counter].p2[spir_id][5] = oldEnergy;
			 }
		 }
	 }
	 
	 game_blocks['t' + tick_counter]['e'] = incoming.e;
	 game_blocks['t' + tick_counter]['s'] = incoming.s;
	 game_blocks['t' + tick_counter]['b1'] = incoming.b1;
	 game_blocks['t' + tick_counter]['b2'] = incoming.b2;
	 game_blocks['t' + tick_counter]['b3'] = incoming.b3;
	 game_blocks['t' + tick_counter]['b4'] = incoming.b4;
	 
	 //previous energy for animation purposes
	 game_blocks['t' + tick_counter]['b1'][4] = game_blocks['t' + (tick_counter - 1)]['b1'][0];
	 game_blocks['t' + tick_counter]['b2'][4] = game_blocks['t' + (tick_counter - 1)]['b2'][0];
	 game_blocks['t' + tick_counter]['b3'][4] = game_blocks['t' + (tick_counter - 1)]['b3'][0];
	 game_blocks['t' + tick_counter]['b4'][4] = game_blocks['t' + (tick_counter - 1)]['b4'][0];
	 
	 game_blocks['t' + tick_counter]['st'] = incoming.st;
	 game_blocks['t' + tick_counter]['ef'] = incoming.ef;
	 
	 game_blocks['t' + tick_counter]['ou'] = incoming.ou;
	 game_blocks['t' + tick_counter]['py'] = incoming.py;
	 //console.log(incoming.py);
	 
	 //console.log('base 2 defend state = ' + game_blocks['t' + tick_counter]['b2'][2]);
	 //console.log(game_blocks);
	 //console.log('t' + tick_counter + ' processed');
	 run_it();
	 
     }
}

function run_it(){  
  if (game_running == 0 && game_blocks['t' + (tick_counter - 1)] != undefined){
	  game_running = 1;
	  tick_local = tick_counter;
	  active_block = 't' + (tick_local);
	  //console.log('active block = ' + active_block);
	  setInterval(function(){ 
		  // change to tick_counter (not - 1)
		  //console.log('local tick = ' + tick_local);
		  //console.log('incoming.t = ' + incoming.t);
		  
		  
		  active_block = 't' + (tick_local);
		  //console.log('active block = ' + active_block);
		  //console.log('incoming.t =   ' + incoming.t);
		  total_time = 0;
		  tick_local++;
		  if (tick_local > incoming.t) tick_local--;
		  if (incoming.t - tick_local > 4) tick_local = tick_counter - 1;
	  }, game_tick);
	  render_state();
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
  } else {
	  game_blocks[active_block]['p1'] = {};
	  for (let s = 0; s<boxsanded['p1_units'].length; s++){
		  let spi = boxsanded['p1_units'][s]; 
		  game_blocks[active_block]['p1'][players['player1'] + '_' + spi[0]] = [spi[1], spi[2], spi[3], 1, spi[2], spi[3]];
	  }
  }
  
  if (boxsanded['p2_def']){
	  fill_defaults(1);
  } else {
  	  game_blocks[active_block]['p2'] = {};
	  for (let q = 0; q<boxsanded['p2_units'].length; q++){
		  let spi = boxsanded['p2_units'][q]; 
		  game_blocks[active_block]['p2'][players['player2'] + '_' + spi[0]] = [spi[1], spi[2], spi[3], 1, spi[2], spi[3]];
	  }
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
	  //console.log(b);
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
  boxsanded['bases'][0][3] = players['player1'];
  boxsanded['bases'][1][3] = players['player2'];
  
  if (boxsanded['p1_def']){
	  fill_defaults(0);
  } else {
	  game_blocks[active_block]['p1'] = {};
	  for (let s = 0; s<boxsanded['p1_units'].length; s++){
		  let spi = boxsanded['p1_units'][s]; 
		  game_blocks[active_block]['p1'][players['player1'] + '_' + spi[0]] = [spi[1], spi[2], spi[3], 1, spi[2], spi[3]];
	  }
  }
  if (boxsanded['p2_def']){
	  fill_defaults(1);
  } else {
  	  game_blocks[active_block]['p2'] = {};
	  for (let q = 0; q<boxsanded['p2_units'].length; q++){
		  let spi = boxsanded['p2_units'][q]; 
		  game_blocks[active_block]['p2'][players['player2'] + '_' + spi[0]] = [spi[1], spi[2], spi[3], 1, spi[2], spi[3]];
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
	  for (let i = 0; i < boxsanded['p1_units'].length; i++){
	  	boxsanded['p1_units'][i][2] = get_def_size(boxsanded['pl1_sh']);
		boxsanded['p1_units'][i][3] = get_def_size(boxsanded['pl1_sh']) * 10;
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
	  for (let i = 0; i < boxsanded['p2_units'].length; i++){
	  	boxsanded['p2_units'][i][2] = get_def_size(boxsanded['pl2_sh']);
		boxsanded['p2_units'][i][3] = get_def_size(boxsanded['pl2_sh']) * 10;
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
  //console.log('elopt ' + el_option);
  boxsanded[pl] = el_option;
  
  let plshape = '';
  if (el_option == 'live-input'){
	  //console.log('gothere')
	  plshape = live_bot_shape[pl];
  } else if (el_option == 'upload-bot'){
	  plshape = upload_bot_shape[pl];
  } else {
	  plshape = shape_match[el_option];
  }
  //console.log('plshape = ' + plshape)
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

function canvas_down(e){
	let mouse_x = e.clientX;
    let mouse_y = e.clientY;
    let gameboard_x = mouse_x*multiplier - offsetX;
	let gameboard_y = mouse_y*multiplier - offsetY;
	
	mmmx = mouse_x;
	mmmy = mouse_y;
	console.log(gameboard_x + ', ' + gameboard_y);
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
	console.log("placing at " + loc);
	
	let pla_num = '1';
	if (currently_placing == 'pl2') pla_num = '2';
	if (currently_placing == 'frag'){
		place_fragment(loc);
		return;
	}
	
	boxsanded['p' + pla_num + '_def'] = 0;
	document.getElementById('bs_load_prev').style.display = 'block';
	
	let highest = 0;
	highest = get_highest_spirit('p' + pla_num);
	console.log('highest = ' + highest);
	
	let spnum = highest + 1;
	let sp_id = players['player' + pla_num] + '_' + spnum;
	
    game_blocks[active_block]['p' + pla_num][sp_id] = [loc, get_def_size(boxsanded['pl' + pla_num + '_sh']), get_def_size(boxsanded['pl' + pla_num + '_sh']) * 10, 1, get_def_size(boxsanded['pl' + pla_num + '_sh']), get_def_size(boxsanded['pl' + pla_num + '_sh'])*10];
    boxsanded['p' + pla_num + '_units'].push([spnum, loc, get_def_size(boxsanded['pl' + pla_num + '_sh']), get_def_size(boxsanded['pl' + pla_num + '_sh'])*10, 1]);
	
	spirits[sp_id] = new Spirit(sp_id, loc, get_def_size(boxsanded['pl' + pla_num + '_sh']), get_def_size(boxsanded['pl' + pla_num + '_sh']) * 10, players['player' + pla_num], colors['color' + pla_num], boxsanded['pl' + pla_num + '_sh'], 1);
	spirits[sp_id].position = [loc[0], loc[1], 0, 0, loc[0], loc[1]];
	game_blocks[active_block].units.push(sp_id);
	
	console.log(get_def_size(boxsanded['pl' + pla_num + '_sh']));
	console.log(spirits[sp_id]);
	console.log(spirits[players['player' + pla_num] + '_12']);
	
}

function place_fragment(loc){
	console.log('placing fragment');
}

function get_highest_spirit(pl_short){
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
			console.log('defaulted');
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
  
function bs_error(emsg){
  //TODO: create actual error handling
  alert(emsg);
}