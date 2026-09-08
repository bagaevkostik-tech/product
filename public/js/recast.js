const numberRecast = document.getElementById('number-recast')
const dateRecast = document.getElementById('date-recast')
const recastID = document.getElementById('id-recast')
const tableSample = document.getElementById('table-sample')
const tableSupplysChoice = document.getElementById('table-supplys-choice')
const tableSupplys = document.getElementById('table-supplys')
const tableLAB = document.getElementById('table-lab')
const tableRecast = document.getElementById('table-recast')
const modal = document.querySelectorAll('.modal')
const modal2 = document.querySelectorAll('.modal2')
const backdrop = document.querySelectorAll('.modal-backdrop')
const backdrop2 = document.querySelectorAll('.modal-backdrop2')
const sampleName = document.getElementById('name-sample')
const sampleAcid = document.getElementById('acid-sample')
const sampleSodium = document.getElementById('sodium-sample')
const sampleFoamy = document.getElementById('foamy-sample')
const dateStart = document.getElementById('date-start')
const dateFinish = document.getElementById('date-finish')

let arrSample
let arrSupplysChoice
let arrSupplysForRecast
let arrTableLab
let arrTableRecast
let arrMainStart

function audit() {
    let result = true
    const dt = new Date(convertDate(dateRecast.value))
    arrFind = arrTableRecast.find(item => new Date(convertDate(item.date)) > dt)
    if (arrFind) {
        toast('Дата переробки раніша за дату надходження!')
        result = false
    }
    return result
}

/* ************** Выбор стандартного интервала дат ************** */
document.getElementById('interval-btn').addEventListener('click', () => {
/** Передаем id куда будет возвращены даты стандартного интервала */
    responseStart = 'date-start'
    responseFinish = 'date-finish'
/* Открытие  выбора интервала */
    document.getElementById('interval-win').classList.add('open')
})

// Редактировать номер переработки разрешить
document.getElementById('edit-number-btn').addEventListener('click', () => {
    numberRecast.readOnly = false
    numberRecast.focus()
})

//Завершение редактирования номера переработки
numberRecast.addEventListener('change', () => numberRecast.readOnly = true)

// Закрытие модальных окон
backdrop.forEach((item) => {
    item.addEventListener("click", () => modal.forEach((item) => { item.classList.remove('open') }));
});

backdrop2.forEach((item) => {
    item.addEventListener("click", () => modal2.forEach((item) => { item.classList.remove('open') }));
});

function closeModal() {
    modal.forEach((item) => {
        item.classList.remove('open')
    });
}

// Нажатие выйти
document.getElementById('exit-btn').addEventListener('click', () => {
    const arrMainHere = createArraySave()
    if (JSON.stringify(arrMainStart) !== JSON.stringify(arrMainHere)) {
        let userConfirmed = confirm("Зберегти зміни?");
        if (userConfirmed) {
            saveConversion()
            setTimeout(() => {
                window.close()
            }, 100);
        } else { window.close() }
    }
    window.close()
})

//Создание архива для отправки на сохранение данных поставки
function createArraySave() {
    fillArrTableRecast()
    const result = {
        textreq: 'saveConversion',
        id: +recastID.textContent,
        date: convertDate(dateRecast.value),
        number: numberRecast.value,
        table: arrTableRecast
    }
    return result
}

//Нажатие сохоанить и выйти
document.getElementById('save-exit-btn').addEventListener('click', () => {
    saveConversion()
    setTimeout(() => {
        window.close()
    }, 100);
})

//Нажатие Сохранить переработку
document.getElementById('save-btn').addEventListener('click', saveConversion)

// Відкрити надходження для обрання у переробку
document.getElementById('supplys-open').addEventListener('click', () => {

    getSupplys()
    document.getElementById('supplys-modal').classList.add('open')
})

