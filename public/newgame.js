function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function update_links(){
  let buy_links = document.querySelectorAll("a.buy");
  let this_user = getCookie('user_id');
  for (link of buy_links){
	  link.href += this_user;
  }
}

function game_window_setup(){
  if (getCookie('user_id') == 'anonymous' || getCookie('user_id') == null){
	  document.getElementById('buy_more_colors').style.display = 'none';
	  document.getElementById('main_button').style.padding = '0px 52px 0px 52px';
	  replace_button_prompt();
  } else {
	  document.getElementById('buy_more_colors').style.display = 'inline-block';
	  document.getElementById('main_button').style.padding = '0px 38px 0px 38px';
	  document.getElementById('main_button').style.pointerEvents = 'auto';
	  document.getElementById('choose_color_block').style.display = 'block';
	  document.getElementById('choose_playstyle_block').style.opacity = 0;
	  document.getElementById('choose_playstyle_block').style.pointerEvents = 'none';
	  document.getElementById('main_button_versus').style.display = 'inline-block';
	  document.getElementById('button_prompt').style.opacity = 0;
	  document.getElementById('main_button').style.opacity = 1;
	  document.getElementById('create_acc_prompt').style.opacity = 0;
  }
  
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
	  	case 'ps_lego-bot':
		case 'ps_andersgee-bot':
		case 'ps_ranked':
	  		set_versus_state(el.id);
			dismissals();
			restore_view();
	  		break;
		case 'ps_friend':
	  		set_versus_state(el.id);
			dismissals();
			start_game();
			break;
	  	case '':
	  	case 'ps_bot_index_options':
	  	case 'ps_main_options':
		case 'ps_human_options':
	  	case 'player_selection_wrap':
	  		dismissals();
	  		break;
	  	case 'upload_bot_box':
	  		break;
		case 'ps_sandbox':
			window.location.href = '/boxsand';
			break;
	  	default:
	  		break;
	}

}

function style_selection(e){
	e = e || window.event;
	let el = (e.target || e.srcElement);

	document.getElementById('playstyle_manual').classList.remove('playstyle_active');
	document.getElementById('playstyle_code').classList.remove('playstyle_active');
	if (el.id == 'playstyle_manual'){
		document.getElementById('playstyle_manual').classList.add('playstyle_active');
		selected_playstyle = 'manual';
		localStorage.setItem("chosen_playstyle", 'manual');
	} else {
		document.getElementById('playstyle_code').classList.add('playstyle_active');
		selected_playstyle = 'code';
		localStorage.setItem("chosen_playstyle", 'code');
	}
	
}

function color_selection(e){
	e = e || window.event;
	let el = (e.target || e.srcElement);
	let col_name = el.id.split('_')[1];

	switch (col_name){
	  	case 'more':
			show_paid_colors();
	  		break;
	  default:
		set_color(col_name);
	  		break;
	}
}


function versus_selection(){
	bs_player_selection();
}

function set_versus_state(sel){
  let pl_name = sel.split('_')[1];
  reset_pl_sel();
  reset_bot_sel();
  selected_versus = sel;
  if (pl_name != 'friend') localStorage.setItem('versus', sel);
  document.getElementById(sel).classList.add('card_active');
  document.getElementById('vs_name').innerHTML = pl_name;
}

function set_color(col_name){
  if (!(col_name in color_table)){
	  col_name = 'gblue';
  }
  localStorage.setItem('chosen_color', col_name);
  selected_color = col_name;
  reset_color_borders();
  color_border(col_name);
}

function color_border(col_name){
  if (col_name == 'default') return;
  let color_el = document.getElementById('color_' + col_name + '_border')
  color_el.style.borderWidth = '2px';
  color_el.style.borderColor = color_table[col_name][0];
}

// ----

function reset_pl_sel(){
document.getElementById('ps_ranked').classList.remove('card_active');
document.getElementById('ps_friend').classList.remove('card_active');
}

function reset_bot_sel(){
document.getElementById('ps_dumb-bot').classList.remove('card_active');
document.getElementById('ps_medium-bot').classList.remove('card_active');
document.getElementById('ps_hard-bot').classList.remove('card_active');
document.getElementById('ps_lego-bot').classList.remove('card_active');
document.getElementById('ps_andersgee-bot').classList.remove('card_active');
}

