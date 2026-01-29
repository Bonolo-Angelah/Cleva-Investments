import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../utils/store';
import { authAPI } from '../services/api';
import { FiUser, FiSave } from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    country: user?.country || '',
    currency: user?.currency || 'USD',
    riskTolerance: user?.riskTolerance || 'moderate',
    investmentExperience: user?.investmentExperience || 'beginner'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Country to currency mapping - Complete mapping for all 51 countries
  const countryCurrencyMap = {
    // Africa
    'ZA': 'ZAR', 'NG': 'NGN', 'KE': 'KES', 'GH': 'GHS', 'EG': 'EGP',
    'TZ': 'TZS', 'UG': 'UGX', 'ZW': 'ZWL', 'BW': 'BWP', 'ET': 'ETB',
    'MA': 'MAD', 'TN': 'TND',
    // Americas
    'US': 'USD', 'CA': 'CAD', 'BR': 'BRL', 'MX': 'MXN', 'AR': 'ARS',
    'CL': 'CLP', 'CO': 'COP', 'PE': 'PEN',
    // Asia & Pacific
    'CN': 'CNY', 'IN': 'INR', 'JP': 'JPY', 'AU': 'AUD', 'NZ': 'NZD',
    'SG': 'SGD', 'HK': 'HKD', 'KR': 'KRW', 'TH': 'THB', 'MY': 'MYR',
    'ID': 'IDR', 'PH': 'PHP', 'VN': 'VND', 'PK': 'PKR', 'BD': 'BDT',
    // Europe
    'GB': 'GBP', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK',
    'PL': 'PLN', 'TR': 'TRY', 'RU': 'RUB',
    'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
    // Middle East
    'AE': 'AED', 'SA': 'SAR', 'IL': 'ILS'
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    const detectedCurrency = countryCurrencyMap[selectedCountry] || 'USD';
    setFormData({
      ...formData,
      country: selectedCountry,
      currency: detectedCurrency
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <FiUser className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="+27 12 345 6789"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={formData.country}
                onChange={handleCountryChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                <option value="">Select Your Country</option>

                <optgroup label="🌍 Africa">
                  <option value="ZA">South Africa (ZAR)</option>
                  <option value="NG">Nigeria (NGN)</option>
                  <option value="KE">Kenya (KES)</option>
                  <option value="GH">Ghana (GHS)</option>
                  <option value="EG">Egypt (EGP)</option>
                  <option value="TZ">Tanzania (TZS)</option>
                  <option value="UG">Uganda (UGX)</option>
                  <option value="ZW">Zimbabwe (ZWL)</option>
                  <option value="BW">Botswana (BWP)</option>
                  <option value="ET">Ethiopia (ETB)</option>
                  <option value="MA">Morocco (MAD)</option>
                  <option value="TN">Tunisia (TND)</option>
                </optgroup>

                <optgroup label="🌎 Americas">
                  <option value="US">United States (USD)</option>
                  <option value="CA">Canada (CAD)</option>
                  <option value="BR">Brazil (BRL)</option>
                  <option value="MX">Mexico (MXN)</option>
                  <option value="AR">Argentina (ARS)</option>
                  <option value="CL">Chile (CLP)</option>
                  <option value="CO">Colombia (COP)</option>
                  <option value="PE">Peru (PEN)</option>
                </optgroup>

                <optgroup label="🌏 Asia & Pacific">
                  <option value="CN">China (CNY)</option>
                  <option value="IN">India (INR)</option>
                  <option value="JP">Japan (JPY)</option>
                  <option value="AU">Australia (AUD)</option>
                  <option value="NZ">New Zealand (NZD)</option>
                  <option value="SG">Singapore (SGD)</option>
                  <option value="HK">Hong Kong (HKD)</option>
                  <option value="KR">South Korea (KRW)</option>
                  <option value="TH">Thailand (THB)</option>
                  <option value="MY">Malaysia (MYR)</option>
                  <option value="ID">Indonesia (IDR)</option>
                  <option value="PH">Philippines (PHP)</option>
                  <option value="VN">Vietnam (VND)</option>
                  <option value="PK">Pakistan (PKR)</option>
                  <option value="BD">Bangladesh (BDT)</option>
                </optgroup>

                <optgroup label="🌍 Europe">
                  <option value="GB">United Kingdom (GBP)</option>
                  <option value="DE">Germany (EUR)</option>
                  <option value="FR">France (EUR)</option>
                  <option value="IT">Italy (EUR)</option>
                  <option value="ES">Spain (EUR)</option>
                  <option value="NL">Netherlands (EUR)</option>
                  <option value="CH">Switzerland (CHF)</option>
                  <option value="SE">Sweden (SEK)</option>
                  <option value="NO">Norway (NOK)</option>
                  <option value="DK">Denmark (DKK)</option>
                  <option value="PL">Poland (PLN)</option>
                  <option value="TR">Turkey (TRY)</option>
                  <option value="RU">Russia (RUB)</option>
                </optgroup>

                <optgroup label="🌏 Middle East">
                  <option value="AE">UAE (AED)</option>
                  <option value="SA">Saudi Arabia (SAR)</option>
                  <option value="IL">Israel (ILS)</option>
                </optgroup>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Your country determines your preferred currency
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                <option value="">Select Currency</option>

                <optgroup label="💵 Major Currencies">
                  <option value="USD">$ USD - US Dollar</option>
                  <option value="EUR">€ EUR - Euro</option>
                  <option value="GBP">£ GBP - British Pound</option>
                  <option value="JPY">¥ JPY - Japanese Yen</option>
                  <option value="CHF">Fr CHF - Swiss Franc</option>
                </optgroup>

                <optgroup label="🌍 African Currencies">
                  <option value="ZAR">R ZAR - South African Rand</option>
                  <option value="NGN">₦ NGN - Nigerian Naira</option>
                  <option value="KES">KSh KES - Kenyan Shilling</option>
                  <option value="GHS">₵ GHS - Ghanaian Cedi</option>
                  <option value="EGP">E£ EGP - Egyptian Pound</option>
                  <option value="TZS">TSh TZS - Tanzanian Shilling</option>
                  <option value="UGX">USh UGX - Ugandan Shilling</option>
                  <option value="ZWL">Z$ ZWL - Zimbabwean Dollar</option>
                  <option value="BWP">P BWP - Botswana Pula</option>
                  <option value="ETB">Br ETB - Ethiopian Birr</option>
                  <option value="MAD">DH MAD - Moroccan Dirham</option>
                  <option value="TND">DT TND - Tunisian Dinar</option>
                </optgroup>

                <optgroup label="🌎 American Currencies">
                  <option value="CAD">C$ CAD - Canadian Dollar</option>
                  <option value="BRL">R$ BRL - Brazilian Real</option>
                  <option value="MXN">$ MXN - Mexican Peso</option>
                  <option value="ARS">$ ARS - Argentine Peso</option>
                  <option value="CLP">$ CLP - Chilean Peso</option>
                  <option value="COP">$ COP - Colombian Peso</option>
                  <option value="PEN">S/ PEN - Peruvian Sol</option>
                </optgroup>

                <optgroup label="🌏 Asia & Pacific Currencies">
                  <option value="CNY">¥ CNY - Chinese Yuan</option>
                  <option value="INR">₹ INR - Indian Rupee</option>
                  <option value="AUD">A$ AUD - Australian Dollar</option>
                  <option value="NZD">NZ$ NZD - New Zealand Dollar</option>
                  <option value="SGD">S$ SGD - Singapore Dollar</option>
                  <option value="HKD">HK$ HKD - Hong Kong Dollar</option>
                  <option value="KRW">₩ KRW - South Korean Won</option>
                  <option value="THB">฿ THB - Thai Baht</option>
                  <option value="MYR">RM MYR - Malaysian Ringgit</option>
                  <option value="IDR">Rp IDR - Indonesian Rupiah</option>
                  <option value="PHP">₱ PHP - Philippine Peso</option>
                  <option value="VND">₫ VND - Vietnamese Dong</option>
                  <option value="PKR">₨ PKR - Pakistani Rupee</option>
                  <option value="BDT">৳ BDT - Bangladeshi Taka</option>
                </optgroup>

                <optgroup label="🌍 European Currencies">
                  <option value="SEK">kr SEK - Swedish Krona</option>
                  <option value="NOK">kr NOK - Norwegian Krone</option>
                  <option value="DKK">kr DKK - Danish Krone</option>
                  <option value="PLN">zł PLN - Polish Zloty</option>
                  <option value="TRY">₺ TRY - Turkish Lira</option>
                  <option value="RUB">₽ RUB - Russian Ruble</option>
                </optgroup>

                <optgroup label="🌏 Middle East Currencies">
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="SAR">SR SAR - Saudi Riyal</option>
                  <option value="ILS">₪ ILS - Israeli Shekel</option>
                </optgroup>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Investments will be shown in this currency
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Tolerance
              </label>
              <select
                value={formData.riskTolerance}
                onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Determines the types of investments recommended
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Experience
              </label>
              <select
                value={formData.investmentExperience}
                onChange={(e) => setFormData({ ...formData, investmentExperience: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Your level of investment knowledge
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 transition"
            >
              <FiSave />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Member Since</span>
            <span className="font-semibold text-gray-800">
              {new Date(user?.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Last Login</span>
            <span className="font-semibold text-gray-800">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Account Status</span>
            <span className="font-semibold text-green-600">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
