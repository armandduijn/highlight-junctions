// Setup listener for event sent by the injected script
window.addEventListener('x-user', event => {
    const payload = event.detail;

    // Check if the user is logged-in
    if (payload.id === null) {
        return;
    }

    (async() => {
        const module = await import (chrome.runtime.getURL('./content/bootstrap.js'));
        const bootstrap = module.default;

        const app = await bootstrap(payload.id);

        window.addEventListener('x-popup', event => {
            app.enhancePopup(event.detail.id);
        });
    })();
});

// Inject script to retrieve the logged-in user's ID
const script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', chrome.extension.getURL('inject.js'));

document.body.appendChild(script);
