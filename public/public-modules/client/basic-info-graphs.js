try {
	
	function map_values(the_number, in_min, in_max, out_min, out_max) {
	  return Math.round((the_number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
	}
	
	function update_gph_data(){
		//if websocket data out of sync with setInterval
		let tick_websocket = 0;
		if (incoming != undefined) tick_websocket = incoming.t
		
		if (current_tick == tick_websocket || tick_websocket < 0) return;
		current_tick = incoming.t;
		
		let gph_energy_p1 = 0;
		let gph_energy_p2 = 0;
		let gph_size_p1 = 0;
		let gph_size_p2 = 0;
		let energy_diff = 0;
		let size_diff = 0;
		let svg_elem = document.getElementById('gph_svg');
		
		if (current_tick > 400){
			if (graph_ui.scrollLeft < scroll_helper){
				if (scroll_stop == 0){
					scroll_stop = 1;
					scroll_helper = 0;
					setTimeout(function(){
						scroll_stop = 0;
						graph_ui.scrollLeft = current_tick - 400;
						scroll_helper = current_tick - 400;
					}, 6000);
				}
			} else if (scroll_stop == 0){
				graph_ui.scrollLeft = current_tick - 400;
				scroll_helper = current_tick - 400;
			}
		}
		
		for (let gg = 0; gg < incoming.p1.length; gg++){
			let unt = incoming.p1[gg];
			if (unt[3] > 0) gph_energy_p1 += unt[3];
			if (unt[4] > 0) gph_size_p1 += unt[2];
		}
		
		for (let gg = 0; gg < incoming.p2.length; gg++){
			let unt = incoming.p2[gg];
			if (unt[3] > 0) gph_energy_p2 += unt[3];
			if (unt[4] > 0) gph_size_p2 += unt[2];
		}
		
		energy_diff = gph_energy_p1 - gph_energy_p2;
		size_diff = (gph_size_p1 - gph_size_p2) * 10;
		if (Math.abs(energy_diff) > global_max || Math.abs(size_diff) > global_max){
			if (Math.abs(energy_diff) > global_max * 5) global_max += 500;
			global_max += 100;
			max_lbl1.textContent = global_max;
			max_lbl2.textContent = global_max;
			max_lbl1_mini.textContent = global_max;
			max_lbl2_mini.textContent = global_max;
			redraw_gph();
		}
		
		gph_points[current_tick] = [energy_diff, size_diff];
		
		//TODO: clean up!
		let energy_diff_mapped = map_values(gph_points[current_tick][0], -global_max, global_max, 24, -24);
		let size_diff_mapped = map_values(gph_points[current_tick][1], -global_max, global_max, 24, -24);
		
		let new_point = svg_elem.createSVGPoint();
		new_point.x = current_tick;
		new_point.y = energy_diff_mapped;
		
		if (energy_diff > 0){
			mini_current_val.style.bottom = 'auto';
			mini_current_val.style.top = energy_diff_mapped + 24 + 'px';
			mini_current_val.style.backgroundColor = "hsl(" + color1_hsl[0] + ", " + color1_hsl[1] + "%, " + (96 + energy_diff_mapped) + "%)";
			lbl_hover_current.style.color = "hsl(" + color1_hsl[0] + ", " + color1_hsl[1] + "%, " + (color1_hsl[2] + 10) + "%)";
		} else if (energy_diff < 0){
			mini_current_val.style.bottom = -energy_diff_mapped + 24 + 'px';
			mini_current_val.style.top = 'auto';
			mini_current_val.style.backgroundColor = "hsl(" + color2_hsl[0] + ", " + color2_hsl[1] + "%, " + (96 - energy_diff_mapped) + "%)";
			lbl_hover_current.style.color = "hsl(" + color2_hsl[0] + ", " + color2_hsl[1] + "%, " + (color2_hsl[2] + 10) + "%)";
		}
		
		if (size_diff > 0){
			let new_rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
			new_rect.setAttribute('x', current_tick);
			new_rect.setAttribute('y', size_diff_mapped );
			new_rect.setAttribute('width', '1');
			new_rect.setAttribute('height', -size_diff_mapped);
			new_rect.style.fill = 'url(#gph_size_gradient1)';
			svg_size_graph.appendChild(new_rect);
			
			//minified
			mini_size_val.style.bottom = '50%';
			mini_size_val.style.top = 'auto';
			mini_size_val.style.height = -size_diff_mapped + 'px';
			mini_size_val.style.backgroundColor = "hsl(" + color1_hsl[0] + ", " + (color1_hsl[1] - (size_diff_mapped/4)) + "%, " + (color1_hsl[2] + 6 + (size_diff_mapped/2)) + "%)";
			lbl_hover_total.style.color = "hsl(" + color1_hsl[0] + ", " + color1_hsl[1] + "%, " + (color1_hsl[2] + 10) + "%)";
			
		} else if (size_diff < 0){
			let new_rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
			new_rect.setAttribute('x', current_tick);
			new_rect.setAttribute('y', 0);
			new_rect.setAttribute('width', '1');
			new_rect.setAttribute('height', size_diff_mapped);
			new_rect.style.fill = 'url(#gph_size_gradient2)';
			svg_size_graph.appendChild(new_rect);
			
			//minified
			mini_size_val.style.top = '50%';
			mini_size_val.style.bottom = 'auto';
			mini_size_val.style.height = size_diff_mapped + 'px';
			mini_size_val.style.backgroundColor = "hsl(" + color2_hsl[0] + ", " + (color2_hsl[1] + (size_diff_mapped/4)) + "%, " + (color2_hsl[2] + 6 - (size_diff_mapped/2)) + "%)";
			lbl_hover_total.style.color = "hsl(" + color2_hsl[0] + ", " + color2_hsl[1] + "%, " + (color2_hsl[2] + 10) + "%)";
		} else {
			mini_size_val.style.height = '1px';
		}
		
		lbl_hover_current.textContent = '+' + Math.abs(energy_diff);
		lbl_hover_total.textContent = '+' + Math.abs(size_diff);
		
		//console.log(document.getElementById('gph_polyline').points);
		
		//document.getElementById('gph_polyline').setAttribute("points", "0, 0 " + current_tick + ", " + map_values(gph_points[current_tick][0], -global_max, global_max, 24, -24));
		
		document.getElementById('gph_polyline').points.appendItem(new_point);
		
	}
	
	function redraw_gph(){
		gph_size_graph.innerHTML = '';
		let all_points = '-1, 24 -1, -24 -1, 0';
		for (let ti in gph_points) {
			let new_point = ti + ', ' + map_values(gph_points[ti][0], -global_max, global_max, 24, -24);
			all_points += " " + new_point;
			
			//draw rect (size diff)
			let size_diff_mapped = map_values(gph_points[ti][1], -global_max, global_max, 24, -24);
			if (gph_points[ti][1] > 0){
				let new_rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
				new_rect.setAttribute('x', ti);
				new_rect.setAttribute('y', size_diff_mapped );
				new_rect.setAttribute('width', '1');
				new_rect.setAttribute('height', -size_diff_mapped);
				new_rect.style.fill = 'url(#gph_size_gradient1)';
				svg_size_graph.appendChild(new_rect);
			} else if (gph_points[ti][1] < 0){
				let new_rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
				new_rect.setAttribute('x', ti);
				new_rect.setAttribute('y', 0);
				new_rect.setAttribute('width', '1');
				new_rect.setAttribute('height', size_diff_mapped);
				new_rect.style.fill = 'url(#gph_size_gradient2)';
				svg_size_graph.appendChild(new_rect);
			}
		}
		
		for (let [t_key, t_value] of Object.entries(gph_points)) {
		    let new_point = t_key + ', ' + map_values(t_value[0], -global_max, global_max, 24, -24);
		}
		//console.log(all_points);
		document.getElementById('gph_polyline').setAttribute('points', all_points);
	}
	
	function show_info(gph_cx){
		
	}
	
	function gph_view_toggle(act){
		if (act == 'minimize'){
			anime({
				targets: '#graph_wrap',
				opacity: 0,
				width: 200,
				easing: 'easeOutQuad',
				duration: 300
			});
			anime({
				targets: '#gph_mini_legend_wrap',
				opacity: 1,
				marginRight: 6,
				easing: 'easeOutQuad',
				duration: 300
			});
			anime({
				targets: '.gph_mini_bar',
				opacity: 1,
				right: 0,
				easing: 'easeOutQuad',
				duration: 300
			});
			document.getElementById('gph_minimized').style.pointerEvents = 'auto';
			document.getElementById('gph_mini_current_bar').style.pointerEvents = 'auto';
			document.getElementById('gph_mini_total_bar').style.pointerEvents = 'auto';
		} else if (act =='maximize'){
			anime({
				targets: '#graph_wrap',
				opacity: 1,
				width: 600,
				easing: 'easeOutQuad',
				duration: 300
			});
			anime({
				targets: '#gph_mini_legend_wrap',
				opacity: 0,
				marginRight: 46,
				easing: 'easeOutQuad',
				duration: 300
			});
			anime({
				targets: '.gph_mini_bar',
				opacity: 0,
				right: 40,
				easing: 'easeOutQuad',
				duration: 300
			});
			document.getElementById('gph_minimized').style.pointerEvents = 'none';
			document.getElementById('gph_mini_current_bar').style.pointerEvents = 'none';
			document.getElementById('gph_mini_total_bar').style.pointerEvents = 'none';
		}
	}
	
	
	
	
	//updateables
	let global_max = 200;
	let gph_points = {};
	let current_tick = 0;
	let scroll_helper = 0;
	let scroll_stop = 0;
	
	//color constants
	const color_parts1 = colors['color1'].match(/[.?\d]+/g);
	const color_parts2 = colors['color2'].match(/[.?\d]+/g);
	const color1_hsl = rgb_to_hsl(color_parts1[0], color_parts1[1], color_parts1[2]);
	const color2_hsl = rgb_to_hsl(color_parts2[0], color_parts2[1], color_parts2[2]);
	
	//UI build (HTML and CSS insertion)
	
	let gph_css = "#graph_base { position: fixed; bottom: -20px; right: 24px; width: 600px; height: 100px; pointer-events: none; overflow-x: scroll; white-space: nowrap; } #graph_wrap { position: fixed; bottom: -20px; right: 24px; width: 600px; height: 100px; overflow-x: scroll; white-space: nowrap; pointer-events: auto;} .gph_section { width: 100%; height: 11px; } .gph_line { width: 3000px; height: 1px; margin-top: 4px; background-color: rgba(242, 246, 250, 0.1); float: left; } .gph_line_highlight { background-color: rgba(242, 246, 250, 0.2); } .gph_lbl_v { font-size: 8px; font-weight: 500; display: block; width: 20px; line-height: 10px; float: left; text-align: right; padding-right: 6px; margin-left: -26px; position: fixed; color: rgba(242, 246, 250, 0.69); } #gph_empty { width: 100%; height: 20px; clear: both; } #gph_ticks_legend { position: absolute; top: 44px; left: -6px; clear: both; } .gph_tick_lbl { display: inline-block; width: 100px; font-size: 8px; font-weight: 500; white-space: nowrap; color: rgba(242, 246, 250, 0.39); margin-left: -5px; } .gph_tick_lbl:first-child { margin-left: 6px; } .gph_lbl_highlight { color: rgba(242, 246, 250, 0.69); } #graph_content_wrap { position: absolute; top: 0; left: 0; /*width: 600px;*/ height: 80px; } #gph_svg { width: 1000px; } #gph_minimized { position: fixed; bottom: 30px; right: 30px; z-index: 9; pointer-events: none; } #gph_mini_legend_wrap { position: relative; float: left; width: 20px; height: 48px; margin-right: 6px; opacity: 0; } .gph_mini_legend { color: rgba(242, 246, 250, 0.69); font-size: 8px; font-weight: 500; display: block; width: 20px; text-align: right; position: absolute; pointer-events: none; } #gph_mini_legend_lbl1 { top: 0; } #gph_mini_legend_lbl2 { top: 50%; transform: translateY(-50%); color: rgba(242, 246, 250, 0.4); } #gph_mini_legend_lbl3 { bottom: 0; } .gph_mini_bar { width: 8px; height: 48px; background-color: rgba(242, 246, 250, 0.2); float: left; border-radius: 2px; position: relative; pointer-events: none; opacity: 0; } #gph_mini_current_bar { margin-right: 4px; } #gph_mini_total_bar{ margin-right: 12px; } #gph_mini_current_val { position: absolute; top: 10px; width: 100%; height: 1px; background-color: #92949a; border-radius: 1px; transition: 0.1s ease-out; } #gph_mini_total_val { position: absolute; bottom: 50%; width: 100%; height: 1px; background-color: #92949a; border-radius: 1px; } #gph_mini_players { height: 48px; float: right; font-size: 10px; font-weight: 500; } #mini_player1, #mini_player2 { height: 50%; } #mini_player1_name, #mini_player2_name { position: relative; padding-left: 14px; top: 50%; transform: translateY(-50%); } #mini_player1_shape, #mini_player2_shape { position: absolute; top: 2px; left: 0; width: 8px; height: 8px; margin-top: 0; margin-right: 0; } #gph_bars_wrap { position: relative; } .gph_info_hover { position: absolute; left: -20px; bottom: 48px; font-size: 10px; font-weight: 500; width: 120px; height: 50px; text-shadow: 0px 0px 4px #000; pointer-events: none; opacity: 0; } .gph_info_current { width: 52px; margin-right: 8px; height: 50px; text-align: right; float: left; } .gph_info_total { width: 52px; height: 50px; text-align: left; float: left; } .bar_legend { display: inline-block; margin-bottom: 4px; color: rgba(242, 246, 250, 0.96); } #gph_minimized:hover .gph_info_hover { opacity: 1; } #graph_base:hover .gph_info_hover { opacity: 1; }";
	document.head.insertAdjacentHTML("beforeend", "<style>" + gph_css + "</style>")
	
	let graph_base = document.createElement('div');
	graph_base.setAttribute('id', 'graph_base');
	graph_base.innerHTML = "<div id='graph_wrap' onClick=gph_view_toggle('minimize')> <div id='gph_sec1' class='gph_section'> <span id='gph_lbl1' class='gph_lbl_v'>200</span> <div id='gph_line1' class='gph_line gph_line_highlight'></div> </div> <div id='gph_sec2' class='gph_section'> <span id='gph_lbl2' class='gph_lbl_v'>&nbsp;</span> <div id='gph_line2' class='gph_line'></div> </div> <div id='gph_sec3' class='gph_section'> <span id='gph_lbl3' class='gph_lbl_v'>0</span> <div id='gph_line3' class='gph_line gph_line_highlight'></div> </div> <div id='gph_sec4' class='gph_section'> <span id='gph_lbl4' class='gph_lbl_v'>&nbsp;</span> <div id='gph_line4' class='gph_line'></div> </div> <div id='gph_sec5' class='gph_section'> <span id='gph_lbl5' class='gph_lbl_v'>200</span> <div id='gph_line5' class='gph_line gph_line_highlight'></div> </div> <div id='gph_empty'></div> <div id='gph_ticks_legend'> <span class='gph_tick_lbl gph_lbl_highlight'>0</span> <span class='gph_tick_lbl'>100</span> <span class='gph_tick_lbl'>200</span> <span class='gph_tick_lbl'>300</span> <span class='gph_tick_lbl gph_lbl_highlight'>400</span> <span class='gph_tick_lbl'>500</span> <span class='gph_tick_lbl'>600</span> <span class='gph_tick_lbl'>700</span> <span class='gph_tick_lbl gph_lbl_highlight'>800</span><span class='gph_tick_lbl'>900</span> <span class='gph_tick_lbl'>1000</span> <span class='gph_tick_lbl'>1100</span> <span class='gph_tick_lbl gph_lbl_highlight'>1200</span><span class='gph_tick_lbl'>1300</span> <span class='gph_tick_lbl'>1400</span> <span class='gph_tick_lbl'>1500</span> <span class='gph_tick_lbl gph_lbl_highlight'>1600</span><span class='gph_tick_lbl'>1700</span> <span class='gph_tick_lbl'>1800</span> <span class='gph_tick_lbl'>1900</span> <span class='gph_tick_lbl gph_lbl_highlight'>2000</span> </div> <div id='graph_content_wrap'> <svg id='gph_svg' style='width: 100%; height: 60px;' overflow='visible' viewBox='0 -25 600 60'> <defs> <linearGradient id='gph_gradient' x1='0%' y1='0%' x2='0%' y2='100%'> <stop offset='0%' style='stop-color: hsl(" + color1_hsl[0] + ", " + color1_hsl[1] + "%, " + (color1_hsl[2] + 2) + "%);' /> <stop offset='40%' style='stop-color: hsl(" + color1_hsl[0] + ", " + 30 + "%, " + (color1_hsl[2]) + "%);' /> <stop offset='50%' style='stop-color:#f4f2fa; stop-opacity: 0.5' /> <stop offset='60%' style='stop-color: hsl(" + color2_hsl[0] + ", " + 30 + "%, " + (color2_hsl[2]) + "%);' /> <stop offset='100%' style='stop-color: hsl(" + color2_hsl[0] + ", " + color2_hsl[1] + "%, " + (color2_hsl[2] + 2) + "%);' /> </linearGradient> </defs><defs> <linearGradient id='gph_size_gradient1' x1='0%' y1='0%' x2='0%' y2='100%'> <stop offset='0%' style='stop-color: hsl(" + color1_hsl[0] + ", " + color1_hsl[1] + "%, " + (color1_hsl[2]) + "%); stop-opacity: 0.6' /> <stop offset='100%' style='stop-color: hsl(" + color1_hsl[0] + ", " + color1_hsl[1] + "%, " + (color1_hsl[2]) + "%); stop-opacity: 0.2' /> </linearGradient> </defs><defs> <linearGradient id='gph_size_gradient2' x1='0%' y1='0%' x2='0%' y2='100%'> <stop offset='0%' style='stop-color: hsl(" + color2_hsl[0] + ", " + color2_hsl[1] + "%, " + (color2_hsl[2]) + "%); stop-opacity: 0.16' /> <stop offset='100%' style='stop-color: hsl(" + color2_hsl[0] + ", " + color2_hsl[1] + "%, " + (color2_hsl[2]) + "%); stop-opacity: 0.69' /> </linearGradient> </defs><g id='gph_size_graph'></g> <polyline id='gph_polyline' points='-1, 24 -1, -24 -1, 0' style='fill:none; stroke: url(#gph_gradient); stroke-width: 1'> <!-- 100, 24 200, -24 250, 10 300, -10 350, -15 400, 20 500, -20 600, 12 700, 5 --> </svg> </div> </div>";
	document.getElementById("modules_plate").appendChild(graph_base);
	
	let minimized_html = "<div id='gph_minimized' onClick=gph_view_toggle('maximize')> <div id='gph_mini_legend_wrap'> <span id='gph_mini_legend_lbl1' class='gph_mini_legend'>200</span> <span id='gph_mini_legend_lbl2' class='gph_mini_legend'>0</span> <span id='gph_mini_legend_lbl3' class='gph_mini_legend'>200</span> </div> <div id='gph_mini_current_bar' class='gph_mini_bar'> <div id='gph_mini_current_val'></div> </div> <div id='gph_mini_total_bar' class='gph_mini_bar'> <div id='gph_mini_total_val'></div> </div> <div id='gph_mini_players'> <div id='mini_player1'> <p id='mini_player1_name'><span id='mini_player1_shape' class='ico_circle'></span>levmi</p> </div> <div id='mini_player2'> <p id='mini_player2_name'><span id='mini_player2_shape' class='ico_square'></span>k</p> </div> </div> <div class='gph_info_hover'> <div class='gph_info_current'> <span class='bar_legend'>Current energy</span> <span id='legend_value_current'>+180</span> </div> <div class='gph_info_total'> <span class='bar_legend'>Energy capacity</span> <span id='legend_value_total'>+124</span> </div> </div> </div>";
	document.getElementById("modules_plate").insertAdjacentHTML('beforeend', minimized_html);
	
	
	//element references
	let graph_ui = document.getElementById('graph_wrap');
	let svg_size_graph = document.getElementById('gph_size_graph');
	let max_lbl1 = document.getElementById('gph_lbl1');
	let max_lbl2 = document.getElementById('gph_lbl5');
	let max_lbl1_mini = document.getElementById('gph_mini_legend_lbl1');
	let max_lbl2_mini = document.getElementById('gph_mini_legend_lbl3');
	let mini_current_val = document.getElementById('gph_mini_current_val');
	let mini_size_val = document.getElementById('gph_mini_total_val');
	let lbl_hover_current = document.getElementById('legend_value_current');
	let lbl_hover_total = document.getElementById('legend_value_total');
	
	
	//player info
	document.getElementById('mini_player1').innerHTML = "<p id='mini_player1_name'><span id='mini_player1_shape' class='ico_" + shapes['shape1'] + "' style='background-color: " + colors['color1'] + "'></span>" + players['player1'] + "</p>";
	document.getElementById('mini_player2').innerHTML = "<p id='mini_player2_name'><span id='mini_player2_shape' class='ico_" + shapes['shape2'] + "' style='background-color: " + colors['color2'] + "'></span>" + players['player2'] + "</p>";
	
	document.getElementById('game_info_panel').style.display = 'none';
	
	console.log('test');


	setInterval(update_gph_data, 500);




//html insertion
//
//	<div id='graph_base'>
//		<div id='gph_sec1' class='gph_section'>
//			<span id='gph_lbl1' class='gph_lbl_v'>200</span>
//			<div id='gph_line1' class='gph_line gph_line_highlight'></div>
//		</div>
//		<div id='gph_sec2' class='gph_section'>
//			<span id='gph_lbl2' class='gph_lbl_v'>&nbsp;</span>
//			<div id='gph_line2' class='gph_line'></div>
//		</div>
//		<div id='gph_sec3' class='gph_section'>
//			<span id='gph_lbl3' class='gph_lbl_v'>0</span>
//			<div id='gph_line3' class='gph_line gph_line_highlight'></div>
//		</div>
//		<div id='gph_sec4' class='gph_section'>
//			<span id='gph_lbl4' class='gph_lbl_v'>&nbsp;</span>
//			<div id='gph_line4' class='gph_line'></div>
//		</div>
//		<div id='gph_sec5' class='gph_section'>
//			<span id='gph_lbl5' class='gph_lbl_v'>200</span>
//			<div id='gph_line5' class='gph_line gph_line_highlight'></div>
//		</div>
//		
//		<div id='gph_empty'></div>
//		
//		<div id='gph_ticks_legend'>
//			<span class='gph_tick_lbl gph_lbl_highlight'>0</span>
//			<span class='gph_tick_lbl'>100</span>
//			<span class='gph_tick_lbl gph_lbl_highlight'>200</span>
//			<span class='gph_tick_lbl'>300</span>
//			<span class='gph_tick_lbl gph_lbl_highlight'>400</span>
//			<span class='gph_tick_lbl'>500</span>
//			<span class='gph_tick_lbl gph_lbl_highlight'>600</span>
//			<span class='gph_tick_lbl'>700</span>
//			<span class='gph_tick_lbl gph_lbl_highlight'>800</span>
//		</div>
//		
//		<div id='graph_content_wrap'>
//			<svg id='gph_svg' style='width: 100%; height: 60px;' overflow='visible' viewBox='0 -25 600 60'>
//				<defs>
//				    <linearGradient id='gph_gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
//					  <stop offset='0%' style='stop-color: hsl(" + color1_hsl[0] + ", " + color1_hsl[1] + "%, " + (color1_hsl[2] + 2) + "%);' />
//					  <stop offset='40%' style='stop-color: hsl(" + color1_hsl[0] + ", " + 10 + "%, " + (color1_hsl[2] - 4) + "%);' />
//					  <stop offset='50%' style='stop-color:#f4f2fa; stop-opacity: 0.5' />
//					  <stop offset='60%' style='stop-color: hsl(" + color2_hsl[0] + ", " + 10 + "%, " + (color2_hsl[2] - 4) + "%);' />
//					  <stop offset='100%' style='stop-color: hsl(" + color2_hsl[0] + ", " + color2_hsl[1] + "%, " + (color2_hsl[2] + 2) + "%);' />
//				    </linearGradient>
//				</defs>
//			    <defs>
//					 <linearGradient id='gph_size_gradient1' x1='0%' y1='0%' x2='0%' y2='100%'>
//						<stop offset='0%' style='stop-color: hsl(" + color1_hsl[0] + ", " + color1_hsl[1] + "%, " + (color1_hsl[2]) + "%); stop-opacity: 0.9' />
//						<stop offset='100%' style='stop-color: hsl(" + color1_hsl[0] + ", " + color1_hsl[1] + "%, " + (color1_hsl[2]) + "%); stop-opacity: 0.2' />
//					 </linearGradient>
//				</defs>
//			    <defs>
//					 <linearGradient id='gph_size_gradient2' x1='0%' y1='0%' x2='0%' y2='100%'>
//						<stop offset='0%' style='stop-color: hsl(" + color2_hsl[0] + ", " + color2_hsl[1] + "%, " + (color2_hsl[2]) + "%); stop-opacity: 0.2' />
//						<stop offset='100%' style='stop-color: hsl(" + color2_hsl[0] + ", " + color2_hsl[1] + "%, " + (color2_hsl[2]) + "%); stop-opacity: 0.9' />	
//					 </linearGradient>
//				</defs>
//				<polyline id='gph_polyline' points='-1, 24 -1, -24 -1, 0' style='fill:none; stroke: url(#gph_gradient); stroke-width: 1'>
//				<!-- 100, 24 200, -24 250, 10 300, -10 350, -15 400, 20 500, -20 600, 12 700, 5 -->
//			</svg>
//		</div>
//		
//	</div>
	
//	<div id='gph_minimized' onClick=gph_view_toggle('maximize')>
//	
//		<div id='gph_mini_legend_wrap'>
//			<span id='gph_mini_legend_lbl1' class='gph_mini_legend'>200</span>
//			<span id='gph_mini_legend_lbl2' class='gph_mini_legend'>0</span>
//			<span id='gph_mini_legend_lbl3' class='gph_mini_legend'>200</span>
//		</div>
//
//		<div id='gph_mini_current_bar' class='gph_mini_bar'>
//			<div id='gph_mini_current_val'></div>
//		</div>
//
//		<div id='gph_mini_total_bar' class='gph_mini_bar'>
//			<div id='gph_mini_total_val'></div>
//		</div>
//		
//		<div id='gph_mini_players'>
//			<div id='mini_player1'>
//	  	    	<p id='mini_player1_name'><span id='mini_player1_shape' class='ico_circle'></span>levmiseri</p>
//			</div>
//			<div id='mini_player2'>
//	  	    	<p id='mini_player2_name'><span id='mini_player2_shape' class='ico_square'></span>koala</p>
//			</div>
//		</div>
//		
//		<div class='gph_info_hover'>
//			<div class='gph_info_current'>
//				<span class='bar_legend'>Current energy</span>
//				<span id='legend_value_current'>+180</span>
//			</div>
//			<div class='gph_info_total'>
//				<span class='bar_legend'>Energy capacity</span>
//				<span id='legend_value_total'>+124</span>
//			</div>
//		</div>
//
//	</div>
//


// CSS insertion
/*	
	#graph_base {
		position: fixed;
		bottom: -20px;
		right: 24px;
		width: 600px;
		height: 100px;
		overflow-x: scroll;
		white-space: nowrap;
	}

	#graph_wrap {
		position: fixed;
		bottom: -20px;
		right: 24px;
		width: 600px;
		height: 100px;
		overflow-x: scroll;
		white-space: nowrap;
	}

	.gph_section {
		width: 100%;
		height: 11px;
	}

	.gph_line {
		width: 3000px;
		height: 1px;
		margin-top: 4px;
		background-color: rgba(242, 246, 250, 0.1);
		float: left;
	}

	.gph_line_highlight {
		background-color: rgba(242, 246, 250, 0.2);
	}

	.gph_lbl_v {
		font-size: 8px;
		font-weight: 500;
		display: block;
		width: 20px;
		line-height: 10px;
		float: left;
		text-align: right;
		padding-right: 6px;
		margin-left: -26px;
		position: fixed;
		color: rgba(242, 246, 250, 0.69);
	}

	#gph_empty {
		width: 100%;
		height: 20px;
		clear: both;
	}

	#gph_ticks_legend {
		position: absolute;
		top: 44px;
		left: -6px;
		clear: both;
	}

	.gph_tick_lbl {
		display: inline-block;
		width: 100px;
		font-size: 8px;
		font-weight: 500;
		white-space: nowrap;
		color: rgba(242, 246, 250, 0.39);
		margin-left: -5px;
	}

	.gph_tick_lbl:first-child {
		margin-left: 6px;
	}

	.gph_lbl_highlight {
		color: rgba(242, 246, 250, 0.69);
	}


	#graph_content_wrap {
		position: absolute;
		top: 0;
		left: 0;
		height: 80px;
	}

	#gph_svg {
		width: 1000px;
	}


	#gph_minimized {
		position: fixed;
		bottom: 30px;
		right: 30px;
		z-index: 9;
		pointer-events: none;
	}

	#gph_mini_legend_wrap {
		position: relative;
		float: left;
		width: 20px;
		height: 48px;
		margin-right: 6px;
		opacity: 0;
	}

	.gph_mini_legend {
		color: rgba(242, 246, 250, 0.69);
		font-size: 8px;
		font-weight: 500;
		display: block;
		width: 20px;
		text-align: right;
		position: absolute;
		pointer-events: none;
	}

	#gph_mini_legend_lbl1 {
		top: 0;
	}

	#gph_mini_legend_lbl2 {
	    top: 50%;
	    transform: translateY(-50%);
		color: rgba(242, 246, 250, 0.4);
	}

	#gph_mini_legend_lbl3 {
		bottom: 0;
	}

	.gph_mini_bar {
		width: 8px;
		height: 48px;
		background-color: rgba(242, 246, 250, 0.2);
		float: left;
		border-radius: 2px;
		position: relative;
		pointer-events: none;
		opacity: 0;
	}

	#gph_mini_current_bar {
		margin-right: 4px;
	}

	#gph_mini_total_bar{
		margin-right: 12px;
	}

	#gph_mini_current_val {
		position: absolute;
		top: 10px;
		width: 100%;
		height: 1px;
		background-color: #92949a;
		border-radius: 1px;
		transition: 0.1s ease-out;
	}

	#gph_mini_total_val {
		position: absolute;
		bottom: 50%;
		width: 100%;
		height: 1px;
		background-color: #92949a;
		border-radius: 1px;
	}


	#gph_mini_players {
		height: 48px;
		float: right;
		font-size: 10px;
		font-weight: 500;
	}

	#mini_player1, #mini_player2 {
		height: 50%;
	}



	#mini_player1_name, #mini_player2_name {
		position: relative;
		padding-left: 14px;
		top: 50%;
		transform: translateY(-50%);
	}

	#mini_player1_shape, #mini_player2_shape {
		position: absolute;
		top: 2px;
		left: 0;
		width: 8px;
		height: 8px;
		margin-top: 0;
		margin-right: 0;
	}

	#gph_bars_wrap {
		position: relative;
	}

	.gph_info_hover {
		position: absolute;
		left: -20px;
		bottom: 48px;
		font-size: 10px;
		font-weight: 500;
		width: 120px;
		height: 50px;
		text-shadow: 0px 0px 4px #000;
		pointer-events: none;
		opacity: 0;
	}

	.gph_info_current {
		width: 52px;
		margin-right: 8px;
		height: 50px;
		text-align: right;
		float: left;
	}

	.gph_info_total {
		width: 52px;
		height: 50px;
		text-align: left;
		float: left;
	}

	.bar_legend {
		display: inline-block;
		margin-bottom: 4px;
		color: rgba(242, 246, 250, 0.96);
	}

	#gph_minimized:hover .gph_info_hover {
		opacity: 1;
	}

	#graph_base:hover .gph_info_hover {
		opacity: 1;
	}
	
*/

} catch (e) {
	console.log(e);
}