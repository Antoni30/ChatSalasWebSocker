import { generarPinUnico6Digitos } from "../utils/PIN.js";
import { emitirEstadoSala } from "./emitirEstadoSala.js";

export const crearSala = (socket, salas, io, emitirSalasActualizadas, ipsConectadas) => {
  socket.on("crearSala", ({ nombreSala, limite, nombreUsuario }) => {
    if (!salas[nombreSala]) {
      const ipCompleta = socket.handshake.address;
      const ipCliente = ipCompleta.replace(/^::ffff:/, '');

      // Validar que esta IP no tenga ya una sala creada
      if (ipsConectadas.has(ipCliente)) {
        socket.emit("error", { mensaje: "Ya tienes una sala activa creada desde tu equipo." });
        return;
      }

      salas[nombreSala] = {
        usuarios: new Map(),
        limite: parseInt(limite, 10) || 10,
        creador: socket.id,
        pin: generarPinUnico6Digitos(),
      };

      // Validar nombreUsuario (aunque la sala está vacía)
      if (salas[nombreSala].usuarios.has(nombreUsuario)) {
        socket.emit("error", { mensaje: `El nombre "${nombreUsuario}" ya está en uso en la sala.` });
        return;
      }

      // Guardar usuario y sala en la estructura
      salas[nombreSala].usuarios.set(nombreUsuario, { socketId: socket.id, ip: ipCliente });
      ipsConectadas.set(ipCliente, nombreSala);

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
      emitirEstadoSala(nombreSala, io, salas);
    } else {
      socket.emit("error", { mensaje: `La sala "${nombreSala}" ya existe.` });
      console.log(`Intento de crear sala ya existente: "${nombreSala}"`);
    }
  });
};