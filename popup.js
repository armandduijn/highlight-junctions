import RouteStorage from './popup/RouteStorage.js';
import RouteComponent from './popup/RouteComponent.js';
import ComponentRenderer from './popup/ComponentRenderer.js';

var storage = new RouteStorage();
var renderer = new ComponentRenderer();

function renderList() {
    const $container = document.querySelector('.routes-list');
    $container.innerHTML = '';

    storage.load().then(() => {
        storage.routes
            .sort((a, b) => {
                // Assumes that route IDs increase (sorting on creation time)
                a.id > b.id ? -1 : (b.id > a.id ? 1 : 0)
            })
            .map(route => {
                return new RouteComponent(route.id, route.name, route.visible)
            })
            .forEach(component => {
                const node = renderer.render(component);

                $container.appendChild(node);
            });
    });
}

renderList();

document.querySelector('#refresh').addEventListener('click', () => {
    renderList();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if ('routes' in request) {
        storage.routes = storage.merge(request.routes);
        storage.persist();
    }
});