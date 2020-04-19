export default class ComponentRenderer {
    render(component) {
        const node = this.createNode(component);

        this.addListeners(component, node);

        return node;
    }

    createNode(component) {
        const string = component.render();

        return new DOMParser().parseFromString(string, 'text/html').body.childNodes[0];
    }

    addListeners(component, node) {
        const pattern = /x-(.*?)="(.*?)"/g; // e.g. `<span x-click="onClick">`
        const matches = [...node.outerHTML.matchAll(pattern)];

        matches.forEach(match => {
            const event = match[1];
            const callback = match[2];

            if (typeof component[callback] === 'function') {
                // Add event listener to all nodes that have the special attribute
                [...node.querySelectorAll(`[x-${event}="${callback}"]`)].forEach(target => {
                    target.addEventListener(event, e => component[callback](e));
                });
            }
        });
    }
}