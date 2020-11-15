import RouteCollection from './RouteCollection.js';
import Highlighter from './Highlighter.js';
import {MessageType} from './../shared/Message.js';
import RoutePreferences from '../shared/RoutePreferences.js';
import ComponentRenderer from '../shared/ComponentRenderer.js';
import HistoryComponent from './HistoryComponent.js';

export default async function(user) {
  const routeCollection = await RouteCollection.load(user);
  const highlighter = await Highlighter.load(routeCollection);

  // Updates the routes displayed in the popup
  const preferences = await RoutePreferences.load();
  preferences.setRoutes(routeCollection);
  preferences.persist();

  chrome.runtime.onMessage.addListener(async (request) => {
    // Reload points if the preferences have changed
    if (request.type === MessageType.NOTIFY_CHANGE) {
      await highlighter.setPoints(routeCollection);

      highlighter.paint();
    }
  });

  const renderer = new ComponentRenderer();

  /**
   * Adds extra information to the default point popup
   *
   * @param {number} id - The point (POI) id
   */
  const enhancePopup = (id) => {
    const routes = routeCollection.findRoutesByPoint(id);
    const node = renderer.render(new HistoryComponent(routes));

    // The website doesn't recreate the popup if a user clicks on the same
    // point twice. Check the existence of a custom class to prevent content
    // from being added multiple times. Class is automatically removed when
    // the popup is recreated for a new point.
    const $popup = document.querySelector('.leaflet-popup');

    if ($popup.classList.contains('x-enhanced')) {
      return;
    }

    document
      .querySelector('.leaflet-popup .waypointName')
      .insertAdjacentElement('afterend', node);

    $popup.classList.add('x-enhanced');
  }

  return {enhancePopup};
}
