"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactPlayer from "react-player";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Loader2,
} from "lucide-react";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : m;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function VideoPlayer({
  src,
  poster,
  onEnded,
  autoPlay = true,
  className = "",
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const [playing, setPlaying] = useState(autoPlay);
  // Browsers block unmuted autoplay until the user has interacted with the
  // page (NotAllowedError) — starting muted when autoplaying is the only
  // way to have playback actually begin; the user can unmute via the
  // volume button, which counts as the interaction browsers require.
  const [muted, setMuted] = useState(autoPlay);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [rate, setRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [loadError, setLoadError] = useState(false);

  // Reset transient state whenever the source changes (e.g. next lesson)
  useEffect(() => {
    setPlaying(autoPlay);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    setIsLoading(true);
    setLoadError(false);
  }, [src, autoPlay]);

  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowControls((prevShown) => (playing ? false : prevShown));
    }, 2500);
  }, [playing]);

  useEffect(() => {
    if (playing) {
      scheduleHide();
    } else {
      clearTimeout(hideTimerRef.current);
      setShowControls(true);
    }
    return () => clearTimeout(hideTimerRef.current);
  }, [playing, scheduleHide]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    scheduleHide();
  };

  const togglePlay = () => setPlaying((p) => !p);
  const toggleMute = () => setMuted((m) => !m);

  const skip = (delta) => {
    const el = playerRef.current;
    if (!el) return;
    const max = duration || el.duration || 0;
    el.currentTime = Math.min(Math.max(el.currentTime + delta, 0), max);
  };

  const handleSeekChange = (e) => {
    setIsSeeking(true);
    setSeekValue(Number(e.target.value));
  };
  const commitSeek = (e) => {
    const el = playerRef.current;
    if (el) el.currentTime = Number(e.target.value);
    setIsSeeking(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const changeVolume = (e) => {
    const next = Number(e.target.value);
    setVolume(next);
    setMuted(next === 0);
  };

  const progressPct = duration
    ? ((isSeeking ? seekValue : currentTime) / duration) * 100
    : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;
  
if (!src?.trim()) {
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black flex items-center justify-center ${className}`}
    >
      <p className="text-white/70">Video not available.</p>
    </div>
  );
}

if (loadError) {
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black flex items-center justify-center ${className}`}
    >
      <p className="text-white/70">This video failed to load.</p>
    </div>
  );
}

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <ReactPlayer
     ref={playerRef}
  src={src?.trim() ? src : undefined}
  poster={poster?.trim() ? poster : undefined}
        playing={playing}
        muted={muted}
        volume={volume}
        playbackRate={rate}
        controls={false}
        playsInline
        width="100%"
        height="100%"
        style={{ objectFit: "contain" }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
        onDurationChange={(e) => setDuration(e.target.duration)}
        onTimeUpdate={(e) => {
          if (!isSeeking) setCurrentTime(e.target.currentTime);
        }}
        onProgress={(e) => {
          const buf = e.target.buffered;
          if (buf && buf.length) setBuffered(buf.end(buf.length - 1));
        }}
        onEnded={onEnded}
        onClick={togglePlay}
        onError={(err) => {
          // AbortError just means playback was interrupted by a src swap or
          // unmount — expected during lesson navigation, not a real failure.
          if (err?.name === "AbortError") return;
          setIsLoading(false);
          setLoadError(true);
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="animate-spin text-white/80" size={40} />
        </div>
      )}

      {!playing && !isLoading && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
        >
          <div className="h-16 w-16 rounded-full bg-orange-500/90 hover:bg-orange-500 flex items-center justify-center shadow-xl transition-transform hover:scale-110">
            <Play className="text-white fill-white ml-1" size={28} />
          </div>
        </button>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pt-10 pb-3 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative h-1.5 mb-3 group/seek cursor-pointer">
          <div className="absolute inset-0 rounded-full bg-white/25" />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/40"
            style={{ width: `${bufferedPct}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-orange-500"
            style={{ width: `${progressPct}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={isSeeking ? seekValue : currentTime}
            onChange={handleSeekChange}
            onMouseUp={commitSeek}
            onTouchEnd={commitSeek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-orange-500 shadow scale-0 group-hover/seek:scale-100 transition-transform pointer-events-none"
            style={{ left: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center gap-3 text-white">
          <button
            type="button"
            onClick={togglePlay}
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            {playing ? (
              <Pause size={20} className="fill-current" />
            ) : (
              <Play size={20} className="fill-current" />
            )}
          </button>
          <button
            type="button"
            onClick={() => skip(-10)}
            title="Back 10s"
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            <RotateCcw size={17} />
          </button>
          <button
            type="button"
            onClick={() => skip(10)}
            title="Forward 10s"
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            <RotateCw size={17} />
          </button>

          <div className="flex items-center gap-1.5 group/vol">
            <button
              type="button"
              onClick={toggleMute}
              className="hover:text-orange-400 transition-colors cursor-pointer"
            >
              {muted || volume === 0 ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={changeVolume}
              className="w-0 group-hover/vol:w-16 transition-all duration-200 accent-orange-500 cursor-pointer"
            />
          </div>

          <span className="text-xs font-mono tabular-nums text-white/90">
            {formatTime(isSeeking ? seekValue : currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSpeedMenu((s) => !s)}
              className="text-xs font-bold hover:text-orange-400 transition-colors px-1.5 cursor-pointer"
            >
              {rate}x
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-slate-900/95 rounded-lg shadow-xl border border-white/10 py-1 min-w-[70px] z-10">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setRate(s);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-colors cursor-pointer ${
                      s === rate ? "text-orange-400 font-bold" : "text-white"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );

}
