import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import TrustSection from './components/TrustSection.jsx';
import ServicesSection from './components/ServicesSection.jsx';
import GallerySection from './components/GallerySection.jsx';
import InspirationSection from './components/InspirationSection.jsx';
import AboutSection from './components/AboutSection.jsx';
import ReviewsSection from './components/ReviewsSection.jsx';
import LocationContactSection from './components/LocationContactSection.jsx';
import Footer from './components/Footer.jsx';
import MobileStickyBar from './components/MobileStickyBar.jsx';
import BookingModal from './components/BookingModal.jsx';
import AppointmentLookupModal from './components/AppointmentLookupModal.jsx';
import AdminLoginModal from './components/admin/AdminLoginModal.jsx';
import AdminDashboardModal from './components/admin/AdminDashboardModal.jsx';

export default function App() {
  const [salonInfo, setSalonInfo] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState(null);
  const [referenceLook, setReferenceLook] = useState(null);

  // Customer Appointment Lookup Modal
  const [lookupModalOpen, setLookupModalOpen] = useState(false);

  // Admin Auth & Dashboard Modals
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('mj_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mj_admin_user')) || null;
    } catch {
      return null;
    }
  });

  const loadSalonData = async () => {
    try {
      const res = await fetch('/api/salon');
      const data = await res.json();
      if (data.success) {
        setSalonInfo(data.data);
      }
    } catch (err) {
      console.error('Failed to load salon info:', err);
    }
  };

  useEffect(() => {
    loadSalonData();
  }, []);

  const handleOpenBooking = (service = null, look = null) => {
    setPreselectedService(service);
    setReferenceLook(look);
    setBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingModalOpen(false);
    setPreselectedService(null);
    setReferenceLook(null);
  };

  // Open Admin Flow: if token exists, open dashboard directly; else open login
  const handleOpenAdmin = () => {
    if (adminToken) {
      setAdminDashboardOpen(true);
    } else {
      setAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    setAdminLoginOpen(false);
    setAdminDashboardOpen(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('mj_admin_token');
    localStorage.removeItem('mj_admin_user');
    setAdminToken('');
    setAdminUser(null);
    setAdminDashboardOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1B18] font-sans flex flex-col">
      {/* Header & Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => setLookupModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        salonInfo={salonInfo}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <Hero
          onOpenBooking={() => handleOpenBooking()}
          salonInfo={salonInfo}
        />

        <TrustSection />

        <ServicesSection
          onSelectService={(service) => setPreselectedService(service)}
          onOpenBooking={(service) => handleOpenBooking(service)}
        />

        <GallerySection
          onOpenBooking={(service, look) => handleOpenBooking(service, look)}
        />

        <InspirationSection
          onOpenBooking={(service, look) => handleOpenBooking(service, look)}
        />

        <AboutSection
          salonInfo={salonInfo}
        />

        <ReviewsSection
          salonInfo={salonInfo}
        />

        <LocationContactSection
          salonInfo={salonInfo}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => setLookupModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        salonInfo={salonInfo}
      />

      {/* Mobile Sticky CTA Bar */}
      <MobileStickyBar
        onOpenBooking={() => handleOpenBooking()}
        salonInfo={salonInfo}
      />

      {/* Full Appointment Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={handleCloseBooking}
        preselectedService={preselectedService}
        referenceLook={referenceLook}
        salonInfo={salonInfo}
        onOpenLookup={() => setLookupModalOpen(true)}
      />

      {/* Customer Appointment Lookup Modal */}
      <AppointmentLookupModal
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
        salonInfo={salonInfo}
        onBookNew={() => handleOpenBooking()}
      />

      {/* Salon Owner Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Salon Owner Admin Management Dashboard Modal */}
      {adminToken && (
        <AdminDashboardModal
          isOpen={adminDashboardOpen}
          onClose={() => setAdminDashboardOpen(false)}
          token={adminToken}
          user={adminUser}
          onLogout={handleAdminLogout}
          onSettingsUpdated={loadSalonData}
        />
      )}
    </div>
  );
}
