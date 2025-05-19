import React, { useEffect, useState, useRef } from "react";
import socket from "../utils/socket";

interface ChatProps {
  sala: string;
  nombreUsuario: string;
  pin: string;
}

interface Mensaje {
  nombreUsuario: string;
  contenido: string;
}

const Chat: React.FC<ChatProps> = ({ sala, nombreUsuario, pin }) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [mensajeInput, setMensajeInput] = useState("");
  const [copiado, setCopiado] = useState(false);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit("unirSala", { sala, nombreUsuario, pin });

    socket.on("salaCreada", ({ sala: salaCreada, nombreUsuario }) => {
      setMensajes((prev) => [
        ...prev,
        { nombreUsuario: "Sistema", contenido: `Sala "${salaCreada}" creada.` },
        { nombreUsuario: "Sistema", contenido: `${nombreUsuario} se ha unido.` },
      ]);
    });

    socket.on("nuevoUsuario", ({ nombreUsuario, ip }: { nombreUsuario: string; ip?: string }) => {
      const mensaje = ip
        ? `${nombreUsuario} se ha unido desde IP ${ip}`
        : `${nombreUsuario} se ha unido.`;

      setMensajes((prev) => [
        ...prev,
        { nombreUsuario: "Sistema", contenido: mensaje },
      ]);
    });

    socket.on("mensajePrivado", ({ contenido }) => {
      setMensajes((prev) => [
        ...prev,
        { nombreUsuario: "Sistema", contenido },
      ]);
    });

    socket.on("mensaje", (msg: Mensaje) => {
      setMensajes((prev) => [...prev, msg]);
    });

    socket.on("usuarioDesconectado", ({ nombreUsuario }) => {
      setMensajes((prev) => [
        ...prev,
        { nombreUsuario: "Sistema", contenido: `${nombreUsuario} ha salido.` },
      ]);
    });

    socket.on("pinSala", (data: { pin: string }) => {
      console.log("PIN recibido:", data.pin);
    });

    return () => {
      socket.off("salaCreada");
      socket.off("nuevoUsuario");
      socket.off("mensajePrivado");
      socket.off("mensaje");
      socket.off("usuarioDesconectado");
      socket.off("pinSala");
      socket.off("error");
    };
  }, [sala, nombreUsuario, pin]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarMensaje = () => {
    const contenido = mensajeInput.trim();
    if (!contenido) return;

    socket.emit("mensaje", { contenido });
    setMensajeInput("");
  };

  const copiarPin = () => {
    navigator.clipboard.writeText(pin).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", position: "relative" }}>
      <div
        style={{
          position: "relative",
          top: 10,
          right: 10,
          backgroundColor: "#007bff",
          color: "white",
          padding: "6px 12px",
          borderRadius: "12px",
          fontWeight: "bold",
          userSelect: "text",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "default",
        }}
        title="PIN de la sala"
      >
        <span>PIN: {pin}</span>
        <button
          onClick={copiarPin}
          style={{
            backgroundColor: "white",
            border: "none",
            borderRadius: "6px",
            padding: "2px 8px",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#007bff",
            userSelect: "none",
          }}
          aria-label="Copiar PIN"
          title="Copiar PIN"
        >
          📋
        </button>
        {copiado && (
          <span
            style={{
              marginLeft: 8,
              color: "lightgreen",
              fontWeight: "bold",
              userSelect: "none",
              transition: "opacity 0.3s ease",
            }}
          >
            Copiado!
          </span>
        )}
      </div>

      <h2>Chat en sala: {sala}</h2>
      <div
        style={{
          height: 300,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 8,
          marginBottom: 8,
          backgroundColor: "#f9f9f9",
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {mensajes.map((msg, i) => {
          const esMensajePropio = msg.nombreUsuario === nombreUsuario;
          const esSistema = msg.nombreUsuario === "Sistema";

          return (
            <div
              key={i}
              style={{
                alignSelf: esMensajePropio ? "flex-end" : "flex-start",
                backgroundColor: esMensajePropio
                  ? "#d0e6ff"
                  : esSistema
                  ? "#eee"
                  : "#fff",
                color: esSistema ? "gray" : esMensajePropio ? "blue" : "black",
                fontStyle: esSistema ? "italic" : "normal",
                padding: "8px 12px",
                borderRadius: "16px",
                maxWidth: "70%",
                wordBreak: "break-word",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {!esSistema && (
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 12,
                    marginBottom: 4,
                    userSelect: "none",
                  }}
                >
                  {msg.nombreUsuario}
                </div>
              )}
              <div>{msg.contenido}</div>
            </div>
          );
        })}
        <div ref={mensajesEndRef} />
      </div>
      <input
        placeholder="Escribe tu mensaje"
        value={mensajeInput}
        onChange={(e) => setMensajeInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
        style={{ width: "100%", marginBottom: 8, padding: "8px" }}
      />
      <button onClick={enviarMensaje} style={{ width: "100%", padding: "8px" }}>
        Enviar
      </button>
    </div>
  );
};

export default Chat;
