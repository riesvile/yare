//flags
var active_session = 0;
var game_id = '';
var link_filled = 0;

var lang_sel = 'javascript';
var modules_local = {};
var something_changed = 0;

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

if (getCookie('session_id') != null && getCookie('user_id') != null){
	if (getCookie('user_id') == "anonymous"){
		active_session = 1;
		if (window.location.pathname.length <= 1) {
			setCookie('user_id', 'anonymous');
			setCookie('session_id', generateUniqueString(3), 1);
			//new_game();
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
			  //console.log(response);
			  if (response.data == "expired session"){
			  	  eraseCookie('user_id');
			  	  eraseCookie('user_session');
		  		  window.location = './';
			  } else if (response.data == "something went wrong"){
			  	
			  } else {
				  //TODO: This might not work
				  setCookie('user_id', response.username);
				  setCookie('session_id', response.data, 7);
				  //console.log('storing cookie');
				  
				  login_success(response.username);
				 
			  }
		  })
	      .catch(err => {
			  //console.log(err);
		  });
		  
		  active_session = 1;
	}
	
} else {
	if (window.location.pathname.length <= 1) {
		//console.log('window.location.pathname.length');
		//console.log(window.location.pathname.length);
		setCookie('user_id', 'anonymous');
		setCookie('session_id', generateUniqueString(3), 1);
		//console.log(getCookie('user_id'))
		//new_game();
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
		  //console.log(response);
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
		  //console.log(err);
	  });
	  //console.log(getCookie('user_id'));
}

function waiting_for_p2(g_id){
	//interval – keep checking with server if p2 connected
	//console.log('waiting for player 2 for game' + g_id);
	knockknock = setInterval(function(){
		//console.log('checking with server');
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
			  //console.log(response);
			  if (link_filled == 0){
				  link_filled = 1;
				  document.getElementById('ch_link').innerHTML = 'https://yare.io/challenge/' + g_id;
				  document.getElementById('friend_link').setAttribute('code', 'https://yare.io/challenge/' + g_id);
			  }
			  
			  if (response.data == 'not yet'){
				  //console.log('still nothing');
			  } else if (response.data == 'ready'){
				  //console.log('game is ready');
				  //document.getElementById("get_in").style.display = "block";
				  window.location = './' + response.server + 'n/' + game_id;
			  }
		  
		 
		  })
	      .catch(err => {
			  //console.log(err);
		  });
	}, 1000);
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
			  //console.log(response);
			  if (response.data == "no such user"){
		  		  //console.log('does not exist');
				  login_error('user does not exist');
				  resume_client();
			  } else if (response.data == "wrong password"){
				  login_error('wrong password');
				  resume_client();
				  //console.log('wrong pass');
			  } else {
				  setCookie('user_id', response.user_id);
				  setCookie('session_id', response.data, 7);
				  //console.log('storing cookie');
				  login_success(response.user_id);
				  //window.location = './hub';
			  }
		  })
	      .catch(err => {
			  //console.log(err);
		  });
	  
	});
} catch (e) {
	////console.log(e);
}

function submit_test(){
	//console.log('submit teest');
}


function get_lang(){
	let user_name = getCookie('user_id');
	
	fetch('/get-pref-lang', {
	        method: "POST",
	        headers: {
	          Accept: "application/json",
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
		        user_name: user_name
		    })

    }).then(response => response.json())
      .then(response => {
		  //console.log(response);
		  if (response.data == "lang incoming"){
			  console.log('all good');
			  lang_sel = response.lang;
			  console.log('preferred lang = ' + response.lang);
			  
		  	let sel_js = document.getElementById("lang_js");
		  	let sel_ts = document.getElementById("lang_ts");
		  	let sel_py = document.getElementById("lang_py");
			  
		  	if (response.lang == 'javascript'){
		  		sel_js.classList.add('lang_on');
		  		sel_ts.classList.remove('lang_on');
		  		sel_py.classList.remove('lang_on');
		  		lang_sel = 'javascript';
		  		window.codeLanguage = "javascript";
		  	} else if (response.lang == 'typescript'){
		  		sel_js.classList.remove('lang_on');
		  		sel_ts.classList.add('lang_on');
		  		sel_py.classList.remove('lang_on');
		  		lang_sel = 'typescript';
		  		window.codeLanguage = "typescript";
		  	} else if (response.lang == 'python'){
		  		sel_js.classList.remove('lang_on');
		  		sel_ts.classList.remove('lang_on');
		  		sel_py.classList.add('lang_on');
		  		lang_sel = 'python';
		  		window.codeLanguage = "python";
		  	}
			  
		  } 
	  })
      .catch(err => {
		  console.log(err);
	  });	
}

