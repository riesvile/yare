function module_edit_mode_on(){
	document.getElementById('module_edit_mode').style.top = '0vh';
	document.getElementById('profile_links').style.pointerEvents = 'none';
	document.getElementById('overlay').style.pointerEvents = 'none';
	document.getElementById('hector').style.pointerEvents = 'none';
	anime({
		targets: '#module_edit_mode',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#profile_links',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#hector',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0)',
		backdropFilter: 'blur(0px)',
		"-webkit-backdrop-filter": 'blur(0px)',
		easing: 'easeOutQuad',
		duration: 200
	});
	
}

function module_edit_mode_off(){
	anime({
		targets: '#module_edit_mode',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#hector',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 300
	});
	setTimeout(function(){
  		document.getElementById('module_edit_mode').style.top = '-101vh';
		document.getElementById('hector').style.pointerEvents = 'auto';
	}, 300);
}

function module_pre_delete(mod_id){
	anime({
		targets: '#edit_' + mod_id,
		marginLeft: '20px',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#predel_' + mod_id,
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#toggle_' + mod_id,
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 0
	});
	anime({
		targets: '#toggle_' + mod_id,
		right: 8,
		easing: 'easeOutQuad',
		duration: 0
	});
	anime({
		targets: '#confirm_' + mod_id,
		opacity: 1,
		easing: 'easeOutQuad',
		delay: 200,
		duration: 100
	});
	
	document.getElementById('confirm_' + mod_id).style.pointerEvents = 'auto';
	
}

function module_cancel_delete(mod_id){
	anime({
		targets: '#edit_' + mod_id,
		marginLeft: '0px',
		opacity: 1,
		easing: 'easeOutQuad',
		delay: 100,
		duration: 200
	});
	anime({
		targets: '#predel_' + mod_id,
		opacity: 1,
		easing: 'easeOutQuad',
		delay: 100,
		duration: 200
	});
	anime({
		targets: '#toggle_' + mod_id,
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 0
	});
	anime({
		targets: '#toggle_' + mod_id,
		right: 16,
		easing: 'easeOutQuad',
		duration: 0
	});
	anime({
		targets: '#confirm_' + mod_id,
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 200
	});
	
	document.getElementById('confirm_' + mod_id).style.pointerEvents = 'none';
}

function module_name_highlight(){
	anime({
		targets: '#module_name_input',
		translateY: [10, 0],
		borderColor: ['rgba(255, 83, 83, 1)', 'rgba(175, 196, 226, 0.2)'],
		backgroundColor: ['rgba(250, 50, 50, 1)', 'rgba(175, 196, 226, 0.01)'],
		easing: 'easeOutQuad',
		duration: 2000
	});
}

function dismissals(){
	if (dismiss_intent == 0){
		dismiss_intent = 1;
		return;
	}
	
	if (window.screen.availWidth < 700){
		if (account_creation == 1){
			anime({
				targets: '#new_account_wrap',
				translateY: [20, 0],
				opacity: [1, 0],
				easing: 'easeOutQuad',
				duration: 200
			});
			account_creation = 0;
		} else if (account_login == 1){
			anime({
				targets: '#login_wrap',
				translateY: [20, 0],
				opacity: [1, 0],
				easing: 'easeOutQuad',
				duration: 200
			});
			account_login = 0;
		}
	} else {
		if (account_creation == 1){
			anime({
				targets: '#new_account_wrap',
				translateX: [new_acc_pos.right - 420, new_acc_pos.right - 420],
				translateY: [20, 0],
				opacity: [1, 0],
				easing: 'easeOutQuad',
				duration: 200
			});
			account_creation = 0;
		} else if (account_login == 1){
			anime({
				targets: '#login_wrap',
				translateX: [login_pos.right - 440, login_pos.right - 440],
				translateY: [20, 0],
				opacity: [1, 0],
				easing: 'easeOutQuad',
				duration: 200
			});
			account_login = 0;
		}
	}
	
	
	
	anime({
		targets: '#profile_links',
		//translateY: [10, 0],
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 200
	});
	
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0)',
		backdropFilter: 'blur(0px)',
		"-webkit-backdrop-filter": 'blur(0px)',
		easing: 'easeOutQuad',
		duration: 200
	});
	
	
	document.getElementById('overlay').style.pointerEvents = 'none';
	document.getElementById('new_account_wrap').style.pointerEvents = 'none';
	document.getElementById('login_wrap').style.pointerEvents = 'none';
	document.getElementById('profile_links').style.pointerEvents = 'none';
	
	try {
		if (resign_open == 1){
			dont_resign();
		}
	
		if (bot_sel_open == 1){
			collapse_bot_selection();
		}
	} catch (e){
		console.log('whatever');
	}
	
	module_edit_mode_off();
	
	set_lang();
	
	if (something_changed == 1) {
		something_changed = 0;
		set_active_modules();
	}
	
}

