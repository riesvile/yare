//Hello


// ------
// Pointer handling
// ------

var mousey = 0;
var pointer_originX = 0;
var pointer_originY = 0;
var pointer_offsetX = 0;
var pointer_offsetY = 0;
var current_offsetX = 800;
var current_offsetY = 900;
var panning = 0;
var disableSelection = 0;

var board_x = 0;
var board_y = 0;
var pointing_at_x = 0;
var pointing_at_y = 0;

function baseOffsetUpdate(){
	world_bases = bases.length;
	for (i = 0; i < world_bases; i++){
		c_base.clearRect(base_lookup[bases[i].id].position[0] - 40, base_lookup[bases[i].id].position[1] - 40, base_lookup[bases[i].id].position[0] + 40, base_lookup[bases[i].id].position[0] + 40);
		base_lookup[bases[i].id].draw();
	}
	
	//draw_grid();
}


function offsetUpdate(){
	
	//c_base.fillStyle = 'rgba(6,8,100,0.1)'
	c_base.clearRect(-offsetX, -offsetY, main_canvas.width * multiplier, main_canvas.height * multiplier);
	
	//c.fillStyle = 'rgba(6,8,100,0.1)';
	c.clearRect(-offsetX, -offsetY, main_canvas.width * multiplier, main_canvas.height * multiplier);
	
	
	//c.setTransform(1, 0, 0, 1, 0, 0);
	c_base.setTransform(scale, 0, 0, scale, 0, 0);
	c_base.translate(offsetX, offsetY);
	//c.translate(offsetX, offsetY);
	
	//world_spirits = living_spirits.length;
	//for (i = 0; i < world_spirits; i++){
	//	spirit_lookup[living_spirits[i].id].draw();
	//}
	
	world_stars = stars.length;
	for (i = 0; i < world_stars; i++){
		star_lookup[stars[i].id].draw();
	}
	
	//world_bases = bases.length;
	//for (i = 0; i < world_bases; i++){
	//	base_lookup[bases[i].id].draw();
	//}
	
	draw_grid();
	
}

function zoomUpdate(){
	
	//c_base.fillStyle = 'rgba(6,8,100,0.1)'
	c_base.clearRect(-offsetX, -offsetY, main_canvas.width * multiplier, main_canvas.height * multiplier);
	
	
	//c.setTransform(1, 0, 0, 1, 0, 0);
	c_base.setTransform(scale, 0, 0, scale, 0, 0);
	c_base.translate(offsetX, offsetY);
	//c.translate(offsetX, offsetY);
	
	//world_spirits = living_spirits.length;
	//for (i = 0; i < world_spirits; i++){
	//	spirit_lookup[living_spirits[i].id].draw();
	//}
	
	world_stars = stars.length;
	for (i = 0; i < world_stars; i++){
		star_lookup[stars[i].id].draw();
	}
	
	//world_bases = bases.length;
	//for (i = 0; i < world_bases; i++){
	//	base_lookup[bases[i].id].draw();
	//}
	
	//draw_grid();
	
}


function pinchStart(e){
	var pinch_start_val = 0;
	prevScale = scale;
	dist_init = Math.hypot(
	    e.touches[0].pageX - e.touches[1].pageX,
	    e.touches[0].pageY - e.touches[1].pageY);
		
	prev_offsetX = offsetX;
	prev_offsetY = offsetY;
	xxx = (e.touches[0].clientX + e.touches[1].pageX) / 2;
	yyy = (e.touches[0].pageY + e.touches[1].pageY) / 2;
}

function pinchMove(e){
	var dist = Math.hypot(
	    e.touches[0].pageX - e.touches[1].pageX,
	    e.touches[0].pageY - e.touches[1].pageY) - dist_init
		
	scale = prevScale + (dist / 1000);
	scale = Math.round(Math.min(Math.max(.5, scale), 2) * 100) / 100;
	multiplier = 1 / scale;
	
    offsetX = prev_offsetX + (xxx * 1/scale) - (xxx * 1/prevScale);
    offsetY = prev_offsetY + (yyy * 1/scale) - (yyy * 1/prevScale);
	
	
	zoomUpdate();
}


function onPointerDown(e){ 
	e = e || window.event;
	
	
	try {
		if (e.touches.length === 2) {
		    scaling = true;
		    pinchStart(e);
		}
	} catch (e) {
		//console.log(e);
	}
	
	//console.log(e);
	if (scaling != true){
		var el_id = (e.target || e.srcElement).id;
		//console.log('down id= ' + el_id);
	
		//console.log(el_id);
		if (el_id == 'panel_dragger'){
			disableSelection = 1;
			panel_dragging = 1;
			//console.log('panel_el.style = ');
			//console.log(panel_el.getBoundingClientRect());
			panel_el_widtho = panel_el.getBoundingClientRect().width;
		} else if (el_id != 'base_canvas'){
			return;
		} else if (el_id == 'tutorial_wrap' || el_id == 'tut_helper'){
			//console.log('thissisis');
			disableSelection = 0;
		} else {
			disableSelection = 1;
		}
	
		if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
		    var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		    var touch = evt.touches[0] || evt.changedTouches[0];
		    x = touch.pageX;
		    y = touch.pageY;
			mousey = 1;
		} else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
		    x = e.clientX;
		    y = e.clientY;
			if (e.which === 1){
				mousey = 1;
			}
		}
	
		hide_hover();
		//console.log('mouse down');
		pointer_originX = x;
		pointer_originY = y;
		current_offsetX = offsetX;
		current_offsetY = offsetY;
	}
	
}

