const express = require('express')
const http = require('http');
const mysql = require('mysql2/promise')
const respon = require('./JS/respon')
const path = require('path');
const fs = require('fs');
const myModule = require('./JS/myModule');
const printModule = require('./JS/printModule');
const recastModule = require('./JS/recastModule');
const supplyModule = require('./JS/supplyModule');
const messengerModule = require('./JS/messengerModule');
const { text } = require('body-parser');
const { log } = require('console');
// const { Server } = require('socket.io');
const socketStorage = require('./JS/socket'); // Путь к вашему файлу socket.js
let validation = true //Валидация клиента
let arrValidation = []

//console.log(new Date())
const app = express()
const server = http.createServer(app); // Создаем HTTP-сервер на базе Express
// const io = new Server(server);         // Инициализируем Socket.io

// Инициализируем socket.io
const io = socketStorage.init(server);

// Раздача статических файлов (например, клиентской части из папки public)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/users', (req, res) => {
  const resValid = getValidationData(req.ip)
  if (typeof (resValid) !== Boolean) {
    res.render('work', { username: resValid.username })

  } else {
    res.redirect('/')
  }
})

//Get запросы на открытие учета и отчетности
app.get('/accounting', (req, res) => {
  const resValid = getValidationData(req.ip)
  if (typeof (resValid) !== Boolean) {
    res.render('accounting')

  } else {
    res.redirect('/')
  }
})

//Get запросы по надходженням
app.get('/supply/:id', (req, res) => {
  const resValid = getValidationData(req.ip)
  if (typeof (resValid) !== Boolean) {
    res.render('supply', { supply: req.params.id })

  } else {
    res.redirect('/')
  }
})

//Get запросы по recast
app.get('/recast/:id', (req, res) => {
  // console.log('get recast quer')
  const resValid = getValidationData(req.ip)
  // const resValid = 1472
  if (typeof (resValid) !== Boolean) {
    res.render('recast', { recast: req.params.id })

  } else {
    res.redirect('/')
  }
})

app.get('/download-static-xlsx/:nameFile', (req, res) => {
  // Отправляем файл из папки 'public'
  const filePath = path.join(__dirname, 'public/files', req.params.nameFile)
  res.sendFile(filePath);
  setTimeout(() => { fs.unlink('public/files/' + req.params.nameFile, () => {})}, 2 * 60000)
});

//Ожидание запросов от пользователей POST
//Запросы на валидацию пользователя
app.post('/check-user', async (req, res) => {
  let username = req.body.username
  let userpass = req.body.userpass
  let config = {
    host: 'localhost',
    user: username,
    database: 'supplys',
    password: userpass
  }
  try {
    const conn = await mysql.createConnection(config)
    conn.end()
    validation = true
    validationList(req.ip, username, userpass)
    return res.redirect(`/users`)
  } catch (error) {
    // Обработка ошибки, если она возникла
    return res.redirect('/')
  }
})

