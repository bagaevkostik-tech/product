const mysql = require('mysql2/promise')
const XLSX = require('xlsx-populate');
const ExcelJS = require('exceljs');
const mainModule = require('./mainModule');
const myModule = require('./myModule');

let config = {
    host: 'localhost',
    user: 'kostya',
    database: 'supplys',
    password: '9482'
}

async function processData(item) {
    // 1. Загружаем книгу
    let fileNameTemp = 'scheme_template.xlsx'
    if (!item.acid) fileNameTemp = 'scheme_template_not_unit.xlsx'
    let workbook = await XLSX.fromFileAsync(`./templates/${fileNameTemp}`);
    let sheet = workbook.sheet("Лист1");

    // 3. Итерируем данные и записываем их в нужные ячейки
    sheet.cell("D5").value(item.number);
    sheet.cell("J6").value(item.fat);
    const date = new Date(item.date);
    const formatterLong = new Intl.DateTimeFormat('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    sheet.cell("F5").value(formatterLong.format(date));
    sheet.cell("D6").value(item.qty);

    sheet.cell("H6").value(item.fat / item.qty * 100);
    if (item.acid) {
        sheet.cell("M26").value(item.acid.replaceAll(".", ","));
        sheet.cell("J26").value(item.sodium.replaceAll(".", ","));
        sheet.cell("O26").value(item.foamy.replaceAll(".", ","));
        sheet.cell("R28").value(item.fat / 0.98);
    } else {
        sheet.cell("R25").value(item.fat / 0.98);
    }

    // Можно использовать диапазон для массивов
    // let names = new_data.map(item => item.name);
    // sheet.range("A2").value(names);

    // 4. Сохраняем результат
    // console.log(mainModule.formatDate(item.date))
    const fileName = `scheme-${item.date}-${item.number.replaceAll("/", "_")}.xlsx`
    const filePath = "./public/files/" + fileName;

    await workbook.toFileAsync(filePath);
    return fileName
    // console.log(data.number);
}


async function printRecast(data) {
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)
        const [rows, fields] = await conn.execute(`
            SELECT num AS number,conversionDate AS date FROM conversion WHERE id=${data.id};
        `)
        data.number = (!rows[0].number) ? '' : rows[0].number
        data.date = mainModule.formatDateUs(rows[0].date)
        const [unit, field] = await conn.execute(`
            SELECT sum(RecastFat) AS fat, SUM(RecastAcid) as acid, SUM(RecastSodium) AS sodium,SUM(RecastFoamy)AS foamy FROM recasts WHERE Conversion=${data.id};
        `)
        data.fat = unit[0].fat
        data.acid = (unit[0].acid) ? unit[0].acid : ''
        data.sodium = (unit[0].sodium) ? unit[0].sodium : ''
        data.foamy = (unit[0].foamy) ? unit[0].foamy : ''
        const [qty, fiel] = await conn.execute(`
            SELECT SUM(quantity) AS qty FROM supplys_nomenclature WHERE supply IN (SELECT supply FROM recasts WHERE conversion = ${data.id});
        `)
        data.qty = qty[0].qty

        const fileName = await processData(data)
        conn.end()
        return { result: true, fileName: fileName }
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка завантаження.' }
    }
}

async function printListSupplys(dataEnter) {
    const array = await myModule.querySupply(dataEnter)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DataSheet', { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });

    let data = []
    for (let i = 0; i < array.length; i++) {
        data.push([
            array[i].supply,
            array[i].date,
            array[i].number,
            array[i].provider,
            array[i].carrier,
            array[i].transport,
            array[i].ttn,
            array[i].nomenclature,
            (array[i].quantity) ? +array[i].quantity : '',
            (array[i].percentProvider) ? parseFloat(array[i].percentProvider.replace(",", ".")) : '',
            (array[i].percentLAB) ? parseFloat(array[i].percentLAB.replace(",", ".")) : '',
            (array[i].fat) ? +array[i].fat : '',
            array[i].note
        ])
    }

    worksheet.columns = [
        { header: 'ID' },
        { header: 'Дата', width: 15, style: { numFmt: 'dd.mm.yyyy' } },
        { header: '№' },
        { header: 'Постачальник' },
        { header: 'Перевізник' },
        { header: 'Транспорт' },
        { header: '№ ТТН' },
        { header: 'Назва продукта' },
        { header: 'Вага, кг', style: { numFmt: '# ##0' } },
        { header: '% Постачальника', style: { numFmt: '#0.00' } },
        { header: '% Лаболаторія', style: { numFmt: '#0.00' } },
        { header: 'Жир, кг', style: { numFmt: '# ##0' } },
        { header: 'Нотатки' }

    ]
    // Вставляем данные начиная с ячейки A1
    worksheet.addRows(data);
        // 3. Включение автофильтра (например, для первой строки от A1 до C1)
    worksheet.autoFilter = 'A1:M1';
    // Автоподбор ширины по данным
    worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
            let columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
                maxLength = columnLength;
            }
        });
        // Устанавливаем ширину с небольшим запасом (например, +2)
        column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    await workbook.xlsx.writeFile('./public/files/ExportList.xlsx');
    return { result: true, fileName: 'ExportList.xlsx' }
}

async function printListRecasts(dataEnter) {
    const array = await myModule.queryRecast(dataEnter)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DataSheet', { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });

    let data = []
    for (let i = 0; i < array.length; i++) {
        data.push([
            array[i].id,
            array[i].date,
            array[i].number,
            array[i].provider,
            array[i].transport,
            array[i].product,
            (array[i].percentLAB) ? parseFloat(array[i].percentLAB.replace(",", ".")) : '',
            (array[i].fat) ? +array[i].fat : '',
            (array[i].acid) ? +array[i].acid : '',
            (array[i].sodium) ? +array[i].sodium : '',
            (array[i].foamy) ? +array[i].foamy : '',
        ])
    }

    console.log(data)

    worksheet.columns = [
        { header: 'ID' },
        { header: 'Дата', width: 15, style: { numFmt: 'dd.mm.yyyy' } },
        { header: '№' },
        { header: 'Постачальник' },
        { header: 'Транспорт' },
        { header: 'Назва продукта' },
        { header: '% Лаболаторія', style: { numFmt: '#0.00' } },
        { header: 'Жир, кг', style: { numFmt: '# ##0' } },
        { header: 'Кислота, кг', style: { numFmt: '# ##0.0' } },
        { header: 'Сода, кг', style: { numFmt: '# ##0.0' } },
        { header: 'Піногасник, кг', style: { numFmt: '#0.00' } },
    ]
    // Вставляем данные начиная с ячейки A1
    worksheet.addRows(data);
        // 3. Включение автофильтра (например, для первой строки от A1 до C1)
    worksheet.autoFilter = 'A1:K1';
    // Автоподбор ширины по данным
    worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
            let columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
                maxLength = columnLength;
            }
        });
        // Устанавливаем ширину с небольшим запасом (например, +2)
        column.width = maxLength < 10 ? 10 : maxLength + 3;
    });

    await workbook.xlsx.writeFile('./public/files/ExportListRecast.xlsx');
    return { result: true, fileName: 'ExportListRecast.xlsx' }
}



// Экспортируем функцию
module.exports = {
    printRecast: printRecast,
    printListSupplys: printListSupplys,
    printListRecasts: printListRecasts
};