function onPointerMove(e){
	e = e || window.event;
	//console.log(panel_dragging);
	
	if (scaling) {
	    pinchMove(e);
	} else {
		if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
		    var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		    var touch = evt.touches[0] || evt.changedTouches[0];
		    x = touch.pageX;
		    y = touch.pageY;
		} else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
		    x = e.clientX;
		    y = e.clientY;
		}
	
		if (disableSelection == 1){
			e.preventDefault();
		}
	
	
		if (mousey == 1){
			//console.log('mouse moving');
			panning = 1;
			//console.log(x + " / " + y);
			
			if (panel_dragging == 1){
				//console.log('dragging panel');
				//console.log('x delta = ' + (x - pointer_originX));
				var panel_width_delta = x - pointer_originX;
				var new_panel_width = panel_el_widtho + panel_width_delta;
				
				if (new_panel_width < 100){
					new_panel_width = 100;
					document.getElementById('panel_dragger').style.width = "100px";
				} else if (new_panel_width > 1000) {
					new_panel_width = 1000;
				} else {
					document.getElementById('panel_dragger').style.width = "20px";
				}
				
				panel_el.style.width = new_panel_width + 'px';
				editor_container_el.style.width = new_panel_width + 'px';
				editor.resize();
			} else {
				pointer_offsetX = (x - pointer_originX) * multiplier;
				pointer_offsetY = (y - pointer_originY) * multiplier;
		
				offsetX = pointer_offsetX + current_offsetX;
				offsetY = pointer_offsetY + current_offsetY;
			}
			//offsetUpdate();
		} else {
			board_x = x*multiplier - offsetX;
			board_y = y*multiplier - offsetY;
			//console.log('x = ' + board_x);
			//console.log('y = ' + board_y);
		
			pointing_at_x = x;
			pointing_at_y = y;
		
			fill_hover_thing(x, y, board_x, board_y);
		
		
		}
	}
	//console.log(disableSelection);
	
}

function onPointerUp(e){ 
	//console.log('mouse up');
	if (scaling) {
	    //pinchEnd(e);
	    scaling = false;
	}
	
	mousey = 0;
	panning = 0;
	panel_dragging = 0;
	disableSelection = 0;
	offsetUpdate();
}

function getMousePos(e) {
    return {x:e.clientX,y:e.clientY};
}

function fill_hover_thing(xx, yy, board_xx, board_yy){
	var hoveroid = document.getElementById('game_hover');
	hoveroid.style.bottom = window.innerHeight - yy + 10 + 'px';
	hoveroid.style.left = xx + 'px';
	var hover_content = [];
	
	for (i = 0; i < living_spirits.length; i++){
		if(living_spirits[i].hp == 0) continue;
		if (Math.abs(living_spirits[i].position[0] - board_xx) <= 10 && Math.abs(living_spirits[i].position[1] - board_yy) <= 10){
			hover_content.push(['spirit', living_spirits[i].id, Math.floor(living_spirits[i].energy)]);
		}
	}
	
	for (b = 0; b < bases.length; b++){
		if (Math.abs(bases[b].position[0] - board_xx) <= 30 && Math.abs(bases[b].position[1] - board_yy) <= 30){
			hover_content.push(['base', bases[b].id, Math.floor(bases[b].energy), bases[b].position, bases[b].def_status, bases[b].current_spirit_cost]);
		}
	}
	
	for (s = 0; s < stars.length; s++){
		if (Math.abs(stars[s].position[0] - board_xx) <= 50 && Math.abs(stars[s].position[1] - board_yy) <= 50){
			hover_content.push(['star', stars[s].id]);
		}
	}
	
	
	if (hover_content.length == 0){
		hide_hover();
	} else if (hover_content.length == 1){
		show_hover();
		if (hover_content[0][0] == 'spirit'){
			hoveroid.innerHTML = "<span class='spirit_id'>" + hover_content[0][1] + "</span><span class='spirit_energy'>" + hover_content[0][2] + " <span class='lowlight'>energy</span></span>";
		} else if (hover_content[0][0] == 'base'){
			hoveroid.innerHTML = "<span class='base_id'><span class='lowlight'>" + hover_content[0][1] + "</span></span><span class='base_energy'>" + hover_content[0][2] + " <span class='lowlight'>energy</span></span>";
			hoveroid.innerHTML += "<span class='new_when'>new spirit at <span class='highlight'>" + hover_content[0][5] + "</span></span>"
			if (hover_content[0][4] == 1){
				hoveroid.innerHTML += "<span class='under_attack'>enemies in sight, production paused</span>"
			}
			hoveroid.style.bottom = window.innerHeight - yy - 20 + 'px';
			hoveroid.style.left = xx + 50 + 'px';
		} else if (hover_content[0][0] == 'star'){
			hoveroid.innerHTML = "<span class='star_id'>" + hover_content[0][1] + "</span>";
			hoveroid.style.bottom = window.innerHeight - yy + 10 + 'px';
			hoveroid.style.left = xx - 20 + 'px';
		}
	} else if (hover_content.length > 4){
		show_hover();
		var total_eng = 0;
		for (j = 0; j < hover_content.length; j++){
			total_eng += hover_content[j][2];
		}
		hoveroid.innerHTML = "<span class='spirit_id'>" + hover_content[0][1] + " + " + (hover_content.length - 1) + " spirits</span><span class='spirit_energy'>" + total_eng + " <span class='lowlight'>total energy</span></span>";
	} else {
		show_hover();
		var temp_fill = '';
		for (j = 0; j < hover_content.length; j++){
			temp_fill += "<span class='spirit_id'>" + hover_content[j][1] + "<span class='lowlight'> · " + hover_content[j][2] + "</span></span>"
		}
		hoveroid.innerHTML = temp_fill;
	}
}