function dismiss_helper(){
	dismiss_intent = 0;
}

function game_over_box(){
	document.getElementById('game_over_block').style.display = 'block';
	
	anime({
		targets: '#game_over_block',
		opacity: [0, 1],
		easing: 'easeOutQuad',
		duration: 900
	});
	
	anime({
		targets: '#game_over_overlay',
		backgroundColor: 'rgba(0, 0, 0, 0.39)',
		backdropFilter: 'blur(12px)',
		"-webkit-backdrop-filter": 'blur(12px)',
		easing: 'easeOutQuad',
		duration: 900
	});
	
	document.getElementById('game_over_block').style.pointerEvents = 'auto';
}

function new_account(){
	account_creation = 1;
	document.getElementById('new_account_wrap').style.display = 'block';
	document.getElementById('new_account_wrap').style.pointerEvents = 'auto';
	
	if (window.screen.availWidth < 700){
		anime({
			targets: '#new_account_wrap',
			translateY: [0, 20],
			opacity: [0, 1],
			easing: 'easeOutQuad',
			duration: 300
		});
	} else {
		anime({
			targets: '#new_account_wrap',
			translateX: [new_acc_pos.right - 420, new_acc_pos.right - 420],
			translateY: [0, 20],
			opacity: [0, 1],
			easing: 'easeOutQuad',
			duration: 300
		});
	}
	
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0.59)',
		backdropFilter: 'blur(12px)',
		"-webkit-backdrop-filter": 'blur(12px)',
		easing: 'easeOutQuad',
		duration: 300
	});
	
	try {
		if (from_nongame) temp_from_nongame = 1;
	} catch (e){
		console.log(e)
	}
	
	
	
	document.getElementById("new_user_name").focus();
	document.getElementById('overlay').style.pointerEvents = 'auto';
}

function login(){
	account_login = 1;
	document.getElementById('login_wrap').style.display = 'block';
	document.getElementById('login_wrap').style.pointerEvents = 'auto';
	
	if (window.screen.availWidth < 700){
		anime({
			targets: '#login_wrap',
			translateY: [0, 20],
			opacity: [0, 1],
			easing: 'easeOutQuad',
			duration: 300
		});
	} else {
		anime({
			targets: '#login_wrap',
			translateX: [login_pos.right - 440, login_pos.right - 440],
			translateY: [0, 20],
			opacity: [0, 1],
			easing: 'easeOutQuad',
			duration: 300
		});
	}
	
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0.59)',
		backdropFilter: 'blur(12px)',
		"-webkit-backdrop-filter": 'blur(12px)',
		easing: 'easeOutQuad',
		duration: 300
	});
	
	try {
		if (from_nongame) temp_from_nongame = 1;
	} catch (e){
		console.log(e)
	}
	
	document.getElementById("user_name").focus();
	document.getElementById('overlay').style.pointerEvents = 'auto';
}

function login_error(err_msg){
	anime({
		targets: '#login_err_message',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 300
	});
	
	anime({
		targets: '#login_submit',
		marginTop: 16,
		easing: 'easeOutQuad',
		duration: 300
	});
	
	document.getElementById('login_err_message').innerHTML = err_msg;
	document.getElementById('user_name').addEventListener("input",  un_error, false);
	document.getElementById('user_password').addEventListener("input",  un_error, false);
}

function username_error(err_msg){
	anime({
		targets: '#user_err_message',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 300
	});
	
	anime({
		targets: '#new_user_name',
		backgroundColor: 'rgba(72, 33, 33, 0.55)',
		easing: 'easeOutQuad',
		duration: 300
	});
	
	anime({
		targets: '#new_user_password',
		marginTop: 50,
		easing: 'easeOutQuad',
		duration: 300
	});
	
	document.getElementById('user_err_message').innerHTML = err_msg;
	document.getElementById('new_user_name').addEventListener("focus", function () {
		this.select();
	});
	document.getElementById('new_user_name').addEventListener("input",  un_error, false);
}

function password_error(err_msg){
	anime({
		targets: '#password_err_message',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 300
	});
	
	anime({
		targets: '#new_user_password',
		backgroundColor: 'rgba(72, 33, 33, 0.55)',
		easing: 'easeOutQuad',
		duration: 300
	});
	
	anime({
		targets: '#email_snippet',
		marginTop: 30,
		easing: 'easeOutQuad',
		duration: 300
	});
	
	document.getElementById('password_err_message').innerHTML = err_msg;
	document.getElementById('new_user_password').addEventListener("input",  un_error, false);
}

