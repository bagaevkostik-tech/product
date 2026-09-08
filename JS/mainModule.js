async function getTransport(t, conn) {
    const [rows, fields] = await conn.execute(`SELECT name FROM transports WHERE id = ${t};`)
    return (rows[0]) ? rows[0].name : ''
}

async function getCounterparty(c, conn) {
    const [rows, fields] = await conn.execute(`SELECT name FROM counterparties WHERE id = ${c};`)
    return (rows[0]) ? rows[0].name : ''
}

async function getNomenclature(n, conn) {
    const [rows, fields] = await conn.execute(`SELECT name FROM nomenclatures WHERE id = ${n};`)
    return (rows[0]) ? rows[0].name : ''
}


// Формат даты dd.mm.yyyy
function formatDateUa(d) {
    return [
        d.getDate().toString().padStart(2, '0'),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getFullYear()
    ].join('.');
}

// Формат даты yyyy-mm-dd
function formatDateUs(d) {
    return [
        d.getFullYear(),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getDate().toString().padStart(2, '0'),
    ].join('-');
}

// Формат даты yyyy-mm-dd HH:mm:ss
function formatDateUsTime(date) {
  const pad = (num) => String(num).padStart(2, '0');

  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1); // Месяцы от 0 до 11
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm_time = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  return `${yyyy}-${mm}-${dd} ${HH}:${mm_time}:${ss}`;
}

// Формат даты yyyy-mm-01
function formatDateFirstDay(d) {
    return [
        d.getFullYear(),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        '01'
    ].join('-');
}

// Формат даты yyyy-mm-dd last
function formatDateLastDay(d) {
    const year = d.getFullYear()
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    return [
        year,
        month,
        getDaysInMonth(year, month)
    ].join('-');
}

//Конвертация из дд.мм.гггг в yyyy-mm-dd
function convertDate(dateStr) {
  // Разделяем строку по точке
  const parts = dateStr.split('.'); 
  // parts[0] - день, parts[1] - месяц, parts[2] - год
  
  // Возвращаем строку в формате yyyy-mm-dd
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function numberMM(d) {
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    return month
}

async function getQuickList(user, conn) {
        const [provider, fields] = await conn.execute(`
SELECT id_value AS value , tbl1.Name AS text
FROM quick_list AS tbl
INNER JOIN
counterparties AS tbl1 ON tbl.id_value = tbl1.ID
WHERE id_user= "${user}" AND id_value IS NOT NULL AND tbl.name_type = 'Provider'
ORDER BY name_type, num DESC ;
    `)
        const [carrier, field] = await conn.execute(`
SELECT id_value AS value , tbl1.Name AS text
FROM quick_list AS tbl
INNER JOIN
counterparties AS tbl1 ON tbl.id_value = tbl1.ID
WHERE id_user= "${user}" AND id_value IS NOT NULL AND tbl.name_type = 'Carrier'
ORDER BY name_type, num DESC ;
    `)
        const [transport, fiel] = await conn.execute(`
SELECT id_value AS value , tbl1.Name AS text
FROM quick_list AS tbl
INNER JOIN
transports AS tbl1 ON tbl.id_value = tbl1.ID
WHERE id_user= "${user}" AND id_value IS NOT NULL AND tbl.name_type = 'Transport'
ORDER BY name_type, num DESC ;
    `)
        const [product, fie] = await conn.execute(`
SELECT id_value AS value , tbl1.Name AS text
FROM quick_list AS tbl
INNER JOIN
nomenclatures AS tbl1 ON tbl.id_value = tbl1.ID
WHERE id_user= "${user}" AND id_value IS NOT NULL AND tbl.name_type = 'Nomenclature'
ORDER BY name_type, num DESC ;
    `)

    const result = {provider: provider,carrier: carrier, transport: transport, product: product}
    return result
}

// Экспортируем функцию
module.exports = {
    formatDateUs: formatDateUs,
    formatDateUa: formatDateUa,
    formatDateUsTime: formatDateUsTime,
    getCounterparty: getCounterparty,
    getTransport: getTransport,
    getNomenclature: getNomenclature,
    convertDate: convertDate,
    formatDateFirstDay: formatDateFirstDay,
    formatDateLastDay: formatDateLastDay,
    numberMM: numberMM,
    getQuickList: getQuickList

};

//Количество дней в месяце
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

