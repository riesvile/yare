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
		if (el_id != 'base_canvas'){
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
		
		
			pointer_offsetX = (x - pointer_originX) * multiplier;
			pointer_offsetY = (y - pointer_originY) * multiplier;
		
			offsetX = pointer_offsetX + current_offsetX;
			offsetY = pointer_offsetY + current_offsetY;
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
		if(living_spirits[i].hp ==0) continue;
		if (Math.abs(living_spirits[i].position[0] - board_xx) <= 10 && Math.abs(living_spirits[i].position[1] - board_yy) <= 10){
			hover_content.push(['spirit', living_spirits[i].id, living_spirits[i].energy]);
		}
	}
	
	for (b = 0; b < bases.length; b++){
		if (Math.abs(bases[b].position[0] - board_xx) <= 30 && Math.abs(bases[b].position[1] - board_yy) <= 30){
			hover_content.push(['base', bases[b].id, bases[b].energy, bases[b].position, bases[b].def_status]);
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
		document.getElementById("panel").style.backgroundColor = "rgba(24, 20, 30, 0)";
		document.getElementById("panel").style.backdropFilter = "blur(0px)";
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
var tick_counter = 0;
var tick_counter_max = 0;
var tick_counter_avg = 0;

var living_spirits = [];
var stars = [];
var bases = [];
var spirit_lookup = {};
var star_lookup = {};
var base_lookup = {};

var player1_color;
var player2_color;

var colors = {};
colors['color1'] = 'rgba(128,140,255,1)';
colors['color2'] = 'rgba(232,97,97,1)';


var img = new Image();
//img.src = '/assets/game/innerSh1x.png';

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
  		  console.log(response);
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
  	    		  console.log(err);
  	    	  });
			
		  }, 1000);
		  
	    	
  	  })
        .catch(err => {
  		  console.log(err);
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


class Spirit {
	constructor(id, position, size, energy, player, color, merged, hp = 1){
		this.id = id
		this.position = position;
		this.size = size;
		this.final_size = size;
		this.energy = energy;
		this.color = color;
		
		this.sight = {
			friends: [],
			enemies: [],
			structures: []
		}
		this.merged = merged;
		
		//const properties
		this.hp = hp;
		this.move_speed = 1;
		this.energy_capacity = size * 10;
		this.player_id = player;
		//this.player_id = player; set up later
		living_spirits.push(this);
	}
		
	birth() { 
		c.beginPath();
		c.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c.fill();
		c.fillStyle = "rgba(255, 0, 0, 0.5)";
	}
	
	
	move(origin, incr, target) {
	//incr is array [incrX, incrY]
	
		//change this later to only check for origin data (everything synced properly?)
		this.position = origin;
		//if next increment overshoots, position = target
		//if (Math.abs(origin[0] - target[0]) <= Math.abs(incr[0]) && Math.abs(origin[1] - target[1]) <= Math.abs(incr[1])){
		//	move_queue[i][0].position = [targetX, targetY];
		//	move_queue[i][1] = [0,0];
		//}
		
		
		this.position[0] = origin[0] + (incr[0] * (elapsed / 1000));
		this.position[1] = origin[1] + (incr[1] * (elapsed / 1000));
		
		//this.position[0] = origin[0] + (incr[0] / tick_counter_avg);
		//this.position[1] = origin[1] + (incr[1] / tick_counter_avg);
		//this.draw();
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
		
		for (let me = 0; me < that.merged.length; me++){
			target.merged.push(that.merged[me]);
		}
		
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
			//console.log('target.size');
			//console.log(target.size);
			//move this into target, reduce size
			
			
			
			counter_merge++;
			
		}, 16);
		
	}
	
	
	divide(){
		var that = this;
		var color_parts = this.color.match(/[.?\d]+/g);
		var counter_divide = 0;
		var original_energy = that.energy;
		var original_energy_capacity = that.energy_capacity
		var original_size = that.size;
		var size_decr = (original_size - 1)/10
		
		console.log('size before divide')
		console.log(original_size);
		//that.hp = 1;
		//that.size = 1;
		console.log('that.merged');
		console.log(that.merged);
		for (let d = 0; d < that.merged.length; d++){
			spirit_lookup[that.merged[d]].hp = 1;
			spirit_lookup[that.merged[d]].size = 1;
			spirit_lookup[that.merged[d]].energy = Math.floor(original_energy / original_size);
			spirit_lookup[that.merged[d]].energy_capacity = original_energy_capacity / original_size;
		}
		
		var interval_divide = setInterval(function() {
			that.size -= size_decr;
		    if (counter_divide > 10) {
				that.size = 1;
				that.final_size = 1;
		        clearInterval(interval_divide);
		    }
			
			counter_divide++;
		}, 16);
		
		that.merged = [];
		//that.size = 1;
		that.energy = original_energy / original_size;
		console.log('that.original_energy_capacity = ' + original_energy_capacity);
		console.log('that.original_size = ' + original_size);
		console.log('that.energy_capacity = ' + that.energy_capacity);
		that.energy_capacity = original_energy_capacity / original_size;
		console.log('that.energy_capacity = ' + that.energy_capacity);
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
			try {
				gradient = c.createRadialGradient(this.position[0], this.position[1], drawing_size, this.position[0], this.position[1], drawing_size * 20);
				gradient.addColorStop(0, 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + (color_parts[3] * spirit_percent_energy) / 20 + ')');
				gradient.addColorStop(1, 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0 + ')');
			} catch (e) {
				console.log(e);
			}
			
		
			if (this.size <= 0.1){
				drawing_size = 0;
			} else if (this.size < 4){
				drawing_size = this.size + 1;
			} else if (this.size < 12){
				drawing_size = 4 + ((this.size - 3) / 2);
			} else {
				drawing_size = 8 + ((this.size - 11) / 4);
			}
		
			if (spirit_percent_energy < 0) spirit_percent_energy = 0;
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
			c.arc(this.position[0], this.position[1], drawing_size * 20, 0, Math.PI * 2, false);
			c.fillStyle = gradient;
			c.fill();
		}
		
	}
	
	//color_parts[3] * (spirit_percent_energy/2 + 0.69)
	
}

