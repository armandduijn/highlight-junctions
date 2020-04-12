const API = {
    base: 'https://www.route.nl/api'
};

const cache = {
    points: null
};

/**
 * Returns the user's routes
 *
 * The user has to be logged-in for the request to succeed. The API authenticates
 * the request using the browser's cookies.
 *
 * @param {number} userId
 */
async function getRoutesUser(userId) {
    const url = API.base + '/routes/group/' + userId;

    return fetch(url).then(response => {
        // API returns status code 204 is the user isn't logged-in
        if (response.status === 204) {
            return Promise.reject("Failed to load the user's routes. Make sure that the user is logged-in.");
        }

        return response.json();
    });
}

/**
 * Returns the route's details
 *
 * Note that this endpoint doesn't require authentication; routes marked as
 * public or private can be accessed by its route ID.
 *
 * @param {number} routeId
 */
async function getRoute(routeId) {
    const url = API.base + '/route/' + routeId;

    return fetch(url).then(response => response.json());
}

/**
 * Returns a route's POIs
 *
 * @param {object} route
 */
function extractPOIs(route) {
    return route.routePoints
        .map(point => {
            if (point.poi == null) {
                return {};
            }

            return {
                id: point.poi.id,
                name: point.poi.name,
                category: point.poi.category.categoryType
            }
        })
        .filter(point => {
            // Remove invalid POIs
            return Object.keys(point).length > 0
        });
}

/**
 * Returns the POIs of a collection of routes
 *
 * @param {array} routes
 */
async function extractAllPOIs(routes) {
    return routes.reduce((points, route) => {
        return points.concat(extractPOIs(route));
    }, []);
}

/**
 * Returns the POIs included in a user's routes
 *
 * @param {number} userId
 */
async function getPoints(userId) {
    if (Array.isArray(cache.points)) {
        console.info('Loading cached points');

        return Promise.resolve(cache.points);
    }

    console.info('Loading the user\'s routes');

    const user = await getRoutesUser(userId);

    console.info('Loading ' + user.routes.length + ' routes');

    const routes = await (async() => {
        return Promise.all(user.routes.map(route => getRoute(route.id)))
    })();

    console.info('Extracting POIs');

    // Cache points so that the POIs can be highlighted again when the map is
    // redrawn because of zoomin, moving, etc.
    cache.points = await extractAllPOIs(routes);

    return cache.points;
}

/**
 * Highlights the POI on the map
 *
 * @param {object} point
 */
function highlightPointOnMap(point) {
    var $point = document.querySelector('.route-marker.marker-id-' + point.id);

    // If the POI is visible on the map
    if ($point) {
        // Add custom class for styling
        $point.classList.add('x-marker-visited');
    }
}

var observer = new MutationObserver(() => {
    // Global function that returns the logged-in user's user ID
    var user_id = window.getActiveUserId();

    getPoints(user_id).then(points => {
        points.forEach(point => highlightPointOnMap(point));
    }).catch(error => {
        console.error(error);
    });
});

// TODO: Use Leaflet's API to listen to state changes
// TODO: Fix observer being called twice on page load
observer.observe(document.querySelector('.leaflet-marker-pane'), {
    childList: true
});