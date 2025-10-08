"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("school");
  const [loading, setLoading] = useState(false);

  // School Profile State
  const [schoolProfile, setSchoolProfile] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    motto: "",
    logo: ""
  });

  // Subscription State
  const [subscription, setSubscription] = useState({
    plan: "Basic",
    status: "active",
    billingCycle: "monthly",
    nextBillingDate: "",
    amount: "20000"
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    academicYear: "2024/2025",
    currentTerm: "First Term",
    attendanceTime: "08:00",
    lateThreshold: "15",
    currency: "NGN",
    timezone: "Africa/Lagos",
    dateFormat: "DD/MM/YYYY",
    enableSMS: true,
    enableEmail: true,
    enableParentPortal: false,
    enableStudentPortal: false
  });

  // User Permissions State
  const [permissions, setPermissions] = useState({
    teachersCanEditGrades: true,
    teachersCanDeleteAttendance: false,
    parentsCanViewReports: true,
    studentsCanViewGrades: false,
    autoGenerateIDs: true
  });

  // Security Settings State
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    passwordExpiry: "90",
    sessionTimeout: "30",
    allowMultipleSessions: false,
    ipWhitelist: ""
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Fetch school profile
      const schoolRes = await fetch("/api/admin/settings/school");
      if (schoolRes.ok) {
        const data = await schoolRes.json();
        setSchoolProfile(data);
      }

      // Fetch subscription
      const subRes = await fetch("/api/admin/settings/subscription");
      if (subRes.ok) {
        const data = await subRes.json();
        setSubscription(data);
      }

      // Fetch system settings
      const sysRes = await fetch("/api/admin/settings/system");
      if (sysRes.ok) {
        const data = await sysRes.json();
        setSystemSettings(data);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSchoolProfile({ ...schoolProfile, [e.target.name]: e.target.value });
  };

  const handleSystemSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setSystemSettings({ ...systemSettings, [e.target.name]: value });
  };

  const handlePermissionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPermissions({ ...permissions, [e.target.name]: e.target.checked });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setSecurity({ ...security, [e.target.name]: value });
  };

  const saveSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/school", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schoolProfile)
      });

      if (res.ok) {
        toast.success("School profile updated successfully!");
      } else {
        toast.error("Failed to update school profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const saveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(systemSettings)
      });

      if (res.ok) {
        toast.success("System settings updated successfully!");
      } else {
        toast.error("Failed to update system settings");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const savePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissions)
      });

      if (res.ok) {
        toast.success("Permissions updated successfully!");
      } else {
        toast.error("Failed to update permissions");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const saveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(security)
      });

      if (res.ok) {
        toast.success("Security settings updated successfully!");
      } else {
        toast.error("Failed to update security settings");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const upgradePlan = () => {
    toast.success("Redirecting to upgrade page...");
    // Handle upgrade logic
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Settings</h1>
          <p className="text-gray-600 mt-1">Manage your school's configuration and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {["school", "subscription", "system", "permissions", "security"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? "border-emerald-900 text-emerald-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab === "school" ? "School Profile" : tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* School Profile Tab */}
            {activeTab === "school" && (
              <form onSubmit={saveSchoolProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={schoolProfile.name}
                      onChange={handleSchoolProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={schoolProfile.email}
                      onChange={handleSchoolProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={schoolProfile.phone}
                      onChange={handleSchoolProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={schoolProfile.website}
                      onChange={handleSchoolProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={schoolProfile.address}
                      onChange={handleSchoolProfileChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Motto
                    </label>
                    <input
                      type="text"
                      name="motto"
                      value={schoolProfile.motto}
                      onChange={handleSchoolProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-900 text-white px-6 py-2 rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* Subscription Tab */}
            {activeTab === "subscription" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white p-6 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {subscription.plan} Plan
                      </h3>
                      <p className="text-emerald-100">
                        Status: <span className="font-semibold">{subscription.status.toUpperCase()}</span>
                      </p>
                      <p className="text-emerald-100 mt-1">
                        Next billing: {subscription.nextBillingDate || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">₦{parseInt(subscription.amount).toLocaleString()}</p>
                      <p className="text-emerald-100">per {subscription.billingCycle}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Basic Plan */}
                  <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-emerald-900 transition-colors">
                    <h4 className="text-xl font-bold mb-2">Basic</h4>
                    <p className="text-3xl font-bold text-emerald-900 mb-4">₦20,000<span className="text-sm text-gray-600">/month</span></p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li>✓ Admin Dashboard</li>
                      <li>✓ Teacher Dashboard</li>
                      <li>✓ Up to 100 students</li>
                      <li>✓ Basic reports</li>
                      <li>✗ Parent Portal</li>
                      <li>✗ Student Portal</li>
                    </ul>
                    {subscription.plan === "Basic" ? (
                      <button className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed">
                        Current Plan
                      </button>
                    ) : (
                      <button className="w-full bg-emerald-900 text-white px-4 py-2 rounded-lg hover:bg-emerald-800">
                        Downgrade
                      </button>
                    )}
                  </div>

                  {/* Pro Plan */}
                  <div className="border-2 border-emerald-900 rounded-lg p-6 relative">
                    <div className="absolute top-0 right-0 bg-yellow-400 text-emerald-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                      POPULAR
                    </div>
                    <h4 className="text-xl font-bold mb-2">Pro</h4>
                    <p className="text-3xl font-bold text-emerald-900 mb-4">₦50,000<span className="text-sm text-gray-600">/month</span></p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li>✓ All Basic features</li>
                      <li>✓ Parent Portal</li>
                      <li>✓ Student Portal</li>
                      <li>✓ Up to 500 students</li>
                      <li>✓ Advanced analytics</li>
                      <li>✓ SMS notifications</li>
                    </ul>
                    {subscription.plan === "Pro" ? (
                      <button className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed">
                        Current Plan
                      </button>
                    ) : (
                      <button onClick={upgradePlan} className="w-full bg-emerald-900 text-white px-4 py-2 rounded-lg hover:bg-emerald-800">
                        Upgrade Now
                      </button>
                    )}
                  </div>

                  {/* Enterprise Plan */}
                  <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-emerald-900 transition-colors">
                    <h4 className="text-xl font-bold mb-2">Enterprise</h4>
                    <p className="text-3xl font-bold text-emerald-900 mb-4">Custom</p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li>✓ All Pro features</li>
                      <li>✓ Unlimited students</li>
                      <li>✓ Custom branding</li>
                      <li>✓ API access</li>
                      <li>✓ Dedicated support</li>
                      <li>✓ Training workshops</li>
                    </ul>
                    <button className="w-full bg-emerald-900 text-white px-4 py-2 rounded-lg hover:bg-emerald-800">
                      Contact Sales
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings Tab */}
            {activeTab === "system" && (
              <form onSubmit={saveSystemSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      name="academicYear"
                      value={systemSettings.academicYear}
                      onChange={handleSystemSettingsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Term
                    </label>
                    <select
                      name="currentTerm"
                      value={systemSettings.currentTerm}
                      onChange={handleSystemSettingsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                    >
                      <option>First Term</option>
                      <option>Second Term</option>
                      <option>Third Term</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attendance Time
                    </label>
                    <input
                      type="time"
                      name="attendanceTime"
                      value={systemSettings.attendanceTime}
                      onChange={handleSystemSettingsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Late Threshold (minutes)
                    </label>
                    <input
                      type="number"
                      name="lateThreshold"
                      value={systemSettings.lateThreshold}
                      onChange={handleSystemSettingsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={systemSettings.currency}
                      onChange={handleSystemSettingsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                    >
                      <option value="NGN">NGN (₦)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={systemSettings.timezone}
                      onChange={handleSystemSettingsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                    >
                      <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New York (EST)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Feature Toggles</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="enableSMS"
                        checked={systemSettings.enableSMS}
                        onChange={handleSystemSettingsChange}
                        className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                      />
                      <span className="ml-3 text-sm text-gray-700">Enable SMS Notifications</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="enableEmail"
                        checked={systemSettings.enableEmail}
                        onChange={handleSystemSettingsChange}
                        className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                      />
                      <span className="ml-3 text-sm text-gray-700">Enable Email Notifications</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="enableParentPortal"
                        checked={systemSettings.enableParentPortal}
                        onChange={handleSystemSettingsChange}
                        disabled={subscription.plan === "Basic"}
                        className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900 disabled:opacity-50"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Enable Parent Portal {subscription.plan === "Basic" && "(Pro plan required)"}
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="enableStudentPortal"
                        checked={systemSettings.enableStudentPortal}
                        onChange={handleSystemSettingsChange}
                        disabled={subscription.plan === "Basic"}
                        className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900 disabled:opacity-50"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Enable Student Portal {subscription.plan === "Basic" && "(Pro plan required)"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-900 text-white px-6 py-2 rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* Permissions Tab */}
            {activeTab === "permissions" && (
              <form onSubmit={savePermissions} className="space-y-6">
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Teacher Permissions</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Allow teachers to edit grades after submission</span>
                        <input
                          type="checkbox"
                          name="teachersCanEditGrades"
                          checked={permissions.teachersCanEditGrades}
                          onChange={handlePermissionsChange}
                          className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Allow teachers to delete attendance records</span>
                        <input
                          type="checkbox"
                          name="teachersCanDeleteAttendance"
                          checked={permissions.teachersCanDeleteAttendance}
                          onChange={handlePermissionsChange}
                          className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Parent Permissions</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Allow parents to view detailed reports</span>
                        <input
                          type="checkbox"
                          name="parentsCanViewReports"
                          checked={permissions.parentsCanViewReports}
                          onChange={handlePermissionsChange}
                          className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Student Permissions</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Allow students to view grades immediately</span>
                        <input
                          type="checkbox"
                          name="studentsCanViewGrades"
                          checked={permissions.studentsCanViewGrades}
                          onChange={handlePermissionsChange}
                          className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">System Automation</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Auto-generate student IDs on enrollment</span>
                        <input
                          type="checkbox"
                          name="autoGenerateIDs"
                          checked={permissions.autoGenerateIDs}
                          onChange={handlePermissionsChange}
                          className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-900 text-white px-6 py-2 rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <form onSubmit={saveSecurity} className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Security settings affect all users. Changes take effect immediately.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      name="passwordExpiry"
                      value={security.passwordExpiry}
                      onChange={handleSecurityChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Users will be required to change password after this period</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      name="sessionTimeout"
                      value={security.sessionTimeout}
                      onChange={handleSecurityChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Automatic logout after inactivity</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="twoFactorAuth"
                      checked={security.twoFactorAuth}
                      onChange={handleSecurityChange}
                      className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                    />
                    <span className="ml-3 text-sm text-gray-700">Enable Two-Factor Authentication (2FA)</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allowMultipleSessions"
                      checked={security.allowMultipleSessions}
                      onChange={handleSecurityChange}
                      className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                    />
                    <span className="ml-3 text-sm text-gray-700">Allow users to login from multiple devices</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Whitelist (optional)
                  </label>
                  <textarea
                    name="ipWhitelist"
                    value={security.ipWhitelist}
                    onChange={(e) => setSecurity({ ...security, ipWhitelist: e.target.value })}
                    rows={3}
                    placeholder="Enter IP addresses (one per line)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Only these IPs will be allowed to access the system. Leave empty to allow all.</p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to reset all security settings to defaults?")) {
                        setSecurity({
                          twoFactorAuth: false,
                          passwordExpiry: "90",
                          sessionTimeout: "30",
                          allowMultipleSessions: false,
                          ipWhitelist: ""
                        });
                        toast.success("Security settings reset to defaults");
                      }
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Reset to Defaults
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-900 text-white px-6 py-2 rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="font-semibold text-gray-800">Export All Data</h3>
                <p className="text-sm text-gray-600">Download a complete backup of your school data</p>
              </div>
              <button
                onClick={() => {
                  toast.success("Preparing data export...");
                  // Handle data export
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export Data
              </button>
            </div>

            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="font-semibold text-gray-800">Reset Academic Year</h3>
                <p className="text-sm text-gray-600">Clear all attendance and grades for new academic year</p>
              </div>
              <button
                onClick={() => {
                  if (confirm("This will clear attendance and grades. Are you sure?")) {
                    toast.success("Academic year reset initiated");
                    // Handle reset
                  }
                }}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Reset Year
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-red-600">Delete School Account</h3>
                <p className="text-sm text-gray-600">Permanently delete your school and all associated data</p>
              </div>
              <button
                onClick={() => {
                  if (confirm("This action cannot be undone. Type DELETE to confirm")) {
                    const userInput = prompt("Type DELETE to confirm deletion:");
                    if (userInput === "DELETE") {
                      toast.error("Account deletion initiated. You will receive a confirmation email.");
                      // Handle deletion
                    }
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="text-emerald-900 hover:text-emerald-700 font-medium"
          >
            ← Back to Dashboard
          </button>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}