class Star {
	constructor(id, position){
		this.id = id
		this.position = position;
		this.size = 220;
		this.structure_type = 'star';
		//this.energy = energy;
		
		stars.push(this);
	}
	
	draw() {
		//console.log('drawing star');
		
		
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
		
		
		
	    
	    //img.addEventListener('load', drawInnerSh(teX, teY), false);
		
	}
}

class Base {
	constructor(id, position, energy, player, color, def_status = 0){
		this.id = id
		this.position = position;
		this.size = 20;
		this.structure_type = 'base';
		this.energy = energy;
		this.sight = {
			friends: [],
			enemies: [],
			structures: []
		}
		
		this.hp = 1;
		this.energy_capacity = 100;
		this.player_id = player;
		this.color = color;
		
		// 1 if under attack
		this.def_status = def_status;
		
		//this.energy = energy;
	
		bases.push(this);
	}
	
	draw() {
		var color_parts = this.color.match(/[.?\d]+/g);
		//logic on slowing down production when amount of spirits > x
		var new_when = 100;
		if(1 == 1){
			new_when = 100;
		}
		var production_percent = this.energy / new_when;
		
		c.beginPath();
		c.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c.lineWidth = 4;
		c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.69 + ')';
		c.stroke();
		
		c.beginPath();
		c.arc(this.position[0], this.position[1], (this.size + 10), 0, Math.PI * 2, false);
		c.lineWidth = 2;
		c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.49 + ')';
		c.stroke();
		
		
		var r_start_angle = -90 / 360 * 2 * Math.PI; 
		var r_end_angle = ((360 * production_percent - 90) / 360) * 2 * Math.PI; 
		c.beginPath();
		c.arc(this.position[0], this.position[1], (this.size + 10), r_start_angle, r_end_angle, false);
		//console.log('production_percent');
		//console.log(production_percent);
		c.lineWidth = 2;
		c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.69 + ')';
		c.stroke();
	}
	
	
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
}

