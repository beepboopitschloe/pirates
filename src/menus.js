Crafty.c('MenuItem', {
	init: function() {
		this.requires('2D, Canvas, gui_btn, Mouse');
		this.text = null;
		this.action = function() { console.log("No action specified.") };
	},

	setMenu: function(m) {
		this.menu = m;
		this.bind('MouseOver', this.handleMouse);
		this.areaMap([this.x, this.y], [this.x+this.w, this.y], [this.x+this.w, this.y+this.h], [this.x, this.y+this.h]);
		console.log(this.mapArea);
		return this;
	},

	setText: function(obj) {
		var size;
		// this.text = Crafty.e('2D, DOM, Text')
		// 				.attr({
		// 					x: this.x,
		// 					y: this.y+10,
		// 					w: this.w,
		// 					h: this.h
		// 				})
		// 				.text(obj.text);
		// size = obj.size || '24px';

		// this.text.textFont({ size: size, family: 'Courier', weight: 'bold' });

		return this;
	},

	setAction: function(func) {
		this.action = func;

		return this;
	},

	select: function() {
		console.log(this.menu.options.indexOf(this));
		this.menu.select(this.menu.options.indexOf(this));
	},

	handleMouse: function(e) {
		this.select();
	}
});

Crafty.c('MenuSelector', {
	init: function() {
		this.requires('2D, Canvas, Keyboard, gui_selector, Mouse');
		this.offsetX = 175;
		this.offsetY = 12;
	},

	MenuSelector: function(menu) {
		this.menu = menu;

		this.attr({
			x: this.menu.x + this.offsetX,
			y: this.menu.y + this.offsetY
		});

		this.bind('KeyDown', this.handleKeys);
		this.bind('Click', function() { console.log('clicked'); });

		this.choice = menu.defaultOption;

		return this;
	},

	handleKeys: function() {
		if (this.isDown('W') || this.isDown('UP_ARROW')) {
			this.setChoice(this.choice - 1);
		} else if (this.isDown('S') || this.isDown('DOWN_ARROW')) {
			this.setChoice(this.choice + 1);
		} else if (this.isDown('ENTER')) {
			this.select();
		}
	},

	setChoice: function(optNum) {
		if (optNum >= this.menu.options.length) {
			this.choice = 0;
		} else if (optNum < 0) {
			this.choice = this.menu.options.length-1;
		} else {
			this.choice = optNum;
		}

		this.y = this.menu.y + (64*this.choice) + this.offsetY;
	},

	select: function() {
		this.menu.select(this.choice);
	}
});

Menu = function(x, y, options, defaultOption) {
	this.x = x || 0;
	this.y = y || 0;

	this.options = new Array(options.length);
	this.defaultOption = defaultOption || 0;

	this.controlOn = true;

	for (var i=0; i<options.length; i++) {
		var optStr = options[i].text,
			action = options[i].action;

		this.options[i] = Crafty.e('MenuItem')
							.attr({
								x: this.x,
								y: this.y + (64*i)
							})
							.setText(options[i])
							.setAction(action)
							.setMenu(this);
	}

	this.selector = Crafty.e('MenuSelector').MenuSelector(this);
}

Menu.prototype.toggleControl = function() {
	if (this.controlOn) {
		this.controlOn = false;
		this.selector.unbind('KeyDown', this.selector.handleKeys);
	} else {
		this.controlOn = true;
		this.selector.bind('KeyDown', this.selector.handleKeys);
	}
}

Menu.prototype.select = function(optNum) {
	if (optNum >= this.options.length || optNum < 0)
		return;

	else {
		this.options[optNum].action();
	}
}

Crafty.scene('MainMenu', function() {
	Crafty.e('2D, Canvas, gui_title')
		.attr({x: 0, y: 0});

	var options = [{
		text: 'New Game',
		action: function() {
			console.log(this);
			this.menu.toggleControl();
			ExpoHandler.intro();
		}
	}, {
		text: 'Load Game',
		action: function() {
			Crafty.scene('Game', true);
		}
	}]

	menu = new Menu(Game.viewportWidth()/8, Game.viewportHeight()/16*9, options);
});

