
var client = {};
var incoming = {
	t: 0,
	p1: [],
	p2: []
};
var module_draw = {};

var dragging_timeline = 0;
var live_render = 0;

var col1 = "rgba(128,140,255,1)";
var col2 = "rgba(178,168,100,1)";
var col_neut = "rgba(160,168,180,1)";

var user_code = '';

var x = 0;
var y = 0;
var move_queue = [];
var birth_queue = [];
var units_queue = [];
var pew_queue = [];
var death_queue = [];
var barricades_queue = [];
var logs = [];
var from_gameserver = './';

var pla1 = '';
var pla2 = '';
var game_type = '';

var game_blocks = {};
var active_block = 0;
var game_running = 0;
var tick_counter = 0;
var tick_local = 0;

var total_time = 0;
var prev = 0;
var game_tick = 500;
var start_tick = 0;

var view_set = 0;
var offsetX_adjust = 0;
var offsetY_adjust = 0;

var is_sandbox = 1;

var boxsand_engine;
var engine_ready = 0;
var game_ended = 0;

var boxsanded = {
	pl1: 'live-input',
	pl2: 'muffin-bot',
	barricades: [[0, -200], [0, 200], [370, 0], [-370, 0]],
	pods: [[-110, -300], [110, -300], [-260, 320], [260, 320], [-500, 84], [500, 84]],
	p1_units: [],
	p2_units: [],
	pl1_uploaded_code: '',
	pl1_uploaded_name: '',
	pl2_uploaded_code: '',
	pl2_uploaded_name: '',
	pl1_color: col1,
	pl2_color: col2,
	p1_def: 1,
	p2_def: 1,
	start_tick: start_tick
};


// --- Ace editor setup ---

var editor = ace.edit("editor");
editor.setTheme("ace/theme/clouds_midnight");
editor.session.setMode("ace/mode/javascript");
editor.session.setOption("useWorker", false);
editor.setFontSize(14);
editor.setShowPrintMargin(false);

editor.setOptions({
	enableBasicAutocompletion: true,
	enableSnippets: true,
	enableLiveAutocompletion: true,
	firstLineNumber: 2
});
editor.commands.addCommand({
	name: "update_code",
	exec: function() { update_code(); },
	bindKey: {mac: "cmd-s", win: "ctrl-s"}
});
editor.completers.push({
	getCompletions: function(editor, session, pos, prefix, callback) {
		var completions = [];
		["pew()", "move()", "shout()", "range", "id", "energy", "energy_capacity", "memory", "position", "barricades", "pods", "my_cats", "cats", "tick", "ttick", "hp", "sight", "enemies", "friends", "enemies_pewable", "friends_pewable"].forEach(function(w) {
			completions.push({ value: w, meta: "keyword" });
		});
		callback(null, completions);
	}
});

if (localStorage.getItem("code_code") != null){
	editor.setValue(localStorage.getItem("code_code"), 1);
} else {
	var starterCode = "// This is an example code to help you get started.\n// First challenge: create a function to calculate distances\n// so that you move towards and pew only the closest cats.\n\n// ======================================================\n\n// Learn more details in the Documentation/How to play.\n\n\nfor (let cat of my_cats) {\n    if (cat.sight.enemies.length == 0) continue;\n\n    let enemy = cats[cat.sight.enemies[0]];\n    cat.move(enemy.position);\n    cat.pew(enemy);\n}";
	editor.setValue(starterCode, 1);
}

var isMac = navigator.platform.indexOf('Mac') !== -1;
document.getElementById('shortcut_info').innerHTML = isMac ? "CMD + S" : "CTRL + S";


// --- Stage setup (static render on load) ---

function set_stage(){
	scale = 1;
	prevScale = scale;
	multiplier = 1 / scale;

	var brow_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var brow_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

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
	};

	players['player1'] = boxsanded['pl1'];
	players['player2'] = boxsanded['pl2'];
	colors['color1'] = col1;
	colors['color2'] = col2;

	if (players['player1'] == players['player2']) players['player2'] += '2';

	fill_defaults(0);
	fill_defaults(1);

	barricades = boxsanded['barricades'] || [];
	pods = boxsanded['pods'] || [];

	var all_sp1 = game_blocks[active_block]['p1'];
	var all_sp2 = game_blocks[active_block]['p2'];

	for (var bi = 0; bi < barricades.length; bi++){
		draw_barricade(barricades[bi]);
	}
	for (var pi = 0; pi < pods.length; pi++){
		draw_pod(pods[pi]);
	}

	for (var sp_id of Object.keys(all_sp1)) {
		cats[sp_id] = new Cat(sp_id, all_sp1[sp_id][0], all_sp1[sp_id][1], players['player1'], col1, all_sp1[sp_id][2]);
		game_blocks[active_block].units.push(sp_id);
	}

	for (var sp_id of Object.keys(all_sp2)) {
		cats[sp_id] = new Cat(sp_id, all_sp2[sp_id][0], all_sp2[sp_id][1], players['player2'], col2, all_sp2[sp_id][2]);
		game_blocks[active_block].units.push(sp_id);
	}

	render_state();
	offsetUpdate();
}


