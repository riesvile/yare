function dismissals(){
	if (dismiss_intent == 0){
		dismiss_intent = 1;
		return;
	}
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
	
	anime({
		targets: '#profile_links',
		translateY: [10, 0],
		opacity: 0,
		easing: 'easeOutQuad',
		duration: 200
	});
	
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0)',
		backdropFilter: 'blur(0px)',
		easing: 'easeOutQuad',
		duration: 200
	});
	
	
	document.getElementById('overlay').style.pointerEvents = 'none';
	document.getElementById('new_account_wrap').style.pointerEvents = 'none';
	document.getElementById('login_wrap').style.pointerEvents = 'none';
	document.getElementById('profile_links').style.pointerEvents = 'none';
}

function dismiss_helper(){
	dismiss_intent = 0;
}

function new_account(){
	account_creation = 1;
	document.getElementById('new_account_wrap').style.display = 'block';
	document.getElementById('new_account_wrap').style.pointerEvents = 'auto';
	anime({
		targets: '#new_account_wrap',
		translateX: [new_acc_pos.right - 420, new_acc_pos.right - 420],
		translateY: [0, 20],
		opacity: [0, 1],
		easing: 'easeOutQuad',
		duration: 300
	});
	
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0.39)',
		backdropFilter: 'blur(12px)',
		easing: 'easeOutQuad',
		duration: 300
	});
	
	document.getElementById("new_user_name").focus();
	document.getElementById('overlay').style.pointerEvents = 'auto';
}

function login(){
	account_login = 1;
	document.getElementById('login_wrap').style.display = 'block';
	document.getElementById('login_wrap').style.pointerEvents = 'auto';
	anime({
		targets: '#login_wrap',
		translateX: [login_pos.right - 440, login_pos.right - 440],
		translateY: [0, 20],
		opacity: [0, 1],
		easing: 'easeOutQuad',
		duration: 300
	});
	
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0.39)',
		backdropFilter: 'blur(12px)',
		easing: 'easeOutQuad',
		duration: 300
	});
	
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
	document.getElementById('new_account').style.display = 'none';	
	document.getElementById('login').style.display = 'none';
	document.getElementById('signed_in').innerHTML = user_name;
	document.getElementById('signed_in').style.display = 'block';
	console.log('iodsjfoidsjf');
	
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
	window.location = '/';
}

function user_links(){
	//console.log('userlinko !!!!!');
	anime({
		targets: '#profile_links',
		translateY: [0, 10],
		opacity: [0, 1],
		easing: 'easeOutQuad',
		duration: 300
	});
	
	anime({
		targets: '#overlay',
		backgroundColor: 'rgba(0, 0, 0, 0.39)',
		backdropFilter: 'blur(12px)',
		easing: 'easeOutQuad',
		duration: 300
	});

	document.getElementById('overlay').style.pointerEvents = 'auto';	
	document.getElementById('profile_links').style.pointerEvents = 'auto';
}

function resizing(){
	new_acc_pos = document.getElementById('new_account').getBoundingClientRect();
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


function tut_start(){
  	anime({
  		targets: '#overlay_start',
  		backgroundColor: 'rgba(0, 0, 0, 0)',
  		easing: 'easeOutQuad',
  		duration: 800
  	});
}

function tut_show_box(){
  	anime({
  		targets: '#overlay',
  		backgroundColor: 'rgba(0, 0, 0, 0.56)',
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
}


// helper vars
var new_acc_pos = document.getElementById('new_account').getBoundingClientRect();
var login_pos = document.getElementById('login').getBoundingClientRect();
//var new_acc_rect = document.getElementById('new_account').getBoundingClientRect();

//flags
var account_creation = 0;
var account_login = 0;
var dismiss_intent = 1;


//document.getElementById('new_account').addEventListener('pointerdown', dismiss_helper, false);
document.getElementById('new_account').addEventListener('click', new_account, false);
document.getElementById('login').addEventListener('click', login, false);
document.getElementById('log_out').addEventListener('click', logout, false);
document.getElementById('overlay').addEventListener('click', dismissals, false);
document.getElementById('signed_in').addEventListener('click', user_links, false);

window.addEventListener('resize', resizing);




anime({
	targets: '#tutorial',
	//translateY: 500,
	easing: 'easeInOutQuad',
	duration: 3000
});