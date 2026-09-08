const format2 = new Intl.NumberFormat('uk-UA', {
    style: 'decimal',
    minimumFractionDigits: 2 // Принудительно добавит два знака после запятой
});

const tableProductsChoice = document.getElementById('table-products-choice')
// const modal = document.querySelectorAll('.modal')
const backdrop = document.querySelectorAll('.inform__form-backdrop')


const tabsBtn = document.querySelectorAll('.tabs__btn')
const tabs = document.querySelectorAll('.container__tab')
const tableCounterparties = document.getElementById('table-counterparties')
const tableTransports = document.getElementById('table-transport') 
const tableProducts = document.getElementById('table-product')
const tableInform = document.getElementById('table-inform')
const tableReport = document.getElementById('table-report')
const tbodyReport = tableReport.querySelector('tbody')

const inputCounterpartyID = document.getElementById('counterparty-id')
const inputCounterpartyName = document.getElementById('counterparty-name')
const inputCounterpartyFullName = document.getElementById('counterparty-full-name')
const inputCounterpartyOKPO = document.getElementById('counterparty-OKPO')
const inputCounterpartyAddress = document.getElementById('counterparty-address')
const inputCounterpartyTelefon = document.getElementById('counterparty-telefon')
// const inputCounterpartyType = document.getElementById('counterparty-documents_id')
const inputCounterpartyIDBAS = document.getElementById('counterparty-id-bas')
const selectConterpartyType = document.getElementById('counterparty-type')

const inputTransportID = document.getElementById('transport-id')
const inputTransportName = document.getElementById('transport-name')
const inputTractorName = document.getElementById('tractor-name')
const inputTrailerName = document.getElementById('trailer-name')
const inputTractorModel = document.getElementById('tractor-model')
const inputTractorWeight = document.getElementById('tractor-weight')
const inputTractorWeightFull = document.getElementById('tractor-weight-full')
const inputTractorSize = document.getElementById('tractor-size')
const inputTrailerModel = document.getElementById('trailer-model')
const inputTrailerWeight = document.getElementById('trailer-weight')
const inputTrailerWeightFull = document.getElementById('trailer-weight-full')
const inputTrailerSize = document.getElementById('trailer-size')
const inputDriver = document.getElementById('driver')
const inputDriverLicense = document.getElementById('driver-license')
const inputTransportIDBAS = document.getElementById('transport-id-bas')

const inputProductID = document.getElementById('product-id')
const inputProductName = document.getElementById('product-name')
const inputProductFullName = document.getElementById('product-full-name')
const inputProductIDBAS = document.getElementById('product-id-bas')

const inputReportDateFinish =document.getElementById('report-date-finish')
const inputReportDateStart = document.getElementById('report-date-start')
const inputReportDateOn = document.getElementById('report-date-on')
const selectReport = document.getElementById('report-select')
const checkboxReport = document.getElementById('report-checkbox')
const reportOB = document.getElementById('report-OB')
const reportPS = document.getElementById('report-PS')
const reportNS = document.getElementById('report-NS')
const reportEB = document.getElementById('report-EB')

let arrCounterparties = []
let arrTransports = []
let arrProducts = []
let arrTurnover = []
let arrReport = []
let numberRow  = 0

//Сортировка в таблицах
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
            let [day, month, year] = matchA.slice(1).map(Number);
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

/* ************** Выбор стандартного интервала дат ************** */
document.getElementById('interval-btn').addEventListener('click', () => {
/** Передаем id куда будет возвращены даты стандартного интервала */
    responseStart = 'report-date-start'
    responseFinish = 'report-date-finish'
/* Открытие  выбора интервала */
    document.getElementById('interval-win').classList.add('open')
    clearTableReport()
})


