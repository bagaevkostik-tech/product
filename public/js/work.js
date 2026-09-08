setTimeout(() => window.location.href = `http://${getAddress()}/`, 360 * 60000)

const format1 = new Intl.NumberFormat('uk-UA', {
    style: 'decimal',
    minimumFractionDigits: 1 // Принудительно добавит два знака после запятой
});

const tableBtn = document.querySelectorAll(".tabs__nav-btn");
const tabsItems = document.querySelectorAll(".tabs__item");
const btnRequest = document.querySelector('#btnRequest')
const tableSupplys = document.getElementById('table-supplys')
const tableRecasts = document.getElementById('table-recast')
const modal = document.querySelector('#modal')
const selDate = document.querySelectorAll(".nav-date")
const ifBtn = document.querySelectorAll(".if-btn")
const ifBtnRecast = document.querySelectorAll(".if-btn_recast")
const sortSupply = document.getElementById('sortSupply'); // Флажок на сортировку
const sortRecast = document.getElementById('sortRecast'); // Флажок на сортировку
const tableSupplysList = document.getElementById('table-supplys-list')
const tableRecastsList = document.getElementById('table-recasts-list')

let arrSupplys = []
let arrRecasts = []
let activeCellSupplys = null
let activeCellRecast = null
// Создаем событие двойного клика
const eventDbclick = new MouseEvent('dblclick', {
    bubbles: true,
    cancelable: true,
    view: window
});

selDate.forEach((item) => item.addEventListener('change', clearTable))
document.getElementById('load-data').addEventListener('click', clickGetRequest)
btnRequest.addEventListener('click', reqRequest)

/* ************ Окно аккаунта user ******************** */
/*** Открыть */
document.getElementById('user').addEventListener('click', () => {
    const container = document.querySelector('.container__user__info')
    container.classList.add('open')
})

/** Закрыть */
document.getElementById('user-form-close').addEventListener('click', () => {
    const container = document.querySelector('.container__user__info')
    container.classList.remove('open')
})

/** Выход */
document.querySelector('.user__exit__btn').addEventListener('click', () => {
    window.location.href = `http://${getAddress()}/`
})

/* ************** Выбор стандартного интервала дат ************** */
document.getElementById('interval-btn').addEventListener('click', () => {
    /** Передаем id куда будет возвращены даты стандартного интервала */
    responseStart = 'dateStart'
    responseFinish = 'dateFinish'
    /* Открытие  выбора интервала */
    document.getElementById('interval-win').classList.add('open')
    clearTable()
})

document.addEventListener('mouseover', function (e) {
    // Проверяем, навели ли мы на элемент с data-tooltip
    let trigger = e.target.closest('[data-tooltip]');
    if (!trigger) return;

    // Создаем подсказку
    let tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerHTML = trigger.dataset.tooltip;
    document.body.appendChild(tooltip);

    // Позиционирование
    let coords = trigger.getBoundingClientRect();
    let left = coords.left + (trigger.offsetWidth - tooltip.offsetWidth) / 2;
    let top = coords.top - tooltip.offsetHeight - 5; // 5px выше элемента

    // Корректировка, если выходит за границы экрана
    if (left < 0) left = 0;
    if (top < 0) top = coords.bottom + 5;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('show');

    // Удаление подсказки при уходе мыши
    trigger.addEventListener('mouseout', function () {
        tooltip.remove();
    }, { once: true });
});

//Настройкаа даты, Находим все элементы с классом .date-input
document.querySelectorAll('.form-control').forEach(el => {
    new AirDatepicker(el, {
        // Общие свойства для всех элементов
        locale: {
            days: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота'],
            daysShort: ['Нед', 'Пнд', 'Вів', 'Срд', 'Чтв', 'Птн', 'Сбт'],
            daysMin: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            months: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
            monthsShort: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'],
            today: 'Сьогодні',
            clear: 'Очистити',
            dateFormat: 'dd.MM.yyyy',
            timeFormat: 'HH:mm',
            firstDay: 1
        },
        toggleSelected: false,
        dateFormat: 'dd.MM.yyyy',
        autoClose: true,
        buttons: ['today', 'clear']

    });
});

document.getElementById('if-clear').addEventListener('click', () => {
    clearTableSupplus()
    fillTableSupplys()
})

document.getElementById('if-clear-recast').addEventListener('click', () => {
    clearTableRecasts()
    fillTableRecasts()
})

// Создать новую поставку
document.getElementById('new-supply').addEventListener('click', () => {
    //alert('Вибачте, опція знаходеться у розробці.')
    window.open('supply/0', '_blank');
    //console.log(getAddress() + '/supply')
})

// Открыть учет и отчетность
document.getElementById('accounting').addEventListener('click', () => {
    //alert('Вибачте, опція знаходеться у розробці.')
    window.open('accounting', '_blank');
    //console.log(getAddress() + '/supply')
})

// Відкрити надходження
document.getElementById('open-supply').addEventListener('click', openSupply)

//Открыть поставку
tableSupplys.addEventListener('dblclick', openSupply)

function openSupply() {
    const row = tableSupplys.querySelector(' tr.selected-row');
    if (!row) {
        toast('Надходження не вибрано.')
        return
    }
    const idOpenSupply = row.dataset.id
    window.open('supply/' + idOpenSupply, '_blank');
};

// Создать новую переработку
document.getElementById('new-recast').addEventListener('click', () => { window.open('recast/0', '_blank') })

document.getElementById('new-recast-list').addEventListener('click', () => { window.open('recast/0', '_blank') })