//Удалить поставку из списка
document.getElementById('supply-remove').addEventListener('click', () => {
    if (!tableSupplys.querySelector('tbody').rows.length) return
    const row = tableSupplys.querySelector('.selected-row')

    if (!row) {
        toast('Обеоіть надходження!')
        return
    }

    const supplyID = +row.dataset.id
    if (confirm("Ви дійсно бажаєте видалити запис?")) {
        // Удалить строку с data-id=""
        let rowToDelete = tableLAB.querySelectorAll(`tr[data-id="${supplyID}"]`);
        if (rowToDelete) {
            for (let i = 0; i < rowToDelete.length; i++) {
                rowToDelete[i].remove()
            }
        }
        rowToDelete = tableRecast.querySelectorAll(`tr[data-id="${supplyID}"]`);
        if (rowToDelete) {
            for (let i = 0; i < rowToDelete.length; i++) {
                rowToDelete[i].remove()
            }
        }
        rowToDelete = tableSupplys.querySelectorAll(`tr[data-id="${supplyID}"]`);
        if (rowToDelete) {
            for (let i = 0; i < rowToDelete.length; i++) {
                rowToDelete[i].remove()
            }
        }
    }
    calcSumLAB()
    calcSumRecast()
})

//Выбор поставки для переработки
function choiceSupply(valID) {
    const row = tableSupplys.querySelector(`tr[data-id="${valID}"]`);
    let supplyThereIs = false
    if (row) {
        supplyThereIs = true
    }
    const arrTemp = arrSupplysForRecast.filter(item => item.supplyID === valID);
    sendData(`http://${getAddress()}/users/post/17`, JSON.stringify({
        textreq: 'auditSupplys',
        supplyID: valID
    })).then((data) => {
        // console.log(data)
        if (!data) { toast('Помилка збереження!') } else {
            let arrFilter = arrTemp
            if (data.length === 0) {
                if (!supplyThereIs) addToSupplys(arrTemp[0])
                addToLAB(arrTemp)
            } else {
                for (i = 0; i < data.length; i++) {
                    arrFilter = arrFilter.filter(item => !(item.supplyID === data[i].supplyID && item.fat === data[i].fat
                        && item.productID === data[i].productID))
                }
                if (arrFilter.length) {
                    if (!supplyThereIs) addToSupplys(arrTemp[0])
                    addToLAB(arrFilter)
                }
            }
        }
    })
}

//Добавить поставку в список
function addToSupplys(el) {
    const row = tableSupplys.querySelector(`[data-id="${el.supplyID}"]`)
    if (row) return
    let html = `<tr data-id="${el.supplyID}"">
                    <td >${el.date}</td>
                    <td >${el.supplyNum}</td>
                    <td >${el.providerName}</td>
                    <td >${el.transportName}</td>
                    </tr>`
    const tableBody = document.querySelector('#table-supplys tbody');
    tableBody.insertAdjacentHTML('beforeend', html);
}

// Дабавить в LAB поставки
function addToLAB(arrTemp) {
    fillArrTableLab()
    const findLAB = arrTableLab.find(item => (item.supplyID === arrTemp[0].supplyID && item.qty === arrTemp[0].qty
        && item.productID === arrTemp[0].productID))
    if (findLAB) return
    fillArrTableRecast()
    const findRecast = arrTableRecast.find(item => (item.supplyID === arrTemp[0].supplyID && item.qty === arrTemp[0].qty
        && item.productID === arrTemp[0].productID))
    if (findRecast) return
    html = ''
    for (let i = 0; i < arrTemp.length; i++) {
        let valPernLab = '0.00'
        let valPernProv = '0,00'
        if (valPernLab) valPernLab = parseFloat(+arrTemp[i].pctLAB).toFixed(2)

        if (valPernProv) valPernProv = parseFloat(+arrTemp[i].pctProvider).toFixed(2).replace('.', ',')

        html += `<tr data-id="${arrTemp[i].supplyID}">
                    <td >${arrTemp[i].date}</td>
                    <td style="width: 50px;">${arrTemp[i].supplyNum}</td>
                    <td style="width: 200px;">${arrTemp[i].productName}</td>
                    <td style="width: 90px;text-align: right;">${arrTemp[i].qty}</td>
                    <td style="width: 90px;text-align: right;">${valPernProv}</td>
                    <td style="width: 90px;" >
                        <input type="number" class="input__table" value="${valPernLab}" step="0.01" onchange="formatInput(this), calcFat(this)" 
                        onfocus="this.select();">
                    </td>
                    <td style="width: 90px;text-align: right;">${arrTemp[i].fat}</td>
                    <td style="display: none;">${arrTemp[i].productID}</td>
                </tr>`
    }
    const tableBody = document.querySelector('#table-lab tbody');
    tableBody.insertAdjacentHTML('beforeend', html);
    fillTableLab()
    calcSumLAB()
}