//Изменение checkbox Report
checkboxReport.addEventListener('click', () => {
    // Проверяем, стоит ли галочка (true или false)
    const btn = document.querySelector('.btn__interval')
    if (checkboxReport.checked) {
        inputReportDateStart.parentElement.classList.add('invisible')
        inputReportDateFinish.parentElement.classList.add('invisible')
        btn.classList.add('invisible')
        inputReportDateOn.parentElement.classList.remove('invisible')
    } else {
        inputReportDateStart.parentElement.classList.remove('invisible')
        inputReportDateFinish.parentElement.classList.remove('invisible')
        btn.classList.remove('invisible')
        inputReportDateOn.parentElement.classList.add('invisible')
    }    
})

// Выделение выбранной строки таблицы контрагентов
tableCounterparties.addEventListener('click', (event) => {
    const unitID = selectedCell(event, tableCounterparties)
    if (unitID) {
        const unit = arrCounterparties.find(el => el.id === +unitID)
        setUnitCounterparty(unit)
    }
})

// Выделение выбранной строки таблицы транспорт
tableTransports.addEventListener('click', (event) => {
    const unitID = selectedCell(event, tableTransports)
    if (unitID) {
        const unit = arrTransports.find(el => el.id === +unitID)
        setUnitTransport(unit)
    }
})

// Выделение выбранной строки таблицы product
tableProducts.addEventListener('click', (event) => {
    const unitID = selectedCell(event, tableProducts)
    if (unitID) {
        const unit = arrProducts.find(el => el.id === +unitID)
        setUnitProduct(unit)
    }
})

// Выделение выбранной строки таблицы product
tableInform.addEventListener('click', (event) => {
    const unitID = selectedCell(event, tableInform)
    if (unitID) {
        const unit = arrProducts.find(el => el.id === +unitID)
        setUnitProduct(unit)
    }
})

// Общая функция для выделения строки
function selectedCell(event, table) {
    table.querySelectorAll('.selected-cell').forEach(cell => cell.classList.remove('selected-cell'));
    table.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));

    // Если кликнули по ячейке
    if (event.target.tagName === 'TD') {
        const cell = event.target;
        const row = cell.parentElement;

        cell.classList.add('selected-cell');
        row.classList.add('selected-row');
        return row.dataset.id
    }
};

// Устанавливаем значения элемента справочника Контрагенты
function setUnitCounterparty(unit) {
    if (!unit) return
    inputCounterpartyID.value = unit.id
    inputCounterpartyName.value = unit.name
    inputCounterpartyFullName.value = unit.fullName
    inputCounterpartyOKPO.value = unit.OKPO
    inputCounterpartyAddress.value = unit.address
    inputCounterpartyTelefon.value = unit.telefon
    inputCounterpartyIDBAS.value = unit.id_bas
    if (unit.type === 1) {
        selectConterpartyType.value = 1
    } else {
        selectConterpartyType.value = 0
    }
}

// Устанавливаем значения элемента справочника транспорт
function setUnitTransport(unit) {
    if (!unit) return
    inputTransportID.value = unit.id
    inputTransportName.value = unit.name
    inputTractorName.value = unit.tractorName
    inputTrailerName.value = unit.trailerName
    inputTractorModel.value = unit.tractorModel
    inputTractorWeight.value = unit.tractorWeight
    inputTractorWeightFull.value = unit.tractorWeightFull
    inputTractorSize.value = unit.tractorSize
    inputTrailerModel.value = unit.trailerModel
    inputTrailerWeight.value = unit.trailerWeight
    inputTrailerWeightFull.value = unit.trailerWeightFull
    inputTrailerSize.value = unit.trailerSize
    inputDriver.value = unit.driver
    inputDriverLicense.value = unit.driverLicense
    inputTransportIDBAS.value = unit.id_bas
}

// Устанавливаем значения элемента справочника prodduct
function setUnitProduct(unit) {
    if (!unit) return
    inputProductID.value = unit.id
    inputProductName.value = unit.name
    inputProductFullName.value = unit.fullName
    inputProductIDBAS.value = unit.id_bas
}

