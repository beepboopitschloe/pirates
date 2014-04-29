Crafty.c('FighterBrainNeural', {
	init: function() {
		this.requires('FighterCore, Keyboard')
			.bind('KeyDown', this.keys)
			.bind('FighterAction', this.respond);

		this.inputs = [0, 0, 0];

		this.brain = new NeuralNet();

		this.outText = Crafty.e('2D, DOM, Text')
			.text('Fighter output')
			.css('text-align', 'center')
			.textFont({size: '20px'})
			.attr({
				x:0,
				y:Game.height()/2 - 24,
				w: Game.width()
			});
	},

	trainAgainstCurrentInput: function() {
		for (var i=0; i<100; i++) {
			this.update();
		}
	},

	keys: function() {
		if (this.isDown('SPACE')) {
			this.update();
		} else if (this.isDown('SHIFT')) {
			this.trainAgainstCurrentInput();
		}
	},

	respond: function(data) {
		var fighter = data.fighter;

		if (fighter == this) {
			return;
		}

		this.inputs.unshift(this.actions.indexOf(data.action));
		this.inputs.pop();
		this.update();
	},

	getAction: function() {
		var outStr = '';

		outStr += 'Previous strikes: ' + this.actions[this.inputs[1]]
				 + ', ' + this.actions[this.inputs[2]] + '.';
		outStr += ' Current strike: ' + this.actions[this.inputs[0]];

		outStr += '  Outputs: '

		var outputs = this.brain.update(this.inputs);

		var strongestOutput = 0;
		var strongest = 0;
		var msg = 'OUTPUTS';
		for (var i=0; i<outputs.length; i++) {
			if (outputs[i] > strongest) {
				strongestOutput = i;
				strongest = outputs[i];
			}

			msg += '<br />' + i + ': ' + outputs[i];
		}

		gui.notify({text: msg});

		outStr += this.actions[strongestOutput];
		outStr += ', ' + strongest.toFixed(2) + ', ' + strongestOutput;

		this.outText.text(outStr);

		if (strongestOutput == this.bestResponse(this.inputs[0])) {
			this.brain.reward(outputs, 10);
		} else {
			this.brain.reward(outputs, -1);
		}

		return this.actions[strongestOutput];
	}
});

Crafty.c('FighterBrainRandom', {
	init: function() {
		this.requires('FighterCore');

		this.speed = 250;
		this.baseAttackSpeed = 800; // 625 better?

		this.setupSpeed();

		this.interval = setInterval(this.update.bind(this), this.speed);
	},

	respond: function(data) {
		var fighter = data.fighter;

		if (fighter == this) {
			return;
		} else {
			this.delay(this.update, this.speed, 0);
		}
	},

	controlShift: function() {
		this.controlsCombat = !this.controlsCombat;
		clearInterval(this.interval);

		if (this.controlsCombat) {
			this.interval = setInterval(this.update.bind(this), this.speed);
		} else {
			this.interval = setInterval(this.update.bind(this), 500); // 500 ms is the speed of a parry animation
		}
	},

	getAction: function() {
		var action = "";

		rand = Math.random();

		if (this.controlsCombat) {
			if (rand < .33) {
				action = 'strikeHigh';
			} else if (rand > .33 && rand < .66) {
				action = 'strikeMid';
			} else {
				action = 'strikeLow';
			}
		} else {
			if (rand < .33) {
				action = 'parryHigh';
			} else if (rand > .33 && rand < .66) {
				action = 'parryMid';
			} else {
				action = 'parryLow';
			}
		}

		return 'parryHigh';
	}
});

Crafty.c('FighterBrainPlayer', {
	init: function() {
		this.requires('FighterCore, Keyboard')
			.bind('KeyDown', this.handleKeys);

		this.canTakeInput = true;
	},

	handleKeys: function() {
		if (this.canTakeInput) {
			if (this.isDown('G'))
				Crafty.scene('Game', true);
			
			this.update();
			this.canTakeInput = false;
			this.delay(function() {
				this.canTakeInput = true;
			}, this.turnSpeed, 0);
		}
	},

	controlShift: function() {
		this.controlsCombat = !this.controlsCombat;
	},

	getAction: function() {
		var action = '';

		if (this.controlsCombat)
			action = 'strike';
		else
			action = 'parry';

		if (this.isDown('W')) {
			action = action + 'High';
		} else if (this.isDown('D')) {
			action = action + 'Mid';
		} else if (this.isDown('S')) {
			action = action + 'Low';
		} else {
			return null;
		}

		return action;
	}
});

