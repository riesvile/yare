function run_code(){
	//user_code in game.js
	try {
		Function(player_codes['pl1_code'])();
	} catch (e){
		console.log(e);
	}
	
	//try {
	//	Function(player_codes['pl2_code'])();
	//} catch (e){
	//	console.log(e);
	//}
	
}

function update_state(){
	console.log('update_state called');
	run_code();
}

async function main_loop() {
	const t1 = (+new Date());
	console.log("tick ");
	await update_state();
	setTimeout(main_loop, Math.max(0, game_tick - (+new Date()) + t1));
}

function prefill_code(pl){
	if (boxsanded_copy[pl] == 'upload-bot'){
		player_codes[pl + '_code'] = boxsanded_copy[pl + '_uploaded_code'];
	} else if (boxsanded_copy[pl] == 'live-input'){
		live_input = pl;
	} else {
		get_bot_code(boxsanded_copy[pl], 'local', pl);
	}
}

function start_engine(){
	console.log('starting');
	
	console.log('played_codes');
	console.log(player_codes);
	
	main_loop();
}

function get_bot_code(botname, sour = 'local', pl = 'pl1'){
	if (sour == 'local'){
		try {
			fetch("./bots/" + botname + ".js")
				.then(function(response) {
					if (!response.ok){
						console.log('failed to load bot code');
						return;
					}
	    			return response.text().then(function(text) {
						let b_code = text;
						console.log(b_code);
						//populate the object right away
						player_codes[pl + '_code'] = b_code;
						
	   				});
	  		    });
		} catch (e){
			console.log(e);
		}
	}
	
}



function countdown(num){
	//wtf
	num--;
	if (num == -1){
		start_engine();
		return;
	}
    setTimeout(function(){
		let tempnum = num;
		postMessage({
			meta: 'countdown',
			val: num
		});
		countdown(num);
    }, 1000);
}







player_codes = {
	pl1_code: '',
	pl2_code: ''
};


var boxsanded_copy = {};
var game_tick = 0;
var live_input = '';



onmessage = function(message){
	
	let msg = message.data;
	
	if (msg.meta == 'initiate'){
		boxsanded_copy = msg.boxsanded;
		game_tick = msg.tick_rate;
		countdown(msg.meta2);
		prefill_code('pl1');
		prefill_code('pl2');
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	//postMessage({
	//	pl1: 'val1',
	//	pl2: 'val2',
	//	meta: msg.meta
	//});
	
	
	
	
	
	
	
	
	
	
}