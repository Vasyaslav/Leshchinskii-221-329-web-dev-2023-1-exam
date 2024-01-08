'use strict';

let apiKey = '98e88cae-0dd8-4880-a68c-25873de4a2ca';
let baseURL = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
let globalRoutes; // Все маршруты
let displayableRoutes = []; //Отображаемые маршруты(зависят от инпута и селекта)
let currentGuides; // Гиды для выбранного маршрута
let defaultSearchWord = ''; // Значение по умолчанию строки поиска
let defaultSelectedWord = 'Основной объект'; // Значение по умолчанию селекта
let defaultLanguage = 'Язык экскурсии'; // Значение по умолчанию селекта языка
let defaultExperinceFrom = ''; // Значение по умолчанию минимального опыта
let defaultExperinceBefore = ''; // Значение по умолчанию максимального опыта
let guideServiceCost; // Почасовая оплата выбранного гида
// Ниже описание модификаторов стоимости экскурсии
// Стоимость гида в час, количество часов, будни или нет,
// утро/вечер или нет, кол-во посетителей,
// множитель за опцию 1 (7-ая опция в Задание.pdf),
// активна ли надбавка за опцию 2 (4).
let finalCostModifiers = [guideServiceCost, 1, 1.0, 0, 1, 1.0, false];

function finalCostCalculator() {
    // Вычисление стоимости экскурсии с учётом всех факторов(день, время и т.п.)
    console.log('Модификаторы: ', finalCostModifiers);
    let costForPeople;
    if (finalCostModifiers[4] < 6) costForPeople = 0;
    else if (finalCostModifiers[4] < 11) costForPeople = 1000;
    else costForPeople = 1500;
    let finalCost = (finalCostModifiers[0] * finalCostModifiers[1] *
        finalCostModifiers[2] + finalCostModifiers[3] + costForPeople) *
        finalCostModifiers[5] +
        finalCostModifiers[6] * 1000 * finalCostModifiers[4];
    let finalCostSpan = document.getElementById('finalRouteCost');
    console.log('Итоговая цена = ', finalCost);
    finalCostSpan.innerHTML = finalCost;
    return finalCost;
}

function createGuideRow() {
    // Создание рядов для размещения гидов
    let row = document.createElement('div');
    row.className = 'row guideRow px-0 mx-1';
    let col = document.createElement('div');
    col.className = 'col-lg-2 col-sm-4 border border-3 guideCol1';
    let bigCol = document.createElement('div');
    bigCol.className = 'col-lg-4 col-sm-8 border border-3 guideCol2';
    row.append(col);
    row.append(bigCol);
    for (let i = 0; i < 3; i++) {
        let col = document.createElement('div');
        col.className = `col-lg-2 col-sm-4 border border-3 guideCol${i + 3}`;
        row.append(col);
    }
    return row;
}

function routesBtnCreator() {
    // Создание кнопок для маршрутов
    if (displayableRoutes.length == 0) return;
    let paginationBtn = document.createElement('li');
    paginationBtn.classList.add('page-item');
    paginationBtn.innerHTML = '<a class="page-link" href="#">1</a>';
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
    // Создание и заполнение рядов для маршрутов
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
        btn.className = 'btn btn-success routeChoose';
        btn.innerHTML = 'Выбрать';
        cols[0].append(name);
        cols[1].append(description);
        cols[2].append(mainObject);
        cols[3].append(btn);
    }
}

function languageDrawer() {
    // Заполнение select с языками гидов
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
    // Размещение гидов
    let guideRows = document.body.querySelectorAll('div.guideRow');
    let guides = document.body.querySelector('div.guides');
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
            cost.innerHTML = guide.pricePerHour + '₽';
            let btn = document.createElement('button');
            btn.className = 'btn btn-secondary guideChoose';
            btn.setAttribute('data-bs-toggle', 'modal');
            btn.setAttribute('data-bs-target', '#guideModal');
            btn.innerHTML = 'Оформить заявку';
            cols[0].append(name);
            cols[1].append(languages);
            cols[2].append(experience);
            cols[3].append(cost);
            cols[4].append(btn);
            guides.append(row);
        }
    }
}

