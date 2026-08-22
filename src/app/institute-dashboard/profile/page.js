"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaCalendarAlt,
  FaIdBadge,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import { profileApi } from "@/services/institute/profileApi";
import StatusModal from "@/components/molecules/StatusModal";
import { useInstituteLogoSrc } from "@/utils/media";

export default function InstituteProfilePage() {
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    institute_name: "",
    phone: "",
    website: "",
    address: {
  line1: "",
  line2: "",
  taluka: "",
  dist: "",
  state: "",
  pincode: "",
  autorizedName: "",
  autorizedPhono: "",
  nearbyLandmarks: "",
},
  });

  const [statusData, setStatusData] = useState({
  open: false,
  type: "success",
  title: "",
  message: "",
});

  // Called unconditionally (before the loading/!institute early returns
  // below) since it's a hook — falls back to the bundled placeholder until
  // `institute` loads, same as before.
  const { src: instituteLogoSrc, onError: handleLogoError } = useInstituteLogoSrc(institute);

const formatAddress = (address) => {
  if (!address) return "-";

  return [
    address.line1,
    address.line2,
    address.taluka,
    address.dist,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");
};

useEffect(() => {
  const fetchInstituteProfile = async () => {
    try {
   const response =
  await profileApi.getProfile();

      if (response.data.success) {
        const data = response.data.data;

        setInstitute(data);

        setFormData({
          institute_name: data.institute_name || "",
          address: data.address || "",
          phone: data.phone || "",
          website: data.website || "",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchInstituteProfile();
}, []);



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSave = async () => {
  try {
    const response =
      await profileApi.updateProfile({
        institute_name: formData.institute_name,
        address: formData.address,
        phone: formData.phone,
        website: formData.website,
      });

    if (response.data.success) {
      setInstitute((prev) => ({
        ...prev,
        ...formData,
      }));

      setIsEditing(false);

      setStatusData({
        open: true,
        type: "success",
        title: "Profile Updated",
        message:
          "Institute profile updated successfully.",
      });
    }
  } catch (error) {
    console.error(error);

    setStatusData({
      open: true,
      type: "error",
      title: "Update Failed",
      message:
        error?.response?.data?.message ||
        "Failed to update profile.",
    });
  }
};

  const handleCancel = () => {
    setFormData({
      institute_name: institute?.institute_name || "",
  phone: institute?.phone || "",
      website: institute?.website || "",
      address: institute?.address || {
  line1: "",
  line2: "",
  taluka: "",
  dist: "",
  state: "",
  pincode: "",
  autorizedName: "",
  autorizedPhono: "",
  nearbyLandmarks: "",
},
    });

    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="text-lg font-semibold text-slate-600">
          Loading Profile...
        </div>
      </div>
    );
  }

  if (!institute) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="text-lg font-semibold text-red-500">
          Failed to load profile
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 p-6 md:p-8 overflow-hidden font-sans">
      {/* Ambient background, matching dashboard */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-[15%] h-[450px] w-[450px] rounded-full bg-gradient-to-br from-indigo-400/10 via-purple-300/10 to-transparent blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-10 left-[10%] h-[350px] w-[350px] rounded-full bg-gradient-to-br from-amber-400/10 via-orange-200/5 to-transparent blur-[80px]"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400 shadow-sm">
          ✦ Institute Profile
        </span>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="relative h-36 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 40, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-16 right-10 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, -30, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl"
            />
          </div>

          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex flex-col md:flex-row gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/25 blur-xl rounded-3xl" />
                <div className="relative w-32 h-32 rounded-3xl border-4 border-white bg-white shadow-xl overflow-hidden">
                  <Image
                    src={instituteLogoSrc}
                    alt="Logo"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                    unoptimized
                    onError={handleLogoError}
                  />
                </div>
              </div>

              <div className="mt-16 md:mt-20 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  {isEditing ? (
                    <input
                      type="text"
                      name="institute_name"
                      value={formData.institute_name}
                      onChange={handleChange}
                      className="border border-slate-300 rounded-xl px-4 py-2 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      {institute.institute_name}
                    </h2>
                  )}

                  {!isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="p-3 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors shadow-sm"
                    >
                      <FaEdit />
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        className="p-3 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors shadow-sm"
                      >
                        <FaSave />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancel}
                        className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-sm"
                      >
                        <FaTimes />
                      </motion.button>
                    </>
                  )}
                </div>

                <span className="inline-flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg text-xs mt-3 uppercase tracking-widest border border-indigo-100">
                  <FaIdBadge />
                  CODE: {institute.institute_code}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-6">
            <ProfileItem
              icon={FaEnvelope}
              label="Email Address"
              value={institute.email}
              color="from-blue-500 to-indigo-600"
            />

            {isEditing ? (
              <EditableItem
                icon={FaPhone}
                label="Contact Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                color="from-emerald-400 to-emerald-600"
              />
            ) : (
              <ProfileItem
                icon={FaPhone}
                label="Contact Number"
                value={institute.phone}
                color="from-emerald-400 to-emerald-600"
              />
            )}

            {isEditing ? (
              <EditableItem
                icon={FaGlobe}
                label="Website URL"
                name="website"
                value={formData.website}
                onChange={handleChange}
                color="from-purple-500 to-fuchsia-600"
              />
            ) : (
              <ProfileItem
                icon={FaGlobe}
                label="Website URL"
                value={institute.website}
                color="from-purple-500 to-fuchsia-600"
              />
            )}

            {isEditing ? (
             <div className="md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
    Address
  </p>

  <div className="grid md:grid-cols-2 gap-4">

    <input
      type="text"
      placeholder="Address Line 1"
      value={formData.address.line1 || ""}
      onChange={(e) =>
        setFormData({
          ...formData,
          address: {
            ...formData.address,
            line1: e.target.value,
          },
        })
      }
      className="border rounded-xl p-3"
    />

    <input
      type="text"
      placeholder="Address Line 2"
      value={formData.address.line2 || ""}
      onChange={(e) =>
        setFormData({
          ...formData,
          address: {
            ...formData.address,
            line2: e.target.value,
          },
        })
      }
      className="border rounded-xl p-3"
    />

    <input
      type="text"
      placeholder="District"
      value={formData.address.dist || ""}
      onChange={(e) =>
        setFormData({
          ...formData,
          address: {
            ...formData.address,
            dist: e.target.value,
          },
        })
      }
      className="border rounded-xl p-3"
    />

    <input
      type="text"
      placeholder="State"
      value={formData.address.state || ""}
      onChange={(e) =>
        setFormData({
          ...formData,
          address: {
            ...formData.address,
            state: e.target.value,
          },
        })
      }
      className="border rounded-xl p-3"
    />

    <input
      type="text"
      placeholder="Taluka"
      value={formData.address.taluka || ""}
      onChange={(e) =>
        setFormData({
          ...formData,
          address: {
            ...formData.address,
            taluka: e.target.value,
          },
        })
      }
      className="border rounded-xl p-3"
    />

    <input
      type="text"
      placeholder="Pincode"
      value={formData.address.pincode || ""}
      onChange={(e) =>
        setFormData({
          ...formData,
          address: {
            ...formData.address,
            pincode: e.target.value,
          },
        })
      }
      className="border rounded-xl p-3"
    />

  </div>
</div>
            ) : (
             <ProfileItem
  icon={FaMapMarkerAlt}
  label="Location"
  value={formatAddress(institute.address)}
  color="from-rose-500 to-pink-600"
/>
            )}

            <ProfileItem
              icon={FaCheckCircle}
              label="Account Status"
              value={institute.is_active ? "Active" : "Inactive"}
              color={
                institute.is_active
                  ? "from-emerald-400 to-emerald-600"
                  : "from-red-500 to-rose-600"
              }
              textColor={
                institute.is_active
                  ? "text-emerald-600"
                  : "text-red-600"
              }
            />

            <ProfileItem
              icon={FaCalendarAlt}
              label="Registered On"
              value={new Date(institute.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}
              color="from-amber-400 to-orange-500"
            />
          </div>
        </div>
        </motion.div>
      </div>

      <StatusModal
  open={statusData.open}
  type={statusData.type}
  title={statusData.title}
  message={statusData.message}
  onClose={() =>
    setStatusData((prev) => ({
      ...prev,
      open: false,
    }))
  }
/>
    </div>
  );
}

function EditableItem({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  color = "from-indigo-500 to-blue-600",
}) {
  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 transition-colors focus-within:border-indigo-200 focus-within:bg-white">
      <div className={`p-3 rounded-xl text-white bg-gradient-to-br ${color} shadow-sm shrink-0`}>
        <Icon size={16} />
      </div>

      <div className="flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </p>

        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full mt-2 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  value,
  color = "from-indigo-500 to-blue-600",
  textColor = "text-slate-900",
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all duration-300"
    >
      <div className={`p-3 rounded-xl text-white bg-gradient-to-br ${color} shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </p>

        <p className={`font-black mt-1 break-words ${textColor}`}>
          {value || "-"}
        </p>
      </div>
    </motion.div>
  );
}