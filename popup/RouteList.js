import ComponentRenderer from './ComponentRenderer.js';
import RouteComponent from './RouteComponent.js';

export default class RouteList {
    constructor(container, repository) {
        this.$container = container;
        this.repository = repository;

        this.renderer = new ComponentRenderer();
    }

    render() {
        this.$container.innerHTML = '';

        this.repository.load().then(routes => {
            this.sort(routes)
                .map(route => {
                    return new RouteComponent(route.id, route.name, route.visible)
                })
                .forEach(component => {
                    const node = this.renderer.render(component);

                    this.$container.appendChild(node);
                });
        });
    }

    sort(routes) {
        return routes.sort((a, b) => {
            // Assumes that route IDs increase (sorting on creation time)
            return a.id > b.id ? -1 : (b.id > a.id ? 1 : 0);
        });
    }
}