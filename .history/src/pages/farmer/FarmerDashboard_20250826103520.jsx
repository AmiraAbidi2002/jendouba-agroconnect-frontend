// src/pages/farmer/FarmerDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiCloud,
  FiMessageSquare,
  FiEdit,
  FiSave,
  FiPhone,
  FiMail,
  FiMap,
  FiLogOut,
  FiPlus,
  FiEye,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import CropForm from "../farmer/CropForm";
import { useAuth } from "../../context/AuthContext";
import MessageList from "../../components/MessageList";
import WeatherWidget from "../../components/WeatherWidget";
import FarmMap from "../../components/FarmMap";
import { getCropsByFarmer, deleteCrop } from "../../api/cropApi";
import { getMyFarm, getAllFarms } from "../../api/farmApi";
import axios from "axios";

/**
 * 🎨 Palette centrale pour cohérence (issue de votre brief)
 */
const PALETTE = {
  primary: "#1d4c43",
  primaryDark: "#2a5c45",
  bg: "#f8fafc",
  white: "#ffffff",
  text: "#111827",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  success: "#10b981",
  info: "#3b82f6",
  infoDark: "#1e40af",
  warning: "#f59e0b",
  danger: "#ef4444",
  badgeBg: "#dcfce7",
  badgeText: "#16a34a",
  star: "#fbbf24",
  sidebarMuted: "#e2e8f0",
  accentSoft: "#a7f3d0",
};

/**
 * 🔘 Bouton unifié (variants: primary | success | info | warning | danger | ghost)
 */
const Button = ({ variant = "primary", className = "", children, ...props }) => {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: `text-white bg-[${PALETTE.primary}] hover:bg-[${PALETTE.primaryDark}] focus:ring-[${PALETTE.primary}]`,
    success: `text-white bg-[${PALETTE.success}] hover:opacity-90 focus:ring-[${PALETTE.success}]`,
    info: `text-white bg-[${PALETTE.info}] hover:opacity-90 focus:ring-[${PALETTE.info}]`,
    warning: `text-white bg-[${PALETTE.warning}] hover:opacity-90 focus:ring-[${PALETTE.warning}]`,
    danger: `text-white bg-[${PALETTE.danger}] hover:opacity-90 focus:ring-[${PALETTE.danger}]`,
    ghost:
      `text-[${PALETTE.text}] bg-white/80 hover:bg-white border border-[${PALETTE.border}] focus:ring-[${PALETTE.border}]`,
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

/**
 * 🏷️ Badges de statut (available / low / out)
 */
const StatusBadge = ({ status }) => {
  const map = {
    available: {
      bg: PALETTE.badgeBg,
      text: PALETTE.badgeText,
      icon: <FiCheckCircle className="h-4 w-4" />,
      label: "Disponible",
    },
    warning: {
      bg: "#fff7ed",
      text: PALETTE.warning,
      icon: <FiAlertTriangle className="h-4 w-4" />,
      label: "Stock faible",
    },
    out: {
      bg: "#fee2e2",
      text: PALETTE.danger,
      icon: <FiAlertTriangle className="h-4 w-4" />,
      label: "Indisponible",
    },
  };
  const s = map[status] || map.available;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.icon}
      {s.label}
    </span>
  );
};

/**
 * 📦 Carte encadrée réutilisable
 */
