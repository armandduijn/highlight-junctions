import RouteCollection from './RouteCollection.js';
import Highlighter from './Highlighter.js';
import {MessageType} from './../shared/Message.js';
import RoutePreferences from '../shared/RoutePreferences.js';

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
}
