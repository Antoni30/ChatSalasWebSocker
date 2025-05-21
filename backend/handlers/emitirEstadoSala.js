// ejemplo de implementación esperada
export const emitirEstadoSala = (nombreSala, io, salas) => {
  const sala = salas[nombreSala];

  if (sala) {
    const estado = {
      sala: nombreSala,
      capacidadMaxima: sala.limite,
      conectados: sala.usuarios.size,
      usuarios: Array.from(sala.usuarios.keys())
    };

    io.to(nombreSala).emit("estadoSala", estado);
  }
};
