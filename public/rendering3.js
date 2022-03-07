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
	c_base.clearRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.1, main_canvas.height * multiplier * 1.1);
	
	//c.fillStyle = 'rgba(6,8,100,0.1)';
	c.clearRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.1, main_canvas.height * multiplier * 1.1);
	
	
	//c.setTransform(1, 0, 0, 1, 0, 0);
	c_base.setTransform(scale, 0, 0, scale, 0, 0);
	c_base.translate(offsetX, offsetY);
	//c.translate(offsetX, offsetY);
	
	//world_spirits = living_spirits.length;
	//for (i = 0; i < world_spirits; i++){
	//	spirit_lookup[living_spirits[i].id].draw();
	//}
	
	draw_bg_grad();
	
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

function zoomUpdate(){
	
	
	
	
	//c.setTransform(1, 0, 0, 1, 0, 0);
	c_base.setTransform(scale, 0, 0, scale, 0, 0);
	c_base.translate(offsetX, offsetY);
	//c.translate(offsetX, offsetY);
	
	//c_base.fillStyle = 'rgba(6,8,100,0.1)'
	c_base.clearRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.1, main_canvas.height * multiplier * 1.1);
	
	//draw_bg_grad();
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

function draw_bg_grad(){
	
	
	
	
	//let corner1_parts
	//console.log(corner1_parts);
	
	var grdddd = c.createLinearGradient(-650, -480, 480, 650);
	//grdddd.addColorStop(0, "hsla(0, 50%, 20%, 1)");
	//grdddd.addColorStop(1, "hsla(50, 50%, 40%, 1)");
	
	grdddd.addColorStop(0, "hsla(" + corner1_parts_hsl[0] + "," + corner1_parts_hsl[1] + "% ," + 4 + "% ," + (corner1_parts[3] - 0.2) + ")");
	grdddd.addColorStop(1, "hsla(" + corner2_parts_hsl[0] + "," + corner2_parts_hsl[1] + "% ," + 4 + "% ," + (corner2_parts[3] - 0.2) + ")");
	
	c.fillStyle = grdddd;
	//c.fillRect(-2000, -2000, 2000, 2000);
	c.fillRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.2, main_canvas.height * multiplier * 1.2);
	
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
	
		//console.log('el_id = ' + el_id);
		if (el_id == 'panel_dragger'){
			disableSelection = 1;
			panel_dragging = 1;
			//console.log('panel_el.style = ');
			//console.log(panel_el.getBoundingClientRect());
			panel_el_widtho = panel_el.getBoundingClientRect().width;
		} else if (el_id == 'replay_timeline'){
			dragging_timeline = 1;
  	  	    percent_current = ((e.clientX - timeline_el_bound.left) / timeline_el_bound.width) * 100;
			update_tick(e.clientX);
  	        //console.log('You clicked to ', (e.clientX - bcr.left) / bcr.width);
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
	
		if (disableSelection == 1 || dragging_timeline == 1){
			e.preventDefault();
		} 
		
		try {
			update_tick(x);
		} catch (e){
			
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
	dragging_timeline = 0;
	offsetUpdate();
}

function getMousePos(e) {
    return {x:e.clientX,y:e.clientY};
}

function fill_hover_thing(xx, yy, board_xx, board_yy){
	
	try {
		var hoveroid = document.getElementById('game_hover');
		hoveroid.style.bottom = window.innerHeight - yy + 10 + 'px';
		hoveroid.style.left = xx + 'px';
		let hover_content = [];
	
		for (i = 0; i < living_spirits.length; i++){
			if(living_spirits[i].hp == 0) continue;
			if (Math.abs(living_spirits[i].position[0] - board_xx) <= 10 && Math.abs(living_spirits[i].position[1] - board_yy) <= 10){
				hover_content.push(['spirit', living_spirits[i].id, Math.floor(living_spirits[i].energy)]);
			}
		}
	
		for (b = 0; b < bases.length; b++){
			if (Math.abs(bases[b].position[0] - board_xx) <= 30 && Math.abs(bases[b].position[1] - board_yy) <= 30){
				hover_content.push(['base', bases[b].id, Math.floor(bases[b].energy), bases[b].position, bases[b].def_status, bases[b].current_spirit_cost, bases[b].control]);
			}
		}
	
		for (s = 0; s < stars.length; s++){
			if (Math.abs(stars[s].position[0] - board_xx) <= 50 && Math.abs(stars[s].position[1] - board_yy) <= 50){
				hover_content.push(['star', stars[s].id, stars[s].energy]);
			}
		}
	
		for (o = 0; o < outposts.length; o++){
			if (Math.abs(outposts[o].position[0] - board_xx) <= 50 && Math.abs(outposts[o].position[1] - board_yy) <= 50){
				hover_content.push(['outpost', outposts[o].control, outposts[o].energy]);
			}
		}
		
		for (p = 0; p < pylons.length; p++){
			if (Math.abs(pylons[p].position[0] - board_xx) <= 50 && Math.abs(pylons[p].position[1] - board_yy) <= 50){
				hover_content.push(['pylon', pylons[p].control, pylons[p].energy]);
			}
		}
	
	
		if (hover_content.length == 0){
			hide_hover();
		} else if (hover_content.length == 1){
			show_hover();
			if (hover_content[0][0] == 'spirit'){
				hoveroid.innerHTML = "<span class='spirit_id'>" + hover_content[0][1] + "</span><span class='spirit_energy'>" + hover_content[0][2] + " <span class='lowlight'>energy</span></span>";
			} else if (hover_content[0][0] == 'base'){
				let base_control = hover_content[0][6];
				if (base_control == ''){
					base_control = 'neutral';
					hoveroid.innerHTML = "<span class='base_id'><span class='lowlight'>" + hover_content[0][1] + " · </span>" + base_control;
				} else {
					hoveroid.innerHTML = "<span class='base_id'><span class='lowlight'>" + hover_content[0][1] + " · </span>" + hover_content[0][6] + "<span class='base_energy'>" + hover_content[0][2] + " <span class='lowlight'>energy</span></span>";
					hoveroid.innerHTML += "<span class='new_when'>new spirit at <span class='highlight'>" + hover_content[0][5] + "</span></span>"
					if (hover_content[0][4] == 1){
						hoveroid.innerHTML += "<span class='under_attack'>enemies in sight, production paused</span>"
					}
				}
				hoveroid.style.bottom = window.innerHeight - yy - 20 + 'px';
				hoveroid.style.left = xx + 50 + 'px';
			} else if (hover_content[0][0] == 'star'){
				hoveroid.innerHTML = "<span class='star_id'>" + hover_content[0][1] + "</span>";
				hoveroid.innerHTML += "<span class='star_energy'>" + hover_content[0][2] + "<span class='lowlight'> energy</span></span>";
				hoveroid.style.bottom = window.innerHeight - yy + 10 + 'px';
				hoveroid.style.left = xx - 20 + 'px';
			} else if (hover_content[0][0] == 'outpost'){
				hoveroid.innerHTML = "<span class='outpost_control'>outpost_mdo <span class='lowlight'> " + hover_content[0][1] + "</span></span>";
				hoveroid.innerHTML += "<span class='outpost_energy'>" + hover_content[0][2] + "<span class='lowlight'> energy</span></span>";
				hoveroid.style.bottom = window.innerHeight - yy + 10 + 'px';
				hoveroid.style.left = xx - 20 + 'px';
			} else if (hover_content[0][0] == 'pylon'){
				hoveroid.innerHTML = "<span class='pylon_control'>pylon_u3p <span class='lowlight'> " + hover_content[0][1] + "</span></span>";
				hoveroid.innerHTML += "<span class='pylon_energy'>" + hover_content[0][2] + "<span class='lowlight'> energy</span></span>";
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
	} catch (e) {
		console.log(e);
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
  
  
  
  if (scale > 3 || scale < 0.1){
  	
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

try {
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
} catch (e) {
	console.log(e)
}






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

//c.globalCompositeOperation = 'screen';

base_canvas.onwheel = zoom;
//c.translate(800, 900);

var offsetX = 0;
var offsetY = 0;
var scale = 1;
var prev_scale = 1;
var z_level = 1;
var multiplier = 1;

var game_tick = 600; // 1s
var fps = 60;

var living_spirits = [];
var stars = [];
var bases = [];
var outposts = [];
var pylons = [];
var fragments = [];
var spirit_lookup = {};
var star_lookup = {};
var base_lookup = {};
var outpost_lookup = {};
var pylon_lookup = {};

var player1_color;
var player2_color;

var colors = {};
var shapes = {};
var players = {};
colors['color1'] = 'rgba(128,140,255,1)';
colors['color2'] = 'rgba(232,97,97,1)';

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

function draw_triangle(x, y, width, height, px1, py1, px2, py2, px3, py3, angle = 0){
	
  let triangle = get_triangle(x, y, 20);
	
	
  
  c.save();
  c.translate(x+width/2, y+height/2 );
  c.rotate(angle*Math.PI/180);
  c.beginPath();
  c.moveTo(triangle[0], triangle[1]);
  c.lineTo(triangle[2], triangle[3]);
  c.lineTo(triangle[4], triangle[5]);
  c.lineTo(triangle[0], triangle[1]);
  c.rect(-width/2, -height/2, width, height);
  c.closePath();
  c.lineWidth = 4;
  c.stroke();
  c.restore();
  
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
  		  //console.log(response);
	  	  //document.getElementById('player1_rating').innerHTML = p111_rating + "<span class='player_delta' id='player1_delta'>+10</span>";
	  	  //document.getElementById('player2_rating').innerHTML = p222_rating + "<span class='player_delta' id='player1_delta'>-9</span>";
	  	  document.getElementById('player1_shape').innerHTML = "<span class='ico_" + shapes['shape1'] + "' style='background-color: " + colors['color1'] + "'></span>";
	  	  document.getElementById('player2_shape').innerHTML = "<span class='ico_" + shapes['shape2'] + "' style='background-color: " + colors['color2'] + "'></span>";
		  
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
	if (Array.isArray(energy_point)){
		//console.log('energy_point is array');
		return energy_point;
	} else if (energy_point.startsWith('base')){
		return base_lookup[energy_point];
	} else if (energy_point.startsWith('star')){
		return star_lookup[energy_point];
	} else if (energy_point.startsWith('outpost')){
		return outpost_lookup[energy_point];
	} else if (energy_point.startsWith('pylon')){
		return pylon_lookup[energy_point];
	} else {
		return spirit_lookup[energy_point];
	}
}

function create_spirit_p1(spir_id){
	
	var spir_position = [game_blocks['t' + tick_counter].p1[spir_id][0][0], game_blocks['t' + tick_counter].p1[spir_id][0][1]];
	if (shapes['shape1'] == 'circles') var spir_size = 1;
	if (shapes['shape1'] == 'squares') var spir_size = 10;
	if (shapes['shape1'] == 'triangles') var spir_size = 3;
	var spir_energy = game_blocks['t' + tick_counter].p1[spir_id][2];
	var spir_hp = game_blocks['t' + tick_counter].p1[spir_id][3];
	var spir_player = pla1;
	var spir_color = colors['color1'];
	//console.log(spir_color);
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
	
	//console.log('creating spirit p2');
	
	var spir_position = [game_blocks['t' + tick_counter].p2[spir_id][0][0], game_blocks['t' + tick_counter].p2[spir_id][0][1]];
	if (shapes['shape2'] == 'circles') var spir_size = 1;
	if (shapes['shape2'] == 'squares') var spir_size = 10;
	if (shapes['shape2'] == 'triangles') var spir_size = 3;
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
		this.color_store = color;
		
		//const properties
		this.hp = hp;
		this.energy_capacity = size * 10;
		this.player_id = player;
		//this.player_id = player; set up later
		living_spirits.push(this);
		this.temp_size = size;
		
		this.shout = '';
		this.tria = 0;
		this.exploding = 0;
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
		this.position[0] = origin[0] + (incr[0] * (total_time / game_tick));
		this.position[1] = origin[1] + (incr[1] * (total_time / game_tick));
		
		//console.log('total_time = ' + total_time);
		//console.log('game_tick = ' + game_tick);
		//console.log(total_time / game_tick);
		
		if (this.shape == 'triangles') this.tria = calcAngleDegrees(incr[0], incr[1]);
		
		
	}
	
	energize(prev_energy, new_energy, hp){
		if (this.exploding == 1){
			setTimeout(function(){
				this.hp = 0;
				this.exploding = 0;
			}, game_tick);
		}
		if (this.hp != 0){
			this.energy = prev_energy;
			this.energy = prev_energy + ((new_energy - prev_energy) * (total_time / game_tick));
		
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
					that.size += 0.1 * start_size; //that.size + (0.1 * that.size);
					that.color = that.color.replace(/[^,]+(?=\))/, alpha/8);
					counter_death++;
					alpha--;
				}, 16);
			}
		} else if (hp != 0){
			this.hp = 1;
			this.energy = new_energy;
			this.color = this.color_store;
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
			this.size = prev_size + ((new_size - prev_size) * (total_time / game_tick));
			this.energy_capacity = (prev_size * 10) + ((new_size - prev_size) * 10) * (total_time / game_tick);
		} else if (new_size != this.size){
			this.size = new_size;
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
	
	explode(){
		var color_parts = this.color.match(/[.?\d]+/g);
		if (!explosions[this.id]) explosions[this.id] = 4;
		//console.log(explosions[this.id]);
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
		//console.log('calling explode')
		var draw_alpha = color_parts[3] * (1 - explosions[this.id] / 100);
		if (explosions[this.id] >= 100) draw_alpha = 0;
		
		c.beginPath();
		c.arc(this.position[0], this.position[1], explosions[this.id], 0, Math.PI * 2, false);
		c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + draw_alpha + ')';
		c.fill();
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
			if (spirit_percent_energy > 1){
				//console.log('spirit_percent_energy = ' + spirit_percent_energy);
				spirit_percent_energy = 1;
			}
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
				console.log(e);
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
			} else if (this.shape == 'triangles'){
				let current_color = this.color;
				var color_parts = this.color.match(/[.?\d]+/g);
				let lineW = spirit_percent_energy;
				if (lineW < 0.6) lineW = 0.6;
				//if (spirit_percent_energy < 10){
				//	c.lineWidth = 0.75;
				//} else if (this.size < 8){
				//	c.lineWidth = 0.5 + ((this.size - 1) / 4);
				//} else {
				//	c.lineWidth = 2;
				//}
				
				//outer triangle
				draw_polygon(this.position[0],this.position[1],3,this.size + 2,lineW,'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + color_parts[3] * (spirit_percent_energy/2 + 0.6) + ')',0,this.tria)
				
				//energy
				draw_polygon(this.position[0],this.position[1],3,(this.size + 1) * spirit_percent_energy,1,0,current_color,this.tria)
				
			}
			
			if (this.shout != ''){
				if (shouting_helper[this.id] == null || shouting_helper[this.id] <= 0){
					shouting_helper[this.id] = 180;
				} else {
					shouting_helper[this.id] -= 1;
				}
				c.font = '13px sans-serif';
				c.fillStyle = 'rgba(' + color_parts[0] * 1.4 + ', ' + color_parts[1] * 1.4 + ', ' + color_parts[2] * 1.4 + ', ' + color_parts[3] * (shouting_helper[this.id] / 180) + ')';
				c.textAlign = 'center';
				c.fillText(this.shout, this.position[0], this.position[1] - 8);
			}
			
		
			
			
			//console.log('drawing size = ' + drawing_size);
		}
	}
}

class Star {
	constructor(id, position, energy, size){
		this.id = id
		this.position = position;
		this.size = size;
		this.structure_type = 'star';
		this.energy = energy;
		stars.push(this);
	}
	
	draw() {
		
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c_base.fillStyle = "rgba(255, 255, 255, " + (this.size / 100) + 0.1 + ")";
		//c_base.fill();
		
		//c_base.beginPath();
		//c_base.arc(this.position[0], this.position[1], 5, 0, Math.PI * 2, false);
		//c_base.fillStyle = "rgba(248, 247, 255, 1)";
		//c_base.fill();
		
		//c_base.beginPath();
		//c_base.arc(this.position[0], this.position[1], 200 + this.size, 0, Math.PI * 2, false);
		//c_base.fillStyle = "rgba(54, 195, 255, " + this.size / 10000 +")";
		//c_base.fill();
		
		c_base.save();
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], 6 + this.size, 0, Math.PI * 2, false);
		c_base.clip();
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], 14 + this.size, 0, Math.PI * 2, false);
		c_base.fillStyle = "rgba(254, 15, 25, " + (this.size / 100) + 0.1 + ")";
		//c_base.fill();
		c_base.strokeStyle = 'rgba(255,255,255,1)';
		c_base.shadowColor='rgba(225, 250, 255, ' + this.size / 175 + ')';
		c_base.shadowBlur= this.size / ((4 + (this.size / 130)) * (multiplier / 2.5));
		c_base.lineWidth = 8;
		c_base.stroke();
		//c_base.stroke();
		
		
		
		c_base.shadowColor=null;
		c_base.shadowBlur = null;
		c_base.restore();
		
		
		var teX = this.position[0];
		var teY = this.position[1];
		
		//console.log(multiplier)
		
	}
	
	
	draw_energy() {
		c.beginPath();
		c.arc(this.position[0], this.position[1], 1 + this.energy / 100, 0, Math.PI * 2, false);
		c.fillStyle = "rgba(248, 247, 255, 1)";
		c.fill();
	}
	
	
	update_resource(new_energy){
		this.energy = new_energy;
	}
	
	
}