//Получение значений элемента Контрагент
function getUnitCounterparty() {
    const result = {
        id: +inputCounterpartyID.value.replaceAll("'", "`"),
        name: inputCounterpartyName.value.replaceAll("'", "`"),
        fullName: inputCounterpartyFullName.value.replaceAll("'", "`"),
        OKPO: inputCounterpartyOKPO.value.replaceAll("'", "`"),
        address: inputCounterpartyAddress.value.replaceAll("'", "`"),
        telefon: inputCounterpartyTelefon.value.replaceAll("'", "`"),
        id_bas: inputCounterpartyIDBAS.value.replaceAll("'", "`"),
    }
    return result
}

//Получение значений элемента Транспорт
function getUnitTransport() {
    const result = {
    id: inputTransportID.value.replaceAll("'", "`"),
    name: inputTransportName.value.replaceAll("'", "`"),
    tractorName: inputTractorName.value.replaceAll("'", "`"),
    trailerName: inputTrailerName.value.replaceAll("'", "`"),
    tractorModel: inputTractorModel.value.replaceAll("'", "`"),
    tractorWeight: inputTractorWeight.value.replaceAll("'", "`"),
    tractorWeightFull: inputTractorWeightFull.value.replaceAll("'", "`"),
    tractorSize: inputTractorSize.value.replaceAll("'", "`"),
    trailerModel: inputTrailerModel.value.replaceAll("'", "`"),
    trailerWeight: inputTrailerWeight.value.replaceAll("'", "`"),
    trailerWeightFull: inputTrailerWeightFull.value.replaceAll("'", "`"),
    trailerSize: inputTrailerSize.value.replaceAll("'", "`"),
    driver: inputDriver.value.replaceAll("'", "`"),
    driverLicense: inputDriverLicense.value.replaceAll("'", "`"),
    id_bas: inputTransportIDBAS.value.replaceAll("'", "`")  
    }
    return result
}

//Получение значений элемента product
function getUnitProduct() {
    const result = {
    id: inputProductID.value.replaceAll("'", "`"),
    name: inputProductName.value.replaceAll("'", "`"),
    fullName: inputProductFullName.value.replaceAll("'", "`"),
    id_bas: inputProductIDBAS.value.replaceAll("'", "`")  
    }
    return result
}

//Командная панель Контрагенты
//Обновить список контрагентов
document.getElementById('counterparty-update').addEventListener('click', () => {
    reqCounterparties()
    clearInputsCounterparty()
})

//Очистить inputs в разделе контрагенты
function clearInputsCounterparty() {
    const container = document.querySelector('#tab_3');
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = ''
    });

    tableCounterparties.querySelectorAll('.selected-cell').forEach(cell => cell.classList.remove('selected-cell'));
    tableCounterparties.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));
}

// Добавить нового контрагента
document.getElementById('counterparty-add').addEventListener('click', () => {clearInputsCounterparty()})

// Получение днных для фильтрации Контрагентов
document.getElementById('input-find-counterparty').addEventListener('input', () => {
    const text = document.getElementById('input-find-counterparty').value
    const temp = document.getElementById('input-find-counterparty').value
    fillTableCounterpaties(text)
    document.getElementById('input-find-counterparty').value = temp
})

//Команднаяя панель транспорт
//Обновить список транспорт
document.getElementById('transport-update').addEventListener('click', () => {
    reqTransports()
    clearInputsTransport()
})

//Очистить inputs в разделе транспорт
function clearInputsTransport() {
    const container = document.querySelector('#tab_4');
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = ''
    });

    tableTransports.querySelectorAll('.selected-cell').forEach(cell => cell.classList.remove('selected-cell'));
    tableTransports.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));
}

// Добавить новый транспорт
document.getElementById('transport-add').addEventListener('click', () => {clearInputsTransport()})

