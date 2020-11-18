const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
c.scale (1, 1);



var spirits = [];
//var incr = [];

function animate(){
	requestAnimationFrame(animate)
	spirits.forEach((spirit) => {
		spirit.move();
	})
}

function moveSpirit(s, target){
	requestAnimationFrame(function() {moveSpirit(s, target); });
	s.move(target);
}

function animateMove(s, incr, target){
	setTimeout(() => {
	    requestAnimationFrame(function() {animateMove(s, incr, target); });
	  }, 1000 / 60);
	
	c.clearRect(0, 0, canvas.width, canvas.height);
	s.update(incr);
	spirit2.draw();
	console.log('spirit position: [' + s.position[0] + ', ' + s.position[1] + ']');
	console.log('increment = ' + incr);
}

class Spirit {
	constructor(id, position, size, energy, sight){
		this.id = id
		this.position = position;
		this.size = size;
		this.energy = energy;
		
		this.sight = {
			'friends': [sight.friends]
		}
		
		
		//const properties
		this.hp = 1;
		this.move_speed = 1;
		this.energy_capacity = size * 10;	
	}
		
	draw() { 
		c.beginPath();
		c.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c.fill();
	}
	
	move(target) {
		var angle = Math.atan2(target[1] - this.position[1], target[0] - this.position[0]);
		var incr = [0, 0]
		incr[0] = (Math.round(Math.cos(angle) * 100) / 100);
		incr[1] = (Math.round(Math.sin(angle) * 100) / 100);
		animateMove(this, incr, target);
		
		//this.draw()
		//this.position[0] = target[0] + 10;
		//this.position[1] = target[1] + 10;
	}
	
	update(incr){
		this.draw();
		this.position[0] = Number((this.position[0] + incr[0]).toFixed(3));
		this.position[1] = Number((this.position[1] + incr[1]).toFixed(3));
	}
	
	
}

class Structure {
	constructor(id, type, position, size, sight){
		this.id = id;
		this.energy = Number.POSITIVE_INFINITY;
		
		this.sight = {
			'friends': [sight.friends]
		}
		
		
		//const properties
		this.type = type;
		this.position = position;
		this.size = size;
		this.energy_capacity = Number.POSITIVE_INFINITY;
		this.hp = Number.POSITIVE_INFINITY;
		this.move_speed = 0;
	}
}


var spirit1 = new Spirit('sp1', [150,120], 2, 10, {'friends': ['sp2', 'sp3']});
var spirit2 = new Spirit('sp1', [450,250], 20, 10, {'friends': ['sp2', 'sp3']});

spirit1.draw();
spirit2.draw();

spirits = [spirit1, spirit2];