function displayableRoutesChange() {
    // Заполнение массива displayableRoutes индексами маршрутов
    // из массива со всеми маршрутами (globalRoutes), которые
    // подходят под критерии select'а с объектами
    // и строки поиска маршрута по названию
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
    // Получение списка всех маршрутов, выполняется только 1 раз
    // при загрузке страницы
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
    // Получение списка всех гидов для выбранного маршрута,
    // выполняется каждый раз при выборе нового маршрута
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
    // Обработка нажатия на кнопки стрелок среди
    // кнопок переключения страниц маршрутов
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
    // Обработка нажатия на кнопки с числами среди
    // кнопок переключения страниц маршрутов
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
    // Проверка какая кнопка пагинации (числовая или со стрелкой) нажата
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

function routeBtnHandler(event) {
    // Обработка нажатия на кнопку выбора маршрута
    if (event.target.classList.contains('routeChoose')) {
        let guidesCont = document.body.querySelector('div.guidesCont');
        guidesCont.classList.remove('hidden');
        let routeChooseBtns = document.body.querySelectorAll(
            'button.routeChoose');
        for (let i = 0; i < routeChooseBtns.length; i++)
            if (routeChooseBtns[i] == event.target)
                guidesLoading(i);

    }
}

function optionsHandler(event) {
    // Обработка выбора опций в модальном окне
    if (document.getElementById('option1').checked)
        finalCostModifiers[5] = 1.5;
    else
        finalCostModifiers[5] = 1.0;
    if (document.getElementById('option2').checked)
        finalCostModifiers[6] = true;
    else
        finalCostModifiers[6] = false;

    finalCostCalculator();
}

function dateHandler(event) {
    // Обработка выбора даты в модальном окне
    let date = new Date(document.getElementById('routeDate').value);
    if (date.getDay() == 0 || date.getDay() == 6) {
        finalCostModifiers[2] = 1.5;
    } else
        finalCostModifiers[2] = 1.0;
    finalCostCalculator();
}

function timeHandler(event) {
    // Обработка выбора времени в модальном окне
    let time = +document.getElementById('routeTime').value.split(':')[0];
    if (time < 12) finalCostModifiers[3] = 400;
    else if (time >= 20) finalCostModifiers[3] = 1000;
    else finalCostModifiers[3] = 0;
    finalCostCalculator();
}

function durationHandler(event) {
    // Обработка выбора длительности экскурсии в модальном окне
    let duration = +document.getElementById('routeDuration').value;
    finalCostModifiers[1] = duration;
    finalCostCalculator();
}

function peopleHandler(event) {
    // Обработка выбора количество человек в модальном окне
    let people = +document.getElementById('routePeople').value;
    finalCostModifiers[4] = people;
    finalCostCalculator();
}

function changeModal(guideName, routeName) {
    // Функция заполняющая модальное окно данными при выборе гида,
    // также очищающая из модального окна старые данные и
    // сбрысывающие значения модификаторов стоимости в finalCostModifiers
    let guide = document.getElementById('guideModalName');
    let route = document.getElementById('routeModalName');
    guide.innerHTML = guideName;
    route.innerHTML = routeName;
    let date = document.getElementById('routeDate');
    let now = new Date();
    date.value = String(now.getFullYear()) + '-01-' + '01';
    dateHandler();
    let time = document.getElementById('routeTime');
    time.value = '12:00';
    timeHandler();
    let duration = document.getElementById('routeDuration');
    duration.value = "1";
    durationHandler();
    let people = document.getElementById('routePeople');
    people.value = 1;
    peopleHandler();
    let option1 = document.getElementById('option1');
    let option2 = document.getElementById('option2');
    option1.checked = false;
    option2.checked = false;
    optionsHandler();
    let finalCostSpan = document.getElementById('finalRouteCost');
    finalCostSpan.innerHTML = finalCostCalculator();
}

function guideBtnHandler(event) {
    // Обработка нажатия кнопки оформления заявки
    if (event.target.classList.contains('guideChoose')) {
        let row = event.target.closest('.guideRow');
        let guideName = row.firstElementChild.innerText;
        guideServiceCost = row.children[3].innerText;
        finalCostModifiers[0] = +guideServiceCost.slice(
            0, guideServiceCost.length - 1);
        let routeName = document.body.querySelector('i.routeName').innerText;
        console.log('Данные о гиде ', guideName, routeName, guideServiceCost);
        changeModal(guideName, routeName);
    }
}

window.onload = function () {
    document.body.querySelector('ul.routeBtns').onclick = routePagination;
    document.body.querySelector(
        'input.searchRouteField').oninput = displayableRoutesChange;
    document.body.querySelector(
        'select.selectRouteField').onchange = displayableRoutesChange;
    document.body.querySelector(
        'div.routesCont').onclick = routeBtnHandler;
    document.body.querySelector(
        'select.languageField').onchange = guidesPlacing;
    document.body.querySelector(
        'input.experienceFromField').oninput = guidesPlacing;
    document.body.querySelector(
        'input.experienceBeforeField').oninput = guidesPlacing;
    routesLoading();
    document.body.querySelector('div.guides').onclick = guideBtnHandler;
    document.getElementById('routeDate').onchange = dateHandler;
    document.getElementById('routeTime').onchange = timeHandler;
    document.getElementById('routeDuration').onchange = durationHandler;
    document.getElementById('routePeople').onchange = peopleHandler;
    document.getElementById('option1').onchange = optionsHandler;
    document.getElementById('option2').onchange = optionsHandler;
};