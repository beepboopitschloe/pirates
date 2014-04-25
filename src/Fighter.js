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
		this.requires('FighterCore')
			.bind('FighterAction', this.respond);

		this.speed = 500;
	},

	respond: function(data) {
		var fighter = data.fighter;

		if (fighter == this) {
			return;
		} else {
			this.delay(this.update, this.speed, 0);
		}
	},

	getAction: function() {
		var action = "";

		if (Math.random() > .5) {
			action = 'strikeHigh';
		} else {
			action = 'strikeMid';
		}

		return action;
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
				Crafty.scene('Game');
			
			this.update();
			this.canTakeInput = false;
			this.delay(function() {
				this.canTakeInput = true;
			}, this.turnSpeed, 0);
		}
	},

	getAction: function() {
		if (this.isDown('W')) {
			return this.actions[0];
		} else if (this.isDown('D')) {
			return this.actions[1];
		} else if (this.isDown('S')) {
			return this.actions[2];
		} else {
			return null;
		}
	}
});

Crafty.c('FighterCore', {
	init: function() {
		this.requires('2D, Canvas, spr_fighter_tmp, SpriteAnimation, Tween, Delay')
			.bind('FrameChange', this.frameChange)
			.bind('AnimationEnd', this.animationEnd)
			.bind('FighterAttackFrame', this.handleAttack)
			.bind('FighterAttackResolved', this.handleAttackResolution);

		this.turnSpeed = 250; // ms between actions
		this.leapSpeed = 25; // speed of popForward();
		this.dodgeLength = 64; // amount you are pushed back by a successful hit
		this.dodgeSpeed = 78;
		this.canAct = true;

		this.facing = 1; // -1 left, 1 right

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

		this.strikes = {
			strikeHigh: {
				speed: 550,
				pushMod: 2
			},
			strikeMid: {
				speed: 350,
				pushMod: .5
			},
			strikeLow: {
				speed: 450,
				pushMod: 1
			}
		};

		this.reel('Idle', 200, 0, 0, 1)
			.reel('strikeHigh', this.strikes.strikeHigh.speed, 0, 1, 2)
			.reel('dodgeHigh', 500, 2, 1, 1)
			.reel('strikeMid', this.strikes.strikeMid.speed, 0, 2, 2)
			.reel('dodgeMid', 550, 2, 2, 1)
			.reel('strikeLow', this.strikes.strikeLow.speed, 0, 3, 2)
			.reel('dodgeLow', 550, 2, 3, 1);
	},

	bestResponse: function(strike) {
		switch (strike) {
			case 0:
				return 3;
				break;
			case 1:
				return 4;
				break;
			case 2:
				return 5;
				break;
			case 3:
				return 2;
				break;
			case 4:
				return 1;
				break;
			case 5:
				return 0;
				break;
		}
	},

	frameChange: function(reel) {
		// handle necessary movements for certain animations
		//	eg, move 48 pixels forward for the last frame of a stab
		if (reel.id == 'strikeHigh') {
			if (reel.currentFrame == 1) {
				Crafty.trigger('FighterAttackFrame', {fighter: this, action: reel.id});
				this.tween({x: this.x+(12*this.facing)}, this.leapSpeed);
			}
		} else if (reel.id == 'strikeMid') {
			if (reel.currentFrame == 1) {
				Crafty.trigger('FighterAttackFrame', {fighter: this, action: reel.id});
				this.tween({x: this.x+(24*this.facing)}, this.leapSpeed);
			}
		} else if (reel.id == 'strikeLow') {
			if (reel.currentFrame == 1) {
				Crafty.trigger('FighterAttackFrame', {fighter: this, action: reel.id});
				this.tween({x: this.x+(24*this.facing)}, this.leapSpeed);
			}
		}
	},

	animationEnd: function(reel) {
		if (reel.id != 'Idle') {
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

			this.tween({x: this.x-(this.dodgeLength*this.facing)}, this.dodgeSpeed);
			this.canAct = false;
			this.one('TweenEnd', function() { this.canAct = true; }.bind(this));
			
			Crafty.trigger('FighterAttackResolved', {resolvedBy: this, action: action, result: 'dodged'});
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
			this.tween({x: this.x+(fighter.dodgeLength*this.facing)}, this.leapSpeed);
		} else if (result == 'parried') {

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

	update: function() {
		if (!this.canAct) {
			return;
		} else if (this.getAction) {
			var nextAction = this.getAction();
		} else {
			console.log("Fighter has no brain attached!");
		}

		switch(nextAction) {
			case 'strikeHigh':
				this.animate('strikeHigh');
				this.popForward();
				this.canAct = false;
				break;
			case 'strikeMid':
				this.animate('strikeMid');
				this.popForward();
				this.canAct = false;
				break;
			case 'strikeLow':
				this.animate('strikeLow');
				this.popForward();
				this.canAct = false;
				break;
			case 'parryHigh':

				break;
			case 'parryMid':

				break;
			case 'parryLow':

				break;
			default:
				return;
		}

		Crafty.trigger('FighterAction', { fighter: this, action: nextAction});
	}
});