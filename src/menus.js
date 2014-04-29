Crafty.c('MenuItem', {
	init: function() {
		this.requires('2D, Canvas, gui_btn');
		this.text = null;
		this.action = function() { console.log("No action specified.") };
	},

	setText: function(text) {
		this.text = Crafty.e('2D, DOM, Text')
						.attr({
							x: this.x,
							y: this.y+10,
							w: this.w,
							h: this.h
						})
						.text(text);

		this.text.textFont({ size: '24px', family: 'Courier', weight: 'bold' });

		return this;
	},

	setAction: function(func) {
		this.action = func;

		return this;
	}
});

Crafty.c('MenuSelector', {
	init: function() {
		this.requires('2D, Canvas, gui_selector');
	}
});

Menu = function(x, y, options, defaultOption) {
	this.startX = x || 0;
	this.startY = y || 0;

	this.options = new Array(options.length);
	this.defaultOption = defaultOption || 0;

	for (i in options) {
		var optStr = options[i].text,
			action = options[i].action;

		this.options[i] = Crafty.e('MenuItem')
							.attr({
								x: this.startX,
								y: this.startY + (64*i)
							})
							.setText(optStr);
	}
}

Crafty.scene('MainMenu', function() {
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
}, function() {

});