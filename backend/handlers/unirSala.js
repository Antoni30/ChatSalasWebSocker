export const unirSala = (socket, salas, io, emitirSalasActualizadas, ipsConectadas) => {
  socket.on("unirSala", ({ sala, nombreUsuario, pin }) => {
    if (!salas[sala]) {
      socket.emit("error", { mensaje: `La sala "${sala}" no existe.` });
      return;
    }

    if (salas[sala].pin !== pin) {
      socket.emit("error", { mensaje: "PIN incorrecto" });
      return;
    }

    if (salas[sala].usuarios.size >= salas[sala].limite) {
      socket.emit("error", { mensaje: `La sala "${sala}" está llena.` });
      return;
    }

    if (salas[sala].usuarios.has(nombreUsuario)) {
      socket.emit("error", { mensaje: `El nombre "${nombreUsuario}" ya está en uso en la sala.` });
      return;
    }

    const ipCompleta = socket.handshake.address;
    const ipCliente = ipCompleta.replace(/^::ffff:/, '');

    // Validar que esta IP no tenga ya usuario en alguna sala
    if (ipsConectadas.has(ipCliente)) {
      socket.emit("error", { mensaje: "Ya tienes una sesión activa en otra sala desde este equipo." });
      return;
    }

    salas[sala].usuarios.set(nombreUsuario, { socketId: socket.id, ip: ipCliente });
    ipsConectadas.set(ipCliente, sala);

    socket.join(sala);
    socket.salaActual = sala;
    socket.nombreUsuario = nombreUsuario;

    socket.emit("pinSala", salas[sala].pin);
    socket.emit("unidoASala", { sala, nombreUsuario, pin });

    socket.to(sala).emit("nuevoUsuario", { nombreUsuario, ip: ipCliente });

    socket.emit("mensajePrivado", { contenido: `Bienvenido al chat "${sala}"` });

    emitirSalasActualizadas();

    console.log(`${nombreUsuario} (${socket.id}, IP: ${ipCliente}) se unió a la sala "${sala}"`);
  });
};