function un_error(){
	anime({
		targets: '#user_err_message',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#password_err_message',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#new_user_name',
		backgroundColor: 'rgba(52, 49, 60, 0.55)',
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#new_user_password',
		marginTop: 0,
		backgroundColor: 'rgba(52, 49, 60, 0.55)',
		easing: 'easeOutQuad',
		duration: 300
	});
	anime({
		targets: '#email_snippet',
		marginTop: -8,
		easing: 'easeOutQuad',
		duration: 300
	});
	
	anime({
		targets: '#login_err_message',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
	
	anime({
		targets: '#login_submit',
		marginTop: 0,
		easing: 'easeOutQuad',
		duration: 300
	});
}

function login_success(user_name){
	//console.log('login success');
	
	try {
		document.getElementById('new_account').style.display = 'none';	
		document.getElementById('login').style.display = 'none';
	} catch (error) {
	  //console.error(error);
	}
	
	try {
		document.getElementById('new_g').style.display = 'block';
	} catch (error){
		console.log(error);
	}
	
	document.getElementById('the_name').innerHTML = user_name;
	document.getElementById('signed_in').style.display = 'block';
	//console.log('iodsjfoidsjf');
	
	if (account_creation == 1){
		dismissals();
		anime({
			targets: '#signed_in',
			color: ['rgba(133, 186, 234, 1)', 'rgba(242, 246, 250, 0.69)'],
			easing: 'easeOutQuad',
			duration: 4000
		});
	} else if (account_login == 1){
		dismissals();
		anime({
			targets: '#signed_in',
			color: ['rgba(133, 186, 234, 1)', 'rgba(242, 246, 250, 0.69)'],
			easing: 'easeOutQuad',
			duration: 4000
		});
	}
	
	try {
		//if (temp_from_nongame) window.location = 'https://yare.io/hub';
	} catch (e){
		console.log(e);
	}
	
	
	try {
		if (tutorial_phase == 0){
			 //window.location = './';
		}
	} catch (error) {
	  //console.error(error);
	}
	
	//document.getElementById('input').blur();
	
}

function wait_server(){
	if (account_creation == 1){
		anime({
			targets: '#new_acc_submit',
			opacity: [1, 0],
			easing: 'easeOutQuad',
			duration: 300
		});
		anime({
			targets: '#loader_new_acc',
			opacity: [0, 1],
			easing: 'easeOutQuad',
			duration: 300
		});
	} else if (account_login == 1){
		anime({
			targets: '#login_submit',
			opacity: [1, 0],
			easing: 'easeOutQuad',
			duration: 300
		});
		anime({
			targets: '#loader_login',
			opacity: [0, 1],
			easing: 'easeOutQuad',
			duration: 300
		});
	}
}

function resume_client(){
	if (account_creation == 1){
		anime({
			targets: '#new_acc_submit',
			opacity: [0, 1],
			easing: 'easeOutQuad',
			duration: 300
		});
		anime({
			targets: '#loader_new_acc',
			opacity: [1, 0],
			easing: 'easeOutQuad',
			duration: 300
		});
		
	} else if (account_login == 1){
		anime({
			targets: '#login_submit',
			opacity: [0, 1],
			easing: 'easeOutQuad',
			duration: 300
		});
		anime({
			targets: '#loader_login',
			opacity: [1, 0],
			easing: 'easeOutQuad',
			duration: 300
		});
	}
}

function logout() {
	eraseCookie('user_id');
	eraseCookie('user_session');
	window.location = 'https://yare.io';
}

function user_links(){
	//console.log('userlinko !!!!!');
	anime({
		targets: '#profile_links',
		//translateY: [0, 10],
		opacity: [0, 1],
		easing: 'easeOutQuad',
		duration: 300
	});
	
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0.39)',
		backdropFilter: 'blur(12px)',
		"-webkit-backdrop-filter": 'blur(12px)',
		easing: 'easeOutQuad',
		duration: 300
	});

	document.getElementById('overlay').style.pointerEvents = 'auto';	
	document.getElementById('profile_links').style.pointerEvents = 'auto';
}

function resizing(){
	try {
		new_acc_pos = document.getElementById('new_account').getBoundingClientRect();
	} catch (error) {
	  //console.error(error);
	}
	
}

function wait_start_view(){
	
}

function wait_challenge_view(){
  	anime({
  		targets: '#user_selections',
  		translateY: [0, -10],
  		opacity: [1, 0],
  		easing: 'easeOutQuad',
  		duration: 300
  	});
  	anime({
  		targets: '#pre_game',
  		translateY: [0, -10],
  		opacity: [1, 0],
  		easing: 'easeOutQuad',
  		duration: 300
  	});
	
	setTimeout(function(){
  		document.getElementById('user_selections').style.display = 'none';
		document.getElementById('pre_game').style.display = 'none';
		document.getElementById('waiting_for_opponent').style.display = 'block';
		document.getElementById('waiting_challenge').style.display = 'block';
		
		document.getElementById('waiting_head_text').innerHTML = 'Waiting for a friend...';
		document.getElementById('waiting_secondary_text').style.display = 'none';
	  	anime({
	  		targets: '#waiting_for_opponent',
	  		translateY: [-10, 0],
	  		opacity: [0, 1],
	  		easing: 'easeOutQuad',
	  		duration: 300
	  	});
	  	anime({
	  		targets: '#waiting_challenge',
	  		translateY: [-10, 0],
	  		opacity: [0, 1],
	  		easing: 'easeOutQuad',
	  		duration: 300
	  	});
	}, 300);
  
}

