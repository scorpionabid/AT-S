import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiUser, FiMail, FiPhone, FiLock, FiCamera, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  institution: string;
  avatar: string;
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileSettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    firstName: 'Əli',
    lastName: 'Məmmədov',
    email: 'ali.mammadov@atis.edu.az',
    phone: '+994 50 123 45 67',
    position: 'Regional Administrator',
    institution: 'Bakı Şəhər Təhsil İdarəsi',
    avatar: '',
    language: 'az',
    timezone: 'Asia/Baku',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  });

  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      // API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Profil məlumatları saxlanıldı!');
    } catch (error) {
      alert('Xəta baş verdi!');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Şifrələr uyğun gəlmir!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Şifrə minimum 8 simvol olmalıdır!');
      return;
    }

    setLoading(true);
    try {
      // API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Şifrə uğurla dəyişdirildi!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert('Şifrə dəyişdirilmədi!');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Profil Tənzimləmələri"
        subtitle="Şəxsi məlumatlarınızı və hesab tənzimləmələrinizi idarə edin"
        icon={<FiUser className="w-6 h-6 text-blue-600" />}
        actions={
          <Button onClick={handleProfileSave} disabled={loading}>
            <FiSave className="w-4 h-4 mr-2" />
            {loading ? 'Saxlanır...' : 'Dəyişiklikləri Saxla'}
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Tabs */}
          <Card className="p-1">
            <div className="flex gap-1">
              <Button
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('profile')}
                className="flex-1"
              >
                Profil Məlumatları
              </Button>
              <Button
                variant={activeTab === 'security' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('security')}
                className="flex-1"
              >
                Təhlükəsizlik
              </Button>
              <Button
                variant={activeTab === 'preferences' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('preferences')}
                className="flex-1"
              >
                Üstünlüklər
              </Button>
            </div>
          </Card>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Profil Şəkli</h3>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                      <FiCamera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{profile.firstName} {profile.lastName}</h4>
                    <p className="text-gray-600">{profile.position}</p>
                    <p className="text-sm text-gray-500">{profile.institution}</p>
                  </div>
                </div>
              </Card>

              {/* Personal Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Şəxsi Məlumatlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Soyad
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiLock className="w-5 h-5" />
                Şifrə Dəyişikliyi
              </h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cari Şifrə
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-3 top-3 text-gray-400"
                    >
                      {showPasswords.current ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yeni Şifrə
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-3 top-3 text-gray-400"
                    >
                      {showPasswords.new ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifrəni Təsdiq Et
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-3 top-3 text-gray-400"
                    >
                      {showPasswords.confirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button onClick={handlePasswordChange} disabled={loading}>
                  {loading ? 'Dəyişdirilir...' : 'Şifrəni Dəyişdir'}
                </Button>
              </div>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Language & Region */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Dil və Region</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dil
                    </label>
                    <select
                      value={profile.language}
                      onChange={(e) => setProfile({...profile, language: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="az">Azərbaycan dili</option>
                      <option value="en">English</option>
                      <option value="ru">Русский</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vaxt Zonası
                    </label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Baku">Bakı (GMT+4)</option>
                      <option value="Europe/Moscow">Moskva (GMT+3)</option>
                      <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Bildirişlər</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.notifications.email}
                      onChange={(e) => setProfile({
                        ...profile,
                        notifications: {...profile.notifications, email: e.target.checked}
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">Email Bildirişləri</p>
                      <p className="text-sm text-gray-500">Yeni tapşırıq və məlumatlar üçün email bildirişləri</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.notifications.sms}
                      onChange={(e) => setProfile({
                        ...profile,
                        notifications: {...profile.notifications, sms: e.target.checked}
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">SMS Bildirişləri</p>
                      <p className="text-sm text-gray-500">Təcili bildirişlər üçün SMS göndərmək</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.notifications.push}
                      onChange={(e) => setProfile({
                        ...profile,
                        notifications: {...profile.notifications, push: e.target.checked}
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">Push Bildirişləri</p>
                      <p className="text-sm text-gray-500">Brauzer bildirişləri aktiv etmək</p>
                    </div>
                  </label>
                </div>
              </Card>
            </div>
          )}
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default ProfileSettingsPage;