function zoom(event) {
  event.preventDefault();
  prevScale = scale;
  scale += event.deltaY * -0.005;
  //multiplier += event.deltaY * 0.005;

  // Restrict scale
  scale = Math.round(Math.min(Math.max(.5, scale), 2) * 100) / 100;
  multiplier = 1 / scale;
  
  if (scale > 1.7){
	  document.getElementById('game_hover').style.fontSize = "15px";
	  document.getElementById('game_hover').style.lineHeight = "20px";
  } else if (scale > 1.3){
	  document.getElementById('game_hover').style.fontSize = "13px";
	  document.getElementById('game_hover').style.lineHeight = "18px";
  } else {
  	document.getElementById('game_hover').style.fontSize = "11px";
  }
 
  //console.log('scale = ' + scale);
  //console.log('prevscale = ' + prevScale);
  //console.log('scale/prev = ' + (scale/prevScale));
  //console.log('multiplier = ' + multiplier);
  
  
  
  if (scale > 2 || scale < 0.5){
  	
  } else {
	  var mousePos = getMousePos(event);
	  //console.log(mousePos.x);
	  
	  //(mousePos.x * scale) - (mousePos.x * prevScale)
  
  	 //!!!!!!!!! IT's a LOGARITMIC SCALE not linear!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  
  
	  //offsetX += (mousePos.x * prevScale) - (mousePos.x * scale);
	  //offsetY += (mousePos.y * prevScale) - (mousePos.y * scale);
	  //offsetX += (mousePos.x * (1 - scale/prevScale));
	  //offsetY += (mousePos.y * (1 - scale/prevScale));
	  
	  offsetX += (mousePos.x * 1/scale) - (mousePos.x * 1/prevScale);
	  offsetY += (mousePos.y * 1/scale) - (mousePos.y * 1/prevScale);
	  
	  
	  //offsetX += -900 * (scale - prevScale);
	  //offsetY += -900 * (scale - prevScale);
	  //offsetX += mousePos.x * (0.005);
	  //offsetY += mousePos.y * (0.005);
  	  //offsetUpdate();
	  zoomUpdate();
	  
  }
  
  

  // Apply scale transform
  //el.style.transform = `scale(${scale})`;
}


// Add event listeners
document.addEventListener("touchstart", onPointerDown, false);
document.addEventListener("touchmove", onPointerMove, false);
document.addEventListener("touchend", onPointerUp, false);

document.addEventListener("mousedown", onPointerDown, false);
document.addEventListener("mousemove", onPointerMove, false);
document.addEventListener("mouseup", onPointerUp, false);

var scaling = false;
var prevScale = 1;
var dist_init = 0;
var prev_offsetX = 0;
var prev_offsetY = 0;
var xxx = 0;
var yyy = 0;

var panel_dragging = 0;
var panel_el = document.getElementById('panel');
var editor_container_el = document.getElementById('editor_container')
var panel_el_widtho = 0;



//var canvasTouch = document.getElementById("base_canvas");
//canvasTouch.addEventListener("ontouchstart")

document.getElementById("panel").addEventListener("mouseenter", function(e) {
	if (mousey != 1){
		document.getElementById("panel").style.backgroundColor = "rgba(24, 20, 30, 0.6)";
		document.getElementById("panel").style.backdropFilter = "blur(12px)";
	}

}, false);

document.getElementById("panel").addEventListener("mousedown", function(e) {
	if (mousey != 1){
		document.getElementById("panel").style.backgroundColor = "rgba(24, 20, 30, 0.6)";
		document.getElementById("panel").style.backdropFilter = "blur(12px)";
	}
    if (tutorial_started == 0){
	//    tutorial_started = 1;
	//    tut_start();
    }

}, false);

document.getElementById("panel").addEventListener("mouseleave", function(e) {
	if (mousey != 1){
		document.getElementById("panel").style.backgroundColor = "rgba(24, 20, 30, 0.6)";
		document.getElementById("panel").style.backdropFilter = "blur(12px)";
	}

}, false);




// Console 

function console_toggle(){
	var console_content_height = document.getElementById("console_in").clientHeight;
	if (document.getElementById("console").classList.contains("collapsed")){
		console_expanding(console_content_height);
		cnsl_expanded = 1;
	} else {
		console_collapsing(console_content_height);
		cnsl_expanded = 0;
	}
	
	
	document.getElementById("console").classList.toggle("collapsed");
	
	
	
}

document.getElementById("console_head").addEventListener("click", console_toggle, false);



// ------
// Game rendering
// ------

const main_canvas = document.getElementById('main_canvas');
const base_canvas = document.getElementById('base_canvas');
const c = main_canvas.getContext('2d');
const c_base = base_canvas.getContext('2d');
main_canvas.width = innerWidth;
main_canvas.height = innerHeight;
base_canvas.width = innerWidth;
base_canvas.height = innerHeight;
c.scale (1, 1);
c_base.scale (1, 1);

base_canvas.onwheel = zoom;
//c.translate(800, 900);

var offsetX = 0;
var offsetY = 0;
var scale = 1;
var prev_scale = 1;
var z_level = 1;
var multiplier = 1;

var game_tick = 1000; // 1s
var fps = 60;

var living_spirits = [];
var stars = [];
var bases = [];
var spirit_lookup = {};
var star_lookup = {};
var base_lookup = {};

var player1_color;
var player2_color;

var colors = {};
var shapes = {};
colors['color1'] = 'rgba(128,140,255,1)';
colors['color2'] = 'rgba(232,97,97,1)';

var shouting = {};



var dumb_cycler = 0;


//flags

var world_initiated = 0;