document.getElementById('open-recast').addEventListener('click', () => openRecast())
document.getElementById('open-recast-list').addEventListener('click', () => openRecastList())

tableRecasts.addEventListener('dblclick', () => openRecast())
tableRecastsList.addEventListener('dblclick', () => openRecastList())

// Відкрити переробку
function openRecast() {
    const row = tableRecasts.querySelector('tr.selected-row')
    const id = row.dataset.id
    window.open('recast/' + id, '_blank');
}

// Відкрити переробку
function openRecastList() {
    const row = tableRecastsList.querySelector('tr.selected-row')
    const id = row.dataset.id
    window.open('recast/' + id, '_blank');
}

//Нажатие кнопки - Свернуть все
document.getElementById('collapse-all').addEventListener('click', () => {
    const rows = tableRecastsList.querySelectorAll('.row__recast')
    let row = ''
    rows.forEach(obj => {
        obj.classList.remove('active')
    })
    const rowsConvers = tableRecastsList.querySelectorAll('.row__convers')
    rowsConvers.forEach(obj => {
        const firstCell = obj.cells[0]
        if (firstCell.textContent) firstCell.textContent = '+'
    })
})

//Нежатие кнопки = Развернуть все
document.getElementById('expand-all').addEventListener('click', () => {
    const rows = tableRecastsList.querySelectorAll('.row__recast')
    rows.forEach(obj => {
        obj.classList.add('active')
    })
    const rowsConvers = tableRecastsList.querySelectorAll('.row__convers')
    rowsConvers.forEach(obj => {
        const firstCell = obj.cells[0]
        if (firstCell.textContent) firstCell.textContent = '-'
    })
})

// Печать списка Supply
document.getElementById('print-list-supplys').addEventListener('click', () => {
    const textreq = 'suplys'
    sendData(`http://${getAddress()}/users/post/15`, JSON.stringify({
        text: textreq,
        dateStart: convertDate(dateStart.value),
        dateFinish: convertDate(dateFinish.value),
        sort: sortSupply.checked
    })).then((data) => {
        if (!data.result) {
            toast(data.text)
        } else {
            const fileUrl = `http://${getAddress()}/download-static-xlsx/${data.fileName}`
            // 1. Создаем элемент <a>
            const downloadLink = document.createElement('a');
            downloadLink.href = fileUrl;

            // 2. Добавляем его в DOM (не обязательно, но полезно)
            document.body.appendChild(downloadLink);

            // 3. Программно кликаем по ссылке
            downloadLink.click();

            // 4. Удаляем элемент 
            document.body.removeChild(downloadLink);
            toast('Очікуйте завантаження.')
        }
    })
})

// Печать списка Recast
document.getElementById('print-list-recast').addEventListener('click', () => {
    console.log(arrSupplys)
    const textreq = 'recasts'
    sendData(`http://${getAddress()}/users/post/16`, JSON.stringify({
        text: textreq,
        dateStart: convertDate(dateStart.value),
        dateFinish: convertDate(dateFinish.value),
        sort: sortSupply.checked
    })).then((data) => {
        if (!data.result) {
            toast(data.text)
        } else {
            console.log(data.fileName)
            const fileUrl = `http://${getAddress()}/download-static-xlsx/${data.fileName}`
            // 1. Создаем элемент <a>
            const downloadLink = document.createElement('a');
            downloadLink.href = fileUrl;

            // 2. Добавляем его в DOM (не обязательно, но полезно)
            document.body.appendChild(downloadLink);

            // 3. Программно кликаем по ссылке
            downloadLink.click();

            // 4. Удаляем элемент 
            document.body.removeChild(downloadLink);
            toast('Очікуйте завантаження.')
        }
    })



})
//Печать переработки
document.getElementById('print-recast').addEventListener('click', () => {
    const rowByClass = tableRecasts.querySelector('.selected-row');
    if (!rowByClass) return

    sendData(`http://${getAddress()}/users/post/14`, JSON.stringify({
        textreq: 'counterparty',
        id: rowByClass.dataset.id
    })).then((data) => {
        if (!data.result) {
            toast(data.text)
        } else {
            console.log(data.fileName, `${getAddress()}`)
            const fileUrl = `http://${getAddress()}/download-static-xlsx/${data.fileName}`
            // 1. Создаем элемент <a>
            const downloadLink = document.createElement('a');
            downloadLink.href = fileUrl;

            // 2. Добавляем его в DOM (не обязательно, но полезно)
            document.body.appendChild(downloadLink);

            // 3. Программно кликаем по ссылке
            downloadLink.click();

            // 4. Удаляем элемент 
            document.body.removeChild(downloadLink);
            toast('Очікуйте завантаження.')
        }
    })
})