// Получение днных для фильтрации transport
document.getElementById('input-find-transport').addEventListener('input', () => {
    const text = document.getElementById('input-find-transport').value
    const temp = document.getElementById('input-find-transport').value
    fillTableTtansports(text)
    document.getElementById('input-find-transport').value = temp
})

//Сформировать название транспорта
document.getElementById('autoName').addEventListener('click', () => {
    const tractor = inputTractorName.value
    const trailer = inputTrailerName.value
    inputTransportName.value = tractor + ' / ' + trailer
})

//Команднаяя панель product
//Обновить список product
document.getElementById('product-update').addEventListener('click', () => {
    reqProducts()
    clearInputsProduct()
})

// Очистить данные в input
function clearInputsProduct() {
    const container = document.querySelector('#tab_5');
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = ''
    });

    tableProducts.querySelectorAll('.selected-cell').forEach(cell => cell.classList.remove('selected-cell'));
    tableProducts.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));
}

// Добавить новый product
document.getElementById('product-add').addEventListener('click', () => {clearInputsProduct()})

//Сохранить product
document.getElementById('product-save').addEventListener('click', reqSaveProduct)

// Получение днных для фильтрации product
document.getElementById('input-find-product').addEventListener('input', () => {
    const text = document.getElementById('input-find-product').value
    const temp = document.getElementById('input-find-product').value
    fillTableProducts(text)
    document.getElementById('input-find-product').value = temp
})

// Обработка выбора вкладки операций
tabsBtn.forEach((element) => {
    element.addEventListener('click', (btn) => {
        tabsBtn.forEach((el) => {el.classList.remove('active')})
        tabs.forEach((tab) => {tab.classList.remove('active')})
        const choiceTab = document.getElementById(btn.target.dataset.tab)
        choiceTab.classList.add('active')
        btn.target.classList.add('active')
    })
})

// Отправка запроса
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

function getAddress() {
    let S = window.location.href;
    let newS = S.slice(S.indexOf('//') + 2)
    return newS.slice(0, newS.indexOf('/'));
}

/* POST запрос на получение данных справочника контрагенты */
function reqCounterparties() {
    sendData(`http://${getAddress()}/users/post/4`, JSON.stringify({
        text: 'counterpaties'
    })).then((data) => {
        arrCounterparties = data.table
        fillTableCounterpaties()
        toast('Довідник контрагенти завантажено.')
    })
}

/* POST запрос на получение данных справочника transport */
function reqTransports() {
    sendData(`http://${getAddress()}/users/post/4`, JSON.stringify({
        text: 'transports'
    })).then((data) => {
        arrTransports = data.table
        fillTableTtansports()
        toast('Довідник транспорт завантажено.')
    })
}

/* POST запрос на получение данных справочника products */
function reqProducts() {
    sendData(`http://${getAddress()}/users/post/4`, JSON.stringify({
        text: 'products'
    })).then((data) => {
            if (data.result) {
                arrProducts = data.table
                fillTableProducts()
                toast('Довідник номенклатури завантажено.')
            } else {toast(data.text)}
        })
}

//Запрос на сохранние контрагента
function reqSaveCounterparty() {
    if (!inputCounterpartyName.value) {
        toast('Заповніть назву!')
        return
    }
    // console.log(textreq)
    sendData(`http://${getAddress()}/users/post/12`, JSON.stringify({
        textreq: 'counterparty',
        table: getUnitCounterparty()
    })).then((data) => {
        if (!data.result) {
            toast('Помика збереження!')
        } else {
            inputCounterpartyID.value = data.id
            arrCounterparties = data.table
            fillTableCounterpaties()
            toast('Контрагента збережено.')
        }
    })
}

