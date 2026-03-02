//Hello


// ------
// Pointer handling
// ------

var mousey = 0;
var pointer_originX = 0;
var pointer_originY = 0;
var pointer_offsetX = 0;
var pointer_offsetY = 0;
var current_offsetX = innerWidth / 2;
var current_offsetY = innerHeight / 2;
var panning = 0;
var disableSelection = 0;

var board_x = 0;
var board_y = 0;
var pointing_at_x = 0;
var pointing_at_y = 0;

function offsetUpdate(){
	c_base.clearRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.1, main_canvas.height * multiplier * 1.1);
	c.clearRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.1, main_canvas.height * multiplier * 1.1);
	
	c_base.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
	c_base.translate(offsetX, offsetY);
	
	if (live_render == 0) draw_boxsand_bg();
	if (live_render == 1) draw_bg_grad();
	
	for (i = 0; i < barricades.length; i++){
		draw_barricade(barricades[i]);
	}
	for (i = 0; i < pods.length; i++){
		draw_pod(pods[i]);
	}
}

function zoomUpdate(){
	c_base.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
	c_base.translate(offsetX, offsetY);
	c_base.clearRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.1, main_canvas.height * multiplier * 1.1);
	
	for (i = 0; i < barricades.length; i++){
		draw_barricade(barricades[i]);
	}
	for (i = 0; i < pods.length; i++){
		draw_pod(pods[i]);
	}
}

function rgb_to_hsl(r,g,b) {
  // Make r, g, and b fractions of 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  // Calculate hue
  // No difference
  if (delta == 0)
    h = 0;
  // Red is max
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  // Green is max
  else if (cmax == g)
    h = (b - r) / delta + 2;
  // Blue is max
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);
    
  // Make negative hues positive behind 360°
  if (h < 0)
      h += 360;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    
  // Multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h, s, l];
}

function draw_boxsand_bg(){
	c.fillStyle = 'black';
	c.fillRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.2, main_canvas.height * multiplier * 1.2);
}

function draw_bg_grad(){
	
	//let corner1_parts
	
	var grdddd = c.createLinearGradient(-650, -480, 480, 650);
	//grdddd.addColorStop(0, "hsla(0, 50%, 20%, 1)");
	//grdddd.addColorStop(1, "hsla(50, 50%, 40%, 1)");
	
	grdddd.addColorStop(0, "hsla(" + corner1_parts_hsl[0] + "," + corner1_parts_hsl[1] + "% ," + 4 + "% ," + (corner1_parts[3] - 0.2) + ")");
	grdddd.addColorStop(1, "hsla(" + corner2_parts_hsl[0] + "," + corner2_parts_hsl[1] + "% ," + 4 + "% ," + (corner2_parts[3] - 0.2) + ")");
	
	c.fillStyle = grdddd;
	//c.fillRect(-2000, -2000, 2000, 2000);
	c.fillRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.2, main_canvas.height * multiplier * 1.2);
	
}

function draw_circle_zone(radius){
	if (radius == null) return;
	c.save();
	c.beginPath();
	var vw = main_canvas.width * multiplier * 1.2;
	var vh = main_canvas.height * multiplier * 1.2;
	c.rect(-offsetX, -offsetY, vw, vh);
	c.arc(0, 0, radius, 0, Math.PI * 2, true);
	c.fillStyle = 'hsla(1, 100%, 72%, 0.12)';
	c.fill();
	c.restore();
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
	scale = Math.round(Math.min(Math.max(.5, scale), 1.25) * 100) / 100;
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
	}
	
	if (scaling != true){
		var el_id = (e.target || e.srcElement).id;
	
		if (el_id == 'panel_dragger'){
			disableSelection = 1;
			panel_dragging = 1;
			panel_el_widtho = panel_el.getBoundingClientRect().width;
		} else if (el_id == 'replay_timeline'){
			dragging_timeline = 1;
  	  	    percent_current = ((e.clientX - timeline_el_bound.left) / timeline_el_bound.width) * 100;
			update_tick(e.clientX);
		} else if (el_id != 'base_canvas'){
			return;
		} else if (el_id == 'tutorial_wrap' || el_id == 'tut_helper'){
			disableSelection = 0;
		} else {
			disableSelection = 1;
		}
	
		if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
		    let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		    let touch = evt.touches[0] || evt.changedTouches[0];
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
		    let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		    let touch = evt.touches[0] || evt.changedTouches[0];
		    x = touch.pageX;
		    y = touch.pageY;
		} else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
		    x = e.clientX;
		    y = e.clientY;
		}
	
		if (disableSelection == 1 || dragging_timeline == 1){
			e.preventDefault();
		} 
		
		try {
			update_tick(x);
		} catch (e){
			
		}
		
	
	
	if (mousey == 1){
		panning = 1;
		
		if (panel_dragging == 1){
			let panel_width_delta = x - pointer_originX;
				let new_panel_width = panel_el_widtho + panel_width_delta;
				
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
			} else if (dragging_timeline == 1){
				
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
		
			pointing_at_x = x;
			pointing_at_y = y;
		
			fill_hover_thing(x, y, board_x, board_y);
		
		
		}
	}
	
}

function onPointerUp(e){ 
	if (scaling) {
	    //pinchEnd(e);
	    scaling = false;
	}
	
	mousey = 0;
	panning = 0;
	panel_dragging = 0;
	disableSelection = 0;
	dragging_timeline = 0;
	offsetUpdate();
}

