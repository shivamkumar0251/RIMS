import React, { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import UserLayout from "../layouts/UserLayout";

type ProfileData = {
  franchiseId: string;
  franchiseName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  pinCode: string;
  gstNumber?: string;
  logoUrl?: string | null;
};

const initialData = (): ProfileData => ({
  franchiseId: "FR-" + Date.now().toString(36).toUpperCase().slice(-8),
  franchiseName: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  pinCode: "",
  gstNumber: "",
  logoUrl: null,
});

export default function UserProfile() {
  const [data, setData] = useState<ProfileData>(initialData);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Validation rules for profile and password
  function validate(values: ProfileData, password: { oldPassword: string; newPassword: string; confirmPassword: string }) {
    const e: Record<string, string> = {};
    if (!values.franchiseName.trim()) e.franchiseName = "Franchise name is required";
    if (!values.ownerName.trim()) e.ownerName = "Owner/Manager name is required";
    if (!/^[\w-.+]+@[\w-]+\.[A-Za-z]{2,}$/.test(values.email)) e.email = "Enter a valid email";
    if (!/^[0-9]{10}$/.test(values.phone)) e.phone = "Phone must be 10 digits";
    if (values.pinCode && !/^[0-9]{6}$/.test(values.pinCode)) e.pinCode = "Pin code must be 6 digits";
    if (values.gstNumber && !/^[0-9A-Z]{15}$/.test(values.gstNumber)) e.gstNumber = "GST should be 15 chars (if provided)";
    if (password.oldPassword && password.oldPassword.length < 8) e.oldPassword = "Old password must be at least 8 characters";
    if (password.newPassword && password.newPassword.length < 8) e.newPassword = "New password must be at least 8 characters";
    if (password.newPassword && password.newPassword !== password.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  }

  function handleChange<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key as string]: "" }));
    setSuccessMsg(null);
  }

  function handlePasswordChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMsg(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate(data, passwordData);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    setSuccessMsg(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSuccessMsg("Profile and password saved successfully.");
      setIsEditing(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setSuccessMsg("Failed to save. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    setIsEditing(true);
    setSuccessMsg(null);
  }

  function handleResetPassword() {
    setPasswordData((prev) => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
    setErrors((prev) => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
    setSuccessMsg(null);
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleChange("logoUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <UserLayout>
      <div
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="min-h-screen bg-gradient-to-br from-gray-900/70 to-gray-800/70">
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                    U
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
                </div>
                <div className="flex items-center gap-4">
                  {data.logoUrl ? (
                    <img
                      src={data.logoUrl}
                      alt="profile"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                      Profile
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Change Photo
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 font-medium">Franchise ID: {data.franchiseId}</div>
                </div>

                {/* Franchise Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Franchise Name</label>
                  <input
                    value={data.franchiseName}
                    onChange={(e) => handleChange("franchiseName", e.target.value)}
                    className={`mt-1 block w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.franchiseName ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                    placeholder="Enter franchise name"
                    disabled={!isEditing}
                  />
                  {errors.franchiseName && <div className="text-red-500 text-xs mt-1">{errors.franchiseName}</div>}
                </div>

                {/* Owner/Manager Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Owner/Manager Name</label>
                  <input
                    value={data.ownerName}
                    onChange={(e) => handleChange("ownerName", e.target.value)}
                    className={`mt-1 block w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.ownerName ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                    placeholder="Enter owner/manager name"
                    disabled={!isEditing}
                  />
                  {errors.ownerName && <div className="text-red-500 text-xs mt-1">{errors.ownerName}</div>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    value={data.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`mt-1 block w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.email ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                    placeholder="Enter email"
                    disabled={!isEditing}
                  />
                  {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    value={data.phone}
                    onChange={(e) => handleChange("phone", e.target.value.replace(/[^0-9]/g, ""))}
                    maxLength={10}
                    className={`mt-1 block w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.phone ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                    placeholder="Enter 10-digit phone number"
                    disabled={!isEditing}
                  />
                  {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address (Branch Location)</label>
                  <textarea
                    value={data.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="mt-1 block w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 hover:border-gray-400"
                    placeholder="Enter branch address"
                    disabled={!isEditing}
                  />
                </div>

                {/* Pin Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pin Code</label>
                  <input
                    value={data.pinCode}
                    onChange={(e) => handleChange("pinCode", e.target.value.replace(/[^0-9]/g, ""))}
                    maxLength={6}
                    className={`mt-1 block w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.pinCode ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                    placeholder="Enter 6-digit pin code"
                    disabled={!isEditing}
                  />
                  {errors.pinCode && <div className="text-red-500 text-xs mt-1">{errors.pinCode}</div>}
                </div>

                {/* GST / Tax Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">GST / Tax Number (optional)</label>
                  <input
                    value={data.gstNumber || ""}
                    onChange={(e) => handleChange("gstNumber", e.target.value.toUpperCase())}
                    className={`mt-1 block w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.gstNumber ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                    placeholder="Enter GST number (15 chars)"
                    disabled={!isEditing}
                  />
                  {errors.gstNumber && <div className="text-red-500 text-xs mt-1">{errors.gstNumber}</div>}
                </div>

                {/* Edit Button */}
                <div className="mt-6 flex justify-end gap-4">
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* Old Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Old Password</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className={`mt-1 flex-1 rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.oldPassword ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                        }`}
                      placeholder="Enter old password"
                      disabled={!isEditing}
                    />
                  </div>
                  {errors.oldPassword && <div className="text-red-500 text-xs mt-1">{errors.oldPassword}</div>}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`mt-1 block w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.newPassword ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                    placeholder="Enter new password"
                    disabled={!isEditing}
                  />
                  {errors.newPassword && <div className="text-red-500 text-xs mt-1">{errors.newPassword}</div>}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`mt-1 block w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.confirmPassword ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                    placeholder="Confirm new password"
                    disabled={!isEditing}
                  />
                  {errors.confirmPassword && <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>}
                </div>

                {/* Reset Password Button */}
                <div className="mt-4 flex justify-end gap-4">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reset Password
                    </button>
                  )}
                </div>

                {/* Save and Cancel Buttons */}
                {isEditing && (
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? "Saving..." : "Change"}
                    </button>
                  </div>
                )}

                {/* Success message */}
                {successMsg && (
                  <div className="mt-4 text-sm text-green-600 bg-green-50 p-2 rounded-md">{successMsg}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}