function sortArray(data, incr) {
    if (incr) {
        data.sort((a, b) => {
            const dateA = new Date((a.date).replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
            const dateB = new Date((b.date).replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            // Если даты равны, сортируем по строке (по названию)
            if (a.number < b.number) return -1;
            if (a.number > b.number) return 1;
            return 0;
        });
    } else {
        data.sort((b, a) => {
            const dateA = new Date((a.date).replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
            const dateB = new Date((b.date).replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1'));
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            // Если даты равны, сортируем по строке (по названию)
            if (a.number < b.number) return -1;
            if (a.number > b.number) return 1;
            return 0;
        });
    }
}

sortSupply.addEventListener('click', () => {
    if (arrSupplys.length !== 0) {
        sortArray(arrSupplys, sortSupply.checked)
        clearTableSupplus()
        fillTableSupplys()
    }
})

sortRecast.addEventListener('click', () => {
    if (arrRecasts.length !== 0) {
        sortArray(arrRecasts, sortRecast.checked)
        clearTableRecasts()
        fillTableRecasts()
    }
})

//Отбор  по  поставщику таблицы - Надходження
document.getElementById('if_provider').addEventListener('click', () => {
    if (!activeFilter()) {
        notFilter()
        const cells = findRowSelect()
        if (cells) {
            const data = { provider: cells[2].textContent }
            fillTableSupplys(data)
            document.getElementById('if_provider').classList.add('active')
        }
    }
})

//Отбор по поставщик таблицы - Перерабатка
document.getElementById('if_provider_recast').addEventListener('click', () => {
    if (!activeFilterRecast()) {
        notFilterRecast()
        const cells = findRowSelectRecast()
        if (cells) {
            const data = { provider: cells[2].textContent }
            fillTableRecasts(data)
            document.getElementById('if_provider_recast').classList.add('active')
        }
    }
})

//Отбор  по  транспорту таблицы - Надходження
document.getElementById('if_transport').addEventListener('click', () => {
    if (!activeFilter()) {
        notFilter()
        const cells = findRowSelect()
        if (cells) {
            const data = { transport: cells[4].textContent }
            fillTableSupplys(data)
            document.getElementById('if_transport').classList.add('active')
        }
    }
})

//Отбор  по  номенклатуре таблицы - Надходження
document.getElementById('if_product').addEventListener('click', () => {
    if (!activeFilter()) {
        notFilter()
        const cells = findRowSelect()
        if (cells) {
            const data = { nomenclature: cells[6].textContent }
            fillTableSupplys(data)
            document.getElementById('if_product').classList.add('active')
        }
    }
})

//Отбор по номенклатуре таблицы - Перерабатка
document.getElementById('if_product_recast').addEventListener('click', () => {
    if (!activeFilterRecast()) {
        notFilterRecast()
        const cells = findRowSelectRecast()
        if (cells) {
            const data = { product: cells[4].textContent }
            fillTableRecasts(data)
            document.getElementById('if_product_recast').classList.add('active')
        }
    }
})

//Отбор по перевозчику таблицы - Надходження
document.getElementById('if-carrier').addEventListener('click', () => {
    if (!activeFilter()) {
        notFilter()
        const cells = findRowSelect()
        if (cells) {
            const data = { carrier: cells[3].textContent }
            fillTableSupplys(data)
            document.getElementById('if-carrier').classList.add('active')
        }
    }
})

//Поиск по аргументу в таблице - Надходження
function findRowSelect() {
    const tableRows = tableSupplys.querySelectorAll("tr");
    // console.log(tableRows)
    let result = false
    for (const row of tableRows) {
        if (row.classList.value === 'selected-row') {
            result = row.querySelectorAll('td'); // Получаем все ячейки в строке
        }
    }
    return result
}

function findRowSelectRecast() {
    const tableRows = document.querySelectorAll("#table-recast tr");
    let result = false
    for (const row of tableRows) {
        if (row.classList.value === 'selected-row') {
            result = row.querySelectorAll('td'); // Получаем все ячейки в строке
        }
    }
    return result
}

//Нажатие кнопки Сформировать
function clickGetRequest(event) {
    let elementTabs = document.querySelector('.tabs__nav-btn.active');
    let idValue = elementTabs.id; // Вернет значение ID, если оно есть
    if (idValue === 'supplys-btn') {
        reqSupplys()
        sessionStorage.setItem('getSupplyData', 'true')
    } else if (idValue === 'recasts-btn') {
        // console.log(idValue)
        reqRecasts(event)
        sessionStorage.setItem('getRecastData', 'true')
    } else if (idValue === 'list-supplys-btn') {
        reqSupplysList()
    } else if (idValue === 'list-recasts-btn') {
        reqRecastsList()
    }
}


const getResorse = async (url) => {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response}`)
    }

    return await response.json()
}

const sendData = async (url, data) => {

    const response = await fetch(url, {
        method: 'POST',
        body: data,
    })

    if (!response.ok) {
        if (response.status === 401) {
            window.location.href = `http://${getAddress()}/`;
        } else {
            throw new Error(`Ошибка: ${response.status}`);
        }
    }

    return await response.json()
}

function reqRequest() {
    console.log(document.getElementById('airdatepicker').value)
    const data = {
        dateStart: dateStart.value,
        dateFinish: dateFinish.value
    }

    // getResorse(`http://${getAddress()}/supply`)
}


function getAddress() {
    let S = window.location.href;
    let newS = S.slice(S.indexOf('//') + 2)
    return newS.slice(0, newS.indexOf('/'));
}

/* Формируем, передаем для отправки POST запрос на получение данных Поставок. Сохраняем данные в массив (при их наличии),  отправляем на заполнеение таблицы */
function reqSupplys() {
    clearTableSupplus()
    sendData(`http://${getAddress()}/users/post/1`, JSON.stringify({
        text: 'supplys',
        dateStart: convertDate(dateStart.value),
        dateFinish: convertDate(dateFinish.value),
        sort: sortSupply.checked
    })).then((data) => {
        if (!data.result) { toast(data.text) } else {
            if (data.table.length === 0) {
                const tableBody = tableSupplys.querySelector('tbody')
                tableBody.innerHTML = ''
                const html = `<tr><td  colspan="11" style="text-align: center;">Немає данних</td></tr>`
                tableBody.insertAdjacentHTML('beforeend', html);
            } else {
                arrSupplys = data.table
                fillTableSupplys()
            }
        }
    })
}

/* Формируем, передаем для отправки POST запрос на получение данных Перерабоки. Сохраняем данные в массив (при их наличии),  отправляем на заполнеение таблицы */
function reqRecasts(event) {
    event.preventDefault() // Отмена перезагрузки (отправки запроса)по sabmin ?????????
    clearTableRecasts()
    const textreq = 'recasts'
    toast('Очікуйте завантаження.')
    sendData(`http://${getAddress()}/users/post/2`, JSON.stringify({
        text: 'recasts',
        dateStart: convertDate(dateStart.value),
        dateFinish: convertDate(dateFinish.value),
        sort: sortRecast.checked
    })).then((data) => {
        let html = ``

        if (data.length === 0) {
            const tableBody = tableRecasts.querySelector('tbody')
            tableBody.innerHTML = ''
            const html = `<tr><td  colspan="10" style="text-align: center;">Немає данних</td></tr>`
            tableBody.insertAdjacentHTML('beforeend', html);
        } else {
            arrRecasts = data
            fillTableRecasts()
        }
    })
}

/* POST запрос на получение данных списка Поставок.  отправляем на заполнеение таблицы */
function reqSupplysList() {
    clearTableSupplusList()
    toast('Очікуйте завантаження.')
    sendData(`http://${getAddress()}/users/post/1`, JSON.stringify({
        text: 'supplysList',
        dateStart: convertDate(dateStart.value),
        dateFinish: convertDate(dateFinish.value)
        // sort: sortSupply.checked
    })).then((data) => {
        if (!data.result) { toast('Помилка завантаження даних!') } else {
            // console.log(data)
            if (data.table.length === 0) {
                tableSupplysList.innerHTML += `<tr><td  colspan="7" style="text-align: center;">Немає данних</td></tr>`
            } else {
                fillSupplysList(data.table)
                toast('Завантажено список надходжень')
            }
        }
    })
}

/* POST запрос на получение данных списка переработок.  отправляем на заполнеение таблицы */
function reqRecastsList() {
    clearTableRecastsList()
    toast('Очікуйте завантаження.')
    sendData(`http://${getAddress()}/users/post/2`, JSON.stringify({
        text: 'recastsList',
        dateStart: convertDate(dateStart.value),
        dateFinish: convertDate(dateFinish.value)
        // sort: sortSupply.checked
    })).then((data) => {
        if (!data.result) { toast('Помилка завантаження даних!') } else {
            // console.log(data)
            if (data.table.length === 0) {
                tableRecastsList.innerHTML += `<tr><td  colspan="3" style="text-align: center;">Немає данних</td></tr>`
            } else {
                fillRecastsList(data.table, data.recasts)
                // console.log(data.recasts)
                toast('Завантажено список переробок')
            }
        }
    })
}



// ***************** Сортировка таблиц по клику на шапке ************************
function sortTable(index, header, tableID) {
    const table = document.getElementById(`${tableID}`);
    const headers = table.querySelectorAll('th');
    const tbody = table.querySelector('tbody');

    // Определяем направление сортировки
    const currentOrder = header.dataset.order || 'asc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    header.dataset.order = newOrder;

    const thDiv = header.firstElementChild;
    // Находим вообще все заголовки таблицы
    const allTh = table.querySelectorAll('th');

    // Оставляем только те, у которых внутри есть хотя бы один div
    const filteredTh = Array.from(allTh).filter(th => th.querySelector('div'));

    filteredTh.forEach(th => {
        th.firstElementChild.classList.remove('sort__up')
        th.firstElementChild.classList.remove('sort__down')
    });

    if (newOrder === 'asc') {
        thDiv.classList.add('sort__up')
        reverse = true
    } else if (newOrder === 'desc') {
        thDiv.classList.add('sort__down')
    }

    // Получаем все строки тела таблицы
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Сортируем строки
    rows.sort((rowA, rowB) => {
        const cellA = rowA.querySelectorAll('td')[index].textContent;
        const cellB = rowB.querySelectorAll('td')[index].textContent;

        const type = header.dataset.type;
        let valA, valB;
        let regex, matchA, matchB
        // let [day, month, year, hours, minutes, seconds]
        if (type === 'number') {
            // Удаляем все символы, кроме цифр, точек и запятых
            valA = parseFloat(cellA.replace(/[^\d.-]/g, '')) || 0;
            valB = parseFloat(cellB.replace(/[^\d.-]/g, '')) || 0;
            return newOrder === 'asc' ? valA - valB : valB - valA;
        } else if (type === 'dateTime') {
            //Дата с временем
            regex = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
            matchA = cellA.match(regex);
            matchB = cellB.match(regex);
            //Разбираем совпадения
            [day, month, year, hours, minutes, seconds] = matchA.slice(1).map(Number);
            //Создаем дату (в JS месяцы считаются от 0 до 11)
            valA = new Date(year, month - 1, day, hours, minutes, seconds);
            [day, month, year, hours, minutes, seconds] = matchB.slice(1).map(Number);
            valB = new Date(year, month - 1, day, hours, minutes, seconds);
            return newOrder === 'asc' ? valA - valB : valB - valA;
        } else if (type === 'date') {
            //Дата
            regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
            matchA = cellA.match(regex);
            matchB = cellB.match(regex);
            //Разбираем совпадения
            [day, month, year] = matchA.slice(1).map(Number);
            //Создаем дату (в JS месяцы считаются от 0 до 11)
            valA = new Date(year, month - 1, day);
            [day, month, year] = matchB.slice(1).map(Number);
            valB = new Date(year, month - 1, day);
            return newOrder === 'asc' ? valA - valB : valB - valA;
        } else {
            // Для строк используем locale-зависимое сравнение
            const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });
            return newOrder === 'asc' ? collator.compare(cellA, cellB) : collator.compare(cellB, cellA);
        }
    });

    // Перерисовываем таблицу отсортированными строками
    tbody.append(...rows);

}

