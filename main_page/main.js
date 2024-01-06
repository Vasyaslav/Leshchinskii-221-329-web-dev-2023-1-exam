'use strict';

let apiKey = '98e88cae-0dd8-4880-a68c-25873de4a2ca';
let baseURL = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
let globalRoutes;
let displayableRoutes = [];
let defaultSearchWord = '';
let defaultSelectedWord = 'Основной объект';
let paginationBtn = document.createElement('li');
paginationBtn.classList.add('page-item');
paginationBtn.innerHTML = '<a class="page-link" href="#">1</a>';

function routesBtnCreator() {
    if (displayableRoutes.length == 0) return;
    let routeBtns = document.body.querySelector('ul.routeBtns');
    let btnsLength = routeBtns.children.length;
    for (let i = 1; i < btnsLength - 1; i++)
        routeBtns.children[1].remove();
    let pages = Math.floor(displayableRoutes.length / 4);
    if (displayableRoutes.length % 4 != 0) pages += 1;
    if (pages > 4) {
        for (let i = 5; i > 0; i--) {
            let listElem = paginationBtn.cloneNode(true);
            listElem.children[0].innerHTML = String(i);
            routeBtns.children[0].after(listElem);
        }
    } else {
        for (let i = pages; i > 0; i--) {
            let listElem = paginationBtn.cloneNode(true);
            listElem.children[0].innerHTML = String(i);
            routeBtns.children[0].after(listElem);
        }
    }
    routeBtns.children[1].children[0].classList.add('active');
}

function routesPlacing(page = 0) {
    let routeRows = document.body.querySelectorAll('div.routeRow');
    let rowsNumber = displayableRoutes.length - page * 4;
    if (displayableRoutes.length - page * 4 > 4) rowsNumber = 4;
    console.log(rowsNumber);
    for (let i = 0; i < 4; i++) {
        let cols = routeRows[i].children;
        cols[0].innerHTML = '';
        cols[1].innerHTML = '';
        cols[2].innerHTML = '';
        cols[3].innerHTML = '';
    }
    for (let i = 0; i < rowsNumber; i++) {
        let cols = routeRows[i].children;
        let name = document.createElement('p');
        name.innerHTML = globalRoutes[displayableRoutes[i + page * 4]].name;
        let description = document.createElement('p');
        description.innerHTML = globalRoutes[
            displayableRoutes[i + page * 4]].description;
        let mainObject = document.createElement('p');
        mainObject.innerHTML = globalRoutes[
            displayableRoutes[i + page * 4]].mainObject;
        let btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-success';
        btn.innerHTML = 'Выбрать';
        cols[0].append(name);
        cols[1].append(description);
        cols[2].append(mainObject);
        if (cols[3].innerHTML == '')
            cols[3].append(btn);
    }
}

function displayableRoutesChange() {
    displayableRoutes = [];
    let searchParam = document.body.querySelector(
        'input.searchField').value.trim();
    let selectedParam = document.body.querySelector(
        'select.selectField').value;
    if (searchParam != defaultSearchWord &&
        selectedParam == defaultSelectedWord) {
        for (let i = 0; i < globalRoutes.length; i++)
            if (globalRoutes[i].name
                .toLowerCase().includes(searchParam.toLowerCase())) {
                displayableRoutes.push(i);
            }
    } else if (searchParam == defaultSearchWord &&
        selectedParam != defaultSelectedWord) {
        for (let i = 0; i < globalRoutes.length; i++)
            if (globalRoutes[i].mainObject
                .toLowerCase().includes(selectedParam.toLowerCase()))
                displayableRoutes.push(i);
    } else if (searchParam != defaultSearchWord &&
        selectedParam != defaultSelectedWord) {
        for (let i = 0; i < globalRoutes.length; i++)
            if (globalRoutes[i].name
                .toLowerCase().includes(searchParam.toLowerCase()) &&
                globalRoutes[i].mainObject
                    .toLowerCase().includes(selectedParam.toLowerCase()))
                displayableRoutes.push(i);
    } else {
        for (let i = 0; i < globalRoutes.length; i++)
            displayableRoutes.push(i);
    }
    routesBtnCreator();
    routesPlacing();
}