//Запросы на получение инфы из базы  supplys
app.post('/users/post/1', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass
        if (data.text === 'supplys') {
          const resDatas = await supplyModule.supplys(data)
          res.status(200).json(resDatas);
        } else if (data.text === 'supplysList') {
          const resDatas = await supplyModule.querySupplysList(data)
          res.status(200).json(resDatas);
        } else if (data.text === 'dataUser') {
          const resDatas = await myModule.reqUser(data)
          res.status(200).json(resDatas);
        }

      } catch (error) {
        res.status(400).set('Content-Type', 'text/plain').send('Invalid format file');
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Запросы на получение инфы из базы recast
app.post('/users/post/2', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass
        if (data.text === 'recasts') {
          const resDatas = await recastModule.queryRecast(data)
          res.status(200).json(resDatas);
        } else if (data.text === 'recastsList') {
          const resDatas = await recastModule.queryRecastsList(data)
          res.status(200).json(resDatas);
        }  
        } catch (error) {
        res.status(400).set('Content-Type', 'text/plain').send('Invalid format file');
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Запросы на получение инфы из базы создание навой поставки или переработки, получение первичных данных
app.post('/users/post/3',  (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body); 
        data.username = dataUser.username
        data.userpass = dataUser.userpass
        if (data.text === 'supply') {
          const resDatas = await supplyModule.zeroSupplyParam(data)
          res.status(200).json(resDatas);
        } else if (data.text === 'recast') {
          const resDatas = await myModule.zeroRecastParam(data)
          // res.status(200).json(resDatas);
          res.send(resDatas)
        } else if (data.text === 'samples') {
          const resDatas = await recastModule.getSamples(data)
          // res.status(200).json(resDatas);
          res.send(resDatas)
        } else if (data.text === 'sopplysForRecast') {
          const resDatas = await recastModule.sopplysForRecast(data)
          res.status(200).json(resDatas);
        }
      } catch (error) {
        res.status(400).set('Content-Type', 'text/plain').send('Invalid format file');
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Запросы на получение инфы из базы справочников
app.post('/users/post/4', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass
        if (data.text === 'counterpaties') {
          const resDatas = await myModule.directoryCounterpaties(data)
          res.status(200).json(resDatas);
        }
        if (data.text === 'transports') {
          const resDatas = await myModule.directoryTransports(data)
          res.status(200).json(resDatas);
        }

        if (data.text === 'products') {
          const resDatas = await myModule.directoryProducts(data)
          res.status(200).json(resDatas);
        }

        if (data.text === 'initializationAccounting') {
          const resDatas = await myModule.initializationAccounting(data)
          res.status(200).json(resDatas);
        }

        if (data.text === 'turnoverBalance') {
          const resDatas = await myModule.turnoverBalance(data)
          res.status(200).json(resDatas);
        }
      } catch (error) {
        res.status(400).set('Content-Type', 'text/plain').send(error);
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Запросы на удаление инфы из базы
app.post('/users/post/5', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass

        if (data.text === 'deleteDirectoryItemCounterparty') {
          const resDatas = await myModule.deleteDirectoryItemCounterparty(data)
          res.status(200).json(resDatas);
        }
        if (data.text === 'transports') {
          const resDatas = await myModule.directoryTransports(data)
          res.status(200).json(resDatas);
        }

        if (data.text === 'products') {
          const resDatas = await myModule.directoryProducts(data)
          res.status(200).json(resDatas);
        }

      } catch (error) {
        res.status(400).set('Content-Type', 'text/plain').send(error);
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Запросы Мессанжера
app.post('/users/post/6', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass

        if (data.text === 'messenger') {
          const resDatas = await messengerModule.messenger(data)
          res.status(200).json(resDatas);
        }

        if (data.text === 'reportDLVD') {
          const resDatas = await messengerModule.reportDLVD(data)
          res.status(200).json(resDatas);
        }

        if (data.text === 'reporReadMsg') {
          const resDatas = await messengerModule.reporReadMsg(data)
          res.status(200).json(resDatas);
        }

        if (data.text === 'newMsg') {
          const resDatas = await messengerModule.newMsg(data)
          res.status(200).json(resDatas);
        }

      } catch (error) {
        res.status(400).set('Content-Type', 'text/plain').send(error);
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});  

//Запросы на сохранение поставки
app.post('/users/post/10', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass
        if (data.text === 'saveSupply') {
          const resDatas = await supplyModule.saveSupply(data)
          res.status(200).json(resDatas);
        }
        if (data.textreq === 'lab') {
          const resDatas = await recastModule.saveLAB(data)
          res.status(200).json(resDatas);
        }
      } catch (error) {
        res.status(400).set('Content-Type', 'text/plain').send('Invalid format file');
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Запросы на получение данных поставки
app.post('/users/post/11', (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass
        if (data.text === 'openSupply') {
          const resDatas = await supplyModule.querySupply(data)
          res.status(200).json(resDatas);
        } else if (data.text === 'recast') {
            const resDatas = await recastModule.openRecast(data)
            res.send(resDatas);
        } else if (data.text === 'removeSample') {
            const resDatas = await recastModule.removeSample(data)
            res.send(resDatas);
        }
      } catch (error) {
        // console.log(error)
        res.status(400).set('Content-Type', 'text/plain').send(error);
        // res.status(400).set('Content-Type', 'text/plain').send('Invalid format file');
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Запросы на сохранение элементов справочников
app.post('/users/post/12', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass
        //  console.log(data)

        if (data.textreq === 'counterparty') {
          const resDatas = await myModule.saveCounterparty(data)
          res.status(200).json(resDatas);
        }

        if (data.textreq === 'transport') {
          const resDatas = await myModule.saveTransport(data)
          res.status(200).json(resDatas);
        }

        if (data.textreq === 'product') {
          const resDatas = await myModule.saveProduct(data)
          res.status(200).json(resDatas);
        }

        if (data.textreq === 'sample') {
          const resDatas = await recastModule.saveSample(data)
          res.status(200).json(resDatas);
        }


      } catch (error) {
        // console.log(error)
        res.status(400).set('Content-Type', 'text/plain').send(error);
        // res.status(400).set('Content-Type', 'text/plain').send('Invalid format file');
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Запросы на получение данных элементов справочников
app.post('/users/post/13', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass
        //  console.log(data)
        if (data.textreq === 'counterparty') {
          const resDatas = await myModule.openCounterparty(data)
          res.status(200).json(resDatas);
        }

        if (data.textreq === 'transport') {
          const resDatas = await myModule.openTransport(data)
          res.status(200).json(resDatas);
        }

      } catch (error) {
        // console.log(error)
        res.status(400).set('Content-Type', 'text/plain').send(error);
        // res.status(400).set('Content-Type', 'text/plain').send('Invalid format file');
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Запросы на print
app.post('/users/post/14', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass
        //  console.log(data)
        const resDatas = await printModule.printRecast(data)
        res.status(200).json(resDatas);

        // res.sendFile(path.join(__dirname, 'public', 'output.xlsx'));

      } catch (error) {
        // console.log(error)
        res.status(400).set('Content-Type', 'text/plain').send(error);
        // res.status(400).set('Content-Type', 'text/plain').send('Invalid format file');
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Запросы на print list supplys
app.post('/users/post/15', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass
          // console.log(data)
        const resDatas = await printModule.printListSupplys(data)
        res.status(200).json(resDatas);

        // res.sendFile(path.join(__dirname, 'public', 'output.xlsx'));

      } catch (error) {
        // console.log(error)
        res.status(400).set('Content-Type', 'text/plain').send(error);
        // res.status(400).set('Content-Type', 'text/plain').send('Invalid format file');
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Запросы на print list recast
app.post('/users/post/16', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass
          // console.log(data)
        const resDatas = await printModule.printListRecasts(data)
        res.status(200).json(resDatas);

        // res.sendFile(path.join(__dirname, 'public', 'output.xlsx'));

      } catch (error) {
        // console.log(error)
        res.status(400).set('Content-Type', 'text/plain').send(error);
        // res.status(400).set('Content-Type', 'text/plain').send('Invalid format file');
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});

//Зфпрос на сохраннение rest
app.post('/users/post/17', async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk });

    req.on('end', async () => {
      const dataUser = getValidationData(req.ip)
      if (!dataUser) {
        res.status(401).set('Content-Type', 'text/plain').send('Invalid vaid client');
        return;
      }

      try {
        const data = JSON.parse(body);
        data.username = dataUser.username
        data.userpass = dataUser.userpass
        if (data.textreq === 'saveRowlab') {
          const resDatas = await recastModule.saveLAB(data)
          res.status(200).json(resDatas);
        } else if (data.textreq === 'auditSupplys') {
          const resDatas = await recastModule.auditSupplys(data)
          res.status(200).json(resDatas);
        } else if (data.textreq === 'saveConversion') {
          const resDatas = await recastModule.saveConversion(data)
          res.status(200).json(resDatas);
        } else if (data.textreq === 'deleteRowRecast') {
          const resDatas = await recastModule.deleteRowRecast(data)
          res.status(200).json(resDatas);
        }
      } catch (error) {
        res.status(400).set('Content-Type', 'text/plain').send('Invalid format file');
      }
    });
  } else {
    res.status(200).set('Content-Type', 'text/plain').send('This is GET query');
  }
});


//Добавляем в массив пользоватеоей нового
function validationList(ip, username, userpass) {
  if (arrValidation.length !== 0) {
    for (let i = 0; i < arrValidation.length; i++) {
      if (arrValidation[i].ip === ip && arrValidation[i] === username) { arrValidation.splice(i, 1) }
    }
  }
  arrValidation.push({ ip: ip, dateTime: Date.now(), user: username, password: userpass })
  //console.log(arrValidation)
}
/** Проверка на валидацию пользователя **/
function getValidationData(ip) {
  let result = false
  for (let i = 0; i < arrValidation.length; i++) {
    if (arrValidation[i].ip === ip) {
      result = { username: arrValidation[i].user, userpass: arrValidation[i].password }
    }
  }
  //console.log(ip)
  return result
}
//Проверка на оганичение времени работы пользователя в браузере
function monitorUsersTime() {
  if (arrValidation.length !== 0) {
    const now = Date.now()
    for (let i = 0; i < arrValidation.length; i++) {
      if ((now - arrValidation[i].dateTime) > (300 * 60 * 1000)) {
        console.log(`Time out, user: ${arrValidation[i].user}`)
        arrValidation.splice(i, 1)
        // console.log(arrValidation)
      }
    }
  }
  setTimeout(() => {
    monitorUsersTime()
  }, 5 * 60 * 1000);
}

monitorUsersTime()

// Обработка подключения клиента
io.on('connection', (socket) => {
  // console.log('Новое соединение с клиентом:', socket.id);
  // Допустим, при подключении клиент передает свой userId (из сессии или токена)
  const userId = socket.handshake.auth.userId; 
  if (userId) {
    // Добавляем сокет в комнату, равную вашему ID
    socket.join(userId);
    console.log(`Клиент с socket.id ${socket.id} привязан к кастомному ID: ${userId}`);
  }
  
  // Отключение клиента
  socket.on('disconnect', () => {
    console.log('Клиент отключился:', socket.id);
  });
});

// function ioSendMsg(data) {
//   io.to(data.recipient).emit('personal_message', { text: data });
// }

// module.exports = {ioSendMsg};

const PORT = 3000

// app.listen(PORT, () => {
//   console.log(`Server started: http://localhost:${PORT}`)
// })

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});