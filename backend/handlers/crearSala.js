import { generarPinUUID } from "../utils/PIN.js";

export const crearSala = (socket, salas, io, emitirSalasActualizadas) => {
  socket.on("crearSala", ({ nombreSala, limite, nombreUsuario }) => {
    if (!salas[nombreSala]) {
      salas[nombreSala] = {
        usuarios: new Map(), // Cambiamos a Map para guardar nombreUsuario e IP
        limite: parseInt(limite, 10) || 10,
        creador: socket.id,
        pin: generarPinUUID(),
      };

              // Obtener IP y limpiar prefijo ::ffff: si existe
        const ipCompleta = socket.handshake.address; // Ejemplo: "::ffff:192.168.1.31"
        const ipCliente = ipCompleta.replace(/^::ffff:/, '');


      // Validar nombre único en esta sala (aquí está vacía, es creación)
      if (salas[nombreSala].usuarios.has(nombreUsuario)) {
        socket.emit("error", { mensaje: `El nombre "${nombreUsuario}" ya está en uso en la sala.` });
        return;
      }

      salas[nombreSala].usuarios.set(nombreUsuario, { socketId: socket.id, ip: ipCliente });

      socket.join(nombreSala);

      socket.salaActual = nombreSala;
      socket.nombreUsuario = nombreUsuario;
      const pin = salas[nombreSala].pin;
      console.log(
        `Sala "${nombreSala}" creada por ${nombreUsuario} (${socket.id}, IP: ${ipCliente}) con límite ${salas[nombreSala].limite} y pin ${pin}`
      );

      socket.emit("salaCreada", { sala: nombreSala, nombreUsuario, pin });
      socket.emit("unidoASala", { sala: nombreSala, nombreUsuario, pin });

      emitirSalasActualizadas();
    } else {
      socket.emit("error", { mensaje: `La sala "${nombreSala}" ya existe.` });
      console.log(`Intento de crear sala ya existente: "${nombreSala}"`);
    }
  });
};