//Нажатие кнопки выбора поставки 
document.getElementById('supply-choice').addEventListener('click', () => {
    const supply = tableSupplysChoice.querySelectorAll('tr.selected-row')
    if (supply.length !== 1) {
        toast('Не обрано надходження')
        return
    }
    const id = +supply[0].dataset.id
    choiceSupply(id)
    supply[0].remove()
})

//Двойной клик по таблице выбора поставок
tableSupplysChoice.addEventListener('dblclick', (e) => {
    const cell = e.target;
    const row = cell.parentElement;
    const id = +row.dataset.id
    row.remove()
    choiceSupply(id)
});

//Выход из выбора поставок
document.getElementById('supply-exit').addEventListener('click', closeModal)

// Создание архива таблицы
function fillArrTableLab() {
    arrTableLab = []
    const rows = tableLAB.querySelectorAll('tbody tr'); // Получаем все строки
    for (let i = 0; i < rows.length; i++) { // Перебираем строки
        const inputs = rows[i].getElementsByTagName("input");
        const tds = rows[i].querySelectorAll('td')
        arrTableLab.push({
            supplyID: +rows[i].dataset.id,
            date: tds[0].textContent,
            supplyNum: tds[1].textContent,
            productName: tds[2].textContent,
            qty: +tds[3].textContent,
            fat: +tds[6].textContent,
            productID: +tds[7].textContent,
            pctLAB: +inputs[0].value,
        })
    }
}

//Востанавливаем данные таблицы LAB
function fillTableLab() {
    const rows = tableLAB.querySelectorAll('tr'); // Получаем все строки
    for (let i = 0; i < rows.length; i++) { // Перебираем строки
        const inputs = rows[i].getElementsByTagName("input");
        // // Получаем все ячейки в текущей строке
        if (i < arrTableLab.length) {
            inputs[0].value = arrTableLab[i].pctLAB
        }
    }
}

//Обновить список поставок для переработки
document.getElementById('sopply-update').addEventListener('click', getSupplys)

//Нажатие кнопки Перенос из LAB в переработку
document.getElementById('lab-recast').addEventListener('click', () => {
    if (!tableLAB.querySelector('tbody').rows.length) return
    const row = tableLAB.querySelector('.selected-row')
    if (!row) {
        toast('Не обрано надходження!')
        return
    }
    savetlab(row, true)
})

//Ножатие кнопки - Сохранить в LAB
document.getElementById('lab-save').addEventListener('click', () => {
    if (!tableLAB.querySelector('tbody').rows.length) return
    const row = tableLAB.querySelector('.selected-row')
    if (!row) {
        toast('Не обрано надходження!')
        return
    }
    savetlab(row, false)
})

//Двойной клик таблица LAB
tableLAB.addEventListener('dblclick', (e) => {
    const row = e.target.closest('tr')
    savetlab(row, true)
});

//Перенос из LAB в переработку
function addToRecast(data) {
    fillArrTableRecast()
    let html = ''
    if (!data.pctLAB) {
        toast('Жирність дорівнює 0, переробка неможлива')
        return
    } else {
        const pctLAB = (parseFloat(+data.pctLAB).toFixed(2)).replace('.', ',')
        let inAcid = 0
        let inSodium = 0
        let inFoamy = 0
        if (data.inAcid) inAcid = parseFloat(data.inAcid).toFixed(1)
        if (data.inSodium) inSodium = parseFloat(data.inSodium).toFixed(1)
        if (data.inFoamy) inFoamy = parseFloat(data.inFoamy).toFixed(1)
        html += `
                    <tr data-id="${data.supplyID}"">
                        <td >${data.date}</td>
                        <td >${data.supplyNum}</td>
                        <td >${data.productName}</td>
                        <td style="text-align: right;">${pctLAB}</td>
                        <td style="text-align: right;" onchange="calcSumRecast(this)">${data.fat}</td>
                        <td >
                            <input type="number" class="input__table" value="${inAcid}" name="input-acid" onchange="this.value = parseFloat(this.value).toFixed(1),calcSumRecast()" 
                            onfocus="this.select();">
                        </td>
                        <td >
                            <input type="number" class="input__table" value="${inSodium}" name="input-sodium" onchange="formatInput1Sign(this),calcSumRecast()" 
                            onfocus="this.select();">
                        </td>
                        <td >
                            <input type="number" class="input__table" value="${inFoamy}" name="input-foamy" onchange="this.value = parseFloat(this.value).toFixed(1),calcSumRecast()" 
                            onfocus="this.select();">
                        </td>
                        <td style="display: none;">${data.productID}</td>
                        <td style="display: none;">${data.qty}</td>
                        <td style="display: none;">${data.pctProvider}</td>
                    </tr>
                `
        const tableBody = document.querySelector('#table-recast tbody');
        tableBody.insertAdjacentHTML('beforeend', html);
        if (data.row) tableLAB.deleteRow(data.row)
        tableRecast.rows[0].focus()
    }
    calcSumRecast()
    calcSumLAB()
    const rowNum = tableRecast.rows.length - 1
    const rows = tableRecast.querySelectorAll('tr')
    const cells = rows[rowNum].querySelectorAll('td')
    cells[0].click()
    fillTableRecast()
}

