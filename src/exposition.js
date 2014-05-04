ExpoHandler = {
	introLines: [
		"Here's the lowdown. Your captain? Captured. By pirates. Your crew? Sold into slavery. By pirates. You were the first mate aboard the <em>HMS Thunderer</em>, but she's on the bottom of the ocean. Now, you sail on the rogue vessel <em>Avenging Princess</em>. What money you had stored up you've poured into this expedition: you are on a quest to gather your old crewmates and save your captain from the Pirate Fortress.",
	],

	tutorialLines :[
		"Basic controls- use WASD to move while in your ship, and press M to see the map.",
		"On the map you can see the location of several islands. On each of these islands is a city; and in each of these cities is a captive crewmate. Be careful, though- one of the islands is the Pirate Fortress, and you probably don't want to mess with that until you've got some muscle behind you.",
		"You'll notice that you have some resources at the right: Money, Food, and Crew. Money is pretty straightforward, you buy things with it. You can get more money by defeating pirates on the open sea or from the fighting pits in towns. Food is also pretty straightforward, you need it to live. Run out of food and your crew starves and dies. Crew, well, you need at least one crew member to operate the boat. Every fight you lose at sea or in the Pirate Fortress, you will lose a crew member. They are not easy to replace. You can rescue them from ports or take on new hires at the store for $1500 a pop. NOTE: you can't lose crew members during any fights in port, so don't be afraid to try the fighting pits and rescue missions!",
		"You're gonna do a lot of <b>fighting</b> in this game. It might take you a couple tries to get the hang of it, so don't worry if you lose a lot at first. When you start the fight, you have <em>control</em> of the battle. This means that you can attack. Press A for a high slash, D for a stab, and S for a low kick. If the enemy fails to parry you, they'll dodge away; first person to fall off the platform loses. If they successfully parry you, you'll lose control of the battle, meaning that you can only parry and not attack. The same buttons correspond to the same types of actions- press W to parry a high chop, D to parry a stab, S to parry a low kick.",
		"When you get to the <b>Pirate Fortress</b>, you can enter it just by going on top of it. Once inside, though, there's no going back. There are three levels to the fortress; if you can beat them all, you win the game, but if you lose a fight, you go back to level one and lose a crew member. Run out of crew members and you're done.",
		"Thanks for playing Tokidoki Pirate Panic. Please don't hesitate to send feedback to noahmuth (at) gmail.com!"
	],

	currentLine: -1,

	expoModal: $("#expo-modal"),
	expoBtn: $("#expo-next"),
	expoContainer: $("#expo-container"),

	intro: function() {
		this.expoModal.modal({backdrop: 'static', keyboard: true});
		this.expoModal.modal('show');

		if (this.currentLine == -1) {
			this.expoContainer.prop("innerHTML", this.introLines[0]);
		}

		this.expoBtn.on("click", this.nextLine.bind(this));

		this.expoModal.on("hidden.bs.modal", function() {Crafty.scene('Game')});
	},

	nextLine: function() {
		this.expoContainer.prop("innerHTML", this.tutorialLines[++this.currentLine]);

		if (this.currentLine == this.tutorialLines.length-1) {
			this.expoBtn.off("click");
			this.expoBtn.prop("innerHTML", "Done");
			this.expoBtn.on("click", function() {
				Crafty.scene('Game');
				this.expoModal.modal('hide');
			}.bind(this));
		}
	}
}