function fill_defaults(pl2){
	var start_num_cats = 9;

	var x_offsets = [10, 0, -10, 0];
	if (pl2 == 0){
		boxsanded['p1_units'] = [];
		game_blocks[active_block]['p1'] = {};
		for (var s = 1; s <= start_num_cats; s++){
			var yy = -100 + (s - 1) * 25;
			var xx = -200 + x_offsets[(s - 1) % 4];
			game_blocks[active_block]['p1'][players['player1'] + '_' + s] = [[xx, yy], 10, 1, 10];
			boxsanded['p1_units'].push([s, [xx, yy], 10, 1]);

			var newLoc = game_blocks[active_block].p1[players['player1'] + '_' + s][0];
			var oldEnergy = game_blocks[active_block].p1[players['player1'] + '_' + s][1];
			game_blocks[active_block].p1[players['player1'] + '_' + s][0][2] = 0;
			game_blocks[active_block].p1[players['player1'] + '_' + s][0][3] = 0;
			game_blocks[active_block].p1[players['player1'] + '_' + s][0][4] = newLoc[0];
			game_blocks[active_block].p1[players['player1'] + '_' + s][0][5] = newLoc[1];
			game_blocks[active_block].p1[players['player1'] + '_' + s][3] = oldEnergy;
		}
	} else if (pl2 == 1){
		boxsanded['p2_units'] = [];
		game_blocks[active_block]['p2'] = {};
		for (var q = 1; q <= start_num_cats; q++){
			var yy = -100 + (q - 1) * 25;
			var xx = 200 - x_offsets[(q - 1) % 4];
			game_blocks[active_block]['p2'][players['player2'] + '_' + q] = [[xx, yy], 10, 1, 10];
			boxsanded['p2_units'].push([q, [xx, yy], 10, 1]);

			var newLoc = game_blocks[active_block].p2[players['player2'] + '_' + q][0];
			var oldEnergy = game_blocks[active_block].p2[players['player2'] + '_' + q][1];
			game_blocks[active_block].p2[players['player2'] + '_' + q][0][2] = 0;
			game_blocks[active_block].p2[players['player2'] + '_' + q][0][3] = 0;
			game_blocks[active_block].p2[players['player2'] + '_' + q][0][4] = newLoc[0];
			game_blocks[active_block].p2[players['player2'] + '_' + q][0][5] = newLoc[1];
			game_blocks[active_block].p2[players['player2'] + '_' + q][3] = oldEnergy;
		}
	}
}


// --- Engine control ---

function start_engine(){
	boxsand_engine = new Worker("../boxsand-engine.js");

	pla1 = players['player1'];
	pla2 = players['player2'];

	initiate_from_sandbox();

	var isMobile = window.matchMedia('(max-width: 880px)').matches;
	document.getElementById('panel').style.display = isMobile ? 'none' : 'block';
	document.getElementById('update_switch_wrapper').style.display = 'block';
	document.getElementById('update_switch_wrapper').classList.add('update_switch_wrapper_real');
	document.getElementById('update_code').classList.add('update_code_real');
	document.getElementById('shortcut_info').classList.add('shortcut_info_real');

	boxsand_engine.onmessage = function(e) {
		if (e.data.meta == 'rendering'){
			live_render = 1;
			render_world(e.data.incoming);
			update_console(e.data.incoming, e.data.chan);
		}
	};

	engine_ready = 1;
}

function initiate_engine(){
	boxsand_engine.postMessage({
		meta: 'initiate',
		meta2: 2,
		boxsanded: boxsanded,
		tick_rate: game_tick,
		code_pl1: 'code1',
		code_pl2: 'code2'
	});
}

