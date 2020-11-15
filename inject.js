const id = window.getActiveUserId(); // Returns NaN if the user isn't logged in

window.dispatchEvent(new CustomEvent('x-user', {
    detail: {
        id: Number.isInteger(id) ? id : null
    }
}));

// Event fired by website when a popup is openend
window.map.on('popupopen', event => {
    let content = event.popup.getContent(); // Content may be a string for historical POIs

    if (content instanceof HTMLElement) {
        let index = parseInt(content.querySelector('.waypointName').dataset.index);
        let id = window.routingControl.getWaypoints()[index].options.id; // Find the marker ID

        if (Number.isInteger(id)) { // May be NULL for misaligned markers or historical POIs
            window.dispatchEvent(new CustomEvent('x-popup', {
                detail: {
                    id: id
                }
            }));
        }
    }
});