const Card = ({ title, icon, actions, children, className = "" }) => (
  <section
    className={`bg-white rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] border ${className}`}
    style={{ borderColor: PALETTE.border }}
  >
    <header className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: PALETTE.border }}>
      <div className="flex items-center gap-3">
        {icon && <div className={`p-2 rounded-xl bg-[${PALETTE.bg}] text-[${PALETTE.primary}]`}>{icon}</div>}
        <h2 className="text-xl font-semibold" style={{ color: PALETTE.text }}>{title}</h2>
      </div>
      {actions}
    </header>
    <div className="p-6">{children}</div>
  </section>
);

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("Profile");
  const [crops, setCrops] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [mineFarm, setMineFarm] = useState(null);
  const [showAllCrops, setShowAllCrops] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    address: "",
    location: { lat: 0, lng: 0 },
  });

  // Recover My Farm
  useEffect(() => {
    if (!user || !user.token) return;
    const fetchFarm = async () => {
      try {
        const data = await getMyFarm(user.token);
        setMineFarm(data);
      } catch (err) {
        console.error("Error getMyFarm:", err);
      }
    };
    fetchFarm();
  }, [user]);

  // Recover all farms
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await getAllFarms();
        setFarms(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFarms();
  }, []);

  // Recover crops
  const fetchCrops = async () => {
    try {
      const userId = Number(user?.id ?? user?.sub);
      if (!userId) return;
      const data = await getCropsByFarmer(userId);
      setCrops(data);
    } catch (error) {
      console.error("Error fetch crops:", error);
    }
  };

  useEffect(() => {
    if (activeSection === "Crops") fetchCrops();
  }, [activeSection]);

  // Recover all crops
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/crops")
      .then((res) => setAllCrops(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Recover buyers
  useEffect(() => {
    axios
      .get("http://localhost:8080/users?type=BUYER")
      .then((res) => setBuyers(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || user.username || "",
        email: user.email || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const farmsToShow = useMemo(() => farms, [farms]);

  if (!user || user.role !== "FARMER") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PALETTE.bg }}>
        <div className="rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] p-8 text-center border" style={{ backgroundColor: PALETTE.white, borderColor: PALETTE.border }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: PALETTE.danger }}>Accès refusé</h2>
          <p className="text-sm" style={{ color: PALETTE.text }}>Vous devez être agriculteur pour accéder à cette page.</p>
          <p className="text-xs mt-2" style={{ color: PALETTE.textMuted }}>
            Rôle détecté : {user?.role || "Non connecté"}
          </p>
          <Button variant="info" className="mt-4" onClick={() => (window.location.href = "/")}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  // Profile Handlers
  const handleProfileEdit = () => setIsEditingProfile(true);
  const handleProfileSave = () => {
    setIsEditingProfile(false);
    // TODO: appel API pour sauvegarder les données du profil
    console.log("Profile data saved:", profileData);
  };
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Crops Handlers
  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette culture ?")) {
      try {
        await deleteCrop(id);
        fetchCrops();
      } catch (error) {
        console.error("Error deletion crop:", error);
      }
    }
  };
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCrop(null);
    fetchCrops();
  };

  // UI
  const menuItems = [
    { name: "Profile", icon: <FiUser className="mr-3" /> },
    { name: "Crops", icon: <FiPackage className="mr-3" /> },
    { name: "Farm Location", icon: <FiMapPin className="mr-3" /> },
    { name: "Weather Forecast", icon: <FiCloud className="mr-3" /> },
    { name: "Messages", icon: <FiMessageSquare className="mr-3" /> },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: PALETTE.bg }}>
      {/* Sidebar */}
      <aside className="w-72 text-white p-6 flex flex-col" style={{ backgroundColor: PALETTE.primary }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <span className="rounded-lg px-2 py-1" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: PALETTE.primary }}>🌱</span>
            AgroConnect
          </h2>
          <button className="opacity-80 hover:opacity-100" title="Déconnexion"><FiLogOut /></button>
        </div>

        <div className="mb-4 px-4 py-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex flex-col">
            <span className="text-sm text-white/90 font-medium">{user?.name || user?.username || "Farmer"}</span>
            <span className="text-xs" style={{ color: PALETTE.accentSoft }}>ID #{user?.id || user?.sub || "—"}</span>
          </div>
          <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: PALETTE.badgeBg, color: PALETTE.badgeText }}>Active Member</span>
        </div>

        <nav className="flex-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`flex items-center w-full mb-2 px-4 py-3 rounded-lg transition-all`}
              onClick={() => setActiveSection(item.name)}
              style={
                activeSection === item.name
                  ? {
                      backgroundColor: PALETTE.white,
                      color: PALETTE.primary,
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                      fontWeight: 600,
                    }
                  : {
                      color: PALETTE.sidebarMuted,
                    }
              }
              onMouseEnter={(e) => {
                if (activeSection !== item.name) e.currentTarget.style.backgroundColor = PALETTE.primaryDark;
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.name) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 text-sm flex items-center justify-between" style={{ borderTop: `1px solid ${PALETTE.primaryDark}` }}>
          <span className="opacity-90">Connecté en tant que</span>
          <span className="font-semibold">Farmer</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Topbar */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: PALETTE.text }}>Tableau de bord</h1>
            <p className="text-sm mt-1" style={{ color: PALETTE.textMuted }}>Gérez vos cultures, messages, météo et localisation.</p>
          </div>

          {/* mini stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl px-4 py-3 border" style={{ background: PALETTE.white, borderColor: PALETTE.border }}>
              <p className="text-xs" style={{ color: PALETTE.textMuted }}>Cultures</p>
              <p className="text-lg font-semibold" style={{ color: PALETTE.primary }}>{crops?.length || 0}</p>
            </div>
            <div className="rounded-xl px-4 py-3 border" style={{ background: PALETTE.white, borderColor: PALETTE.border }}>
              <p className="text-xs" style={{ color: PALETTE.textMuted }}>Acheteurs</p>
              <p className="text-lg font-semibold" style={{ color: PALETTE.info }}>{buyers?.length || 0}</p>
            </div>
            <div className="rounded-xl px-4 py-3 border" style={{ background: PALETTE.white, borderColor: PALETTE.border }}>
              <p className="text-xs" style={{ color: PALETTE.textMuted }}>Fermes</p>
              <p className="text-lg font-semibold" style={{ color: PALETTE.warning }}>{farms?.length || 0}</p>
            </div>
            <div className="rounded-xl px-4 py-3 border" style={{ background: PALETTE.white, borderColor: PALETTE.border }}>
              <p className="text-xs" style={{ color: PALETTE.textMuted }}>Section</p>
              <p className="text-lg font-semibold" style={{ color: PALETTE.danger }}>{activeSection}</p>
            </div>
          </div>
        </div>

        {/* Profile */}
        {activeSection === "Profile" && (
          <Card
            title="Mon profil"
            icon={<FiUser />}
            actions={
              isEditingProfile ? (
                <Button onClick={handleProfileSave}><FiSave /> Enregistrer</Button>
              ) : (
                <Button onClick={handleProfileEdit}><FiEdit /> Modifier</Button>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Encadré Infos personnelles */}
              <div className="col-span-2 border rounded-xl p-5" style={{ borderColor: PALETTE.border }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: PALETTE.text }}>Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: PALETTE.textMuted }}>Nom complet</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg px-4 py-2 border focus:outline-none focus:ring-2"
                        style={{ borderColor: PALETTE.border }}
                      />
                    ) : (
                      <p style={{ color: PALETTE.text }}>{profileData.name || "—"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1 flex items-center gap-2" style={{ color: PALETTE.textMuted }}>
                      <FiMail /> Email
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg px-4 py-2 border focus:outline-none focus:ring-2"
                        style={{ borderColor: PALETTE.border }}
                      />
                    ) : (
                      <p style={{ color: PALETTE.text }}>{profileData.email || "—"}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1 flex items-center gap-2" style={{ color: PALETTE.textMuted }}>
                      <FiMap /> Adresse
                    </label>
                    {isEditingProfile ? (
                      <textarea
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        rows={3}
                        className="w-full rounded-lg px-4 py-2 border focus:outline-none focus:ring-2"
                        style={{ borderColor: PALETTE.border }}
                      />
                    ) : (
                      <p style={{ color: PALETTE.text }}>{profileData.address || "Non renseignée"}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Encadré Contact rapide */}
              <div className="border rounded-xl p-5 space-y-4" style={{ borderColor: PALETTE.border }}>
                <h3 className="text-lg font-semibold" style={{ color: PALETTE.text }}>Contact rapide</h3>
                <Button variant="info" className="w-full justify-center"><FiMail /> Envoyer un email</Button>
                <Button variant="success" className="w-full justify-center"><FiPhone /> Appeler</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Crops */}
        {activeSection === "Crops" && (
          <Card
            title={showAllCrops ? "Toutes les cultures" : "Mes cultures"}
            icon={<FiPackage />}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setShowAllCrops(!showAllCrops)}>
                  <FiEye /> {showAllCrops ? "Voir mes cultures" : "Voir toutes"}
                </Button>
                {!showAllCrops && (
                  <Button onClick={() => { setEditingCrop(null); setShowForm(true); }}>
                    <FiPlus /> Nouvelle culture
                  </Button>
                )}
              </div>
            }
          >
            {(showAllCrops ? allCrops : crops).length > 0 ? (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full rounded-xl overflow-hidden border" style={{ borderColor: PALETTE.border }}>
                  <thead style={{ backgroundColor: PALETTE.primary, color: PALETTE.white }}>
                    <tr>
                      <th className="py-3 px-4 text-left">Crop ID</th>
                      <th className="py-3 px-4 text-left">Nom</th>
                      <th className="py-3 px-4 text-left">Farmer ID</th>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-left">Quantité</th>
                      <th className="py-3 px-4 text-left">Prix</th>
                      <th className="py-3 px-4 text-left">Récolte</th>
                      <th className="py-3 px-4 text-left">Disponibilité</th>
                      <th className="py-3 px-4 text-left">Image</th>
                      {!showAllCrops && <th className="py-3 px-4 text-left">Actions</th>}
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: PALETTE.white, color: PALETTE.text }}>
                    {(showAllCrops ? allCrops : crops).map((crop) => {
                      const availability = String(crop.availability || "available").toLowerCase();
                      const statusKey = availability.includes("out") ? "out" : availability.includes("low") ? "warning" : "available";
                      return (
                        <tr key={crop.crop_id} className="border-t hover:bg-gray-50" style={{ borderColor: PALETTE.border }}>
                          <td className="py-3 px-4">{crop.crop_id}</td>
                          <td className="py-3 px-4 font-medium" style={{ color: PALETTE.text }}>{crop.crop_name}</td>
                          <td className="py-3 px-4">{crop.farmer_id}</td>
                          <td className="py-3 px-4">{crop.crop_type}</td>
                          <td className="py-3 px-4">{crop.quantity} kg</td>
                          <td className="py-3 px-4">{crop.price} TND/kg</td>
                          <td className="py-3 px-4">{crop.harvest_date ? new Date(crop.harvest_date).toLocaleDateString() : "—"}</td>
                          <td className="py-3 px-4"><StatusBadge status={statusKey} /></td>
                          <td className="py-3 px-4">
                            {crop.img_url ? (
                              <img src={crop.img_url} alt={crop.crop_name} className="h-10 w-10 rounded-lg object-cover border" style={{ borderColor: PALETTE.border }} />
                            ) : (
                              <span className="text-xs" style={{ color: PALETTE.textMuted }}>Aucune image</span>
                            )}
                          </td>
                          {!showAllCrops && (
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" onClick={() => handleEdit(crop)}><FiEdit /> Modifier</Button>
                                <Button variant="danger" onClick={() => handleDelete(crop.crop_id)}><FiTrash2 /> Supprimer</Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: PALETTE.textMuted }}>
                Aucune culture disponible.
              </div>
            )}

            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-full max-w-xl rounded-2xl relative border shadow-xl" style={{ backgroundColor: PALETTE.white, borderColor: PALETTE.border }}>
                  <button
                    onClick={() => { setShowForm(false); setEditingCrop(null); }}
                    className="absolute top-3 right-3 text-sm px-2 py-1 rounded-md"
                    style={{ backgroundColor: "rgba(0,0,0,0.05)", color: PALETTE.text }}
                    aria-label="Fermer le formulaire"
                  >
                    ✕
                  </button>
                  <div className="p-6">
                    <CropForm
                      editingCrop={editingCrop}
                      onSuccess={handleFormSuccess}
                      onCancel={() => { setShowForm(false); setEditingCrop(null); }}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Messages */}
        {activeSection === "Messages" && (
          <Card title="Messagerie" icon={<FiMessageSquare />}>
            <MessageList user={user} contacts={buyers} />
          </Card>
        )}

        {/* Farm Location */}
        {activeSection === "Farm Location" && (
          <Card title="Localisation des fermes" icon={<FiMapPin />}>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Encadrés résumé */}
              <div className="border rounded-xl p-4" style={{ borderColor: PALETTE.border }}>
                <p className="text-xs" style={{ color: PALETTE.textMuted }}>Ma ferme</p>
                <p className="font-semibold" style={{ color: PALETTE.primary }}>{mineFarm?.name || "—"}</p>
              </div>
              <div className="border rounded-xl p-4" style={{ borderColor: PALETTE.border }}>
                <p className="text-xs" style={{ color: PALETTE.textMuted }}>Total fermes</p>
                <p className="font-semibold" style={{ color: PALETTE.info }}>{farms?.length || 0}</p>
              </div>
              <div className="border rounded-xl p-4" style={{ borderColor: PALETTE.border }}>
                <p className="text-xs" style={{ color: PALETTE.textMuted }}>Superficie (ha)</p>
                <p className="font-semibold" style={{ color: PALETTE.warning }}>{mineFarm?.area || "—"}</p>
              </div>
            </div>
            <FarmMap farms={farmsToShow} />
          </Card>
        )}

        {/* Weather */}
        {activeSection === "Weather Forecast" && (
          <Card
            title="Météo"
            icon={<FiCloud />}
            className="overflow-hidden"
            actions={<span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.8)", color: PALETTE.infoDark }}>Mise à jour</span>}
          >
            {/*
              Conservez votre composant WeatherWidget interne.
              On peut supposer qu'il utilise déjà un style propre ;
              sinon, encapsulé dans ce Card il héritera d'un cadre cohérent.
            */}
            <div className="rounded-xl p-4" style={{
              background: `linear-gradient(135deg, ${PALETTE.info} 0%, ${PALETTE.infoDark} 100%)`,
              color: "rgba(255,255,255,0.95)",
            }}>
              <WeatherWidget />
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
