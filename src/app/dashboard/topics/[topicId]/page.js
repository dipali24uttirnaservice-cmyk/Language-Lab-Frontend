"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Layers,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

import { topicApi } from "@/services/topic/topicApi";
export default function TopicDetailsPage() {
  const { topicId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const res = await topicApi.getTopicById(topicId);

      setTopic(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
   <div className="relative z-10 space-y-8">

  {/* Header */}
  <div className="flex items-center justify-between">

    <button
      onClick={() => router.back()}
      className="
        rounded-2xl
        border
        border-white/40
        bg-white/80
        backdrop-blur-xl
        px-5
        py-3
        font-bold
        text-slate-700
        shadow-lg
        hover:scale-105
        transition-all
      "
    >
      ← Back
    </button>

  </div>

  {/* Topic Banner */}

 <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  className="
    relative
    overflow-hidden
    rounded-[36px]
    bg-gradient-to-r
    from-orange-100
    via-amber-50
    to-yellow-100
    p-10
    shadow-xl
    border
    border-orange-200/50
  "
>
  <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl" />
  <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-yellow-300/20 blur-3xl" />

  <div className="flex items-center gap-6">

    <div
      className="
        h-24
        w-24
        rounded-3xl
        bg-gradient-to-br
        from-orange-400
        to-amber-500
        text-white
        flex
        items-center
        justify-center
        shadow-lg
      "
    >
      <BookOpen size={42} />
    </div>

    <div>
      <h1 className="text-5xl font-black text-slate-800">
        {topic?.title}
      </h1>

      <p className="mt-3 text-lg text-slate-600">
        {topic?.description}
      </p>
    </div>

  </div>
</motion.div>

  {/* Statistics */}

  <div
    className="
      rounded-[32px]
      border
      border-white/40
      bg-white/80
      backdrop-blur-xl
      shadow-xl
      p-8
    "
  >
    <div className="grid gap-8 md:grid-cols-3">

      <div>
        <h3 className="text-4xl font-black text-orange-500">
          {topic?.subtopic_count || 0}
        </h3>
        <p className="text-slate-500">
          Total SubTopics
        </p>
      </div>

      <div>
        <h3 className="text-4xl font-black text-indigo-500">
          {topic?.order}
        </h3>
        <p className="text-slate-500">
          Topic Order
        </p>
      </div>

      <div>
        <h3 className="text-4xl font-black text-emerald-500">
          Active
        </h3>
        <p className="text-slate-500">
          Status
        </p>
      </div>

    </div>
  </div>

  {/* SubTopics */}

  <div>

    <h2 className="mb-6 text-3xl font-black text-slate-900">
      Learning SubTopics
    </h2>

    <div className="space-y-6">

      {topic?.subtopics?.map((subtopic, index) => {

        const colors = [
          "from-emerald-500 to-teal-500",
          "from-orange-500 to-amber-500",
          "from-blue-500 to-indigo-500",
          "from-pink-500 to-rose-500",
          "from-cyan-500 to-sky-500",
          "from-violet-500 to-purple-500",
        ];

        const color =
          colors[index % colors.length];

        return (
          <motion.div
            key={subtopic._id}
            whileHover={{
              y: -5,
              scale: 1.01,
            }}
            onClick={() =>
              router.push(
                `/dashboard/subtopic/${subtopic._id}`
              )
            }
            className="
              cursor-pointer
              rounded-[32px]
              border
              border-white/50
              bg-white/80
              backdrop-blur-xl
              shadow-lg
              p-6
            "
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              {/* Left */}

              <div className="flex items-center gap-5">

                <div
                  className={`
                    h-20
                    w-20
                    rounded-3xl
                    bg-gradient-to-r
                    ${color}
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                  `}
                >
                  <Layers size={34} />
                </div>

                <div>

                  <h2 className="text-2xl font-black text-slate-900">
                    {subtopic.title}
                  </h2>

                  <p className="mt-1 text-orange-500 font-semibold">
                    Order #{subtopic.order}
                  </p>

                  <p className="mt-2 text-slate-500">
                    {subtopic.description}
                  </p>

                </div>

              </div>

              {/* Right */}

              <div className="w-full max-w-sm">

                <button
                  className="
                    w-full
                    rounded-2xl
                    bg-slate-900
                    py-3
                    font-bold
                    text-white
                    transition-all
                    hover:bg-orange-500
                  "
                >
                  Open SubTopic →
                </button>

              </div>

            </div>
          </motion.div>
        );
      })}

    </div>

  </div>

</div>
  );
}