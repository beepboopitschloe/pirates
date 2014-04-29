Port = function(entity) {
	this.x = entity.at().x || -1;
	this.y = entity.at().y || -1;

	this.entity = entity;
	entity.metaDef = this;

	this.visited = false;
	this.hasPrisoner = true;
}

Port.prototype.setEntity = function(entity) {
	this.entity = entity;
	entity.metaDef = this;
}

Port.prototype.beVisited = function() {
	this.visited = true;
	Crafty.scene('PortMenu', this);
}