function game_over(winner){
	//alert('game over, ' + winner + ' won');
	if (game_ended == 1){
		return;
	}
	
	game_ended = 1;
	
	var p111_rating = 0;
	var p222_rating = 0;
	
  	fetch('/gameinfo', {
  	        method: "POST",
  	        headers: {
  	          Accept: "application/json",
  	          "Content-Type": "application/json"
  	        },
  	        body: JSON.stringify({
  		        game_id: this_game_id
  		    })

      }).then(response => response.json())
        .then(response => {
		  p111_rating = response.p1_rating;
		  p222_rating = response.p2_rating;
  		  //console.log(response);
	  	  //document.getElementById('player1_rating').innerHTML = p111_rating + "<span class='player_delta' id='player1_delta'>+10</span>";
	  	  //document.getElementById('player2_rating').innerHTML = p222_rating + "<span class='player_delta' id='player1_delta'>-9</span>";
	  	  document.getElementById('player1_shape').innerHTML = "<span class='ico_circle' style='background-color: " + colors['color1'] + "'></span>";
	  	  document.getElementById('player2_shape').innerHTML = "<span class='ico_circle' style='background-color: " + colors['color2'] + "'></span>";
		  
		  setTimeout(function(){
		  	
  	    	fetch('/playerinfo', {
  	    	        method: "POST",
  	    	        headers: {
  	    	          Accept: "application/json",
  	    	          "Content-Type": "application/json"
  	    	        },
  	    	        body: JSON.stringify({
  	    		        pla1: pla1,
  						pla2: pla2
  	    		    })

  	        }).then(response => response.json())
  	          .then(response => {
  				  var p111_delta = response.pla1_rating - p111_rating;
  				  var p222_delta = response.pla2_rating - p222_rating;
  				  var p111_delta_string = "<span class='player_delta' id='player1_delta'>+" + p111_delta + "</span>";
  				  var p222_delta_string = "<span class='player_delta' id='player2_delta'>+" + p222_delta + "</span>";
				  
  				  if (p111_delta > 0){
  				  	p111_delta_string = "<span class='player_delta delta_positive' id='player1_delta'>+" + p111_delta + "</span>";
  				  } else if (p111_delta < -1){
  				  	p111_delta_string = "<span class='player_delta delta_negative' id='player1_delta'>" + p111_delta + "</span>";
  				  }
				  
  				  if (p222_delta > 0){
  				  	p222_delta_string = "<span class='player_delta delta_positive' id='player2_delta'>+" + p222_delta + "</span>";
  				  } else if (p222_delta < -1){
  				  	p222_delta_string = "<span class='player_delta delta_negative' id='player2_delta'>" + p222_delta + "</span>";
  				  }
				  
  			  	  document.getElementById('player1_rating').innerHTML = p111_rating + p111_delta_string;
  			  	  document.getElementById('player2_rating').innerHTML = p222_rating + p222_delta_string;
  	    	  })
  	          .catch(err => {
  	    		  //console.log(err);
  	    	  });
			
		  }, 1000);
		  
	    	
  	  })
        .catch(err => {
  		  //console.log(err);
  	  });
	
	if (tutorial_phase > 1){
		//it's a tutorial game
		document.getElementById('ranked_nonranked').innerHTML = 'Non-ranked';
		document.getElementById('tutorial_over').style.display = 'block';
		if (getCookie('user_id') == "anonymous"){
			document.getElementById('over_new_account').style.display = 'inline-block';
			document.getElementById('over_login').style.display = 'inline-block';
			document.getElementById('back_to_hub').style.display = 'none';
		} else {
			pla1 = getCookie('user_id');
			document.getElementById('over_new_account').style.display = 'none';
			document.getElementById('over_login').style.display = 'none';
			document.getElementById('back_to_hub').style.display = 'block';
		}
	} else {
		document.getElementById('tutorial_over').style.display = 'none';
		document.getElementById('game_result').innerHTML = winner + ' won';
		document.getElementById('over_new_account').style.display = 'none';
		document.getElementById('over_login').style.display = 'none';
	}
	
	if (pla2 == 'medium-bot') document.getElementById('ranked_nonranked').innerHTML = 'Non-ranked';
	
	document.getElementById('player1_name').innerHTML = pla1;
	document.getElementById('player2_name').innerHTML = pla2;
	game_over_box();
	game_active = 0;
	
}


function draw_grid(){
	for (i = 0; i < 100; i++){
		for (j = 0; j < 100; j++){
			c_base.beginPath();
			c_base.arc(i*100, j*100, 1, 0, Math.PI * 2, false);
			c_base.fillStyle = "rgba(244, 246, 248, 0.16)";
			c_base.fill();
		}
	}
}

function resolve_energy_point(energy_point){
	//console.log(energy_point);
	if (energy_point.startsWith('base')){
		return base_lookup[energy_point];
	} else if (energy_point.startsWith('star')){
		return star_lookup[energy_point];
	} else {
		return spirit_lookup[energy_point];
	}
}

function create_spirit_p1(spir_id){
	
	var spir_position = [game_blocks['t' + tick_counter].p1[spir_id][0][0], game_blocks['t' + tick_counter].p1[spir_id][0][1]];
	if (shapes['shape1'] == 'circles') var spir_size = 1;
	if (shapes['shape1'] == 'squares') var spir_size = 10;
	var spir_energy = game_blocks['t' + tick_counter].p1[spir_id][2];
	var spir_hp = game_blocks['t' + tick_counter].p1[spir_id][3];
	var spir_player = pla1;
	var spir_color = colors['color1'];
	console.log(spir_color);
	var spir_shape = shapes['shape1'];
	
	if (game_type == 'tutorial'){
		spir_size = 5;
	}

	/*
	if (spir_id.startsWith(pla1)) {
	 var spir_diff = spir_id.substring(pla1.length);
	 if (/^\d+$/.test(spir_diff)){
	 	 spir_player = pla1;
		 spir_color = colors['color1'];
	 } else {
		 spir_player = pla2;
		 spir_color = colors['color2'];
	 }
	} else {
	 spir_player = pla2;
	 spir_color = colors['color2'];
	}
	*/

	//console.log('creating spirit ' + spir_id);
	spirit_lookup[spir_id] = new Spirit(spir_id, spir_position, spir_size, spir_energy, spir_player, spir_color, spir_shape, spir_hp);
	//console.log(spirit_lookup[spir_id]);
}

