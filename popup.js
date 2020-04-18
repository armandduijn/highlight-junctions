class RouteStorage {
    constructor() {
        this.key = 'routes';
        this.defaultValue = [
            { id: 1, name: 'Test 1', visible: 1 },
            { id: 2, name: 'Test 2', visible: 0 }
        ];

        this.routes = null;
    }

    load() {
        return new Promise(resolve => {
            chrome.storage.local.get({
                [this.key]: this.defaultValue
            }, result => {
                this.routes = result[this.key];

                resolve();
            });
        });
    }

    persist() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({
                [this.key]: this.routes
            }, () => {
                resolve();
            });
        });
    }

    update(id, state) {
        const index = this.routes.findIndex(route => route.id === id);

        if (index > -1) {
            this.routes[index] = Object.assign({}, this.routes[index], state);

            return this.persist();
        }

        return Promise.reject();
    }

    merge(incoming) {
        const preferences = this.routes
            // Find routes that are already listed
            .filter(route => {
                return incoming.map(r => r.id).includes(route.id);
            })
            // Convert to a dictionary for easy access
            .reduce((dict, route) => {
                dict[route.id] = route

                return dict;
            }, {});

        return incoming.map(route => {
            const dict = { id: route.id, name: route.name, visible: true };

            if (route.id in preferences) {
                Object.assign(dict, preferences[route.id]);
            }

            return dict;
        });
    }
}

class RouteComponent {
    constructor(id, name, visible) {
        this.id = id;
        this.name = name;
        this.visible = visible;
    }

    render() {
        return `
        <li>
            <div class="name">
                <a href="#" x-click="onClick" title="Bekijk deze route">${this.name}</a>
            </div>
            <span class="visible">
                <input type="checkbox" x-change="onChange" data-id="${this.id}" ${this.visible ? 'checked': ''} />
            </span>
        </li>
        `;
    }

    onClick() {
        chrome.tabs.create({
            url: `https://www.route.nl/fietsroute/${this.id}`
        });
    }

    onChange(event) {
        storage.update(this.id, { visible: event.target.checked });
    }
}

class Renderer {
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

var storage = new RouteStorage();
var renderer = new Renderer();

function renderList() {
    $container = document.querySelector('.routes-list');
    $container.innerHTML = '';

    storage.load().then(() => {
        storage.routes
            .sort((a, b) => {
                // Assumes that route IDs increase (sorting on creation time)
                a.id > b.id ? -1 : (b.id > a.id ? 1 : 0)
            })
            .map(route => {
                return new RouteComponent(route.id, route.name, route.visible)
            })
            .forEach(component => {
                const node = renderer.render(component);

                $container.appendChild(node);
            });
    });
}

renderList();

document.querySelector('#refresh').addEventListener('click', () => {
    renderList();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if ('routes' in request) {
        storage.routes = storage.merge(request.routes);
        storage.persist();
    }
});