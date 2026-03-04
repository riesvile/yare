(function(){
	var STORAGE_KEY = 'yare_theme';
	var LIGHT = 'light';
	var DARK = 'dark';

	var LIGHT_COLOR_PALETTES = {
		'color1':  'rgba(45,55,200,1)',
		'color2':  'rgba(175,30,30,1)',
		'color3':  'rgba(5,115,175,1)',
		'color4':  'rgba(145,100,25,1)',
		'color5':  'rgba(75,0,148,1)',
		'color6':  'rgba(60,105,30,1)',
		'color7':  'rgba(120,0,175,1)',
		'color8':  'rgba(105,65,155,1)',
		'color9':  'rgba(30,140,20,1)',
		'color10': 'rgba(160,95,55,1)',
		'color11': 'rgba(15,65,195,1)',
		'color12': 'rgba(185,15,5,1)',
		'color13': 'rgba(0,130,125,1)',
		'color14': 'rgba(178,50,0,1)',
		'color15': 'rgba(15,15,15,1)'
	};

	var DARK_COLOR_PALETTES = {
		'color1':  'rgba(128,140,255,1)',
		'color2':  'rgba(232,97,97,1)',
		'color3':  'rgba(58,197,240,1)',
		'color4':  'rgba(201,161,101,1)',
		'color5':  'rgba(120,12,196,1)',
		'color6':  'rgba(148,176,108,1)',
		'color7':  'rgba(180,27,227,1)',
		'color8':  'rgba(198,166,224,1)',
		'color9':  'rgba(138,228,122,1)',
		'color10': 'rgba(232,198,179,1)',
		'color11': 'rgba(78,142,250,1)',
		'color12': 'rgba(240,70,60,1)',
		'color13': 'rgba(18,255,248,1)',
		'color14': 'rgba(235,93,0,1)',
		'color15': 'rgba(255,255,255,1)'
	};

	var LIGHT_COLOR_RGBA = {
		1:  'rgba(45,55,200,1)',
		2:  'rgba(175,30,30,1)',
		3:  'rgba(5,115,175,1)',
		4:  'rgba(145,100,25,1)',
		5:  'rgba(75,0,148,1)',
		6:  'rgba(60,105,30,1)',
		7:  'rgba(120,0,175,1)',
		8:  'rgba(105,65,155,1)',
		9:  'rgba(30,140,20,1)',
		10: 'rgba(160,95,55,1)',
		11: 'rgba(15,65,195,1)',
		12: 'rgba(185,15,5,1)',
		13: 'rgba(0,130,125,1)',
		14: 'rgba(178,50,0,1)',
		15: 'rgba(15,15,15,1)'
	};

	function isLight(){
		return window.yareTheme === LIGHT;
	}

	function applyTheme(theme){
		window.yareTheme = theme;
		if (theme === LIGHT){
			document.body.classList.add('light-theme');
		} else {
			document.body.classList.remove('light-theme');
		}
		document.dispatchEvent(new CustomEvent('yare-theme-change', {detail: {theme: theme}}));
	}

	function toggle(){
		var next = isLight() ? DARK : LIGHT;
		try { localStorage.setItem(STORAGE_KEY, next); } catch(e){}
		applyTheme(next);
	}

	function init(){
		var saved = null;
		try { saved = localStorage.getItem(STORAGE_KEY); } catch(e){}
		var theme = (saved === LIGHT) ? LIGHT : DARK;
		window.yareTheme = theme;
		if (theme === LIGHT){
			document.body.classList.add('light-theme');
		}

		document.addEventListener('click', function(e){
			if (e.target && e.target.id === 'theme_toggle'){
				toggle();
			}
		});
	}

	if (document.body){
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}

	window.yareThemePalettes = function(){
		return isLight() ? LIGHT_COLOR_PALETTES : DARK_COLOR_PALETTES;
	};
	window.yareThemeColorRGBA = function(){
		return isLight() ? LIGHT_COLOR_RGBA : null;
	};
	window.yareIsLight = isLight;
})();