//Запрос на удаление контрагента
function reqDeleteItemDirectory(directory) {
    let table
    switch(directory) {
        case 'counterparties':
            table = tableCounterparties
            break
        case 'transports':
            table = tableTransports
            break
        case 'products':
            table = tableProducts
            break
        default:
            return
    }
    const item = table.querySelector('tr.selected-row')
    if (!item)  return
    if (!confirm('Ви впевнені що треба продовжити видалення?')) return

    sendData(`http://${getAddress()}/users/post/5`, JSON.stringify({
        text: 'deleteDirectoryItemCounterparty',
        id: item.dataset.id,
        directory: directory
    })).then((data) => {
        if (!data.result) {
            toast(data.text)
            if (data.listRow) {
                data.directory = directory
                openInform(data)
            }
        } else {
    switch(directory) {
        case 'counterparties':
            toast('Контрагента видалено.')
            clearInputsCounterparty()
            arrCounterparties = data.table
            fillTableCounterpaties()
            break
        case 'transports':
            toast('Транспорт видалено.')
            clearInputsTransport()
            arrTransports = data.table
            fillTableTtansports()
            break
        case 'products':
            toast('Номенклатуру видалено.')
            clearInputsProduct()
            arrProducts = data.table
            fillTableProducts()
            break
    }            

        }
    })
}

//Запрос на сохранние транспорта
function reqSaveTransport() {
    if (!inputTransportName.value) {
        toast('Заповніть назву!')
        return
    }
    sendData(`http://${getAddress()}/users/post/12`, JSON.stringify({
        textreq: 'transport',
        table: getUnitTransport()
    })).then((data) => {
        if (!data.result) {
            toast('Помика збереження!')
        } else {
            inputTransportID.value = data.id
            arrTransports = data.table
            fillTableTtansports()
            toast('Транспорт збережено.')
        }
    })
}

//Запрос на сохранние product
function reqSaveProduct() {
    if (!inputProductName.value) {
        toast('Заповніть назву!')
        return
    }
    sendData(`http://${getAddress()}/users/post/12`, JSON.stringify({
        textreq: 'product',
        table: getUnitProduct()
    })).then((data) => {
        if (!data.result) {
            toast('Помика збереження!')
        } else {
            inputProductID.value = data.id
            arrProducts = data.table
            fillTableProducts()
            toast('Номенклатару збережено.')
        }
    })
}

//Запрос данных отчета
function reqTurnoverBalance() {
    let dateStart
    let dateFinish
    if (checkboxReport.checked) {
        dateStart = convertDateOpen(inputReportDateOn.value)
        dateFinish = convertDateEnd(inputReportDateOn.value)
    } else {
        dateStart = convertDateOpen(inputReportDateStart.value)
        dateFinish = convertDateEnd(inputReportDateFinish.value)
    }    

    sendData(`http://${getAddress()}/users/post/4`, JSON.stringify({
        text: 'turnoverBalance',
        dateStart: dateStart,
        dateFinish: dateFinish,
        productID: selectReport.value
    })).then((data) => {
        if (!data.result) {
            toast(data.text)
        } else {
            arrReport = data.turnover
            fillTableReport()
            reportOB.textContent = format2.format(data.balance[0].OB)
            reportPS.textContent = format2.format(data.balance[0].PS)
            reportNS.textContent = format2.format(data.balance[0].NS)
            reportEB.textContent = format2.format(data.balance[0].EB)
        }
    })
}

// Запрос POST инициализация справочников
function reqinitializationAccounting() {
    sendData(`http://${getAddress()}/users/post/4`, JSON.stringify({
        text: 'initializationAccounting'
        })).then((data) => {
        if (!data.result) {
            toast(data.text)
        } else {
            arrProducts = data.products
            fillTableProducts()
            arrTransports =data.transports
            fillTableTtansports()
            arrCounterparties = data.counterparties
            fillTableCounterpaties()
            toast('Початкове налаштування пройшло успішно.')
        }
    })
}

//Инициализация формы
function initialization() {
    inputReportDateFinish.value = formatDateUA(new Date())
    inputReportDateStart.value = formatDateFirstDayUA(new Date())
    inputReportDateOn.value = formatDateUA(new Date())


    inputCounterpartyID.readOnly = true
    inputTransportID.readOnly = true
    inputProductID.readOnly = true
    reqinitializationAccounting()

}

