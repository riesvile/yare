const crypto = require('crypto');

function randomString(length) {
	return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

function generateUniqueString(prefix) {
	let timeStampo = String(new Date().getTime()),
			i = 0,
			out = '';

	for (i = 0; i < timeStampo.length; i += 2) {
			out += Number(timeStampo.substr(i, 2)).toString(36);
	}

	return (randomString(prefix) + out);
}

function generateSecureString(length) {
	return crypto.randomBytes(length/2).toString('hex');
}

function isValid(str) {
	return /^\w+$/.test(str);
}

const COLOR_MAP = {
	'gblue': 'color3',
	'purply': 'color1',
	'default': 'color1',
	'redish': 'color2',
	'yerange': 'color4',
	'wirple': 'color5',
	'pistagre': 'color6',
	'magion': 'color7',
	'brigenta': 'color8',
	'greson': 'color9',
	'mmmsalmon': 'color10',
	'skyblue': 'color11',
	'toored': 'color12',
	'rozblue': 'color13',
	'legorange': 'color14',
	'lolight': 'color15',
};

const COLOR_NUM_MAP = {
	'gblue': 3,
	'purply': 1,
	'redish': 2,
	'yerange': 4,
	'wirple': 5,
	'pistagre': 6,
	'magion': 7,
	'brigenta': 8,
	'greson': 9,
	'mmmsalmon': 10,
	'skyblue': 11,
	'toored': 12,
	'rozblue': 13,
	'legorange': 14,
	'lolight': 15,
};

function get_color(color_name) {
	return COLOR_MAP[color_name] || 'color1';
}

function get_color_num(color_name) {
	return COLOR_NUM_MAP[color_name] || 'color1';
}

function color_validity(color, clr_array) {
	let user_color = color.replace("color", "");
	if (user_color == 6) user_color = 5;
	if (user_color == 5) user_color = 6;

	if (clr_array.includes(user_color)) return true;
	return false;
}

module.exports = {
	randomString,
	generateUniqueString,
	generateSecureString,
	isValid,
	get_color,
	get_color_num,
	color_validity,
};
