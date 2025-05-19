export const mensaje = (socket, io) => {
  socket.on("mensaje", ({ contenido }) => {
    if (!contenido || !contenido.trim()) {
      socket.emit("error", { mensaje: "El mensaje no puede estar vacío." });
      return;
    }

    if (socket.salaActual && socket.nombreUsuario) {
      io.to(socket.salaActual).emit("mensaje", {
        nombreUsuario: socket.nombreUsuario,
        contenido,
      });
    } else {
      socket.emit("error", { mensaje: "No estás unido a ninguna sala." });
    }
  });
};
