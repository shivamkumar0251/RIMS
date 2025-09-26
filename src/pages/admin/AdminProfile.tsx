import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: "Admin" | "Manager" | "Staff" | "Viewer";
  address: string;
  pinCode: string;
  companyName: string;
  franchiseId: string;
  gst: string;
  password: string;
  avatarUrl: string | null;
  businessLogoUrl: string | null;
}

interface EditingState {
  [key: string]: boolean;
}

interface FormErrors {
  [key: string]: string | null;
}

export default function ProfilePage() {
  useEffect(() => {
    document.title = "Admin Profile | Inventory Management System"
    window.scrollTo(0, 0);
  }, []);
  const [editing, setEditing] = useState<EditingState>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState<"avatar" | "logo" | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "Sahil Kumar",
    email: "sam@gmail.com",
    phone: "9888825444",
    role: "Admin",
    address: "V.P.O Dari Distt. Kangra, Himachal Pradesh",
    pinCode: "176057",
    companyName: "Glandhand Pvt Ltd",
    franchiseId: "FR-10234",
    gst: "27ABCDE1234F2Z5",
    password: "••••••••",
    avatarUrl: null,
    businessLogoUrl: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const validateField = (field: keyof ProfileData, value: string): string | null => {
    switch (field) {
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "Invalid email address";
      case "phone":
        return /^\+?\d{10,15}$/.test(value) ? null : "Invalid phone number (10-15 digits)";
      case "pinCode":
        return /^\d{6}$/.test(value) ? null : "Pin Code must be 6 digits";
      case "fullName":
        return value.length >= 2 ? null : "Name must be at least 2 characters";
      case "companyName":
        return value.length >= 3 ? null : "Company name must be at least 3 characters";
      case "gst":
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)
          ? null
          : "Invalid GST number";
      default:
        return null;
    }
  };

  const toggleEdit = (field: keyof ProfileData | "password") => {
    setEditing(prev => ({ ...prev, [field]: !prev[field] }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: keyof ProfileData) => {
    const value = e.target.value;
    setProfile(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, avatar: "Please upload a valid image file" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: "Image size should be less than 5MB" }));
      return;
    }

    setIsUploading("avatar");
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
        setIsUploading(null);
        setErrors(prev => ({ ...prev, avatar: null }));
      };
      reader.readAsDataURL(file);
    } catch {
      setErrors(prev => ({ ...prev, avatar: "Error uploading image" }));
      setIsUploading(null);
    }
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, logo: "Please upload a valid image file" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: "Image size should be less than 5MB" }));
      return;
    }

    setIsUploading("logo");
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile(prev => ({ ...prev, businessLogoUrl: reader.result as string }));
        setIsUploading(null);
        setErrors(prev => ({ ...prev, logo: null }));
      };
      reader.readAsDataURL(file);
    } catch {
      setErrors(prev => ({ ...prev, logo: "Error uploading image" }));
      setIsUploading(null);
    }
  };

  const saveField = (field: keyof ProfileData) => {
    const error = validateField(field, profile[field] ?? "");
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      return;
    }
    setEditing(prev => ({ ...prev, [field]: false }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const cancelEdit = (field: keyof ProfileData | "password") => {
    setEditing(prev => ({ ...prev, [field]: false }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  return (
    <AdminLayout>
      <div
        className="min-h-screen bg-cover bg-center bg-fixed py-8 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://res.cloudinary.com/dmoqhod45/image/upload/v1758696881/360_F_1539521722_9hmEFT2i0LZ2pft2HbjCIXcFmqfYdkwd_xehuwf.jpg')`
        }}
      >
        <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-xl">
          {/* Top area */}
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="flex-1 flex items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center ring-4 ring-indigo-200 transition-all duration-300">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-gray-500">
                      {profile.fullName[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2.5 cursor-pointer hover:bg-indigo-700 transition-all duration-200">
                  <input
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading === "avatar"}
                    aria-label="Upload avatar"
                  />
                  {isUploading === "avatar" ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6" />
                    </svg>
                  )}
                </label>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profile.fullName}</h2>
                  <button
                    onClick={() => toggleEdit("fullName")}
                    className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
                    aria-label="Edit name"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2 font-medium">{profile.role} • {profile.email}</p>
                {errors.avatar && <p className="text-sm text-red-500 mt-2 font-medium">{errors.avatar}</p>}
              </div>
            </div>

            {/* Franchise ID and Logo */}
            <div className="w-full lg:w-80 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-5 flex flex-row items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
              {/* Franchise ID */}
              <div className="text-center">
                <div className="text-xs text-gray-500 font-medium">Franchise ID</div>
                <div className="font-semibold text-lg text-gray-900">{profile.franchiseId}</div>
              </div>

              {/* Business Logo */}
              <div className="text-center">
                <div className="text-xs text-gray-500 font-medium">Business Logo</div>
                <div
                  className="mt-2 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden ring-2 ring-gray-200 transition-all duration-300 hover:ring-indigo-300 cursor-pointer"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {profile.businessLogoUrl ? (
                    <img
                      src={profile.businessLogoUrl}
                      alt="Business Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Logo</span>
                  )}
                  <input
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading === "logo"}
                  />
                </div>
              </div>
            </div>

          </div>

          <hr className="my-8 border-gray-300" />

          {/* Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderEditableField({
              label: "Full Name",
              field: "fullName",
              value: profile.fullName,
              isEditing: editing.fullName,
              error: errors.fullName,
              handleChange,
              saveField,
              cancelEdit,
              toggleEdit,
              type: "input",
            })}
            {renderReadOnlyField({
              label: "Email",
              field: "email",
              value: profile.email,
            })}
            {renderReadOnlyField({
              label: "Phone",
              field: "phone",
              value: profile.phone,
            })}
            {renderReadOnlyField({
              label: "Role",
              field: "role",
              value: profile.role,
            })}
            {renderEditableField({
              label: "Address",
              field: "address",
              value: profile.address,
              isEditing: editing.address,
              error: errors.address,
              handleChange,
              saveField,
              cancelEdit,
              toggleEdit,
              type: "textarea",
            })}
            {renderEditableField({
              label: "Pin Code",
              field: "pinCode",
              value: profile.pinCode,
              isEditing: editing.pinCode,
              error: errors.pinCode,
              handleChange,
              saveField,
              cancelEdit,
              toggleEdit,
              type: "input",
            })}
            {renderReadOnlyField({
              label: "Company / Store Name",
              field: "companyName",
              value: profile.companyName,
            })}
            {renderReadOnlyField({
              label: "GST / Tax ID",
              field: "gst",
              value: profile.gst,
            })}
          </div>

          {/* Password box */}
          <div className="mt-8 border border-gray-200 rounded-xl p-6 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs text-gray-500 font-medium">Password</div>
                <div className="mt-1 text-gray-900 font-semibold">{profile.password}</div>
                {editing.password && (
                  <PasswordEditor
                    onCancel={() => cancelEdit("password")}
                    onSave={(oldPwd, newPwd, confirmPwd) => {
                      if (!oldPwd || !newPwd || !confirmPwd) {
                        setErrors(prev => ({ ...prev, password: "All password fields are required" }));
                        return;
                      }
                      if (newPwd.length < 8) {
                        setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters" }));
                        return;
                      }
                      if (newPwd !== confirmPwd) {
                        setErrors(prev => ({ ...prev, password: "Passwords do not match" }));
                        return;
                      }
                      setProfile(prev => ({ ...prev, password: "••••••••" }));
                      setEditing(prev => ({ ...prev, password: false }));
                      setErrors(prev => ({ ...prev, password: null }));
                      alert("Password changed successfully");
                    }}
                  />
                )}
                {errors.password && <p className="text-sm text-red-500 mt-2 font-medium">{errors.password}</p>}
              </div>
              <div>
                {!editing.password && (
                  <button
                    onClick={() => toggleEdit("password")}
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                    aria-label="Edit password"
                  >
                    Change Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

interface EditableFieldProps {
  label: string;
  field: keyof ProfileData;
  value: string;
  isEditing: boolean | undefined;
  error: string | null | undefined;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: keyof ProfileData) => void;
  saveField: (field: keyof ProfileData) => void;
  cancelEdit: (field: keyof ProfileData) => void;
  toggleEdit: (field: keyof ProfileData) => void;
  type?: "input" | "textarea" | "select";
  options?: string[];
}

function renderEditableField({
  label,
  field,
  value,
  isEditing,
  error,
  handleChange,
  saveField,
  cancelEdit,
  toggleEdit,
  type = "input",
  options,
}: EditableFieldProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium">{label}</label>
          {!isEditing ? (
            <div className="mt-1 text-gray-900 font-semibold">{value}</div>
          ) : type === "textarea" ? (
            <textarea
              value={value}
              onChange={(e) => handleChange(e, field)}
              className={`mt-2 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${error ? "border-red-500" : "border-gray-300"}`}
              rows={4}
              aria-invalid={!!error}
              aria-describedby={`${field}-error`}
            />
          ) : type === "select" ? (
            <select
              value={value}
              onChange={(e) => handleChange(e, field)}
              className={`mt-2 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${error ? "border-red-500" : "border-gray-300"}`}
              aria-invalid={!!error}
              aria-describedby={`${field}-error`}
            >
              {options?.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={value}
              onChange={(e) => handleChange(e, field)}
              className={`mt-2 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${error ? "border-red-500" : "border-gray-300"}`}
              aria-invalid={!!error}
              aria-describedby={`${field}-error`}
            />
          )}
          {error && (
            <p id={`${field}-error`} className="text-sm text-red-500 mt-1 font-medium">
              {error}
            </p>
          )}
        </div>
        <div className="ml-4">
          {!isEditing ? (
            <button
              onClick={() => toggleEdit(field)}
              className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
              aria-label={`Edit ${label}`}
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => saveField(field)}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                disabled={!!error}
                aria-label={`Save ${label}`}
              >
                Save
              </button>
              <button
                onClick={() => cancelEdit(field)}
                className="px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                aria-label={`Cancel ${label} edit`}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReadOnlyFieldProps {
  label: string;
  field: keyof ProfileData;
  value: string;
}

function renderReadOnlyField({
  label,
  value,
}: ReadOnlyFieldProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium">{label}</label>
          <div className="mt-1 text-gray-900 font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}

interface PasswordEditorProps {
  onCancel: () => void;
  onSave: (oldPwd: string, newPwd: string, confirmPwd: string) => void;
}

function PasswordEditor({ onCancel, onSave }: PasswordEditorProps) {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  return (
    <div className="mt-6 border-t pt-6 space-y-4">
      <div>
        <label htmlFor="old-password" className="text-xs text-gray-500 font-medium">
          Old Password
        </label>
        <input
          id="old-password"
          value={oldPwd}
          onChange={(e) => setOldPwd(e.target.value)}
          type="password"
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          aria-label="Old password"
        />
      </div>
      <div>
        <label htmlFor="new-password" className="text-xs text-gray-500 font-medium">
          New Password
        </label>
        <input
          id="new-password"
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
          type="password"
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          aria-label="New password"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="text-xs text-gray-500 font-medium">
          Confirm New Password
        </label>
        <input
          id="confirm-password"
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
          type="password"
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          aria-label="Confirm new password"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onSave(oldPwd, newPwd, confirmPwd)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
          aria-label="Save new password"
        >
          Save Password
        </button>
        <button
          onClick={onCancel}
          className="px-4 bg-indigo-600 py-2 border border-gray-300 rounded-lg hover:bg-indigo-700 transition-all duration-200"
          aria-label="Cancel password change"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}