function draw_death(id, size, color){
	var spir = spirit_lookup[id];
	var alpha = 100;
	var sizee = size;
	var colorr = color;
	
	
	var interval = setInterval(function() {
		c.beginPath();
		c.arc(spir.position[0], spir.position[1], sizee, 0, Math.PI * 2, false);
		c.fillStyle = colorr;
		c.fill();
		sizee++;
	    if (sizee > 100) {
	        clearInterval(interval);
	    }
	}, 16);
	
	
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
		console.log(e);
		console.log(origin, target);
	}
	
	//var incX = (target[0] - origin[0]) / 200;
	//var incY = (target[1] - origin[1]) / 200;
	
	c.beginPath();
	c.moveTo(origin[0], origin[1]);
	c.lineTo(target[0], target[1]);
	c.strokeStyle = grad;
	c.globalAlpha = energy_strength/10 + 0.1;
	c.stroke();
	c.globalAlpha = 1;
	
	/*
	
	c.beginPath();
	c.moveTo(origin[0], origin[1]);
	c.lineTo(origin[0] + (dumb_cycler * incX), origin[1] + (dumb_cycler * incY));
	c.strokeStyle = color;
	c.globalAlpha = energy_strength/10 + 0.1;
	c.stroke();
	c.globalAlpha = 1;
	
	*/
}



function drawInnerSh(teX, teY) {
			c_base.drawImage(img, teX - 225, teY - 225);
			//console.log('drawing image at ' + teX + ', ' + teY);
}


function initiate_world(){
	offsetUpdate();
	spirit_lookup = {};
	star_lookup = {};
	base_lookup = {};
	living_spirits = [];
	stars = [];
	bases = [];
	
	world_spirits = units_queue.length;
	for (i = 0; i < world_spirits; i++){
		//if (units_queue[i].hp == 0) continue;
		//console.log('units_queue[i]');
		//console.log(units_queue[i]);
		spirit_lookup[units_queue[i].id] = new Spirit(units_queue[i].id, units_queue[i].position, units_queue[i].size, units_queue[i].energy, units_queue[i].player_id, units_queue[i].color, units_queue[i].merged, units_queue[i].hp);
		spirit_lookup[units_queue[i].id].draw();
		//console.log(spirit_lookup[units_queue[i].id]);
		//birth_queue.splice(i, 1);
	}
	units_queue = [];
	
	world_stars = stars_queue.length;
	for (i = 0; i < world_stars; i++){
		//console.log('star created');
		star_lookup[stars_queue[i].id] = new Star(stars_queue[i].id, stars_queue[i].position, stars_queue[i].size);
		star_lookup[stars_queue[i].id].draw();
	}
	stars_queue = [];
	
	world_bases = bases_queue.length;
	for (i = 0; i < world_bases; i++){
		//console.log('base created');
		base_lookup[bases_queue[i].id] = new Base(bases_queue[i].id, bases_queue[i].position, bases_queue[i].energy,  bases_queue[i].player_id, bases_queue[i].color);
		base_lookup[bases_queue[i].id].draw();
	}
	
	//draw_grid();
	offsetUpdate();
	
	
	world_initiated = 1;
}

