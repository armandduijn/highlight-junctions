import RouteList from './popup/RouteList.js';
import RouteStorage from './popup/RouteStorage.js';

const repository = new RouteStorage();
const routeList = new RouteList(document.querySelector('.routes-list'), repository);

routeList.render();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if ('routes' in request) {
        storage.routes = storage.merge(request.routes);
        storage.persist();
    }
});