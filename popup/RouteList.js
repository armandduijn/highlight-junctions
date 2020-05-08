import ComponentRenderer from './ComponentRenderer.js';
import RouteComponent from './RouteComponent.js';
import {Message, MessageType} from '../shared/Message.js';
import RoutePreferences from '../shared/RoutePreferences.js';

export default class RouteList {
  /**
   * Creates a RouteList
   *
   * @param {HTMLElement} container
   * @param {RoutePreferences} routePreferences
   */
  constructor(container, routePreferences) {
    this.container = container;
    this.routePreferences = routePreferences;

    this.renderer = new ComponentRenderer();
  }

  /**
   * Initializes a RouteList
   *
   * @param {HTMLElement} container
   * @return {RouteList}
   */
  static async load(container) {
    const routePreferences = await RoutePreferences.load();

    return new this(container, routePreferences);
  }

  /**
   * Renders the route list
   */
  render() {
    this.container.innerHTML = ''; // Remove content from previous renders

    this.routePreferences
        .sort((a, b) => {
          // Assumes that route IDs increase (sorting on creation time)
          return a.id > b.id ? -1 : (b.id > a.id ? 1 : 0);
        })
        .map((preference) => {
          return this.routeComponentFactory(preference);
        })
        .forEach((component) => {
          const node = this.renderer.render(component);

          this.container.appendChild(node);
        });
  }

  /**
   * Creates a RouteComponent for a preference
   *
   * @private
   * @param {object} preference
   * @return {RouteComponent}
   */
  routeComponentFactory(preference) {
    return new RouteComponent(preference.id, preference.name, preference.visible,
        this.changeHandler.bind(this),
    );
  }

  /**
   * Handles changes to a route's state
   *
   * @private
   * @param {number} id - The route's ID
   * @param {object} state - The state changes
   */
  async changeHandler(id, state) {
    this.routePreferences.update(id, state);

    await this.routePreferences.persist();

    // Notify the injected content script that there's an update
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const message = new Message(MessageType.NOTIFY_CHANGE);

      chrome.tabs.sendMessage(tabs[0].id, message);
    });
  }
}