class Fragment {
	constructor(position, energy){
		this.position = position;
		this.energy = energy;
		fragments.push(this);
	}
	
	draw() {
		
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c_base.fillStyle = "rgba(255, 255, 255, " + (this.size / 100) + 0.1 + ")";
		//c_base.fill();
		
		//c_base.beginPath();
		//c_base.arc(this.position[0], this.position[1], 5, 0, Math.PI * 2, false);
		//c_base.fillStyle = "rgba(248, 247, 255, 1)";
		//c_base.fill();
		
		//c_base.beginPath();
		//c_base.arc(this.position[0], this.position[1], 200 + this.size, 0, Math.PI * 2, false);
		//c_base.fillStyle = "rgba(54, 195, 255, " + this.size / 10000 +")";
		//c_base.fill();
		
		//c_base.save();
		//c_base.beginPath();
		//c_base.arc(this.position[0], this.position[1], 6 + this.size, 0, Math.PI * 2, false);
		//c_base.clip();
		//c_base.beginPath();
		//c_base.arc(this.position[0], this.position[1], 14 + this.size, 0, Math.PI * 2, false);
		//c_base.fillStyle = "rgba(254, 15, 25, " + (this.size / 100) + 0.1 + ")";
		////c_base.fill();
		//c_base.strokeStyle = 'rgba(255,255,255,1)';
		//c_base.shadowColor='rgba(225, 250, 255, ' + this.size / 175 + ')';
		//c_base.shadowBlur= this.size / ((4 + (this.size / 130)) * (multiplier / 2.5));
		//c_base.lineWidth = 8;
		//c_base.stroke();
		////c_base.stroke();
		//
		//
		//
		//c_base.shadowColor=null;
		//c_base.shadowBlur = null;
		//c_base.restore();
		//
		//
		//var teX = this.position[0];
		//var teY = this.position[1];
		
		//console.log(multiplier)
		
	}
	
	
	draw_energy() {
		c.beginPath();
		c.arc(this.position[0], this.position[1], 1 + this.energy / 100, 0, Math.PI * 2, false);
		c.fillStyle = "rgba(248, 247, 255, 1)";
		c.fill();
	}
	
	
	update_resource(new_energy){
		this.energy = new_energy;
	}
	
	
}