function wait_opponent_view(){
  	anime({
  		targets: '#user_selections',
  		translateY: [0, -10],
  		opacity: [1, 0],
  		easing: 'easeOutQuad',
  		duration: 300
  	});
  	anime({
  		targets: '#pre_game',
  		translateY: [0, -10],
  		opacity: [1, 0],
  		easing: 'easeOutQuad',
  		duration: 300
  	});
	
	setTimeout(function(){
  		document.getElementById('user_selections').style.display = 'none';
		document.getElementById('pre_game').style.display = 'none';
		document.getElementById('waiting_for_opponent').style.display = 'block';
		document.getElementById('waiting_game').style.display = 'block';
	  	anime({
	  		targets: '#waiting_for_opponent',
	  		translateY: [-10, 0],
	  		opacity: [0, 1],
	  		easing: 'easeOutQuad',
	  		duration: 300
	  	});
	  	anime({
	  		targets: '#waiting_game',
	  		translateY: [-10, 0],
	  		opacity: [0, 1],
	  		easing: 'easeOutQuad',
	  		duration: 300
	  	});
	}, 300);
  
}

function pre_resign(){
	resign_open = 1;
	
  	anime({
  		targets: '#resign_game_menu',
		width: 100,
		marginLeft: 96,
  		easing: 'easeOutQuad',
  		duration: 200
  	});
	
	//anime({
	//	targets: '#overlay',
	//	backgroundColor: 'rgba(0, 0, 0, 0.39)',
	//	backdropFilter: 'blur(12px)',
	//	"-webkit-backdrop-filter": 'blur(12px)',
	//	easing: 'easeOutQuad',
	//	duration: 200
	//});
	
	anime({
		targets: '#resign_btn',
		opacity: [0, 1],
		easing: 'easeOutQuad',
		duration: 200
	});
	
	anime({
		targets: '#cancel_resign_btn',
		opacity: [0, 1],
		easing: 'easeOutQuad',
		duration: 200
	});
	
	anime({
		targets: '#pre_resign_btn',
		opacity: [1, 0],
		easing: 'easeOutQuad',
		duration: 200
	});
	
	//anime({
	//	targets: '.you_sure_lbl',
	//	opacity: 1,
	//	easing: 'easeOutQuad',
	//	duration: 200
	//});

	//document.getElementById('overlay').style.pointerEvents = 'auto';
	document.getElementById('pre_resign_btn').style.display = 'none';
	//document.getElementById('resign_btn').style.display = 'inline-block';
	//document.getElementById('cancel_resign_btn').style.display = 'inline-block';
	document.getElementById('resign_btn').style.pointerEvents = 'auto';
	document.getElementById('cancel_resign_btn').style.pointerEvents = 'auto';
}

function dont_resign(){
	resign_open = 0;
	
  	anime({
  		targets: '#resign_game_menu',
		width: 70,
		marginLeft: 36,
  		easing: 'easeOutQuad',
  		duration: 200
  	});
	
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0)',
		backdropFilter: 'blur(0px)',
		"-webkit-backdrop-filter": 'blur(0px)',
		easing: 'easeOutQuad',
		duration: 200
	});
	
	anime({
		targets: '#resign_btn',
		opacity: [1, 0],
		easing: 'easeOutQuad',
		duration: 200
	});
	
	anime({
		targets: '#cancel_resign_btn',
		opacity: [1, 0],
		easing: 'easeOutQuad',
		duration: 200
	});
	
	anime({
		targets: '#pre_resign_btn',
		opacity: [0, 1],
		easing: 'easeOutQuad',
		duration: 200
	});
	
	anime({
		targets: '.you_sure_lbl',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 50
	});

	document.getElementById('overlay').style.pointerEvents = 'none';
	document.getElementById('pre_resign_btn').style.display = 'block';
	document.getElementById('resign_btn').style.pointerEvents = 'none';
	document.getElementById('cancel_resign_btn').style.pointerEvents = 'none';
}


function expand_bot_selection(){
	console.log('connected');
	bot_sel_open = 1;
	
	document.getElementById('bot_selection_wrap').style.display = 'block';
	
	anime({
		targets: '#bot_game_btn',
		height: 422,
		translateY: -146,
		easing: 'easeOutQuad',
		duration: 100
	});
	
	anime({
		targets: '#bot_sel_lbl', 
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 40
	});
	
	anime({
		targets: '#btn_desc_bot',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 40
	});
	
	anime({
		targets: '#bot_selection_wrap',
		opacity: 1,
		easing: 'easeOutQuad',
		delay: 50,
		duration: 100
	});
	
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0.69)',
		easing: 'easeOutQuad',
		duration: 200
	});
	
	document.getElementById('bot_game_btn').style.oveflow = 'hidden';
	document.getElementById('overlay').style.pointerEvents = 'auto';
	
}

