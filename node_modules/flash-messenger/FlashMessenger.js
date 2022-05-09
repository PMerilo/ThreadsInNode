'use strict';
var Alert = require('./Alert');

class FlashMessenger {

	constructor(storage) {
		this._storage = storage;
		if (!this._storage.flashMessengerAlerts) {
			this._storage.flashMessengerAlerts = [];
		}
		else {
			var alerts = [];
			this._storage.flashMessengerAlerts.forEach(item => {
				let alert = new Alert(item._title, item._type);
				alert.canBeDismissed = item.canBeDismissed;
				alert.titleIcon = item.titleIcon;
				alert._messages = item._messages;
				alerts.push(alert);
			});
			this._storage.flashMessengerAlerts = alerts;
		}

	}

	flushStorage() {
		this._storage.flashMessengerAlerts = undefined;
	}


	add(alert) {
		if (Alert.prototype.isPrototypeOf(alert)) {
			this._storage.flashMessengerAlerts.push(alert);
			return this;
		}
		else {
			throw new Error('addMessage need an alert object as parameter');
		}
	}

	/**
	 * returns copy of alerts
	 * @returns {Array.<*>}
	 */
	get alerts() {
		return this._storage.flashMessengerAlerts;
	}

	get alertsBeforeFlush(){
		let myAlerts = this.alerts;
		this.flushStorage();
		return myAlerts;
	}

	/**
	 *
	 * @param title
	 * @returns {Alert}
	 */
	info(title) {
		var alert = Alert.info(title);
		this.add(alert);
		return alert;
	}

	/**
	 *
	 * @param title
	 * @returns {Alert}
	 */
	error(title) {
		var alert = Alert.error(title);
		this.add(alert);
		return alert;
	}

	/**
	 *
	 * @param title
	 * @returns {Alert}
	 */
	danger(title) {
		var alert = Alert.danger(title);
		this.add(alert);
		return alert;
	}

	/**
	 *
	 * @param title
	 * @returns {Alert}
	 */
	success(title) {
		var alert = Alert.success(title);
		this.add(alert);
		return alert;
	}

}

module.exports = FlashMessenger;