//Заполнение таблицы выбора конрагентов
function fillTableCounterpaties(data) {

    if (arrCounterparties.length === 0) return false
    let arrTemp = arrCounterparties
    if (data) {
        arrTemp = []
        const regex = new RegExp(data, 'i');;
        arrTemp = arrCounterparties.filter(item => regex.test(item.name) || regex.test(item.OKPO))
    }
    tableCounterparties.innerHTML = `
                <thead>
                    <tr>
                        <th  style="width: 300px;">Найменування</th>
                        <th  style="width: 140px;">Код за ЄДРПОУ/РНОКПП</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
    `
    const tableBody = document.querySelector('#table-counterparties tbody');

    let html = ``

    if (arrTemp.length !== 0) {
        for (let i = 0; i < arrTemp.length; i++) {
            html += `<tr data-id="${arrTemp[i].id}" data-name="${arrTemp[i].name}">
                        <td >${arrTemp[i].name}</td>
                        <td style="text-align: center;">${arrTemp[i].OKPO}</td>
                    </tr>`
        }
        tableBody.insertAdjacentHTML('beforeend', html);
        document.getElementById('input-find-counterparty').value = ''
        if (inputCounterpartyID.value) {
            const id = inputCounterpartyID.value
            const selectedRow = tableCounterparties.querySelector(`tr[data-id="${id}"]`);
            console.log(selectedRow)
            // Прокручиваем таблицу так, чтобы строка оказалась в центре видимой области
            selectedRow.scrollIntoView({
                behavior: 'smooth', 
                block: 'center'
            });
        
            // Добавляем класс для визуального выделения (например, подсветки)
            selectedRow.classList.add('selected-row');
        }
    }
}

/**************** Модальное окно с ифрмацией при удалении */
//Открытие окна с информацией
function openInform(data) {
    document.getElementById('directory-name').textContent = data.directory
    let arr
    let nameItem
    switch(data.directory) {
        case 'counterparties':
            arr = arrCounterparties
            nameItem = 'контрагента'
            break
        case 'transports':
            arr = arrTransports
            nameItem = 'транспорта'
            break
        case 'products':
            arr = arrProducts
            nameItem = 'номенклатури'
            break
        default:
            return

    }
    const item = arr.find(obj => obj.id === +data.id)
    // console.log(data)
    const textHead = `Видалення ${nameItem}: "${item.name}" неможливо, бо його використано в наступних записах:`
    document.getElementById('inform-head').textContent = textHead
    const tableBody = tableInform.querySelector('tbody')
    tableBody.textContent = ''
    let html = ''
    data.listRow.forEach((row) => {
        const textRow = `Надходження № ${row.number} від ${row.date} p.`
        html += `<tr data-id="${row.id}">
                    <td>${textRow}</td>
                </tr>
        `
    })
    tableBody.insertAdjacentHTML('beforeend', html);


    document.getElementById('inform-win').classList.add('open')
}

function closeModal() {
    document.getElementById('inform-win').classList.remove('open')
}

tableInform.addEventListener('dblclick', (e) => {
    const targetTd = e.target.closest('td');
    if (!targetTd) return
    // Находим ближайший tr, на который кликнули
    const tr = e.target.closest('tr');
    window.open('supply/' + tr.dataset.id, '_blank');
})