function getMousePos(e) {
    return {x:e.clientX,y:e.clientY};
}

function fill_hover_thing(xx, yy, board_xx, board_yy){
	if (live_render == 0){
		//return;
	}
	
	try {
		var hoveroid = document.getElementById('game_hover');
		hoveroid.style.bottom = window.innerHeight - yy + 10 + 'px';
		hoveroid.style.left = xx + 'px';
		let hover_content = [];
	
		for (i = 0; i < living_cats.length; i++){
			if(living_cats[i].hp == 0) continue;
			if (Math.abs(living_cats[i].position[0] - board_xx) <= 10 && Math.abs(living_cats[i].position[1] - board_yy) <= 10){
				hover_content.push(['cat', living_cats[i].id, Math.floor(living_cats[i].energy)]);
			}
		}
	
		for (s = 0; s < barricades.length; s++){
			if (Math.abs(barricades[s][0] - board_xx) <= 80 && Math.abs(barricades[s][1] - board_yy) <= 80){
				hover_content.push(['barricade', 'barricade']);
			}
		}
	
	
		if (hover_content.length == 0){
			hide_hover();
		} else if (hover_content.length == 1){
			show_hover();
		if (hover_content[0][0] == 'cat'){
			hoveroid.innerHTML = "<span class='cat_id'>" + hover_content[0][1] + "</span><span class='cat_energy'>" + hover_content[0][2] + " <span class='lowlight'>energy</span></span>";
		} else if (hover_content[0][0] == 'barricade'){
			hoveroid.innerHTML = "<span class='barricade_id'>" + hover_content[0][1] + "</span>";
			hoveroid.style.bottom = window.innerHeight - yy + 10 + 'px';
			hoveroid.style.left = xx - 20 + 'px';
		}
		} else if (hover_content.length > 4){
			show_hover();
			var total_eng = 0;
			for (j = 0; j < hover_content.length; j++){
				total_eng += hover_content[j][2];
			}
			hoveroid.innerHTML = "<span class='cat_id'>" + hover_content[0][1] + " + " + (hover_content.length - 1) + " cats</span><span class='cat_energy'>" + total_eng + " <span class='lowlight'>total energy</span></span>";
		} else {
			show_hover();
			var temp_fill = '';
			for (j = 0; j < hover_content.length; j++){
				temp_fill += "<span class='cat_id'>" + hover_content[j][1] + "<span class='lowlight'> · " + hover_content[j][2] + "</span></span>"
			}
			hoveroid.innerHTML = temp_fill;
		}
	} catch (e) {
	}
	
	
}


