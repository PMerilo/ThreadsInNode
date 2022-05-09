const flashMessage = (res, messageType, message, icon, dismissable) => {
    let alert;
    switch (messageType) {
        case 'success':
            alert = res.flashMessenger.success(message);
            alert.titleIcon = 'fas fa-check-circle';
            alert.canBeDismissed = true;
            break;
        case 'error':
            alert = res.flashMessenger.danger(message);
            alert.titleIcon = 'fas fa-exclamation-circle';
            alert.canBeDismissed = true;
            break;
        case 'info':
            alert = res.flashMessenger.info(message);
            alert.titleIcon = 'fas fa-info-circle';
            alert.canBeDismissed = true;
            break;
        default:
            alert = res.flashMessenger.info(message);
    }

    if (icon) {
        alert.titleIcon = icon;
    }
    if (dismissable) {
        alert.canBeDismissed = dismissable;
    }
};

module.exports = flashMessage; // returns a function