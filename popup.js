import RouteList from './popup/RouteList.js';
import RouteStorage from './shared/RouteStorage.js';

const routeList = new RouteList(
    document.querySelector('.routes-list'),
    new RouteStorage(),
);

routeList.render();
