import React, { useState, useEffect } from 'react';
import {
  X, LayoutDashboard, Calendar, Clock, Scissors, Users,
  Settings, Image, Tag, MessageSquare, MessageCircle, AlertCircle, CheckCircle2,
  XCircle, Clock4, Plus, Edit2, Trash2, Phone, Mail,
  ExternalLink, Save, RefreshCw, Loader2, LogOut, Check, ChevronRight
} from 'lucide-react';

export default function AdminDashboardModal({ isOpen, onClose, token, user, onLogout, onSettingsUpdated }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Tab Data States
  const [appointments, setAppointments] = useState([]);
  const [apptFilterStatus, setApptFilterStatus] = useState('ALL');
  const [apptSearch, setApptSearch] = useState('');

  const [workingHours, setWorkingHours] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [newBlocked, setNewBlocked] = useState({ date: '', startTime: '13:00', endTime: '14:00', reason: 'Break / Personal' });

  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [offers, setOffers] = useState([]);
  const [settings, setSettings] = useState(null);

  // Modals inside Admin
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [editingService, setEditingService] = useState(null);
  const [newServiceModal, setNewServiceModal] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    name: '', category: 'Haircuts & Styling', price: '$100.00', duration: '45 min',
    durationMinutes: 45, description: '', image: '/assets/real/service_precision_bob.jpeg', popular: false
  });

  const [newOfferModal, setNewOfferModal] = useState(false);
  const [newOfferForm, setNewOfferForm] = useState({ title: '', description: '', price: '', expiryDate: '' });

  const [newGalleryModal, setNewGalleryModal] = useState(false);
  const [newGalleryForm, setNewGalleryForm] = useState({
    title: '', category: 'Hair Color', serviceName: '', image: '/assets/real/service_blonde_balayage.jpeg', description: ''
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Fetch Dashboard Stats
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/dashboard', { headers: authHeaders });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
      } else {
        setError(data.error || 'Failed to load dashboard.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Appointments
  const loadAppointments = async () => {
    try {
      const url = `/api/admin/appointments?status=${apptFilterStatus}&search=${encodeURIComponent(apptSearch)}`;
      const res = await fetch(url, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setAppointments(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Working Hours & Blocked Times
  const loadScheduleData = async () => {
    try {
      const [hRes, bRes] = await Promise.all([
        fetch('/api/admin/working-hours', { headers: authHeaders }),
        fetch('/api/admin/blocked-times', { headers: authHeaders })
      ]);
      const hData = await hRes.json();
      const bData = await bRes.json();
      if (hData.success) setWorkingHours(hData.data);
      if (bData.success) setBlockedTimes(bData.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Services & Stylists
  const loadServicesAndStylists = async () => {
    try {
      const [sRes, stRes] = await Promise.all([
        fetch('/api/admin/services', { headers: authHeaders }),
        fetch('/api/admin/stylists', { headers: authHeaders })
      ]);
      const sData = await sRes.json();
      const stData = await stRes.json();
      if (sData.success) setServices(sData.data);
      if (stData.success) setStylists(stData.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Customers
  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers', { headers: authHeaders });
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Inquiries
  const loadInquiries = async () => {
    try {
      const res = await fetch('/api/admin/inquiries', { headers: authHeaders });
      const data = await res.json();
      if (data.success) setInquiries(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Gallery & Offers
  const loadGalleryAndOffers = async () => {
    try {
      const [gRes, oRes] = await Promise.all([
        fetch('/api/admin/gallery', { headers: authHeaders }),
        fetch('/api/admin/offers', { headers: authHeaders })
      ]);
      const gData = await gRes.json();
      const oData = await oRes.json();
      if (gData.success) setGallery(gData.data);
      if (oData.success) setOffers(oData.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Settings
  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { headers: authHeaders });
      const data = await res.json();
      if (data.success) setSettings(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDashboard();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'appointments') loadAppointments();
      if (activeTab === 'schedule') loadScheduleData();
      if (activeTab === 'services') loadServicesAndStylists();
      if (activeTab === 'stylists') loadServicesAndStylists();
      if (activeTab === 'customers') loadCustomers();
      if (activeTab === 'inquiries') loadInquiries();
      if (activeTab === 'gallery') loadGalleryAndOffers();
      if (activeTab === 'settings') loadSettings();
    }
  }, [isOpen, activeTab, apptFilterStatus, apptSearch]);

  if (!isOpen) return null;

  const showNotification = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Quick Appointment Status Update
  const updateAppointmentStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Appointment ${id} status changed to ${status}.`);
        loadDashboard();
        loadAppointments();
      } else {
        setError(data.error || 'Failed to update appointment status.');
      }
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  // Reschedule Action
  const handleRescheduleSubmit = async () => {
    if (!rescheduleAppt || !rescheduleForm.date || !rescheduleForm.time) return;
    try {
      const res = await fetch(`/api/admin/appointments/${rescheduleAppt.id}/reschedule`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          newDate: rescheduleForm.date,
          newStartTime: rescheduleForm.time
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Appointment ${rescheduleAppt.id} successfully rescheduled.`);
        setRescheduleAppt(null);
        loadDashboard();
        loadAppointments();
      } else {
        setError(data.error || 'Could not reschedule appointment.');
      }
    } catch (err) {
      setError('Reschedule failed.');
    }
  };

  // Add Blocked Time
  const handleAddBlockedTime = async (e) => {
    e?.preventDefault();
    if (!newBlocked.date || !newBlocked.startTime || !newBlocked.endTime || !newBlocked.reason) return;
    try {
      const res = await fetch('/api/admin/blocked-times', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newBlocked)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Time block added.');
        setNewBlocked({ date: '', startTime: '13:00', endTime: '14:00', reason: 'Break / Personal' });
        loadScheduleData();
      }
    } catch (err) {
      setError('Failed to add blocked time.');
    }
  };

  // Delete Blocked Time
  const handleDeleteBlockedTime = async (id) => {
    try {
      const res = await fetch(`/api/admin/blocked-times/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Blocked time removed.');
        loadScheduleData();
      }
    } catch (err) {
      setError('Failed to delete.');
    }
  };

  // Save Working Hours
  const handleSaveWorkingHours = async () => {
    try {
      const res = await fetch('/api/admin/working-hours', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ hours: workingHours })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Weekly salon schedule saved.');
      }
    } catch (err) {
      setError('Failed to save hours.');
    }
  };

  // Toggle Service
  const handleToggleService = async (id, field) => {
    try {
      await fetch(`/api/admin/services/${id}/toggle`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ field })
      });
      loadServicesAndStylists();
    } catch (err) {
      console.error(err);
    }
  };

  // Create Service
  const handleCreateService = async (e) => {
    e?.preventDefault();
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newServiceForm)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('New service added.');
        setNewServiceModal(false);
        loadServicesAndStylists();
      }
    } catch (err) {
      setError('Failed to create service.');
    }
  };

  // Update Settings
  const handleSaveSettings = async (e) => {
    e?.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Salon settings updated.');
        if (onSettingsUpdated) onSettingsUpdated();
      }
    } catch (err) {
      setError('Failed to update settings.');
    }
  };

  // Format status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">CONFIRMED</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">PENDING</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-200 text-neutral-700">CANCELLED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">REJECTED</span>;
      case 'NO_SHOW':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800">NO SHOW</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-neutral-100">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl h-[94vh] bg-[#FAF8F5] text-[#191614] rounded-2xl shadow-2xl border border-[#9B7855]/30 overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#191614] text-[#FAF8F5] flex items-center justify-between border-b border-[#9B7855]/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#9B7855]/50 bg-white">
              <img src="/assets/real/mj_logo_square.jpeg" alt="MJ Hair Salon" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-medium text-[#FAF8F5]">MJ Hair Salon Management</h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#9B7855]/30 text-[#C9A96E] uppercase tracking-wider">
                  Owner Portal
                </span>
              </div>
              <p className="text-xs text-[#FAF8F5]/60">
                Welcome back, {user?.name || 'Malvin Soto'} • Central Time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDashboard}
              className="p-2 rounded-xl text-[#FAF8F5]/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl border border-red-400/40 text-red-300 hover:bg-red-900/30 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#FAF8F5]/70 hover:text-white hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip (Scrollable on Mobile) */}
        <div className="px-6 bg-white border-b border-[#9B7855]/20 flex items-center gap-1 overflow-x-auto flex-shrink-0 text-xs font-medium scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`py-3.5 px-3 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-[#9B7855] text-[#9B7855] font-semibold'
                : 'border-transparent text-[#191614]/70 hover:text-[#191614]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`py-3.5 px-3 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'appointments'
                ? 'border-[#9B7855] text-[#9B7855] font-semibold'
                : 'border-transparent text-[#191614]/70 hover:text-[#191614]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments</span>
            {dashboardData?.stats?.pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {dashboardData.stats.pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`py-3.5 px-3 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'schedule'
                ? 'border-[#9B7855] text-[#9B7855] font-semibold'
                : 'border-transparent text-[#191614]/70 hover:text-[#191614]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Hours & Blocked Time</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`py-3.5 px-3 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'services'
                ? 'border-[#9B7855] text-[#9B7855] font-semibold'
                : 'border-transparent text-[#191614]/70 hover:text-[#191614]'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Services Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`py-3.5 px-3 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'customers'
                ? 'border-[#9B7855] text-[#9B7855] font-semibold'
                : 'border-transparent text-[#191614]/70 hover:text-[#191614]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Client Profiles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`py-3.5 px-3 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'inquiries'
                ? 'border-[#9B7855] text-[#9B7855] font-semibold'
                : 'border-transparent text-[#191614]/70 hover:text-[#191614]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Inquiries</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`py-3.5 px-3 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'gallery'
                ? 'border-[#9B7855] text-[#9B7855] font-semibold'
                : 'border-transparent text-[#191614]/70 hover:text-[#191614]'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Portfolio & Offers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-3 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'settings'
                ? 'border-[#9B7855] text-[#9B7855] font-semibold'
                : 'border-transparent text-[#191614]/70 hover:text-[#191614]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Salon Settings</span>
          </button>
        </div>

        {/* Global Notifications */}
        {actionSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Tab Content Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* TAB 1: OVERVIEW / DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards - Simplified to 5 Core Management Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-xl border border-[#9B7855]/20 shadow-sm">
                  <span className="text-[11px] text-[#191614]/60 uppercase font-medium">Today</span>
                  <div className="text-2xl font-bold font-mono text-[#191614] mt-1">
                    {dashboardData?.stats?.todayCount ?? 0}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-sm">
                  <span className="text-[11px] text-amber-800 uppercase font-semibold">Pending</span>
                  <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
                    {dashboardData?.stats?.pendingCount ?? 0}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-sm">
                  <span className="text-[11px] text-emerald-800 uppercase font-semibold">Confirmed</span>
                  <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                    {dashboardData?.stats?.confirmedCount ?? 0}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#9B7855]/20 shadow-sm">
                  <span className="text-[11px] text-[#191614]/60 uppercase font-medium">Completed</span>
                  <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
                    {dashboardData?.stats?.completedCount ?? 0}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#9B7855]/20 shadow-sm">
                  <span className="text-[11px] text-[#191614]/60 uppercase font-medium">Cancelled</span>
                  <div className="text-2xl font-bold font-mono text-neutral-500 mt-1">
                    {dashboardData?.stats?.cancelledCount ?? 0}
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-xl border border-[#9B7855]/20 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base font-medium text-[#191614]">Today's Appointments</h4>
                    <p className="text-xs text-[#191614]/60">Clients booked for today</p>
                  </div>
                  <span className="text-xs font-mono text-[#9B7855]">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {dashboardData?.todayAppointments?.length === 0 ? (
                  <p className="text-xs text-[#191614]/60 py-6 text-center italic">
                    No appointments booked yet for today.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.todayAppointments?.map(appt => (
                      <div
                        key={appt.id}
                        className="p-3.5 rounded-xl border border-[#9B7855]/20 bg-[#FAF8F5] flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#9B7855]">{appt.start_time} - {appt.end_time}</span>
                            <span className="font-medium text-sm text-[#191614]">{appt.customer_name}</span>
                            {getStatusBadge(appt.status)}
                          </div>
                          <p className="text-xs text-[#191614]/70">
                            {appt.service_name} • {appt.service_duration} • {appt.service_price} • Phone: {appt.customer_phone}
                          </p>
                          {appt.customer_notes && (
                            <p className="text-[11px] text-[#191614]/60 italic">Notes: "{appt.customer_notes}"</p>
                          )}
                          {appt.reference_title && (
                            <div className="flex items-center gap-2 mt-1.5 p-1.5 bg-white rounded-lg border border-[#9B7855]/25 max-w-fit">
                              {appt.reference_image && (
                                <img
                                  src={appt.reference_image}
                                  alt={appt.reference_title}
                                  className="w-7 h-7 rounded object-cover border border-[#9B7855]/20"
                                />
                              )}
                              <span className="text-[11px] font-semibold text-[#9B7855]">
                                Desired Look: {appt.reference_title}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {appt.customer_phone && (
                            <a
                              href={`https://wa.me/${appt.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${appt.customer_name}, this is Malvin from MJ Hair Salon regarding your booking #${appt.id} today at ${appt.start_time}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs rounded-lg font-medium transition-colors flex items-center gap-1 shadow-xs"
                              title="Chat with customer on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {appt.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => updateAppointmentStatus(appt.id, 'CONFIRMED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg font-medium transition-colors"
                            >
                              Confirm
                            </button>
                          )}
                          {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => updateAppointmentStatus(appt.id, 'COMPLETED')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleAppt(appt);
                              setRescheduleForm({ date: appt.date, time: appt.start_time });
                            }}
                            className="px-2.5 py-1 bg-white border border-[#9B7855]/30 text-[#191614] hover:bg-[#9B7855]/10 text-xs rounded-lg font-medium transition-colors"
                          >
                            Reschedule
                          </button>
                          {appt.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => updateAppointmentStatus(appt.id, 'CANCELLED')}
                              className="px-2.5 py-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs rounded-lg font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-xl border border-[#9B7855]/20 p-5 shadow-sm space-y-4">
                <div>
                  <h4 className="font-serif text-base font-medium text-[#191614]">Upcoming Schedule</h4>
                  <p className="text-xs text-[#191614]/60">Upcoming pending and confirmed reservations</p>
                </div>

                {dashboardData?.upcomingAppointments?.length === 0 ? (
                  <p className="text-xs text-[#191614]/60 py-6 text-center italic">
                    No upcoming appointments scheduled.
                  </p>
                ) : (
                  <div className="divide-y divide-[#9B7855]/10 text-xs">
                    {dashboardData?.upcomingAppointments?.map(appt => (
                      <div key={appt.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-[#191614]">{appt.date} at {appt.start_time}</span>
                            <span className="text-[#191614]/50">•</span>
                            <span className="font-medium text-[#191614]">{appt.customer_name}</span>
                            {getStatusBadge(appt.status)}
                          </div>
                          <p className="text-[#191614]/70 mt-0.5">
                            {appt.service_name} • {appt.service_price} • Tel: {appt.customer_phone}
                          </p>
                          {appt.reference_title && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-[#9B7855] font-medium bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#9B7855]/20">
                              Look: {appt.reference_title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {appt.customer_phone && (
                            <a
                              href={`https://wa.me/${appt.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${appt.customer_name}, this is Malvin from MJ Hair Salon regarding your upcoming booking on ${appt.date} at ${appt.start_time}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-xs font-medium flex items-center gap-1"
                              title="Chat with customer on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          )}
                          {appt.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => updateAppointmentStatus(appt.id, 'CONFIRMED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
                            >
                              Confirm
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleAppt(appt);
                              setRescheduleForm({ date: appt.date, time: appt.start_time });
                            }}
                            className="px-2 py-1 border border-[#9B7855]/30 rounded-lg text-xs hover:bg-[#9B7855]/10"
                          >
                            Reschedule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: APPOINTMENTS FULL LIST & MANAGEMENT */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="bg-white p-4 rounded-xl border border-[#9B7855]/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Search by client name, phone, or ID..."
                    value={apptSearch}
                    onChange={(e) => setApptSearch(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#9B7855]/30 text-xs focus:outline-none focus:ring-2 focus:ring-[#9B7855]/40"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setApptFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        apptFilterStatus === st
                          ? 'bg-[#191614] text-white'
                          : 'bg-[#FAF8F5] text-[#191614]/70 border border-[#9B7855]/20 hover:bg-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-[#9B7855]/20 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#9B7855]/20 text-[#191614]/70 uppercase font-semibold">
                      <tr>
                        <th className="p-3">ID & Date</th>
                        <th className="p-3">Client</th>
                        <th className="p-3">Service</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#9B7855]/10">
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#191614]/60 italic">
                            No appointments matching filter criteria.
                          </td>
                        </tr>
                      ) : (
                        appointments.map(appt => (
                          <tr key={appt.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                            <td className="p-3">
                              <span className="font-mono font-bold text-[#9B7855] block">{appt.id}</span>
                              <span className="text-[#191614] font-medium">{appt.date}</span>
                              <span className="text-[#191614]/60 block">{appt.start_time} - {appt.end_time}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-[#191614] block">{appt.customer_name}</span>
                              <span className="text-[#191614]/70 block">{appt.customer_phone}</span>
                              {appt.customer_email && <span className="text-[#191614]/50 block">{appt.customer_email}</span>}
                            </td>
                            <td className="p-3">
                              <span className="font-medium text-[#191614] block">{appt.service_name}</span>
                              <span className="text-[#9B7855] font-semibold">{appt.service_price}</span>
                              <span className="text-[#191614]/60 ml-1.5">({appt.service_duration})</span>
                              {appt.reference_title && (
                                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#9B7855]">
                                  {appt.reference_image && (
                                    <img src={appt.reference_image} alt={appt.reference_title} className="w-5 h-5 rounded object-cover" />
                                  )}
                                  <span className="truncate max-w-[140px] font-medium">Look: {appt.reference_title}</span>
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              {getStatusBadge(appt.status)}
                            </td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              {appt.customer_phone && (
                                <a
                                  href={`https://wa.me/${appt.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${appt.customer_name}, this is Malvin from MJ Hair Salon regarding your booking #${appt.id}.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#25D366] text-white rounded hover:bg-[#20bd5a] text-[11px] font-medium"
                                  title="WhatsApp Customer"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span className="hidden md:inline">WhatsApp</span>
                                </a>
                              )}
                              {appt.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => updateAppointmentStatus(appt.id, 'CONFIRMED')}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-[11px] font-medium"
                                >
                                  Confirm
                                </button>
                              )}
                              {appt.status !== 'COMPLETED' && (
                                <button
                                  type="button"
                                  onClick={() => updateAppointmentStatus(appt.id, 'COMPLETED')}
                                  className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-[11px] font-medium"
                                >
                                  Complete
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setRescheduleAppt(appt);
                                  setRescheduleForm({ date: appt.date, time: appt.start_time });
                                }}
                                className="px-2 py-1 border border-[#9B7855]/30 rounded hover:bg-[#FAF8F5] text-[11px]"
                              >
                                Reschedule
                              </button>
                              {appt.status !== 'CANCELLED' && (
                                <button
                                  type="button"
                                  onClick={() => updateAppointmentStatus(appt.id, 'CANCELLED')}
                                  className="px-2 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50 text-[11px]"
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEDULE & BLOCKED TIME */}
          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Working Hours Config */}
              <div className="bg-white p-5 rounded-xl border border-[#9B7855]/20 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base font-medium text-[#191614]">Weekly Operating Hours</h4>
                    <p className="text-xs text-[#191614]/60">Configure opening, closing, and break times</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveWorkingHours}
                    className="px-3.5 py-1.5 bg-[#191614] hover:bg-[#9B7855] text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Hours</span>
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  {workingHours.map((wh, idx) => (
                    <div
                      key={wh.day_of_week}
                      className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#9B7855]/20 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-[120px]">
                        <input
                          type="checkbox"
                          checked={Boolean(wh.is_open)}
                          onChange={(e) => {
                            const updated = [...workingHours];
                            updated[idx].is_open = e.target.checked ? 1 : 0;
                            setWorkingHours(updated);
                          }}
                          className="rounded text-[#9B7855] focus:ring-[#9B7855]"
                        />
                        <span className={`font-semibold ${wh.is_open ? 'text-[#191614]' : 'text-neutral-400'}`}>
                          {wh.day_name}
                        </span>
                      </div>

                      {wh.is_open ? (
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#191614]/60">Hours:</span>
                            <input
                              type="time"
                              value={wh.open_time}
                              onChange={(e) => {
                                const updated = [...workingHours];
                                updated[idx].open_time = e.target.value;
                                setWorkingHours(updated);
                              }}
                              className="px-1.5 py-1 bg-white border border-[#9B7855]/30 rounded text-xs"
                            />
                            <span>–</span>
                            <input
                              type="time"
                              value={wh.close_time}
                              onChange={(e) => {
                                const updated = [...workingHours];
                                updated[idx].close_time = e.target.value;
                                setWorkingHours(updated);
                              }}
                              className="px-1.5 py-1 bg-white border border-[#9B7855]/30 rounded text-xs"
                            />
                          </div>

                          <div className="flex items-center gap-1 border-l border-[#9B7855]/20 pl-2">
                            <span className="text-[10px] text-[#191614]/60">Break:</span>
                            <input
                              type="time"
                              value={wh.break_start || ''}
                              onChange={(e) => {
                                const updated = [...workingHours];
                                updated[idx].break_start = e.target.value;
                                setWorkingHours(updated);
                              }}
                              className="px-1.5 py-1 bg-white border border-[#9B7855]/30 rounded text-xs"
                            />
                            <span>–</span>
                            <input
                              type="time"
                              value={wh.break_end || ''}
                              onChange={(e) => {
                                const updated = [...workingHours];
                                updated[idx].break_end = e.target.value;
                                setWorkingHours(updated);
                              }}
                              className="px-1.5 py-1 bg-white border border-[#9B7855]/30 rounded text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic text-xs">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Blocked Times */}
              <div className="bg-white p-5 rounded-xl border border-[#9B7855]/20 shadow-sm space-y-4">
                <div>
                  <h4 className="font-serif text-base font-medium text-[#191614]">Blocked Times</h4>
                  <p className="text-xs text-[#191614]/60">Block specific slots for personal appointments, rest, or holidays</p>
                </div>

                {/* Add Block Form */}
                <form onSubmit={handleAddBlockedTime} className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#9B7855]/25 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-[#191614]/70 mb-0.5">Date</label>
                      <input
                        type="date"
                        required
                        value={newBlocked.date}
                        onChange={(e) => setNewBlocked({ ...newBlocked, date: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#9B7855]/30 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#191614]/70 mb-0.5">Start Time</label>
                      <input
                        type="time"
                        required
                        value={newBlocked.startTime}
                        onChange={(e) => setNewBlocked({ ...newBlocked, startTime: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#9B7855]/30 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#191614]/70 mb-0.5">End Time</label>
                      <input
                        type="time"
                        required
                        value={newBlocked.endTime}
                        onChange={(e) => setNewBlocked({ ...newBlocked, endTime: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#9B7855]/30 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#191614]/70 mb-0.5">Reason</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lunch Break, Doctor Appointment, Holiday"
                      value={newBlocked.reason}
                      onChange={(e) => setNewBlocked({ ...newBlocked, reason: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#9B7855]/30 rounded-lg text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#191614] hover:bg-[#9B7855] text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Blocked Period</span>
                  </button>
                </form>

                {/* List of Blocked times */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {blockedTimes.length === 0 ? (
                    <p className="text-xs text-[#191614]/50 text-center py-4 italic">No blocked periods added.</p>
                  ) : (
                    blockedTimes.map(b => (
                      <div
                        key={b.id}
                        className="p-2.5 bg-white border border-[#9B7855]/20 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-[#191614]">{b.date}: </span>
                          <span className="font-mono text-[#9B7855] font-medium">{b.start_time} – {b.end_time}</span>
                          <p className="text-[#191614]/65 text-[11px] mt-0.5">{b.reason}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlockedTime(b.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Remove blocked slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SERVICES CATALOG */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-medium text-[#191614]">Salon Services</h4>
                  <p className="text-xs text-[#191614]/60">Manage pricing, duration, online availability, and descriptions</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewServiceModal(true)}
                  className="px-3.5 py-2 bg-[#191614] hover:bg-[#9B7855] text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map(s => (
                  <div
                    key={s.id}
                    className="p-4 bg-white rounded-xl border border-[#9B7855]/20 shadow-sm flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={s.image}
                        alt={s.name}
                        className="w-14 h-14 rounded-lg object-cover bg-neutral-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-sm text-[#191614] truncate">{s.name}</h5>
                          {s.popular === 1 && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#9B7855]/15 text-[#9B7855] font-bold uppercase">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#191614]/60 font-medium">{s.category}</p>
                        <p className="text-xs text-[#9B7855] font-mono font-semibold mt-1">
                          {s.price} • {s.duration} ({s.duration_minutes}m)
                        </p>
                        <p className="text-[11px] text-[#191614]/65 line-clamp-2 mt-1">{s.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleService(s.id, 'online_booking_enabled')}
                        className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                          s.online_booking_enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {s.online_booking_enabled ? 'Online: Active' : 'Online: Off'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleService(s.id, 'active')}
                        className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                          s.active
                            ? 'bg-[#191614] text-white'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {s.active ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CLIENT PROFILES */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-base font-medium text-[#191614]">Client Directory</h4>
                <p className="text-xs text-[#191614]/60">Client history, completed services, and direct contact details</p>
              </div>

              <div className="bg-white rounded-xl border border-[#9B7855]/20 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#9B7855]/20 text-[#191614]/70 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Client Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Total Visits</th>
                      <th className="p-3">Last Booked</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#9B7855]/10">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#191614]/60 italic bg-white">
                          No customer records yet. When clients book appointments, their contact details and visit history will automatically appear here.
                        </td>
                      </tr>
                    ) : (
                      customers.map(c => (
                        <tr key={c.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                          <td className="p-3 font-semibold text-[#191614]">{c.name}</td>
                          <td className="p-3 font-mono">{c.phone}</td>
                          <td className="p-3 text-[#191614]/65">{c.email || '—'}</td>
                          <td className="p-3">
                            <span className="font-bold text-[#191614]">{c.total_appointments}</span>
                            <span className="text-[10px] text-emerald-600 ml-1">({c.completed_appointments} completed)</span>
                          </td>
                          <td className="p-3 font-mono">{c.last_appointment_date || '—'}</td>
                          <td className="p-3 text-right">
                            <a
                              href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-[#25D366] text-white rounded text-[11px] font-medium hover:bg-[#20bd5a] inline-flex items-center gap-1"
                            >
                              <span>WhatsApp</span>
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-base font-medium text-[#191614]">Website Messages & Inquiries</h4>
                <p className="text-xs text-[#191614]/60">Messages submitted via the contact form</p>
              </div>

              <div className="space-y-3">
                {inquiries.length === 0 ? (
                  <p className="text-xs text-[#191614]/60 py-6 text-center italic bg-white rounded-xl border border-[#9B7855]/20">
                    No client inquiries received yet.
                  </p>
                ) : (
                  inquiries.map(inq => (
                    <div key={inq.id} className="p-4 bg-white rounded-xl border border-[#9B7855]/20 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-sm text-[#191614]">{inq.name}</span>
                          <span className="text-xs text-[#191614]/60 ml-2">Phone: {inq.phone} • Email: {inq.email || '—'}</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#9B7855]">{inq.created_at}</span>
                      </div>
                      <p className="text-xs text-[#191614]/80 italic bg-[#FAF8F5] p-3 rounded-lg border border-[#9B7855]/15">
                        "{inq.message}"
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#191614]/60">
                          Preferred Service: <strong>{inq.preferred_service || 'General Inquiry'}</strong>
                        </span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${inq.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(inq.name)},%20thank%20you%20for%20contacting%20MJ%20Hair%20Salon!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-[#25D366] text-white rounded text-xs font-medium hover:bg-[#20bd5a]"
                          >
                            Reply on WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: PORTFOLIO & OFFERS */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              {/* Offers */}
              <div className="bg-white p-5 rounded-xl border border-[#9B7855]/20 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base font-medium text-[#191614]">Promotional Offers</h4>
                    <p className="text-xs text-[#191614]/60">Seasonal specials and new client incentives</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewOfferModal(true)}
                    className="px-3 py-1.5 bg-[#191614] text-white rounded-lg text-xs hover:bg-[#9B7855] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Offer</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {offers.length === 0 ? (
                    <p className="text-[#191614]/50 italic col-span-2 text-center py-4">No active offers.</p>
                  ) : (
                    offers.map(o => (
                      <div key={o.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#9B7855]/20 flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-[#191614]">{o.title}</h5>
                          <p className="text-[#191614]/70 mt-0.5">{o.description}</p>
                          {o.price && <span className="text-[#9B7855] font-bold font-mono mt-1 block">{o.price}</span>}
                          {o.expiry_date && <span className="text-[10px] text-neutral-500 block">Expires: {o.expiry_date}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch(`/api/admin/offers/${o.id}`, { method: 'DELETE', headers: authHeaders });
                            loadGalleryAndOffers();
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Gallery Items */}
              <div className="bg-white p-5 rounded-xl border border-[#9B7855]/20 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base font-medium text-[#191614]">Portfolio Gallery</h4>
                    <p className="text-xs text-[#191614]/60">Authentic MJ Hair Salon client transformations</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewGalleryModal(true)}
                    className="px-3 py-1.5 bg-[#191614] text-white rounded-lg text-xs hover:bg-[#9B7855] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {gallery.length === 0 ? (
                    <p className="text-[#191614]/50 italic col-span-full text-center py-6">
                      No gallery images added yet. Click &apos;Add Item&apos; to upload your real client transformations.
                    </p>
                  ) : (
                    gallery.map(g => (
                      <div key={g.id} className="rounded-xl overflow-hidden border border-[#9B7855]/20 bg-[#FAF8F5] relative group">
                        <img src={g.image} alt={g.title} className="w-full h-32 object-cover" />
                        <div className="p-2 text-xs">
                          <h6 className="font-semibold text-[#191614] truncate">{g.title}</h6>
                          <span className="text-[10px] text-[#9B7855]">{g.category}</span>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch(`/api/admin/gallery/${g.id}`, { method: 'DELETE', headers: authHeaders });
                            loadGalleryAndOffers();
                          }}
                          className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SALON SETTINGS */}
          {activeTab === 'settings' && settings && (
            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-[#9B7855]/20 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#9B7855]/15 pb-4">
                <div>
                  <h4 className="font-serif text-base font-medium text-[#191614]">Salon Configuration</h4>
                  <p className="text-xs text-[#191614]/60">Contact details, booking policies, and direct external portals</p>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#191614] hover:bg-[#9B7855] text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">Salon Name</label>
                  <input
                    type="text"
                    value={settings.salon_name || ''}
                    onChange={(e) => setSettings({ ...settings, salon_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">Master Stylist Name</label>
                  <input
                    type="text"
                    value={settings.owner_name || ''}
                    onChange={(e) => setSettings({ ...settings, owner_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">Display Phone</label>
                  <input
                    type="text"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">WhatsApp Number (numbers only)</label>
                  <input
                    type="text"
                    value={settings.whatsapp_number || ''}
                    onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">Booksy Profile URL</label>
                  <input
                    type="text"
                    value={settings.booksy_url || ''}
                    onChange={(e) => setSettings({ ...settings, booksy_url: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={settings.instagram_url || ''}
                    onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={settings.address_street || ''}
                    onChange={(e) => setSettings({ ...settings, address_street: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">Minimum Booking Notice (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={settings.min_booking_notice_hours || 2}
                    onChange={(e) => setSettings({ ...settings, min_booking_notice_hours: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">Max Advance Booking (Days)</label>
                  <input
                    type="number"
                    min="7"
                    max="180"
                    value={settings.max_advance_booking_days || 60}
                    onChange={(e) => setSettings({ ...settings, max_advance_booking_days: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">Slot Interval (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    step="15"
                    value={settings.slot_interval_minutes || 30}
                    onChange={(e) => setSettings({ ...settings, slot_interval_minutes: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#191614]/80 mb-1">Cancellation Policy Text</label>
                <textarea
                  rows={2}
                  value={settings.cancellation_policy || ''}
                  onChange={(e) => setSettings({ ...settings, cancellation_policy: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl text-xs resize-none"
                />
              </div>
            </form>
          )}

        </div>

        {/* Reschedule Modal */}
        {rescheduleAppt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#FAF8F5] rounded-2xl p-6 max-w-sm w-full border border-[#9B7855]/30 shadow-2xl space-y-4">
              <div>
                <h4 className="font-serif text-base font-medium text-[#191614]">Reschedule Appointment</h4>
                <p className="text-xs text-[#191614]/60">
                  {rescheduleAppt.customer_name} • {rescheduleAppt.service_name}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] text-[#191614]/70 mb-1">New Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleForm.date}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#9B7855]/30 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#191614]/70 mb-1">New Start Time</label>
                  <input
                    type="time"
                    required
                    value={rescheduleForm.time}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#9B7855]/30 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleAppt(null)}
                  className="px-3.5 py-1.5 border border-neutral-300 rounded-xl text-xs text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRescheduleSubmit}
                  className="px-3.5 py-1.5 bg-[#191614] hover:bg-[#9B7855] text-white rounded-xl text-xs font-medium"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Service Modal */}
        {newServiceModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#FAF8F5] rounded-2xl p-6 max-w-md w-full border border-[#9B7855]/30 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-medium text-[#191614]">Add New Service</h4>
                <button type="button" onClick={() => setNewServiceModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateService} className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1 font-medium">Service Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Balayage Refresh"
                    value={newServiceForm.name}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#9B7855]/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Category</label>
                  <select
                    value={newServiceForm.category}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#9B7855]/30 rounded-xl"
                  >
                    <option value="Haircuts & Styling">Haircuts & Styling</option>
                    <option value="Color & Blonding">Color & Blonding</option>
                    <option value="Treatments & Health">Treatments & Health</option>
                    <option value="Special Occasions">Special Occasions</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 font-medium">Price Display</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. $150.00+"
                      value={newServiceForm.price}
                      onChange={(e) => setNewServiceForm({ ...newServiceForm, price: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#9B7855]/30 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Duration (minutes)</label>
                    <input
                      type="number"
                      required
                      min="15"
                      max="360"
                      step="15"
                      value={newServiceForm.durationMinutes}
                      onChange={(e) => {
                        const m = Number(e.target.value);
                        setNewServiceForm({
                          ...newServiceForm,
                          durationMinutes: m,
                          duration: `${m} min`
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#9B7855]/30 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    rows={2}
                    value={newServiceForm.description}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#9B7855]/30 rounded-xl resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewServiceModal(false)}
                    className="px-4 py-2 border rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#191614] text-white rounded-xl hover:bg-[#9B7855]"
                  >
                    Create Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
