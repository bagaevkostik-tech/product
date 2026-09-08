const selectProvider = document.getElementById('provider')
const selectCarrier = document.getElementById('carrier')
const selectTransport = document.getElementById('transport')
const modal = document.querySelectorAll('.modal')
const modal2 = document.querySelectorAll('.modal2')
const backdrop = document.querySelectorAll('.modal-backdrop')
const backdrop2 = document.querySelectorAll('.modal-backdrop2')
const counterparty = document.getElementById('input-counterparty')
const transport = document.getElementById('input-transport')
const tableCounterparties = document.getElementById('table-counterparties')
const tableTransports = document.getElementById('table-transports')
const tableProductsChoice = document.getElementById('table-products-choice')
const idSupply = document.getElementById('id-supply')
const numberSupply = document.getElementById('number-supply')
const dateSupply = document.getElementById('dateSupply')
const tableSupply = document.getElementById('product-table'); // Получаем ссылку на таблицу номенклатуры поставки

let supplyID = ''
let numberRow = 0
let productID

let arrQuickList = []
let arrQuickProviders = []
let arrQuickCarriers = []
let arrQuickTransports = []
let arrQuickProducts = []
let arrCounterparties = []
let arrTransports = []
let arrProducts = []
let valSelect
let arrSupply = []
let arrTable = []
let arrMainStart
let arrTableStart
let transportID = ''
let counterpartyID = ''
let arrTransport
let arrCounterparty

//Кнопки сохранения
document.getElementById('save-btn').addEventListener('click', () => {
    reqSaveSupply()
})

document.getElementById('save-exit-btn').addEventListener('click', () => {
    reqSaveSupply()
    setTimeout(() => {
        window.close()
    }, 100);
})

//Закрыть текущую вкладку
document.getElementById('exit-btn').addEventListener('click', () => {
    const arrMainHere = createArraySave()
    const arrTableHere = fillArrTable()
    if (JSON.stringify(arrMainStart) !== JSON.stringify(arrMainHere) || JSON.stringify(arrTableStart) !== JSON.stringify(arrTableHere)) {
        let userConfirmed = confirm("Зберегти зміни?");
        if (userConfirmed) {
            reqSaveSupply()
            setTimeout(() => {
                window.close()
            },100);
        } 
    }
    window.close()
})

//Создание архива для отправки на сохранение данных поставки
function createArraySave() {
    const result = {
        result: true,
        text: '',
        id: supplyID, //(idSupply.textContent == 0) ? '' : +idSupply.textContent,
        number: numberSupply.value,
        date: convertDate( dateSupply.value),
        ttn: document.getElementById('ttn').value,
        provider: +document.getElementById('provider').value,
        carrier: +document.getElementById('carrier').value,
        transport: +document.getElementById('transport').value,
        notes: document.getElementById('notes').value.replaceAll("'", "`")
    }
    return result
}

// Редактировать номер поставки разрешить
document.getElementById('edit-number-btn').addEventListener('click', () => numberSupply.readOnly = false)

//Завершение редактирования номера поставки
numberSupply.addEventListener('change', () => numberSupply.readOnly = true)

// Получение днных для фильтрации таблицы
counterparty.addEventListener('input', () => {
    const text = counterparty.value
    if (text) { fillTableCounterpaties(text) } else { fillTableCounterpaties() }
})

// Получение днных для фильтрации таблицы
transport.addEventListener('input', () => {
    const text = transport.value
    if (text) { fillTableTtansports(text) } else { fillTableTtansports() }
})

document.getElementById('counterparties-btn').addEventListener('click', () => {
    valSelect = 'provider'
    fillTableCounterpaties()
    document.getElementById('counterparties').classList.add('open')
})
document.getElementById('counterparty-btn').addEventListener('click', () => { setSelect('#table-counterparties') })
document.getElementById('transport-btn').addEventListener('click', () => { setSelect('#table-transports') })
document.querySelector('#product-btn').addEventListener('click', () => setSelectProduct())
document.getElementById('counterparties-delete-btn').addEventListener('click', () => selectProvider.value = '')
document.getElementById('carriers-delete-btn').addEventListener('click', () => selectCarrier.value = '')
document.getElementById('transport-delete-btn').addEventListener('click', () => selectTransport.value = '')
//Двойной клик таблица выбора 
// Добавляем слушатель события
tableCounterparties.addEventListener('dblclick', function (event) {
    setSelect('#table-counterparties')
});

tableTransports.addEventListener('dblclick', function (event) {
    setSelect('#table-transports')
});

