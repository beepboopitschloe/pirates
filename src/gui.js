gui = {
	statusPanel: $("#status-panel"),
	statusBody: $("#status-body", this.statusPanel),
	container: $("#notifications"),
	controls: $('#controls', this.container),

	notifications: [],

	notify: function(obj) {
		var heading = obj.heading? obj.heading : '';
		var text = obj.text? obj.text : 'Empty notification.';
		var type = obj.type? obj.type : 'info';
		var dismissable = obj.dismissable? obj.dismissable : true;

		var notification = '<div class="alert alert-' + type + '">'
			+ heading + ' '
			+ text;

		if (dismissable) {
			notification += '<button type="button" class="close"'
				+ 'data-dismiss="alert" aria-hidden="true">&times;</button>'
		}

		notification += '</div>'

		var element = $($.parseHTML(notification));

		this.controls.after(element);

		this.notifications.push(element);

		if (this.notifications.length > 101) {
			$(this.notifications.shift()).remove();
		}
	},

	status: function(obj) {
		var money = obj.money? obj.money : 0;
		var food = obj.food? obj.food : 0;
		var crew = obj.crew? obj.crew : 0;

		var text = '<label>Money:</label> ' + money.toString()
			+ '<br />'
			+ '<label>Food:</label> ' + food.toString()
			+ '<br />'
			+ '<label>Crew:</label> ' + crew.toString();

		this.statusBody.empty();
		this.statusBody.append(text);
	},

	init: function() {
    	this.container.css("width", Game.width()/2);
    	this.container.css("height", Game.height());

		$('#dismiss-all', controls).click(function(t) {
			return function(e) {
				$('#dismiss-all', controls).blur();
				$('.alert', t.container).alert('close');

			}
		}(this));
	}
}