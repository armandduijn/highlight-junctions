export default class RouteComponent {
  /**
   * Creates a RouteComponent
   *
   * @param {number} id - The route's ID
   * @param {string} name - The route's name
   * @param {boolean} visible - If the route should be marked as visible
   * @param {function} changeHandler - Handles changes to the route's state
   */
  constructor(id, name, visible, changeHandler) {
    this.id = id;
    this.name = name;
    this.visible = visible;
    this.changeHandler = changeHandler;
  }

  render() {
    return `
        <li>
            <div class="name">
                <a href="#" x-click="onClick" title="Bekijk deze route in een nieuw venster">
                  ${this.name}
                </a>
            </div>
            <span class="visible">
                <input type="checkbox" x-change="onChange" ${this.visible ? 'checked': ''} />
            </span>
        </li>
        `;
  }

  onClick() {
    chrome.tabs.create({url: `https://www.route.nl/fietsroute/${this.id}`});
  }

  onChange(event) {
    this.changeHandler(this.id, {visible: event.target.checked});
  }
}
