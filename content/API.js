import Cache from './Cache.js';
import RouteStorage from './../shared/RouteStorage.js';

export default class API {
  constructor() {
    this.base = 'https://www.route.nl/api';

    this.cache = new Cache();
    this.routeStorage = new RouteStorage();
  }

  /**
   * Returns the user's routes
   *
   * The user must be logged-in for the request to succeed. The API authenticates
   * the request using the browser's cookies.
   *
   * @param {number} userId - The user's ID
   */
  async getRoutesList(userId) {
    const url = `${this.base}/routes/group/${userId}`;

    return fetch(url).then((response) => {
      // API returns status code 204 is the user isn't logged-in
      if (response.status === 204) {
        throw new Error('Failed to load the user\'s routes. Make sure that the user is logged-in.');
      }

      return response.json();
    });
  }

  /**
   * Returns the route's details
   *
   * Note that this endpoint doesn't require authentication; routes marked as
   * public or private can be accessed by their route ID.
   *
   * @param {number} id - The route's ID
   */
  async getRoute(id) {
    const url = `${this.base}/route/${id}`;

    return fetch(url).then((response) => response.json());
  }

  /**
   * Returns the user's routes
   *
   * @param {number} userId - The user's ID
   */
  async getRoutes(userId) {
    const key = 'routes';

    if (this.cache.exists(key)) {
      return this.cache.getItem(key);
    }

    return this.getRoutesList(userId)
        .then((routesList) => {
          const routes = routesList.routes.map((route) => this.getRoute(route.id));

          return Promise.all(routes);
        })
        .then((routes) => {
          // Cache routes to prevent refetching them when the map is redrawn due
          // to zooming, moving, etc.
          this.cache.setItem(key, routes);

          // Store routes to display them in the popup
          this.routeStorage.transformMergePersist(routes);

          return routes;
        });
  }
}