/* ****************** Заполняем таблиу поставок, исходя из массива ******************************* */
function fillTableSupplys(data) {
    const tableBody = tableSupplys.querySelector('tbody')
    tableBody.innerHTML = ''
    let arrTemp = arrSupplys
    if (data) {
        arrTemp = []
        arrSupplys.forEach(arr => {
            if (data.provider === arr.provider || data.transport === arr.transport || data.nomenclature === arr.nomenclature || data.carrier === arr.carrier) {
                arrTemp = arrTemp.concat(arr)
            }
        })

    }
    let html = ``
    let sumQty = 0
    let sumFat = 0
    // console.log(arrTemp)
    for (let i = 0; i < arrTemp.length; i++) {
        let attribute = arrTemp[i].status ? 'red_container' : ''
        let is0dd = i % 2 ? 'even-num-tr' :''
        sumQty += Number(arrTemp[i].quantity)
        sumFat += Number(arrTemp[i].fat)
        html += `<tr class = "${attribute} ${is0dd}"  data-id="${arrTemp[i].supply}">
                <td class="nav-cell" tabindex="0">${arrTemp[i].number}</td>
                <td class="nav-cell" tabindex="0">${arrTemp[i].date}</td>
                <td class="nav-cell" tabindex="0">${arrTemp[i].provider}</td>                
                <td class="nav-cell" tabindex="0">${arrTemp[i].carrier}</td>                
                <td class="nav-cell" tabindex="0">${arrTemp[i].transport}</td>                
                <td class="nav-cell" tabindex="0">${arrTemp[i].ttn}</td>                
                <td class="nav-cell" tabindex="0">${arrTemp[i].nomenclature}</td>                
                <td class="nav-cell" tabindex="0">${arrTemp[i].pctProvider.replace('.', ',')}</td>                
                <td class="nav-cell" tabindex="0">${arrTemp[i].pctLAB.replace('.', ',')}</td>                
                <td class="nav-cell" tabindex="0" style="text-align: right;">${format1.format(arrTemp[i].quantity)}</td>                
                <td class="nav-cell" tabindex="0" style="text-align: right;">${format1.format(arrTemp[i].fat)}</td>                
                <td class="nav-cell" tabindex="0">${arrTemp[i].note}</td>                
                
                </tr>`
    }
    tableBody.insertAdjacentHTML('beforeend', html);
    document.getElementById('table-supplys-sum-qty').textContent = format1.format(sumQty)
    document.getElementById('table-supplys-sum-fat').textContent = format1.format(sumFat)

}