Crafty.c('FighterCore', {
	init: function() {
		this.requires('2D, Canvas, spr_fighter_tmp, SpriteAnimation, Tween, Delay')
			.bind('FrameChange', this.frameChange)
			.bind('AnimationEnd', this.animationEnd)
			.bind('TweenEnd', this.handleFall)
			.bind('FighterAttackFrame', this.handleAttack)
			.bind('FighterAttackResolved', this.handleAttackResolution);

		this.turnSpeed = 1; // ms between actions
		this.leapSpeed = 25; // speed of popForward();
		this.baseAttackSpeed = 500;
		this.stunLength = 500;
		this.stunned = false;
		this.dodgeLength = 64; // amount you are pushed back by a successful hit
		this.dodgeSpeed = 100;
		this.canAct = true;
		this.dead = false;

		this.facing = 1; // -1 left, 1 right

		this.controlsCombat = false;

		this.actions = [
			'strikeHigh',
			'strikeMid',
			'strikeLow',
			'parryHigh',
			'parryMid',
			'parryLow'
		];

		this.vulnerableArea = {
			left: function() {
				return this.x+(32*this.facing);
			}.bind(this),
			right: function() {
				return this.x+(80*this.facing);
			}.bind(this),
			top: function() {
				return this.y;
			}.bind(this),
			bottom: function() {
				return this.y+this.h;
			}.bind(this),
			contains: function(x, y) {
				if (this.facing == 1) {
					// console.log(x, this.vulnerableArea.left(), this.vulnerableArea.right());
					return (x < this.vulnerableArea.right());
				} else if (this.facing == -1) {
					return (x > this.vulnerableArea.right());
				} else {
					return false;
				}
			}.bind(this)
		};

		this.strikeZones = {
			'strikeHigh': function() {
				return {x: this.x+(28*this.facing), y: this.y+9};
			}.bind(this),
			'strikeMid': function() {
				return {x: this.x+(22*this.facing), y: this.y+18};
			}.bind(this),
			'strikeLow': function() {
				return {x: this.x+(31*this.facing), y: this.y+27};
			}.bind(this),
		};

		this.setupSpeed();
	},

	setupSpeed: function() {
		this.strikes = {
			strikeHigh: {
				speed: this.baseAttackSpeed * 1.25,
				pushMod: 2
			},
			strikeMid: {
				speed: this.baseAttackSpeed * .75,
				pushMod: .5
			},
			strikeLow: {
				speed: this.baseAttackSpeed,
				pushMod: 1
			}
		};

		this.setupAnimations();
	},

	setupAnimations: function() {
		this.reel('Idle', 200, 0, 0, 1)
			.reel('strikeHigh', this.strikes.strikeHigh.speed, 0, 1, 2)
			.reel('dodgeHigh', 550, 2, 1, 1)
			.reel('parryHigh', 500, 3, 1, 1)
			.reel('strikeMid', this.strikes.strikeMid.speed, 0, 2, 2)
			.reel('dodgeMid', 550, 2, 2, 1)
			.reel('parryMid', 500, 3, 2, 1)
			.reel('strikeLow', this.strikes.strikeLow.speed, 0, 3, 2)
			.reel('dodgeLow', 550, 2, 3, 1)
			.reel('parryLow', 500, 3, 3, 1);
	},

	bestResponse: function(action) {
		switch (action) {
			case 'strikeHigh':
				return 'parryHigh';
				break;
			case 'strikeMid':
				return 'parryMid';
				break;
			case 'strikeLow':
				return 'parryLow';
				break;
			case 'parryHigh':
				return 'strikeLow';
				break;
			case 'parryMid':
				return 'strikeHigh';
				break;
			case 'parryLow':
				return 'strikeLow';
				break;
		}
	},

	frameChange: function(reel) {
		// handle necessary movements for certain animations
		//	eg, move 48 pixels forward for the last frame of a stab
		var eventData = { fighter: this, action: reel.id, parry: false };
		if (this.parried) {
			eventData.parry = true;
			this.parried = false;

			setTimeout(function() {this.canAct = true;}.bind(this), this.turnSpeed);
		}

		if (reel.id == 'strikeHigh') {
			if (reel.currentFrame == 1) {
				Crafty.trigger('FighterAttackFrame', eventData);
				this.tween({x: this.x+(12*this.facing)}, this.leapSpeed);
			}
		} else if (reel.id == 'strikeMid') {
			if (reel.currentFrame == 1) {
				Crafty.trigger('FighterAttackFrame', eventData);
				this.tween({x: this.x+(24*this.facing)}, this.leapSpeed);
			}
		} else if (reel.id == 'strikeLow') {
			if (reel.currentFrame == 1) {
				Crafty.trigger('FighterAttackFrame', eventData);
				this.tween({x: this.x+(24*this.facing)}, this.leapSpeed);
			}
		}
	},

	animationEnd: function(reel) {
		if (reel.id != 'Idle' && !this.stunned) {
			this.animate('Idle', 1);
			setTimeout(function() {
				this.canAct = true;
			}.bind(this), this.turnSpeed);
		}
	},

	handleAttack: function(data) {
		if (data.fighter == this) {
			return;
		}

		var fighter = data.fighter,
			action = data.action,
			strikePnt = fighter.strikeZones[action]();

		if (!this.vulnerableArea.contains(strikePnt.x, strikePnt.y))
			return;

		if (action.indexOf('strike') > -1) {
			if (this.getReel() && this.getReel().id == this.bestResponse(action)) {
				Crafty.trigger('FighterAttackResolved', {resolvedBy: this, action: action, result: 'parried'});
				this.parried = true;
				this.animate('strikeHigh');
			} else {
				switch(action) {
					case 'strikeHigh':
						this.animate('dodgeHigh');
						break;
					case 'strikeMid':
						this.animate('dodgeMid');
						break;
					case 'strikeLow':
						this.animate('dodgeLow');
						break;
				}

				var target = {x: this.x-(this.dodgeLength*this.facing)};
				if (data.parry) {
					target.x -= (this.dodgeLength*this.facing)/2;
				}

				this.tween(target, this.dodgeSpeed);
				this.canAct = false;
				this.one('TweenEnd', function() { this.canAct = true; }.bind(this));

				Crafty.trigger('FighterAttackResolved', {resolvedBy: this, action: action, result: 'dodged'});
			}
		} else {
			console.log(action);
		}
	},

	handleAttackResolution: function(data) {
		if (data.resolvedBy == this)
			return;

		var fighter = data.resolvedBy,
			action = data.action,
			result = data.result;

		if (result == 'dodged') {
			console.log('dodged');
			setTimeout(function() {
				var targetX;
				if (this.x > fighter.x) {
					targetX = this.x - (this.x - (fighter.x - fighter.dodgeLength) - this.w);
				} else {
					targetX = this.x + ((fighter.x + fighter.dodgeLength) - this.x - this.w);
				}

				this.tween({x: targetX}, this.leapSpeed);
			}.bind(this), 1);
		} else if (result == 'parried') {
			this.controlShift();
			fighter.controlShift();
			this.stunned = true;
			setTimeout(function() {this.stunned = false}.bind(this), this.stunLength);
		}
	},

	popForward: function() {
		this.popStart = {x: this.x};
		this.tween({
			x: this.x+32*this.facing
		}, this.leapSpeed);
	},

	popBackward: function() {
		if (!this.popStart || !this.popStart.x) {
			this.popStart = {x: this.x+32*this.facing-1};
		}

		this.tween(this.popStart, (this.leapSpeed/3)*2);
	},

	isFalling: function() {
		if (this.facing == 1) {
			if (this.x + this.w < Game.duelStage.x)
				return true;
		} else if (this.facing == -1) {
			if (this.x > Game.duelStage.x + Game.duelStage.w)
				return true;
		}

		return false;
	},

	handleFall: function() {
		if (!this.isFalling()) {
			return;
		}

		this.dead = true;

		this.tween({
			x: this.x + (this.facing * 32),
			y: Game.viewportHeight() + this.h,
			rotate: 180
		}, 800);

		setTimeout(function() {
			Crafty.trigger('FighterLost', this);
		}.bind(this), 500);
	},

	update: function() {
		if (!this.canAct || this.stunned || this.dead) {
			// console.log("stunned?", this.stunned);
			return;
		} else if (this.getAction) {
			var nextAction = this.getAction();
			if (!nextAction) return;
		} else {
			console.log("Fighter has no brain attached!");
		}

		if (nextAction.indexOf('strike') > -1 && this.controlsCombat) {
			this.animate(nextAction);
			this.popForward();
			this.canAct = false;
		} else if (nextAction.indexOf('parry') > -1 && !this.controlsCombat) {
			this.animate(nextAction);
			this.canAct = false;
		}

		Crafty.trigger('FighterAction', { fighter: this, action: nextAction});
	}
});