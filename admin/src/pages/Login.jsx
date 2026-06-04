import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../common/AuthContext.jsx';
import { Mail, KeyRound } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState(1); // 1 = email/password, 2 = OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [adminId, setAdminId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      setAdminId(data.adminId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOtp(adminId, otp);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg overflow-hidden">
            <img src="/logo.png" alt="Investors World Realty" className="w-full h-full object-cover" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">
            Investors World Realty
          </h1>
          <p className="mt-1 text-sm text-gray-300">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="rounded-xl bg-white p-8 shadow-2xl">
          {step === 1 ? (
            <>
              <h2 className="mb-6 text-xl font-semibold text-gray-800">
                Sign in to your account
              </h2>
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gold-500 py-2.5 text-sm font-semibold text-white hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="mb-2 text-xl font-semibold text-gray-800">
                Verify OTP
              </h2>
              <p className="mb-6 text-sm text-gray-500">
                Enter the 6-digit code sent to your registered email/phone.
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* OTP */}
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    OTP Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full rounded-lg border border-gray-300 py-2.5 px-4 text-center text-lg tracking-widest focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gold-500 py-2.5 text-sm font-semibold text-white hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                  }}
                  className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
