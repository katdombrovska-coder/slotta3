import React, { useState, useEffect } from 'react';
import { MasterLayout } from './Dashboard';
import { mastersAPI, authAPI, googleCalendarAPI, stripeAPI, walletAPI, telegramAPI } from '@/lib/api';
import {
  User, Link as LinkIcon, Shield, Save,
  Calendar, Upload, CheckCircle, RefreshCw, Loader2, Camera,
  ExternalLink, MessageCircle, Send, Bell, Copy
} from 'lucide-react';

const Settings = () => {
  const master = authAPI.getMaster();
  const masterId = master?.id;
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarLastSync, setCalendarLastSync] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: master?.name || '',
    email: master?.email || '',
    phone: master?.phone || '',
    specialty: master?.specialty || '',
    bio: master?.bio || '',
    location: master?.location || '',
    photo_url: master?.photo_url || ''
  });

  const [settings, setSettings] = useState({
    daily_summary_enabled: master?.settings?.daily_summary_enabled !== false,
    summary_time: master?.settings?.summary_time || '08:00',
    timezone: master?.settings?.timezone || 'Europe/Lisbon'
  });

  const [stripeConnected, setStripeConnected] = useState(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [payoutLoading, setPayoutLoading] = useState(false);

  const [notificationPrefs, setNotificationPrefs] = useState({
    'new-booking': { email: true, telegram: false },
    'reschedule': { email: true, telegram: false },
    'no-show': { email: true, telegram: false },
    'payout': { email: true, telegram: false },
  });
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsToast, setPrefsToast] = useState(false);

  const bookingLink = master?.booking_slug ? `${window.location.origin}/${master.booking_slug}` : '';

  useEffect(() => {
    if (masterId) {
      checkCalendarStatus();
      checkStripeStatus();
      checkTelegramStatus();
      loadWalletBalance();
      loadNotificationPrefs();
    }
  }, [masterId]);

  const loadNotificationPrefs = async () => {
    try {
      const response = await mastersAPI.getById(masterId);
      if (response.data?.notification_preferences) {
        setNotificationPrefs(response.data.notification_preferences);
      }
    } catch (err) { console.error('Failed to load notification preferences:', err); }
  };

  const handleSaveNotificationPrefs = async () => {
    try {
      setPrefsSaving(true);
      await mastersAPI.update(masterId, { notification_preferences: notificationPrefs });
      setPrefsToast(true);
      setTimeout(() => setPrefsToast(false), 3000);
    } catch (err) {
      alert('Failed to save preferences.');
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleNotificationPrefChange = (notifId, channel, checked) => {
    setNotificationPrefs(prev => ({ ...prev, [notifId]: { ...prev[notifId], [channel]: checked } }));
  };

  const checkTelegramStatus = async () => {
    try {
      const response = await telegramAPI.getStatus(masterId);
      setTelegramConnected(response.data.connected);
    } catch (err) { console.error('Failed to check Telegram status:', err); }
  };

  const handleConnectTelegram = () => {
    const botUsername = 'slotta_booking_bot';
    window.open(`https://t.me/${botUsername}?start=${masterId}`, '_blank');
    const chatId = prompt('Telegram Connection Instructions:\n\n1. Click OK to open Telegram\n2. Send /start to the bot\n3. The bot will give you your Chat ID\n4. Enter that Chat ID here:');
    if (chatId && chatId.trim()) {
      connectTelegramWithChatId(chatId.trim());
    }
  };

  const connectTelegramWithChatId = async (chatId) => {
    try {
      setTelegramLoading(true);
      await telegramAPI.connect(masterId, chatId);
      setTelegramConnected(true);
      alert('Telegram connected successfully!');
    } catch (err) {
      alert('Failed to connect Telegram.');
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    if (!window.confirm('Disconnect Telegram notifications?')) return;
    try {
      setTelegramLoading(true);
      await telegramAPI.disconnect(masterId);
      setTelegramConnected(false);
    } catch (err) { console.error('Failed:', err); }
    finally { setTelegramLoading(false); }
  };

  const handleTestTelegram = async () => {
    try {
      setTelegramLoading(true);
      await telegramAPI.testNotification(masterId);
      alert('Test notification sent!');
    } catch (err) {
      alert('Failed to send test.');
    } finally {
      setTelegramLoading(false);
    }
  };

  const checkStripeStatus = async () => {
    try {
      const response = await stripeAPI.getConnectStatus(masterId);
      setStripeConnected(response.data.connected);
      setPayoutsEnabled(response.data.payouts_enabled);
    } catch (err) { console.error('Failed:', err); }
  };

  const loadWalletBalance = async () => {
    try {
      const response = await walletAPI.getWallet(masterId);
      setWalletBalance(response.data.wallet_balance || 0);
    } catch (err) { console.error('Failed:', err); }
  };

  const handleConnectStripe = async () => {
    try {
      setStripeLoading(true);
      const response = await stripeAPI.getOnboardingLink(masterId);
      if (response.data.url) window.location.href = response.data.url;
    } catch (err) { alert('Failed to start Stripe onboarding.'); }
    finally { setStripeLoading(false); }
  };

  const handleStripeDashboard = async () => {
    try {
      setStripeLoading(true);
      if (!payoutsEnabled) {
        const response = await stripeAPI.getOnboardingLink(masterId);
        if (response.data.url) window.location.href = response.data.url;
        return;
      }
      const response = await stripeAPI.getDashboardLink(masterId);
      if (response.data.url) window.open(response.data.url, '_blank');
    } catch (err) { alert('Failed to open Stripe dashboard.'); }
    finally { setStripeLoading(false); }
  };

  const handleRequestPayout = async () => {
    if (walletBalance < 30) { alert('Minimum payout is €30'); return; }
    if (!window.confirm(`Request payout of €${walletBalance.toFixed(2)}?`)) return;
    try {
      setPayoutLoading(true);
      const response = await stripeAPI.requestPayout(masterId);
      alert(response.data.message);
      loadWalletBalance();
    } catch (err) { alert('Payout request failed.'); }
    finally { setPayoutLoading(false); }
  };

  const checkCalendarStatus = async () => {
    try {
      const response = await googleCalendarAPI.syncStatus(masterId);
      setCalendarConnected(response.data.connected);
      setCalendarLastSync(response.data.last_sync_at || null);
    } catch (err) { console.error('Failed:', err); }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await mastersAPI.update(masterId, { ...profileData, settings });
      authAPI.setMaster({ ...master, ...profileData, settings });
      alert('Profile updated successfully!');
    } catch (err) { alert('Failed to update profile.'); }
    finally { setLoading(false); }
  };

  const handleConnectCalendar = async () => {
    try {
      setCalendarLoading(true);
      const response = await googleCalendarAPI.getAuthUrl(masterId);
      window.location.href = response.data.auth_url;
    } catch (err) { alert('Failed to connect Google Calendar.'); }
    finally { setCalendarLoading(false); }
  };

  const handleDisconnectCalendar = async () => {
    if (!window.confirm('Disconnect Google Calendar?')) return;
    try {
      setCalendarLoading(true);
      await googleCalendarAPI.disconnect(masterId);
      setCalendarConnected(false);
    } catch (err) { alert('Failed to disconnect.'); }
    finally { setCalendarLoading(false); }
  };

  const handleImportCalendarEvents = async () => {
    try {
      setCalendarLoading(true);
      const response = await googleCalendarAPI.importEvents(masterId);
      alert(`Imported ${response.data.imported_count} events!`);
    } catch (err) { alert('Failed to import events.'); }
    finally { setCalendarLoading(false); }
  };

  const handleSyncToGoogle = async () => {
    try {
      setCalendarLoading(true);
      const response = await googleCalendarAPI.syncBookings(masterId);
      alert(`Synced ${response.data.synced_count} bookings!`);
    } catch (err) { alert('Failed to sync.'); }
    finally { setCalendarLoading(false); }
  };

  const handleFullSync = async () => {
    try {
      setCalendarLoading(true);
      const response = await googleCalendarAPI.fullSync(masterId);
      alert(`Full sync done! ${response.data.bookings_synced_to_google} to Google, ${response.data.events_imported_from_google} to SLØTTA.`);
    } catch (err) { alert('Failed to sync.'); }
    finally { setCalendarLoading(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5MB'); return; }
    try {
      setImageUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setProfileData({ ...profileData, photo_url: base64 });
        await mastersAPI.update(masterId, { photo_url: base64 });
        authAPI.setMaster({ ...master, photo_url: base64 });
        setImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Failed to upload image.');
      setImageUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookingLink);
    alert('Link copied!');
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition";

  // Notification types
  const notifTypes = [
    { id: 'new-booking', label: 'New Booking', desc: 'When a client books a slot' },
    { id: 'reschedule', label: 'Reschedule', desc: 'When a booking is rescheduled' },
    { id: 'no-show', label: 'No-Show', desc: 'When a client misses a booking' },
    { id: 'payout', label: 'Payout', desc: 'When a payout is processed' },
  ];

  return (
    <MasterLayout active="settings" title="Settings">
      {/* Profile Photo */}
      <div className="slotta-card rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5">Profile Photo</h3>
        <div className="flex items-center gap-5">
          <div className="relative">
            {profileData.photo_url ? (
              <img src={profileData.photo_url} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-slotta-purple-50" />
            ) : (
              <div className="w-20 h-20 bg-slotta-purple-50 rounded-full flex items-center justify-center text-slotta-purple text-xl font-bold border-4 border-slotta-purple-50">
                {profileData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-slotta-purple rounded-full flex items-center justify-center cursor-pointer hover:bg-slotta-purple-dark transition shadow-sm">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={imageUploading} />
            </label>
          </div>
          <div>
            <h4 className="font-semibold text-slotta-ink">{profileData.name || 'Your Name'}</h4>
            <p className="text-sm text-slotta-ink-soft">{profileData.specialty || 'Add your specialty'}</p>
            {imageUploading && (
              <div className="flex items-center gap-2 text-slotta-purple mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="slotta-card rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5">Profile Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slotta-ink block mb-1.5">Full Name</label>
            <input type="text" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-slotta-ink block mb-1.5">Email</label>
            <input type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-slotta-ink block mb-1.5">Phone</label>
            <input type="tel" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-slotta-ink block mb-1.5">Specialty</label>
            <input type="text" value={profileData.specialty} onChange={e => setProfileData({ ...profileData, specialty: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-slotta-ink block mb-1.5">Location</label>
            <input type="text" value={profileData.location} onChange={e => setProfileData({ ...profileData, location: e.target.value })} className={inputClass} placeholder="e.g., Lisbon, PT" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slotta-ink block mb-1.5">Bio</label>
            <textarea rows="3" value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} className={inputClass} placeholder="Tell clients about yourself..." />
          </div>
        </div>
        <button onClick={handleSaveProfile} disabled={loading} className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-full bg-slotta-purple text-white font-medium text-sm hover:bg-slotta-purple-dark transition disabled:opacity-50">
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Booking Link */}
      <div className="slotta-card rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5">Your Booking Link</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 bg-slotta-purple-50 px-4 py-3 rounded-xl border border-slotta-purple/10">
            <LinkIcon className="w-5 h-5 text-slotta-purple/50" />
            <span className="font-mono text-sm text-slotta-purple" data-testid="booking-link">{bookingLink}</span>
          </div>
          <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slotta-purple/15 text-slotta-ink font-medium text-sm hover:bg-slotta-purple-50 transition">
            <Copy className="w-4 h-4" />
            Copy
          </button>
        </div>
        <p className="text-sm text-slotta-ink-soft mt-3">Share this link with clients for easy booking.</p>
      </div>

      {/* Google Calendar Sync */}
      <div className="slotta-card rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slotta-purple" strokeWidth={1.5} />
          Google Calendar Sync
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${calendarConnected ? 'bg-green-50' : 'bg-slotta-purple-50'}`}>
                {calendarConnected ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Calendar className="w-5 h-5 text-slotta-purple/50" />}
              </div>
              <div>
                <div className="font-semibold text-slotta-ink">Google Calendar</div>
                <div className="text-sm text-slotta-ink-soft">{calendarConnected ? 'Connected - Two-way sync enabled' : 'Not connected'}</div>
                {calendarLastSync && <div className="text-xs text-slotta-ink-soft mt-0.5">Last sync: {new Date(calendarLastSync).toLocaleString('en-GB')}</div>}
              </div>
            </div>
            {!calendarConnected && (
              <button onClick={handleConnectCalendar} disabled={calendarLoading} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slotta-purple text-white text-sm font-medium hover:bg-slotta-purple-dark transition disabled:opacity-50">
                {calendarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                Connect
              </button>
            )}
          </div>

          {calendarConnected && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slotta-purple-50 border border-slotta-purple/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-5 h-5 text-slotta-purple" />
                    <span className="font-semibold text-slotta-ink text-sm">SLØTTA to Google</span>
                  </div>
                  <p className="text-sm text-slotta-ink-soft mb-3">Push bookings to Google Calendar</p>
                  <button onClick={handleSyncToGoogle} disabled={calendarLoading} className="w-full py-2.5 rounded-full bg-slotta-purple text-white text-sm font-medium hover:bg-slotta-purple-dark transition disabled:opacity-50">
                    {calendarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 inline mr-1" />}
                    Sync to Google
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slotta-lime-50 border border-slotta-lime/20">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-5 h-5 text-slotta-lime-dark" />
                    <span className="font-semibold text-slotta-ink text-sm">Google to SLØTTA</span>
                  </div>
                  <p className="text-sm text-slotta-ink-soft mb-3">Import events as blocked time</p>
                  <button onClick={handleImportCalendarEvents} disabled={calendarLoading} className="w-full py-2.5 rounded-full border border-slotta-lime/30 text-slotta-ink text-sm font-medium hover:bg-white transition disabled:opacity-50">
                    {calendarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 inline mr-1" />}
                    Import Events
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slotta-purple-50 to-slotta-lime-50 border border-slotta-purple/10">
                <div>
                  <div className="font-semibold text-slotta-ink text-sm">Full Two-Way Sync</div>
                  <p className="text-sm text-slotta-ink-soft">Sync everything in both directions</p>
                </div>
                <button onClick={handleFullSync} disabled={calendarLoading} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slotta-purple text-white text-sm font-medium hover:bg-slotta-purple-dark transition disabled:opacity-50">
                  {calendarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Full Sync
                </button>
              </div>
              <div className="flex justify-end">
                <button onClick={handleDisconnectCalendar} disabled={calendarLoading} className="text-sm text-red-500 hover:underline">Disconnect Google Calendar</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Telegram Notifications */}
      <div className="slotta-card rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-slotta-purple" strokeWidth={1.5} />
          Telegram Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${telegramConnected ? 'bg-green-50' : 'bg-slotta-purple-50'}`}>
                {telegramConnected ? <CheckCircle className="w-5 h-5 text-green-500" /> : <MessageCircle className="w-5 h-5 text-slotta-purple/50" />}
              </div>
              <div>
                <div className="font-semibold text-slotta-ink">Telegram Bot</div>
                <div className="text-sm text-slotta-ink-soft">{telegramConnected ? 'Connected - Instant notifications enabled' : 'Not connected'}</div>
              </div>
            </div>
            {!telegramConnected ? (
              <button onClick={handleConnectTelegram} disabled={telegramLoading} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slotta-purple text-white text-sm font-medium hover:bg-slotta-purple-dark transition disabled:opacity-50">
                {telegramLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                Connect
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleTestTelegram} disabled={telegramLoading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slotta-purple/15 text-sm text-slotta-ink hover:bg-slotta-purple-50 transition">
                  <Send className="w-3.5 h-3.5" /> Test
                </button>
                <button onClick={handleDisconnectTelegram} disabled={telegramLoading} className="text-sm text-red-500 hover:underline px-3">Disconnect</button>
              </div>
            )}
          </div>
          {!telegramConnected && (
            <div className="p-4 rounded-xl bg-slotta-purple-50/50 border border-slotta-purple/8">
              <h4 className="font-medium text-slotta-ink mb-2 text-sm">How to connect:</h4>
              <ol className="text-sm text-slotta-ink-soft space-y-1 list-decimal list-inside">
                <li>Click "Connect" button above</li>
                <li>Open the SLØTTA bot in Telegram</li>
                <li>Send <code className="bg-slotta-purple-50 px-1 rounded text-slotta-purple">/start</code> to the bot</li>
                <li>Copy the Chat ID the bot gives you</li>
                <li>Paste it when prompted</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="slotta-card rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5 flex items-center gap-2">
          <Bell className="w-5 h-5 text-slotta-purple" strokeWidth={1.5} />
          Notification Preferences
        </h3>
        <div className="space-y-3">
          {notifTypes.map((notif) => (
            <div key={notif.id} className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8">
              <div>
                <div className="font-semibold text-slotta-ink text-sm">{notif.label}</div>
                <div className="text-sm text-slotta-ink-soft">{notif.desc}</div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notificationPrefs[notif.id]?.email ?? false} onChange={e => handleNotificationPrefChange(notif.id, 'email', e.target.checked)} className="w-4 h-4 rounded accent-slotta-purple" />
                  <span className="text-sm text-slotta-ink-soft">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notificationPrefs[notif.id]?.telegram ?? false} onChange={e => handleNotificationPrefChange(notif.id, 'telegram', e.target.checked)} className="w-4 h-4 rounded accent-slotta-purple" />
                  <span className="text-sm text-slotta-ink-soft">Telegram</span>
                </label>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-5">
          <button onClick={handleSaveNotificationPrefs} disabled={prefsSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slotta-purple text-white font-medium text-sm hover:bg-slotta-purple-dark transition disabled:opacity-50">
            {prefsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Preferences
          </button>
          {prefsToast && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </div>

      {/* Daily Summary */}
      <div className="slotta-card rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5">Daily Summary Email</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8">
            <div>
              <div className="font-medium text-slotta-ink">Quick Stats Email</div>
              <div className="text-sm text-slotta-ink-soft">Receive a daily summary with your bookings, time protected, and pending payouts</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.daily_summary_enabled} onChange={e => setSettings({ ...settings, daily_summary_enabled: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slotta-purple"></div>
            </label>
          </div>
          {settings.daily_summary_enabled && (
            <div className="grid md:grid-cols-2 gap-4 p-4 rounded-xl bg-slotta-purple-50/30">
              <div>
                <label className="text-sm font-medium text-slotta-ink block mb-1.5">Send Time</label>
                <select value={settings.summary_time} onChange={e => setSettings({ ...settings, summary_time: e.target.value })} className={inputClass}>
                  {['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slotta-ink block mb-1.5">Timezone</label>
                <select value={settings.timezone} onChange={e => setSettings({ ...settings, timezone: e.target.value })} className={inputClass}>
                  {['Europe/Lisbon','Europe/London','Europe/Berlin','Europe/Paris','Europe/Kyiv','America/New_York','America/Los_Angeles','Asia/Dubai'].map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stripe Connect */}
      <div className="slotta-card rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-slotta-purple" strokeWidth={1.5} />
          Stripe Connect
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stripeConnected ? 'bg-green-50' : 'bg-slotta-purple-50'}`}>
                {stripeConnected ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Shield className="w-5 h-5 text-slotta-purple/50" />}
              </div>
              <div>
                <div className="font-semibold text-slotta-ink">Stripe Account</div>
                <div className="text-sm text-slotta-ink-soft">
                  {stripeConnected ? (payoutsEnabled ? 'Connected - Payouts enabled' : 'Connected - Complete onboarding') : 'Not connected'}
                </div>
              </div>
            </div>
            {!stripeConnected ? (
              <button onClick={handleConnectStripe} disabled={stripeLoading} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slotta-purple text-white text-sm font-medium hover:bg-slotta-purple-dark transition disabled:opacity-50">
                {stripeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Connect Stripe
              </button>
            ) : (
              <button onClick={handleStripeDashboard} disabled={stripeLoading} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slotta-purple/15 text-slotta-ink text-sm font-medium hover:bg-slotta-purple-50 transition">
                {stripeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Dashboard
              </button>
            )}
          </div>

          {stripeConnected && (
            <div className="p-4 rounded-xl bg-slotta-purple-50 border border-slotta-purple/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-slotta-ink">Available Balance</div>
                  <div className="text-2xl font-bold text-slotta-purple">€{walletBalance.toFixed(2)}</div>
                </div>
                <button onClick={handleRequestPayout} disabled={payoutLoading || walletBalance < 30} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slotta-lime text-slotta-ink text-sm font-semibold hover:bg-slotta-lime-dark transition disabled:opacity-50">
                  {payoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Request Payout
                </button>
              </div>
              <p className="text-xs text-slotta-ink-soft">Minimum payout: €30</p>
            </div>
          )}
          {!stripeConnected && (
            <div className="p-4 rounded-xl bg-slotta-purple-50/50 border border-slotta-purple/8">
              <p className="text-sm text-slotta-ink-soft">
                Connect your Stripe account to receive payouts. SLØTTA uses Stripe Connect for secure payments.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="slotta-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slotta-purple-50 flex items-center justify-center">
                <User className="w-5 h-5 text-slotta-purple" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-semibold text-slotta-ink">{profileData.name || 'User'}</div>
                <div className="text-sm text-slotta-ink-soft">{profileData.email}</div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slotta-purple-50 text-slotta-purple">Master Account</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slotta-purple-50 flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-slotta-purple" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-semibold text-slotta-ink">Booking Slug</div>
                <div className="text-sm text-slotta-ink-soft font-mono">{master?.booking_slug || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default Settings;