function collapse_bot_selection(){
	
	bot_sel_open = 0;
	
	anime({
		targets: '#bot_game_btn',
		height: 64,
		translateY: 0,
		easing: 'easeOutQuad',
		duration: 100
	});
	
	anime({
		targets: '#bot_sel_lbl', 
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 40
	});
	
	anime({
		targets: '#btn_desc_bot',
		opacity: 1,
		easing: 'easeOutQuad',
		duration: 40
	});
	
	anime({
		targets: '#bot_selection_wrap',
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 100
	});
	
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0)',
		easing: 'easeOutQuad',
		duration: 200
	});
	
	document.getElementById('overlay').style.pointerEvents = 'none';
	document.getElementById('bot_selection_wrap').style.display = 'none';
	document.getElementById('bot_game_btn').style.oveflow = 'visible';
	
}


function update_console_height(hght){
	//console.log('was triggered');
	//console.log(hght);
	if (hght == 0){
		hght = 20;
	}
  	anime({
  		targets: '#console',
  		height: 24 + hght,
  		easing: 'easeOutQuad',
  		duration: 100
  	});
}

function error_console(){
  	anime({
  		targets: '#console',
		backgroundColor: ['rgba(54, 32, 35, 1)'],
  		easing: 'easeOutQuad',
  		duration: 200
  	});
	
  	anime({
  		targets: '#console_lbl',
		color: ['rgba(255, 155, 165, 1)'],
  		easing: 'easeOutQuad',
  		duration: 200
  	});
}

function clean_console(){
  	anime({
  		targets: '#console',
		backgroundColor: ['rgba(48, 45, 51, 1)'],
  		easing: 'easeOutQuad',
  		duration: 200
  	});
	
  	anime({
  		targets: '#console_lbl',
		color: ['rgba(242, 246, 250, 0.49)'],
  		easing: 'easeOutQuad',
  		duration: 200
  	});
}

function console_expanding(hght){
	if (has_error == 1){
		error_console();
	}
	if (hght == 0){
		hght = 20;
	}
  	anime({
  		targets: '#console',
  		height: [40, 24 + hght],
		//backgroundColor: ['rgba(48, 45, 51, 1)'],
  		easing: 'easeOutQuad',
  		duration: 200
  	});
	
  	anime({
  		targets: '#console_in',
		opacity: [0, 1],
		translateY: [0, 10],
  		easing: 'easeOutQuad',
		delay: 50,
  		duration: 150
  	});
	
  	anime({
  		targets: '#console_lbl',
		opacity: [1, 0],
		translateY: [0, 10],
  		easing: 'easeOutQuad',
  		duration: 200
  	});
	
  	anime({
  		targets: '#console_drop',
		rotate: '180deg',
  		easing: 'easeOutQuad',
  		duration: 200
  	});
}

function console_collapsing(hght){
	if (has_error == 1){
		error_console();
	}
  	anime({
  		targets: '#console',
  		height: [24 + hght, 40],
		//backgroundColor: ['rgba(48, 45, 51, 1)'],
  		easing: 'easeOutQuad',
  		duration: 200
  	});
	
  	anime({
  		targets: '#console_in',
		opacity: [1, 0],
		translateY: [10, 0],
  		easing: 'easeOutQuad',
  		duration: 200
  	});
	
  	anime({
  		targets: '#console_lbl',
		opacity: [0, 1],
		translateY: [10, 0],
  		easing: 'easeOutQuad',
		delay: 50,
  		duration: 150
  	});
	
  	anime({
  		targets: '#console_drop',
		rotate: '0deg',
  		easing: 'easeOutQuad',
  		duration: 200
  	});
}

function code_copy_success(target){
  	anime({
  		targets: target,
		color: ['rgba(133, 234, 143, 0.89)', 'rgba(118, 127, 136, 0.92)'],
  		backgroundColor: ['rgba(133, 234, 143, 0.2)', 'rgba(118, 127, 136, 0.12)'],
		borderColor: ['rgba(133, 234, 143, 0.55)', 'rgba(118, 127, 136, 0.48)'],
  		easing: 'easeOutQuad',
  		duration: 800
  	});
}

function update_success(){
  	anime({
  		targets: '#update_code',
		color: ['rgba(255, 255, 255, 1)', 'rgba(242, 246, 250, 0.92)'],
  		backgroundColor: ['rgba(142, 196, 148, 1)', 'rgba(42, 46, 78, 1)'],
  		easing: 'easeOutQuad',
  		duration: 800
  	});
}

