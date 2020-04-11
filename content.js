function getRouteUser(userId) {
    var url = 'https://www.route.nl/api/routes/group/' + userId;

    return fetch(url).then(response => {
        if (response.status === 204) {
            throw new Error("Failed to load the user's routes. Make sure that the user is logged-in.");
        }

        return response.json();
    });
}

function getRoute(routeId) {
    var url = 'https://www.route.nl/api/route/' + routeId;

    return fetch(url).then(response => response.json());
}

var cachedPoints = null;

function getPoints(userId) {
    if (Array.isArray(cachedPoints)) {
        console.info("Loaded cached points");

        return Promise.resolve(cachedPoints);
    }

    console.info("Loading the user's routes");

    return getRouteUser(userId)
        .then(user => {
            var routes = user.routes.map(route => {
                return getRoute(route.id);
            });

            console.info("Loading " + routes.length + " routes");

            return Promise.all(routes);
        })
        .then(routes => {
            console.log("Extracting POIs");

            return routes.reduce((points, route) => {
                return points.concat(route.routePoints.map(point => {
                    if (point.poi == null) {
                        return {};
                    }

                    return {
                        id: point.poi.id,
                        name: point.poi.name,
                        category: point.poi.category.categoryType
                    }
                }));
            }, [])
        })
        .then(points => {
            console.info("Finished loading POIs");

            return points.filter(point => Object.keys(point).length > 0);
        })
        .then(points => {
            cachedPoints = points;

            return cachedPoints;
        })
}

function highlightPointOnMap(point) {
    var $point = document.querySelector('.route-marker.marker-id-' + point.id);

    if ($point) {
        $point.classList.add('x-marker-visited');
    }
}

var observer = new MutationObserver(() => {
    var user_id = window.getActiveUserId();

    getPoints(user_id).then(points => {
        points.forEach(point => highlightPointOnMap(point));
    }).catch(error => {
        console.error(error);
    });
});

observer.observe(document.querySelector('.leaflet-marker-pane'), {
    childList: true
});