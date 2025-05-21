export const manejoSalidaUsuario = (socket, salas, io, emitirSalasActualizadas, ipsConectadas) => {
  
  // Función que elimina un usuario de su sala (por socket.id)
  function eliminarUsuarioDeSala(socket, salas, io, emitirSalasActualizadas, ipsConectadas) {
    for (const salaNombre in salas) {
      const salaObj = salas[salaNombre];

      // Buscar usuario por socket.id
      let nombreUsuarioEncontrado = null;
      let ipUsuarioEncontrado = null;

      for (const [nombreUsuario, data] of salaObj.usuarios.entries()) {
        if (data.socketId === socket.id) {
          nombreUsuarioEncontrado = nombreUsuario;
          ipUsuarioEncontrado = data.ip;
          break;
        }
      }

      if (nombreUsuarioEncontrado) {
        // Eliminar usuario de la sala
        salaObj.usuarios.delete(nombreUsuarioEncontrado);

        // Quitar IP del mapa global
        if (ipUsuarioEncontrado && ipsConectadas.has(ipUsuarioEncontrado)) {
          ipsConectadas.delete(ipUsuarioEncontrado);
          console.log(`IP ${ipUsuarioEncontrado} eliminada de ipsConectadas tras desconexión.`);
        }

        // Emitir a todos en la sala que el usuario salió
        io.to(salaNombre).emit('usuarioDesconectado', { nombreUsuario: nombreUsuarioEncontrado });

        // Hacer que el socket salga de la sala (de forma segura)
        socket.leave(salaNombre);

        console.log(`${nombreUsuarioEncontrado} desconectado de sala "${salaNombre}". Usuarios restantes: ${salaObj.usuarios.size}`);

        manejarCreadorYEliminacion(salaNombre, salaObj, salas, io, emitirSalasActualizadas, ipsConectadas);

        return;  // Sale luego de procesar la sala del usuario desconectado
      }
    }
  }

  // Maneja la lógica del creador y elimina la sala si está vacía
  function manejarCreadorYEliminacion(salaNombre, salaObj, salas, io, emitirSalasActualizadas, ipsConectadas) {
    // Reasignar creador si el actual ya no está conectado
    if (!Array.from(salaObj.usuarios.values()).some(u => u.socketId === salaObj.creador)) {
      if (salaObj.usuarios.size > 0) {
        const primerUsuario = salaObj.usuarios.values().next().value;
        salaObj.creador = primerUsuario.socketId;
        console.log(`Nuevo creador para la sala "${salaNombre}" es ${salaObj.creador}`);
      }
    }

    // Si la sala quedó vacía, eliminarla y limpiar ipsConectadas
    if (salaObj.usuarios.size === 0) {
      // Borrar IPs que pertenezcan a esa sala
      for (const [ip, nombreSala] of ipsConectadas.entries()) {
        if (nombreSala === salaNombre) {
          ipsConectadas.delete(ip);
          console.log(`IP ${ip} removida de ipsConectadas por eliminación de sala "${salaNombre}"`);
        }
      }

      delete salas[salaNombre];
      console.log(`Sala "${salaNombre}" eliminada porque no quedan usuarios.`);
    }

    emitirSalasActualizadas();
  }

  // Listener desconexión automática (pérdida de conexión)
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    eliminarUsuarioDeSala(socket, salas, io, emitirSalasActualizadas, ipsConectadas);
  });

  // Listener para salida voluntaria del usuario
  socket.on('salirSala', ({ sala, nombreUsuario }) => {
    if (!salas[sala]) return;
    const salaObj = salas[sala];
    if (!salaObj.usuarios.has(nombreUsuario)) return;

    const dataUsuario = salaObj.usuarios.get(nombreUsuario);
    const ipUsuario = dataUsuario?.ip;

    // Eliminar usuario de la sala
    salaObj.usuarios.delete(nombreUsuario);

    // Limpiar ipsConectadas
    if (ipUsuario && ipsConectadas.has(ipUsuario)) {
      ipsConectadas.delete(ipUsuario);
      console.log(`IP ${ipUsuario} eliminada de ipsConectadas por salida voluntaria.`);
    }

    io.to(sala).emit('usuarioDesconectado', { nombreUsuario });

    socket.leave(sala);

    console.log(`${nombreUsuario} salió voluntariamente de la sala "${sala}". Usuarios restantes: ${salaObj.usuarios.size}`);

    manejarCreadorYEliminacion(sala, salaObj, salas, io, emitirSalasActualizadas, ipsConectadas);
  });
};
