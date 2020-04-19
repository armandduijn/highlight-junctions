export default class RouteStorage {
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