function reset_color_borders(){
  for (let el of document.querySelectorAll('.color_option')){
  	el.style.borderWidth = '1px';
	el.style.borderColor = color_table['default'][0];
  }
}

function fill_color_insides(){
  // :so-smart:
  document.getElementById('color_gblue').style.backgroundColor = color_table['gblue'][0];
  document.getElementById('color_purply').style.backgroundColor = color_table['purply'][0];
  document.getElementById('color_redish').style.backgroundColor = color_table['redish'][0];
  document.getElementById('color_yerange').style.backgroundColor = color_table['yerange'][0];
  document.getElementById('color_pistagre').style.backgroundColor = color_table['pistagre'][0];
  document.getElementById('color_wirple').style.backgroundColor = color_table['wirple'][0];
  document.getElementById('color_magion').style.backgroundColor = color_table['magion'][0];
  document.getElementById('color_rozblue').style.backgroundColor = color_table['rozblue'][0];
  document.getElementById('color_lolight').style.backgroundColor = color_table['lolight'][0];
  document.getElementById('color_legorange').style.backgroundColor = color_table['legorange'][0];
  document.getElementById('color_brigenta').style.backgroundColor = color_table['brigenta'][0];
  document.getElementById('color_greson').style.backgroundColor = color_table['greson'][0];
  document.getElementById('color_mmmsalmon').style.backgroundColor = color_table['mmmsalmon'][0];
  document.getElementById('color_skyblue').style.backgroundColor = color_table['skyblue'][0];
  document.getElementById('color_toored').style.backgroundColor = color_table['toored'][0];
}

// -----


function get_user_colors(){
  //let temp_clr_arr = [1, 2, 3, 4, 5, 6, 8];
  
fetch('/get_colors', {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
	        user_id: getCookie('user_id'),
	        session_id: getCookie('session_id')
	    })

  }).then(response => response.json())
    .then(response => {
	  if (response.data == "no user found"){
	  } else if (response.data == "something went wrong"){
	  } else {
		  let clr_arr = response.data;
		  
		  for (clr_code of clr_arr){
			  if (clr_code > 4) {
				  els = document.getElementsByClassName('ex_c_' + (clr_code - 4));
				  els[0].style.opacity = 1;
				  els[0].style.display = "block";
				  els[0].style.pointerEvents = "auto";
				  els[0].href = "#";
				  try {
				  	document.querySelector('.ex_c_' + (clr_code - 4) + ' .color_price').style.display = 'none';
				  } catch (e) {
				  	
				  }
				  
			  }
		  	  
		  }
	  	  //add_user_colors(response.data)
	  }
  })
    .catch(err => {
	  console.error(err);
  });
}

function show_paid_colors(){
  document.getElementById("paid_colors").style.pointerEvents = "auto";
  document.getElementById("buy_more_colors").style.display = "none";
  
  let buy_colors = document.querySelectorAll("a.buy");
  for (clr of buy_colors){
	  clr.style.opacity = 1;
	  clr.style.display = "block";
	  clr.style.pointerEvents = "auto";
  }
}



// ----- -----

const socket = new WebSocket(location.origin.replace(/^http/, 'ws') + '/');

socket.onmessage = (event) => {
	let msg = event.data
	let message = JSON.parse(msg)
	switch (message.type) {
		case "automatching":
			break;
		case "automatch-status":
			break;
		case "challenge-wait":
			const challengeLink = `${location.origin}/challenge/${message.data.game_id}`;
			friendly = 1;
			document.getElementById("ch_link").innerText = challengeLink;
			break;
		case "match-found":
			joinSound.play()
			setTimeout(() => {
				window.location.href = `/${message.data.server}n/${message.data.game_id}`;
			}, joinSound.duration * 1000)
			break;
		default:
			break;
	}
}