function set_lang(){
	//TODO: trigger only if changed!!!
	
	let user_name = getCookie('user_id');
	
	fetch('/set-pref-lang', {
	        method: "POST",
	        headers: {
	          Accept: "application/json",
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
		        user_name: user_name,
				session_id: getCookie('session_id'),
				pref_lang: lang_sel
		    })

    }).then(response => response.json())
      .then(response => {
		  //console.log(response);
		  if (response.data == "lang updated"){
			  console.log('language is updated');
		  } 
	  })
      .catch(err => {
		  console.log(err);
	  });
}


function lang_toggle(e){
	
    e = e || window.event;
    let el = (e.target || e.srcElement);
	
	let el_id = el.id;
	
	console.log('lang = ' + el_id);
	
	let sel_js = document.getElementById("lang_js");
	let sel_ts = document.getElementById("lang_ts");
	let sel_py = document.getElementById("lang_py");
	
	
	//TODO: store preferred language in preferences?
	
	if (el_id == 'lang_js'){
		sel_js.classList.add('lang_on');
		sel_ts.classList.remove('lang_on');
		sel_py.classList.remove('lang_on');
		lang_sel = 'javascript';
		window.codeLanguage = "javascript";
	} else if (el_id == 'lang_ts'){
		sel_js.classList.remove('lang_on');
		sel_ts.classList.add('lang_on');
		sel_py.classList.remove('lang_on');
		lang_sel = 'typescript';
		window.codeLanguage = "typescript";
	} else if (el_id == 'lang_py'){
		sel_js.classList.remove('lang_on');
		sel_ts.classList.remove('lang_on');
		sel_py.classList.add('lang_on');
		lang_sel = 'python';
		window.codeLanguage = "python";
	}
	
}


function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

var module_draw = {};
var currently_editing = 0;
if (window.from_gameserver == null) {
	var from_gameserver = '';
}


var pub_modules = {};
pub_modules['mod_basic-info-graphs'] = {
	active: 0,
	name: 'Basic info & energy graphs',
	module_id: 'basic-info-graphs',
	author: 'yare.io',
	description: "Graph showing the difference between players' current energy and total energy levels. Clicking on the graph minimizes it.",
	type: 'data viz',
	client_script_location: 'local',
	server_script_location: 0, 
	public: 1
}
pub_modules['mod_manual-controls'] = {
	active: 0,
	name: 'Manual controls interface',
	module_id: 'manual-controls',
	author: 'yare.io',
	description: "Play yare with your mouse like a traditional Real-Time Strategy.",
	type: 'UI controls',
	client_script_location: 'local',
	server_script_location: 'local',
	public: 1
}
modules_local['mod_basic-info-graphs'] = pub_modules['mod_basic-info-graphs'];
modules_local['mod_manual-controls'] = pub_modules['mod_manual-controls'];


function expand_card(m_id){
  console.log('expanding ' + m_id);
}

function settings_crossroad(e){
  e = e || window.event;
  var el_id = (e.target || e.srcElement).id;
  console.log('over id= ' + el_id);
  
  switch (el_id){
  	case 'profile_links':
  	  dismissals();
	  break;
    case 'dismiss':
	  dismissals();
	  break;
    case 'bg_mdl_basic_info_graphs':
	  expand_card('basic_info_graphs');	
	  break;
    default:
		console.log('defaulted');
  }
}


