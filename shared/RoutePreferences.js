export default class RoutePreferences {
  /**
   * Creates a RoutePreferences
   *
   * @param {array} preferences - The preferences in the collection
   */
  constructor(preferences = []) {
    this.preferences = preferences;
  }

  /**
   * Returns the key to retrieve the preferences from storage
   *
   * Defined as a static function so that it can be accessed from the load()
   * function.
   *
   * @return {string}
   */
  static getStorageKey() {
    return 'routes';
  }

  /**
   * Initializes a RoutePreferences
   *
   * @return {RoutePreferences}
   */
  static async load() {
    const key = RoutePreferences.getStorageKey();
    const defaultValue = []; // Default value if the storage key doesn't exist

    return new Promise((resolve) => {
      chrome.storage.local.get({[key]: defaultValue}, (result) => {
        const preferences = result[key];

        return resolve(new this(preferences));
      });
    });
  }

  /**
   * Writes the route preferences to storage
   *
   * @return {Promise}
   */
  async persist() {
    const query = {[RoutePreferences.getStorageKey()]: this.preferences};

    return new Promise((resolve) => {
      chrome.storage.local.set(query, () => {
        return resolve();
      });
    });
  }

  /**
   * Updates a preference for a specific route
   *
   * @param {number} id - The route's ID
   * @param {object} state - The changed state
   */
  update(id, state) {
    const index = this.preferences.findIndex((r) => (r.id === id));

    if (index === -1) {
      throw new Error(`Unknown route ID "${id}".`);
    }

    this.preferences[index] = Object.assign({}, this.preferences[index], state);
  }

  /**
   * Returns a function that filters routes using the preferences
   *
   * @return {function}
   */
  getRouteFilter() {
    return (route) => {
      const preference = this.preferences.find((r) => (r.id === route.id));

      if (preference) {
        return (preference.visible === true);
      }

      return true; // Keep route by default
    };
  }

  /**
   * Returns the sorted preferences
   *
   * @param {function} callback - A custom sort function
   * @return {RouteCollection}
   */
  sort(callback) {
    const preferences = this.preferences.sort(callback);

    return new this.constructor(preferences);
  }

  /**
   * Returns the mapped preferences
   *
   * @param {function} callback - A custom map function
   * @return {array}
   */
  map(callback) {
    return this.preferences.map(callback);
  }

  /**
   * Sets the routes for the preferences
   *
   * Preferences for existing routes are kept.
   *
   * @param {RouteCollection} routeCollection
   */
  setRoutes(routeCollection) {
    const incomingPreferences = routeCollection.map((route) => this.preferenceFactory(route));

    this.preferences = this.merge(this.preferences, incomingPreferences);
  }

  /**
   * Creates a preference object from a route
   *
   * @private
   * @param {object} route - The route data
   * @return {object}
   */
  preferenceFactory(route) {
    return {id: route.id, name: route.name, visible: true};
  }

  /**
   * Merges a collection of preferences with the existing preferences
   *
   * @private
   * @param {array} previousPreferences
   * @param {array} incomingPreferences
   * @return {array}
   */
  merge(previousPreferences, incomingPreferences) {
    return incomingPreferences.map((incomingPreference) => {
      const previousPreference = previousPreferences.find((p) => {
        return (p.id === incomingPreference.id);
      });

      if (previousPreference) {
        return Object.assign({}, incomingPreference, previousPreference);
      }

      return Object.assign({}, incomingPreference);
    });
  }
}