tableProductsChoice.addEventListener('dblclick', function (event) {
    setSelectProduct()
});

document.getElementById('carriers-btn').addEventListener('click', () => {
    valSelect = 'carrier'
    fillTableCounterpaties()
    document.getElementById('counterparties').classList.add('open')
})

document.querySelector('#transports-btn').addEventListener('click', () => {
    valSelect = 'transport'
    fillTableTtansports()
    document.getElementById('transports').classList.add('open')
})
// Закрытие модальных окон
backdrop.forEach((item) => {
    item.addEventListener("click", () => modal.forEach((item) => { item.classList.remove('open') }));
});

backdrop2.forEach((item) => {
    item.addEventListener("click", () => modal2.forEach((item) => { item.classList.remove('open') }));
});

// Создание архива таблицы
function fillArrTable() {
    arrTable = []
    const rows = tableSupply.querySelectorAll('tbody tr'); // Получаем все строки
    // console.log(rows)
    for (let i = 0; i < rows.length; i++) { // Перебираем строки
        const inputs = rows[i].getElementsByTagName("input");
        const selects = rows[i].getElementsByTagName('select')
        const tds = rows[i].querySelectorAll('td')
        if (selects[0].value) {
            arrTable.push({
                sel: +selects[0].value,
                inp1: +inputs[0].value,
                inp2: +inputs[1].value,
                Fat: +tds[3].textContent,
                percent_lab: +tds[4].textContent
            })
        }
    }
    return arrTable
}
// Разрешить рeдактирование строк
document.getElementById('read-only-not').addEventListener('click', () => {
    const rows = tableSupply.querySelectorAll('tbody tr'); // Получаем все строки
    for (let i = 0; i < rows.length; i++) { // Перебираем строки
        const inputs = rows[i].getElementsByTagName("input");
        const tds = rows[i].querySelectorAll('td')
        tds[0].classList.remove('locked-cell')
        tds[1].classList.remove('locked-cell')
        inputs[0].classList.add('green')
    }
})

//Добавляем строку  в талицу номенклатуры
document.getElementById('new-row-btn').addEventListener('click', () => {addRowTable()})

function addRowTable(data) {
    let tableBody = document.querySelector("#product-table tbody");
        // console.log(tableBody)

    let cycles = data ? data.length : 1
    let htmlTbody = ''
    for (i =0; i < cycles; i ++) {
        html = ''
        numberRow++
        let classDelete = 'deleteOn'
        let valQty = ''
        let valPct = ''
        let fat = ''
        let pctLAB =''
        let classInput = 'green'
        let lockedCell = ''
        if (data) {
            valQty = data[i].qty
            valPct = data[i].pctProvider
            fat = +data[i].fat
            pctLAB = data[i].percent_lab
            if (data[i].fat) {
                lockedCell = 'locked-cell'
                labelSelect = ''
                classDelete = ''
                classInput = ''
            }

        }
        html = `
                    <tr class="${classDelete}">
                        <td class="container__product ${lockedCell}">
                            <div class="select__product">    
                                <select name="selectTable" id="product-${numberRow}">
                                </select>
                            </div>
                        <label for="product-${numberRow}" class="lable__table"></label>
                        </td>
                        <td class="${lockedCell}">
                            <input type="number" class="input__table ${classInput}" value="${valQty}" 
                            onchange="this.value = parseFloat(this.value).toFixed(0),calcSum()" onfocus="this.select();">
                        </td>
                        <td >
                            <input type="number" class="input__table green" value="${valPct}" 
                            onchange="this.value = parseFloat(this.value).toFixed(2),calcSum()" onfocus="this.select();">
                        </td>
                        <td class="locked-cell" style="font-size: 1.2rem; text-align: right; padding-right: 10px; color: #333;">
                        ${fat}</td>
                        <td style="display: none;">${pctLAB}</td>
                    </tr>
        `
        tableBody.insertAdjacentHTML('beforeend', html);
        if (data) {
            newOption = new Option(data[i].productName, data[i].productID);
            document.getElementById(`product-${numberRow}`).options.add(newOption, 0);
            document.getElementById(`product-${numberRow}`).value = data[i].productID;
            if (data[i].fatat) {
                document.getElementById(`product-${numberRow}`).disabled = true
                document.getElementById(`input0-${numberRow}`).readOnly = true
            }
        }
        calcSum()
    }
    document.querySelectorAll('.lable__table').forEach((item) => {
        item.addEventListener('click', () => {
            productID = item.getAttribute('for')
            fillTableProductsChoice()
        })
    })
    fillSelectListProducts()
}