function create_module(){
	
	let user_name = getCookie('user_id');
	let session_id = getCookie('session_id');
	
	let client_uploader = document.getElementById("file_script_client");
	let server_uploader = document.getElementById("file_script_server");
	let module_name_input = document.getElementById("module_name_input");
	
	let has_client = 0;
	let has_server = 0;
	
	if (client_uploader.value != "") has_client = 1;
	if (server_uploader.value != "") has_server = 1;
	
	
	if (has_client == 0 && has_server == 0){
		document.getElementById("modules_server_message").style.opacity = 1;
		document.getElementById("modules_server_message").innerHTML = "Upload at least one .js file";
		return;
	} else if (module_name_input.value == "") {
		document.getElementById("modules_server_message").style.opacity = 1;
		document.getElementById("modules_server_message").innerHTML = "Give your module a name";
		module_name_highlight();
		return;
	} else {
		document.getElementById("modules_server_message").style.opacity = 0;
	}
	
	console.log('module name = ' + module_name_input.value);

	fetch('/new-module', {
	        method: "POST",
	        headers: {
	          Accept: "application/json",
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
		        user_name: user_name,
				session_id: session_id,
		        module_name: module_name_input.value
		    })

    }).then(response => response.json())
      .then(response => {
		  //console.log(response);
		  if (response.data == "module created"){
			  console.log('all good');
			  console.log('module_id = ' + response.module_id);
			  modules_local['mod_' + response.module_id] = {
			  	  name: module_name_input.value,
				  author: user_name,
				  module_id: response.module_id,
				  public: 0,
				  active: 1
			  };
			  sessionStorage.setItem('populated', 'no');
			  if (has_client) upload_script(response.module_id, "client");
			  if (has_server) upload_script(response.module_id, "server");
			  document.getElementById("modules_server_message_loader").style.opacity = 1;
		  } 
	  })
      .catch(err => {
		  console.log(err);
	  });	
}

function integrate_new_module(mod_id){
	console.log('goes here');
	
	let m_id = mod_id;
	let script_name = modules_local['mod_' + m_id].name;
	let m_author = modules_local['mod_' + mod_id].author;
	let mod_state = 'module_off';
	if (modules_local['mod_' + mod_id].active == 1) mod_state = 'module_on';
	
	console.log('script name = ' + script_name);
	
	let user_module_html_string = "<div class='module_card_mine " + mod_state + "' id='mdl_" + m_id + "'><div class='module_card_bg' id='bg_mdl_mine'></div><div class='module_options' id='options_" + m_id + "'><a href='#' class='module_options_btn btn_edit' id='edit_" + m_id + "'>Edit</a><a href='#' class='module_options_btn btn_pre_delete_module' id='predel_" + m_id + "'>Delete</a><div class='delete_confirm' id='confirm_" + m_id + "'><a href='#' class='module_options_btn delete_module' id='del_" + m_id + "'>Yes, delete</a><a href='#' class='module_options_btn cancel_delete' id='cancel_" + m_id + "'>Cancel</a></div></div><div class='module_toggle' id='toggle_" + m_id + "'><div class='the_toggle' id='thetog'></div></div><h3 class='module_name'>" + script_name + "</h3></div>";
	
	document.getElementById('modules_section_mine').insertAdjacentHTML('beforeend', user_module_html_string);
	
	
	let script_insert = document.createElement('script');
	script_insert.src = "https://yare.sfo3.digitaloceanspaces.com/modules/client/" + mod_id + ".js";
	document.head.appendChild(script_insert);
	console.log('module ' + mod_id + " should be appended");
	
	document.getElementById("toggle_" + m_id).addEventListener('click', toggle_toggle, false);
	document.getElementById("options_" + m_id).addEventListener('click', mod_options_cross, false);
	
}

function update_module_info(module_id, delete_module = 0){
	if (currently_editing != 0) module_id = currently_editing;
	console.log('updating mommmmoodule ' + module_id);
	
	let user_name = getCookie('user_id');
	let session_id = getCookie('session_id');
	let module_name = document.getElementById("module_name_input").value;
	
	let retreived = sessionStorage.getItem('mod_' + module_id);
	let retreived_parsed = JSON.parse(retreived);
	
	//if (modules_local['mod_' + module_id] == undefined || module_name == modules_local['mod_' + module_id]['name']) module_name = '';
	if (retreived_parsed == undefined || module_name == retreived_parsed['name']) module_name = '';
	
	let client_uploader = document.getElementById("file_script_client");
	let server_uploader = document.getElementById("file_script_server");
	let module_name_input = document.getElementById("module_name_input");
	
	let has_client = 0;
	let has_server = 0;
	
	if (client_uploader.value != "") has_client = 1;
	if (server_uploader.value != "") has_server = 1;
	
	fetch('/update-module-info', {
	        method: "POST",
	        headers: {
	          Accept: "application/json",
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
		        user_name: user_name,
				session_id: session_id,
				module_id: module_id,
		        module_name: module_name,
				delete_module: delete_module
		    })

    }).then(response => response.json())
      .then(response => {
		  //console.log(response);
		  if (response.data == "module updated"){
			  console.log('all good');
			  modules_local['mod_' + module_id]['name'] = module_name_input.value;
			  modules_local['mod_' + module_id]['active'] = 1;
	
			  sessionStorage.setItem('populated', 'no');
			  if (has_client) upload_script(module_id, "client", "refresh");
			  if (has_server) upload_script(module_id, "server");
			  if (has_client || has_server){
				  document.getElementById("modules_server_message_loader").style.opacity = 1;
			  } else {
		  		  document.getElementById("modules_server_message").style.opacity = 1;
		  		  document.getElementById("modules_server_message").innerHTML = "Module updated.";
			  }
			  
		  } else {
			  console.log(response);
		  }
	  })
      .catch(err => {
		  console.log(err);
	  });	
	  
	if (delete_module == 1){
		sessionStorage.removeItem('mod_' + module_id);
		delete modules_local['mod_' + module_id];
		return;
	}
	
	if (module_name != ''){
		modules_local['mod_' + module_id]['name'] = module_name;
		sessionStorage.setItem('mod_' + module_id, modules_local['mod_' + module_id])
	}
	
}


