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
			action = 'strikeLow';
		} else {
			action = 'strikeMid';
		}

		console.log(action);
		return action;
	}
});

Crafty.c('FighterBrainPlayer', {
	init: function() {
		this.requires('FighterCore, Keyboard')
			.bind('KeyDown', this.handleKeys);

		this.speed = 250;
		this.canAct = true;
	},

	handleKeys: function() {
		if (this.canAct) {
			this.update();
			this.canAct = false;
			this.delay(function() {
				this.canAct = true;
			}, this.speed, 0);
		}
	},

	getAction: function() {
		if (this.isDown('W')) {
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
			.reel('Idle', 200, 0, 0, 1)
			.reel('Punch', 300, 0, 1, 2)
			.reel('Kick', 300, 3, 1, 2)
			.reel('OnHit', 200, 0, 3, 1)
			.reel('Die', 200, 3, 3, 1)
			.bind('AnimationEnd', this.animationEnd);

		this.speed = 100; // ms between actions

		this.facing = 1; // -1 left, 1 right

		this.actions = [
			'strikeHigh',
			'strikeMid',
			'strikeLow',
			'parryHigh',
			'parryMid',
			'parryLow'
		];
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

	animationEnd: function(data) {
		this.animate('Idle', this.animationSpeed, 1);
	},

	popForward: function() {
		this.tween({
			x: this.x+32*this.facing
		}, 50);

		this.one('TweenEnd', this.popBackward);
	},

	popBackward: function() {
		this.tween({
			x: this.x+32*this.facing*-1
		}, 50);
	},

	update: function() {
		if (this.getAction) {
			var nextAction = this.getAction();
		} else {
			console.log("Fighter has no brain attached!");
		}

		switch(nextAction) {
			case 'strikeHigh':

				break;
			case 'strikeMid':
				this.animate('Punch');
				this.popForward();
				break;
			case 'strikeLow':
				this.animate('Kick');
				this.popForward();
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