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
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

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
  autoPlay = false,
  className = "",
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const hideTimerRef = useRef(null);

  // ReactPlayer is NOT mounted until Play is clicked.
  const [started, setStarted] = useState(autoPlay);

  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);

  const [rate, setRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const [loadError, setLoadError] = useState(false);

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  /*
   * Reset when video changes.
   */
  useEffect(() => {
    setStarted(autoPlay);
    setPlaying(autoPlay);

    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);

    setIsLoading(autoPlay);
    setLoadError(false);

    setShowControls(true);
    setShowSpeedMenu(false);
  }, [src, autoPlay]);

  /*
   * Cleanup timer.
   */
  useEffect(() => {
    return () => {
      clearTimeout(hideTimerRef.current);
    };
  }, []);

  /*
   * Fullscreen listener.
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  /*
   * Hide controls while playing.
   */
  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimerRef.current);

    hideTimerRef.current = setTimeout(() => {
      setShowControls((current) => {
        return playing ? false : current;
      });
    }, 2500);
  }, [playing]);

  useEffect(() => {
    if (playing) {
      scheduleHide();
    } else {
      clearTimeout(hideTimerRef.current);
      setShowControls(true);
    }

    return () => {
      clearTimeout(hideTimerRef.current);
    };
  }, [playing, scheduleHide]);

  const handleMouseMove = () => {
    setShowControls(true);
    scheduleHide();
  };

  /*
   * Start video.
   *
   * ReactPlayer mounts only after this function runs.
   */
  const startVideo = () => {
    if (!src?.trim()) {
      return;
    }

    setLoadError(false);
    setIsLoading(true);
    setStarted(true);
    setPlaying(true);
  };

  /*
   * Play / Pause.
   */
  const togglePlay = () => {
    if (!started) {
      startVideo();
      return;
    }

    setPlaying((current) => !current);
  };

  /*
   * Mute / Unmute.
   */
  const toggleMute = () => {
    setMuted((current) => !current);
  };

  /*
   * Skip.
   */
  const skip = (delta) => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    const internalPlayer =
      player.getInternalPlayer?.() || player;

    if (!internalPlayer) {
      return;
    }

    const max =
      duration ||
      internalPlayer.duration ||
      0;

    const current =
      internalPlayer.currentTime || 0;

    const nextTime = Math.min(
      Math.max(current + delta, 0),
      max
    );

    internalPlayer.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  /*
   * Seek.
   */
  const handleSeekChange = (e) => {
    setIsSeeking(true);
    setSeekValue(Number(e.target.value));
  };

  const commitSeek = (e) => {
    const player = playerRef.current;

    if (player) {
      const internalPlayer =
        player.getInternalPlayer?.() || player;

      if (internalPlayer) {
        internalPlayer.currentTime = Number(
          e.target.value
        );
      }
    }

    setIsSeeking(false);
  };

  /*
   * Fullscreen.
   */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  /*
   * Volume.
   */
  const changeVolume = (e) => {
    const next = Number(e.target.value);

    setVolume(next);
    setMuted(next === 0);
  };

  const progressPct = duration
    ? ((isSeeking ? seekValue : currentTime) /
        duration) *
      100
    : 0;

  const bufferedPct = duration
    ? (buffered / duration) * 100
    : 0;

  /*
   * No video URL.
   */
  if (!src?.trim()) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full bg-black flex items-center justify-center ${className}`}
      >
        <span className="text-white/70">
          Video not available.
        </span>
      </div>
    );
  }

  /*
   * ==========================================================
   * BEFORE PLAY
   * ==========================================================
   *
   * ReactPlayer is NOT mounted.
   *
   * Only API thumbnail_url is displayed.
   */
 if (!started) {
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden ${className}`}
    >
      {poster ? (
        <img
          src={poster}
          alt="Video thumbnail"
          className="absolute inset-0 w-full h-full object-contain"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900" />
      )}

      <div className="absolute inset-0 bg-black/25" />

      <button
        type="button"
        onClick={startVideo}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="h-16 w-16 rounded-full bg-orange-500/95 hover:bg-orange-500 flex items-center justify-center shadow-xl transition-transform hover:scale-110">
          <Play
            className="text-white fill-white ml-1"
            size={28}
          />
        </div>
      </button>
    </div>
  );
}