/* ****************** Заполняем таблиу списка поставок, исходя из массива ******************************* */
function fillSupplysList(data) {
    let html = ``
    for (let i = 0; i < data.length; i++) {
        html += `<tr  data-id="${data[i].id}">
                    <td>${data[i].num}</td>
                    <td>${data[i].date}</td>
                    <td>${data[i].provider}</td>                
                    <td>${data[i].carrier}</td>                
                    <td>${data[i].transport}</td>                
                    <td>${data[i].ttn}</td>                
                    <td>${data[i].note}</td>                
                </tr>`
    }
    tableSupplysList.innerHTML += html
}

/* ****************** Заполняем таблиу recasts, исходя из массива ******************************* */

function fillTableRecasts(data) {
    const tableBody = tableRecasts.querySelector('tbody')
    tableBody.innerHTML = ''
    let arrTemp = arrRecasts
    if (data) {
        arrTemp = []
        arrRecasts.forEach(arr => {
            if (data.provider === arr.provider || data.product === arr.product) {
                arrTemp = arrTemp.concat(arr)
            }
        })
    }
    let html = ``

    let sumFat = 0
    let sumAcid = 0
    let sumSodium = 0
    let sumFoamy = 0
    for (let i = 0; i < arrTemp.length; i++) {
        let attribute = arrTemp[i].status ? 'red_container' : ''
        let is0dd = i % 2 ? 'even-num-tr' :''
        sumFat += Number(arrTemp[i].fat)
        sumAcid += Number(arrTemp[i].acid)
        sumSodium += Number(arrTemp[i].sodium)
        sumFoamy += Number(arrTemp[i].foamy)
        html += `<tr class = "${attribute} ${is0dd}" data-id=${arrTemp[i].id}>
                <td class="nav-cell" tabindex="0">${arrTemp[i].number}</td>
                <td class="nav-cell" tabindex="0">${arrTemp[i].date}</td>
                <td class="nav-cell" tabindex="0">${arrTemp[i].provider}</td>                
                <td class="nav-cell" tabindex="0">${arrTemp[i].transport}</td>                
                <td class="nav-cell" tabindex="0">${arrTemp[i].product}</td>                
                <td class="nav-cell" tabindex="0">${arrTemp[i].percentLAB}</td>                
                <td class="nav-cell" tabindex="0" style="text-align: right;">${Number(arrTemp[i].fat).toLocaleString('ru')}</td>                
                <td class="nav-cell" tabindex="0" style="text-align: right;">${format1.format((arrTemp[i].acid))}</td>                
                <td class="nav-cell" tabindex="0" style="text-align: right;">${format1.format((arrTemp[i].sodium))}</td>                
                <td class="nav-cell" tabindex="0" style="text-align: right;">${format1.format((arrTemp[i].foamy))}</td>                
                </tr>`
    }
    tableBody.insertAdjacentHTML('beforeend', html);
    document.getElementById('table-recasts-sum-fat').textContent = Number(sumFat).toLocaleString('ukr')
    document.getElementById('table-recasts-sum-acid').textContent = format1.format(sumAcid)
    document.getElementById('table-recasts-sum-sodium').textContent = format1.format(sumSodium)
    document.getElementById('table-recasts-sum-foamy').textContent = format1.format(sumFoamy)

}