function update_code(){
	if (game_ended || !engine_ready) return;
	update_success();
	user_code = ' ' + editor.getValue();
	localStorage.setItem("code_code", user_code);

	if (engine_ready == 1 && game_running == 0){
		initiate_engine();
		game_running = 1;
	}

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
	};

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

	if (!game_ended && tick_counter > 0){
		var p1_alive = incoming.p1.filter(function(u){ return u[3] == 1; }).length;
		var p2_alive = incoming.p2.filter(function(u){ return u[3] == 1; }).length;

		if (p1_alive == 0){
			show_game_over(players['player2']);
		} else if (p2_alive == 0){
			show_game_over(players['player1']);
		}
	}
}


function show_game_over(winner){
	game_ended = 1;
	boxsand_engine.terminate();

	var label = (winner == players['player1']) ? 'You won' : 'You lost';
	document.getElementById('game_result').innerHTML = label;

	document.getElementById('player1_shape').innerHTML = "<span class='ico_triangles' style='background-color: " + colors['color1'] + "'></span>";
	document.getElementById('player2_shape').innerHTML = "<span class='ico_triangles' style='background-color: " + colors['color2'] + "'></span>";
	document.getElementById('player1_name').innerHTML = pla1;
	document.getElementById('player2_name').innerHTML = pla2;
	document.getElementById('player1_rating').innerHTML = '';
	document.getElementById('player2_rating').innerHTML = '';

	game_over_box();
}


// --- Console ---

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


// --- Landing overlay ---

function landing_start_game(){
	var overlay = document.getElementById('landing_overlay');

	anime({
		targets: '#landing_overlay',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 500
	});

	setTimeout(function(){
		overlay.style.display = 'none';
		overlay.style.pointerEvents = 'none';
	}, 500);

	start_engine();
	editor.focus();
}


// --- Event listeners ---

document.getElementById('landing_start_btn').addEventListener('click', landing_start_game, false);
document.getElementById('landing_create_link').addEventListener('click', function(e){
	e.preventDefault();
	new_account();
}, false);

document.getElementById('console2_view_toggle').addEventListener('click', console_window_toggle, false);
document.getElementById('c2_close').addEventListener('click', console_window_close, false);
document.getElementById('c2_option_current').addEventListener('click', console_view_current, false);
document.getElementById('c2_option_all').addEventListener('click', console_view_all, false);
document.getElementById('update_code').addEventListener("click", update_code, false);

document.getElementById('switch_view').addEventListener('click', function(){
	var panel = document.getElementById('panel');
	var opening = panel.style.display === 'none' || panel.style.display === '';
	this.classList.toggle('switch_switched');
	if (opening) {
		panel.style.display = 'block';
		editor.resize();
		editor.focus();
	} else {
		panel.style.display = 'none';
		update_code();
	}
}, false);


// --- Signed-in game mode ---

var mp_socket = null;
var active_mode = 'bot';
var selected_bot = 'muffin-bot';
var challenge_sent = 0;
var mp_friendly = 0;
var in_queue = 0;

function _readCookie(name){
	var nameEQ = name + '=';
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++){
		var c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
	}
	return null;
}

var COLOR_NUM_TO_NAME = {
	1: 'purply', 2: 'redish', 3: 'gblue', 4: 'yerange',
	5: 'wirple', 6: 'pistagre', 7: 'magion', 8: 'brigenta',
	9: 'greson', 10: 'mmmsalmon', 11: 'skyblue', 12: 'toored',
	13: 'rozblue', 14: 'legorange', 15: 'lolight'
};

var COLOR_RGBA = {
	1: 'rgba(128,140,255,1)', 2: 'rgba(232,97,97,1)',
	3: 'rgba(58,197,240,1)', 4: 'rgba(201,161,101,1)',
	5: 'rgba(120,12,196,1)', 6: 'rgba(148,176,108,1)',
	7: 'rgba(180,27,227,1)', 8: 'rgba(198,166,224,1)',
	9: 'rgba(138,228,122,1)', 10: 'rgba(232,198,179,1)',
	11: 'rgba(78,142,250,1)', 12: 'rgba(240,70,60,1)',
	13: 'rgba(18,255,248,1)', 14: 'rgba(235,93,0,1)',
	15: 'rgba(255,255,255,1)'
};

var DEFAULT_COLORS = [1, 2, 3, 4];

function arraysEqual(a, b) {
	if (a.length !== b.length) return false;
	var sa = a.slice().sort(), sb = b.slice().sort();
	for (var i = 0; i < sa.length; i++) { if (sa[i] !== sb[i]) return false; }
	return true;
}

