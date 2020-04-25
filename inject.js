const id = window.getActiveUserId(); // Returns NaN if the user isn't logged in

window.dispatchEvent(new CustomEvent('x-user', {
    detail: {
        id: Number.isInteger(id) ? id : null
    }
}));