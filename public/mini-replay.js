var MiniReplay = (function() {
	var W = 350;
	var H = 274;

	var VIEW_X_MIN = -900;
	var VIEW_X_MAX = 900;
	var VIEW_Y_MIN = -705;
	var VIEW_Y_MAX = 705;
	var VIEW_W = VIEW_X_MAX - VIEW_X_MIN;
	var VIEW_H = VIEW_Y_MAX - VIEW_Y_MIN;

	var SCALE = Math.min(W / VIEW_W, H / VIEW_H);
	var USED_W = VIEW_W * SCALE;
	var USED_H = VIEW_H * SCALE;
	var PAD_X = (W - USED_W) / 2;
	var PAD_Y = (H - USED_H) / 2;

	var BARRICADES = [[0, -200], [0, 200], [370, 0], [-370, 0]];
	var BARRICADE_R = 80;
	var PODS = [[-110, -300], [110, -300], [-260, 320], [260, 320], [-500, 84], [500, 84]];
	var POD_SIZE = 40;

	var COLOR_P1 = 'rgba(128,140,255,1)';
	var COLOR_P2 = 'rgba(232,97,97,1)';
	var COLOR_P1_BEAM = 'rgba(128,140,255,0.5)';
	var COLOR_P2_BEAM = 'rgba(232,97,97,0.5)';
	var COLOR_BARRICADE = 'rgba(255,255,255,0.2)';
	var COLOR_POD = 'hsla(130,99%,76%,0.12)';
	var COLOR_CIRCLE = 'hsla(1,100%,72%,0.12)';

	var TICK_MS = 40;
	var LAST_TICK_PAUSE_MS = 2000;
	var UNIT_R = 3;

	var CX = (0 - VIEW_X_MIN) * SCALE + PAD_X;
	var CY = (0 - VIEW_Y_MIN) * SCALE + PAD_Y;

	function toX(gx) { return (gx - VIEW_X_MIN) * SCALE + PAD_X; }
	function toY(gy) { return (gy - VIEW_Y_MIN) * SCALE + PAD_Y; }

	var LABEL_FONT = '600 11px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';

	function create(container, replayData, opts) {
		var dpr = window.devicePixelRatio || 1;

		var canvas = document.createElement('canvas');
		canvas.width = W * dpr;
		canvas.height = H * dpr;
		canvas.style.width = W + 'px';
		canvas.style.height = H + 'px';
		canvas.style.borderRadius = '12px';
		canvas.style.display = 'block';
		canvas.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)';

		container.appendChild(canvas);

		var ctx = canvas.getContext('2d');
		ctx.scale(dpr, dpr);

		var total = replayData.length;
		var tick = 0;
		var destroyed = false;
		var timer = null;

		var pl1 = replayData[0].pl1;
		var pl2 = replayData[0].pl2;
		var p1Name = (opts && opts.p1Name) || pl1;
		var p2Name = (opts && opts.p2Name) || pl2;

		var barricadeR = BARRICADE_R * SCALE;
		var podHalf = (POD_SIZE * SCALE) / 2;
		var podPx = POD_SIZE * SCALE;

		var bPos = [];
		for (var i = 0; i < BARRICADES.length; i++) {
			bPos.push([toX(BARRICADES[i][0]), toY(BARRICADES[i][1])]);
		}
		var pPos = [];
		for (var i = 0; i < PODS.length; i++) {
			pPos.push([toX(PODS[i][0]) - podHalf, toY(PODS[i][1]) - podHalf]);
		}

		function drawFrame() {
			if (destroyed) return;
			var f = replayData[tick];
			if (!f) return;

			ctx.clearRect(0, 0, W, H);
			ctx.fillStyle = '#111';
			ctx.fillRect(0, 0, W, H);

			// death circle
			if (f.cr != null) {
				var cr = f.cr * SCALE;
				ctx.save();
				ctx.beginPath();
				ctx.rect(0, 0, W, H);
				ctx.arc(CX, CY, cr, 0, Math.PI * 2, true);
				ctx.fillStyle = COLOR_CIRCLE;
				ctx.fill();
				ctx.restore();
			}

			// barricades
			ctx.strokeStyle = COLOR_BARRICADE;
			ctx.lineWidth = 1.5;
			for (var i = 0; i < bPos.length; i++) {
				ctx.beginPath();
				ctx.arc(bPos[i][0], bPos[i][1], barricadeR, 0, Math.PI * 2);
				ctx.stroke();
			}

			// pods
			ctx.fillStyle = COLOR_POD;
			ctx.strokeStyle = COLOR_POD;
			ctx.lineWidth = 1;
			for (var i = 0; i < pPos.length; i++) {
				ctx.beginPath();
				ctx.roundRect(pPos[i][0], pPos[i][1], podPx, podPx, 4);
				ctx.fill();
				ctx.stroke();
			}

			// position lookup for beams
			var posMap = {};
			for (var i = 0; i < f.p1.length; i++) {
				var u = f.p1[i];
				posMap[pl1 + '_' + u[0]] = [toX(u[1][0]), toY(u[1][1]), 1];
			}
			for (var i = 0; i < f.p2.length; i++) {
				var u = f.p2[i];
				posMap[pl2 + '_' + u[0]] = [toX(u[1][0]), toY(u[1][1]), 2];
			}

			// energy beams
			ctx.lineWidth = 1;
			if (f.e) {
				for (var i = 0; i < f.e.length; i++) {
					var src = posMap[f.e[i][0]];
					var tgt = posMap[f.e[i][1]];
					if (!src || !tgt) continue;
					ctx.strokeStyle = src[2] === 1 ? COLOR_P1_BEAM : COLOR_P2_BEAM;
					ctx.beginPath();
					ctx.moveTo(src[0], src[1]);
					ctx.lineTo(tgt[0], tgt[1]);
					ctx.stroke();
				}
			}

			// splash beams
			if (f.a) {
				for (var i = 0; i < f.a.length; i++) {
					var src = posMap[f.a[i][0]];
					var tgt = posMap[f.a[i][2]];
					if (!src || !tgt) continue;
					ctx.strokeStyle = src[2] === 1 ? COLOR_P1_BEAM : COLOR_P2_BEAM;
					ctx.beginPath();
					ctx.moveTo(src[0], src[1]);
					ctx.lineTo(tgt[0], tgt[1]);
					ctx.stroke();
				}
			}

			// units (alive only)
			ctx.fillStyle = COLOR_P1;
			for (var i = 0; i < f.p1.length; i++) {
				if (f.p1[i][3] !== 1) continue;
				ctx.beginPath();
				ctx.arc(toX(f.p1[i][1][0]), toY(f.p1[i][1][1]), UNIT_R, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.fillStyle = COLOR_P2;
			for (var i = 0; i < f.p2.length; i++) {
				if (f.p2[i][3] !== 1) continue;
				ctx.beginPath();
				ctx.arc(toX(f.p2[i][1][0]), toY(f.p2[i][1][1]), UNIT_R, 0, Math.PI * 2);
				ctx.fill();
			}

			// tick label (lower-left)
			ctx.font = '12px monospace';
			ctx.fillStyle = 'rgba(255,255,255,0.5)';
			var tickStr = '' + (tick + 1);
			ctx.fillText(tickStr, 8, H - 8);
			var tickW = ctx.measureText(tickStr).width;
			ctx.fillStyle = 'rgba(255,255,255,0.25)';
			ctx.fillText('/' + total, 8 + tickW, H - 8);

			// player names (upper-right)
			ctx.font = LABEL_FONT;
			ctx.textAlign = 'right';
			var sep = ' \u00b7 ';
			var sepW = ctx.measureText(sep).width;
			var p2W = ctx.measureText(p2Name).width;
			var x = W - 10;
			ctx.fillStyle = COLOR_P2;
			ctx.fillText(p2Name, x, 18);
			ctx.fillStyle = 'rgba(255,255,255,0.25)';
			ctx.fillText(sep, x - p2W, 18);
			ctx.fillStyle = COLOR_P1;
			ctx.fillText(p1Name, x - p2W - sepW, 18);
			ctx.textAlign = 'left';
		}

		function advance() {
			if (destroyed) return;
			tick++;
			if (tick >= total) {
				tick = 0;
				drawFrame();
				timer = setTimeout(advance, LAST_TICK_PAUSE_MS);
				return;
			}
			drawFrame();
			timer = setTimeout(advance, tick === total - 1 ? LAST_TICK_PAUSE_MS : TICK_MS);
		}

		drawFrame();
		timer = setTimeout(advance, TICK_MS);

		return {
			destroy: function() {
				destroyed = true;
				clearTimeout(timer);
				container.removeChild(canvas);
			}
		};
	}

	return { create: create };
})();
