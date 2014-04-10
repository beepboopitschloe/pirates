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
	  		//this.color('rgb(100, 100, 100)');
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
			.bind('MoveFinished', this.checkSquare);
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
				this.tweenMove(target.x, target.y);
			} else if (this.moveQueue.target
						&& this.moveQueue.target.x != target.x
						&& this.moveQueue.target.y != target.y) {
				this.moveQueue.full = true;
				this.moveQueue.target = target;
			}
		}
	},

	checkSquare: function() {
		var objArray = Game.mapObjects[this.at().x][this.at().y];

		for (var i=0; i<objArray.length; i++) {
			if (objArray[i].has('Port'))
				this.visitPort(objArray[i]);
			else if (objArray[i].has('Enemy'))
				this.touchEnemy(objArray[i]);
		}
	},

	visitPort: function(port) {
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