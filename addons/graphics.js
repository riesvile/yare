var channel = channels.get('graphics');

class Graphics {
	static set style(s) {
		channel.send(['st', s]);
	}
	static set linewidth(w) {
		channel.send(['lw', w]);
	}

	static circle(pos, r) {
		channel.send(['c', pos[0], pos[1], r]);
	}
	static line(start, end) {
		channel.send(['l', start[0], start[1], end[0], end[1]]);
	}
    static rect(tl, size) {
		channel.send(['s', tl[0], tl[1], size[0], size[1]]);
	}
}

global.graphics = Graphics;