Crafty.scene('PauseMenu', function() {
	Crafty.e('2D, Canvas, gui_title')
		.attr({x: 0, y: 0});

	var options = [{
		text: 'Resume',
		action: function() {
			Crafty.scene('Game', true);
		}
	}, {
		text: 'Main Menu',
		action: function() {
			Crafty.scene('MainMenu');
		}
	}]

	menu = new Menu(Game.viewportWidth()/8, Game.viewportHeight()/16*9, options);
});

Crafty.scene('PortMenu', function(port) {
	Crafty.e('2D, Canvas, gui_port')
		.attr({x: 0, y: 0});

	this.keyHandler = Crafty.e('Keyboard')
		.bind('KeyDown', function() {
			if (this.isDown('ESC')) {
				Crafty.scene('Game', true);
			}
		});

	var options = [{
		text: 'Visit the store',
		size: '16px',
		action: function() {
			Crafty.scene('PortStore', port);
		}
	}, {
		text: 'Try your luck in the fighting rings',
		size: '16px',
		action: function() {
			Crafty.scene('FightingRingMenu', {port: port});
		}
	}, {
		text: 'Return to sea',
		size: '16px',
		action: function() {
			Crafty.scene('Game', true);
		}
	}];

	console.log(port.hasPrisoner);
	if (port.hasPrisoner) {
		options.unshift({
			text: 'Look for your crewmate',
			size: '16px',
			action: function() {
				Crafty.scene('PrisonerDuel', port);
			}
		});
	}

	menu = new Menu(Game.viewportWidth()/8, Game.viewportHeight()/3 + 64, options);
});

Crafty.scene('PortStore', function(port) {
	Crafty.e('2D, Canvas, gui_store')
		.attr({x: 0, y: 0});

	var options = [{
		text: 'Buy 100 food for $100',
		size: '16px',
		action: function() {
			if (Player.money() >= 100) {
				Player.food(Player.food()+100);
				Player.money(Player.money()-100);
			}
		}
	}, {
		text: 'Hire 1 crew for $1500',
		size: '16px',
		action: function() {
			if (Player.money() >= 50) {
				Player.crew(Player.crew()+1);
				Player.money(Player.money()-50);
			}
		}
	}, {
		text: 'Back to port',
		size: '16px',
		action: function() {
			Crafty.scene('PortMenu', port);
		}
	}, {
		text: 'Return to sea',
		size: '16px',
		action: function() {
			Crafty.scene('Game', true);
		}
	}];

	menu = new Menu(Game.viewportWidth()/8, Game.viewportHeight()/3 + 64, options);
});

Crafty.scene('FightingRingMenu', function(data) {
	var port = data.port || null,
		level = data.level || 0,
		lost = data.lost || false,
		reward = 50 * (Math.pow(2, level)),
		options;

	Crafty.e('2D, Canvas, gui_fightingRingMenu')
		.attr({x: 0, y: 0});

	out = Crafty.e('2D, DOM, Text')
		.textFont({size: '24px', family: 'Courier', weight: 'bold'})
		.textColor('#ff1111')
		.attr({x: 64, y: 64, w: Game.viewportWidth()-128});

	if (!lost && level == 0) {
		out.text('Welcome to the fighting ring. To the victor go the spoils!')

		options = [{
			text: 'Bet $50 on yourself.',
			size: '16px',
			action: function() {
				if (Player.money() > 50) {
					Player.money(Player.money() - 50);
					Crafty.scene('FightingRing', {port: port, level: ++level});
				} else {
					gui.notify({
						type: 'warning',
						text: 'You don\'t have enough money to do that.'
					});
				}
			}
		}, {
			text: 'Return to port.',
			size: '16px',
			action: function() {
				Crafty.scene('PortMenu', port);
			}
		}]
	} else if (!lost && level > 0) {
		out.text('You have already won ' + (level) + ' fights and earned $' + reward + '.');

		options = [{
			text: 'Double or nothing!',
			size: '16px',
			action: function() {
				Crafty.scene('FightingRing', {port: port, level: ++level});
			}
		}, {
			text: 'Take your winnings and walk out.',
			size: '16px',
			action: function() {
				Player.money(Player.money() + reward);
				Crafty.scene('PortMenu', port);
			}
		}]
	} else {
		out.text('Nice try, greedy. Better luck next time!');

		options = [{
			text: 'Return to port, humbled.',
			size: '16px',
			action: function() {
				Crafty.scene('PortMenu', port);
			}
		}]
	}

	menu = new Menu(Game.viewportWidth()/8, Game.viewportHeight()/3*2, options);
});