//Создание массива таблицы переработки
function fillArrTableRecast() {
    arrTableRecast = []
    const rows = tableRecast.querySelectorAll('tbody tr'); // Получаем все строки
    for (let i = 0; i < rows.length; i++) { // Перебираем строки
        const inputs = rows[i].getElementsByTagName("input");
        const tds = rows[i].querySelectorAll('td')
        arrTableRecast.push({
            supplyID: +rows[i].dataset.id,
            date: tds[0].innerHTML,
            supplyNum: tds[1].innerHTML,
            productName: tds[2].innerHTML,
            pctLAB: +(tds[3].textContent).replace(',', '.'),
            fat: +tds[4].textContent,
            acid: +inputs[0].value,
            sodium: +inputs[1].value,
            foamy: +inputs[2].value,
            productID: +tds[8].innerHTML,
            qty: +tds[9].innerHTML
        })
    }
}

//Востанавливаем данные таблицы Recast
function fillTableRecast() {
    const rows = tableRecast.querySelectorAll('tbody tr'); // Получаем все строки
    for (let i = 0; i < rows.length; i++) { // Перебираем строки
        const inputs = rows[i].getElementsByTagName("input");
        // // Получаем все ячейки в текущей строке
        if (i < arrTableRecast.length) {
            inputs[0].value = arrTableRecast[i].acid
            inputs[1].value = arrTableRecast[i].sodium
            inputs[2].value = arrTableRecast[i].foamy
        }
    }
}

//Нажатие кнопки удалить переработку
document.getElementById('recast-delete').addEventListener('click', () => {
    if (!tableRecast.querySelector('tbody').rows.length) return
    const row = tableRecast.querySelector('.selected-row')
    if (row) {
        if (!confirm("Ви дійсно бажаєте видалити запис?")) return
    } else {
        toast('Оберіть запис!')
        return
    }
    const tds = row.querySelectorAll('td')
    const arrRow = [{
        supplyID: +row.dataset.id,
        date: tds[0].textContent,
        supplyNum: tds[1].textContent,
        productName: tds[2].textContent,
        pctLAB: +tds[3].textContent.replace(',', '.'),
        fat: +tds[4].textContent,
        pctProvider: (tds[10].textContent) ? '' : tds[10].textContent,
        productID: +tds[8].textContent,
        qty: +tds[9].textContent
    }]
    row.remove()
    addToLAB(arrRow)
    calcSumRecast()
})

//Создать новый вариант типовые нормы материалов
document.getElementById('sample-new').addEventListener('click', () => {
    document.getElementById('sample-modal').classList.add('open')
    document.getElementById('id-sample').textContent = ""
    sampleName.value = ''
    sampleAcid.value = 0.00
    sampleSodium.value = 0
    sampleFoamy.value = 0

    sampleName.focus()
})

// Удалить типовую норму 
document.getElementById('sample-remove').addEventListener('click', () => {
    const row = tableSample.querySelector('.selected-row')
    if (!row) return
    const id = +row.dataset.id
    reqRemoveSample(id)
})

