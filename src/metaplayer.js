Player = {
	ready: false,
	
	status: {
		food: 1000,
		money: 500,
		crew: 10
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

	init: function() {
		this.ready = true;

		this.updateStatus();
	}
}