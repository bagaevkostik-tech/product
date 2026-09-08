const yearInterval = document.querySelector('.dropdown-input-hidden');
if (!yearInterval.value) yearInterval.value = 2026
// const backdrop = document.querySelector('#backdrop')

let responseStart
let responseFinish

// Выбор года запроса
const dropDownBtn = document.querySelector('.dropdown-button')
const dropDownList = document.querySelector('.dropdown-list')

dropDownBtn.addEventListener('click', (e) => {
    dropDownList.classList.toggle('dropdown-list--visible')
    e.target.classList.add('dropdown-button-active')
})

// Выбор элемта списка
document.querySelectorAll('.dropdown-list-item').forEach(function (listItem) {
    listItem.addEventListener('click', function (event) {
        event.stopPropagation() //Для  прекращения передачи  инфы  о нажатии внутри списка
        dropDownBtn.innerHTML = this.innerHTML
        dropDownBtn.focus()
        yearInterval.value = this.dataset.value
        dropDownList.classList.remove('dropdown-list--visible')
    })
})

// Реализация скрытия списка при нажатии вне его
document.addEventListener('click',  (event) => {
    if (event.target !== dropDownBtn) {
        dropDownBtn.classList.remove('dropdown-button-active')
        dropDownList.classList.remove('dropdown-list--visible')
    }
})

document.addEventListener('keydown', function (event) {
    if (event.key === 'Tab' || event.key === 'Escape') {
        dropDownBtn.classList.remove('dropdown-button-active')
        dropDownList.classList.remove('dropdown-list--visible')
    }
})
//Количество дней в месяце
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function getInterval(str) {
    let start
    let finish
    let chInput = false
    switch (str) {
        case 'm01': start = `01.01.${yearInterval.value}`, finish = `31.01.${yearInterval.value}`
            break

        case 'm02':
            start = `01.02.${yearInterval.value}`
            finish = `${getDaysInMonth(yearInterval.value, 2)}.02.${yearInterval.value}`
            break

        case 'm03':
            start = `01.03.${yearInterval.value}`
            finish = `31.03.${yearInterval.value}`
            break

        case 'm04':
            start = `01.04.${yearInterval.value}`
            finish = `30.04.${yearInterval.value}`
            break

        case 'm05':
            start = `01.05.${yearInterval.value}`
            finish = `31.05.${yearInterval.value}`
            break

        case 'm06':
            start = `01.06.${yearInterval.value}`
            finish = `30.06.${yearInterval.value}`
            break

        case 'm07':
            start = `01.07.${yearInterval.value}`
            finish = `31.07.${yearInterval.value}`
            break

        case 'm08':
            start = `01.08.${yearInterval.value}`
            finish = `31.08.${yearInterval.value}`
            break

        case 'm09':
            start = `01.09.${yearInterval.value}`
            finish = `30.09.${yearInterval.value}`
            break

        case 'm10':
            start = `01.10.${yearInterval.value}`
            finish = `31.10.${yearInterval.value}`
            break

        case 'm11':
            start = `01.11.${yearInterval.value}`
            finish = `30.11.${yearInterval.value}`
            break

        case 'm12':
            start = `01.12.${yearInterval.value}`
            finish = `31.12.${yearInterval.value}`
            break

        case 'kv1':
            start = `01.01.${yearInterval.value}`
            finish = `31.03.${yearInterval.value}`
            break

        case 'kv2':
            start = `01.04.${yearInterval.value}`
            finish = `30.06.${yearInterval.value}`
            break

        case 'kv3':
            start = `01.07.${yearInterval.value}`
            finish = `30.09.${yearInterval.value}`
            break

        case 'kv4':
            start = `01.10.${yearInterval.value}`
            finish = `31.12.${yearInterval.value}`
            break

        case 'p06':
            start = `01.01.${yearInterval.value}`
            finish = `30.06.${yearInterval.value}`
            break

        case 'p09':
            start = `01.01.${yearInterval.value}`
            finish = `30.09.${yearInterval.value}`
            break

        case 'p12':
            start = `01.01.${yearInterval.value}`
            finish = `31.12.${yearInterval.value}`
            break

        case 'input-years':
            chInput = true
            break
    }
    return {start: start, finish: finish, chInput: chInput}
}

//*********      Нажатие на   кнопку интервала */
document.querySelectorAll('.interval_btn').forEach(function (itemInterval) {
    itemInterval.addEventListener('click',function (e) {
        if(e.target.dataset.interval == 'input-years') return


        const response = getInterval(this.dataset.interval)


       // clearTable()
        if (!response.chInput) {
                let responseDateStart = document.getElementById(responseStart)
                let responseDateFinish = document.getElementById(responseFinish)
                responseDateStart.value = response.start
                responseDateFinish.value = response.finish
                closeInterval()
             }

    })
})



function closeInterval() {
    document.getElementById('interval-win').classList.remove('open')
}
