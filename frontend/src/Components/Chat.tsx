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
      setMensajes(prev => [
        ...prev,
        { nombreUsuario: "Sistema", contenido: `Sala "${salaCreada}" creada.` },
        { nombreUsuario: "Sistema", contenido: `${nombreUsuario} se ha unido.` }
      ]);
    });

    socket.on("nuevoUsuario", ({ nombreUsuario, ip }: { nombreUsuario: string; ip?: string }) => {
      const msg = ip
        ? `${nombreUsuario} se ha unido desde IP ${ip}`
        : `${nombreUsuario} se ha unido.`;
      setMensajes(prev => [...prev, { nombreUsuario: "Sistema", contenido: msg }]);
    });

    socket.on("mensajePrivado", ({ contenido }) => {
      setMensajes(prev => [...prev, { nombreUsuario: "Sistema", contenido }]);
    });

    socket.on("mensaje", (msg: Mensaje) => {
      setMensajes(prev => [...prev, msg]);
    });

    socket.on("usuarioDesconectado", ({ nombreUsuario }) => {
      setMensajes(prev => [
        ...prev,
        { nombreUsuario: "Sistema", contenido: `${nombreUsuario} ha salido.` }
      ]);
    });

    return () => {
      socket.off("salaCreada");
      socket.off("nuevoUsuario");
      socket.off("mensajePrivado");
      socket.off("mensaje");
      socket.off("usuarioDesconectado");
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
    <div
      style={{
        maxWidth: 800,
        //margin: "40px auto",
        display: "flex",
        gap: "40px",
        padding: "20px",
        background: "rgba(30, 30, 47, 0.8)",
        borderRadius: "16px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
       // color: "#e0d9ff",
        alignItems: "center",
      }}
    >
      {/* Área de chat */}
      <div
        style={{
          width: "600px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            textShadow: "0 0 8px #9f7aea88",
            margin: 0,
          }}
        >
          Chat en sala: {sala}
        </h2>

        <div
          style={{
            height: "400px",
            overflowY: "auto",
            padding: "16px",
            background: "rgba(46, 46, 66, 0.6)",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {mensajes.map((msg, i) => {
            const esPropio = msg.nombreUsuario === nombreUsuario;
            const esSistema = msg.nombreUsuario === "Sistema";
            const bg = esSistema
              ? "rgba(255,255,255,0.1)"
              : esPropio
              ? "linear-gradient(145deg, #6a00b0, #370064)"
              : "rgba(255,255,255,0.2)";
            const color = esSistema
              ? "#bbbbbb"
              : esPropio
              ? "#e0d9ff"
              : "#f5f5f5";

            return (
              <div
                key={i}
                style={{
                  alignSelf: esPropio ? "flex-end" : "flex-start",
                  background: bg,
                  color,
                  padding: "10px 14px",
                  borderRadius: "20px",
                  maxWidth: "70%",
                  wordBreak: "break-word",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}
              >
                {!esSistema && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      marginBottom: "4px",
                      opacity: 0.8,
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

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            placeholder="Escribe tu mensaje"
            value={mensajeInput}
            onChange={e => setMensajeInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && enviarMensaje()}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: "#1e1e2f",
              color: "#e0d9ff",
              outline: "none",
            }}
          />
          <button
            onClick={enviarMensaje}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(145deg, #370064, #6a00b0)",
              color: "#e0d9ff",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(108, 51, 255, 0.5)",
            }}
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Sidebar de PIN */}
      <div
        style={{
          width: "200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          background: "linear-gradient(145deg, #370064, #6a00b0)",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <h3
          style={{
            margin: 0,
            textAlign: "center",
            color: "#e0d9ff",
            textShadow: "0 0 6px #9f7aea88",
          }}
        >
          PIN de Sala
        </h3>
        <div
          style={{
            fontSize: "1.4rem",
            fontWeight: "700",
            textAlign: "center",
            color: "#fff",
            background: "rgba(255,255,255,0.1)",
            padding: "10px",
            borderRadius: "8px",
            userSelect: "text",
          }}
        >
          {pin}
        </div>
        <button
          onClick={copiarPin}
          style={{
            background: "#e0d9ff",
            color: "#370064",
            border: "none",
            borderRadius: "6px",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: "700",
            boxShadow: "0 2px 6px rgba(108, 51, 255, 0.5)",
          }}
        >
          📋 Copiar
        </button>
        {copiado && (
          <span
            style={{
              textAlign: "center",
              color: "#81c784",
              fontWeight: "700",
            }}
          >
            ¡Copiado!
          </span>
        )}
      </div>
    </div>
  );
};

export default Chat;