const getPlayableSrc = (value) => {
  if (!value) return "";

  const cleanValue = value.trim();

  if (
    cleanValue.startsWith("http://") ||
    cleanValue.startsWith("https://") ||
    cleanValue.startsWith("blob:")
  ) {
    return cleanValue;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  return `${apiUrl.replace(/\/$/, "")}/${cleanValue.replace(/^\//, "")}`;
};

  /*
   * ==========================================================
   * VIDEO STARTED
   * ==========================================================
   *
   * ReactPlayer is mounted here.
   */
 return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (playing) {
          setShowControls(false);
        }
      }}
    >
      {/* Clickable wrapper for video play/pause */}
      <div 
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={togglePlay}
      >
        <ReactPlayer
          ref={playerRef}
         src={getPlayableSrc(src)}
          playing={playing}
          muted={muted}
          volume={volume}
          playbackRate={rate}
          controls={false}
          playsInline
          width="100%"
          height="100%"
          style={{
            objectFit: "contain",
          }}
          onPlay={() => {
            setPlaying(true);
            setIsLoading(false);
          }}
          onPause={() => {
            setPlaying(false);
          }}
          onWaiting={() => {
            setIsLoading(true);
          }}
          onPlaying={() => {
            setIsLoading(false);
          }}
          onCanPlay={() => {
            setIsLoading(false);
          }}
          onDurationChange={(e) => {
            if (e?.target) {
              setDuration(e.target.duration || 0);
            }
          }}
          onTimeUpdate={(e) => {
            if (!isSeeking && e?.target) {
              setCurrentTime(
                e.target.currentTime || 0
              );
            }
          }}
          onProgress={(e) => {
            const bufferedRanges =
              e?.target?.buffered;

            if (
              bufferedRanges &&
              bufferedRanges.length
            ) {
              setBuffered(
                bufferedRanges.end(
                  bufferedRanges.length - 1
                )
              );
            }
          }}
          onEnded={onEnded}
         onError={(error, data, hlsInstance, hlsGlobal) => {
  console.error("========== VIDEO PLAYBACK ERROR ==========");
  console.error("Source:", src);
  console.error("Error object:", error);
  console.error("Error name:", error?.name);
  console.error("Error message:", error?.message);
  console.error("Error code:", error?.code);
  console.error("Error data:", data);
  console.error("HLS instance:", hlsInstance);
  console.error("HLS global:", hlsGlobal);

  const internalPlayer = playerRef.current?.getInternalPlayer?.();

  if (internalPlayer) {
    console.error("Internal player:", internalPlayer);

    if (internalPlayer.error) {
      console.error("Native video error:", {
        code: internalPlayer.error.code,
        message: internalPlayer.error.message,
      });
    }
  }

  // Ignore normal aborts
  if (
    error?.name === "AbortError" ||
    error?.code === 20
  ) {
    return;
  }

  setIsLoading(false);
  setLoadError(true);
  setPlaying(false);
}}
        />
      </div>

      {/* Loading */}
      {isLoading && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Loader2
            className="animate-spin text-white/80"
            size={40}
          />
        </div>
      )}

      {/* Error */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
          <div className="text-center text-white">
            <p className="font-semibold">
              This video failed to load.
            </p>

            <button
              type="button"
              onClick={() => {
                setLoadError(false);
                setStarted(false);
                setPlaying(false);
                setCurrentTime(0);
                setDuration(0);
                setBuffered(0);
              }}
              className="mt-3 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-sm font-semibold cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Center play button when paused */}
      {!playing &&
        !isLoading &&
        !loadError && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/35 transition-colors cursor-pointer z-10"
          >
            <div className="h-16 w-16 rounded-full bg-orange-500/90 hover:bg-orange-500 flex items-center justify-center shadow-xl transition-transform hover:scale-110">
              <Play
                className="text-white fill-white ml-1"
                size={28}
              />
            </div>
          </button>
        )}

      {/* Controls - Stop event propagation so clicking buttons doesn't trigger video pause */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pt-10 pb-3 transition-opacity duration-300 z-20 ${
          showControls
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress */}
        <div className="relative h-1.5 mb-3 group/seek cursor-pointer">
          <div className="absolute inset-0 rounded-full bg-white/25" />

          {/* Buffered */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/40"
            style={{
              width: `${bufferedPct}%`,
            }}
          />

          {/* Played */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-orange-500"
            style={{
              width: `${progressPct}%`,
            }}
          />

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={
              isSeeking
                ? seekValue
                : currentTime
            }
            onChange={handleSeekChange}
            onMouseUp={commitSeek}
            onTouchEnd={commitSeek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />

          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-orange-500 shadow scale-0 group-hover/seek:scale-100 transition-transform pointer-events-none"
            style={{
              left: `${progressPct}%`,
            }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 text-white">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            {playing ? (
              <Pause
                size={20}
                className="fill-current"
              />
            ) : (
              <Play
                size={20}
                className="fill-current"
              />
            )}
          </button>

          {/* Back 10 seconds */}
          <button
            type="button"
            onClick={() => skip(-10)}
            title="Back 10s"
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            <RotateCcw size={17} />
          </button>

          {/* Forward 10 seconds */}
          <button
            type="button"
            onClick={() => skip(10)}
            title="Forward 10s"
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            <RotateCw size={17} />
          </button>

          {/* Volume */}
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVolumeSlider((prev) => !prev)}
              className="p-1 hover:text-orange-400 transition-colors cursor-pointer"
              title="Volume"
            >
              {muted || volume === 0 ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>

            {showVolumeSlider && (
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={changeVolume}
                  className="w-20 sm:w-24 accent-orange-500 cursor-pointer"
                />

                <span className="text-[10px] text-white/80 w-8 text-right">
                  {Math.round((muted ? 0 : volume) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Time */}
          <span className="text-xs font-mono tabular-nums text-white/90">
            {formatTime(
              isSeeking
                ? seekValue
                : currentTime
            )}{" "}
            / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Playback speed */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowSpeedMenu(
                  (current) => !current
                )
              }
              className="text-xs font-bold hover:text-orange-400 transition-colors px-1.5 cursor-pointer"
            >
              {rate}x
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-slate-900/95 rounded-lg shadow-xl border border-white/10 py-1 min-w-[70px] z-30">
                {SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => {
                      setRate(speed);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-colors cursor-pointer ${
                      speed === rate
                        ? "text-orange-400 font-bold"
                        : "text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 size={18} />
            ) : (
              <Maximize2 size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}