// Заполнение таблицы списка поставок
function fillRecastsList(main, data) {
    let html = ``
    let totalQty = 0
    let totalFat = 0
    let totalAcid = 0
    let totalSodium = 0
    let totalFoamy = 0

    for (let i = 0; i < main.length; i++) {
        let sumQty = 0
        let sumFat = 0
        let sumAcid = 0
        let sumSodium = 0
        let sumFoamy = 0
        let sign = ''

        val = data.filter(item => item.conversID === main[i].id)
        if (val.length) {
            sign = '-'
            for (j = 0; j < val.length; j++) {
                sumQty += +val[j].qty
                sumFat += +val[j].fat
                sumAcid += +val[j].acid
                sumSodium += +val[j].sodium
                sumFoamy += +val[j].foamy
                // console.log(val[j].qty)
            }
        }
        totalQty += sumQty
        totalFat += sumFat
        totalAcid += sumAcid
        totalSodium += sumSodium
        totalFoamy += sumFoamy
        // style="text-align: right;"
        html += `<tr class="row__convers" data-id="${main[i].id}">
                    <td>${sign}</td> 
                    <td>${main[i].num}</td>
                    <td>${main[i].date}</td>
                    <td colspan="3"></td>
                    <td style="text-align: right;">${sumQty}</td>
                    <td style="text-align: right;">${sumFat}</td>
                    <td style="text-align: right;">${sumAcid.toFixed(1).replace('.', ',')}</td>
                    <td style="text-align: right;">${sumSodium.toFixed(1).replace('.', ',')}</td>
                    <td style="text-align: right;">${sumFoamy.toFixed(1).replace('.', ',')}</td>
                </tr>
                `
        if (val.length) {
            html += `<tr class="row__recast active" data-id="${val[0].conversID}"><td colspan="11">Надходження що перероблені:</td><tr>`
            for (j = 0; j < val.length; j++) {
                html += `<tr class="row__recast active" data-id="${val[j].conversID}">
                            <td></td>
                            <td>${val[j].num}</td>
                            <td>${val[j].date}</td>
                            <td>${val[j].productName.replace('.', ',')}</td>
                            <td>${val[j].pctProvider}</td>
                            <td>${val[j].pctLAB}</td>
                            <td style="text-align: right;">${val[j].qty}</td>
                            <td style="text-align: right;">${val[j].fat}</td>
                            <td style="text-align: right;">${(+val[j].acid).toFixed(1).replace('.', ',')}</td>
                            <td style="text-align: right;">${(+val[j].sodium).toFixed(1).replace('.', ',')}</td>
                            <td style="text-align: right;">${(+val[j].foamy).toFixed(1).replace('.', ',')}</td>
                        </tr>
                        `
                // console.log(val)
            }
            html += `<tr class="row__recast active" style="height: 2px;" data-id="${val[0].conversID}"><td colspan="11"></td><tr>`
        }
    }
    tableRecastsList.innerHTML += html
    html = `
        <tfoot>
            <tr>
                <td style="text-align: right;" colspan="6">Усього:</td>
                <td style="text-align: right;">${totalQty}</td>
                <td style="text-align: right;">${totalFat}</td>
                <td style="text-align: right;">${totalAcid.toFixed(1).replace('.', ',')}</td>
                <td style="text-align: right;">${totalSodium.toFixed(1).replace('.', ',')}</td>
                <td style="text-align: right;">${totalFoamy.toFixed(1).replace('.', ',')}</td>
            </tr>
        </tfoot>
    `
    tableRecastsList.innerHTML += html

    //Устанавливаем условия при наведении на ячейку
    tableRecastsList.querySelectorAll('tr td:first-child').forEach(cell => {
        //   // Условие: если текст ячейки равен "Action"
        //   if (cell.textContent.trim() === 'Action') {
        if (cell.textContent === '+' || cell.textContent === '-') {
            cell.style.cursor = 'pointer';

            // Добавление клика
            cell.onclick = function () {
                const row = cell.closest('tr')
                const rows = tableRecastsList.querySelectorAll(`.row__recast[data-id="${row.dataset.id}"]`)
                if (cell.textContent === '-') {
                    rows.forEach(obj => {
                        obj.classList.remove('active')
                        cell.textContent = '+'
                    })
                } else {
                    rows.forEach(obj => {
                        obj.classList.add('active')
                        cell.textContent = '-'
                    })
                }
            };
        }
    });

}

//Запрос на получене данных пользователя
function initialization() {
    sendData(`http://${getAddress()}/users/post/1`, JSON.stringify({
        text: 'dataUser',
    })).then((data) => {
        if (!data.result) {
            toast(data.text)
        } else {
            document.getElementById('user').textContent = data.name
        }
    })
}



function clearTable() {
    clearTableSupplus()
    clearTableRecasts()
    clearTableSupplusList()
    clearTableRecastsList()
}

function clearTableSupplus() {
    notFilter()
    const tableBody = tableSupplys.querySelector('tbody')
    tableBody.innerHTML = ''
    document.getElementById('table-supplys-sum-qty').textContent = 0
    document.getElementById('table-supplys-sum-fat').textContent = 0

    const allTh = tableSupplys.querySelectorAll('th');

    // Оставляем только те, у которых внутри есть хотя бы один div
    const filteredTh = Array.from(allTh).filter(th => th.querySelector('div'));

    filteredTh.forEach(th => {
        th.firstElementChild.classList.remove('sort__up')
        th.firstElementChild.classList.remove('sort__down')
    });

}

