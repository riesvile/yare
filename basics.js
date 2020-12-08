//flags
var active_session = 0;

if (getCookie('session_id') != null && getCookie('user_id') != null){
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
		  	
			  } else if (response.data == "something went wrong"){
			  	
			  } else {
				  setCookie('user_id', response.username);
				  setCookie('session_id', response.data, 7);
				  console.log('storing cookie');
				  if (window.location.pathname.length <= 1) {
				      window.location = './hub';
				  }
			  }
		  })
	      .catch(err => {
			  console.log(err);
		  });
		  
		  active_session = 1;
	}
	
	
}


function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

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

function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


function logout() {
	eraseCookie('user_id');
	eraseCookie('user_session');
	window.location = '/';
}

function newgame() {
	window.location = '/game';
}




document.querySelector("#login_form").addEventListener("submit", function(e){
    
    e.preventDefault();    //stop form from submitting

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
		  	
		  } else if (response.data == "wrong password"){
		  	
		  } else {
			  setCookie('user_id', response.username);
			  setCookie('session_id', response.data, 7);
			  console.log('storing cookie');
			  window.location = './hub';
		  }
	  })
      .catch(err => {
		  console.log(err);
	  });
	  
});



