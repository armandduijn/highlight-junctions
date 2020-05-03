import RoutePreferences from '../shared/RoutePreferences.js';

export default class Highlighter {
  /**
   * Creates a Highlighter
   *
   * @param {array} points
   */
  constructor(points) {
    this.points = points;
    this.className = 'x-marker-visited';
  }

  static async load(routeCollection) {
    const highlighter = new this().withObserver();

    await highlighter.setPoints(routeCollection);

    return highlighter;
  }

  /**
   * Loads the points
   *
   * Takes the preferences into account.
   *
   * @param {RouteCollection} routeCollection
   */
  async setPoints(routeCollection) {
    const preferences = await RoutePreferences.load();

    this.points = routeCollection
        .filter(preferences.getRouteFilter())
        .getAllPoints();
  }

  /**
   * Paints on the Route.nl map
   */
  paint() {
    const $points = document.querySelectorAll(`.${this.className}`);

    // The collection of points might have been changed, remove highlight
    [...$points].forEach(($point) => $point.classList.remove(this.className));

    // Highlight collection of points
    this.points.forEach((point) => {
      this.highlight(point);
    });
  }

  /**
   * Initializes the map observer
   *
   * Makes sure that the points are highlighted when the Route.nl map is redrawn.
   *
   * @private
   * @return {self}
   */
  withObserver() {
    const observer = new MutationObserver(
        this.paint.bind(this), // Bind `this` to make sure that references works
    );

    // TODO: Use Leaflet's API to listen to state changes
    // TODO: Fix observer being called twice on page load
    observer.observe(document.querySelector('.leaflet-marker-pane'), {
      childList: true,
    });

    return this;
  }

  /**
   * Highlights the point on the Route.nl map
   *
   * @private
   * @param {object} point
   */
  highlight(point) {
    const $point = document.querySelector('.route-marker.marker-id-' + point.id);

    // If the point is visible on the map
    if ($point) {
      // Add custom class for styling
      $point.classList.add(this.className);
    }
  }
}