//Востанавливаем данные таблицы
function fillTableSupply() {
    console.log(arrTable)
    const rows = tableSupply.querySelectorAll('tbody tr'); // Получаем все строки
    for (let i = 0; i < rows.length; i++) { // Перебираем строки
        const inputs = rows[i].getElementsByTagName("input");
        const selects = rows[i].getElementsByTagName('select')
        // // Получаем все ячейки в текущей строке
        if (i < arrTable.length) {
            selects[0].value = arrTable[i].sel
            inputs[0].value = arrTable[i].inp1
            inputs[1].value = arrTable[i].inp2
        }

    }
}

function calcSum() {
    let sum = 0
    let inputs = tableSupply.querySelectorAll('tr td:nth-child(2) input');
    inputs.forEach(input => {
        let value = parseFloat(input.value) || 0;
        sum += value;
    });
    document.getElementById("sum-qty").textContent = sum;
    sum = 0
    cells = tableSupply.querySelectorAll("tbody tr td:nth-child(4)");
    cells.forEach(cell => {
        value = parseFloat(cell.textContent) || 0;
        sum += value;
    });
    document.getElementById("sum-fat").textContent = sum;
}

//Удалить рядок таблицы
document.getElementById('delete-row-btn').addEventListener('click', () => {
    const rowByClass = tableSupply.querySelector('.selected-row');
    if (rowByClass.classList.value == "deleteOn selected-row") {
        rowByClass.remove();
    }
})

function closeModal() {
    modal.forEach((item) => {
        item.classList.remove('open')
    });
}

// Выделение выбранной строки таблицы выбора контрагента
tableCounterparties.addEventListener('click', function (event) {
    tableCounterparties.querySelectorAll('.selected-cell').forEach(cell => cell.classList.remove('selected-cell'));
    tableCounterparties.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));

    // Если кликнули по ячейке
    if (event.target.tagName === 'TD') {
        const cell = event.target;
        const row = cell.parentElement;

        cell.classList.add('selected-cell');
        row.classList.add('selected-row');
    }
});

// Выделение выбранной строки таблицы выбора транспорта
tableTransports.addEventListener('click', function (event) {
    // Удаляем класс выделения со всех ячеек и строк
    tableTransports.querySelectorAll('.selected-cell').forEach(cell => cell.classList.remove('selected-cell'));
    tableTransports.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));

    // Если кликнули по ячейке
    if (event.target.tagName === 'TD') {
        const cell = event.target;
        const row = cell.parentElement;

        cell.classList.add('selected-cell');
        row.classList.add('selected-row');
    }
});

// Выделение выбранной строки таблицы выбора номенклатуры
tableProductsChoice.addEventListener('click', (event) => {
    tableProductsChoice.querySelectorAll('.selected-cell').forEach(cell => cell.classList.remove('selected-cell'));
    tableProductsChoice.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));

    // Если кликнули по ячейке
    if (event.target.tagName === 'TD') {
        const cell = event.target;
        const row = cell.parentElement;

        cell.classList.add('selected-cell');
        row.classList.add('selected-row');
    }
});

// Выделение выбранной строки таблицы номенклатуры
tableSupply.addEventListener('click', (event) => {
    tableSupply.querySelectorAll('.selected-cell').forEach(cell => cell.classList.remove('selected-cell'));
    tableSupply.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));

    // Если кликнули по ячейке
    if (event.target.tagName === 'TD') {
        const cell = event.target;

        const row = cell.parentElement;

        cell.classList.add('selected-cell');
        row.classList.add('selected-row');
    }
    // Проверяем, был ли клик по элементу <input>
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
        // Находим ближайшую родительскую строку (tr)
        const cell = event.target.closest('td');
        const row = event.target.closest('tr');

        if (row) {
            cell.classList.toggle('selected-cell');
            row.classList.toggle('selected-row');
        }
    }

});

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
        if (data.result) {
            arrCounterparties = data.table
            fillTableCounterpaties()
            toast('Довідник контрагенти завантажено.')
        } else {toast(data.text)}
    })
}

/* POST запрос на получение данных справочника transport */
function reqTransports() {
    sendData(`http://${getAddress()}/users/post/4`, JSON.stringify({
        text: 'transports'
    })).then((data) => {
        if (data.result) {
            arrTransports = data.table
            fillTableTtansports()
            toast('Довідник транспорт завантажено.')
        } else {toast(data.text)}
    })
}