function upload_script(module_id, script_type, meta = ""){
	let user_name = getCookie('user_id');
	let session_id = getCookie('session_id');
	
	console.log('uploading ' + script_type + ' script');
	
	getBase64(document.getElementById("file_script_" + script_type).files[0]).then(
		data => {
			console.log(data);
			let file_client = data;
			fetch('/upload-script', {
			        method: "POST",
			        headers: {
			          Accept: "application/json",
			          "Content-Type": "application/json"
			        },
			        body: JSON.stringify({
				        module_id: module_id,
						script_type: script_type,
						script_file: file_client,
						user_id: user_name,
						session_id: session_id
						
				    })

		    }).then(response => response.json())
		      .then(response => {
				  //console.log(response);
				  if (response.data == "script uploaded"){
					  console.log('all good');
					  console.log(script_type);
					  if (script_type == 'client') integrate_new_module(module_id);
					  
					  document.getElementById("modules_server_message_loader").style.opacity = 0;
			  		  document.getElementById("modules_server_message").style.opacity = 1;
					  if (meta == ""){
					  	 document.getElementById("modules_server_message").innerHTML = "Module updated. Check browser console for client script errors.";
					  } else {
					  	 document.getElementById("modules_server_message").innerHTML = "Module updated. Refresh the page to clear browser context";
					  }
			  		  
				  } 
			  })
		      .catch(err => {
				  console.log(err);
			  });
		});
}


function download_module_script(module_id, client = 1){
	
	let script_type = 'server';
	if (client == 1) script_type = 'client';
	
	fetch('/download-script', {
	        method: "POST",
	        headers: {
	          Accept: "application/json",
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
		        module_id: module_id,
		        script_type: script_type
		    })

    }).then(response => response.json())
      .then(response => {
		  if (response.meta == 'script retreived'){
			  console.log('receiving script file');
			  let temp_user_code = editor.getValue();
			  temp_user_code += "\n" + response.data;
			  editor.setValue(temp_user_code);
			  return 'script appended';
		  } else {
			  return 'nope';
		  }
		  
	  })
      .catch(err => {
		  console.log(err);
	  });
}

function local_server_script(module_id){
	let load_helper = 1;
	let data_helper = '';
	if (modules_local['mod_' + module_id]['server_script_location'] == 0) return;
	let temp_user_code = editor.getValue();
	if (temp_user_code.includes('// loaded module: ' + module_id)) return;
	
	try {
		fetch(from_gameserver + "public-modules/server/" + module_id + ".js")
			.then(function(response) {
    			return response.text().then(function(text) {
					temp_user_code = editor.getValue();
					temp_user_code += "\n\n// ----------------------------------------\n" + "// loaded module: " + module_id + "\n// ------ Do not remove this comment ------\n" + text + "\n// ----------------------------------------";
					editor.setValue(temp_user_code);
					console.log('script appended');
					//return 'script appended';
   				});
  		    });
	} catch (e){
		console.log(e);
	}
	
	
	//console.log();
}

//function insert_server_script(str){
//	let temp_user_code = editor.getValue();
//    temp_user_code += "\n\n" + "// loaded module: " + module_id + "\n\n" + data;
//    editor.setValue(temp_user_code);
//    return 'script appended';
//}


