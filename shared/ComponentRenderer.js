export default class ComponentRenderer {
  /**
   * Returns the rendered component
   *
   * @param {*} component
   * @return {Document}
   */
  render(component) {
    const node = this.createNode(component);

    this.addListeners(component, node);

    return node;
  }

  /**
   * Parses the HTML string
   *
   * @private
   * @param {*} component
   * @return {Document}
   */
  createNode(component) {
    const string = component.render();

    return new DOMParser().parseFromString(string, 'text/html').body.childNodes[0];
  }

  /**
   * Attaches event listeners
   *
   * To add an event listener, define a custom attribute in the HTML string
   * that matches the pattern `x-EVENT="FN"`. Replace `EVENT` with the event
   * type (e.g. click, change) and FN with a function name. This function must
   * be defined in the component and will be called when the event is fired.
   *
   * @private
   * @param {*} component
   * @param {Document} node
   */
  addListeners(component, node) {
    const pattern = /x-(.*?)="(.*?)"/g; // e.g. `<span x-click="onClick">`
    const matches = [...node.outerHTML.matchAll(pattern)];

    matches.forEach((match) => {
      const event = match[1]; // Event type (e.g. click, change)
      const callback = match[2]; // Function name

      if (typeof component[callback] === 'function') {
        const nodes = [...node.querySelectorAll(`[x-${event}="${callback}"]`)];

        // Add event listener to all nodes that have the special attribute
        nodes.forEach((target) => {
          target.addEventListener(event, (e) => component[callback](e));
        });
      }
    });
  }
}
