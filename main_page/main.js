'use strict';

let apiKey = '98e88cae-0dd8-4880-a68c-25873de4a2ca';
let baseURL = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
let globalRoutes;
let displayableRoutes = [];
let currentGuides;
let defaultSearchWord = '';
let defaultSelectedWord = 'Основной объект';
let defaultLanguage = 'Язык экскурсии';
let defaultExperinceFrom = '';
let defaultExperinceBefore = '';
let paginationBtn = document.createElement('li');
paginationBtn.classList.add('page-item');
paginationBtn.innerHTML = '<a class="page-link" href="#">1</a>';

function createGuideRow() {
    let row = document.createElement('div');
    row.className = 'row guideRow px-0 mx-1';
    let col = document.createElement('div');
    col.className = 'col-lg-2 col-sm-4 border';
    let big_col = document.createElement('div');
    big_col.className = 'col-lg-4 col-sm-8 border';
    row.append(col);
    row.append(big_col);
    for (let i = 0; i < 3; i++) {
        let col = document.createElement('div');
        col.className = 'col-lg-2 col-sm-4 border';
        row.append(col);
    }
    return row;
}

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
        btn.className = 'btn btn-success routeChoose';
        btn.innerHTML = 'Выбрать';
        cols[0].append(name);
        cols[1].append(description);
        cols[2].append(mainObject);
        cols[3].append(btn);
    }
}

function languageDrawer() {
    let languageField = document.body.querySelector('select.languageField');
    while (languageField.children.length > 1) languageField.lastChild.remove();
    let curLanguages = [];
    for (let guide of currentGuides) {
        for (let language of guide.language.split(', '))
            if (!curLanguages.includes(language.trim()))
                curLanguages.push(language.trim());
    }
    for (let language of curLanguages) {
        let optionNode = document.createElement('option');
        optionNode.innerHTML = language;
        languageField.append(optionNode);
    }
}

function guidesPlacing() {
    console.log(1);
    let guideRows = document.body.querySelectorAll('div.guideRow');
    let guideFilters = document.body.querySelector('div.guideFilters');
    let language = document.body.querySelector(
        'select.languageField').value;
    if (language == defaultLanguage) language = '';
    let from = +document.body.querySelector(
        'input.experienceFromField').value;
    if (from == defaultExperinceFrom) from = -1;
    let before = +document.body.querySelector(
        'input.experienceBeforeField').value;
    if (before == defaultExperinceBefore) before = 100;
    for (let i = 0; i < guideRows.length; i++) {
        guideRows[i].remove();
    }
    for (let guide of currentGuides) {
        if (guide.language.includes(language) &&
            guide.workExperience > from &&
            guide.workExperience < before) {
            let row = createGuideRow();
            let cols = row.children;
            let name = document.createElement('p');
            name.innerHTML = guide.name;
            let languages = document.createElement('p');
            languages.innerHTML = guide.language;
            let experience = document.createElement('p');
            if (Math.floor(
                guide.workExperience / 10) == 1 ||
                guide.workExperience % 10 > 4)
                experience.innerHTML = String(guide.workExperience) + ' лет';
            else if (guide.workExperience % 10 == 1)
                experience.innerHTML = String(guide.workExperience) + ' год';
            else experience.innerHTML = String(guide.workExperience) + ' года';
            let cost = document.createElement('p');
            cost.innerHTML = guide.pricePerHour;
            let btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-primary guideChoose';
            btn.innerHTML = 'Оформить заявку';
            cols[0].append(name);
            cols[1].append(languages);
            cols[2].append(experience);
            cols[3].append(cost);
            cols[4].append(btn);
            guideFilters.after(row);
        }
    }
}

function displayableRoutesChange() {
    displayableRoutes = [];
    let searchParam = document.body.querySelector(
        'input.searchRouteField').value.trim();
    let selectedParam = document.body.querySelector(
        'select.selectRouteField').value;
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

function guidesLoading(rowindex) {
    let url = new URL(baseURL);
    let activeRoutePage = document.body.querySelector(
        'ul.routeBtns > li > a.active');
    let routeName = globalRoutes[displayableRoutes[(
        +activeRoutePage.innerHTML - 1) * 4 + rowindex]].name;
    document.body.querySelector('i.routeName').innerHTML = routeName;
    let routeId = String(globalRoutes[
        displayableRoutes[(+activeRoutePage.innerHTML - 1) * 4 + rowindex]].id);
    url.pathname = '/api/routes/' + routeId + '/guides';
    url.searchParams.append('api_key', apiKey);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        currentGuides = this.response;
        languageDrawer();
        guidesPlacing();
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

function routeBtnClickHandler(event) {
    if (event.target.classList.contains('routeChoose')) {
        let routeChooseBtns = document.body.querySelectorAll(
            'button.routeChoose');
        for (let i = 0; i < routeChooseBtns.length; i++)
            if (routeChooseBtns[i] == event.target)
                guidesLoading(i);

    }
}

window.onload = function () {
    document.body.querySelector('ul.routeBtns').onclick = routePagination;
    document.body.querySelector(
        'input.searchRouteField').oninput = displayableRoutesChange;
    document.body.querySelector(
        'select.selectRouteField').onchange = displayableRoutesChange;
    document.body.querySelector(
        'div.routesCont').onclick = routeBtnClickHandler;
    document.body.querySelector(
        'select.languageField').onchange = guidesPlacing;
    document.body.querySelector(
        'input.experienceFromField').oninput = guidesPlacing;
    document.body.querySelector(
        'input.experienceBeforeField').oninput = guidesPlacing;
    routesLoading();
};