function get_all_modules(){
	let session_id = getCookie('session_id');
	//console.log(allSessionStorage());
	
	if (sessionStorage.getItem('populated') == 'yes'){
		console.log('session retreival');
		allSessionStorage();
		integrate_modules();
		return;
	}
	
	let user_name = getCookie('user_id');
	
	fetch('/get-available-modules', {
	        method: "POST",
	        headers: {
	          Accept: "application/json",
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
		        user_name: user_name,
				session_id: session_id
		    })

    }).then(response => response.json())
      .then(response => {
		  console.log(response);
		  if (response.data == "modules retreived"){
			  console.log('all good');
			  console.log('data stream = ');
			  //console.log(response.stream);
			  for (let i = 0; i < response.stream.length; i++){
				  modules_local['mod_' + response.stream[i].module_id] = response.stream[i];
				  modules_local['mod_' + response.stream[i].module_id]['active'] = 0;
				  sessionStorage.setItem('mod_' + response.stream[i].module_id, JSON.stringify(modules_local['mod_' + response.stream[i].module_id]));
			  }
			  sessionStorage.setItem('populated', 'yes');
			  get_active_modules();
			  //console.log(modules_local);
		  } else {
			  //TODO: clean this up to also receive public modules from the server and drop this 'else' branch
			  sessionStorage.setItem('populated', 'yes');
			  get_active_modules();
		  }
	  })
      .catch(err => {
		  console.log(err);
	  });
}

function toggle_toggle(e){
	something_changed = 1;
	
    e = e || window.event;
    let el = (e.target || e.srcElement)
	
	let el_id = el.id
	let el_parent = el.parentNode;
	
	if (!el_parent.classList.contains("module_card") && !el_parent.classList.contains("module_card_mine")) el_parent = el_parent.parentNode;
	
	let m_id = el_parent.id.split("_")[1];
	
	//if (target.classList.contains(''))
	//el_parent.style="background-color:#f00";
	
	if (el_parent.classList.contains('module_off')){
		el_parent.classList.add('module_on');
		el_parent.classList.remove('module_off');
		
		//TODO: modules_local with a module id from el_id (make active)
		console.log('m_id = ' + m_id);
		try {
			modules_local['mod_' + m_id]['active'] = 1;
			sessionStorage.setItem('mod_' + m_id, JSON.stringify(modules_local['mod_' + m_id]))
		} catch (e){
			console.log(e);
		}
	} else {
		el_parent.classList.add('module_off');
		el_parent.classList.remove('module_on');
		
		try {
			modules_local['mod_' + m_id]['active'] = 0;
			sessionStorage.setItem('mod_' + m_id, JSON.stringify(modules_local['mod_' + m_id]))
		} catch (e){
			console.log(e);
		}
	}
	
	console.log('parent id: ' + el_parent.id);
}

function mod_options_cross(e){
	something_changed = 1;
	
    e = e || window.event;
    let el = (e.target || e.srcElement)
	
	let el_id = el.id;
	
	if (!el_id.includes("_")) return;
	
	el_mod_action = el_id.split("_")[0];
	el_mod_id = el_id.split("_")[1];
	
	console.log(el_mod_action);
	
	switch (el_mod_action) {
	case "predel":
		console.log('predeleting');
		module_pre_delete(el_mod_id);
		break;
	case "del":
		console.log('deleting');
		update_module_info(el_mod_id, 1);
		document.getElementById("mdl_" + el_mod_id).style.opacity = "0";
		document.getElementById("mdl_" + el_mod_id).style.pointerEvents = "none";
		break;
	case "edit":
		console.log('editing');
		module_edit_mode_on(2, el_mod_id);
		break;
	case "cancel":
		module_cancel_delete(el_mod_id);
		console.log('cancelling');
		break;
	default:
		console.log('defaulted');
		break;
	}
}

function get_active_modules(){
	let user_name = getCookie('user_id');
	
	fetch('/get-active-modules', {
	        method: "POST",
	        headers: {
	          Accept: "application/json",
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
		        user_name: user_name
		    })

    }).then(response => response.json())
      .then(response => {
		  console.log(response);
		  if (response.data == "modules retreived"){
			  console.log('all good');
			  console.log('active modules = ');
			  console.log(response.active_modules);
			  for (let i = 0; i < response.active_modules.length; i++){
				  modules_local['mod_' + response.active_modules[i]]['active'] = 1;
				  sessionStorage.setItem('mod_' + response.active_modules[i], JSON.stringify(modules_local['mod_' + response.active_modules[i]]));
			  }
			  integrate_modules();
		  } 
	  })
      .catch(err => {
		  console.log(err);
	  });
}

