const allowedIPs = [
    '100.86.90.118', '100.104.4.20', '100.85.58.55',
    '100.87.179.16', // Сервер 
    '100.90.126.54', '100.118.242.123',
    '100.70.176.110', //Оксана
    '100.81.176.80' // Олег
]

const findString = '192.168.'; // пример строки для поиска

function checkIP(ip) {
    // console.log('Checking IP:', ip);

    if (ip.slice(0, 8) === findString || allowedIPs.includes(ip)) return true;

    return false;
}

module.exports = {
    checkIP
};