function create_spirit_p2(spir_id){
	
	var spir_position = [game_blocks['t' + tick_counter].p2[spir_id][0][0], game_blocks['t' + tick_counter].p2[spir_id][0][1]];
	if (shapes['shape2'] == 'circles') var spir_size = 1;
	if (shapes['shape2'] == 'squares') var spir_size = 10;
	var spir_energy = game_blocks['t' + tick_counter].p2[spir_id][2];
	var spir_hp = game_blocks['t' + tick_counter].p2[spir_id][3];
	var spir_player = pla2;
	var spir_color = colors['color2'];
	var spir_shape = shapes['shape2'];

	if (game_type == 'tutorial'){
		spir_size = 5;
	}

	/*
	if (spir_id.startsWith(pla1)) {
	 var spir_diff = spir_id.substring(pla1.length);
	 if (/^\d+$/.test(spir_diff)){
	 	 spir_player = pla1;
		 spir_color = colors['color1'];
	 } else {
		 spir_player = pla2;
		 spir_color = colors['color2'];
	 }
	} else {
	 spir_player = pla2;
	 spir_color = colors['color2'];
	}
	*/

	//console.log('creating spirit ' + spir_id);
	spirit_lookup[spir_id] = new Spirit(spir_id, spir_position, spir_size, spir_energy, spir_player, spir_color, spir_shape, spir_hp);
	
}


class Spirit {
	constructor(id, position, size, energy, player, color, shape, hp = 1){
		this.shape = shape;
		this.id = id
		this.position = position;
		this.size = size;
		this.final_size = size;
		this.energy = energy;
		this.color = color;
		
		//const properties
		this.hp = hp;
		this.energy_capacity = size * 10;
		this.player_id = player;
		//this.player_id = player; set up later
		living_spirits.push(this);
		this.temp_size = size;
	}

	move(origin, incr) {
	//incr is array [incrX, incrY]
		//console.log('move_called');
		
		if (Math.abs(incr[0]) >= 50 && Math.abs(incr[1]) >= 50){
			//console.log('spirit jumping');
			this.size = 1;
		} else {
			this.size = this.temp_size;
		}
		
		this.position = origin;
		this.position[0] = origin[0] + (incr[0] * (total_time / 1000));
		this.position[1] = origin[1] + (incr[1] * (total_time / 1000));
		
		
	}
	
	energize(prev_energy, new_energy, hp){
		if (this.hp != 0){
			this.energy = prev_energy;
			this.energy = prev_energy + ((new_energy - prev_energy) * (total_time / 1000));
		
			if (hp == 0){
				//console.log('death calling');
				var that = this;
				var counter_death = 0;
				var alpha = 8;
				var start_size = this.size;
				var interval_death = setInterval(function() {
				    if (counter_death > 8) {
						//var index = living_spirits.findIndex(x => x.id == that.id);
						//living_spirits.splice(index);
				        clearInterval(interval_death);
						that.hp = 0;
				    }
					that.size += 0.1 * start_size //that.size + (0.1 * that.size);
					that.color = that.color.replace(/[^,]+(?=\))/, alpha/8);
					counter_death++;
					alpha--;
				}, 16);
			}
		}
		
	}
	
	merge(target) {
		var that = this;
		var counter_merge = 0;
		var origin_size_decr = that.size/10;
		var new_size = this.size + target.size;
		var increment = [0, 0];
		target.final_size += that.size;
		
		that.hp = 0;
		
		increment[0] = (target.position[0] - this.position[0])/10;
		increment[1] = (target.position[1] - this.position[1])/10;
		
		target.merged.push(that.id);
		
		target.energy_capacity = that.energy_capacity + target.energy_capacity;
		target.energy += that.energy;
		
		var interval_merge = setInterval(function() {
		    
			target.size += origin_size_decr; 
			that.position[0] += increment[0];
			that.position[1] += increment[1];
			//console.log('dddd');
			that.size -= origin_size_decr;
			if (that.size <= 0) that.size = 0;
			
			
		    if (counter_merge > 9) {
		        clearInterval(interval_merge);
				target.size = target.final_size;
				//console.log('target.size final');
				//console.log(target.size);
				that.energy = 0;
				//console.log('merged spirit');
				//console.log('')
		    }
			
			counter_merge++;
			
		}, 16);
		
	}
	
	size_change(prev_size, new_size){
		if (prev_size != new_size){
			//console.log('changing size from ' + prev_size + ' to ' + new_size);
			this.size = prev_size;
			this.size = prev_size + ((new_size - prev_size) * (total_time / 1000));
			this.energy_capacity = (prev_size * 10) + ((new_size - prev_size) * 10) * (total_time / 1000);
		}
	}
	
	
	
	divide(){
		var that = this;
		var color_parts = this.color.match(/[.?\d]+/g);
		var counter_divide = 0;
		var original_energy = that.energy;
		var original_energy_capacity = that.energy_capacity
		var original_size = that.size;
		var size_decr = (original_size - 1)/10
		
		//console.log('size before divide')
		//console.log(original_size);
		
		var interval_divide = setInterval(function() {
			that.size -= size_decr;
		    if (counter_divide > 10) {
				that.size = 1;
				that.final_size = 1;
		        clearInterval(interval_divide);
		    }
			
			counter_divide++;
		}, 16);
		
		
		that.energy = original_energy / original_size;
		//console.log('that.original_energy_capacity = ' + original_energy_capacity);
		//console.log('that.original_size = ' + original_size);
		//console.log('that.energy_capacity = ' + that.energy_capacity);
		that.energy_capacity = original_energy_capacity / original_size;
		//console.log('that.energy_capacity = ' + that.energy_capacity);
		//var spirit_percent_energy = this.energy / this.energy_capacity;
	}
	
	
	death() {
		var that = this;
		var counter_death = 0;
		var alpha = 8;
		var start_size = this.size;
		var interval_death = setInterval(function() {
		    if (counter_death > 8) {
				//var index = living_spirits.findIndex(x => x.id == that.id);
				//living_spirits.splice(index);
		        clearInterval(interval_death);
				that.hp = 0;
		    }
			that.size += 0.1 * start_size //that.size + (0.1 * that.size);
			that.color = that.color.replace(/[^,]+(?=\))/, alpha/8);
			counter_death++;
			alpha--;
		}, 16);
		
		//this.hp = 0;
		
	}
	
	draw() {
		if (this.hp != 0){
			var color_parts = this.color.match(/[.?\d]+/g);
			var spirit_percent_energy = this.energy / this.energy_capacity;
			var drawing_size = this.size / 2;
			var gradient = this.color;
			
			
		
			if (this.size <= 0.1){
				drawing_size = 0;
			} else if (this.size < 4){
				drawing_size = this.size + 1;
			} else if (this.size < 12){
				drawing_size = 4 + ((this.size - 3) / 2);
			} else {
				drawing_size = 8 + ((this.size - 11) / 4);
			}
			
			try {
				gradient = c.createRadialGradient(this.position[0], this.position[1], drawing_size, this.position[0], this.position[1], drawing_size * 5);
				gradient.addColorStop(0, 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + (color_parts[3] * spirit_percent_energy) / 20 + ')');
				gradient.addColorStop(1, 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0 + ')');
			} catch (e) {
				//console.log(this.position[0])
				//console.log(e);
			}
			
			if (spirit_percent_energy < 0) spirit_percent_energy = 0;
			
			if (this.shape == 'circles'){
				c.beginPath();
				c.arc(this.position[0], this.position[1], drawing_size, 0, Math.PI * 2, false);
				if (this.size < 2){
					c.lineWidth = 0.75;
				} else if (this.size < 8){
					c.lineWidth = 0.5 + ((this.size - 1) / 4);
				} else {
					c.lineWidth = 2;
				}
				c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + color_parts[3] * (spirit_percent_energy/2 + 0.8) + ')';
				//if (this.hp > 0){
					c.stroke();
				//}
		
				c.beginPath();
				c.arc(this.position[0], this.position[1], drawing_size * (spirit_percent_energy), 0, Math.PI * 2, false);
				c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + color_parts[3] * (spirit_percent_energy/2 + 0.5) + ')';
				c.fill();
			
				c.beginPath();
				c.arc(this.position[0], this.position[1], drawing_size * 5, 0, Math.PI * 2, false);
				c.fillStyle = gradient;
				c.fill();
			} else if (this.shape == 'squares'){
				c.lineWidth = 2;
				c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + color_parts[3] * (spirit_percent_energy/2 + 0.5) + ')';
				c.strokeRect((this.position[0] - this.size / 2), (this.position[1] - this.size / 2), this.size, this.size);
				
				c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + color_parts[3] * (spirit_percent_energy/2 + 0.5) + ')';
				c.fillRect((this.position[0] - (this.size * (spirit_percent_energy)) / 2), (this.position[1] - (this.size * (spirit_percent_energy)) / 2), this.size * (spirit_percent_energy), this.size * (spirit_percent_energy));
			}
		
			
			
			//console.log('drawing size = ' + drawing_size);
		}
	}
}

