export default class HistoryComponent {
  /**
  * Creates a HistoryComponent
  *
  * @param {array} routes - Routes matching the point
  */
  constructor(routes) {
    this.locale = 'nl-NL';
    this.routes = routes;
  }

  render() {
    const listItems = this.routes.map(route => {
      const distance = Number((route.totalDistance / 1000).toFixed(2)).toLocaleString(this.locale);

      return `
        <li class="x-routesList-item">
          <a href="${route.url}" target="_blank" title="Bekijk deze route in een nieuw venster">
            ${route.name}
          </a>
          <span>(${distance} km)</span>
        </li>`;
    }).join('');

    return `
      <div>
        <div>
          <strong>Deel van ${this.routes.length} route${this.routes.length === 1 ? '' : 's'}</strong>
        </div>
        ${this.routes.length > 0 ? `<ul class="x-routesList">${listItems}</ul>` : ''}
      </div>
      `;
  }
}