function clearTableRecasts() {
    notFilterRecast()
    const tableBody = tableRecasts.querySelector('tbody')
    tableBody.textContent = ''
    document.getElementById('table-recasts-sum-fat').textContent = 0
    document.getElementById('table-recasts-sum-acid').textContent = 0
    document.getElementById('table-recasts-sum-sodium').textContent = 0
    document.getElementById('table-recasts-sum-foamy').textContent = 0

    const allTh = tableRecasts.querySelectorAll('th');

    // Оставляем только те, у которых внутри есть хотя бы один div
    const filteredTh = Array.from(allTh).filter(th => th.querySelector('div'));

    filteredTh.forEach(th => {
        th.firstElementChild.classList.remove('sort__up')
        th.firstElementChild.classList.remove('sort__down')
    });
}

function clearTableSupplusList() {
    sessionStorage.setItem('getSupplyData', 'false')
    sessionStorage.setItem('getRecastData', 'false')
    tableSupplysList.innerHTML = ''
    let htmlSupplysList = ` 

                    <thead>
                        <th  style="width: 40px;">№</th>
                        <th  style="width: 100px;">Дата</th>
                        <th  style="width: 200px;">Постачальник</th>
                        <th  style="width: 200px;">Перевізник</th>
                        <th  style="width: 200px;">Транспорт</th>
                        <th  style="width: 80px;">Номер ТТН</th>
                        <th  style="width: 160px;">Нотатки</th>
                    </thead>
`
    tableSupplysList.innerHTML += htmlSupplysList
}

function clearTableRecastsList() {
    sessionStorage.setItem('getSupplyData', 'false')
    sessionStorage.setItem('getRecastData', 'false')
    // while (tableSupplysList.rows.length > 0) {
    //     tableSupplysList.deleteRow(0);
    // }
    tableRecastsList.innerHTML = ''
    let html = ` 
                    <thead>
                        <tr>
                            <th rowspan="2" style="width: 20px;"></th>
                            <th rowspan="2" style="width: 40px;">№</th>
                            <th rowspan="2" style="width: 100px;">Дата</th>
                            <th colspan="3" style="width: 380px;">Відомості про перероблену номенклатуру.</th>
                            <th rowspan="2" style="width: 40px;">Вага, кг</th>
                            <th rowspan="2" style="width: 40px;">Жир, кг</th>
                            <th rowspan="2" style="width: 40px;">Кислота, кг</th>
                            <th rowspan="2" style="width: 40px;">Сода, кг</th>
                            <th rowspan="2" style="width: 40px;">Піногасник, кг</th>
                        </tr>
                        <tr>
                            <th  style="width: 220px;">Номенклатура</th>
                            <th  style="width: 80px;">% постачальник</th>
                            <th  style="width: 80px;">% лабораторія</th>
                        </tr>
                    </thead>
`
    tableRecastsList.innerHTML += html
}

// Выбор вкладки предназначения отета
tableBtn.forEach(function (item) {

    item.addEventListener("click", function () {
        let currentBtn = item;
        let tabId = currentBtn.getAttribute("data-tab");
        let currentTab = document.querySelector(tabId);
        // console.log(item);


        tableBtn.forEach(function (item) {
            item.classList.remove('active')
            //console.log(item);
        })

        tabsItems.forEach(function (item) {
            item.classList.remove('active');
        });

        currentBtn.classList.add('active')
        currentTab.classList.add('active')
    });
});

function notFilter() {
    ifBtn.forEach((item) => {
        item.classList.remove('active')
    })
}

function notFilterRecast() {
    ifBtnRecast.forEach((item) => {
        item.classList.remove('active')
    })
}

function activeFilter() {
    let result = false
    ifBtn.forEach((item) => {
        if (item.classList.value === 'if-btn active') result = true
    })
    return result
}

function activeFilterRecast() {
    let result = false
    ifBtnRecast.forEach((item) => {
        if (item.classList.value === 'if-btn_recast active') result = true
    })
    return result
}

// Выделение выбранной строки таблицы 
tableSupplys.querySelector('tbody').addEventListener('click', (event) => {

    if (event.target.classList.contains('nav-cell')) {
      activeCellSupplys = event.target;
      activeCellSupplys.focus();
    }

    tableSelectCell(tableSupplys, event)
});

// Перемещение с клавиатуры table Supplys
tableSupplys.querySelector('tbody').addEventListener('keydown', (e) => {
        if (!activeCellSupplys) return; // Если ячейка не выбрана, ничего не делаем

        const cells = Array.from(tableSupplys.querySelectorAll('.nav-cell'));
        const cols = tableSupplys.rows[0].cells.length; // Количество колонок в ряду
        const currentIndex = cells.indexOf(activeCellSupplys);
        let nextIndex = -1;

        switch (e.code) {
            case 'ArrowUp':
            nextIndex = currentIndex - cols;
            break;
            case 'ArrowDown':
            nextIndex = currentIndex + cols;
            break;
            case 'ArrowLeft':
            if (currentIndex % cols !== 0) nextIndex = currentIndex - 1;
            break;
            case 'ArrowRight':
            if ((currentIndex + 1) % cols !== 0) nextIndex = currentIndex + 1;
            break;
            case 'Enter':
                e.target.dispatchEvent(eventDbclick)
                break
        }

    // Если индекс корректен и ячейка существует, переводим фокус
    if (nextIndex >= 0 && nextIndex < cells.length) {
        // activeCellSupplys = cells[nextIndex];
        // activeCellSupplys.focus();
        cells[nextIndex].click()
        e.preventDefault(); // Прокрутка страницы стрелками отключается
    }
});



