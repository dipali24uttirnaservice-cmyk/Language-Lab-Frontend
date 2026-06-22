"use client";

import Image from "next/image";
import Video from "next-video";
import { Play,Pause, Sparkles } from "lucide-react";
const femaleVideo = "/AI_avatar_video_female.mp4";
const maleVideo = "/AI_avatar_video_male.mp4";

import { useRef, useState } from "react";

export default function AIAvatarCoach({
  voiceGender,
  isSpeaking,
  mainVideoFinished,
  setMainVideoFinished,
  isPlayingMain,
  setIsPlayingMain,
  handleMouseMove,
  setIsHovered,
  setMouseCoords,
  isHovered,
})



{

  const videoRef = useRef(null);
const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  return (
    <div className="lg:col-span-5 relative flex items-stretch h-[450px] lg:h-[580px] z-0 overflow-hidden rounded-2xl border-2 border-amber-400/70 bg-white/40 backdrop-blur-md shadow-[0_20px_50px_rgba(245,158,11,0.25)]">

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-tr from-amber-500/30 to-orange-400/30 blur-[110px] rounded-full -z-10 animate-pulse" />

    

      
      <div
        className="relative w-full h-full overflow-hidden group"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMouseCoords({ x: 0, y: 0 });
        }}
      >
       
         
      
   <video
  ref={videoRef}
  src={voiceGender === "female"
    ? "/AI_avatar_video_female.mp4"
    : "/AI_avatar_video_male.mp4"}
  autoPlay
  loop
  playsInline
  controls={false}
  muted={false}
  className="w-full h-full object-cover"
/>
    

        {/* Intro Button */}
      <button
  onClick={() => {
    const video = videoRef.current;

    if (!video) return;

    if (isVideoPlaying) {
      video.pause();
      setIsVideoPlaying(false);
    } else {
      video.play();
      setIsVideoPlaying(true);
    }
  }}
  className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-amber-400 bg-white/90 px-4 py-2 text-xs font-bold shadow-lg hover:scale-105 transition-all"
>
  {isVideoPlaying ? (
    <>
      <Pause className="w-4 h-4" />
      Pause
    </>
  ) : (
    <>
      <Play className="w-4 h-4 fill-current" />
      Play
    </>
  )}
</button>

        {isHovered && (
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-scan" />
        )}

       
      </div>
    </div>
  );
}