function initColorPicker(colors) {
	if (arraysEqual(colors, DEFAULT_COLORS)) return;

	var container = document.getElementById('color_picker');
	container.style.display = 'block';
	container.innerHTML = '';

	var saved = localStorage.getItem('chosen_color');
	var validSaved = false;

	for (var i = 0; i < colors.length; i++) {
		var num = colors[i];
		var name = COLOR_NUM_TO_NAME[num];
		if (!name) continue;
		if (saved === name) validSaved = true;
	}

	if (!validSaved && colors.length > 0) {
		var firstName = COLOR_NUM_TO_NAME[colors[0]];
		if (firstName) {
			localStorage.setItem('chosen_color', firstName);
			saved = firstName;
		}
	}

	for (var j = 0; j < colors.length; j++) {
		var cnum = colors[j];
		var cname = COLOR_NUM_TO_NAME[cnum];
		var rgba = COLOR_RGBA[cnum];
		if (!cname || !rgba) continue;

		var circle = document.createElement('div');
		circle.className = 'cpick_circle';
		circle.dataset.colorName = cname;
		circle.style.setProperty('--cpick-color', rgba);

		var inner = document.createElement('div');
		inner.className = 'cpick_circle_inner';
		inner.style.backgroundColor = rgba;
		circle.appendChild(inner);

		if (saved === cname) {
			circle.classList.add('cpick_selected');
		}

		circle.addEventListener('click', (function(n) {
			return function() {
				localStorage.setItem('chosen_color', n);
				var all = container.querySelectorAll('.cpick_circle');
				for (var k = 0; k < all.length; k++) all[k].classList.remove('cpick_selected');
				this.classList.add('cpick_selected');
			};
		})(cname));

		container.appendChild(circle);
	}
}

