"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket/client";
import { videoLoop } from "@/lib/temas";

export default function Sala1TvPage() {
  const [video, setVideo] = useState(videoLoop);
  const [emLoop, setEmLoop] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("sala1:entrar", { papel: "tv" });

    socket.on("sala1:tocar-video", ({ video }) => {
      setVideo(video);
      setEmLoop(false);
    });

    socket.on("sala1:voltar-loop", () => {
      setVideo(videoLoop);
      setEmLoop(true);
    });

    return () => {
      socket.off("sala1:tocar-video");
      socket.off("sala1:voltar-loop");
    };
  }, []);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [video]);

  function aoTerminarVideo() {
    if (emLoop) return;
    getSocket().emit("sala1:video-finalizado");
  }

  return (
    <main className="h-screen w-screen bg-black">
      <video
        ref={videoRef}
        key={video}
        src={video}
        autoPlay
        muted={emLoop}
        loop={emLoop}
        onEnded={aoTerminarVideo}
        className="h-full w-full object-cover"
      />
    </main>
  );
}
