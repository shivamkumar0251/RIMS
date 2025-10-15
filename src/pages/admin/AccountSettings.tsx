import { useState } from "react";
import {
  FiUser,
  FiUsers,
  FiShield,
  FiEye,
  FiEyeOff,
  FiEdit2,
} from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import TeamManagement from "../../components/adminComponents/TeamManagement";
// import TeamManagement from "../../components/adminComponents/TeamManagement";
// import { useProfileContext } from "../../../components/layouts/ProfileContext";

interface AccountSettingProps {
  profileData?: { full_name: string; email: string } | null;
}

const AccountSetting: React.FC<AccountSettingProps> = () => {
  // const { profileData: contextProfile } = useProfileContext();
  // const effectiveProfile =  null;
  const [activeTab, setActiveTab] = useState("Account Setting");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getInitials = (name = "") => {
    const names = name.split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  };


  const handlePasswordSave = () => {
    if (!currentPassword) {
      alert("Please enter your current password to set a new one.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("New password should be at least 6 characters long.");
      return;
    }

    alert("Password saved successfully!");
    setIsEditingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleCancel = () => {
    setIsEditingPassword(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Account Setting":
        return (
          <div className="bg-white rounded-xl p-6 md:p-8 mx-auto shadow-lg">
            <div>
              <h1 className="text-2xl pb-[32px] font-bold text-gray-900">
                Account Setting
              </h1>
            </div>
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-4 ring-blue-500/30">
                {getInitials("Admin")}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={"Admin"}
                  readOnly
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100 border-transparent cursor-not-allowed focus:ring-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={""}
                  readOnly
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100 border-transparent cursor-not-allowed focus:ring-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Current Password
                </label>
                <div className="mt-1 flex justify-between items-center space-x-4">
                  <input
                    type="password"
                    value="********"
                    disabled
                    className="w-full p-3 border rounded-lg bg-gray-100 border-transparent cursor-not-allowed focus:ring-0"
                  />
                  {!isEditingPassword && (
                    <button
                      onClick={() => setIsEditingPassword(true)}
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-blue-600 hover:underline whitespace-nowrap"
                    >
                      <FiEdit2 className="mr-2" /> Edit
                    </button>
                  )}
                </div>
              </div>
              {isEditingPassword && (
                <div className="space-y-6 pt-4 animate-fade-in-down">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      New Password
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 border rounded-lg bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password"
                    />
                    <button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-500"
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 border rounded-lg bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                    />
                    <button
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-500"
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={handleCancel}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordSave}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Save Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "Team Members":
        return <TeamManagement />;

      case "Security":
        return (
          <div className="bg-white rounded-xl p-6 text-gray-900 shadow-lg">
            Security Settings - Yahan security ka content aayega.
          </div>
        );
      default:
        return <div>Select a setting</div>;
    }
  };

  const sidebarItems = [
    { name: "Account Setting", icon: <FiUser /> },
    { name: "Team Members", icon: <FiUsers /> },
    { name: "Security", icon: <FiShield /> },
  ];

  return (
    <AdminLayout>
      <div className="flex min-h-[94vh] bg-white">
        <aside className="w-64 bg-white p-4 hidden md:block shadow-lg">
          <nav className="mt-8">
            <ul>
              {sidebarItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center p-3 my-1 rounded-lg text-left text-md transition-colors duration-200 
                  ${activeTab === item.name
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-6 md:p-8">{renderContent()}</main>
      </div>
    </AdminLayout>
  );
};

export default AccountSetting;
