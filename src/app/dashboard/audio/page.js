"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { FaPlay, FaPause, FaHeadphones, FaMicrophone, FaVolumeUp, FaWaveSquare, FaStop } from "react-icons/fa";

const lessons = [
  { id: 1, title: "Daily Conversation Basics", duration: "04:35", audio: "/audio/lesson1.mp3" },
  { id: 2, title: "English Pronunciation Training", duration: "06:10", audio: "/audio/lesson2.mp3" },
  { id: 3, title: "Interview English Practice", duration: "05:45", audio: "/audio/lesson3.mp3" },
  { id: 4, title: "Business English Communication", duration: "07:20", audio: "/audio/lesson4.mp3" },
  { id: 5, title: "Advanced Vocabulary Building", duration: "08:15", audio: "/audio/lesson5.mp3" },
  { id: 6, title: "Daily Conversation Basics", duration: "04:35", audio: "/audio/lesson1.mp3" },
  { id: 2, title: "English Pronunciation Training", duration: "06:10", audio: "/audio/lesson2.mp3" },
  { id: 3, title: "Interview English Practice", duration: "05:45", audio: "/audio/lesson3.mp3" },
  { id: 4, title: "Business English Communication", duration: "07:20", audio: "/audio/lesson4.mp3" },
  { id: 5, title: "Advanced Vocabulary Building", duration: "08:15", audio: "/audio/lesson5.mp3" },
  { id: 6, title: "Daily Conversation Basics", duration: "04:35", audio: "/audio/lesson1.mp3" },
];

export default function AudioPractice() {
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(lessons[0]);
  const [audioURL, setAudioURL] = useState(null);

  // STABLE WAVEFORM: Prevents hydration errors and layout shifts
  const waveformHeights = useMemo(() => {
    return [...Array(40)].map(() => Math.random() * 80 + 20);
  }, [currentLesson]);

  // Handle Recording Logic
  const toggleRecording = async () => {
    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
      };
      mediaRecorder.start();
      setRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      audioRef.current.load();
    }
  }, [currentLesson]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play().catch(console.error);
    setPlaying(!playing);
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <audio ref={audioRef} src={currentLesson.audio} onEnded={() => setPlaying(false)} />

      <div className="mb-10 border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Audio Command Center</h1>
      </div>

      {/* 1. items-start keeps the Player pinned to the top */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* 2. Fixed height + overflow-y-auto prevents expansion */}
        <div className="lg:col-span-4 h-[500px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setCurrentLesson(lesson)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                currentLesson.id === lesson.id 
                  ? "border-slate-900 bg-slate-900 text-white" 
                  : "border-slate-200 bg-white hover:border-orange-200"
              }`}
            >
              <span className="font-bold text-sm truncate">{lesson.title}</span>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${currentLesson.id === lesson.id ? "bg-white/10" : "bg-slate-100"}`}>
                {lesson.duration}
              </span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <FaWaveSquare size={200} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-14 w-14 rounded-2xl bg-orange-500 flex items-center justify-center">
                <FaHeadphones size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black">{currentLesson.title}</h2>
              </div>
            </div>

            {/* 3. Uses the stable waveformHeights array */}
            <div className="h-32 flex items-center gap-1 mb-8 opacity-60">
              {waveformHeights.map((height, i) => (
                <div key={i} className="flex-1 rounded-full bg-gradient-to-t from-orange-500 to-amber-300" style={{ height: `${height}%` }} />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button className="text-slate-400 hover:text-white"><FaVolumeUp size={20} /></button>
              <button onClick={toggleAudio} className="h-20 w-20 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition-transform shadow-xl">
                {playing ? <FaPause size={24} /> : <FaPlay size={24} />}
              </button>
              <button onClick={toggleRecording} className={`px-6 py-4 rounded-xl font-black text-sm ${recording ? "bg-red-600" : "bg-orange-600"}`}>
                {recording ? "STOP" : "RECORD"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}