/* POST запрос на получение данных справочника products */
function reqProducts() {
    sendData(`http://${getAddress()}/users/post/4`, JSON.stringify({
        text: 'products'
    })).then((data) => {
        if (data.result) {
            arrProducts = data.table
            toast('Довідник номенклатури завантажено.')
        } else {toast(data.text)}
    })
}


/* POST запрос на получение данных заполнения новой поставки */
function initialization() {
    // console.log(convertDate(dateSupply.value))
    reqCounterparties()
    reqTransports()
    reqProducts()
    numberSupply.readOnly = true
    sendData(`http://${getAddress()}/users/post/3`, JSON.stringify({
        text: 'supply',
    })).then((data) => {
        if (!data.result) {toast(data.text)}
        else {
            fillSelectList(data.quickList)
            if (+idSupply.textContent !== 0) { reqOpenSupply() } else {
                arrMainStart = createArraySave()
                arrTableStart = fillArrTable()
            }
        }
    })
}

//Запрос POST на открытие поставки
function reqOpenSupply() {
    toast('Очікуйте завантаження.')
    sendData(`http://${getAddress()}/users/post/11`, JSON.stringify({
        text: 'openSupply',
        id: +idSupply.textContent
    })).then((data) => {
        if (!data.result) {
            toast(data.text)
        } else {
            if (data.quickList) {fillQuickList(data.quickList)}
            const main = data.main[0]
            const table = data.table
            supplyID = main.id
            numberSupply.value = main.number
            dateSupply.value = formatDate1(new Date(main.date))
            document.getElementById('ttn').value = main.ttn
            document.getElementById('notes').value = main.notes.replaceAll("`", "'")
            let newOption
            let optionToFind
            // Ищем option с определенным value
            optionToFind = selectProvider.querySelector(`option[value="${main.Provider}"]`);

            // Если не нашли, добавляем
            if (!optionToFind) {
                newOption = new Option(main.nameProvider, main.Provider);
                selectProvider.appendChild(newOption, 0);
            }
            selectProvider.value = main.Provider;

            // Ищем option с определенным value
            optionToFind = selectCarrier.querySelector(`option[value="${main.Carrier}"]`);

            // Если не нашли, добавляем
            if (!optionToFind) {
                newOption = new Option(main.nameCarrier, main.Carrier);
                selectCarrier.appendChild(newOption, 0);
            }
            selectCarrier.value = main.Carrier;

            // Ищем option с определенным value
            optionToFind = selectTransport.querySelector(`option[value="${main.Transport}"]`);

            // Если не нашли, добавляем
            if (!optionToFind) {
                newOption = new Option(main.nameTransport, main.Transport);
                selectTransport.appendChild(newOption, 0);
            }
            selectTransport.value = main.Transport;
            addRowTable(table)
            toast('Завантажено!')
            arrMainStart = createArraySave()
            arrTableStart = fillArrTable()
        }
    })

}

// Запрос на сохранение данных поставки
function reqSaveSupply() {
    fillArrTable()
    fillQuickList()
    sendData(`http://${getAddress()}/users/post/10`, JSON.stringify({
        text: 'saveSupply',
        main: createArraySave(),
        table: arrTable,
        quickList: arrQuickList,
        arrQuickProviders: arrQuickProviders
    })).then((data) => {
        if (!data.result) {
            toast(data.text)
        } else {
            if (+idSupply.textContent === 0) {
                window.location.href = `http://${getAddress()}/supply/${data.main.id}`
            }
            arrSupply = data.main
            //idSupply.textContent = data.main.id
            numberSupply.value = data.main.number
            toast('Надходження збережено.')
        }
    })
    arrMainStart = createArraySave()
    arrTableStart = fillArrTable()
}

//Формирование массива для сохранения
function fillQuickList() {
    arrQuickList = []
    arrQuickProviders.reverse().forEach((obj) => {
        arrQuickList.unshift({ type: 'Provider', id: obj.value, name: obj.text })
    })
    arrQuickCarriers.reverse().forEach((obj) => {
        arrQuickList.unshift({ type: 'Carrier', id: obj.value, name: obj.text })
    })
    arrQuickTransports.reverse().forEach((obj) => {
        arrQuickList.unshift({ type: 'Transport', id: obj.value, name: obj.text })
    })
    arrQuickProducts.reverse().forEach((obj) => {
        arrQuickList.unshift({ type: 'Nomenclature', id: obj.value, name: obj.text })
    })
    // console.log(arrQuickList)
    return arrQuickList
}