function render_state(timestamp){
	
	elapsed = timestamp - prev;
	prev = timestamp;
	dumb_cycler++;
	
	if (dumb_cycler >= 60){
		dumb_cycler = 0;		
		fill_hover_thing(pointing_at_x, pointing_at_y, board_x, board_y);
	}
	//console.log(dumb_cycler)
	
	//offsetX = offsetX + 1;
	//offsetY = offsetY + 1;
	
	
	c.fillStyle = 'rgba(6,8,10,1)';
	//c.fillRect(0, 0, main_canvas.width, main_canvas.height);
	c.fillRect(-offsetX, -offsetY, main_canvas.width * multiplier, main_canvas.height * multiplier);
	
	c.setTransform(scale, 0, 0, scale, 0, 0);
	c.translate(offsetX, offsetY);
	
	if (panning == 1){
		offsetUpdate();
	}
	
	
	
	//c_base.fillStyle = 'rgba(6,8,10,1)'
	//c_base.fillRect(-offsetX, -offsetY, main_canvas.width, main_canvas.height);
	//c.clearRect(0, 0, main_canvas.width, main_canvas.height);
	
	//world initiation (page refresh)
	if (world_initiated == 0 && units_queue.length > 0){
		initiate_world();
	}
	
	
	
	//objects birth
	birthlings = birth_queue.length;
	for (i = 0; i < birthlings; i++){
		spirit_lookup[birth_queue[i].id] = new Spirit(birth_queue[i].id, birth_queue[i].position, birth_queue[i].size, birth_queue[i].energy, birth_queue[i].player_id, birth_queue[i].color, birth_queue[i].merged, birth_queue[i].hp);
		spirit_lookup[birth_queue[i].id].draw();
		//console.log(spirit_lookup[birth_queue[i].id]);
		
		for (j = 0; j<bases.length; j++){
			if (bases[j].player_id == birth_queue[i].player_id) bases[j].energy -= birth_queue[i].cost;
			//console.log('bases.length = ' + bases.length);
			//console.log('bases[' + j + '].player_id = ' + bases[j].player_id);
		}
		//birth_queue.splice(i, 1);
	}
	birth_queue = [];


	//objects move
	moveables = move_queue.length;
	for (i = 0; i < moveables; i++){
		//console.log('move_queue[i]');
		//console.log(move_queue[i]);
		try {
			spirit_lookup[move_queue[i][0]].move(move_queue[i][1], move_queue[i][2], move_queue[i][3]);
		} catch (e) {
			//if spirit I don't know about, try creating it instead of reloading?
			console.log(e);
			console.log(move_queue[i][0]);
			
			var tpid = '';
			var clr = '';
			if (move_queue[i][0].startsWith(pla1)){
				tpid = pla1;
				clr = colors['color1'];
			} else {
				tpid = pla2;
				clr = colors['color2'];
			}
			
			spirit_lookup[move_queue[i][0]] = new Spirit(move_queue[i][0], move_queue[i][1], 1, 10, tpid, clr, [], 1);
			//location.reload();
		}
		
	}
	//move_queue = [];

	all_living = living_spirits.length;
	for (i = 0; i < all_living; i++){
		spirit_lookup[living_spirits[i].id].draw();
	}
	
	world_bases = bases.length;
	for (i = 0; i < world_bases; i++){
		//if (base_drawn[base_lookup[bases[i].id]] != 1){
			base_lookup[bases[i].id].draw();
		//	base_drawn[base_lookup[bases[i].id]] = 1;
		//}
	}
	
	
	//structures
	//for (i = 0; i < stars.length; i++){
	//	stars[i].draw();
	//}

	
	//objects energize
	
	for (i = 0; i < energize_queue.length; i++){
		//draw_energize(energize_queue[i])
		//console.log('energize_queue[i]');
		//console.log(energize_queue[i]);
		if (energize_queue[i][0].startsWith('star')) {
			
			try {
				if (spirit_lookup[energize_queue[i][1]].hp != 0){
					draw_energize(star_lookup[energize_queue[i][0]].position, spirit_lookup[energize_queue[i][1]].position, energize_queue[i][2], spirit_lookup[energize_queue[i][1]].color);
					if (energy_processed[energize_queue[i][1]] != 1 && spirit_lookup[energize_queue[i][1]].energy <= spirit_lookup[energize_queue[i][1]].energy_capacity){
						spirit_lookup[energize_queue[i][1]].energy += energize_queue[i][2];
						if (spirit_lookup[energize_queue[i][1]].energy > spirit_lookup[energize_queue[i][1]].energy_capacity) spirit_lookup[energize_queue[i][1]].energy = spirit_lookup[energize_queue[i][1]].energy_capacity;
						energy_processed[energize_queue[i][1]] = 1;
					}
				}
			} catch (e) {
				console.log(e);
				location.reload();
			}
			
		} else if (energize_queue[i][1].startsWith('base')) {
			
			try {
				draw_energize(spirit_lookup[energize_queue[i][0]].position, base_lookup[energize_queue[i][1]].position, energize_queue[i][2], spirit_lookup[energize_queue[i][0]].color);
				if (energy_processed[energize_queue[i][0]] != 1){
					if (spirit_lookup[energize_queue[i][0]].player_id != base_lookup[energize_queue[i][1]].player_id){
						spirit_lookup[energize_queue[i][0]].energy -= (energize_queue[i][2] / 2);
						base_lookup[energize_queue[i][1]].energy -= energize_queue[i][2];
						//base_lookup[energize_queue[i][1]].draw();
						energy_processed[energize_queue[i][0]] = 1;
						//console.log('base energy');
						//console.log(base_lookup[energize_queue[i][1]].energy);
						//baseOffsetUpdate();
					} else {
						spirit_lookup[energize_queue[i][0]].energy -= energize_queue[i][2];
						if (spirit_lookup[energize_queue[i][0]].energy < 0) spirit_lookup[energize_queue[i][0]].energy = 0;
						base_lookup[energize_queue[i][1]].energy += energize_queue[i][2];
						//base_lookup[energize_queue[i][1]].draw();
						energy_processed[energize_queue[i][0]] = 1;
						//console.log('base energy');
						//console.log(base_lookup[energize_queue[i][1]].energy);
						//baseOffsetUpdate();
					}
				}
			} catch (e) {
				console.log(e);
				location.reload();
			}
			
		} else {
			
				
				try {
					
					if (spirit_lookup[energize_queue[i][0]].hp != 0 && spirit_lookup[energize_queue[i][1]].hp != 0){
					draw_energize(spirit_lookup[energize_queue[i][0]].position, spirit_lookup[energize_queue[i][1]].position, energize_queue[i][2], spirit_lookup[energize_queue[i][0]].color);
					if (energy_processed[energize_queue[i][0]] != 1){
						if (spirit_lookup[energize_queue[i][0]].player_id != spirit_lookup[energize_queue[i][1]].player_id){
							spirit_lookup[energize_queue[i][0]].energy -= (energize_queue[i][2] / 2);
							spirit_lookup[energize_queue[i][1]].energy -= energize_queue[i][2];
							if (spirit_lookup[energize_queue[i][0]].energy < 0) spirit_lookup[energize_queue[i][0]].energy = 0;
							//base_lookup[energize_queue[i][1]].draw();
							energy_processed[energize_queue[i][0]] = 1;
							//console.log('base energy');
							//console.log(base_lookup[energize_queue[i][1]].energy);
							//baseOffsetUpdate();
						} else {
							spirit_lookup[energize_queue[i][0]].energy -= energize_queue[i][2];
							if (spirit_lookup[energize_queue[i][0]].energy < 0) spirit_lookup[energize_queue[i][0]].energy = 0;
							if (spirit_lookup[energize_queue[i][1]].energy <= spirit_lookup[energize_queue[i][1]].energy_capacity){
								spirit_lookup[energize_queue[i][1]].energy += energize_queue[i][2];
								if (spirit_lookup[energize_queue[i][1]].energy >= spirit_lookup[energize_queue[i][1]].energy_capacity) spirit_lookup[energize_queue[i][1]].energy = spirit_lookup[energize_queue[i][1]].energy_capacity;
							} else {
								//spirit_lookup[energize_queue[i][1]].energy = energize_queue[i][2];
							}
						
							//base_lookup[energize_queue[i][1]].draw();
							energy_processed[energize_queue[i][0]] = 1;
							//console.log('base energy');
							//console.log(base_lookup[energize_queue[i][1]].energy);
							//baseOffsetUpdate();
						}
					}
					
					} 
				} catch (e) {
					console.log(e);
					location.reload();
				}
				
				
			
			
		}
	}



	//objects death
	for (i = 0; i < death_queue.length; i++){
		console.log(death_queue[i]);
		if (death_queue[i].startsWith('base')){
			var winner = '';
			var loser = base_lookup[death_queue[i]].player_id;
			if (loser == pla1){
				winner = pla2;
			} else {
				winner = pla1;
			}
			//alert('game over, ' + winner + ' won');
			game_over(winner, loser);
		} else {
			//spirit_lookup[death_queue[i]].hp = 0;
			//draw_death(spirit_lookup[death_queue[i]].id, spirit_lookup[death_queue[i]].size, spirit_lookup[death_queue[i]].color);
			spirit_lookup[death_queue[i]].death();
			
			//delete spirit_lookup[suid];
			//var index = living_spirits.findIndex(x => x.id == death_queue[i].id);
			//living_spirits.splice(index);
		}
		//draw_death(death_queue[i]);
		
	}
	death_queue = [];
	
	
	//objects merge
	for (i = 0; i < merge_queue.length; i++){
		//there is a 'continue' if hp == 0 somewhere around that might cause problems later
		spirit_lookup[merge_queue[i][1]].merge(spirit_lookup[merge_queue[i][2]]);
	}
	merge_queue = [];
	
	
	//objects divide
	for (i = 0; i < divide_queue.length; i++){
		spirit_lookup[divide_queue[i][1]].divide();
	}
	divide_queue = [];
	
	
	
	
	


	tick_counter++;
	if (tick_counter > tick_counter_max){
		tick_counter_max = tick_counter;
		//console.log('tick_counter_max = ' + tick_counter_max);
	} else {
		tick_counter_avg = tick_counter_max;
		tick_counter_max = 0;
	}
	//console.log('ticks');
	//console.log('tick_counter_avg = ' + tick_counter_avg);
	//console.log(spirit_lookup);
	setTimeout(() => {
	    requestAnimationFrame(render_state);
	}); //game_tick?
}


render_state();







