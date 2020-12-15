//flags
var active_session = 0;
var tempURLThing = document.URL.replace('#', '');
var game_id = /[^/]*$/.exec(tempURLThing)[0];

if (getCookie('session_id') != null && getCookie('user_id') != null){
	if (getCookie('user_id') == "anonymous"){
		active_session = 1;
		//not sure what to do here yet
	}
	console.log('is this happening?');
	if (active_session == 0){
		console.log('yes');
		fetch('/validate-challenge/' + game_id, {
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
			  if (response.data == "own challenge"){
				  console.log("Can't accept your own challenge");
		  	
			  } else if (response.data == "accepted"){
			  	  console.log("Challenge accepted");
			  }
		  })
	      .catch(err => {
			  console.log(err);
		  });
		  
		  active_session = 1;
	}
	
} else {
	//get sign-in experience?
}




function p2_ready(){
	fetch('/confirm-challenge/' + game_id, {
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
		  if (response.data == "own challenge"){
			  console.log("Can't accept your own challenge");
	  	
		  } else if (response.data == "accepted"){
		  	  console.log("Challenge accepted");
		  }
	  })
      .catch(err => {
		  console.log(err);
	  });
	  
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

function randomString(length) {
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