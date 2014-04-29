Crafty.c('MenuItem', {
	init: function() {
		this.requires('2D, Canvas, gui_btn');
		this.text = null;
		this.action = function() { console.log("No action specified.") };
	},

	setText: function(obj) {
		var size;
		this.text = Crafty.e('2D, DOM, Text')
						.attr({
							x: this.x,
							y: this.y+10,
							w: this.w,
							h: this.h
						})
						.text(obj.text);

<<<<<<< HEAD
		this.text.textFont({ size: '24px', family: 'Courier', weight: 'bold' });
=======
		size = obj.size || '24px';

		this.text.textFont({ size: size, family: 'Courier', weight: 'bold' });
>>>>>>> origin/master

		return this;
	},

	setAction: function(func) {
		this.action = func;

		return this;
	}
});

Crafty.c('MenuSelector', {
	init: function() {
		this.requires('2D, Canvas, Keyboard, gui_selector');
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

		this.choice = menu.defaultOption;

		return this;
	},

	handleKeys: function() {
		if (this.isDown('W')) {
			this.setChoice(this.choice - 1);
		} else if (this.isDown('S')) {
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

	for (var i=0; i<options.length; i++) {
		var optStr = options[i].text,
			action = options[i].action;

		this.options[i] = Crafty.e('MenuItem')
							.attr({
								x: this.x,
								y: this.y + (64*i)
							})
							.setText(options[i])
							.setAction(action);
	}

	this.selector = Crafty.e('MenuSelector').MenuSelector(this);
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
			Crafty.scene('Game');
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
			Crafty.scene('PortStore', this);
		}
	}, {
		text: 'Look for trouble',
		size: '16px',
		action: function() {
			Crafty.scene('Duel', Crafty.e('Enemy'))
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
		text: 'Hire 1 crew for $50',
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
})