//Нажата кнопка изменить ттиповую норму расхода материалов
document.getElementById('sample-open').addEventListener('click', () => {
    const sample = tableSample.querySelectorAll('.selected-row')
    if (sample.length !== 1) {
        toast('Не обрано варіант витрат')
        return
    }
    const valID = +sample[0].dataset.id
    const option = arrSample.find(item => item.id === valID);
    document.getElementById('id-sample').textContent = option.id
    sampleName.value = option.name
    sampleAcid.value = option.acid
    sampleSodium.value = option.sodium
    sampleFoamy.value = option.foamy
    document.getElementById('sample-modal').classList.add('open')
})

// Lab расчет жиров, после установления процента в input
function calcFat(el) {
    const valImput = +el.value
    const row = el.closest('tr')
    const cells = row.querySelectorAll('td')
    if (valImput <= 0) {
        cells[6].innerHTML = 0
    } else {
        const qty = +cells[3].innerHTML
        cells[6].innerHTML = parseFloat((qty * valImput / 100).toFixed(0))
    }
    calcSumLAB()
}

//Пересчет таблицы LAB
function calcSumLAB() {
    let sum = 0
    let cells = tableLAB.querySelectorAll("tbody tr td:nth-child(4)");
    cells.forEach(cell => {
        let value = parseFloat(cell.textContent) || 0;
        sum += value;
    });
    document.getElementById('sum-qty-lab').textContent = sum;
    sum = 0
    cells = tableLAB.querySelectorAll("tbody tr td:nth-child(7)");
    cells.forEach(cell => {
        let value = parseFloat(cell.textContent) || 0;
        sum += value;
    });
    document.getElementById('sum-fat-lab').textContent = sum;
}

//Пересчет таблицы Recast
function calcSumRecast() {
    let sum = 0
    let cellsFat = tableRecast.querySelectorAll("tbody tr td:nth-child(5)");
    cellsFat.forEach(cell => {
        let value = parseFloat(cell.textContent) || 0;
        sum += value;
    });
    document.getElementById('sum-fat').textContent = sum;

    sum = 0
    let inputs = tableRecast.querySelectorAll('input[name="input-acid"]');
    inputs.forEach(function (input) {
        let value = parseFloat(input.value);
        if (value) {
            sum += value; // Суммируем
        }
    });
    document.getElementById('sum-acid').innerText = sum.toFixed(1).replace('.', ',');

    sum = 0
    inputs = tableRecast.querySelectorAll('input[name="input-sodium"]');
    inputs.forEach(function (input) {
        let value = parseFloat(input.value);
        if (value) {
            sum += value; // Суммируем
        }
    });
    document.getElementById('sum-sodium').innerText = sum.toFixed(1).replace('.', ',');

    sum = 0
    inputs = tableRecast.querySelectorAll('input[name="input-foamy"]');
    inputs.forEach(function (input) {
        let value = parseFloat(input.value);
        if (value) {
            sum += value; // Суммируем
        }
    });
    document.getElementById('sum-foamy').innerText = sum.toFixed(1).replace('.', ',');
}

//Сохранить типовые нормы расхода материалов
document.getElementById('save-sample').addEventListener('click', () => {
    if (sampleName.value.trim() === '') {
        toast('Заповніть назву варіанту!')
        return
    }
    const textreq = 'sample'
    sendData(`http://${getAddress()}/users/post/12`, JSON.stringify({
        textreq: textreq,
        id: +document.getElementById('id-sample').textContent,
        name: sampleName.value,
        acid: +sampleAcid.value,
        sodium: +sampleSodium.value,
        foamy: +sampleFoamy.value
    })).then((data) => {
        if (!data.result) { toast('Помилка збереження!') } else {
            document.getElementById('id-sample').textContent = data.id
            arrSample = data.table
            fillSample(data.id)
            toast('Збережено')
        }
    })
})

//Выход из карточки типовых норм расхода материалов
document.getElementById('exit-sample').addEventListener('click', () => {
    modal.forEach((item) => {
        item.classList.remove('open')
    });
})

//Нажата кнопка Использовать sample
document.getElementById('sample-move').addEventListener('click', () => {
    if (!tableRecast.querySelector('tbody').rows.length) return
    const rowSample = tableSample.querySelector('.selected-row')
    if (!rowSample) {
        toast('Не обрано варіант розрахунку!')
        return
    }
    const rowRecast = tableRecast.querySelector('tbody').querySelector('.selected-row')
    console.log(rowRecast)
    if (!rowRecast) {
        toast('Оберіть переробку!')
        return
    }
    calcSample(rowSample, rowRecast)
})

