import RouteList from './popup/RouteList.js';

(async () => {
  const routeList = await RouteList.load(document.querySelector('.routes-list'));

  routeList.render();
})();
