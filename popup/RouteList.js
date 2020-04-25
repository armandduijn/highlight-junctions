import ComponentRenderer from './ComponentRenderer.js';
import RouteComponent from './RouteComponent.js';
import {Message, MessageType} from '../shared/Message.js';

export default class RouteList {
  /**
   * Creates a RouteList
   *
   * @param {HTMLElement} container
   * @param {RouteStorage} routeStorage
   */
  constructor(container, routeStorage) {
    this.$container = container;
    this.routeStorage = routeStorage;

    this.renderer = new ComponentRenderer();
  }

  /**
   * Renders the routes list
   */
  render() {
    this.$container.innerHTML = ''; // Remove content from previous renders

    this.routeStorage.load().then((routes) => {
      this.customSort(routes)
          .map((route) => {
            return this.routeComponentFactory(route);
          })
          .forEach((component) => {
            const node = this.renderer.render(component);

            this.$container.appendChild(node);
          });
    });
  }

  /**
   * Creates a RouteComponent for a route
   *
   * @param {object} route - The route
   * @return {RouteComponent}
   */
  routeComponentFactory(route) {
    return new RouteComponent(route.id, route.name, route.visible, this.changeHandler.bind(this));
  }

  /**
   * Handles changes to a route's state
   *
   * @param {number} id - The route's ID
   * @param {object} state - The state changes
   */
  async changeHandler(id, state) {
    await this.routeStorage.update(id, state);

    // Notify any running content script that there's an update
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const message = new Message(MessageType.NOTIFY_CHANGE);

      chrome.tabs.sendMessage(tabs[0].id, message);
    });
  }

  /**
   * Sorts the routes
   *
   * @param {array} routes
   * @return {array}
   */
  customSort(routes) {
    return routes.sort((a, b) => {
      // Assumes that route IDs increase (sorting on creation time)
      return a.id > b.id ? -1 : (b.id > a.id ? 1 : 0);
    });
  }
}