//Двойной клик по sample
tableSample.addEventListener('dblclick', (e) => {
    if (!tableRecast.querySelector('tbody').rows.length) return
    const rowRecast = tableRecast.querySelector('tbody').querySelector('.selected-row')
    if (!rowRecast) {
        toast('Оберіть переробку!')
        return
    }
    const rowSample = e.target.closest('tr')
    calcSample(rowSample, rowRecast)
});

// Рассчитать материалы по типовому варианту
function calcSample(rowS, rowR) {
    const el = arrSample.find(item => item.id === +rowS.dataset.id);
    const pctAcid = el.acid
    const pctSodium = el.sodium
    const pctFoamy = el.foamy
    const cells = rowR.querySelectorAll('TD')
    const fat = +cells[4].innerHTML
    const inputs = rowR.querySelectorAll('input')

    inputs[0].value = parseFloat(fat * pctAcid / 100).toFixed(1)
    inputs[1].value = parseFloat(fat * pctSodium / 100).toFixed(1)
    inputs[2].value = parseFloat(fat * pctFoamy / 100).toFixed(1)
    calcSumRecast()
}

// Отправка POST запроса
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

//POST сохранение Conversion
function saveConversion() {
    const textRequest = createArraySave()
    if (!audit()) return
    sendData(`http://${getAddress()}/users/post/17`, JSON.stringify(
        textRequest
    )).then((data) => {
        if (!data.result) {
            toast(data.text)
        } else {
            recastID.textContent = data.id
            numberRecast.value = data.number
            arrMainStart = createArraySave()
            toast('Переробка збережена')
        }
    })

}

/* POST запрос на получение данных заполнения новой переработки */
function initialization() {
    const now = new Date();
    dateStart.value = formatDate1(new Date(now.getFullYear(), now.getMonth(), 1))
    dateFinish.value = formatDate1(new Date())
    getSamples()
    numberRecast.readOnly = true
    sendData(`http://${getAddress()}/users/post/3`, JSON.stringify({
        text: 'recast',
    })).then((data) => {
        if (+recastID.textContent !== 0) { reqOpenRecast() } else {
            arrMainStart = createArraySave()
        }
    })
}

//Запрос POST на получение надходжень для переробки
function getSupplys() {
    tableSupplysChoice.innerHTML = ''
    const textreq = 'sopplysForRecast'
    sendData(`http://${getAddress()}/users/post/3`, JSON.stringify({
        text: textreq,
        dateStart: convertDate(dateStart.value),
        dateFinish: convertDate(dateFinish.value),
        supplysAll: document.getElementById('supplysAll').checked
    })).then((data) => {
        if (!data) { toast('Помилка завантаження!') } else {
            if (data.length > 0) {
                arrSupplysForRecast = data
                arrSupplysChoice = Array.from(new Set(data.map(u => u.supplyID)))
                    .map(id => data.find(u => u.supplyID === id));
                let html = ''
                for (let i = 0; i < arrSupplysChoice.length; i++) {
                    html += `<tr data-id="${arrSupplysChoice[i].supplyID}"">
                        <td style="width: 110px;">${arrSupplysChoice[i].date}</td>
                        <td style="width: 50px;">${arrSupplysChoice[i].supplyNum}</td>
                        <td style="width: 220px;">${arrSupplysChoice[i].providerName}</td>
                        <td >${arrSupplysChoice[i].transportName}</td>
                        </tr>`
                }
                tableSupplysChoice.innerHTML += html
                toast('Завантажено')
            }
        }
    })
}

//POST Сохранить LAB
function savetlab(row, save) {
    const cells = row.querySelectorAll('TD')
    sendData(`http://${getAddress()}/users/post/17`, JSON.stringify({
        textreq: 'saveRowlab',
        pctLAB: +row.querySelectorAll('input')[0].value,
        supplyID: +row.dataset.id,
        date: cells[0].innerHTML,
        supplyNum: cells[1].innerHTML,
        productName: cells[2].innerHTML,
        qty: +cells[3].innerHTML,
        pctProvider: cells[4].textContent.replace(',', '.'),
        fat: +cells[6].innerHTML,
        productID: +cells[7].innerHTML,
        row: row.rowIndex
    })).then((data) => {
        if (!data) { toast('Помилка збереження!') } else {
            toast('Дані щодо жирності записані.')
            if (save) {
                addToRecast(data)
                row.remove()
            }
        }
        // console.log(data)
    })
}

