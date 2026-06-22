"use client";

import {
  ShieldCheck,
  Users,
  Calendar,
  CheckCircle,
} from "lucide-react";

export default function LicensePage() {
  // Replace with API data
  const license = {
    license_id: "LIC-2026-ABC123",
    plan_name: "Premium institute Plan",
    max_students: 500,
    used_students: 312,
    expiry_date: "31 Dec 2026",
    is_active: true,
  };

  const remainingSeats =
    license.max_students - license.used_students;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          License Management
        </h1>

        <p className="text-slate-500">
          View your institute license details
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid lg:grid-cols-4 gap-5">
        <Card
          icon={<ShieldCheck size={24} />}
          title="License ID"
          value={license.license_id}
        />

        <Card
          icon={<Users size={24} />}
          title="Max Seats"
          value={license.max_students}
        />

        <Card
          icon={<Users size={24} />}
          title="Used Seats"
          value={license.used_students}
        />

        <Card
          icon={<Users size={24} />}
          title="Remaining"
          value={remainingSeats}
        />
      </div>

      {/* License Information */}
      <div className="bg-white rounded-3xl shadow-sm border p-8">
        <h2 className="text-xl font-semibold mb-6">
          License Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <InfoItem
            label="License ID"
            value={license.license_id}
          />

          <InfoItem
            label="Plan"
            value={license.plan_name}
          />

          <InfoItem
            label="Maximum Students"
            value={license.max_students}
          />

          <InfoItem
            label="Used Students"
            value={license.used_students}
          />

          <InfoItem
            label="Remaining Seats"
            value={remainingSeats}
          />

          <InfoItem
            label="Expiry Date"
            value={license.expiry_date}
          />
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-3xl shadow-sm border p-8">
        <div className="flex items-center gap-4">
          <CheckCircle
            size={40}
            className="text-green-500"
          />

          <div>
            <h3 className="font-semibold text-lg">
              License Status
            </h3>

            <p
              className={`font-medium ${
                license.is_active
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {license.is_active
                ? "Active"
                : "Inactive"}
            </p>
          </div>
        </div>
      </div>

      {/* Seat Usage */}
      <div className="bg-white rounded-3xl shadow-sm border p-8">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">
            Student Seat Usage
          </h3>

          <span>
            {license.used_students}/
            {license.max_students}
          </span>
        </div>

        <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full"
            style={{
              width: `${
                (license.used_students /
                  license.max_students) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Expiry Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex gap-3">
          <Calendar className="text-yellow-600" />

          <div>
            <h3 className="font-semibold">
              License Expiry
            </h3>

            <p className="text-slate-600">
              Your license expires on{" "}
              {license.expiry_date}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="text-indigo-600 mb-4">
        {icon}
      </div>

      <p className="text-slate-500 text-sm">
        {title}
      </p>

      <h2 className="text-2xl font-bold mt-2">
        {value}
      </h2>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}