/**  Конец вывода при удалении */
//Заполнение таблицы выбора транспорта
function fillTableTtansports(data) {
    if (arrTransports.length === 0) return false
    let arrTemp = arrTransports
    if (data) {
        arrTemp = []
        const regex = new RegExp(data, 'i');;
        arrTemp = arrTransports.filter(item => regex.test(item.name))
    }
    tableTransports.innerHTML =`
                <thead>
                    <tr>
                        <th  style="width: 300px;">Найменування</th>
                        <th  >Модель тягача</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
    `
    const tableBody = document.querySelector('#table-transport tbody');
    let html = ``

    if (arrTemp.length !== 0) {
        for (let i = 0; i < arrTemp.length; i++) {
            html += `<tr data-id="${arrTemp[i].id}" data-name="${arrTemp[i].name}">
                        <td >${arrTemp[i].name}</td>
                        <td>${arrTemp[i].tractorModel}</td>                
                    </tr>`
        }
        tableBody.insertAdjacentHTML('beforeend', html);
        document.getElementById('input-find-transport').value =''
        if (inputTransportID.value) {
            const id = inputTransportID.value
            const selectedRow = tableTransports.querySelector(`tr[data-id="${id}"]`);
            // Прокручиваем таблицу так, чтобы строка оказалась в центре видимой области
            selectedRow.scrollIntoView({
                behavior: 'smooth', 
                block: 'center'
            });
        
            // Добавляем класс для визуального выделения (например, подсветки)
            selectedRow.classList.add('selected-row');
        }
    }

}

//Заполнение таблицы выбора product
function fillTableProducts(data) {
    if (arrProducts.length === 0) return false
    let arrTemp = arrProducts
    if (data) {
        arrTemp = []
        const regex = new RegExp(data, 'i');;
        arrTemp = arrProducts.filter(item => regex.test(item.name))
    }
    tableProducts.innerHTML =`
                <thead>
                    <tr>
                        <th>Найменування</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
    `
    const tableBody = document.querySelector('#table-product tbody');
    let html = ``

    if (arrTemp.length !== 0) {
        for (let i = 0; i < arrTemp.length; i++) {
            html += `<tr data-id="${arrTemp[i].id}" data-name="${arrTemp[i].name}">
                        <td >${arrTemp[i].name}</td>
                    </tr>`
        }
        tableBody.insertAdjacentHTML('beforeend', html);
        document.getElementById('input-find-product').value =''
        if (inputProductID.value) {
            const id = inputProductID.value
            const selectedRow = tableProducts.querySelector(`tr[data-id="${id}"]`);
            // Прокручиваем таблицу так, чтобы строка оказалась в центре видимой области
            selectedRow.scrollIntoView({
                behavior: 'smooth', 
                block: 'center'
            });
        
            // Добавляем класс для визуального выделения (например, подсветки)
            selectedRow.classList.add('selected-row');
        }
    }
}

function clearTableReport() {
    tbodyReport.innerHTML = ''
    reportOB.textContent = '0,00'
    reportPS.textContent ='0,00'
    reportNS.textContent = '0,00'
    reportEB.textContent ='0,00'
    //Убираем класс сортировки
    // Находим вообще все заголовки таблицы
    const allTh = tableReport.querySelectorAll('th');

    // Оставляем только те, у которых внутри есть хотя бы один div
    const filteredTh = Array.from(allTh).filter(th => th.querySelector('div'));

    filteredTh.forEach(th => {
        th.firstElementChild.classList.remove('sort__up')
        th.firstElementChild.classList.remove('sort__down')
    });
    
}

//Заполнение таблицы отчета
function fillTableReport() {
    clearTableReport()
    if (!arrReport.length) return

    let html = ``
    arrReport.forEach(row => {
        const textColor = row.qty < 0 ? 'class="text__red"' : ''
        const qty = Number(row.qty)
        html += `<tr data-id="${row.storage_id}">
                    <td style="text-align: center;">${row.date}</td>
                    <td >${row.document}</td>
                    <td style="text-align: right;" ${textColor}>${format2.format(qty)}</td>
                </tr>`
    })        
    tbodyReport.insertAdjacentHTML('beforeend', html);
}

initialization()

