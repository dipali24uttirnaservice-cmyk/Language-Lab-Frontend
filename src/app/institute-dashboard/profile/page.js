"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

export default function InstituteProfilePage() {
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    institute_name: "",
    address: "",
    phone: "",
    website: "",
  });

  const [statusData, setStatusData] = useState({
  open: false,
  type: "success",
  title: "",
  message: "",
});

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
      address: institute?.address || "",
      phone: institute?.phone || "",
      website: institute?.website || "",
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-800 to-indigo-900" />

        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex flex-col md:flex-row gap-6">
            <div className="w-32 h-32 rounded-3xl border-4 border-white bg-white shadow-xl overflow-hidden">
              <Image
                src={institute?.logo || "/collage-logo.png"}
                alt="Logo"
                width={128}
                height={128}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>

            <div className="mt-16 md:mt-20 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                {isEditing ? (
                  <input
                    type="text"
                    name="institute_name"
                    value={formData.institute_name}
                    onChange={handleChange}
                    className="border rounded-xl px-4 py-2 text-xl font-bold"
                  />
                ) : (
                  <h2 className="text-3xl font-black text-slate-900">
                    {institute.institute_name}
                  </h2>
                )}

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-3 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                  >
                    <FaEdit />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="p-3 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                    >
                      <FaSave />
                    </button>

                    <button
                      onClick={handleCancel}
                      className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <FaTimes />
                    </button>
                  </>
                )}
              </div>

              <span className="inline-flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg text-xs mt-2 uppercase tracking-widest">
                <FaIdBadge />
                CODE: {institute.institute_code}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <ProfileItem
              icon={FaEnvelope}
              label="Email Address"
              value={institute.email}
            />

            {isEditing ? (
              <EditableItem
                icon={FaPhone}
                label="Contact Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            ) : (
              <ProfileItem
                icon={FaPhone}
                label="Contact Number"
                value={institute.phone}
              />
            )}

            {isEditing ? (
              <EditableItem
                icon={FaGlobe}
                label="Website URL"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            ) : (
              <ProfileItem
                icon={FaGlobe}
                label="Website URL"
                value={institute.website}
              />
            )}

            {isEditing ? (
              <EditableItem
                icon={FaMapMarkerAlt}
                label="Location"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            ) : (
              <ProfileItem
                icon={FaMapMarkerAlt}
                label="Location"
                value={institute.address}
              />
            )}

            <ProfileItem
              icon={FaCheckCircle}
              label="Account Status"
              value={institute.is_active ? "Active" : "Inactive"}
              color={
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
            />
          </div>
        </div>
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
}) {
  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
      <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-400">
        <Icon size={18} />
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
          className="w-full mt-2 border border-slate-300 rounded-xl px-3 py-2"
        />
      </div>

      
    </div>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  value,
  color = "text-slate-900",
}) {
  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
      <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-400">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </p>

        <p className={`font-black mt-1 break-words ${color}`}>
          {value || "-"}
        </p>
      </div>

      
    </div>
  );
}