// Выделение выбранной строки таблицы recast
tableRecasts.querySelector('tbody').addEventListener('click', (event) => {

    if (event.target.classList.contains('nav-cell')) {
      activeCellRecast = event.target;
      activeCellRecast.focus();
    }

    tableSelectCell(tableRecasts, event)
});

// Перемещение с клавиатуры table Recasts
tableRecasts.querySelector('tbody').addEventListener('keydown', (e) => {
        if (!activeCellRecast) return; // Если ячейка не выбрана, ничего не делаем

        const cells = Array.from(tableRecasts.querySelectorAll('.nav-cell'));
        const cols = tableRecasts.rows[0].cells.length; // Количество колонок в ряду
        const currentIndex = cells.indexOf(activeCellRecast);
        let nextIndex = -1;

        switch (e.code) {
            case 'ArrowUp':
            nextIndex = currentIndex - cols;
            break;
            case 'ArrowDown':
            nextIndex = currentIndex + cols;
            break;
            case 'ArrowLeft':
            if (currentIndex % cols !== 0) nextIndex = currentIndex - 1;
            break;
            case 'ArrowRight':
            if ((currentIndex + 1) % cols !== 0) nextIndex = currentIndex + 1;
            break;
            case 'Enter':
                e.target.dispatchEvent(eventDbclick)
                break
        }

    // Если индекс корректен и ячейка существует, переводим фокус
    if (nextIndex >= 0 && nextIndex < cells.length) {
        // activeCellSupplys = cells[nextIndex];
        // activeCellSupplys.focus();
        cells[nextIndex].click()
        e.preventDefault(); // Прокрутка страницы стрелками отключается
    }
});

// Выделение выбранной строки таблицы списка переработок
tableRecastsList.addEventListener('click', (e) => {
    if (e.target.tagName === 'TD') {
        const row = e.target.closest('tr')
        const classList = row.classList.value
        if (lcassList.includes("row__convers") && e.target.cellIndex !== 0) {
            tableSelectCell(tableRecastsList, e)
        }
    }

});

//Выделение строки в таблице
function tableSelectCell(table, event) {
    table.querySelectorAll('.selected-cell').forEach(row => row.classList.remove('selected-cell'));
    table.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));

    // Если кликнули по ячейке
    if (event.target.tagName === 'TD') {
        const cell = event.target;
        const row = cell.parentElement;

        cell.classList.add('selected-cell');
        row.classList.add('selected-row');
    }
}

initialization()

// Всплывающее сообщение
function toast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Добавляем класс 'show' для анимации появления
    setTimeout(() => {
        toast.classList.add('show');
    }, 10); // Небольшая задержка для корректной работы transition

    // Удаляем сообщение через некоторое время (например, 3 секунды)
    setTimeout(() => {
        toast.classList.remove('show');
        // Удаляем из DOM после завершения анимации
        setTimeout(() => {
            toast.remove();
        }, 600);
    }, 3000);
};

function getRandomFoto() {
    setTimeout(() => getRandomFoto(), 30 * 60000)
    const randomNum = Math.floor(Math.random() * 10) + 1 // 1 - 10
    const fotos = document.querySelectorAll('.foto')
    fotos.forEach(function (item) {
        item.classList.remove('active');
        if (item.dataset.num == randomNum) {
            item.classList.add('active')
        }
    });
}

// Установка значений при открытии
getRandomFoto()
clearTable()
if (!dateFinish.value) dateFinish.value = formatDateUA(new Date())
if (!dateStart.value) dateStart.value = formatDateFirstDayUA(new Date())

// Формат даты yyyy-mm-01
function formatDateFirstDay(d) {
    return [
        d.getFullYear(),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        '01'
    ].join('-');
}

// Формат даты 01.mm.yyyy
function formatDateFirstDayUA(d) {
    return [
        '01',
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getFullYear()
    ].join('.');
}

// Формат даты yyyy-mm-dd
function formatDate(d) {
    return [
        d.getFullYear(),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getDate().toString().padStart(2, '0')
    ].join('-');
}

// Формат даты dd.mm.yyyy
function formatDateUA(d) {
    return [
        d.getDate().toString().padStart(2, '0'),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getFullYear()
    ].join('.');
}

// Возвращаем строку в формате yyyy-mm-dd
function convertDate(dateStr) {
    // Разделяем строку по точке
    const parts = dateStr.split('.');
    // parts[0] - день, parts[1] - месяц, parts[2] - год

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

//Всплывающая подсказка
let tooltipElem
document.onmouseover = (e) => {
    let target = e.target
    let tooltipHtml = target.dataset.tooltip
    if (!tooltipHtml) return
    tooltipElem = document.createElement('div')
    tooltipElem.className = 'tooltip'
    tooltipElem.innerHTML = tooltipHtml
    document.body.append(tooltipElem)

    let coords = target.getBoundingClientRect()
    let left = coords.left + (target.offsetWidth - tooltipElem.offsetWidth) / 2
    if (left < 0) left = 5


    let top = coords.top - tooltipElem.offsetHeight - 5
    if (top < 0) top = coords.top + tooltipElem.offsetHeight + 5

    tooltipElem.style.left = left + 'px'
    tooltipElem.style.top = top + 'px'
}

document.onmouseout = (e) => {
    if (tooltipElem) {
        tooltipElem.remove()
        tooltipElem = null
    }
}