//Запрос на сохранние контрагента
function reqSaveCounterparty() {
    if (!inputCounterpartyName.value) {
        toast('Заповніть назву!')
        return
    }
    const textreq = 'counterparty'
    // console.log(textreq)
    sendData(`http://${getAddress()}/users/post/12`, JSON.stringify({
        textreq: textreq,
        table: fillArrCouterparty()
    })).then((data) => {
        if (!data.result) {
            toast('Помика збереження!')
        } else {
            counterpartyID = data.id
            document.getElementById('counterparty-form-name').textContent = 'Перегляд (редагування) контрагента'
            arrCounterparty = fillArrCouterparty()
            // reqCounterparties()
            arrCounterparties = data.table
            fillTableCounterpaties()
            toast('Контрагента збережено.')
        }
    })
}

//Запрос на сохранние транспорта
function reqSaveTransport() {
    if (!inputTransportName.value) {
        toast('Заповніть назву!')
        return
    }
    const textreq = 'transport'
    // console.log(textreq)
    sendData(`http://${getAddress()}/users/post/12`, JSON.stringify({
        textreq: textreq,
        table: fillArrTransport()
    })).then((data) => {
        if (!data.result) {
            toast('Помика збереження!')
        } else {
            transportID = data.id
            document.getElementById('transport-form-name').textContent = 'Перегляд (редагування) транспорту'
            arrTransport = fillArrTransport()
            arrTransports = data.table
            fillTableTtansports()
            toast('Транспорт збережено.')
        }
    })
}