function zoom(event) {
  event.preventDefault();
  prevScale = scale;
  scale += event.deltaY * -0.002;

  // Restrict scale
  scale = Math.round(Math.min(Math.max(.5, scale), 1.25) * 100) / 100;
  multiplier = 1 / scale;
  
  
  
  if (scale > 3 || scale < 0.1){
  	
  } else {
	  var mousePos = getMousePos(event);
	  
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

try {
	document.getElementById("panel").addEventListener("mouseenter", function(e) {
		if (mousey != 1){
			document.getElementById("panel").style.backgroundColor = "hsla(234, 20%, 12%, 0.95)";
			//document.getElementById("panel").style.backdropFilter = "blur(12px)";
		}

	}, false);

	document.getElementById("panel").addEventListener("mousedown", function(e) {
		if (mousey != 1){
			document.getElementById("panel").style.backgroundColor = "hsla(234, 20%, 12%, 0.95)";
			//document.getElementById("panel").style.backdropFilter = "blur(12px)";
		}

	}, false);

	document.getElementById("panel").addEventListener("mouseleave", function(e) {
		if (mousey != 1){
			document.getElementById("panel").style.backgroundColor = "hsla(234, 20%, 12%, 0.95)";
			//document.getElementById("panel").style.backdropFilter = "blur(12px)";
		}

	}, false);
} catch (e) {
	console.error(e)
}






// Console 



// ------
// Game rendering
// ------

const main_canvas = document.getElementById('main_canvas');
const base_canvas = document.getElementById('base_canvas');
const c = main_canvas.getContext('2d');
const c_base = base_canvas.getContext('2d');
var dpr = window.devicePixelRatio || 1;
main_canvas.width = innerWidth * dpr;
main_canvas.height = innerHeight * dpr;
base_canvas.width = innerWidth * dpr;
base_canvas.height = innerHeight * dpr;
main_canvas.style.width = innerWidth + 'px';
main_canvas.style.height = innerHeight + 'px';
base_canvas.style.width = innerWidth + 'px';
base_canvas.style.height = innerHeight + 'px';
c.scale(dpr, dpr);
c_base.scale(dpr, dpr);

//c.globalCompositeOperation = 'screen';

base_canvas.onwheel = zoom;
//c.translate(800, 900);

var offsetX = innerWidth / 2;
var offsetY = innerHeight / 2;
var scale = 1;
var prev_scale = 1;
var z_level = 1;
var multiplier = 1;


var fps = 60;

var living_cats = [];
var barricades = [[0, -200], [0, 200], [370, 0], [-370, 0]];
var pods = [[-110, -300], [110, -300], [-260, 320], [260, 320], [-500, 84], [500, 84]];
var cats = {};
var barricade_lookup = {};

var player1_color;
var player2_color;

var colors = {};
var players = {};
colors['color1'] = 'rgba(128,140,255,1)';
colors['color2'] = 'rgba(232,97,97,1)';
colors['neutral'] = 'rgba(160, 168, 180, 1)';
players['player1'] = 'pl1';
players['player2'] = 'pl2';

var corner1_parts = colors['color1'].match(/[.?\d]+/g);
var corner2_parts = colors['color2'].match(/[.?\d]+/g);
var corner1_parts_hsl = [0, '100', '50'];
var corner2_parts_hsl = [10, '100', '20'];

var shouting = {};
var shouting_helper = {};
var shouting_count_p1 = 0;
var shouting_count_p2 = 0;

var explosions = {};



var dumb_cycler = 0;


//flags

var world_initiated = 0;

function get_triangle(centerx, centery, radius){
	  //the first vertex is on the circumscribed circle at 0 radians where R is the radius of the circle ( R)
	  //you may decide to change this.
	  let sx1 = centerx + radius;
	  let sy1 = centery;
	  //the second vertex is on the circumscribed circle at 2*Math.PI/3 radians 
	  //you may decide to change this.
	  let sx2 = centerx + radius * Math.cos(2*Math.PI/3);
	  let sy2 = centery + radius * Math.sin(2*Math.PI/3);
	  //calculate the 3-rd vertex
	  let sx3 = centerx + radius * Math.cos(4*Math.PI/3);
	  let sy3 = centery + radius * Math.sin(4*Math.PI/3);
	
	
	  return [sx1, sy1, sx2, sy2, sx3, sy3];
}

function draw_polygon(centerX,centerY,sideCount,size,strokeWidth,strokeColor,fillColor,rotationDegrees){
    var radians=rotationDegrees*Math.PI/180;
    c.translate(centerX,centerY);
    c.rotate(radians);
    c.beginPath();
    c.moveTo (size * Math.cos(0), size * Math.sin(0));          
    for (var i = 1; i <= sideCount;i += 1) {
        c.lineTo (size * Math.cos(i * 2 * Math.PI / sideCount), size * Math.sin(i * 2 * Math.PI / sideCount));
    }
    c.closePath();
    c.fillStyle=fillColor;
    c.strokeStyle = strokeColor;
    c.lineWidth = strokeWidth;
    if (strokeColor != 0) c.stroke();
    if (fillColor != 0)c.fill();
    c.rotate(-radians);
    c.translate(-centerX,-centerY);    
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}

function calcAngleDegrees(x, y) {
  return Math.atan2(y, x) * 180 / Math.PI;
}


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
	  	  //document.getElementById('player1_rating').innerHTML = p111_rating + "<span class='player_delta' id='player1_delta'>+10</span>";
	  	  //document.getElementById('player2_rating').innerHTML = p222_rating + "<span class='player_delta' id='player1_delta'>-9</span>";
	  	  document.getElementById('player1_shape').innerHTML = "<span class='ico_triangles' style='background-color: " + colors['color1'] + "'></span>";
	  	  document.getElementById('player2_shape').innerHTML = "<span class='ico_triangles' style='background-color: " + colors['color2'] + "'></span>";
		  
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
  	    		  console.error(err);
  	    	  });
			
		  }, 1000);
		  
	    	
  	  })
        .catch(err => {
  		  console.error(err);
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


function resolve_energy_point(energy_point){
	if (Array.isArray(energy_point)){
		return energy_point;
	} else {
		return cats[energy_point];
	}
}

function create_cat_p1(spir_id){
	
	var spir_position = [game_blocks['t' + tick_counter].p1[spir_id][0][0], game_blocks['t' + tick_counter].p1[spir_id][0][1]];
	var spir_energy = game_blocks['t' + tick_counter].p1[spir_id][1];
	var spir_hp = game_blocks['t' + tick_counter].p1[spir_id][2];
	var spir_player = pla1;
	var spir_color = colors['color1'];

	cats[spir_id] = new Cat(spir_id, spir_position, spir_energy, spir_player, spir_color, spir_hp);
}

function create_cat_p2(spir_id){
	
	var spir_position = [game_blocks['t' + tick_counter].p2[spir_id][0][0], game_blocks['t' + tick_counter].p2[spir_id][0][1]];
	var spir_energy = game_blocks['t' + tick_counter].p2[spir_id][1];
	var spir_hp = game_blocks['t' + tick_counter].p2[spir_id][2];
	var spir_player = pla2;
	var spir_color = colors['color2'];

	cats[spir_id] = new Cat(spir_id, spir_position, spir_energy, spir_player, spir_color, spir_hp);
}


var _catFillSvgTpl = '<svg width="21" height="21" viewBox="-0.5 -0.5 21 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6445 5.17578C18.0479 6.74947 18.9023 8.82418 18.9023 11.0986C18.9019 16.0153 14.9158 20.002 9.99902 20.002C5.08227 20.0019 1.09616 16.0153 1.0957 11.0986C1.0957 9.09433 1.75828 7.24387 2.87598 5.75586V0L7.3623 2.5918C8.19545 2.33384 9.08111 2.19533 9.99902 2.19531C10.8001 2.19531 11.576 2.30259 12.3145 2.50098L16.6445 0V5.17578ZM7.3291 7.53711C6.34577 7.53711 5.54897 8.33408 5.54883 9.31738C5.54883 10.3008 6.34568 11.0986 7.3291 11.0986C8.31249 11.0986 9.10938 10.3008 9.10938 9.31738C9.10924 8.3341 8.31241 7.53714 7.3291 7.53711ZM12.6709 7.53711C11.6876 7.53714 10.8908 8.3341 10.8906 9.31738C10.8906 10.3008 11.6875 11.0986 12.6709 11.0986C13.6543 11.0986 14.4512 10.3008 14.4512 9.31738C14.451 8.33408 13.6542 7.53711 12.6709 7.53711Z" fill="FILL_COLOR"/></svg>';

var _catOutlineSvgTpl = '<svg width="22" height="22" viewBox="-1 -1 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6445 5.17578C18.048 6.7495 18.9023 8.82408 18.9023 11.0986C18.9022 16.0156 14.916 20.002 9.99902 20.002C5.08205 20.002 1.09589 16.0156 1.0957 11.0986C1.0957 9.09416 1.75811 7.24394 2.87598 5.75586V0.00195312L7.3623 2.5918C8.19549 2.33383 9.08106 2.19531 9.99902 2.19531C10.8001 2.19531 11.576 2.30259 12.3145 2.50098L16.6445 0.00195312V5.17578Z" fill="none" stroke="STROKE_COLOR" stroke-width="1"/></svg>';

var _catImageCache = {};

function getCatImages(colorStoreStr) {
	if (_catImageCache[colorStoreStr]) return _catImageCache[colorStoreStr];

	var parts = colorStoreStr.match(/[.?\d]+/g);
	var rgb = 'rgb(' + parts[0] + ',' + parts[1] + ',' + parts[2] + ')';

	var fillSvg = _catFillSvgTpl.replace('FILL_COLOR', rgb);
	var outlineSvg = _catOutlineSvgTpl.replace('STROKE_COLOR', rgb);

	var fillImg = new Image();
	fillImg.src = 'data:image/svg+xml,' + encodeURIComponent(fillSvg);

	var outlineImg = new Image();
	outlineImg.src = 'data:image/svg+xml,' + encodeURIComponent(outlineSvg);

	_catImageCache[colorStoreStr] = { fill: fillImg, outline: outlineImg };
	return _catImageCache[colorStoreStr];
}


class Cat {
	constructor(id, position, energy, player, color, hp = 1){
		this.id = id
		this.position = position;
		this.energy = energy;
		this.color = color;
		this.color_store = color;
		
		//const properties
		this.hp = hp;
		this.energy_capacity = 10;
		this.player_id = player;
		living_cats.push(this);
		
		this.shout = '';
		this.tria = -90;
		this.exploding = 0;
		this.dying = 0;
		this.death_start = 0;
	}

	move(origin, incr) {
		if (live_render == 0) return;
		
		this.position = origin;
		this.position[0] = origin[0] + (incr[0] * (total_time / game_tick));
		this.position[1] = origin[1] + (incr[1] * (total_time / game_tick));
		
		if (incr[0] !== 0 || incr[1] !== 0) {
			this.tria = calcAngleDegrees(incr[0], incr[1]);
		}
		
		
	}
	
	pew(prev_energy, new_energy, hp){
		if (live_render == 0) return;
		if (this.exploding == 1){
			setTimeout(function(){
				this.hp = 0;
				this.exploding = 0;
			}, game_tick);
		}
		if (this.hp != 0){
			this.energy = prev_energy;
			this.energy = prev_energy + ((new_energy - prev_energy) * (total_time / game_tick));
		
			if (hp == 0 && this.dying == 0){
				this.dying = 1;
				this.death_start = performance.now();
			}
		} else if (hp != 0){
			this.hp = 1;
			this.dying = 0;
			this.energy = new_energy;
			this.color = this.color_store;
		}
		
	}
	
	merge(target) {
		var that = this;
		var counter_merge = 0;
		var increment = [0, 0];
		
		that.hp = 0;
		
		increment[0] = (target.position[0] - this.position[0])/10;
		increment[1] = (target.position[1] - this.position[1])/10;
		
		target.merged.push(that.id);
		
		target.energy_capacity = that.energy_capacity + target.energy_capacity;
		target.energy += that.energy;
		
		var interval_merge = setInterval(function() {
			that.position[0] += increment[0];
			that.position[1] += increment[1];
			
		    if (counter_merge > 9) {
		        clearInterval(interval_merge);
				that.energy = 0;
		    }
			
			counter_merge++;
			
		}, 16);
		
	}
	
	divide(){
		var that = this;
		var original_energy = that.energy;
		
		that.energy = original_energy / 2;
	}
	
	explode(){
		var color_parts = this.color.match(/[.?\d]+/g);
		if (!explosions[this.id]) explosions[this.id] = 4;
		explosions[this.id] *= 1.1;
		//let that = this;
		//let counter_explosion = 0;
		//
		//let interval_explosion = setInterval(function() {
		//	if (counter_explosion > 30){
		//		clearInterval(interval_explosion);
		//		that.hp = 0;
		//	}
		//	that.size += 1;
		//	
		//}, 16);
		var draw_alpha = color_parts[3] * (1 - explosions[this.id] / 100);
		if (explosions[this.id] >= 100) draw_alpha = 0;
		
		c.beginPath();
		c.arc(this.position[0], this.position[1], explosions[this.id], 0, Math.PI * 2, false);
		c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + draw_alpha + ')';
		c.fill();
	}
	
	
	death() {
		if (this.dying == 0){
			this.dying = 1;
			this.death_start = performance.now();
		}
	}
	
	draw() {
		if (this.dying){
			var dt = performance.now() - this.death_start;
			var duration = 380;
			if (dt >= duration){
				this.hp = 0;
				this.dying = 0;
				return;
			}
			var t = dt / duration;
			var cp = this.color_store.match(/[.?\d]+/g);
			var r = Number(cp[0]);
			var g = Number(cp[1]);
			var b = Number(cp[2]);

			var scale_factor = 1 + t * 1.05;
			var fade = t < 0.08 ? 1 : 1 - Math.pow((t - 0.08) / 0.92, 0.6);
			fade = Math.max(0, fade);
			var flash_ramp = t < 0.1 ? t / 0.1 : 1;
			var flash_decay = t < 0.25 ? 1 - (t / 0.25) : 0;
			var flash = 1 + flash_ramp * flash_decay * 0.6;

			var drawSize = 20 * scale_factor;
			var halfSize = drawSize / 2;
			var imgs = getCatImages(this.color_store);

			c.save();
			c.translate(this.position[0], this.position[1]);
			c.rotate((this.tria + 90) * Math.PI / 180);

			if (imgs.fill.complete && imgs.fill.naturalWidth > 0) {
				c.globalAlpha = fade * 0.9;
				c.drawImage(imgs.fill, -halfSize, -halfSize, drawSize, drawSize);
			}
			if (imgs.outline.complete && imgs.outline.naturalWidth > 0) {
				c.globalAlpha = fade;
				c.drawImage(imgs.outline, -halfSize, -halfSize, drawSize, drawSize);
			}

			c.globalAlpha = 1;
			c.restore();

			var ring_r = 10 + t * 33;
			var ring_a = (1 - t) * 0.35 * flash;
			var br = Math.min(255, Math.round(r * flash));
			var bg = Math.min(255, Math.round(g * flash));
			var bb = Math.min(255, Math.round(b * flash));
			c.beginPath();
			c.arc(this.position[0], this.position[1], ring_r, 0, Math.PI * 2, false);
			c.strokeStyle = 'rgba(' + br + ',' + bg + ',' + bb + ',' + ring_a + ')';
			c.lineWidth = 1.2 * (1 - t * 0.7);
			c.stroke();

			return;
		}

		if (this.hp != 0){
			var color_parts = this.color.match(/[.?\d]+/g);
			var cat_percent_energy = this.energy / this.energy_capacity;
			if (cat_percent_energy > 1) cat_percent_energy = 1;
			if (cat_percent_energy < 0) cat_percent_energy = 0;

			var imgs = getCatImages(this.color_store);
			var drawSize = 20;
			var halfSize = drawSize / 2;
			var baseAlpha = parseFloat(color_parts[3]);

			c.save();
			c.translate(this.position[0], this.position[1]);
			c.rotate((this.tria + 90) * Math.PI / 180);

			if (imgs.fill.complete && imgs.fill.naturalWidth > 0) {
				c.globalAlpha = baseAlpha * Math.max(cat_percent_energy, 0.08);
				c.drawImage(imgs.fill, -halfSize, -halfSize, drawSize, drawSize);
			}

			if (imgs.outline.complete && imgs.outline.naturalWidth > 0) {
				c.globalAlpha = baseAlpha;
				c.drawImage(imgs.outline, -halfSize, -halfSize, drawSize, drawSize);
			}

			c.globalAlpha = 1;
			c.restore();

			if (this.shout != ''){
				if (shouting_helper[this.id] == null || shouting_helper[this.id] <= 0){
					shouting_helper[this.id] = 180;
				} else {
					shouting_helper[this.id] -= 1;
				}
				c.font = '13px sans-serif';
				c.fillStyle = 'rgba(' + color_parts[0] * 1.4 + ', ' + color_parts[1] * 1.4 + ', ' + color_parts[2] * 1.4 + ', ' + color_parts[3] * (shouting_helper[this.id] / 180) + ')';
				c.textAlign = 'center';
				c.fillText(this.shout, this.position[0], this.position[1] - halfSize - 4);
			}
		}
	}
}

function draw_barricade(pos){
	c_base.save();
	c_base.beginPath();
	c_base.arc(pos[0], pos[1], 80, 0, Math.PI * 2, false);
	c_base.clip();
	c_base.beginPath();
	c_base.arc(pos[0], pos[1], 88, 0, Math.PI * 2, false);
	c_base.strokeStyle = 'rgba(255,255,255,1)';
	c_base.shadowColor = 'rgba(225, 250, 255, 0.4)';
	c_base.shadowBlur = 32 / (multiplier / 2.5);
	c_base.lineWidth = 8;
	c_base.stroke();
	c_base.shadowColor = null;
	c_base.shadowBlur = null;
	c_base.restore();
}

function draw_pod(pos){
	c_base.save();
	c_base.fillStyle = 'hsla(130, 99%, 76%, 0.12)';
	c_base.strokeStyle = 'hsla(130, 99%, 76%, 0.12)';
	c_base.lineWidth = 2;
	c_base.roundRect(pos[0] - 20, pos[1] - 20, 40, 40, 12);
	c_base.fill();
	c_base.stroke();
	c_base.restore();
}

function mapValues(the_number, in_min, in_max, out_min, out_max) {
  return (the_number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function _beam_points(ox, oy, tx, ty, segments, amplitude, time, seed, hash){
	var dx = tx - ox;
	var dy = ty - oy;
	var len = Math.sqrt(dx * dx + dy * dy);
	if (len === 0) return [[ox, oy], [tx, ty]];
	var nx = -dy / len;
	var ny = dx / len;
	var freq1 = 2.4 + (hash % 17) * 0.12;
	var freq2 = 4.3 + (hash % 13) * 0.15;
	var pts = [[ox, oy]];
	for (var s = 1; s < segments; s++){
		var t = s / segments;
		var taper = Math.sin(t * Math.PI);
		var phase1 = seed * 7.3 + s * 2.1 + hash * 0.37;
		var phase2 = seed * 3.7 + s * 4.3 + hash * 0.53;
		var offset = amplitude * taper * (
			Math.sin(time * freq1 + phase1) * 0.6 +
			Math.sin(time * freq2 + phase2) * 0.4
		);
		pts.push([ox + dx * t + nx * offset, oy + dy * t + ny * offset]);
	}
	pts.push([tx, ty]);
	return pts;
}

function draw_splash_beam(origin, primary_target, splash_target, energy_strength, color, hash){
	if (energy_strength == 0) return;
	var color_parts = color.match(/[.?\d]+/g);
	var r = Number(color_parts[0]);
	var g = Number(color_parts[1]);
	var b = Number(color_parts[2]);
	var a = Number(color_parts[3]);

	var mx = (origin[0] + primary_target[0]) * 0.5;
	var my = (origin[1] + primary_target[1]) * 0.5;

	var dx = splash_target[0] - mx;
	var dy = splash_target[1] - my;
	var dist = Math.sqrt(dx * dx + dy * dy);
	var segments = Math.max(3, Math.round(dist / 15));
	var amplitude = Math.min(dist * 0.06, 3);
	var time = performance.now() / 1000;
	if (!hash) hash = 0;

	var br = Math.min(255, r + 80);
	var bg = Math.min(255, g + 60);
	var bb = Math.min(255, b + 60);

	var pts = _beam_points(mx, my, splash_target[0], splash_target[1], segments, amplitude, time, 3, hash);

	c.beginPath();
	c.moveTo(pts[0][0], pts[0][1]);
	for (var p = 1; p < pts.length; p++){
		c.lineTo(pts[p][0], pts[p][1]);
	}
	c.lineWidth = 1.8;
	c.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.14)';
	c.globalAlpha = 0.5;
	c.stroke();

	c.beginPath();
	c.moveTo(pts[0][0], pts[0][1]);
	for (var p = 1; p < pts.length; p++){
		c.lineTo(pts[p][0], pts[p][1]);
	}
	c.lineWidth = 0.7;
	c.strokeStyle = 'rgba(' + br + ',' + bg + ',' + bb + ',' + a + ')';
	c.globalAlpha = 0.75;
	c.stroke();
	c.globalAlpha = 1;
}

function draw_pew(origin, target, energy_strength, color, friendly, hash){
	if (energy_strength == 0) return;
	var color_parts = color.match(/[.?\d]+/g);
	var r = Number(color_parts[0]);
	var g = Number(color_parts[1]);
	var b = Number(color_parts[2]);
	var a = Number(color_parts[3]);

	if (friendly){
		c.beginPath();
		c.moveTo(origin[0], origin[1]);
		c.lineTo(target[0], target[1]);
		c.lineWidth = 1.5;
		c.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + Math.max(a, 0.35) + ')';
		c.globalAlpha = 0.7;
		c.stroke();
		c.globalAlpha = 1;
		return;
	}

	var dx = target[0] - origin[0];
	var dy = target[1] - origin[1];
	var dist = Math.sqrt(dx * dx + dy * dy);
	var segments = Math.max(5, Math.round(dist / 20));
	var amplitude = Math.min(dist * 0.04, 3);
	var time = performance.now() / 1000;
	if (!hash) hash = 0;

	var br = Math.min(255, r + 80);
	var bg = Math.min(255, g + 60);
	var bb = Math.min(255, b + 60);

	for (var bolt = 0; bolt < 2; bolt++){
		var pts = _beam_points(origin[0], origin[1], target[0], target[1], segments, amplitude, time, bolt + 1, hash);

		c.beginPath();
		c.moveTo(pts[0][0], pts[0][1]);
		for (var p = 1; p < pts.length; p++){
			c.lineTo(pts[p][0], pts[p][1]);
		}
		c.lineWidth = 2.5 - bolt * 0.6;
		c.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.18)';
		c.globalAlpha = 0.55;
		c.stroke();

		c.beginPath();
		c.moveTo(pts[0][0], pts[0][1]);
		for (var p = 1; p < pts.length; p++){
			c.lineTo(pts[p][0], pts[p][1]);
		}
		c.lineWidth = 1.0 - bolt * 0.2;
		c.strokeStyle = 'rgba(' + br + ',' + bg + ',' + bb + ',' + a + ')';
		c.globalAlpha = 0.9;
		c.stroke();
	}
	c.globalAlpha = 1;
}

function initiate_world(){
	offsetUpdate();

	for (var bi = 0; bi < barricades.length; bi++){
		draw_barricade(barricades[bi]);
	}
	for (var pi = 0; pi < pods.length; pi++){
		draw_pod(pods[pi]);
	}
	
	offsetUpdate();
	
	
	corner1_parts = colors['color1'].match(/[.?\d]+/g);
	corner2_parts = colors['color2'].match(/[.?\d]+/g);

	corner1_parts_hsl = rgb_to_hsl(corner1_parts[0], corner1_parts[1], corner1_parts[2]);
	corner2_parts_hsl = rgb_to_hsl(corner2_parts[0], corner2_parts[1], corner2_parts[2]);
	
	world_initiated = 1;
}

function initiate_from_sandbox(){
	corner1_parts = colors['color1'].match(/[.?\d]+/g);
	corner2_parts = colors['color2'].match(/[.?\d]+/g);

	corner1_parts_hsl = rgb_to_hsl(corner1_parts[0], corner1_parts[1], corner1_parts[2]);
	corner2_parts_hsl = rgb_to_hsl(corner2_parts[0], corner2_parts[1], corner2_parts[2]);
	
	try { document.getElementById('modules_plate').style.display = 'block'; } catch(e){}
}

function handle_shout(spir_id, shout_msg){
	cats[spir_id].shout = shout_msg;
	
	setTimeout(function(){
		shouting[spir_id] = 0;
		cats[spir_id].shout = '';
	}, 3000);
	
}

function drawgqueue(gqueue) {
	for(const g of gqueue) {
		switch(g[0]) {
			case 'st':
				c.strokeStyle = g[1];
				break;
			case 'lw':
				c.lineWidth = g[1];
				break;
			case 'c':
				c.beginPath();
				c.arc(g[1], g[2], g[3], 0, Math.PI * 2, false);
				c.stroke();
				break;
			case 'l':
				c.beginPath();
				c.moveTo(g[1], g[2]);
				c.lineTo(g[3], g[4]);
				c.stroke();
				break;
			case 's':
				c.strokeRect(g[1], g[2], g[3], g[4]);
				break;
		}
	}
}


function render_state(timestamp){
	
	if (isNaN(timestamp)){
		
	} else {
		elapsed = timestamp - prev;
		if (elapsed > 100) elapsed = 16.6;
		prev = timestamp;
		dumb_cycler++;
	
		if (live_render == 1) total_time += elapsed;
	}
	
	if (dumb_cycler >= 60){
		dumb_cycler = 0;		
		fill_hover_thing(pointing_at_x, pointing_at_y, board_x, board_y);
	}
	
	//c.clearRect(0, 0, main_canvas.width, main_canvas.height);
	c.fillStyle = 'rgba(6,8,10,1)';
	//c.fillRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.2, main_canvas.height * multiplier * 1.2);
	c.clearRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.2, main_canvas.height * multiplier * 1.2);
	
	c.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
	c.translate(offsetX, offsetY);
	
	if (live_render == 0) draw_boxsand_bg();
	if (live_render == 1) draw_bg_grad();
	
	if (panning == 1){
		offsetUpdate();
	}
	
	if (world_initiated == 0){
		initiate_world();
	}
	
	//all_living = living_cats.length;
	
	var _gb = game_blocks[active_block];
	if (_gb && _gb.units) {
		all_cats = _gb.units;
	}
	
	var _active_ids = {};
	for (var _ai = 0; _ai < all_cats.length; _ai++) _active_ids[all_cats[_ai]] = true;
	
	if (_gb) draw_circle_zone(_gb.cr);
	
	for (i = 0; i < all_cats.length; i++){
		if (!cats[all_cats[i]]) continue;
		if (_gb) {
			if (cats[all_cats[i]].player_id == players['player1'] && _gb.p1 && _gb.p1[all_cats[i]]){
				try {
					cats[all_cats[i]].move([_gb.p1[all_cats[i]][0][4], _gb.p1[all_cats[i]][0][5]], [_gb.p1[all_cats[i]][0][2], _gb.p1[all_cats[i]][0][3]]);
					cats[all_cats[i]].pew(_gb.p1[all_cats[i]][3], _gb.p1[all_cats[i]][1], _gb.p1[all_cats[i]][2]);
				} catch (e) {
				}
			} else if (cats[all_cats[i]].player_id == players['player2'] && _gb.p2 && _gb.p2[all_cats[i]]){
				try {
					cats[all_cats[i]].move([_gb.p2[all_cats[i]][0][4], _gb.p2[all_cats[i]][0][5]], [_gb.p2[all_cats[i]][0][2], _gb.p2[all_cats[i]][0][3]]);
					cats[all_cats[i]].pew(_gb.p2[all_cats[i]][3], _gb.p2[all_cats[i]][1], _gb.p2[all_cats[i]][2]);
				} catch (e) {
				}
			}
		}
		cats[all_cats[i]].draw();
	}
	
	for (var _lc = 0; _lc < living_cats.length; _lc++){
		if (living_cats[_lc].dying && !_active_ids[living_cats[_lc].id]){
			living_cats[_lc].draw();
		}
	}
	
	var energy_blocks;
	if (_gb) {
		energy_blocks = _gb.e;
		if (!energy_blocks) {
			try {
				energy_blocks = game_blocks[active_block - 1].e;
				tick_local -= 1;
			} catch (e2) {
				if (typeof replay_playing !== 'undefined') {
					current_tick--;
					if (replay_playing == 1){
						play_pause();
					}
				}
			}
		}
	}
	
if (_gb) {
try{
	if (energy_blocks) {
	for (i = 0; i < energy_blocks.length; i++){
		var energy_origin = resolve_energy_point(energy_blocks[i][0]);
		var energy_target = resolve_energy_point(energy_blocks[i][1]);
		var energy_color = energy_origin.color;
		
		let eori = energy_origin.position;
		let etar = energy_target.position;
		
		if (Array.isArray(energy_origin)){
			energy_color = energy_target.color;
			eori = energy_origin;
		}
		
		if (Array.isArray(energy_target)) etar = energy_target;
		
		var is_friendly = !!(energy_origin.color && energy_target.color && energy_origin.color === energy_target.color);
		
		var _eid = '' + energy_blocks[i][0] + energy_blocks[i][1];
		var _ehash = 0;
		for (var _ec = 0; _ec < _eid.length; _ec++) _ehash = ((_ehash << 5) - _ehash + _eid.charCodeAt(_ec)) | 0;
		_ehash = Math.abs(_ehash);
		
		if (energy_origin.hp != 0 && energy_target.hp != 0){
			draw_pew(eori, etar, energy_blocks[i][2], energy_color, is_friendly, _ehash);
		}
	}
	}

	var splash_beams = _gb.a;
	if (splash_beams) {
	for (i = 0; i < splash_beams.length; i++){
		var sp_source = resolve_energy_point(splash_beams[i][0]);
		var sp_primary = resolve_energy_point(splash_beams[i][1]);
		var sp_splash = resolve_energy_point(splash_beams[i][2]);
		if (!sp_source || !sp_primary || !sp_splash) continue;

		var sp_ori = sp_source.position || sp_source;
		var sp_pri = sp_primary.position || sp_primary;
		var sp_spl = sp_splash.position || sp_splash;
		var sp_color = sp_source.color;

		var _spid = '' + splash_beams[i][0] + splash_beams[i][2];
		var _sphash = 0;
		for (var _spc = 0; _spc < _spid.length; _spc++) _sphash = ((_sphash << 5) - _sphash + _spid.charCodeAt(_spc)) | 0;
		_sphash = Math.abs(_sphash);

		if (sp_source.hp != 0 && sp_splash.hp != 0){
			draw_splash_beam(sp_ori, sp_pri, sp_spl, splash_beams[i][3], sp_color, _sphash);
		}
	}
	}
	
	var specials = _gb.s;
	if (specials) {
	for (i = 0; i < specials.length; i++){
		if (!cats[specials[i][1]]) continue;
		if (specials[i][0] == 'sh' && cats[specials[i][1]].player_id == pla1 && shouting_count_p1 < 100){
			
			if (shouting[specials[i][1]] == null || shouting[specials[i][1]] == 0){
				shouting[specials[i][1]] = 3;
				handle_shout(specials[i][1], specials[i][2]);
			}
			shouting_count_p1++;
		} else if (specials[i][0] == 'sh' && cats[specials[i][1]].player_id == pla2 && shouting_count_p2 < 100){
			
			if (shouting[specials[i][1]] == null || shouting[specials[i][1]] == 0){
				shouting[specials[i][1]] = 3;
				handle_shout(specials[i][1], specials[i][2]);
			}
			shouting_count_p2++;
			
		} else if (specials[i][0] == 'ex'){
			cats[specials[i][1]].explode();
		}
	}
	}
	
	shouting_count_p1 = 0;
	shouting_count_p2 = 0;
} catch (e){
}
	
	
	
	try {
		drawgqueue(_gb.graphics);
	} catch (e) {
	}
}
	
	try {
		for (draw_func in module_draw){
			module_draw[draw_func]();
		}
	} catch (e) {
	}

	try {
		let event = new CustomEvent('yare-post-render', {detail: {ctx: c}});
		document.dispatchEvent(event);
	} catch (e) {

	}

	setTimeout(() => {
		requestAnimationFrame(render_state);
	});
	
}



(function(){

// perlin noise resources:
// https://codepen.io/OliverBalfour/post/procedural-generation-part-1-1d-perlin-noise
// https://www.michaelbromley.co.uk/blog/simple-1d-noise-in-javascript/




// hook into render function
if (!window._move)
	window._move = Cat.prototype.move;


function lerp(a, b, t) {
	return a * (1 - t) + b * t;
};


Cat.prototype.move = function() {
	if (live_render == 0) return;
	window._move.apply(this, arguments);
	
	const NOISESPEED = 10000; // minimum time
	const NOISESPEED2 = NOISESPEED * (2 - 1); //variance in time

	// const time = tick_local * 1000 + total_time; // time in ms
	const time = new Date().getTime(); // the one above jumps around when the client rubberbands, we cannot allow this or else everything teleports everywhere

	if (!this.noiseB) { // move this to the constructor instead of checking if it exists
		this.noiseA = this.noiseB = [0, 0];
		this.noiseNext = time;
		this.noiseLen = NOISESPEED;
	}

	let t = time - this.noiseNext;
	if (t >= 0) {
		// make random point in unit circle
		const NOISERADIUS = 8 * 1.3; // 20 because thats the distance traveled in 1 tick, 1.3 because circle
		let x, y;
		do {
			x = Math.random()-.5;
			y = Math.random()-.5;
		} while (x*x + y*y > 1/4);

		this.noiseLen = NOISESPEED + NOISESPEED2 * Math.random();
		this.noiseNext = Math.max(this.noiseNext + this.noiseLen, time);
		t = time - this.noiseNext;
		this.noiseA = this.noiseB;
		this.noiseB = [x * NOISERADIUS, y * NOISERADIUS];
	}

	t /= -this.noiseLen;
	const tSmooth = t * t * (3 - 2 * t);
	this.position[0] += lerp(this.noiseB[0], this.noiseA[0], tSmooth);
	this.position[1] += lerp(this.noiseB[1], this.noiseA[1], tSmooth);
}

for (const cat of Object.values(cats))
	cat.move = Cat.prototype.move;

})();



