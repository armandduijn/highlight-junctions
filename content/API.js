export default class API {
  /**
   * Creates an API
   */
  constructor() {
    this.base = 'https://www.route.nl/api';
  }

  /**
   * Returns the user's routes
   *
   * @param {number} user - The user's ID
   * @return {Promise<array>}
   */
  async getRoutes(user) {
    return this.getRoutesList(user).then((routesList) => {
      const routes = routesList.routes.map((route) => this.getRoute(route.id));

      return Promise.all(routes);
    });
  }

  /**
   * Returns the route's details
   *
   * Note that this endpoint doesn't require authentication; routes marked as
   * public or private can be accessed by their route ID.
   *
   * @private
   * @param {number} id - The route's ID
   * @return {Promise<object>}
   */
  async getRoute(id) {
    const url = `${this.base}/route/${id}`;

    return fetch(url).then((response) => response.json());
  }

  /**
   * Returns a list of route's a user created
   *
   * The user must be logged-in for the request to succeed. The API authenticates
   * the request using the browser's cookies.
   *
   * @private
   * @param {number} user - The user's ID
   * @return {Promise<object>}
   */
  async getRoutesList(user) {
    const url = `${this.base}/routes/group/${user}`;

    return fetch(url).then((response) => {
      // API returns status code 204 is the user isn't logged-in
      if (response.status === 204) {
        throw new Error('Failed to load the user\'s routes. Make sure that the user is logged-in.');
      }

      return response.json();
    });
  }
}
