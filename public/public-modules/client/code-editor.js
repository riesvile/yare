if (live_render == 1){
	document.getElementById('panel').style.display = 'block';
	document.getElementById('update_switch_wrapper').style.display = 'block';
}

try {
	if (user_role == 'observer'){
		document.getElementById('panel').style.display = 'none';
		document.getElementById('update_switch_wrapper').style.display = 'none';
	}
} catch (e) {
	//console.log(e);
}

var helper_man_flag = 1;