// POST запрос на получение типовых норм расхода матеоиалов
function getSamples() {
    const textreq = 'samples'
    sendData(`http://${getAddress()}/users/post/3`, JSON.stringify({
        text: textreq,
    })).then((data) => {
        if (!data.result) {toast(data.text)} else {
            arrSample = data.table
            fillSample()
        }
    })
}

//Запрос POST на удаление из sample
function reqRemoveSample(id) {
    sendData(`http://${getAddress()}/users/post/11`, JSON.stringify({
        text: 'removeSample',
        id: id
    })).then((data) => {
        if (!data.result) {
            toast(data.text)
        } else {
            arrSample = data.table
            fillSample()
        }
    })
}

//Запрос POST на открытие переработки
function reqOpenRecast() {
    const textreq = +recastID.textContent
    sendData(`http://${getAddress()}/users/post/11`, JSON.stringify({
        text: 'recast',
        id: +recastID.textContent
    })).then((data) => {
        if (!data.result) {
            toast(data.text)
        } else {
            numberRecast.value = data.num
            dateRecast.value = formatDate1(new Date(data.date))
            const tblRecasts = data.tblRecasts
            let arrFilter = data.tblLAB
            for (i = 0; i < tblRecasts.length; i++) {
                addToSupplys(tblRecasts[i])
                addToRecast(tblRecasts[i])
                arrFilter = arrFilter.filter(item => !(item.supplyID === tblRecasts[i].supplyID && item.fat === tblRecasts[i].fat
                    && item.productID === tblRecasts[i].productID))
            }
            if (arrFilter.length) addToLAB(arrFilter)
            arrMainStart = createArraySave()
            // console.log(arrFilter)
        }
    })
}

//Заполнение таблицы типовых норм использования материалов
function fillSample(id) {
    let html = ''
    tableSample.innerHTML = ''
    if (arrSample.length !== 0) {
        for (let i = 0; i < arrSample.length; i++) {
            html += `<tr data-id="${arrSample[i].id}"">
                <td >${arrSample[i].name}</td>
                </tr>`
        }
        tableSample.innerHTML += html

        if (id) {
            const selectedRow = tableSample.querySelector(`tr[data-id="${id}"]`);
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

// Выделение выбранной строки таблицы выбора поставок для переработки
tableSupplysChoice.addEventListener('click', function (event) { tableSelect(tableSupplysChoice, event) });

// Выделение выбранной строки таблицы LAB
tableLAB.addEventListener('click', function (event) { tableSelect(tableLAB, event) });

// Выделение выбранной строки таблицы выбора типовых норм использования материалов
tableSample.addEventListener('click', function (event) { tableSelect(tableSample, event) });

// Выделение выбранной строки таблицы поставок
tableSupplys.addEventListener('click', function (event) { tableSelect(tableSupplys, event) });

// Выделение выбранной строки таблицы переработки
tableRecast.addEventListener('click', (event) => { tableSelect(tableRecast, event) });



//Выделение строки в таблице
function tableSelect(table, event) {
    table.querySelectorAll('.selected-cell').forEach(row => row.classList.remove('selected-cell'));
    table.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));

    // Если кликнули по ячейке
    if (event.target.tagName === 'TD') {
        const cell = event.target;
        const row = cell.parentElement;

        cell.classList.add('selected-cell');
        row.classList.add('selected-row');
        // console.log(event)
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

// Установка значений при открытии
if (!dateRecast.value) dateRecast.value = formatDate1(new Date())

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
        weekends: [6, 0]

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

// Возвращаем строку в формате yyyy-mm-dd
function convertDate(dateStr) {
    // Разделяем строку по точке
    const parts = dateStr.split('.');
    // parts[0] - день, parts[1] - месяц, parts[2] - год

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Округляет до 2 знаков innput
function formatInput(input) {
    if (input.value) {
        if (+input.value < 0) input.value = 0
        input.value = parseFloat(input.value).toFixed(2);
    }
}

// Округляет до 1 знакa innput
function formatInput1Sign(input) {
    if (input.value) {
        if (+input.value < 0) input.value = 0
        input.value = parseFloat(input.value).toFixed(1);
    }
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
