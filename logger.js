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
		this.hp = 1
		this.move_speed = 1;
		this.energy_capacity = size * 10;
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


var spirit1 = new Spirit('sp1', [3,2], 1, 10, {'friends': ['sp2', 'sp3']});
var spirit2 = new Spirit('sp2', [5,2], 1, 10, {'friends': ['sp1', 'sp3']});
var spirit3 = new Spirit('sp3', [5,4], 1, 10, {'friends': ['sp1', 'sp2']});

var star1 = new Structure('star1', 'star', [5,9], 100, {'friends': ['sp1', 'sp2', 'sp3']})

console.log(spirit1);


console.log(spirit2.position[0]);
console.log(spirit3.sight.friends);
console.log(star1);