function mapValues(the_number, in_min, in_max, out_min, out_max) {
  return (the_number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function drawRotated(x, y, width, height, degrees, color){
        // first save the untranslated/unrotated context
        c.save();
        c.beginPath();
        c.translate(x+width/2, y+height/2 );
        c.rotate(degrees*Math.PI/180);
        c.rect(-width/2, -height/2, width, height);
		c.lineWidth = 2;
        c.strokeStyle = color;
        c.stroke();
        c.restore();
}

class Base {
	constructor(id, position, energy, player, color, shape, def_status = 0){
		this.shape = shape;
		this.id = id
		this.position = position;
		this.size = 25;
		this.structure_type = 'base';
		this.energy = energy;
		
		this.hp = 1;
		if (this.shape == 'circles') this.energy_capacity = 400;
		if (this.shape == 'squares') this.energy_capacity = 1000;
		if (this.shape == 'triangles') this.energy_capacity = 600;
		this.control = player;
		//this.color = color;
		if (this.control == pla1) this.color = colors['color1'];
		if (this.control == pla2) this.color = colors['color2'];
		if (this.control == '') this.color = "rgba('155, 155, 155, 0.5')";
		this.color_parts = color.match(/[.?\d]+/g);
		this.color_hsl = rgb_to_hsl(this.color_parts[0], this.color_parts[1], this.color_parts[2]);
		this.current_spirit_cost = 100;
		
		if (this.control == pla1) this.shape = shapes['shape1'];
		if (this.control == pla2) this.shape = shapes['shape2'];
		if (this.control == '') this.shape = 'neutral';
		
		
		// 1 if under attack
		this.def_status = def_status;
		
		bases.push(this);
		if (this.shape == 'triangles') this.base_points = get_triangle(this.position[0], this.position[1], 30);
	}
	
	draw(cntrl = '') {
		//console.log(this.control);
		if (cntrl == pla1){
			this.color = colors['color1'];
			this.shape = shapes['shape1'];
		}
		if (cntrl == pla2){
			this.color = colors['color2'];
			this.shape = shapes['shape2'];
		} 
		if (cntrl == ''){
			this.shape = 'neutral';
			this.color = "rgba('155, 155, 155, 0.5')";
		} 
		
		var color_parts = this.color.match(/[.?\d]+/g);
		if (this.control != cntrl){
			//console.log('control change');
			this.control = cntrl;
			this.color_hsl = rgb_to_hsl(color_parts[0], color_parts[1], color_parts[2]);
		} 
		
		var production_percent = this.energy / this.current_spirit_cost;
		var true_ratio = production_percent;
		if (production_percent > 1) production_percent = 1;
		if (this.energy <= 0) this.energy = 0.1;
		
		if (this.shape == 'circles'){
			
			//base bg
			c.beginPath();
			c.arc(this.position[0], this.position[1], 50, 0, Math.PI * 2, false);
			c.closePath();
			c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + (0.08 + (0.02 * true_ratio)) + ')';
			c.fill();
			
			//inner base
			c.beginPath();
			c.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
			c.closePath();
			c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + mapValues(this.def_status, 0, 1, 0.69, 1) + ')';
			c.lineWidth = 10;
			c.stroke();
			c.setLineDash([]);
			
			//defense ring
			c.beginPath();
			c.arc(this.position[0], this.position[1], this.size + 20, 0, Math.PI * 2, false);
			c.closePath();
			c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + mapValues(this.def_status, 0, 1, 0, 1) + ')';
			c.lineWidth = 2 + (this.energy / 100);
			c.setLineDash([2, 4]);
			c.stroke();
			c.setLineDash([]);
			
			let stroke_width = 10 * production_percent;
			let stroke_offset = stroke_width / 2;
			if (stroke_width < 1){
				stroke_width = 0;
				stroke_offset = 0;
			}
			
			if (stroke_width > 1){
				c.beginPath();
				c.arc(this.position[0], this.position[1], (this.size - 5 + stroke_offset), Math.PI * 0, Math.PI * 2, false);
				c.lineWidth = stroke_width;
				c.strokeStyle = 'hsla(' + this.color_hsl[0] + ', ' + this.color_hsl[1] + '%, ' + (this.color_hsl[2] + 12) + '%, ' + 1 + ')';
				c.stroke();
			}
			
			
		} else if (this.shape == 'squares'){
			
			//base bg
			c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + (0.08 + (0.02 * true_ratio)) + ')';
			c.fillRect((this.position[0] - 45), (this.position[1] - 45), this.size + 65, this.size + 65);
			
			
			//inner base
			c.lineWidth = 8;
			c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + mapValues(this.def_status, 0, 1, 0.69, 1) + ')';
			c.strokeRect((this.position[0] - 4 - (this.size / 2)), (this.position[1] - 4 - (this.size / 2)), this.size + 8, this.size + 8);
			
			//defense ring
			c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + mapValues(this.def_status, 0, 1, 0, 1) + ')';
			c.lineWidth = 2 + (this.energy / 100);
			c.setLineDash([2, 4]);
			c.strokeRect((this.position[0] - 35), (this.position[1] - 35), this.size + 45, this.size + 45);
			c.setLineDash([]);
			
			
			let stroke_width = 8 * production_percent;
			let stroke_offset = stroke_width / 2;
			if (stroke_width < 1){
				stroke_width = 0;
				stroke_offset = 0;
			}
			
			if (stroke_width > 1){
				c.beginPath();
				c.arc(this.position[0], this.position[1], (this.size - 5 + stroke_offset), Math.PI * 0, Math.PI * 2, false);
				c.lineWidth = stroke_width;
				c.strokeStyle = 'hsla(' + this.color_hsl[0] + ', ' + this.color_hsl[1] + '%, ' + (this.color_hsl[2] + 12) + '%, ' + 1 + ')';
				c.strokeRect((this.position[0] - stroke_offset - (this.size / 2)), (this.position[1] - stroke_offset - (this.size / 2)), this.size + (stroke_offset * 2), this.size + (stroke_offset * 2));
			}
			
			
		} else if (this.shape == 'triangles'){
			let current_color = this.color;
			let L = 60;
		  let side_a = L,
		      side_b = L,
		      side_c = L;

		  let R = (L *.5) / Math.cos(Math.PI/6);
		  
		  //c.beginPath();
		  //c.arc(this.position[0], this.position[1], this.size, Math.PI * 0, Math.PI * 3, false);
		  //c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.86 + ')';
		  //c.stroke();
		  
		  //base bg
		  //c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + (0.08 + (0.02 * true_ratio)) + ')';
		  //c.fillRect((this.position[0] - 45), (this.position[1] - 45), this.size + 65, this.size + 65);
		  
		  let tri_base_color = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + (0.08 + (0.02 * true_ratio)) + ')';
		  draw_polygon(this.position[0],this.position[1],3,40,40,tri_base_color,0,0)
		  
		  
		  //let triangle = get_triangle(this.position[0], this.position[1], 20);
		  //console.log(triangle);
		  
		  //outer triangle
		  //draw_triangle(this.position[0], this.position[1], 30, 30, this.base_points[0], this.base_points[1], this.base_points[2], this.base_points[3], this.base_points[4], this.base_points[5], 90)
		  
		  let inc_angle = 0;
		  
		  //if (typeof incoming !== undefined){
		  //	  inc_angle = incoming.t;
		  //}
		  
		  let basic_base_color = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + mapValues(this.def_status, 0, 1, 0.69, 1) + ')';
		  draw_polygon(this.position[0],this.position[1],3,26,8,basic_base_color,0,inc_angle)
		  
		  
		  //defense ring
		  let tri_defense_color = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + mapValues(this.def_status, 0, 1, 0, 0.5) + ')';
		  let defense_thickness = 2 + (this.energy / 100);
		  let defense_overthick = 0;
		  if (defense_thickness > 4){
			  defense_overthick = defense_thickness - 4;
			  defense_thickness = 4;
		  } 
			  
		  draw_polygon(this.position[0],this.position[1],3,50,defense_thickness,tri_defense_color,0,inc_angle)
		  
		  if (defense_overthick > 0){
		  	draw_polygon(this.position[0],this.position[1],3,64,defense_overthick,tri_defense_color,0,inc_angle)
		  }
		  
		  
		  
		  //c.beginPath();
		  //c.moveTo(this.base_points[0], this.base_points[1]);
		  //c.lineTo(this.base_points[2], this.base_points[3]);
		  //c.lineTo(this.base_points[4], this.base_points[5]);
		  //c.lineTo(this.base_points[0], this.base_points[1]);
		  //c.closePath();
		  //c.lineWidth = 4;
		  //c.stroke();
		  
		  //drawRotated(this.position[0], this.position[1], 30, 30, incoming.t, current_color);
		  
		  //console.log(incoming.t);
		  
		  //let progress_color = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + color_parts[3] * production_percent + ')';
		  
		  //draw_polygon(this.position[0],this.position[1],3,15,2,progress_color,0,inc_angle + 60)
		  
		  let progress_color = 'hsla(' + this.color_hsl[0] + ', ' + this.color_hsl[1] + '%, ' + (this.color_hsl[2] + 12) + '%, ' + 1 + ')';
		  
		  let stroke_width = 8 * production_percent;
		  let stroke_offset = stroke_width / 2;
		  if (stroke_width < 1){
		  	stroke_width = 0;
		  	stroke_offset = 0;
		  }
		  
		  if (stroke_width > 1){
			draw_polygon(this.position[0],this.position[1],3,22 + stroke_offset,stroke_width,progress_color,0,inc_angle)
		  }
		  
		  
		  
		} else if (this.shape == 'neutral'){
			//console.log('neutral shape');
			
			
			c.lineWidth = 1;
			c.strokeStyle = 'hsla(' + this.color_hsl[0] + ', ' + this.color_hsl[1] + '%, ' + (this.color_hsl[2] + 12) + '%, ' + 1 + ')';
			
			c.roundRect((this.position[0] - 9 - (this.size / 2)), (this.position[1] - 9 - (this.size / 2)), this.size + 18, this.size + 18, 16);
			c.stroke();
			c.roundRect((this.position[0] - 2 - (this.size / 2)), (this.position[1] - 2 - (this.size / 2)), this.size + 4, this.size + 4, 10);
			c.stroke();
			
			
			
			
			//base bg
			c.fillStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + (0.03 + (0.02 * true_ratio)) + ')';
			c.roundRect((this.position[0] - 45), (this.position[1] - 45), this.size + 65, this.size + 65, 24);
			c.fill();
			
			
		}
		
		
	}
	
	charge(prev_energy, new_energy){
		
		let elapso = (total_time / game_tick)
		
		
		if (new_energy < prev_energy){
			//this.energy = prev_energy;
			elapso = ((total_time * 4) / game_tick);
			if (elapso > 1) elapso = 1;
			this.energy = prev_energy + ((new_energy - prev_energy) * elapso);
		} else {
			this.energy = prev_energy;
			this.energy = prev_energy + ((new_energy - prev_energy) * elapso);
		}
		
		
		//if (prev_energy > new_energy && (prev_energy - new_energy) > (this.current_spirit_cost/1.5)){
		//	this.energy = new_energy * (total_time / game_tick);
		//} else if (prev_energy >= new_energy){
		//	this.energy = new_energy;
		//} else if (prev_energy < new_energy){
		//	this.energy = prev_energy;
		//	this.energy = prev_energy + ((new_energy - prev_energy) * (total_time / game_tick));
		//} 
	}
	
	defend(new_status){
		//def_status is number between 0 and 1 (0 and 1 values obvious, everything inbetween for animation purposes)
		
		if (new_status != this.def_status){
			this.def_status = Math.abs((new_status * (total_time / game_tick)) + ((new_status - 1) * ((total_time / game_tick) - 1)));
			if (Math.abs(this.def_status - new_status) < 0.05) this.def_status = new_status;
			//console.log('this.def_status = ' + this.def_status);
			//console.log('updating def status of ' + this.id + ' to ' + new_status);
		}
	}
	
	shield(current_hp){
		//def_status is number between 0 and 1 (0 and 1 values obvious, everything inbetween for animation purposes)
		this.hp = current_hp;
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

class Outpost {
	constructor(id, position, energy, control = ''){
		this.id = id
		this.position = position;
		this.size = 20;
		this.structure_type = 'outpost';
		this.energy = energy;
		this.energy_capacity = 1000;
		this.range = 400;
		this.control = control;
		
		if (this.control == pla1) this.color = colors['color1'];
		if (this.control == pla2) this.color = colors['color2'];
		if (this.control == '') this.color = "rgba(89, 82, 108, 1)";
		
		
		outposts.push(this);
	}
	
	draw(enrg, cntrl = '') {
		if (cntrl == pla1) this.color = colors['color1'];
		if (cntrl == pla2) this.color = colors['color2'];
		if (cntrl == '') this.color = "rgba(89, 82, 108, 1)";
		
		this.energy = enrg;
		this.control = cntrl;
		
		
		
		let energy_ratio = Math.round(this.energy / (this.energy_capacity / 10));
		
		//console.log('this.color = ' + this.color);
		let current_color = this.color;
		//c.lineWidth = 4;
		//c.strokeStyle = this.color;
		//c.strokeRect((this.position[0] - 12), (this.position[1] - 12), 24, 24);
		var draw_angle = 45;
		if (cntrl != ''){
			if (this.energy < 500) {
				draw_angle = mapValues(dumb_cycler, 0, 60, 45, 135);
				this.range = 400;
			} else {
				draw_angle = mapValues(dumb_cycler, 0, 60, 45, 225);
				this.range = 600;
			}
			
			var color_parts = this.color.match(/[.?\d]+/g);
			// outer circle
			c.beginPath();
			c.arc(this.position[0], this.position[1], this.range, Math.PI * 0, Math.PI * 2, false);
			c.closePath();
			c.lineWidth = 2;
			c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.06 + ')';
			c.stroke();
		}
		
		// rotated square
		drawRotated(this.position[0] - 12, this.position[1] - 12, 24, 24, draw_angle, current_color);

		// inner-outer circle
		c.beginPath();
		c.arc(this.position[0], this.position[1], 8, Math.PI * 0, Math.PI * 2, false);
		c.closePath();
		c.lineWidth = 2;
		c.strokeStyle = this.color;
		c.stroke();
		
		// inner-inner circle
		c.beginPath();
		c.arc(this.position[0], this.position[1], energy_ratio, Math.PI * 0, Math.PI * 2, false);
		c.closePath();
		c.fillStyle = this.color;
		c.fill();
		
	}
}

class Pylon {
	constructor(id, position, energy, control = ''){
		this.id = id
		this.position = position;
		this.size = 20;
		this.structure_type = 'pylon';
		this.energy = energy;
		this.energy_capacity = 1000;
		this.control = control;
		
		if (this.control == pla1) this.color = colors['color1'];
		if (this.control == pla2) this.color = colors['color2'];
		if (this.control == '') this.color = "rgba(89, 82, 108, 1)";
		
		
		pylons.push(this);
	}
	
	draw(enrg, cntrl = '') {
		if (cntrl == pla1) this.color = colors['color1'];
		if (cntrl == pla2) this.color = colors['color2'];
		if (cntrl == '') this.color = "rgba(89, 82, 108, 1)";
		
		this.energy = enrg;
		this.control = cntrl;
		
		
		
		let energy_ratio = Math.round(this.energy / (this.energy_capacity / 10));
		
		//console.log('this.color = ' + this.color);
		let current_color = this.color;
		//c.lineWidth = 4;
		//c.strokeStyle = this.color;
		//c.strokeRect((this.position[0] - 12), (this.position[1] - 12), 24, 24);
		var draw_angle = 45;
		if (cntrl != ''){
			if (this.energy < 500) {
				draw_angle = mapValues(dumb_cycler, 0, 60, 45, 135);
				this.range = 400;
			} else {
				draw_angle = mapValues(dumb_cycler, 0, 60, 45, 225);
				this.range = 600;
			}
			
			var color_parts = this.color.match(/[.?\d]+/g);
			// outer circle
			c.beginPath();
			c.arc(this.position[0], this.position[1], this.range, Math.PI * 0, Math.PI * 2, false);
			c.closePath();
			c.lineWidth = 2;
			c.strokeStyle = 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + 0.06 + ')';
			c.stroke();
		}
		
		// rotated square
		//drawRotated(this.position[0] - 12, this.position[1] - 12, 24, 24, draw_angle, current_color);

		// other circles (not center)
		c.lineWidth = 1;
		c.strokeStyle = this.color;
		
		c.beginPath();
		c.arc(this.position[0] + 8, this.position[1], 8, Math.PI * 0, Math.PI * 2, false);
		c.moveTo(this.position[0], this.position[1]);
		c.arc(this.position[0] - 8, this.position[1], 8, Math.PI * 0, Math.PI * 2, false);
		c.moveTo(this.position[0] + 8, this.position[1] + 8);
		c.arc(this.position[0], this.position[1] + 8, 8, Math.PI * 0, Math.PI * 2, false);
		c.moveTo(this.position[0] + 8, this.position[1] - 8);
		c.arc(this.position[0], this.position[1] - 8, 8, Math.PI * 0, Math.PI * 2, false);
		c.closePath();
		
		c.stroke();

		
		// inner-outer circle
		c.beginPath();
		c.arc(this.position[0], this.position[1], 8, Math.PI * 0, Math.PI * 2, false);
		c.closePath();
		c.lineWidth = 1;
		c.strokeStyle = this.color;
		c.stroke();
		
		// inner-inner circle
		c.beginPath();
		c.arc(this.position[0], this.position[1], energy_ratio, Math.PI * 0, Math.PI * 2, false);
		c.closePath();
		c.fillStyle = this.color;
		c.fill();
		
	}
}



function draw_energize(origin, target, energy_strength, color){
	if (energy_strength == 0) return;
	var color_parts = color.match(/[.?\d]+/g);
	//console.log(Number(color_parts[0]) + 50)
	try {
		var grad = c.createLinearGradient(Math.round(origin[0]), Math.round(origin[1]), Math.round(target[0]), Math.round(target[1]));
		grad.addColorStop(0, 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + (color_parts[3]/2) + ')');
		grad.addColorStop(0.06, 'rgba(' + (Number(color_parts[0]) + 80) + ', ' + (Number(color_parts[1]) + 50) + ', ' + (Number(color_parts[2]) + 50) + ', ' + color_parts[3] + ')');
		grad.addColorStop(1, 'rgba(' + color_parts[0] + ', ' + color_parts[1] + ', ' + color_parts[2] + ', ' + (color_parts[3]/2) + ')');
	} catch (e) {
		console.log(e);
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
	
	star_lookup['star_zxq'] = new Star('star_zxq', [-1200, -340], 50, 140);
	star_lookup['star_a2c'] = new Star('star_a2c', [340, 1200], 50, 140);	
	star_lookup['star_p89'] = new Star('star_p89', [-520, 520], 50, 140);
	star_lookup['star_nua'] = new Star('star_nua', [420, -420], 50, 680);
	
	outpost_lookup['outpost_mdo'] = new Outpost('outpost_mdo', [-210, 210], 0);	
	pylon_lookup['pylon_u3p'] = new Pylon('pylon_u3p', [278, -278], 0);	
	
	//star_energy_lookup['star_zxq'] = new Star_energy('star_zxq', [1000, 1000], 50);
	//star_energy_lookup['star_a1c'] = new Star_energy('star_a1c', [3200, 1400], 50);
	
	star_lookup['star_zxq'].draw();
	star_lookup['star_a2c'].draw();
	star_lookup['star_p89'].draw();
	star_lookup['star_nua'].draw();
	
	//outpost_lookup['outpost_mdo'].draw();
	
	//draw_grid();
	offsetUpdate();
	
	
	corner1_parts = colors['color1'].match(/[.?\d]+/g);
	corner2_parts = colors['color2'].match(/[.?\d]+/g);

	corner1_parts_hsl = rgb_to_hsl(corner1_parts[0], corner1_parts[1], corner1_parts[2]);
	corner2_parts_hsl = rgb_to_hsl(corner2_parts[0], corner2_parts[1], corner2_parts[2]);
	
	
	world_initiated = 1;
}

function handle_shout(spir_id, shout_msg){
	//console.log(spir_id + ' is saying ' + shout_msg);
	spirit_lookup[spir_id].shout = shout_msg;
	
	setTimeout(function(){
		shouting[spir_id] = 0;
		spirit_lookup[spir_id].shout = '';
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
	
	//console.log(incoming.t);
	
	if (isNaN(timestamp)){
		
	} else {
		elapsed = timestamp - prev;
		if (elapsed > 100) elapsed = 16.6;
		prev = timestamp;
		dumb_cycler++;
		//console.log(total_time);
	
		total_time += elapsed;
	}
	
	//console.log('total_time = ' + total_time);
	//console.log('timestamp = ' + timestamp);
	//console.log('elapsed = ' + elapsed);
	//console.log('prev = ' + prev);
	
	if (dumb_cycler >= 60){
		dumb_cycler = 0;		
		fill_hover_thing(pointing_at_x, pointing_at_y, board_x, board_y);
	}
	
	//c.clearRect(0, 0, main_canvas.width, main_canvas.height);
	c.fillStyle = 'rgba(6,8,10,1)';
	//c.fillRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.2, main_canvas.height * multiplier * 1.2);
	c.clearRect(-offsetX, -offsetY, main_canvas.width * multiplier * 1.2, main_canvas.height * multiplier * 1.2);
	
	c.setTransform(scale, 0, 0, scale, 0, 0);
	c.translate(offsetX, offsetY);
	
	draw_bg_grad();
	
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
				console.log(e)
			}
			
		} else if (spirit_lookup[all_spirits[i]].player_id == pla2){
			try {
				spirit_lookup[all_spirits[i]].move([game_blocks[active_block].p2[all_spirits[i]][0][4], game_blocks[active_block].p2[all_spirits[i]][0][5]], [game_blocks[active_block].p2[all_spirits[i]][0][2], game_blocks[active_block].p2[all_spirits[i]][0][3]]);
				spirit_lookup[all_spirits[i]].energize(game_blocks[active_block].p2[all_spirits[i]][5], game_blocks[active_block].p2[all_spirits[i]][2], game_blocks[active_block].p2[all_spirits[i]][3]);
				spirit_lookup[all_spirits[i]].size_change(game_blocks[active_block].p2[all_spirits[i]][4], game_blocks[active_block].p2[all_spirits[i]][1]);
			} catch (e) {
				console.log(e)
			}
			
		}
		spirit_lookup[all_spirits[i]].draw();
	}
	
	
	//p1_spirs = game_blocks[active_block].p1;
	//for (i = 0; i < p1_spirs.length; i++){
	//	spirit_lookup[p1_spirs[i][0]]
	//}
	//
	
	
	try {
		var energy_blocks = game_blocks[active_block].e;
	} catch (e) {
		console.log(e);
		try {
			var energy_blocks = game_blocks[active_block - 1].e;
			console.log('resynchronizing game state');
			tick_local -= 1;
		} catch (e2) {
			console.log(e2);
			//location.reload();
			//setTimeout(function(){
				//var energy_blocks = game_blocks[incoming.t].e;
				//console.log('resync2');
				//tick_local = incoming.t - 1;
				//}, 30);
				if (typeof replay_playing !== 'undefined') {
					current_tick--;
					if (replay_playing == 1){
						play_pause();
					}
				    // the variable is defined
				} else {
					location.reload();
				}
				
		}
	}
	var energy_blocks = game_blocks[active_block].e;
	for (i = 0; i < energy_blocks.length; i++){
		//console.log(energy_blocks[i]);
		var energy_origin = resolve_energy_point(energy_blocks[i][0]);
		//console.log(energy_blocks[i][0]);
		var energy_target = resolve_energy_point(energy_blocks[i][1]);
		var energy_color = energy_origin.color;
		
		let eori = energy_origin.position;
		let etar = energy_target.position;
		
		if (Array.isArray(energy_origin)){
			energy_color = energy_target.color;
			eori = energy_origin;
		} else if (energy_origin.id.startsWith('star')){
			energy_color = energy_target.color;
		}
		
		if (Array.isArray(energy_target)) etar = energy_target;
		
		
		
		if (energy_origin.hp != 0 && energy_target.hp != 0){
			draw_energize(eori, etar, energy_blocks[i][2], energy_color);
		}
	}
	
	var specials = game_blocks[active_block].s;
	for (i = 0; i < specials.length; i++){
		if (specials[i][0] == 'sh' && spirit_lookup[specials[i][1]].player_id == pla1 && shouting_count_p1 < 100){
			//console.log(specials[i][2]);
			
			if (shouting[specials[i][1]] == null || shouting[specials[i][1]] == 0){
				shouting[specials[i][1]] = 3;
				handle_shout(specials[i][1], specials[i][2]);
			}
			shouting_count_p1++;
		} else if (specials[i][0] == 'sh' && spirit_lookup[specials[i][1]].player_id == pla2 && shouting_count_p2 < 100){
			
			if (shouting[specials[i][1]] == null || shouting[specials[i][1]] == 0){
				shouting[specials[i][1]] = 3;
				handle_shout(specials[i][1], specials[i][2]);
			}
			shouting_count_p2++;
			
		} else if (specials[i][0] == 'ex'){
			spirit_lookup[specials[i][1]].explode();
			//console.log('exploding');
		}
	}
	
	shouting_count_p1 = 0;
	shouting_count_p2 = 0;
	
	let bases_def_status = [];
	
	//let b1_def_status = 0
	//let b2_def_status = 0
	//let b3_def_status = 0
	//
	//if (game_blocks[active_block].b1[2] > 0) b1_def_status = 1;
	//if (game_blocks[active_block].b2[2] > 0) b2_def_status = 1;
	//if (game_blocks[active_block].b3[2] > 0) b3_def_status = 1;
	
	for (let b = 0; b < bases.length; b++){
		bases_def_status[b] = 0;
		if (game_blocks[active_block]['b' + (b+1)][2] > 0) bases_def_status[b] = 1;
		bases[b].charge(game_blocks[active_block]['b' + (b+1)][4], game_blocks[active_block]['b' + (b+1)][0]);
		bases[b].defend(bases_def_status[b]);
		bases[b].shield(game_blocks[active_block]['b' + (b+1)][3]);
		bases[b].current_spirit_cost = game_blocks[active_block]['b' + (b+1)][1];
		bases[b].draw(game_blocks[active_block]['b' + (b+1)][3]);
	}
	
	
	//bases[0].charge(game_blocks[active_block].b1[4], game_blocks[active_block].b1[0]);
	//bases[1].charge(game_blocks[active_block].b2[4], game_blocks[active_block].b2[0]);
	//bases[2].charge(game_blocks[active_block].b3[4], game_blocks[active_block].b3[0]);
	//
	//
	//
	//
	//
	//bases[0].defend(b1_def_status);
	//bases[1].defend(b2_def_status);
	//bases[2].defend(b3_def_status);
	//bases[0].shield(game_blocks[active_block].b1[3]);
	//bases[1].shield(game_blocks[active_block].b2[3]);
	//bases[2].shield(game_blocks[active_block].b3[3]);
	////console.log(b1_def_status);
	////console.log(b2_def_status);
	////console.log(b3_def_status);
	////console.log('---');
	////console.log(game_blocks[active_block].b1[3]);
	////console.log(game_blocks[active_block].b2[3]);
	////console.log(game_blocks[active_block].b3[3]);
	////console.log('---');
	//
	//
	//bases[0].current_spirit_cost = game_blocks[active_block].b1[1];
	//bases[1].current_spirit_cost = game_blocks[active_block].b2[1];
	//bases[2].current_spirit_cost = game_blocks[active_block].b3[1];
	//bases[0].draw(game_blocks[active_block].b1[3]);
	//bases[1].draw(game_blocks[active_block].b2[3]);
	//bases[2].draw(game_blocks[active_block].b3[3]);
	
	outposts[0].draw(game_blocks[active_block].ou[0], game_blocks[active_block].ou[1]);
	pylons[0].draw(game_blocks[active_block].py[0], game_blocks[active_block].py[1]);
	
	
	// star is drawn on the other static canvas. Draw only the center?
	//console.log(game_blocks[active_block].st[0]);
	stars[0].update_resource(game_blocks[active_block].st[0]);
	stars[1].update_resource(game_blocks[active_block].st[1]);
	stars[2].update_resource(game_blocks[active_block].st[2]);
	stars[3].update_resource(game_blocks[active_block].st[3]);
	stars[0].draw_energy();
	stars[1].draw_energy();
	stars[2].draw_energy();
	stars[3].draw_energy();
	
	for (let f = 0; f < game_blocks[active_block].ef.length; f++){
		//fragments[f].update_resource(game_blocks[active_block].ef[f]);
		//fragments[f].draw_energy();
		
		let fragment = game_blocks[active_block].ef[f];
		
		let frag_grd = c.createRadialGradient(fragment[0][0], fragment[0][1], 1, fragment[0][0], fragment[0][1], 12);
		frag_grd.addColorStop(0, "rgba(248, 247, 255, 0)");
		frag_grd.addColorStop(1, "rgba(248, 247, 255, " + (0.05 + Math.min(0.1 * fragment[1] / 100, 0.1) + fragment[1] / 1200) + ")");
		
		c.beginPath();
		c.arc(fragment[0][0], fragment[0][1], 1 + Math.min(fragment[1] / 50, 8), 0, Math.PI * 2, false);
		c.fillStyle = "rgba(248, 247, 255, 1)";
		c.fill();
		
		c.beginPath();
		c.arc(fragment[0][0], fragment[0][1], 12, 0, Math.PI * 2, false);
		c.fillStyle = frag_grd;
		c.fill();
		
		//c.save();
		//c.beginPath();
		//c.arc(fragment[0][0], fragment[0][1], 6, 0, Math.PI * 2, false);
		//c.clip();
		//c.beginPath();
		//c.arc(fragment[0][0], fragment[0][1], 14, 0, Math.PI * 2, false);
		//c.fillStyle = "rgba(254, 15, 25, " + 0.2 + ")";
		////
		//c.strokeStyle = 'rgba(255,255,255,1)';
		//c.shadowColor='rgba(225, 250, 255, ' + '1' + ')';
		//c.shadowBlur= 2 * (multiplier / 2.5);
		//c.lineWidth = 8;
		//c.stroke();
	}
	
	
	/*
	world_bases = bases.length;
	for (i = 0; i < world_bases; i++){
		base_lookup[bases[i].id].charge()
		base_lookup[bases[i].id].draw();
	}
	*/
	
	
	//objects energize
	try {
		drawgqueue(game_blocks[active_block].graphics);
	} catch (e) {
		//console.log(e);
	}

	try {
		let event = new CustomEvent('yare-post-render', {detail: {ctx: c}});
		document.dispatchEvent(event);
	} catch (e) {

	}
	
	
	
	//console.log(spirit_lookup);
	setTimeout(() => {
	    requestAnimationFrame(render_state);
	}); //game_tick?
}



// Start only when 2 blocks processed and ready?
//render_state();



(function(){

// perlin noise resources:
// https://codepen.io/OliverBalfour/post/procedural-generation-part-1-1d-perlin-noise
// https://www.michaelbromley.co.uk/blog/simple-1d-noise-in-javascript/




// hook into render function
if (!window._move)
	window._move = Spirit.prototype.move;


function lerp(a, b, t) {
	return a * (1 - t) + b * t;
};


Spirit.prototype.move = function() {
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

for (const spirit of Object.values(spirit_lookup))
	spirit.move = Spirit.prototype.move;

})();



