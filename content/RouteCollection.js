import API from './API.js';

export default class RouteCollection {
  /**
   * Creates a RouteCollection
   *
   * @param {array} routes - The routes in the collection
   */
  constructor(routes = []) {
    this.collection = routes;
  }

  /**
   * Initializes a RouteCollection
   *
   * @param {number} user - The user's ID
   * @return {RouteCollection}
   */
  static async load(user) {
    const routes = await (new API()).getRoutes(user);

    return new this(routes);
  }

  /**
   * Returns the filtered routes
   *
   * @param {function} callback - A custom filter function
   * @return {RouteCollection}
   */
  filter(callback) {
    const routes = this.collection.filter(callback);

    return new this.constructor(routes);
  }

  /**
   * Returns the mapped routes
   *
   * @param {function} callback - A custom map function
   * @return {array}
   */
  map(callback) {
    return this.collection.map(callback);
  }

  /**
   * Returns all route points
   *
   * @return {array} A collection of points
   */
  getAllPoints() {
    return this.collection.reduce((points, route) => {
      return points.concat(this.getPoints(route));
    }, []);
  }

  /**
   * Returns the route's points
   *
   * @private
   * @param {object} route - A route object from the API
   * @return {array} A collection of points
   */
  getPoints(route) {
    return route.routePoints
        .map((point) => {
          if (point.poi === null) {
            return null;
          }

          return {
            id: point.poi.id,
            name: point.poi.name,
            category: point.poi.category.categoryType,
          };
        })
        .filter((point) => {
          // Remove invalid points
          return (point !== null);
        });
  }

  /**
   * Returns routes containing the point
   *
   * @param {number} id - The point (POI) id
   * @returns {array} A subset of the routes
   */
  findRoutesByPoint(id) {
    return this.collection.filter(route => {
      return route.routePoints.some(point => point.poi?.id === id) // Some POIs don't have an ID (e.g. random marker not aligned to junction)
    });
  }
}