function activate_module(module_id){
	modules_local['mod_' + module_id]['active'] = 1;
	sessionStorage.setItem('mod_' + module_id, JSON.stringify(modules_local['mod_' + module_id]));
}

function deactivate_module(module_id){
	modules_local['mod_' + module_id]['active'] = 0;
	sessionStorage.setItem('mod_' + module_id, JSON.stringify(modules_local['mod_' + module_id]));
}

function set_active_modules(){
	let user_name = getCookie('user_id');
	let active_array = [];
	
	for (const mod_id of Object.keys(modules_local)) {
	    //console.log(key, modules_local[mod_id]);
		if (modules_local[mod_id]['active'] == 1) active_array.push(modules_local[mod_id]['module_id']);
		sessionStorage.setItem(mod_id, JSON.stringify(modules_local[mod_id]));
	}
	
	console.log('new active modules = ' + active_array);
	
	fetch('/set-active-modules', {
	        method: "POST",
	        headers: {
	          Accept: "application/json",
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
		        user_name: user_name,
				active_modules: active_array
		    })

    }).then(response => response.json())
      .then(response => {
		  console.log(response);
		  if (response.data == "updated"){
			  console.log('active modules updated');
			  sessionStorage.setItem('populated', 'no');
			  location.reload();
		  } 
	  })
      .catch(err => {
		  console.log(err);
	  });
}

function get_module_info(module_id){
	
	fetch('/get-module-info', {
	        method: "POST",
	        headers: {
	          Accept: "application/json",
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
		        module_id: module_id
		    })

    }).then(response => response.json())
      .then(response => {
		  console.log(response);
		  if (response.data == "module info retreived"){
			  console.log('all good');
			  console.log('module name = ' + response.m_name);
		  } 
	  })
      .catch(err => {
		  console.log(err);
	  });
}