//Заполнение таблицы выбора конрагентов
function fillTableCounterpaties(data) {

    if (arrCounterparties.length === 0) return false
    let arrTemp = arrCounterparties
    if (data) {
        arrTemp = []
        const regex = new RegExp(data, 'i');;
        arrTemp = arrCounterparties.filter(item => regex.test(item.name))
    }
    tableCounterparties.innerHTML = `
                <thead>
                    <tr>
                        <th  style="width: 300px;">Найменування</th>
                        <th  style="width: 140px;">Код за ЄДРПОУ</th>
                        <th  >Повне найменування</th>
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
                        <td >${arrTemp[i].OKPO}</td>
                        <td>${arrTemp[i].fullName}</td>                
                    </tr>`
        }
        tableBody.insertAdjacentHTML('beforeend', html);
        if (counterpartyID){
            const id = counterpartyID
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

// Создание нового элемента контрагент
document.getElementById('unit-counterparty-btn').addEventListener('click', () => {
    document.getElementById('counterparty-form-name').textContent = 'Створення нового контрагента'
    clearInputs()
    document.getElementById('unit-counterparty').classList.add('open')
    arrCounterparty = fillArrCouterparty()
})

//Открытие контагента
document.getElementById('open-counterparty-btn').addEventListener('click', () => {
    const rowByClass = tableCounterparties.querySelector('.selected-row');
    if (!rowByClass) return
    const unitID = rowByClass.dataset.id
    sendData(`http://${getAddress()}/users/post/13`, JSON.stringify({
        textreq: 'counterparty',
        id: rowByClass.dataset.id
    })).then((data) => {
        if (!data.result) {
            toast('Помика отримання даних!')
        } else {
            clearInputs()
            counterpartyID = data.id
            inputCounterpartyName.value = data.name.replaceAll("`", "'")
            inputCounterpartyFullName.value = data.fullName.replaceAll("`", "'")
            inputCounterpartyOKPO.value = data.OKPO
            inputCounterpartyAddress.value = data.address.replaceAll("`", "'")
            inputCounterpartyTelefon.value = data.telefon
            inputCounterpartyType.value = data.type
            inputCounterpartyIDBAS.value = data.id_bas

            arrCounterparty = fillArrCouterparty()

            document.getElementById('counterparty-form-name').textContent = 'Перегляд (редагування) контрагента'
            document.getElementById('unit-counterparty').classList.add('open')
            toast('Інформацію завантажено.')
            // console.log(data)
        }
    })
    // console.log(data)
})

//Сохранить контрагента
document.getElementById('counterparty-save').addEventListener('click', () => reqSaveCounterparty())

//Сохранить и закрыть карточку контрагента
document.getElementById('counterparty-save-exit').addEventListener('click', () => {
    if (!inputCounterpartyName.value) {
        toast('Заповніть назву!')
        return
    }
    reqSaveCounterparty()

    document.getElementById('unit-counterparty').classList.remove('open')
})

//Закрыть карточку countterparty
document.getElementById('counterparty-exit').addEventListener('click', () => {
    const arrHere = fillArrCouterparty()

    if (JSON.stringify(arrCounterparty) !== JSON.stringify(arrHere)) {
        let userConfirmed = confirm("Зберегти зміни?");
        if (userConfirmed) {
            reqSaveCounterparty()
        }
    }
    document.getElementById('unit-counterparty').classList.remove('open')
})

// Создание нового элемента трранспорт
document.querySelector('#unit-transport-btn').addEventListener('click', () => {
    document.getElementById('transport-form-name').textContent = 'Створення нового транспорта'
    clearInputs()
    document.getElementById('unit-transport').classList.add('open')
    arrTransport = fillArrTransport()
})

//Открытие транспорта
document.querySelector('#open-transport-btn').addEventListener('click', () => {
    const rowByClass = tableTransports.querySelector('.selected-row');
    if (!rowByClass) return
    const unitID = rowByClass.dataset.id
    sendData(`http://${getAddress()}/users/post/13`, JSON.stringify({
        textreq: 'transport',
        id: rowByClass.dataset.id
    })).then((data) => {
        if (!data.result) {
            toast('Помика отримання даних!')
        } else {
            clearInputs()
            transportID = data.id
            inputTransportName.value = data.name.replaceAll("`", "'")
            inputTractorName.value = data.TractorName.replaceAll("`", "'")
            inputTractorModel.value = data.TractorModel.replaceAll("`", "'")
            inputTractorWeight.value = data.TractorWeight.replaceAll("`", "'")
            inputTractorWeightFull.value = data.TractorWeightFull.replaceAll("`", "'")
            inputTractorSize.value = data.TractorSize.replaceAll("`", "'")
            inputTrailerName.value = data.TrailerName.replaceAll("`", "'")
            inputTrailerModel.value = data.TrailerModel.replaceAll("`", "'")
            inputTrailerWeight.value = data.TrailerWeight.replaceAll("`", "'")
            inputTrailerWeightFull.value = data.TrailerWeightFull.replaceAll("`", "'")
            inputTrailerSize.value = data.TrailerSize.replaceAll("`", "'")
            inputDriver.value = data.Driver.replaceAll("`", "'")
            inputDriverLicense.value = data.DriverLicense.replaceAll("`", "'")

            arrTransport = fillArrTransport()

            document.getElementById('transport-form-name').textContent = 'Перегляд (редагування) транспорту'
            document.getElementById('unit-transport').classList.add('open')
            toast('Інформацію завантажено.')
            // console.log(data)
        }
    })
    // console.log(data)
})

//Сохранить транспорт
document.getElementById('transport-save').addEventListener('click', () => reqSaveTransport())

//Сохранить и закрыть карточку транспоорта
document.getElementById('transport-save-exit').addEventListener('click', () => {
    if (!inputTransportName.value) {
        toast('Заповніть назву!')
        return
    }
    reqSaveTransport()

    document.getElementById('unit-transport').classList.remove('open')
})

//Закрыть карточку транспоорта
document.getElementById('transport-exit').addEventListener('click', () => {
    const arrHere = fillArrTransport()

    if (JSON.stringify(arrTransport) !== JSON.stringify(arrHere)) {
        let userConfirmed = confirm("Зберегти зміни?");
        if (userConfirmed) {
            reqSaveTransport()
        }
    }
    document.getElementById('unit-transport').classList.remove('open')
})

function clearInputs() {
    counterpartyID = ''
    transportID = ''

    inputCounterpartyName.value = ''
    inputCounterpartyFullName.value = ''
    inputCounterpartyOKPO.value = ''
    inputCounterpartyAddress.value = ''
    inputCounterpartyTelefon.value = ''
    inputCounterpartyType.value = 1
    inputCounterpartyIDBAS.value = ''

    inputTransportName.value = ''
    inputTractorName.value = ''
    inputTractorModel.value = ''
    inputTractorWeight.value = ''
    inputTractorWeightFull.value = ''
    inputTractorSize.value = ''
    inputTrailerName.value = ''
    inputTrailerModel.value = ''
    inputTrailerWeight.value = ''
    inputTrailerWeightFull.value = ''
    inputTrailerSize.value = ''
    inputDriver.value = ''
    inputDriverLicense.value = ''
}


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
                        <th  style="width: 140px;">Реєстрійний № тягача</th>
                        <th  >Модель тягача</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
    `
    const tableBody = document.querySelector('#table-transports tbody');
    let html = ``

    if (arrTemp.length !== 0) {
        for (let i = 0; i < arrTemp.length; i++) {
            html += `<tr data-id="${arrTemp[i].id}" data-name="${arrTemp[i].name}">
                        <td >${arrTemp[i].name}</td>
                        <td >${arrTemp[i].tractorName}</td>
                        <td>${arrTemp[i].tractorModel}</td>                
                    </tr>`
        }
        tableBody.insertAdjacentHTML('beforeend', html);
        if (transportID) {
            const id = transportID
            const selectedRow = tableTransports.querySelector(`tr[data-id="${id}"]`);
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

//Заполнение таблицы выбора номенклатуры
function fillTableProductsChoice () {
    if (arrProducts.length === 0) return false
    let arrTemp = arrProducts
    tableProductsChoice.innerHTML = ''
    let html = ''
    tableProductsChoice.innerHTML =  `
                <thead>
                    <tr>
                        <th  style="width: 250px;">Назва номенклатури</th>
                        <th  style="width: 350px;">Повна назва</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
    
    `
    
    let tableBody = document.querySelector("#table-products-choice tbody");
    if (arrTemp.length !== 0) {
        for (let i = 0; i < arrTemp.length; i++) {
            html += `<tr data-id="${arrTemp[i].id}" data-name="${arrTemp[i].name}">
                <td >${arrTemp[i].name}</td>
                <td >${arrTemp[i].fullName}</td>
                </tr>`
        }
        tableBody.insertAdjacentHTML('beforeend', html);
    }
    // valSelect = 'product'
    document.getElementById('products').classList.add('open')
}

//Заполнение выпадающего списка для тегов select
function fillSelectList(data) {
    selectProvider.options.length = 0;
    selectCarrier.options.length = 0;
    selectTransport.options.length = 0;
    arrQuickCarriers = data.carrier
    arrQuickProviders = data.provider
    arrQuickTransports = data.transport
    arrQuickProducts = data.product
    fillSelectListProducts()
    arrQuickProviders.reverse().forEach(data => {
        const option = document.createElement('option');
        option.value = data.value;
        option.textContent = data.text;
        selectProvider.appendChild(option);
    });
    arrQuickCarriers.reverse().forEach(data => {
        const option = document.createElement('option');
        option.value = data.value;
        option.textContent = data.text;
        selectCarrier.appendChild(option);
    });
    arrQuickTransports.reverse().forEach(data => {
        const option = document.createElement('option');
        option.value = data.value;
        option.textContent = data.text;
        selectTransport.appendChild(option);
    });
    selectProvider.value = ''
    selectCarrier.value = ''
    selectTransport.value = ''
}

//Заполнение выпадающего списка для тегов select to tableProducts
function fillSelectListProducts() {
    const selects = tableSupply.querySelectorAll('select')
    for (i = 0; i < selects.length; i ++) {
        const valueStart = selects[i].value
        // Оставляем только выбранный option
        Array.from(selects[i].options).forEach(option => {
        if (!option.selected) {
            option.remove();
        }
        });
        arrQuickProducts.reverse().forEach(data => {
            const optionInSelect = selects[i].querySelector(`option[value="${data.value}"]`);
            if (!optionInSelect) {
                const option = new Option(data.text, data.value);
                selects[i].appendChild(option);
            }
        });
        selects[i].value = valueStart
    }
}

function addQuickArray() {

}

//Выбор из таблиц: контрагентов и транспорта
function setSelect(data) {
    if (valSelect !== 'product') {
        const tableRows = document.querySelectorAll(data + ' tr');
        // console.log(data)
        tableRows.forEach(row => {
            if (row.classList.value === 'selected-row') {
                const selectElement = document.getElementById(valSelect);

                // Ищем option с определенным value
                const optionToRemove = selectElement.querySelector(`option[value="${row.dataset.id}"]`);

                // Если нашли, удаляем
                if (optionToRemove) {
                    optionToRemove.remove();
                }
                const newOption = new Option(row.dataset.name, row.dataset.id);
                selectElement.options.add(newOption, 0);
                selectElement.value = row.dataset.id;
                switch (valSelect) {
                    case 'provider':
                        arrQuickProviders = arrQuickProviders.filter(item => item.value !== +row.dataset.id);
                        arrQuickProviders.unshift({ value: +row.dataset.id, text: row.dataset.name })
                        break
                    case 'carrier':
                        arrQuickCarriers = arrQuickCarriers.filter(item => item.id !== +row.dataset.id);
                        arrQuickCarriers.unshift({ value: +row.dataset.id, text: row.dataset.name })
                        break
                    case 'transport':
                        arrQuickTransports = arrQuickTransports.filter(item => item.id !== +row.dataset.id);
                        arrQuickTransports.unshift({ value: +row.dataset.id, text: row.dataset.name })
                        break
                }
                // console.log(arrQuickProviders)
                closeModal()
            }
        });
    } else {
        console.log('product Ok')
    }
}

//Выбор из таблицы номенклатуры
function setSelectProduct() {
    // const tableRows = document.querySelectorAll('#tableProductsChoice' + ' tr');
    const row = tableProductsChoice.querySelector('tr.selected-row')
    if (!row) return
    arrQuickProducts = arrQuickProducts.filter(item => item.value !== +row.dataset.id);
    arrQuickProducts.unshift({ value: +row.dataset.id, text: row.dataset.name })
    fillSelectListProducts()
    const selectElement = document.getElementById(productID);
    selectElement.value = +row.dataset.id
    closeModal()
}

const inputCounterpartyName = document.getElementById('counterparty-name')
const inputCounterpartyFullName = document.getElementById('counterparty-fullName')
const inputCounterpartyOKPO = document.getElementById('counterparty-OKPO')
const inputCounterpartyAddress = document.getElementById('counterparty-address')
const inputCounterpartyTelefon = document.getElementById('counterparty-telefon')
const inputCounterpartyType = document.getElementById('counterparty-type')
const inputCounterpartyIDBAS = document.getElementById('counterparty-id-bas')

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

document.getElementById('transport-auto-namber').addEventListener('click', () => {
    inputTransportName.value = ''
    inputTransportName.value = inputTractorName.value + ' / ' + inputTrailerName.value
})

//Заполнение массива с данными контрагента
function fillArrCouterparty() {
    const result = {
        id: counterpartyID,
        name: inputCounterpartyName.value.replaceAll("'", "`"),
        fullName: inputCounterpartyFullName.value.replaceAll("'", "`"),
        OKPO: inputCounterpartyOKPO.value,
        address: inputCounterpartyAddress.value.replaceAll("'", "`"),
        telefon: inputCounterpartyTelefon.value,
        type: inputCounterpartyType.value,
        id_bas: inputCounterpartyIDBAS.value
    }
    return result
}

