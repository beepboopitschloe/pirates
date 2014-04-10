Crafty.c('Grid', {
	init: function() {
		this.attr({
			w: Game.map_grid.tile.width,
			h: Game.map_grid.tile.height,
			margin: Game.map_grid.tile.margin,
			fillMargins: false
		})
	},

	toggleMargin: function() {
		if (this.fillMargins) {
			this.fillMargins = false;
			this.attr({
				x: this.x + this.margin,
				y: this.y + this.margin,
				w: this.w - this.margin,
				h: this.h - this.margin,
			});
		} else {
			this.fillMargins = true;
			this.attr({
				x: this.x - this.margin,
				y: this.y - this.margin,
				w: this.w + this.margin*2,
				h: this.h + this.margin*2
			});
		}

		return this;
	},

	at: function(x, y) {
		if (x === undefined && y === undefined) {
			return Game.toGrid(this.x, this.y);
		} else {
			this.attr({
				x: Game.findX(x),
				y: Game.findY(y)
			});

			return this;
		}
	}
});

Crafty.c('Actor', {
	init: function() {
		this.requires('2D, Canvas, Grid, Tween');

		this.attr({
			speed: 200,
			moveQueue: {
				full: false,
				target: null
			},
			canMove: true
		});

		this.bind('TweenEnd', function() {
			this.canMove = true;
			this.trigger('MoveFinished');

			Game.mapObjects[this.at().x][this.at().y].push(this);

			if (this.moveQueue.full) {
				this.moveQueue.full = false;
				this.tweenMove(this.moveQueue.target.x, this.moveQueue.target.y);
			}
		});
	},
 
	tweenMove: function(dx, dy) {
		if (!this.canMove || !Game.validMove(this.at().x+dx, this.at().y+dy)) {
			return;
		}

		this.canMove = false;

		Game.mapObjects[this.at().x][this.at().y].remove(this);

		if (this.fillMargins) {
			this.tween({
				x: this.x + (this.w*dx),
				y: this.y + (this.h*dy)
			}, this.speed);
		} else {
			this.tween({
				x: this.x + (this.w*dx)+(this.margin*dx),
				y: this.y + (this.h*dy)+(this.margin*dy)
			}, this.speed);
		}
	},
});

Crafty.c('Rock', {
	init: function() {
		this.requires('Actor, spr_rock, Solid');
	}
});

Crafty.c('Island', {
	init: function() {
		this.requires('Actor, spr_island, Solid');
	}
});

Crafty.c('Port', {
	init: function() {
    	this.requires('Actor, spr_port');

    	this.collected = false;
  	},
 
	collect: function() {
		if (!this.collected) {
	  		this.collected = true;
	  		this.destroy();
	  		Crafty.trigger('PortVisited', this);
	  	}
	}
});

Crafty.c('Enemy', {
	init: function() {
		this.requires('Actor, spr_player')
			.bind('MoveFinished', this.checkSquare);

		var that = this;
		this.updateLoop = setInterval(function() {
			that.update()
		}, 750);
	},

	checkSquare: function() {

	},

	update: function() {
		target = {
			x:0,
			y:0
		};

		if (Math.random() > 0.5) {
			if (Math.random() > 0.5) {
				target.x = 1;
			} else {
				target.x = -1;
			}
		} else {
			if (Math.random() > 0.5) {
				target.y = 1;
			} else {
				target.y = -1;
			}
		}

		if (target.x !== undefined) {
			if (this.canMove) {
				this.tweenMove(target.x, target.y);
			} else if (this.moveQueue.target
						&& this.moveQueue.target.x != target.x
						&& this.moveQueue.target.y != target.y) {
				this.moveQueue.full = true;
				this.moveQueue.target = target;
			}
		}
	}
});

Crafty.c('PlayerCharacter', {
	init: function() {
		this.requires('Actor, Keyboard, spr_player')
			.bind('EnterFrame', this.update)
			.bind('PortVisited', function() { console.log("visit") })
			.bind('MoveFinished', this.finishMove);

		this.updateStatus({
			money: 0,
			food: 1000,
			crew: 10
		});
	},

	update: function() {
		target = {};

		if (this.isDown('W')) {
			target.x = 0;
			target.y = -1;
		} else if (this.isDown('A')) {
			target.x = -1;
			target.y = 0;
		} else if (this.isDown('S')) {
			target.x = 0;
			target.y = 1;
		} else if (this.isDown('D')) {
			target.x = 1;
			target.y = 0;
		} else if (this.isDown('V')) {
			Crafty.scene('GameOver', true);
		}

		if (target.x !== undefined) {
			if (this.canMove) {
				this.eatFood();

				this.tweenMove(target.x, target.y);
			} else if (this.moveQueue.target
						&& this.moveQueue.target.x != target.x
						&& this.moveQueue.target.y != target.y) {
				this.moveQueue.full = true;
				this.moveQueue.target = target;
			}
		}
	},

	finishMove: function() {
		this.checkSquare();
	},

	checkSquare: function() {
		var objArray = Game.mapObjects[this.at().x][this.at().y];

		for (var i=0; i<objArray.length; i++) {
			if (objArray[i].has('Port')) {
				this.visitPort(objArray[i]);
			}
			else if (objArray[i].has('Enemy')) {
				this.touchEnemy(objArray[i]);
			}
		}
	},

	money: function(num) {
		if (num === undefined) {
			return this.status.money;
		} else {
			this.updateStatus({
				money: num
			});
		}
	},

	food: function(num) {
		if (num === undefined) {
			return this.status.food;
		} else {
			this.updateStatus({
				food: num
			});
		}
	},

	crew: function(num) {
		if (num === undefined) {
			return this.status.crew;
		} else {
			this.updateStatus({
				crew: num
			});
		}
	},

	updateStatus: function(obj) {
		if (this.status === undefined) {
			this.status = {
				money: 0,
				food: 0,
				crew: 0
			}
		}

		this.status.money = obj.money !== undefined? Math.floor(obj.money)
								: this.status.money;
		this.status.food = obj.food !== undefined? Math.floor(obj.food)
								: this.status.food;
		this.status.crew = obj.crew !== undefined? Math.floor(obj.crew)
								: this.status.crew;

		gui.status({
			money: this.status.money,
			food: this.status.food,
			crew: this.status.crew
		});
	},

	eatFood: function() {
		this.food(this.food() - this.crew()/2);

		if (this.food() <= 0) {
			gui.notify({
				heading: "Out of food!",
				text: Math.ceil(Math.abs(this.food())/2)
					+ " crew members starved to death.",
				type: "danger"
			});
			this.crew(this.crew() - Math.ceil(Math.abs(this.food())/2));
			this.food(0);
			if (this.crew() <= 0) {
				this.crew(0);
				Crafty.scene('GameOver', false);
			}
		}
	},

	visitPort: function(port) {
		this.food(this.food()+5);
		port.collect();
	},

	touchEnemy: function(enemy) {
		if (Math.random() > 0.5) {
			this.destroy();
			Crafty.scene('GameOver', false);
		} else {
			enemy.destroy();
			Crafty.scene('GameOver', true);
		}
	},

	// Registers a stop-movement function to be called when
	//  this entity hits an entity with the "Solid" component
	stopOnSolids: function() {
    	this.onHit('Solid', this.stopMovement);
    	return this;
 	},
 
  // Stops the movement
	stopMovement: function() {
		this._speed = 0;
		if (this._movement) {
			this.x -= this._movement.x;
			this.y -= this._movement.y;
		}

		return this;
	}
});