function highlight_update_btn(){
  	anime({
  		targets: '#update_code',
		color: ['rgba(242, 246, 250, 0.92)', 'rgba(255, 255, 255, 1)'],
  		backgroundColor: ['rgba(42, 46, 78, 1)', 'rgba(248, 71, 71, 1)'],
  		easing: 'easeOutQuad',
  		duration: 10
  	});
}

function nolight_update_btn(){
  	anime({
  		targets: '#update_code',
		color: ['rgba(255, 255, 255, 1)', 'rgba(242, 246, 250, 0.92)'],
  		backgroundColor: ['rgba(248, 71, 71, 1)', 'rgba(42, 46, 78, 1)'],
  		easing: 'easeOutQuad',
  		duration: 10
  	});
}


function tut_start(){
  	anime({
  		targets: '#overlay_start',
  		backgroundColor: 'rgba(0, 0, 0, 0)',
  		easing: 'easeOutQuad',
  		duration: 600
  	});
	
  	anime({
  		targets: '#update_code',
  		//translateX: ['10vw', 0],
		//translateY: ['-20vh', 0],
  		easing: 'easeOutQuad',
  		duration: 600
  	});
	
  	anime({
  		targets: '#editor_container',
  		//translateX: ['10vw', 0],
		//translateY: ['50vh', '0vh'],
		//scale: [1.3, 1],
  		easing: 'easeOutQuad',
  		duration: 600
  	});
	
  	anime({
  		targets: '#tutorial_wrap',
  		//translateX: ['10vw', 0],
		//translateY: ['20vh', 0],
		//scale: [1.3, 1],
  		easing: 'easeOutQuad',
  		duration: 600
  	});
	
	
	
	setTimeout(function(){
		document.getElementById('tutorial_wrap').style.transform = 'inherit';
		document.getElementById('panel').classList.remove('panel_start');
	}, 1000);
}

function load_start(){
	setTimeout(function(){
	  	anime({
	  		targets: '#overlay_pre_start',
	  		backgroundColor: 'rgba(0, 0, 0, 0)',
	  		easing: 'easeInQuad',
	  		duration: 800
	  	});
	}, 1000);
  	
}

function tut_show_box(){
  	anime({
  		targets: '#overlay',
  		backgroundColor: 'rgba(0, 0, 0, 0.24)',
  		easing: 'easeOutQuad',
  		duration: 200
  	});
	anime({
  		targets: '#tutorial_infobox',
  		opacity: 1,
  		easing: 'easeOutQuad',
  		duration: 200
	});
}

function tut_hide_box(){
  	anime({
  		targets: '#overlay',
  		backgroundColor: 'rgba(0, 0, 0, 0)',
  		easing: 'easeOutQuad',
  		duration: 200
  	});
	anime({
  		targets: '#tutorial_infobox',
  		opacity: 0,
  		easing: 'easeOutQuad',
  		duration: 200
	});
}

function tut_phase_success(){
	anime({
  		targets: '.tutorial_text',
  		color: ['rgba(79, 228, 96, 0.92)', 'rgba(242, 246, 250, 0.86)'],
  		easing: 'easeOutQuad',
  		duration: 3000
	});
	document.getElementById('panel').scrollTop = 0;
}

function hide_hover(){
	//document.getElementById('game_hover').style.opacity = 0;
	anime({
  		targets: '#game_hover',
  		opacity: 0,
  		easing: 'easeOutQuad',
  		duration: 20
	});
}

function show_hover(){
	//document.getElementById('game_hover').style.opacity = 1;
	anime({
  		targets: '#game_hover',
  		opacity: 1,
  		easing: 'easeOutQuad',
  		duration: 20
	});
}

