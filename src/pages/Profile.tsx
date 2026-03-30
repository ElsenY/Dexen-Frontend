import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Mail,
  Pencil,
  Save,
  LogOut,
  Phone,
  Hash,
  KeyRound,
  Calendar,
  Clock,
  Filter,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Attendance {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  created_at: string;
  updated_at: string;
}

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    id: "",
    email: "",
    image: "",
    phone_number: "",
  });

  const [attendances, setAttendances] = useState<Attendance[]>([]);

  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [editForm, setEditForm] = useState({
    ...profile,
    current_password: "",
    new_password: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "--:--";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return "--:--";
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load profile");
      const profileData = await response.json();

      const mergedProfile = { ...profile, ...profileData };
      setProfile(mergedProfile);
      setEditForm({ ...mergedProfile, current_password: "", new_password: "" });
    } catch (err: any) {
      setErrorMsg(err.message || "Error fetching profile");
    }
  };

  const fetchAttendances = async () => {
    setIsAttendanceLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      let url = `${API_URL}/attendances`;
      const params = new URLSearchParams();
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendances(data);
      }
    } catch (err) {
      console.error("Error fetching attendances:", err);
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchProfile();
      await fetchAttendances();
      setIsLoading(false);
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (!isLoading) {
      fetchAttendances();
    }
  }, [fromDate, toDate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("auth_token");

      const payload: any = {};
      if (editForm.phone_number !== profile.phone_number) {
        payload.phone_number = editForm.phone_number;
      }
      if (editForm.image !== profile.image) {
        payload.image = editForm.image;
      }
      if (editForm.new_password) {
        payload.new_password = editForm.new_password;
        payload.current_password = editForm.current_password;
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.detail || errData.message || "Failed to update profile",
        );
      }

      const data = await response.json();
      const updatedProfile = { ...profile, ...data };
      setProfile(updatedProfile);
      setEditForm({
        ...updatedProfile,
        current_password: "",
        new_password: "",
      });
      setIsEditing(false);
    } catch (error: any) {
      setErrorMsg(error.message || "An error occurred during save.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const rawBase64 = base64.split(",")[1] || base64;
        setEditForm({ ...editForm, image: rawBase64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({ ...profile, current_password: "", new_password: "" });
    setErrorMsg("");
  };

  const handleAttendanceAction = async (
    endpoint: "/attendances/check-in" | "/attendances/check-out",
  ) => {
    setIsActionLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.detail || errData.message || "Attendance action failed",
        );
      }

      await fetchAttendances();
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to update attendance");
    } finally {
      setIsActionLoading(false);
    }
  };

  const displayImage = isEditing ? editForm.image : profile.image;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center p-6 pt-16 relative overflow-x-hidden">
      {/* Background shapes */}
      <div className="absolute top-[5%] right-[5%] w-[400px] h-[400px] bg-[#6366f1]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] bg-[#3b82f6]/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-2xl flex flex-col gap-8 relative z-10">
        {/* Profile Card */}
        <div className="glass rounded-[32px] overflow-hidden animate-fade-up">
          <div className="h-32 bg-gradient-to-r from-[#6366f1]/20 to-[#3b82f6]/20 border-b border-white/5 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#0f172a] shadow-2xl bg-slate-800">
                  <img
                    src={
                      displayImage
                        ? `data:image/png;base64,${displayImage}`
                        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150"
                    }
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-2 bg-[#6366f1] text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                  >
                    <Camera size={16} />
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-4 right-8 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
              >
                <Pencil size={18} />
                <span className="font-medium">Edit Profile</span>
              </button>
            )}
          </div>

          <div className="pt-20 px-8 pb-8 md:px-12 md:pb-12">
            {!isEditing ? (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Internal Dashboard
                </h1>
                <p className="text-slate-400 font-medium">
                  {profile.email || "Initializing account..."}
                </p>
              </div>
            ) : (
              <div className="mb-8 bg-[#6366f1]/10 border border-[#6366f1]/20 p-4 rounded-xl">
                <p className="text-[#6366f1] font-semibold text-center flex items-center justify-center gap-2">
                  <Filter size={18} /> Editing Personal Information
                </p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
              {errorMsg && isEditing && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                    System ID
                  </label>
                  <div className="relative group">
                    <Hash
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                      size={18}
                    />
                    <input
                      value={profile.id}
                      readOnly
                      className="glass-input pl-11 !text-slate-500 cursor-not-allowed border-none shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                    Corporate Email
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                      size={18}
                    />
                    <input
                      value={profile.email}
                      readOnly
                      className="glass-input pl-11 !text-slate-500 cursor-not-allowed border-none shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6366f1] transition-colors"
                      size={18}
                    />
                    <input
                      name="phone_number"
                      type="tel"
                      value={
                        isEditing ? editForm.phone_number : profile.phone_number
                      }
                      onChange={handleChange}
                      readOnly={!isEditing}
                      placeholder="+1 (555) 000-0000"
                      className={`glass-input pl-11 ${!isEditing ? "!text-slate-400 border-none" : ""}`}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6">
                    Security Update
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 ml-1 uppercase">
                        Current Password
                      </label>
                      <div className="relative group">
                        <KeyRound
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6366f1]"
                          size={18}
                        />
                        <input
                          name="current_password"
                          type="password"
                          value={editForm.current_password}
                          onChange={handleChange}
                          placeholder="Confirm current"
                          className="glass-input pl-11"
                          required={!!editForm.new_password}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 ml-1 uppercase">
                        New Password
                      </label>
                      <div className="relative group">
                        <KeyRound
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6366f1]"
                          size={18}
                        />
                        <input
                          name="new_password"
                          type="password"
                          value={editForm.new_password}
                          onChange={handleChange}
                          placeholder="Set new"
                          className="glass-input pl-11"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/5 flex gap-4">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-white/5 text-slate-300 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all border border-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#6366f1] text-white py-3.5 rounded-xl font-semibold hover:bg-[#4f46e5] shadow-lg shadow-[#6366f1]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 text-red-400 py-3.5 rounded-xl font-semibold hover:bg-red-500/20 transition-all border border-red-500/20 flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} /> Sign Out Account
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Attendance Card */}
        {!isEditing && (
          <div className="glass rounded-[32px] p-8 md:p-10 animate-fade-up animation-delay-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#6366f1]/10 rounded-2xl flex items-center justify-center border border-[#6366f1]/20">
                  <Calendar size={28} className="text-[#6366f1]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Activity Logs
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Review your shift performance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-[18px] border border-white/10">
                <div className="flex items-center bg-[#0f172a] rounded-xl px-3 py-2 border border-white/5">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-transparent text-white text-xs outline-none uppercase tracking-tighter"
                  />
                </div>
                <ArrowRight size={14} className="text-slate-600" />
                <div className="flex items-center bg-[#0f172a] rounded-xl px-3 py-2 border border-white/5">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-transparent text-white text-xs outline-none uppercase tracking-tighter"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAttendanceAction("/attendances/check-in")}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check In
              </button>
              <button
                type="button"
                onClick={() => handleAttendanceAction("/attendances/check-out")}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Out
              </button>
            </div>

            {errorMsg && !isEditing && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                {errorMsg}
              </div>
            )}

            {isAttendanceLoading ? (
              <div className="text-center py-20 flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium tracking-wide">
                  Retrieving shift data...
                </p>
              </div>
            ) : attendances.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-[24px] border border-dashed border-white/10">
                <p className="text-slate-500">
                  No shift records detected for this period.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {attendances.map((att) => (
                  <div
                    key={att.id}
                    className="group flex items-center justify-between bg-white/5 border border-white/5 rounded-[24px] p-5 hover:bg-white/[0.08] hover:border-[#6366f1]/30 transition-all duration-300"
                  >
                    <div className="space-y-1">
                      <p className="text-white font-bold text-lg">{att.date}</p>
                      <div className="flex items-center gap-6 text-slate-400 text-sm italic">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span>
                            In:{" "}
                            <span className="text-emerald-400/90 font-mono not-italic">
                              {formatTime(att.check_in)}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                          <span>
                            Out:{" "}
                            <span className="text-rose-400/90 font-mono not-italic">
                              {formatTime(att.check_out)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] uppercase font-bold text-[#6366f1] tracking-widest bg-[#6366f1]/10 px-3 py-1.5 rounded-lg border border-[#6366f1]/20">
                        Record ID: {att.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
