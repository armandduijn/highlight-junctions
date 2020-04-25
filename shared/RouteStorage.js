export default class RouteStorage {
  /**
   * Creates a RouteStorage
   */
  constructor() {
    // Key to retrieve routes from storage
    this.key = 'routes';

    // Default value if no routes are stored
    this.defaultValue = [];
  }

  /**
   * Load the routes
   *
   * @return {Promise<object>} The routes
   */
  async load() {
    return new Promise((resolve) => {
      chrome.storage.local.get({
        [this.key]: this.defaultValue,
      }, (result) => {
        resolve(result[this.key]);
      });
    });
  }

  /**
   * Updates a route's state
   *
   * @param {nuumber} id - The route's ID
   * @param {object} state - The changed state
   * @return {Promise}
   */
  async update(id, state) {
    const routes = await this.load();
    const index = routes.findIndex((route) => route.id === id);

    if (index > -1) {
      routes[index] = Object.assign({}, routes[index], state);

      return this.persist(routes);
    }

    new Error(`Unknown route ID ${$route.id}.`);
  }

  /**
   * Transforms API data
   *
   * @param {array} dirtyRoutes - The route data from the API
   * @return {array}
   */
  transform(dirtyRoutes) {
    return dirtyRoutes.map((route) => {
      return {id: route.id, name: route.name, visible: true};
    });
  }

  /**
   * Merges two lists of routes
   *
   * Keeps the state stored in the original routes.
   *
   * @param {array} originalRoutes - A list of existing routes
   * @param {array} incomingRoutes - A list of new routes
   * @return {array}
   */
  merge(originalRoutes, incomingRoutes) {
    const overlappingRoutes = originalRoutes
        // Find routes that are already listed
        .filter((route) => {
          return incomingRoutes.map((r) => r.id).includes(route.id);
        })
        // Convert to a dictionary for easy access
        .reduce((dict, route) => {
          dict[route.id] = route;

          return dict;
        }, {});

    return incomingRoutes.map((route) => {
      const dict = route;

      if (route.id in overlappingRoutes) {
        Object.assign(dict, overlappingRoutes[route.id]);
      }

      return dict;
    });
  }

  /**
   * Writes the routes to storage
   *
   * @param {arrow} routes - The routes
   * @return {Promise}
   */
  async persist(routes) {
    return new Promise((resolve, _) => {
      chrome.storage.local.set({
        [this.key]: routes,
      }, () => {
        resolve();
      });
    });
  }

  /**
   * Helper function to correctly persist API data
   *
   * @param {object} dirtyRoutes - The route data from the API
   * @return {Promise}
   */
  async transformMergePersist(dirtyRoutes) {
    const originalRoutes = await this.load();
    const incomingRoutes = this.transform(dirtyRoutes);

    return this.persist(
        this.merge(originalRoutes, incomingRoutes),
    );
  }
}