class Star {
	constructor(id, position){
		this.id = id
		this.position = position;
		this.size = 220;
		this.structure_type = 'star';
		stars.push(this);
	}
	
	draw() {
		
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c_base.fillStyle = "rgba(255, 255, 255, 0.2)";
		//c_base.fill();
		
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], 5, 0, Math.PI * 2, false);
		c_base.fillStyle = "rgba(248, 247, 255, 1)";
		c_base.fill();
		
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], 420, 0, Math.PI * 2, false);
		c_base.fillStyle = "rgba(54, 195, 255, 0.02)";
		c_base.fill();
		
		c_base.save();
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], 225, 0, Math.PI * 2, false);
		c_base.clip();
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], 235, 0, Math.PI * 2, false);
		c_base.fillStyle = "rgba(254, 15, 25, 0.2)";
		//c_base.fill();
		c_base.strokeStyle = 'rgba(255,255,255,1)';
		c_base.shadowColor='rgba(205, 240, 250, 0.8)';
		c_base.shadowBlur=100;
		c_base.lineWidth = 10;
		c_base.stroke();
		c_base.shadowColor=null;
		c_base.shadowBlur = null;
		c_base.restore();
		
		
		var teX = this.position[0];
		var teY = this.position[1];
		
		
		
		
	}
}

