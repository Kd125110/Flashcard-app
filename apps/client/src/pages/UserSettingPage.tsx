import React from "react";
import Navbar from "../components/Navbar";
import UserSettingsView from "../components/UserSettingsView";
import { useUserSettings } from "../hooks/useUserSettings";

const UserSettingPage: React.FC = () => {
  const userSettingsProps = useUserSettings();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <UserSettingsView {...userSettingsProps} />
    </div>
  );
};

export default UserSettingPage;