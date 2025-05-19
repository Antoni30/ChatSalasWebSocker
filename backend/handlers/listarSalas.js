export const listarSalas = (socket,salas)=>{
socket.on('listarSalas', () => {
    // Extraemos solo los nombres de las salas activas
    const listaSalas = Object.keys(salas);
    socket.emit('salasDisponibles', listaSalas);
  });

}