function show_info_snippet(elid, leftPos, topPos){
	console.log(elid)
	var info_el = document.getElementById("info_box");
	var info_content = document.getElementById("info_box_content");
	var el_height = 0;
	var el_width = 0;
	switch (elid){
		case "info_spirit_size":
			info_content.innerHTML = "<span class='g_con'><span class='ico_circle'></span> Circles</span><div class='sep_mini'></div><table class='info_table'><tr><td>1</td><td>Default size</td></tr><tr><td>100</td><td>Max size (100 spirits merged together)</td></tr></table><div class='sep_mini'></div><div class='sep_small'></div>";
			break;
		case "info_spirit_energy_capacity":
			info_content.innerHTML = "<p class='p_normal'>energy_capacity = 10 × size</p><div class='sep_mini'></div>";
			break;
		case "info_spirit_sight":
			info_content.innerHTML = "<pre class='code_sample'>my_spirits[1].sight = &#10;{&#10;  <span class='lowlight'>friends:</span> [‘jane2’, ‘jane3’, ‘jane4’],&#10;  <span class='lowlight'>enemies:</span> [‘karl4’],&#10;  <span class='lowlight'>structures:</span> [‘star_zxq’]&#10;}</pre>			<div class='sep_small'></div>			<p class='p_normal' style='width: 400px; line-height: 26px'>there are 3 friendly and 1 enemy spirit and a star within 400 radius around the spirit</p>			<pre class='code_sample'>my_spirits[1].sight.enemies[0];</pre>			<pre class='code_sample'><span class='lowlight'>output:</span> 'karl4'</pre>			<div class='sep_medium'></div>";
			break;
		case "info_base_sight":
			info_content.innerHTML = "<pre class='code_sample'>base.sight = &#10;{&#10;  <span class='lowlight'>friends:</span> [‘jane2’, ‘jane3’, ‘jane4’],&#10;  <span class='lowlight'>enemies:</span> [‘karl4’],&#10;  <span class='lowlight'>structures:</span> []&#10;}</pre>			<div class='sep_small'></div>			<p class='p_normal' style='width: 400px; line-height: 26px'>there are 3 friendly and 1 enemy spirit within 400 radius around the base</p>			<pre class='code_sample'>base.sight.enemies[0];</pre>			<pre class='code_sample'><span class='lowlight'>output:</span> 'karl4'</pre>			<div class='sep_medium'></div>";
			break;
		case "info_outpost_sight":
			info_content.innerHTML = "<pre class='code_sample'>outpost.sight = &#10;{&#10;  <span class='lowlight'>enemies:</span> [‘jane2’, ‘jane3’, ‘jane4’]&#10;}<span class='lowlight'></pre>			<div class='sep_small'></div>			<p class='p_normal' style='width: 400px; line-height: 26px'>there are 3 enemy spirits within outpost's range</p>			<pre class='code_sample'>enemy.sight.enemies[0];</pre>			<pre class='code_sample'><span class='lowlight'>output:</span> 'jane2'</pre>			<div class='sep_medium'></div>";
			break;
		case "info_birth":
			info_content.innerHTML = "<span class='g_con'><span class='ico_circle'></span> Circles new spirit cost</span><div class='sep_mini'></div><table class='info_table'><tr><td>1–50 spirits</td><td>25 energy</td></tr><tr><td>51–100</td><td>50 energy</td></tr><tr><td>101–200</td><td>90 energy</td></tr><tr><td>201+</td><td>150 energy</td></tr></table><div class='sep_small'></div><span class='g_con'><span class='ico_square'></span> Squares new spirit cost</span><div class='sep_mini'></div><table class='info_table'><tr><td>1–10 spirits</td><td>360 energy</td></tr><tr><td>11–16 spirits</td><td>500 energy</td></tr><tr><td>17+ spirits</td><td>700 energy</td></tr></table><div class='sep_small'></div><span class='g_con'><span class='ico_triangle'></span> Triangles new spirit cost</span><div class='sep_mini'></div><table class='info_table'><tr><td>1–30 spirits</td><td>90 energy</td></tr><tr><td>31-120 spirits</td><td>160 energy</td></tr><tr><td>121+ spirits</td><td>300 energy</td></tr></table><div class='sep_mini'></div><div class='sep_small'></div>";
			break;
	}
	
	el_width = info_el.getBoundingClientRect().width;
	el_height = info_el.getBoundingClientRect().height;
	
	
	if (window.screen.availWidth > 800){
		info_el.style.left = leftPos - el_width + 40 + 'px';
		info_el.style.top = topPos - el_height - 12 + 'px';
	}
	info_el.style.display = "block";
	
	
	anime({
  		targets: '#info_box',
  		opacity: 1,
  		easing: 'easeOutQuad',
  		duration: 200
	});
}

function hide_info_snippet(){
	anime({
  		targets: '#info_box',
  		opacity: 0,
  		easing: 'easeOutQuad',
  		duration: 200
	});
}

function expand_documentation(elid, rotator){
	try {
		var exp_row = document.getElementById(elid);
		var exp_el = document.querySelector('#' + elid + ' div.exp_content').getBoundingClientRect();
	} catch (error) {
	  console.error(error);
	}
	
	
	
	if (exp_row.classList.contains("row_expanded")){
		console.log('collapsing');
		exp_row.classList.remove('row_expanded');
		anime({
	  		targets: '#' + elid,
	  		minHeight: 0,
	  		easing: 'easeOutQuad',
	  		duration: 200
		});
		anime({
	  		targets: '#' + elid + '_wrap',
			backgroundColor: ['rgba(242, 246, 250, 0.06)', 'rgba(242, 246, 250, 0)'],
	  		easing: 'easeOutQuad',
	  		duration: 200
		});
		anime({
	  		targets: '#' + rotator,
	  		rotate: 0,
	  		easing: 'easeOutQuad',
	  		duration: 200
		});
	} else {
		console.log('expanding')
		exp_row.classList.add('row_expanded');
		anime({
	  		targets: '#' + elid,
	  		minHeight: exp_el.height + 68,
	  		easing: 'easeOutQuad',
	  		duration: 200
		});
		anime({
	  		targets: '#' + elid + '_wrap',
			backgroundColor: ['rgba(242, 246, 250, 0)', 'rgba(242, 246, 250, 0.06)'],
	  		easing: 'easeOutQuad',
	  		duration: 200
		});
		anime({
	  		targets: '#' + rotator,
	  		rotate: 180,
	  		easing: 'easeOutQuad',
	  		duration: 200
		});
	}
	
	console.log(exp_el.height);
	
}