//Заполнение массива с данными транспорта
function fillArrTransport() {
    const result = {
        id: transportID,
        name: inputTransportName.value.replaceAll("'", "`"),
        tractorName: inputTractorName.value.replaceAll("'", "`"),
        tractorModel: inputTractorModel.value.replaceAll("'", "`"),
        tractorWeight: inputTractorWeight.value.replaceAll("'", "`"),
        tractorWeightFull: inputTractorWeightFull.value.replaceAll("'", "`"),
        tractorSize: inputTractorSize.value.replaceAll("'", "`"),
        trailerName: inputTrailerName.value.replaceAll("'", "`"),
        trailerModel: inputTrailerModel.value.replaceAll("'", "`"),
        trailerWeight: inputTrailerWeight.value.replaceAll("'", "`"),
        trailerWeightFull: inputTrailerWeightFull.value.replaceAll("'", "`"),
        trailerSize: inputTrailerSize.value.replaceAll("'", "`"),
        driver: inputDriver.value.replaceAll("'", "`"),
        driverLicense: inputDriverLicense.value.replaceAll("'", "`")
    }
    return result
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
};

// Установка значений при открытии
if (!dateSupply.value) dateSupply.value = formatDate1(new Date())

initialization()

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
            timeFormat: 'HH:mm',
            firstDay: 1
        },
        toggleSelected: false,
        dateFormat: 'dd.MM.yyyy',
        autoClose: true,
        buttons: ['today', 'clear'],
        weekends: [6,0]
        
    });
});

// Формат даты yyyy-mm-dd
function formatDate(d) {
    return [
        d.getFullYear(),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getDate().toString().padStart(2, '0')
    ].join('-');
}

// Формат даты dd.mm.yyyy
function formatDate1(d) {
    return [
        d.getDate().toString().padStart(2, '0'),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getFullYear()
    ].join('.');
}

function convertDate(dateStr) {
  // Разделяем строку по точке
  const parts = dateStr.split('.'); 
  // parts[0] - день, parts[1] - месяц, parts[2] - год
  
  // Возвращаем строку в формате yyyy-mm-dd
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