function start_game(e){
	e = e || window.event;
	let el = (e.target || e.srcElement);
	if (el.id == 'main_button_versus' || el.id == 'vs_name') return;

	//if (getCookie('user_id') == undefined || getCookie('user_id') == "anonymous"){
	//	alert('please login first!');
	//	return;
	//}
	
	let game_type = selected_versus.split('_')[1];
	if (selected_versus == 'ps_friend') game_type = 'challenge';
	if (game_type == 'challenge'){
		wait_challenge_view();
	} else if (["easy-bot", "dumb-bot", "medium-bot", "will-bot", "boom-bot", "hard-bot", "lego-bot", "andersgee-bot"].includes(game_type)){
		//document.getElementById("game_selections").classList.add("hidden")
		//document.getElementById("choose_playstyle_block").classList.add("hidden")
		//document.getElementById("choose_color_block").classList.add("hidden")
		//document.getElementById("main_button").classList.add("hidden")
		get_ready_view();
	} else {
		wait_opponent_view();
	}
	
	if (friendly){
		code_to_copy = document.getElementById('ch_link').innerHTML;
		copyTextToClipboard(code_to_copy, '#' + el.id);
	} else {
		socket.send(JSON.stringify({
			"type": "join",
			"data": {
				user_id: getCookie('user_id'),
		    	user_color: selected_color,
				session_id: getCookie('session_id'),
				type: game_type
		  	}
		}))
	}
	
}

function heartbeat(){
	
	socket.send(JSON.stringify({
		"type": "heartbeat",
		"data": {
			type: "heartbeat"
	  	}
	}));
	
	
}

function cncl_game(){
	location.reload();
}

function reset_play_type_ilu(){
	document.getElementById('play_type_ilu').classList.remove('ilu_js');
	document.getElementById('play_type_ilu').classList.remove('ilu_py');
	document.getElementById('play_type_ilu').classList.remove('ilu_mouse');
	document.getElementById('play_type_ilu').classList.remove('ilu_touch');
	document.getElementById('play_type_ilu').classList.remove('ilu_more');
}

function play_type_hover(e){
	e = e || window.event;
	let el = (e.target || e.srcElement);
	reset_play_type_ilu();
	let ilu_type = el.id.split('_')[1];
	document.getElementById('play_type_ilu').classList.add('ilu_' + ilu_type);
	
	for (let el of play_types){
		el.style.opacity = 0.4;
	}
	el.style.opacity = 1;
}



function copyTextToClipboard(text, target) {
  var copyTextArea = document.createElement("textarea");
  copyTextArea.style.position = 'fixed';
  copyTextArea.style.top = 0;
  copyTextArea.style.left = 0;
  copyTextArea.style.width = '2em';
  copyTextArea.style.height = '2em';
  copyTextArea.style.border = 'none';
  copyTextArea.style.outline = 'none';
  copyTextArea.style.boxShadow = 'none';
  copyTextArea.style.background = 'transparent';
  copyTextArea.value = text;
  document.body.appendChild(copyTextArea);
  copyTextArea.focus();
  copyTextArea.select();
  
  try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      code_copy_success(target);
    } catch (err) {
      console.error(err);
    }

  document.body.removeChild(copyTextArea);
}


// ----- -----




