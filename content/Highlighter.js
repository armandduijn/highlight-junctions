import API from './API.js';
import {MessageType} from './../shared/Message.js';

export default class Highlighter {
  /**
   * Creates a Highlighter
   *
   * @param {number} userId - The user's ID
   */
  constructor(userId) {
    this.userId = userId;
    this.api = new API();

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === MessageType.NOTIFY_CHANGE) {
        // TODO: Reload points
      }
    });
  }

  getPainter() {
    return () => {
      this.loadPoints(this.userId)
          .then((points) => {
            points.forEach((point) => this.highlight(point));
          }).catch((error) => {
            console.error(error);
          });
    };
  }

  /**
   * Returns the POIs included in a user's routes
   */
  async loadPoints() {
    const routes = await this.api.getRoutes(this.userId);

    // TODO: Hide disabled routes

    return routes.reduce((points, route) => {
      return points.concat(this.extractPOIs(route));
    }, []);
  }

  /**
   * Returns a route's POIs
   *
   * @param {object} route
   * @return {array}
   */
  extractPOIs(route) {
    return route.routePoints
        .map((point) => {
          if (point.poi == null) {
            return {};
          }

          return {
            id: point.poi.id,
            name: point.poi.name,
            category: point.poi.category.categoryType,
          };
        })
        .filter((point) => {
          // Remove invalid POIs
          return Object.keys(point).length > 0;
        });
  }

  /**
   * Highlights the POI on the map
   *
   * @param {object} point
   */
  highlight(point) {
    const $point = document.querySelector('.route-marker.marker-id-' + point.id);

    // If the POI is visible on the map
    if ($point) {
      // Add custom class for styling
      $point.classList.add('x-marker-visited');
    }
  }
}
