// Parallax component derived from code by coder78
// http://www.arg3.com/blog/2012/11/17/crafting-a-game-with-craftyjs
Crafty.c("Parallax", {
    init: function() {
        this.requires("2D, Canvas, Image")
        	.attr({
        		w: Crafty.viewport.width + Game.map_grid.tile.width*2,
        		h: Crafty.viewport.height + Game.map_grid.tile.height*2,
        		z: -15
        	})
        	.image('img/oceanTile.png', 'repeat');

        this.speed = 4;
    },

    setImage: function(img) {
    	this.image(img, 'repeat');
    },

    scrollOn: function(event) {
    	this.bind(event, this.scroll);
    },

    setSpeed: function(speed) {
        this.speed = speed;
        return this;
    },

    autoScroll: function() {
        this.bind("EnterFrame", function() {
            this.scroll();
        });
        this.autoScrolling = true;
    },

    getSpeed: function() {
        return this.speed;
    },

    scroll: function() {
    	this.previousX = this.x;
    	this.previousY = this.y;

    	this.x = -Crafty.viewport.x - Game.map_grid.tile.width;
    	this.y = -Crafty.viewport.y - Game.map_grid.tile.height;

    	// check if moving left or right
    	if (this.x > this.previousX) {
    		console.log('moving right');
    		this.x += this.speed + Game.map_grid.tile.width/2;
    	} else if (this.x < this.previousX) {
    		this.x -= this.speed;
    	}

    	// check if moving up or down
    	if (this.y > this.previousY) {
    		this.y += this.speed;
    	} else if (this.y < this.previousY) {
    		this.y -= this.speed;
    	}

    	// check to see if looping
        if (this.x + this.w - Game.map_grid.tile.width < -Crafty.viewport.x) {
        	console.log('falling behind on left');
            this.x = Crafty.viewport.width + -Crafty.viewport.x;
        }
        else if (this.x > Crafty.viewport.width + -Crafty.viewport.x) {
        	console.log('getting ahead on right');
            this.x = -this.w;
        }

        if (this.y + this.h - Game.map_grid.tile.height < -Crafty.viewport.y) {
            this.y = Crafty.viewport.height + -Crafty.viewport.y;
        }
        else if (this.y > Crafty.viewport.height + -Crafty.viewport.y) {
            this.y = -this.h;
        }
    }
});

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
			if (x >= 0 && y >= 0
				&& x < Game.map_grid.width
				&& y < Game.map_grid.height)
			this.attr({
				x: Game.findX(x),
				y: Game.findY(y)
			});

			return this;
		}
	}
});

Crafty.c('MapObject', {
	init: function() {
		this.requires('2D, Canvas, Grid, Mouse')
			.bind('Click', this.clickHandler);
	},

	clickHandler: function(e) {
		if (e.mouseButton == Crafty.mouseButtons.LEFT) {
			console.log(this.at().x, this.at().y,
					Game.neighbors(this.at().x, this.at().y));
		}
	}
});

Crafty.c('MapQuad', {
	init: function() {
		this.requires('Grid');

		this.quadrants = {
			upLeft: null,
			upRight: null,
			downLeft: null,
			downRight: null
		};

		this.quadrantCoords = {
			upLeft: {
				x: this.x,
				y: this.y
			},
			upRight: {
				x: this.x + (this.w/2),
				y: this.y
			},
			downLeft: {
				x: this.x,
				y: this.y + (this.h/2)
			},
			downRight: {
				x: this.x + (this.w/2),
				y: this.y + (this.h/2)
			}
		}
	},

	// TODO: Change these methods to take in a component list and use that to create the object,
	//		rather than taking in an actual object.
	setQuadrants: function(obj) {
		var toCreate = {};
		toCreate.upLeft = obj.upLeft? obj.upLeft : this.quadrants.upLeft;
		toCreate.upRight = obj.upRight? obj.upRight : this.quadrants.upRight;
		toCreate.downLeft = obj.downLeft? obj.downLeft : this.quadrants.downLeft;
		toCreate.downRight = obj.downRight? obj.downRight : this.quadrants.downRight;

		this.removeComponent('Solid');
		for (key in toCreate) {
			this.quadrants[key] = Crafty.e(toCreate[key]);
			if (!this.has('Solid') && this.quadrants[key].has('Solid'))
				this.addComponent('Solid');
		}

		return this.enforceQuadrantRestrictions();
	},

	setAllQuadrants: function(obj) {
		for (key in this.quadrants) {
			this.quadrants[key] = obj;
		}

		return this.enforceQuadrantRestrictions();
	},

	enforceQuadrantRestrictions: function() {
		this.quadrantCoords = {
			upLeft: {
				x: this.x,
				y: this.y
			},
			upRight: {
				x: this.x + (Game.map_grid.tile.width/2),
				y: this.y
			},
			downLeft: {
				x: this.x,
				y: this.y + (Game.map_grid.tile.height/2)
			},
			downRight: {
				x: this.x + (Game.map_grid.tile.width/2),
				y: this.y + (Game.map_grid.tile.height/2)
			}
		}

		// console.log("before", this.quadrants);
		for (key in this.quadrants) {
			// console.log(key);

			var q = this.quadrants[key];

			if (!q || !q.has || !q.has('MapObject')) {
				this.quadrants[key] = null;
			} else {
				// console.log("coords", key, this.quadrantCoords, this.quadrantCoords[key]);
				q.attr(this.quadrantCoords[key]);
				q.attr({
					w: this.w/2,
					h: this.h/2
				});
			}
		}
		// console.log("after", this.quadrants);

		/* test input:
		var asdf = Crafty.e('MapQuad').at(1,1).setQuadrants({
			upLeft: Crafty.e('Sand'),
			upRight: Crafty.e('Grass'),
			downLeft: Crafty.e('Rock'),
			downRight: Crafty.e('Island')
		});
		*/

		return this;
	}
});

