//flags
var active_session = 0;
var game_id = '';
var link_filled = 0;

if (getCookie('session_id') != null && getCookie('user_id') != null){
	if (getCookie('user_id') == "anonymous"){
		active_session = 1;
		if (window.location.pathname.length <= 1) {
			setCookie('user_id', 'anonymous');
			setCookie('session_id', generateUniqueString(3), 1);
			new_game();
		}
		//load game by session_id
	}
	
	if (active_session == 0){
		fetch('/session', {
		        method: "POST",
		        headers: {
		          Accept: "application/json",
		          "Content-Type": "application/json"
		        },
		        body: JSON.stringify({
			        user_id: getCookie('user_id'),
			        session_id: getCookie('session_id'),
			    })

	    }).then(response => response.json())
	      .then(response => {
			  console.log(response);
			  if (response.data == "expired session"){
			  	  eraseCookie('user_id');
			  	  eraseCookie('user_session');
		  		  window.location = './';
			  } else if (response.data == "something went wrong"){
			  	
			  } else {
				  //TODO: This might not work
				  setCookie('user_id', response.username);
				  setCookie('session_id', response.data, 7);
				  console.log('storing cookie');
				  
				  if (window.location.pathname.length <= 1) {
				      window.location = './hub';
				  } else {
					  login_success(response.username);
				  }
				 
			  }
		  })
	      .catch(err => {
			  console.log(err);
		  });
		  
		  active_session = 1;
	}
	
} else {
	if (window.location.pathname.length <= 1) {
		setCookie('user_id', 'anonymous');
		setCookie('session_id', generateUniqueString(3), 1);
		new_game();
	}
}

function new_game(type){
	fetch('/new-game', {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
	        user_id: getCookie('user_id'),
	        session_id: getCookie('session_id'),
			type: type
	    })
	}).then(response => response.json())
      .then(response => {
		  //redirect to game id
		  console.log(response);
		  game_id = response.g_id;
		  if (response.meta == 'easy-bot'){
			 //setCookie('game_id', game_id);
			 //window.location.href = './' + response.server + 'n/' + response.g_id;
		  	 window.location.href = './' + response.server + 'n/' + response.g_id;
			 //document.location.reload(true);
		  } else if (response.meta == 'medium-bot'){
			  window.location.href = './' + response.server + 'n/' + response.g_id;
		  } else if (response.meta == 'waiting for p2'){
			  waiting_for_p2(response.g_id);
		  }
		  
		 
	  })
      .catch(err => {
		  console.log(err);
	  });
	  console.log(getCookie('user_id'));
}

function waiting_for_p2(g_id){
	//interval – keep checking with server if p2 connected
	console.log('waiting for player 2 for game' + g_id);
	knockknock = setInterval(function(){
		console.log('checking with server');
		fetch('/check-status/' + g_id, {
	        method: "POST",
	        headers: {
	          Accept: "application/json",
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
		        data: 'status check'
		    })
		}).then(response => response.json())
	      .then(response => {
			  //redirect to game id
			  console.log(response);
			  if (link_filled == 0){
				  link_filled = 1;
				  document.getElementById('ch_link').innerHTML = 'https://yare.io/challenge/' + g_id;
				  document.getElementById('friend_link').setAttribute('code', 'https://yare.io/challenge/' + g_id);
			  }
			  
			  if (response.data == 'not yet'){
				  console.log('still nothing');
			  } else if (response.data == 'ready'){
				  console.log('game is ready');
				  //document.getElementById("get_in").style.display = "block";
				  window.location = './' + response.server + 'n/' + game_id;
			  }
		  
		 
		  })
	      .catch(err => {
			  console.log(err);
		  });
	}, 1000);
}


function setCookie(name,value,days){
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=None; Secure";
}


function getCookie(name){
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name){   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function randomString(length){
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

function generateUniqueString(prefix) {
    var timeStampo = String(new Date().getTime()),
        i = 0,
        out = '';

    for (i = 0; i < timeStampo.length; i += 2) {
        out += Number(timeStampo.substr(i, 2)).toString(36);
    }

    return (randomString(prefix) + out);
}

function logout(){
	eraseCookie('user_id');
	eraseCookie('user_session');
	window.location = '/';
}

function newgame(){
	window.location = '/game';
}




try {
	document.getElementById("login_form").addEventListener("submit", function(e){
    
	    e.preventDefault();    //stop form from submitting
		wait_server();

		const url = '/validate';

		var user_name = document.getElementById('user_name').value;
		var user_password = document.getElementById('user_password').value;
	
	


		fetch('/validate', {
		        method: "POST",
		        headers: {
		          Accept: "application/json",
		          "Content-Type": "application/json"
		        },
		        body: JSON.stringify({
			        user_name: user_name,
			        password: user_password,
			    })

	    }).then(response => response.json())
	      .then(response => {
			  console.log(response);
			  if (response.data == "no such user"){
		  		  console.log('does not exist');
				  login_error('user does not exist');
				  resume_client();
			  } else if (response.data == "wrong password"){
				  login_error('wrong password');
				  resume_client();
				  console.log('wrong pass');
			  } else {
				  setCookie('user_id', response.user_id);
				  setCookie('session_id', response.data, 7);
				  console.log('storing cookie');
				  login_success(response.user_id);
				  //window.location = './hub';
			  }
		  })
	      .catch(err => {
			  console.log(err);
		  });
	  
	});
} catch (e) {
	//console.log(e);
}

function submit_test(){
	console.log('submit teest');
}


try {
	document.getElementById("new_acc_form").addEventListener("submit", function(e){
    
	    e.preventDefault();    //stop form from submitting
		wait_server();

		const url = '/add-user';

		var user_name = document.getElementById('new_user_name').value;
		var user_password = document.getElementById('new_user_password').value;

		fetch('/add-user', {
		        method: "POST",
		        headers: {
		          Accept: "application/json",
		          "Content-Type": "application/json"
		        },
		        body: JSON.stringify({
			        user_name: user_name,
			        password: user_password
			    })

	    }).then(response => response.json())
	      .then(response => {
			  console.log(response);
			  if (response.data == "user created"){
				  console.log('all good');
				  console.log('session_id = ' + getCookie('session_id'));
				  setCookie('user_id', response.user_id);
				  setCookie('session_id', response.session_id);
				  tutorial_signup(response.user_id);
				  console.log('session_id = ' + getCookie('session_id'));
				  login_success(response.user_id);
				  update_code();
			  } else if (response.data == "exists"){
				  //console.log('user exists already');
				  username_error('Sorry, this one is already taken');
				  resume_client();
			  } else if (response.data == "toolong"){
				  username_error('Must be < 20 characters (yours is ' + response.data2 + ' characters)');
				  resume_client();
			  } else if (response.data == "tooshort"){
				  username_error('Must be at least 3 characters long');
				  resume_client();
			  } else if (response.data == "special"){
				  username_error('Only letters, numbers and underscore allowed');
				  resume_client();
			  } else if (response.data == "pass_empty"){
				  password_error("Whatever you want, but at least 1 character");
				  resume_client();
			  } else {
				  setCookie('user_id', response.username);
				  setCookie('session_id', response.data, 7);
				  console.log('storing cookie');
				  //window.location = './hub';
			  }
		  })
	      .catch(err => {
			  console.log(err);
		  });
	  
	});
} catch (error) {
  //console.error(error);
}





