"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Camera,
} from "lucide-react";

import {
  getStudentProfile,
  updateStudentProfile,
} from "@/services/student/studentProfileApi";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    studentPhoto: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getStudentProfile();

      const data = response.data.data;

      setProfile(data);

      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        studentPhoto: null,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append(
        "full_name",
        formData.full_name
      );

      payload.append(
        "phone",
        formData.phone
      );

      if (formData.studentPhoto) {
        payload.append(
          "studentPhoto",
          formData.studentPhoto
        );
      }

      await updateStudentProfile(payload);

      fetchProfile();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        {/* Profile Card */}
       {/* Profile Card */}
<div className="relative overflow-hidden rounded-[32px] bg-white shadow-2xl border border-slate-200">

  {/* Animated Background */}
  <div className="absolute inset-0 overflow-hidden">

    {/* Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />

    {/* Floating Sphere 1 */}
    <motion.div
      animate={{
        y: [0, -25, 0],
        x: [0, 10, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 6,
      }}
      className="absolute top-10 left-8 h-20 w-20 rounded-full bg-orange-300/40 blur-xl"
    />

    {/* Floating Sphere 2 */}
    <motion.div
      animate={{
        y: [0, 30, 0],
        x: [0, -15, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 8,
      }}
      className="absolute top-24 right-10 h-28 w-28 rounded-full bg-amber-300/30 blur-xl"
    />

    {/* Floating Sphere 3 */}
    <motion.div
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 5,
      }}
      className="absolute bottom-10 right-6 h-24 w-24 rounded-full bg-orange-200/50 blur-xl"
    />

    {/* Grid Pattern */}
    <div className="absolute left-6 top-6 grid grid-cols-4 gap-2 opacity-20">
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-orange-500"
        />
      ))}
    </div>
  </div>

  {/* Cover */}
  <div className="relative h-36 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />

  <div className="relative px-8 pb-8">

    {/* Profile Image */}
    <div className="-mt-16 relative w-fit mx-auto">
      <img
        src={
          profile?.studentPhoto ||
          `https://ui-avatars.com/api/?name=${profile?.full_name}`
        }
        alt=""
        className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-2xl"
      />

      <label className="absolute bottom-2 right-2 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full cursor-pointer shadow-xl transition-all">
        <Camera size={16} />

        <input
          hidden
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFormData({
              ...formData,
              studentPhoto: e.target.files[0],
            })
          }
        />
      </label>
    </div>

    {/* User Info */}
    <div className="text-center mt-5">
      <h2 className="text-3xl font-bold text-slate-800">
        {profile?.full_name}
      </h2>

      <p className="text-slate-500 mt-1">
        {profile?.course}
      </p>

      <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Active Student
      </div>
    </div>

    {/* Info Cards */}
    <div className="mt-8 space-y-4">

      <InfoItem
        icon={<Mail size={18} />}
        label="Email"
        value={profile?.email}
      />

      <InfoItem
        icon={<Phone size={18} />}
        label="Phone"
        value={profile?.phone}
      />

      <InfoItem
        icon={<GraduationCap size={18} />}
        label="Course"
        value={profile?.course}
      />

      <InfoItem
        icon={<Building2 size={18} />}
        label="Institute"
        value={profile?.institute?.institute_name}
      />
    </div>
  </div>
</div>

        {/* Edit Form */}
      <div className="lg:col-span-2 relative overflow-hidden rounded-[32px] bg-white shadow-2xl border border-slate-200">

  {/* Background Decoration */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-orange-100 blur-3xl opacity-50" />
    <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-amber-100 blur-3xl opacity-40" />
  </div>

  <div className="relative p-8">

    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3 className="text-3xl font-bold text-slate-800">
          Edit Profile
        </h3>

        <p className="text-slate-500 mt-1">
          Update your personal information
        </p>
      </div>

      <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
        <User size={24} />
      </div>
    </div>

    <form
      onSubmit={handleUpdate}
      className="space-y-8"
    >

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Full Name
          </label>

          <input
            type="text"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({
                ...formData,
                full_name: e.target.value,
              })
            }
            className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
            placeholder="Enter Full Name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Phone Number
          </label>

          <input
            type="text"
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
            className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
            placeholder="Enter Phone Number"
          />
        </div>

      </div>

      {/* Academic Info */}
      <div>
        <h4 className="font-bold text-lg mb-4 text-slate-800">
          Academic Information
        </h4>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">

          <ReadOnlyCard
            icon="🎓"
            label="Enrollment No"
            value={profile.enrollment_no}
          />

          <ReadOnlyCard
            icon="🆔"
            label="Roll No"
            value={profile.roll_no}
          />

          <ReadOnlyCard
            icon="📚"
            label="Batch"
            value={profile.batch}
          />

          <ReadOnlyCard
            icon="🏆"
            label="Year"
            value={profile.year}
          />

        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4">

        <motion.button
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.97,
          }}
          type="submit"
          disabled={saving}
          className="w-full md:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white font-bold shadow-xl hover:shadow-orange-300 transition-all"
        >
          {saving ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating Profile...
            </div>
          ) : (
            "Save Changes"
          )}
        </motion.button>

      </div>

    </form>
  </div>
</div>
      </motion.div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

function ReadOnlyCard({
  icon,
  label,
  value,
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
      }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="text-3xl mb-3">
        {icon}
      </div>

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-800">
        {value}
      </p>
    </motion.div>
  );
}