// Setup listener for event sent by the injected script
window.addEventListener('x-user', event => {
    const payload = event.detail;

    // Check if the user is logged-in
    if (payload.id === null) {
        return;
    }

    (async() => {
        const module = await import (chrome.runtime.getURL('./content/Highlighter.js'));
        const Highlighter = module.default;

        const highlighter = new Highlighter(payload.id);
        const observer = new MutationObserver(highlighter.getPainter());

        // TODO: Use Leaflet's API to listen to state changes
        // TODO: Fix observer being called twice on page load
        observer.observe(document.querySelector('.leaflet-marker-pane'), {
            childList: true
        });
    })();
});

// Inject script to retrieve the logged-in user's ID
const script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', chrome.extension.getURL('inject.js'));

document.body.appendChild(script);
