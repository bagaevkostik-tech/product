// socket.js
let io;

module.exports = {
  // Инициализация сокета, вызывается один раз в сервере
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: '*', // Настройте CORS под свои нужды
        methods: ['GET', 'POST']
      }
    });
    return io;
  },
  // Получение уже инициализированного инстанса в других файлах
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io не был инициализирован!');
    }
    return io;
  }
};
