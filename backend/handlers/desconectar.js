export const desconectar = (socket, salas, io, emitirSalasActualizadas) => {
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);

    for (const salaNombre in salas) {
      const sala = salas[salaNombre];
      // Buscar nombreUsuario correspondiente a este socket.id
      let nombreUsuarioEncontrado = null;
      for (const [nombreUsuario, data] of sala.usuarios.entries()) {
        if (data.socketId === socket.id) {
          nombreUsuarioEncontrado = nombreUsuario;
          break;
        }
      }

      if (nombreUsuarioEncontrado) {
        // Eliminar usuario de la sala
        sala.usuarios.delete(nombreUsuarioEncontrado);

        io.to(salaNombre).emit('usuarioDesconectado', { nombreUsuario: nombreUsuarioEncontrado });
        console.log(`${nombreUsuarioEncontrado} (${socket.id}) abandonó la sala "${salaNombre}". Usuarios restantes: ${sala.usuarios.size}`);

        if (sala.creador === socket.id) {
          if (sala.usuarios.size > 0) {
            // Reasignar creador a otro usuario (primer usuario en la Map)
            const primerUsuario = sala.usuarios.values().next().value;
            sala.creador = primerUsuario.socketId;
            console.log(`Nuevo creador para la sala "${salaNombre}" es el usuario con socketId: ${sala.creador}`);
          } else {
            // No quedan usuarios, eliminar sala
            delete salas[salaNombre];
            console.log(`Sala "${salaNombre}" eliminada porque el anfitrión salió y no quedan usuarios.`);
            emitirSalasActualizadas();
            break;
          }
        }

        // Si quedó usuario(s) y no se eliminó la sala, emitimos actualización
        emitirSalasActualizadas();

        break; // Salir del loop porque encontramos el usuario desconectado
      }
    }
  });
};
