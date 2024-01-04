function routesPlacing(routes) {
    let routeRows = document.body.querySelectorAll('table.route-table > tbody > tr');
    console.log(routeRows.length);
    if (routes.length < 4)
        for (let i = 0; i < routes.length; i++) {
            rowCells = routeRows[i + 1].childNodes;
            rowCells[0].innerHTML = routes[i].name;
            rowCells[1].innerHTML = routes[i].description;
            rowCells[2].innerHTML = routes[i].mainObject;
        }
    else
        for (let i = 0; i < 4; i++) {
            console.log(routes[i]);
            rowCells = routeRows[i + 1].childNodes;
            rowCells[0].innerHTML = routes[i].name;
            rowCells[1].innerHTML = routes[i].description;
            rowCells[2].innerHTML = routes[i].mainObject;
        }
}

function routesLoading() {
    let routesTable = document.body.querySelector('.route-table');
    let url = new URL(routesTable.dataset.url)
    url.searchParams.set('api_key', '98e88cae-0dd8-4880-a68c-25873de4a2ca');
    let request = fetch(url);
    request.then(response => routesPlacing(response.json()))
}

window.onload = function () {
    routesLoading();
}