(function(){
	var uid = _readCookie('user_id');
	if (!uid || uid === 'anonymous') return;

	var section = document.querySelector('.game_start_section');
	section.classList.add('signed_in_mode');

	fetch('/get_colors', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ user_id: uid })
	})
	.then(function(r) { return r.json(); })
	.then(function(res) {
		if (Array.isArray(res.data)) {
			initColorPicker(res.data);
		}
	})
	.catch(function() {});

	var savedMode = localStorage.getItem('game_mode');
	if (savedMode && { player:1, bot:1, friend:1 }[savedMode]) {
		active_mode = savedMode;
	}
	var savedBot = localStorage.getItem('selected_bot');
	var saved_bot_el = null;
	if (savedBot) {
		selected_bot = savedBot;
		saved_bot_el = document.querySelector('.bot_tab[data-bot="' + savedBot + '"]');
	}

	mp_socket = new WebSocket(location.origin.replace(/^http/, 'ws') + '/');

	var joinSound = new Audio('/sound/join_game.mp3');

	mp_socket.onmessage = function(event){
		var message = JSON.parse(event.data);
		switch (message.type) {
			case 'automatch-status':
				if (!in_queue) {
					var n = message.data.peopleAutomatching || 0;
					var statusEl = document.getElementById('match_status');
					if (n > 0) {
						statusEl.textContent = n + ' player' + (n > 1 ? 's' : '') + ' in queue';
					} else {
						statusEl.textContent = '';
					}
				}
				break;
			case 'challenge-wait':
				mp_friendly = 1;
				var link = location.origin + '/challenge/' + message.data.game_id;
				document.getElementById('challenge_link_text').textContent = link;
				document.getElementById('waiting_text').style.display = 'block';
				document.getElementById('copy_link_btn').style.display = 'inline';
				break;
			case 'match-found':
				joinSound.play();
				document.getElementById('game_transition_overlay').classList.add('active');
				setTimeout(function(){
					window.location.href = '/' + message.data.server + 'n/' + message.data.game_id;
				}, 2000);
				break;
		}
	};

	function enterQueue(){
		in_queue = 1;
		var btn = document.getElementById('landing_start_btn');
		btn.textContent = 'Cancel';
		btn.classList.add('btn_waiting');
		document.getElementById('vs_label').style.display = 'none';
		document.getElementById('mode_tabs').style.display = 'none';
		document.getElementById('match_status').style.display = 'none';
		document.getElementById('queue_waiting_text').style.display = 'inline';
		sendJoin('ranked');
	}

	function exitQueue(){
		in_queue = 0;
		var btn = document.getElementById('landing_start_btn');
		btn.textContent = 'Start game';
		btn.classList.remove('btn_waiting');
		document.getElementById('match_status').style.display = 'inline';
		document.getElementById('queue_waiting_text').style.display = 'none';
		location.reload();
	}

	function setActiveMode(mode, skipReload){
		if (in_queue && !skipReload) exitQueue();
		active_mode = mode;
		localStorage.setItem('game_mode', mode);
		challenge_sent = 0;
		mp_friendly = 0;

		document.querySelectorAll('.mode_tab').forEach(function(tab){
			tab.classList.remove('active');
		});
		document.getElementById('tab_' + mode).classList.add('active');

		document.querySelectorAll('.sub_panel').forEach(function(p){
			p.classList.remove('sub_panel_active');
		});
		var panelMap = { player: 'sub_player', bot: 'sub_bot', friend: 'sub_friend' };
		document.getElementById(panelMap[mode]).classList.add('sub_panel_active');

		if (mode === 'friend') {
			document.getElementById('challenge_link_text').textContent = '';
			document.getElementById('copy_link_btn').style.display = 'none';
			document.getElementById('waiting_text').style.display = 'none';
			sendJoin('challenge');
			challenge_sent = 1;
		}
	}

	document.getElementById('tab_player').addEventListener('click', function(){ setActiveMode('player'); });
	document.getElementById('tab_bot').addEventListener('click', function(){ setActiveMode('bot'); });
	document.getElementById('tab_friend').addEventListener('click', function(){ setActiveMode('friend'); });

	document.querySelectorAll('.bot_tab').forEach(function(tab){
		tab.addEventListener('click', function(){
			document.querySelectorAll('.bot_tab').forEach(function(t){ t.classList.remove('active'); });
			tab.classList.add('active');
			selected_bot = tab.getAttribute('data-bot');
			localStorage.setItem('selected_bot', selected_bot);
		});
	});

	document.getElementById('copy_link_btn').addEventListener('click', function(){
		var text = document.getElementById('challenge_link_text').textContent;
		if (text) copyToClipboard(text);
	});

	function sendJoin(type){
		if (!mp_socket || mp_socket.readyState !== WebSocket.OPEN) return;
		mp_socket.send(JSON.stringify({
			type: 'join',
			data: {
				user_id: _readCookie('user_id'),
				user_color: localStorage.getItem('chosen_color') || 'default',
				session_id: _readCookie('session_id'),
				type: type
			}
		}));
	}

	function copyToClipboard(text){
		var ta = document.createElement('textarea');
		ta.value = text;
		ta.style.position = 'fixed';
		ta.style.opacity = '0';
		document.body.appendChild(ta);
		ta.select();
		try { document.execCommand('copy'); } catch(e) {}
		document.body.removeChild(ta);
	}

	document.getElementById('landing_start_btn').removeEventListener('click', landing_start_game);
	document.getElementById('landing_start_btn').addEventListener('click', function(){
		if (active_mode === 'player') {
			if (in_queue) {
				exitQueue();
			} else {
				enterQueue();
			}
		} else if (active_mode === 'bot') {
			sendJoin(selected_bot);
		} else if (active_mode === 'friend') {
			if (mp_friendly) {
				var text = document.getElementById('challenge_link_text').textContent;
				if (text) copyToClipboard(text);
			}
		}
	});

	// Restore saved mode and bot selection
	if (active_mode !== 'bot') {
		if (active_mode === 'friend') {
			mp_socket.addEventListener('open', function(){
				setActiveMode('friend', true);
			});
		} else {
			setActiveMode(active_mode, true);
		}
	}
	if (saved_bot_el) {
		document.querySelectorAll('.bot_tab').forEach(function(t){ t.classList.remove('active'); });
		saved_bot_el.classList.add('active');
	}

	setInterval(function(){
		if (mp_socket && mp_socket.readyState === WebSocket.OPEN) {
			mp_socket.send(JSON.stringify({ type: 'heartbeat', data: { type: 'heartbeat' } }));
		}
	}, 3000);
})();


// --- Canvas resize ---

window.onresize = function(){
	var canvas1 = document.getElementById('main_canvas');
	var canvas2 = document.getElementById('base_canvas');
	var _dpr = window.devicePixelRatio || 1;
	canvas1.width = window.innerWidth * _dpr;
	canvas1.style.width = window.innerWidth + 'px';
	canvas1.height = window.innerHeight * _dpr;
	canvas1.style.height = window.innerHeight + 'px';
	canvas2.width = window.innerWidth * _dpr;
	canvas2.style.width = window.innerWidth + 'px';
	canvas2.height = window.innerHeight * _dpr;
	canvas2.style.height = window.innerHeight + 'px';
	if (typeof dpr !== 'undefined') dpr = _dpr;
	offsetUpdate();
};


// --- Init ---

set_stage();
