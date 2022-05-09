'use strict';

const TYPE_ERROR = 'error';
const TYPE_INFO = 'info';
const TYPE_DANGER = 'danger';
const TYPE_SUCCESS = 'success';

class Alert {

    /**
     *
     * @param type
     * @param title
     */
    constructor(title, type) {
        if (title) {
            title = title.toString();
        }

        if (title.length === 0) {
            throw new Error('Title must be set at least 1 character.');
        }


        this._title = title;
        this._messages = [];
        this.titleIcon = null;
        this.canBeDismissed = false;
        this._type = type || TYPE_INFO;

    }

    static info(title) {
        return new Alert(title, TYPE_INFO);
    }

    static danger(title) {
        return new Alert(title, TYPE_DANGER);
    }

    static error(title) {
        return new Alert(title, TYPE_ERROR);
    }

    static success(title) {
        return new Alert(title, TYPE_SUCCESS);
    }

    get title() {
        return this._title;
    }

    /**
     * adds a Message that typically should  be displayed beneath the title
     * @param message
     * @return Alert
     */
    addMessage(message) {
        this._messages.push(message);
        return this;
    }

    /**
     * returns copy of messages
     * @returns {Array.<*>}
     */
    get messages() {
        return this._messages.slice();
    }

    get type() {
        return this._type;
    }



}

module.exports = Alert;