Crafty.c('Island', {
	init: function() {
		this.requires('MapObject, spr_island, Solid');
	}
});

Crafty.c('Grass', {
	init: function() {
		this.requires('MapObject, Color, Solid')
			.color('rgb(100, 218, 100)');
	}
});

Crafty.c('Sand', {
	init: function() {
		this.requires('MapObject, Color, Solid')
			.color('#EDE291');
	}
});

Crafty.c('Port', {
	init: function() {
    	this.requires('Actor, spr_port');

    	this.metaDef = null;
  	},
 
	beVisited: function() {
		this.metaDef.beVisited();
	}
});

Crafty.c('PirateFortress', {
	init: function() {
		this.requires('Actor, spr_fortress');
	},

	spawnEnemy: function() {
		Crafty.e('Enemy').at(this.at().x, this.at().y);
	}
})

Crafty.c('Actor', {
	init: function() {
		this.requires('MapObject, Tween');

		this.attr({	
			speed: 100,
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


Crafty.c('Enemy', {
	init: function() {
		this.requires('Actor, spr_player')
			.bind('PlayerFinishMove', this.update)
			.bind('MoveFinished', this.checkSquare);

		this.turn = true;
		this.speed = 200;
	},

	checkSquare: function() {

	},

	update: function() {
		if (!this.turn) {
			this.turn = true;
			return;
		} else {
			this.turn = false;
		}
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

Crafty.c('PlayerShip', {
	init: function() {
		this.requires('Actor, Keyboard, spr_player')
			.bind('EnterFrame', this.update)
			.bind('MoveFinished', this.finishMove);

		this.controlsEnabled = true;
	},

	update: function() {
		target = {};

		if (this.isDown('W') || this.isDown('UP_ARROW')) {
			target.x = 0;
			target.y = -1;
		} else if (this.isDown('A') || this.isDown('LEFT_ARROW')) {
			target.x = -1;
			target.y = 0;
		} else if (this.isDown('S') || this.isDown('DOWN_ARROW')) {
			target.x = 0;
			target.y = 1;
		} else if (this.isDown('D') || this.isDown('RIGHT_ARROW')) {
			target.x = 1;
			target.y = 0;
		} else if (this.isDown('T')) {
			Crafty.scene('DuelNeural');
		} else if (this.isDown('V')) {
			Crafty.scene('GameOver', true);
		} else if (this.isDown('L')) {
			Crafty.scene('GameOver', false);
		} else if (this.isDown('ESC')) {
			Crafty.scene('PauseMenu');
		}

		if (target.x !== undefined && this.controlsEnabled) {
			if (this.canMove) {
				this.eatFood();

				Crafty.trigger('PlayerStartMove');
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
		Crafty.trigger('PlayerFinishMove');
	},

	checkSquare: function() {
		var objArray = Game.mapObjects[this.at().x][this.at().y];

		for (var i=0; i<objArray.length; i++) {
			if (objArray[i].has('Port')) {
				this.visitPort(objArray[i]);
			} else if (objArray[i].has('Enemy')) {
				this.touchEnemy(objArray[i]);
			} else if (objArray[i].has('PirateFortress')) {
				this.touchPirateFortress();
			}
		}
	},

	enableControls: function() {
		this.controlsEnabled = true;
	},

	disableControls: function() {
		this.controlsEnabled = false;
	},

	toggleControls: function() {
		if (this.controlsEnabled) {
			this.controlsEnabled = false;
		} else {
			this.controlsEnabled = true;
		}
	},

	eatFood: function() {
		Player.food(Player.food() - Player.crew()/2);

		if (Player.food() <= 0) {
			gui.notify({
				heading: "Out of food!",
				text: Math.ceil(Math.abs(Player.food())/2)
					+ " crew members starved to death.",
				type: "danger"
			});
			Player.crew(Player.crew() - Math.ceil(Math.abs(Player.food())/2));
			Player.food(0);
			if (Player.crew() <= 0) {
				Player.crew(0);
				Crafty.scene('GameOver', false);
			}
		}
	},

	visitPort: function(port) {
		port.beVisited();
	},

	touchEnemy: function(enemy) {
		World.save();
		Crafty.scene('Duel', enemy);
	},

	touchPirateFortress: function() {
		if (Game.numPrisonersLeft() > 0) {
			if (!confirm("You haven't rescued all your crewmates yet. Are you sure you want to continue?")) {
				return;
			}
		}

		if (confirm("Once you enter the fortress, there is no going back! You will either win the game or die inside. Are you sure you want to continue?"))
			Crafty.scene('PirateFortress');
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