function mapValues(the_number, in_min, in_max, out_min, out_max) {
  return (the_number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

class Base {
	constructor(id, position, energy, player, color, shape, def_status = 0){
		this.shape = shape;
		this.id = id
		this.position = position;
		this.size = 20;
		this.structure_type = 'base';
		this.energy = energy;
		
		this.hp = 1;
		if (this.shape == 'circles') this.energy_capacity = 400;
		if (this.shape == 'squares') this.energy_capacity = 1000;
		this.player_id = player;
		this.color = color;
		this.current_spirit_cost = 100;
		
		
		// 1 if under attack
		this.def_status = def_status;
		
		bases.push(this);
	}
	
	draw() {
		var color_parts = this.color.match(/[.?\d]+/g);
		var production_percent = this.energy / this.current_spirit_cost;
		
		if (this.shape == 'circles'){
			//inner circle
			if (this.def_status == 1){
				c.beginPath();
				c.setLineDash([2, 4]);
			}
			c.beginPath();
			c.arc(this.position[0], this.position[1], this.size, Math.PI * 0, Math.PI * 2, false);
			c.closePath();
			if (this.shape == 'squares'){
				c.lineWidth = mapValues(this.def_status, 2, 5, 9, 5);
			} else {
				c.lineWidth = mapValues(this.def_status, 0, 1, 4, 1);
			}
			c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + mapValues(this.def_status, 0, 1, 0.69, 1) + ')';
			c.stroke();
			c.setLineDash([]);
		
			//outer circle
			var shield = (this.energy / this.energy_capacity);
			if (shield < 0) shield = 0;
			c.beginPath();
			c.arc(this.position[0], this.position[1], (this.size + 10), 0, Math.PI * 2, false);
			c.lineWidth = mapValues(this.def_status, 0, 1, 2, 14 * shield);
			c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.49 + ')';
			c.stroke();
		
			//production %
			var r_start_angle = -90 / 360 * 2 * Math.PI; 
			var r_end_angle = ((360 * production_percent - 90) / 360) * 2 * Math.PI; 
			c.beginPath();
			c.arc(this.position[0], this.position[1], (this.size + 10), r_start_angle, r_end_angle, false);
			c.lineWidth = c.lineWidth = mapValues(this.def_status, 0, 1, 2, 0.1);;
			c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.69 + ')';
			c.stroke();
		} else if (this.shape == 'squares'){
			//inner square
			c.lineWidth = 4;
			c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.89 + ')';
			c.strokeRect((this.position[0] - this.size / 2), (this.position[1] - this.size / 2), this.size, this.size);
			
			//outer square
			var outer_width = this.size + 20;
			c.lineWidth = 4;
			c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.16 + ')';
			c.strokeRect((this.position[0] - outer_width / 2), (this.position[1] - outer_width / 2), outer_width, outer_width);
			
			//top
			c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + mapValues(production_percent, 0, 0.25, 0, 1) + ')';
			c.fillRect((this.position[0] - outer_width / 2 + 2), (this.position[1] - outer_width / 2 - 2), outer_width, 4);
			
			//bottom
			c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + mapValues(production_percent, 0.5, 0.75, 0, 1) + ')';
			c.fillRect((this.position[0] - outer_width / 2 - 2), (this.position[1] + outer_width / 2 - 2), outer_width, 4);
			
			//right
			c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + mapValues(production_percent, 0.25, 0.5, 0, 1) + ')';
			c.fillRect((this.position[0] + outer_width / 2 - 2), (this.position[1] - outer_width / 2 + 2), 4, outer_width);
			
			//left
			c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + mapValues(production_percent, 0.75, 1, 0, 1) + ')';
			c.fillRect((this.position[0] - outer_width / 2 - 2), (this.position[1] - outer_width / 2 - 2), 4, outer_width);
		} else if (this.shape == 'triangles'){
			
		}
		
		
	}
	
	charge(prev_energy, new_energy){
		if (prev_energy > new_energy && (prev_energy - new_energy) > (this.current_spirit_cost/1.5)){
			this.energy = new_energy * (total_time / 1000);
		} else if (prev_energy >= new_energy){
			this.energy = new_energy;
		} else if (prev_energy < new_energy){
			this.energy = prev_energy;
			this.energy = prev_energy + ((new_energy - prev_energy) * (total_time / 1000));
		} 
	}
	
	defend(new_status){
		//def_status is number between 0 and 1 (0 and 1 values obvious, everything inbetween for animation purposes)
		if (new_status != this.def_status){
			this.def_status = Math.abs((new_status * (total_time / 1000)) + ((new_status - 1) * ((total_time / 1000) - 1)));
			if (Math.abs(this.def_status - new_status) < 0.05) this.def_status = new_status;
			//console.log('this.def_status = ' + this.def_status);
		}
	}
	
	/*
	charge() {
		var color_parts = this.color.match(/[.?\d]+/g);
		//logic on slowing down production when amount of spirits > x
		var new_when = 100;
		if(1 == 1){
			new_when = 100;
		}
		var production_percent = this.energy / new_when;
		var new_angle = Math.PI * 2 * production_percent
		
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], (this.size + 10), Math.PI * 1.5 + (new_angle), Math.PI * 2 * production_percent, false);
		console.log('production_percent');
		console.log(production_percent);
		c_base.lineWidth = 2;
		c_base.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.5 + ')';
		c_base.stroke();
	}
	*/
}

function draw_energize(origin, target, energy_strength, color){
	var color_parts = color.match(/[.?\d]+/g);
	//console.log(Number(color_parts[0]) + 50)
	try {
		var grad = c.createLinearGradient(Math.round(origin[0]), Math.round(origin[1]), Math.round(target[0]), Math.round(target[1]));
		grad.addColorStop(0, 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + (color_parts[3]/2) + ')');
		grad.addColorStop(0.06, 'rgba(' + (Number(color_parts[0]) + 80) + ', ' + (Number(color_parts[1]) + 50) + ', ' + (Number(color_parts[2]) + 50) + ', ' + color_parts[3] + ')');
		grad.addColorStop(1, 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + (color_parts[3]/2) + ')');
	} catch (e) {
		//console.log(e);
		//console.log(origin, target);
	}
	
	c.beginPath();
	c.moveTo(origin[0], origin[1]);
	c.lineTo(target[0], target[1]);
	c.lineWidth = energy_strength/10 + 1;
	c.strokeStyle = grad;
	c.globalAlpha = energy_strength/10 + 0.2;
	c.stroke();
	c.globalAlpha = 1;
	
}

function initiate_world(){
	//console.log('rendering3');
	offsetUpdate();
	//spirit_lookup = {};
	//star_lookup = {};
	//base_lookup = {};
	//living_spirits = [];
	//stars = [];
	//bases = [];
	
	
	//You are rendering bases before the info arrives
	world_bases = bases_queue.length;
	for (i = 0; i < world_bases; i++){
		base_lookup[bases_queue[i].id] = new Base(bases_queue[i].id, bases_queue[i].position, bases_queue[i].energy,  bases_queue[i].player_id, bases_queue[i].color, bases_queue[i].shape);
		base_lookup[bases_queue[i].id].draw();
		//console.log('base drawn ' + bases_queue[i].id);
	}
	
	star_lookup['star_zxq'] = new Star('star_zxq', [1000, 1000]);
	star_lookup['star_a1c'] = new Star('star_a1c', [3200, 1400]);	
	
	star_lookup['star_zxq'].draw();
	star_lookup['star_a1c'].draw();
	
	//draw_grid();
	offsetUpdate();
	
	
	world_initiated = 1;
}

function handle_shout(spir_id, shout_msg, bxx, byy){
	console.log(spir_id + ' is saying ' + shout_msg);
}


function render_state(timestamp){
	
	elapsed = timestamp - prev;
	prev = timestamp;
	dumb_cycler++;
	//console.log(total_time);
	
	total_time += elapsed;
	
	if (dumb_cycler >= 60){
		dumb_cycler = 0;		
		fill_hover_thing(pointing_at_x, pointing_at_y, board_x, board_y);
	}
	
	c.fillStyle = 'rgba(6,8,10,1)';
	c.fillRect(-offsetX, -offsetY, main_canvas.width * multiplier, main_canvas.height * multiplier);
	
	c.setTransform(scale, 0, 0, scale, 0, 0);
	c.translate(offsetX, offsetY);
	
	if (panning == 1){
		offsetUpdate();
	}
	
	//world initiation (page refresh) (hopefully no need for this)
	if (world_initiated == 0 && bases_queue.length > 0){
		initiate_world();
	}
	
	//all_living = living_spirits.length;
	
	try {
		all_spirits = game_blocks[active_block].units;
	} catch (e) {
		console.log(e);
	}
	
	for (i = 0; i < all_spirits.length; i++){
		if (spirit_lookup[all_spirits[i]].player_id == pla1){
			try {
				spirit_lookup[all_spirits[i]].move([game_blocks[active_block].p1[all_spirits[i]][0][4], game_blocks[active_block].p1[all_spirits[i]][0][5]], [game_blocks[active_block].p1[all_spirits[i]][0][2], game_blocks[active_block].p1[all_spirits[i]][0][3]]);
				spirit_lookup[all_spirits[i]].energize(game_blocks[active_block].p1[all_spirits[i]][5], game_blocks[active_block].p1[all_spirits[i]][2], game_blocks[active_block].p1[all_spirits[i]][3]);
				spirit_lookup[all_spirits[i]].size_change(game_blocks[active_block].p1[all_spirits[i]][4], game_blocks[active_block].p1[all_spirits[i]][1]);
			} catch (e) {
				//console.log(e)
			}
			
		} else if (spirit_lookup[all_spirits[i]].player_id == pla2){
			try {
				spirit_lookup[all_spirits[i]].move([game_blocks[active_block].p2[all_spirits[i]][0][4], game_blocks[active_block].p2[all_spirits[i]][0][5]], [game_blocks[active_block].p2[all_spirits[i]][0][2], game_blocks[active_block].p2[all_spirits[i]][0][3]]);
				spirit_lookup[all_spirits[i]].energize(game_blocks[active_block].p2[all_spirits[i]][5], game_blocks[active_block].p2[all_spirits[i]][2], game_blocks[active_block].p2[all_spirits[i]][3]);
				spirit_lookup[all_spirits[i]].size_change(game_blocks[active_block].p2[all_spirits[i]][4], game_blocks[active_block].p2[all_spirits[i]][1]);
			} catch (e) {
				//console.log(e)
			}
			
		}
		spirit_lookup[all_spirits[i]].draw();
	}
	
	
	//p1_spirs = game_blocks[active_block].p1;
	//for (i = 0; i < p1_spirs.length; i++){
	//	spirit_lookup[p1_spirs[i][0]]
	//}
	//
	
	
	
	var energy_blocks = game_blocks[active_block].e;
	for (i = 0; i < energy_blocks.length; i++){
		//console.log(energy_blocks[i]);
		var energy_origin = resolve_energy_point(energy_blocks[i][0]);
		//console.log(energy_blocks[i][1]);
		var energy_target = resolve_energy_point(energy_blocks[i][1]);
		var energy_color = energy_origin.color;
		
		if (energy_origin.id.startsWith('star')) energy_color = energy_target.color;
		
		if (energy_origin.hp != 0 && energy_target.hp != 0){
			draw_energize(energy_origin.position, energy_target.position, energy_blocks[i][2], energy_color);
		}
	}
	
	var specials = game_blocks[active_block].s;
	for (i = 0; i < specials.length; i++){
		if (specials[i][0] == 'sh'){
			//console.log(specials[i][2]);
			
			if (shouting[specials[i][1]] == null || shouting[specials[i][1]][1] <= 0){
				shouting[specials[i][1]] = [1, 180];
				handle_shout(specials[i][1], specials[i][2], board_x, board_y);
			} else {
				shouting[specials[i][1]][1] -= 1;
			}
			
			
			
		}
	}
	
	
	bases[0].charge(game_blocks[active_block].b1[3], game_blocks[active_block].b1[0]);
	bases[1].charge(game_blocks[active_block].b2[3], game_blocks[active_block].b2[0]);
	bases[0].defend(game_blocks[active_block].b1[2]);
	bases[1].defend(game_blocks[active_block].b2[2]);
	bases[0].current_spirit_cost = game_blocks[active_block].b1[1];
	bases[1].current_spirit_cost = game_blocks[active_block].b2[1];
	bases[0].draw();
	bases[1].draw();
	
	/*
	world_bases = bases.length;
	for (i = 0; i < world_bases; i++){
		base_lookup[bases[i].id].charge()
		base_lookup[bases[i].id].draw();
	}
	*/
	
	
	//objects energize
	
	
	
	
	//console.log(spirit_lookup);
	setTimeout(() => {
	    requestAnimationFrame(render_state);
	}); //game_tick?
}



// Start only when 2 blocks processed and ready?
//render_state();