function integrate_modules(){
	
	let user_name = getCookie('user_id');
	
	let server_scripts_combined = '';
	
	// get active modules from modules_local and populate <head> with scripts (get url from the module_id);
	
	//first populating module cards
	let card_insertion = Object.values(modules_local);
	console.log(card_insertion);
	
	try {
		for (let i=0; i < card_insertion.length; i++){
			let m_id = card_insertion[i].module_id;
			let script_name = card_insertion[i].name;
			//script_name = script_name.split("\n").join("<br />");
			let m_author = card_insertion[i].author;
			let mod_state = 'module_off';
			if (card_insertion[i].active == 1) mod_state = 'module_on';
			let mod_desc = card_insertion[i].description;
			let desc_type = 'desc_l';
			if (mod_desc.length > 138) desc_type = 'desc_s';
		
		
			//user modules
			if (m_author == user_name){
				let user_module_html_string = "<div class='module_card_mine " + mod_state + "' id='mdl_" + m_id + "'><div class='module_card_bg' id='bg_mdl_mine'></div><div class='module_options'><a href='#' class='module_options_btn btn_edit' id='edit_" + m_id + "'>Edit</a><a href='#' class='module_options_btn btn_pre_delete_module' id='predel_" + m_id + "'>Delete</a><div class='delete_confirm' id='confirm_" + m_id + "'><a href='#' class='module_options_btn delete_module' id='del_" + m_id + "'>Yes, delete</a><a href='#' class='module_options_btn cancel_delete' id='cancel_" + m_id + "'>Cancel</a></div></div><div class='module_toggle' id='toggle_" + m_id + "'><div class='the_toggle' id='thetog'></div></div><h3 class='module_name'>" + script_name + "</h3></div>";
		
				document.getElementById('modules_section_mine').insertAdjacentHTML('beforeend', user_module_html_string);
			} else if (card_insertion[i].public == 1) {
			//public modules
				let public_module_html_string = "<div class='module_card " + mod_state + "' id='mdl_" + m_id + "'> <div class='module_card_bg' id='bg_mdl_" + m_id + "'></div> <span class='module_main_tag'>" + card_insertion[i].type + "</span> <div class='module_toggle' id='toggle_" + m_id + "'> <div class='the_toggle' id='thetog'></div> </div> <h3 class='module_name'>" + script_name + "</h3> <div class='module_ilu ilu_" + m_id + "' style='background:url(" + from_gameserver + "public-modules/ilu/" + m_id + ".png); background-size: cover;'></div> <p class='module_desc " + desc_type + "'>" + mod_desc + "</p> </div>";	
				document.getElementById('modules_section').insertAdjacentHTML('beforeend', public_module_html_string);
			}
		
		}
	} catch (e){
		console.log(e);
		sessionStorage.setItem('populated', 'no');
		//location.reload();
	}
	
	
    let mod_toggles = document.getElementsByClassName("module_toggle");
    let mod_options = document.getElementsByClassName("module_options");
  
    for (let i=0; i<mod_toggles.length; i++) {
        mod_toggles[i].addEventListener('click', toggle_toggle, false);
    }
  
    for (let i=0; i<mod_options.length; i++) {
        mod_options[i].addEventListener('click', mod_options_cross, false);
    }
	
	
	
	
	let ready_insertion = Object.values(modules_local).filter(item => item.active == 1);
	console.log(ready_insertion);
	
	//skip insertion if not in a game
	if (from_gameserver == '') return;
	
	setTimeout(function(){
		for (let i = 0; i < ready_insertion.length; i++){
			let m_id = ready_insertion[i].module_id;
			let script_name = ready_insertion[i].name;
			let script_insert = document.createElement('script');
			let m_author = ready_insertion[i].author;
			if (ready_insertion[i].public == 1){
				script_insert.src = from_gameserver + "public-modules/client/" + ready_insertion[i].module_id + ".js";
				local_server_script(ready_insertion[i].module_id);
			} else {
				script_insert.src = "https://yare.sfo3.digitaloceanspaces.com/modules/client/" + ready_insertion[i].module_id + ".js";
				download_module_script(ready_insertion[i].module_id, 0);
			}
			document.head.appendChild(script_insert);
			console.log(ready_insertion[i].module_id + ' should be appended');
			console.log('module author: ' + m_author);	
			
			//try for server script
					
		}
	}, 500)
	
	//fetch("https://yare.sfo3.digitaloceanspaces.com/modules/client/aNg1a2d2oh17.js").then(r => r.text()).then(t => console.log(t));
	
  
  
	
	
	
    //let script_name2 = 'user_script';
    //let script_insert2 = document.createElement('script');
    //script_insert2.src = "https://yare.sfo3.digitaloceanspaces.com/modules/client/aNg182b242as0.js";
    //document.head.appendChild(script_insert2);
	
	
}


function allSessionStorage() {

	let theThing = {}

	Object.keys(sessionStorage).forEach((key) => {
	    //storage[key] = localStorage.getItem(key);
		//console.log(sessionStorage.getItem(key));
		if (key.startsWith('mod_')){
			theThing[key] = JSON.parse(sessionStorage.getItem(key));
			modules_local[key] = JSON.parse(sessionStorage.getItem(key));
		}
		
	});
	
	//console.log(theThing);
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
			  //console.log(response);
			  if (response.data == "user created"){
				  console.log('all good');
				  console.log('session_id = ' + getCookie('session_id'));
				  setCookie('user_id', response.user_id);
				  setCookie('session_id', response.session_id);
				  try {
				  	tutorial_signup(response.user_id);
				  } catch (e) {
					  console.log(e);
				  }
				  
				  //console.log('session_id = ' + getCookie('session_id'));
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
				  //console.log('storing cookie');
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


//module triggers

document.getElementById('profile_links').addEventListener('click', settings_crossroad, false);

document.getElementById("file_script_server").onchange = function(){
  document.getElementById("server_file_name").textContent = this.files[0].name;
  document.getElementById("modules_server_message").style.opacity = 0;
}

document.getElementById("file_script_client").onchange = function(){
  document.getElementById("client_file_name").textContent = this.files[0].name;
  document.getElementById("modules_server_message").style.opacity = 0;
}


//other module triggers
try {
	document.getElementById('create_new_module').addEventListener('click', module_edit_mode_on, false);
	document.getElementById('close_module_edit').addEventListener('click', module_edit_mode_off, false);
	document.getElementById('create_module_btn').addEventListener('click', create_module, false);
	document.getElementById('update_module_btn').addEventListener('click', update_module_info, false);
	
	document.getElementById('language_settings').addEventListener('click', lang_toggle, false);
} catch (e){
	
}

get_lang();
get_all_modules();








//TODO: Edit module and loading animation



