//Проверка  адекватности даты
function isValidDateTime(str) {
  // 1. Проверяем формат и извлекаем компоненты
  const regex = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
  const match = str.match(regex);
  
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // В JS месяцы считаются с 0
  const year = parseInt(match[3], 10);
  const hours = parseInt(match[4], 10);
  const minutes = parseInt(match[5], 10);
  const seconds = parseInt(match[6], 10);

  // 2. Создаем объект даты
  const date = new Date(year, month, day, hours, minutes, seconds);

  // 3. Проверяем, не получилась ли "Invalid Date",
  // и совпадают ли введенные числа с полученной датой 
  // (это предотвращает автоперенос дней, например 31.02 -> 03.03)
  return !isNaN(date.getTime()) &&
         date.getDate() === day &&
         date.getMonth() === month &&
         date.getFullYear() === year &&
         date.getHours() === hours &&
         date.getMinutes() === minutes &&
         date.getSeconds() === seconds;
}

//Локализация каалендаря
document.querySelectorAll('.form-control').forEach(el => {
    new AirDatepicker(el, {
        locale: {
            days: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота'],
            daysShort: ['Нед', 'Пнд', 'Вів', 'Срд', 'Чтв', 'Птн', 'Сбт'],
            daysMin: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            months: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
            monthsShort: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'],
            today: 'Сьогодні',
            clear: 'Очистити',
            dateFormat: 'dd.MM.yyyy',
            firstDay: 1
        },
        toggleSelected: false,
        // timepicker: true,
        // timeFormat: '00:00:00',
        dateFormat: 'dd.MM.yyyy',
        autoClose: true,
        buttons: ['today', 'clear'],
        weekends: [6,0]
    });
});

//Локализация каалендаря HH:mm:ss
document.querySelectorAll('.form-control-time').forEach(el => {
    new AirDatepicker(el, {
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
        timepicker: true,
        timeFormat: '00:00:00',
        dateFormat: 'dd.MM.yyyy',
        autoClose: true,
        buttons: ['today', 'clear'],
        weekends: [6,0]
    });
});


// Формат даты yyyy-mm-dd
function formatDateUs(d) {
    return [
        d.getFullYear(),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getDate().toString().padStart(2, '0'),
    ].join('-');
}

// Формат даты dd.mm.yyyy 00:00:00
function formatDate0(d) {
    return [
        d.getDate().toString().padStart(2, '0'),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getFullYear() + ' 00:00:00'
    ].join('.');
}

  // Возвращаем строку в формате yyyy-mm-dd 
function convertDate(dateStr) {
  // Разделяем строку по точке
  const parts = dateStr.split('.'); 
  // parts[0] - день, parts[1] - месяц, parts[2] - год
  
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

  // Возвращаем строку в формате yyyy-mm-dd 00:00:00
function convertDateOpen(dateStr) {
  // Разделяем строку по точке
  const parts = dateStr.split('.'); 
  // parts[0] - день, parts[1] - месяц, parts[2] - год
  
  return `${parts[2]}-${parts[1]}-${parts[0]} 00:00:00`;
}

  // Возвращаем строку в формате yyyy-mm-dd 23:59:59
function convertDateEnd(dateStr) {
  // Разделяем строку по точке
  const parts = dateStr.split('.'); 
  // parts[0] - день, parts[1] - месяц, parts[2] - год
  
  return `${parts[2]}-${parts[1]}-${parts[0]} 23:59:59`;
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


    let top = coords.top - tooltipElem.offsetHeight -5
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
}

// Формат даты dd.mm.yyyy
function formatDateUA(d) {
    return [
        d.getDate().toString().padStart(2, '0'),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getFullYear()
    ].join('.');
}

// Формат даты 01.mm.yyyy
function formatDateFirstDayUA(d) {
    return [
        '01',
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getFullYear()
    ].join('.');
}

// Округляет до 1 знакa innput
function formatInput1Sign(input) {
    if (input.value) {
        if (+input.value < 0) input.value = 0
        input.value = parseFloat(input.value).toFixed(1);
    }
}

