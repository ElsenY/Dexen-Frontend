import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Mail,
  Pencil,
  Save,
  Phone,
  Hash,
  KeyRound,
  Users,
  ArrowLeft,
  Bell,
  X,
  Info,
  UserPlus,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

interface UserData {
  id: string;
  email: string;
  image: string;
  phone_number: string;
}

interface UpdateNotification {
  userId: string;
  oldData: any;
  newData: any;
}

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const regFileInputRef = useRef<HTMLInputElement>(null);

  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [activeNotification, setActiveNotification] =
    useState<UpdateNotification | null>(null);

  const [editForm, setEditForm] = useState({
    phone_number: "",
    image: "",
    current_password: "",
    new_password: "",
  });

  const [regForm, setRegForm] = useState({
    email: "",
    password: "",
    phone_number: "",
    image: "",
  });
  const [regFile, setRegFile] = useState<File | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Error fetching users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const socket = io(API_URL);
    socket.on("userUpdated", (data: UpdateNotification) => {
      setActiveNotification(data);
      fetchUsers();
    });
    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setEditForm({
      phone_number: user.phone_number || "",
      image: user.image || "",
      current_password: "",
      new_password: "",
    });
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    setIsRegistering(false);
    setSelectedUser(null);
    setErrorMsg("");
    setRegFile(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "edit" | "reg",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (target === "reg") setRegFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const rawBase64 = base64.split(",")[1] || base64;
        if (target === "edit") setEditForm({ ...editForm, image: rawBase64 });
        else setRegForm({ ...regForm, image: rawBase64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      const payload: any = {};
      if (editForm.phone_number !== selectedUser.phone_number)
        payload.phone_number = editForm.phone_number;
      if (editForm.image !== selectedUser.image) payload.image = editForm.image;
      if (editForm.new_password) {
        payload.new_password = editForm.new_password;
        payload.current_password = editForm.current_password;
      }

      if (Object.keys(payload).length === 0) {
        setIsEditing(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/users/${selectedUser.id}/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error("Failed to update user");
      fetchUsers();
      setIsEditing(false);
      setSelectedUser(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("email", regForm.email);
      formData.append("password", regForm.password);
      if (regForm.phone_number)
        formData.append("phone_number", regForm.phone_number);
      if (regFile) formData.append("image", regFile);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Attempt to read { message } from the response body.
        let message = "Registration failed";
        try {
          const data = await response.json();
          if (data && data.message) message = data.message;
        } catch (e) {
          // If parsing JSON fails, use default message.
        }
        throw new Error(message);
      }

      await fetchUsers();
      setIsRegistering(false);
      setRegForm({ email: "", password: "", phone_number: "", image: "" });
      setRegFile(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center p-6 pt-16 relative overflow-x-hidden">
      {/* Background shapes */}
      <div className="absolute top-[5%] left-[5%] w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[5%] w-[450px] h-[450px] bg-[#3b82f6]/5 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-5xl flex flex-col gap-8 relative z-10">
        <div className="glass rounded-[32px] overflow-hidden animate-fade-up">
          <div className="bg-gradient-to-r from-[#6366f1]/20 to-[#3b82f6]/20 p-8 flex items-center gap-6 border-b border-white/5">
            <div className="w-16 h-16 bg-[#0f172a] rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
              <Users size={32} className="text-[#6366f1]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Access Control
              </h1>
              <p className="text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-none">
                Global User Management & Monitoring
              </p>
            </div>
          </div>

          {isEditing || isRegistering ? (
            <div className="p-8 md:p-12 animate-fade-up">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-10 group"
              >
                <ArrowLeft
                  size={18}
                  className="transition-transform group-hover:-translate-x-1"
                />
                <span className="font-semibold uppercase tracking-widest text-xs">
                  Return to User Pool
                </span>
              </button>

              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="relative group mx-auto md:mx-0">
                  <div className="w-40 h-40 rounded-[40px] overflow-hidden border-4 border-[#0f172a] shadow-2xl bg-slate-800">
                    <img
                      src={
                        isEditing
                          ? editForm.image
                            ? `data:image/png;base64,${editForm.image}`
                            : ""
                          : regForm.image
                            ? `data:image/png;base64,${regForm.image}`
                            : ""
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      isEditing
                        ? fileInputRef.current?.click()
                        : regFileInputRef.current?.click()
                    }
                    className="absolute bottom-2 right-2 p-3 bg-[#6366f1] text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                  >
                    <Camera size={18} />
                  </button>
                  <input
                    type="file"
                    ref={isEditing ? fileInputRef : regFileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(e, isEditing ? "edit" : "reg")
                    }
                  />
                </div>

                <div className="flex-1 w-full space-y-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {isEditing ? "Modify Personnel" : "Enroll New Personnel"}
                    </h2>
                    <p className="text-slate-500">
                      {isEditing
                        ? selectedUser?.email
                        : "Initialize a new secure profile"}
                    </p>
                  </div>

                  <form
                    onSubmit={isEditing ? handleSaveEdit : handleRegister}
                    className="space-y-8"
                  >
                    {errorMsg && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                        {errorMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {!isEditing && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                            Email
                          </label>
                          <div className="relative">
                            <Mail
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                              size={18}
                            />
                            <input
                              name="email"
                              type="email"
                              required
                              placeholder="user@corp.com"
                              value={regForm.email}
                              onChange={handleRegChange}
                              className="glass-input pl-11"
                            />
                          </div>
                        </div>
                      )}

                      {isEditing && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                            Unique ID
                          </label>
                          <div className="relative">
                            <Hash
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                              size={18}
                            />
                            <input
                              value={selectedUser?.id}
                              readOnly
                              className="glass-input pl-11 !text-slate-500 cursor-not-allowed border-none shadow-none"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                          {isEditing
                            ? "New Password (Optional)"
                            : "Security Password"}
                        </label>
                        <div className="relative">
                          <KeyRound
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                            size={18}
                          />
                          <input
                            name={isEditing ? "new_password" : "password"}
                            type="password"
                            required={!isEditing}
                            placeholder="••••••••"
                            value={
                              isEditing
                                ? editForm.new_password
                                : regForm.password
                            }
                            onChange={
                              isEditing ? handleEditChange : handleRegChange
                            }
                            className="glass-input pl-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                          Mobile Contact
                        </label>
                        <div className="relative">
                          <Phone
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                            size={18}
                          />
                          <input
                            name="phone_number"
                            type="tel"
                            placeholder="+100 000 000"
                            value={
                              isEditing
                                ? editForm.phone_number
                                : regForm.phone_number
                            }
                            onChange={
                              isEditing ? handleEditChange : handleRegChange
                            }
                            className="glass-input pl-11"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex gap-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 bg-white/5 text-slate-300 py-4 rounded-2xl font-bold tracking-wide hover:bg-white/10 transition-all border border-white/10"
                      >
                        Cancel Operation
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-[#6366f1] text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-[#4f46e5] shadow-lg shadow-[#6366f1]/20 transition-all flex items-center justify-center gap-2"
                      >
                        {isEditing ? (
                          <Save size={18} />
                        ) : (
                          <UserPlus size={18} />
                        )}
                        {isEditing ? "Commit Changes" : "Execute Enrollment"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white">
                    Personnel Database
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Managing {users.length} active records
                  </p>
                </div>
                <button
                  onClick={() => setIsRegistering(true)}
                  className="bg-[#6366f1] text-white px-6 py-3 rounded-2xl font-bold tracking-wide hover:bg-[#4f46e5] shadow-lg shadow-[#6366f1]/20 transition-all flex items-center gap-2"
                >
                  <UserPlus size={20} />
                  <span>New Entry</span>
                </button>
              </div>

              {isLoading ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-[#6366f1]/30 border-t-[#6366f1] rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                    Querying User Data
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-white/5 bg-black/20">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <th className="px-8 py-5">Personnel</th>
                        <th className="px-8 py-5">System Identity</th>
                        <th className="px-8 py-5">Contact</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/5">
                                <img
                                  src={
                                    user.image
                                      ? `data:image/png;base64,${user.image}`
                                      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=40&h=40"
                                  }
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-white font-semibold">
                                {user.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-slate-500 font-mono text-xs bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                              {user.id}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-slate-400 font-medium">
                            {user.phone_number || (
                              <span className="text-slate-700 italic">
                                None Registered
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="bg-white/5 text-[#6366f1] px-4 py-2 rounded-xl font-bold text-sm border border-white/10 hover:bg-[#6366f1] hover:text-white transition-all shadow-md"
                            >
                              Configure
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      {activeNotification && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="glass max-w-lg w-full rounded-[32px] p-8 md:p-10 animate-fade-up relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={() => setActiveNotification(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Live Update Detected
                </h3>
                <p className="text-slate-400">
                  Synchronized activity from external source detected
                </p>
              </div>

              <div className="w-full bg-[#0f172a] rounded-24 border border-white/10 p-6 text-left space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#6366f1]/10 rounded-xl flex items-center justify-center border border-[#6366f1]/20">
                    <Info size={18} className="text-[#6366f1]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Modified Identity
                    </p>
                    <p className="text-white font-mono text-sm">
                      {activeNotification.userId}
                    </p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm italic py-2 border-t border-white/5">
                  System records have been automatically refreshed to maintain
                  data integrity.
                </p>
              </div>

              <button
                onClick={() => setActiveNotification(null)}
                className="w-full btn-primary !py-3.5"
              >
                Acknowledge & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
