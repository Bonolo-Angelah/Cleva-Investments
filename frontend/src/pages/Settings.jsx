import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuthStore } from '../utils/store';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Setup 2FA
  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.setup2FA();
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setShowSetup2FA(true);
      toast.success('Scan QR code with your authenticator app');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to setup 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  // Enable 2FA
  const handleEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.enable2FA(verificationCode);
      updateUser(response.data.user);
      toast.success('2FA enabled successfully!');
      setShowSetup2FA(false);
      setVerificationCode('');
      setQrCode('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    const code = prompt('Enter your 2FA code:');
    const password = prompt('Enter your password:');

    if (!code || !password) {
      toast.error('Code and password required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.disable2FA(code, password);
      updateUser(response.data.user);
      toast.success('2FA disabled');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

      {/* Account Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{user?.firstName} {user?.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email Verified:</span>
            <span className={`font-medium ${user?.emailVerified ? 'text-green-600' : 'text-orange-600'}`}>
              {user?.emailVerified ? '✓ Verified' : '⚠ Not Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* 2FA Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-600 mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            user?.twoFactorEnabled
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {!user?.twoFactorEnabled && !showSetup2FA && (
          <div>
            <p className="text-gray-600 mb-4">
              Protect your account with 2FA. You'll need to enter a code from your authenticator app when you log in.
            </p>
            <button
              onClick={handleSetup2FA}
              disabled={isLoading}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition"
            >
              {isLoading ? 'Setting up...' : 'Enable 2FA'}
            </button>
          </div>
        )}

        {user?.twoFactorEnabled && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="font-medium text-green-800">2FA is Active</p>
                  <p className="text-sm text-green-700">Your account is protected with two-factor authentication</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleDisable2FA}
              disabled={isLoading}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
            >
              {isLoading ? 'Disabling...' : 'Disable 2FA'}
            </button>
          </div>
        )}

        {showSetup2FA && (
          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold text-lg mb-4">Setup Two-Factor Authentication</h3>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-700 mb-4">
                1. Scan this QR code with your authenticator app (Google Authenticator, Authy, or Microsoft Authenticator)
              </p>

              {qrCode && (
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              )}

              <p className="text-xs text-gray-600 mb-2">Or enter this code manually:</p>
              <code className="block bg-white px-3 py-2 rounded border text-sm font-mono">
                {secret}
              </code>
            </div>

            <div>
              <p className="text-sm text-gray-700 mb-2">
                2. Enter the 6-digit code from your authenticator app:
              </p>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-32 px-4 py-2 border rounded-lg text-center text-lg font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                <button
                  onClick={handleEnable2FA}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
                <button
                  onClick={() => {
                    setShowSetup2FA(false);
                    setVerificationCode('');
                    setQrCode('');
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