function routesLoading() {
    let url = new URL(baseURL);
    url.pathname = '/api/routes';
    url.searchParams.append('api_key', apiKey);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        globalRoutes = this.response;
        displayableRoutesChange();
    };
    xhr.send();
}

function routeArrowBtns(btns, clickedBtn, curBtn) {
    let edgePage = Math.floor(displayableRoutes.length / 4);
    if (displayableRoutes.length % 4 != 0) edgePage += 1;
    if (clickedBtn.innerText == '«' && btns[curBtn].innerHTML != '1') {
        if (Number(btns[curBtn].innerHTML) < 4 ||
            Number(btns[curBtn].innerHTML) > (edgePage - 2)) {
            btns[curBtn - 1].classList.add('active');
            routesPlacing(Number(btns[curBtn - 1].innerHTML) - 1);
        } else {
            for (let i = 1; i < btns.length - 1; i++) {
                btns[i].innerHTML = String(
                    Number(btns[i].innerHTML) - 1);
            }
            btns[3].classList.add('active');
            routesPlacing(Number(btns[curBtn].innerHTML) - 1);
        }
    } else if (clickedBtn.innerText == '»' &&
        Number(btns[curBtn].innerHTML) != edgePage) {
        if (Number(btns[curBtn].innerHTML) > (edgePage - 3) ||
            Number(btns[curBtn].innerHTML) < 3) {
            btns[curBtn + 1].classList.add('active');
            routesPlacing(Number(btns[curBtn + 1].innerHTML) - 1);
        } else {
            for (let i = 1; i < btns.length - 1; i++) {
                btns[i].innerHTML = String(
                    Number(btns[i].innerHTML) + 1);
            }
            btns[3].classList.add('active');
            routesPlacing(Number(btns[curBtn].innerHTML) - 1);
        }
    } else btns[curBtn].classList.add('active');
}

function routeNumberBtns(btns, clickedBtn) {
    let edgePage = Math.floor(displayableRoutes.length / 4);
    let targetNumber = +clickedBtn.innerHTML;
    console.log(targetNumber);
    if (displayableRoutes.length % 4 != 0) edgePage += 1;
    routesPlacing(targetNumber - 1);
    if (targetNumber < 3) {
        for (let i = 1; (i < 6 && i < edgePage + 1); i++) {
            btns[i].innerHTML = String(i);
            if (i == targetNumber)
                btns[i].classList.add('active');
        }
    } else if (targetNumber > edgePage - 2) {
        let amountOfNumberBtns = btns.length - 2;
        for (let i = edgePage - 4; (i < edgePage + 1); i++) {
            if (i <= 0) continue;
            console.log(i);
            console.log(btns[i - edgePage + amountOfNumberBtns].innerHTML);
            btns[i - edgePage + amountOfNumberBtns].innerHTML = String(i);
            if (i == targetNumber)
                btns[i - edgePage + amountOfNumberBtns].classList.add('active');
        }
    } else {
        btns[1].innerHTML = targetNumber - 2;
        btns[2].innerHTML = String(+targetNumber - 1);
        btns[3].innerHTML = targetNumber;
        btns[4].innerHTML = targetNumber + 1;
        btns[5].innerHTML = String(+targetNumber + 2);
        btns[3].classList.add('active');
    }
}

function routePagination(event) {
    if (Number.isInteger(Number(event.target.innerText)) ||
        event.target.innerText == '«' || event.target.innerText == '»') {
        let routeBtns = document.body.querySelectorAll('ul.routeBtns > li > a');
        let currentPage;
        for (let i = 1; i < routeBtns.length - 1; i++) {
            if (routeBtns[i].classList.contains('active')) {
                routeBtns[i].classList.remove('active');
                currentPage = i;
            }
        }
        if (Number.isInteger(Number(event.target.innerText)))
            routeNumberBtns(routeBtns, event.target, currentPage);
        else routeArrowBtns(routeBtns, event.target, currentPage);
    }
}

window.onload = function () {
    document.body.querySelector('ul.routeBtns').onclick = routePagination;
    document.body.querySelector(
        'input.searchField').oninput = displayableRoutesChange;
    document.body.querySelector(
        'select.selectField').onchange = displayableRoutesChange;
    routesLoading();
};