var from_nongame = 1;
var selected_versus = 'ps_dumb-bot';
var selected_color = 'default';
var selected_playstyle = 'manual';
var friendly = 0;
var color_table = {
  'default': ['rgba(242, 246, 250, 0.32)', 'rgba(242, 246, 250, 0.32)', 'invert(85%) sepia(16%) saturate(939%) hue-rotate(196deg) brightness(103%) contrast(104%)'],
  'gblue': ['rgba(28, 196, 240, 1)', 'rgba(48, 216, 255, 1)', 'invert(79%) sepia(63%) saturate(3217%) hue-rotate(159deg) brightness(104%) contrast(101%)'],
  'purply': ['rgba(128, 140, 255, 1)', 'rgba(168, 180, 255, 1)', 'invert(79%) sepia(47%) saturate(5593%) hue-rotate(201deg) brightness(102%) contrast(101%)'],
  'redish': ['rgba(235, 119, 103, 1)', 'rgba(255, 139, 123, 1)', 'invert(61%) sepia(41%) saturate(3152%) hue-rotate(322deg) brightness(105%) contrast(84%)'],
  'yerange': ['rgba(218, 183, 96, 1)', 'rgba(238, 203, 116, 1)', 'invert(90%) sepia(7%) saturate(2795%) hue-rotate(345deg) brightness(94%) contrast(99%)'],
  'wirple': ['rgba(120,12,196,1)', 'rgba(150,52,236,1)', 'invert(32%) sepia(67%) saturate(5808%) hue-rotate(261deg) brightness(93%) contrast(99%)'],
  'pistagre': ['rgba(148, 176, 108, 1)', 'rgba(168, 196, 128, 1)', 'invert(86%) sepia(12%) saturate(982%) hue-rotate(40deg) brightness(87%) contrast(87%)'],
  'magion': ['rgba(180, 27, 227, 1)', 'rgba(200, 57, 247, 1)', 'invert(27%) sepia(52%) saturate(4052%) hue-rotate(272deg) brightness(104%) contrast(94%)'],
  'rozblue': ['rgba(18, 255, 248, 1)', 'rgba(28, 255, 254, 1)'],
  'lolight': ['rgba(202, 202, 202, 1)', 'rgba(212, 212, 212, 1)', 'invert(100%) sepia(0%) saturate(4403%) hue-rotate(53deg) brightness(121%) contrast(66%);'],
  'legorange': ['rgba(235, 93, 0, 1)', 'rgba(255, 103, 0, 1)', 'invert(41%) sepia(43%) saturate(1933%) hue-rotate(356deg) brightness(105%) contrast(113%)'],
  'brigenta': ['rgba(198, 166, 224, 1)', 'rgba(218, 174, 240, 1)', 'invert(77%) sepia(29%) saturate(838%) hue-rotate(213deg) brightness(97%) contrast(94%)'],
  'greson': ['rgba(138, 228, 122, 1)', 'rgba(158, 248, 142, 1)', 'invert(81%) sepia(70%) saturate(311%) hue-rotate(51deg) brightness(103%) contrast(94%)'],
  'mmmsalmon': ['rgba(232, 198, 179, 1)', 'rgba(252, 218, 199, 1)', 'invert(83%) sepia(3%) saturate(2951%) hue-rotate(327deg) brightness(109%) contrast(98%)'],
  'skyblue': ['rgba(78, 142, 250, 1)', 'rgba(108, 152, 255, 1)', 'invert(64%) sepia(82%) saturate(2896%) hue-rotate(198deg) brightness(99%) contrast(106%)'],
  'toored': ['rgba(240, 70, 60, 1)', 'rgba(250, 90, 80, 1)', 'invert(47%) sepia(12%) saturate(4978%) hue-rotate(324deg) brightness(102%) contrast(96%)']
};
const joinSound = new Audio("/sound/join_game.mp3");


if (localStorage.getItem("versus") != null) selected_versus = localStorage.getItem("versus");
if (localStorage.getItem("chosen_color") != null) selected_color = localStorage.getItem("chosen_color");
if (localStorage.getItem("chosen_playstyle") != null) {
	selected_playstyle = localStorage.getItem("chosen_playstyle");
} else {
	localStorage.setItem('chosen_playstyle', 'manual');
}

game_window_setup();

set_versus_state(selected_versus);
set_color(selected_color);

fill_color_insides();
update_links();
get_user_colors();


document.getElementById('player_selection_wrap').addEventListener('click', player_selection_crossroad, false);
document.getElementById('choose_playstyle_block').addEventListener('click', style_selection, false);
document.getElementById('choose_color_block').addEventListener('click', color_selection, false);
document.getElementById('main_button_versus').addEventListener('click', versus_selection, false);
document.getElementById('main_button').addEventListener('click', start_game, false);
document.getElementById('cncl_button').addEventListener('click', cncl_game, false);

document.getElementById('mechanics_button').addEventListener('click', show_mechanics, false);
document.getElementById('mechanics_close_btn').addEventListener('click', hide_mechanics, false);

document.getElementById('new_acc_link').addEventListener('click', new_account, false);

let play_types = document.getElementsByClassName('play_type');
for (let el of play_types){
	el.addEventListener('mouseover', play_type_hover, false);
}

setInterval(function(){ heartbeat() }, 3000);