// replays

function tick_options_expand(){
	anime({
  		targets: '.tick_rate_select',
  		opacity: 1,
  		easing: 'easeOutQuad',
  		duration: 100
	});
	anime({
  		targets: '#tick_sec_desc',
  		opacity: 0,
  		easing: 'easeOutQuad',
  		duration: 100
	});
	document.getElementById('tick_sec_desc').style.pointerEvents = 'none';
	document.getElementById('tick_sec_block').style.pointerEvents = 'auto';
}

function tick_options_collapse(){
	anime({
  		targets: '.tick_rate_select',
  		opacity: 0,
  		easing: 'easeOutQuad',
  		duration: 100
	});
	anime({
  		targets: '#tick_sec_desc',
  		opacity: 1,
  		easing: 'easeOutQuad',
  		duration: 100
	});
	document.getElementById('tick_sec_desc').style.pointerEvents = 'auto';
	document.getElementById('tick_sec_block').style.pointerEvents = 'none';
}

function replay_loaded(){
	anime({
  		targets: '#loading_replay',
  		opacity: 0,
  		easing: 'easeOutQuad',
  		duration: 100
	});
	
	anime({
  		targets: '#wg_game_stats',
  		opacity: 1,
  		easing: 'easeOutQuad',
  		duration: 100
	});
	
	anime({
  		targets: '#wg_replay',
  		opacity: 1,
  		easing: 'easeOutQuad',
  		duration: 100
	});
}


function trailer_open(){
	
	anime({
  		targets: '#overlay_trailer',
  		opacity: 0.8,
  		easing: 'easeOutQuad',
  		duration: 200
	});
	
	try {
		trailer_ov.style.pointerEvents = 'auto';
		trailer_vid.style.display = 'block';
	} catch (e){
		
	}
	
}

function trailer_close(){
	
	anime({
  		targets: '#overlay_trailer',
  		opacity: 0,
  		easing: 'easeOutQuad',
  		duration: 200
	});
	
	try {
		trailer_ov.style.pointerEvents = 'none';
		trailer_vid.style.display = 'none';
	} catch (e) {
		
	}
	
}



// -----



// mobile game view

function game_switch_view(){
	
	var switcher = document.getElementById('switch_view');
	var panelo = document.getElementById('panel');
	
	if (switcher.classList.contains('switch_switched')){
		switcher.classList.remove('switch_switched');
		panel.style.display = "block";
		panel.style.backgroundColor = "rgba(12, 10, 16, 0.96)";
	} else {
		switcher.classList.add('switch_switched');
		panel.style.display = "none";
	}
	
}


function check_login(){
	if (getCookie('session_id') != null && getCookie('user_id') != null && getCookie('user_id') != "anonymous"){
		window.location = './hub';
	} else {
		new_account();
	}
}




// helper vars
try {
	var new_acc_pos = document.getElementById('new_account').getBoundingClientRect();
	var login_pos = document.getElementById('login').getBoundingClientRect();
} catch (error) {
  //console.error(error);
}

//var new_acc_rect = document.getElementById('new_account').getBoundingClientRect();

//flags
var account_creation = 0;
var account_login = 0;
var dismiss_intent = 1;
var resign_open = 0;
var temp_from_nongame = 0;


//document.getElementById('new_account').addEventListener('pointerdown', dismiss_helper, false);

try {
	document.getElementById('new_account').addEventListener('click', new_account, false);
	document.getElementById('login').addEventListener('click', login, false);
	
} catch (error) {
  //console.error(error);
}

try {
	document.getElementById('action_start_playing').addEventListener('click', check_login, false);
} catch (error){
	
}

try {
	document.getElementById('log_out').addEventListener('click', logout, false);
} catch (error) {
  //console.error(error);
}


document.getElementById('overlay').addEventListener('click', dismissals, false);
document.getElementById('signed_in').addEventListener('click', user_links, false);

try {
	document.getElementById('over_new_account').addEventListener('click', new_account, false);
	document.getElementById('over_login').addEventListener('click', login, false);
} catch (error) {
  //console.error(error);
}


window.addEventListener('resize', resizing);




anime({
	targets: '#tutorial',
	//translateY: 500,
	easing: 'easeInOutQuad',
	duration: 3000
});