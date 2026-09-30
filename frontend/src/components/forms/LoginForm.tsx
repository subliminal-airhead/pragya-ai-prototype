import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextField } from './TextField';
import { routes } from '../../lib/routes';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('divyansh.joshi@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) {
      setError('Please provide a valid college or personal email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      } else {
        navigate(routes.dashboard);
      }
    }, 450);
  };

  const setDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <Card className="max-w-md w-full mx-auto border border-[#E5E6DF] bg-white p-6 sm:p-8 shadow-md rounded-2xl space-y-6">
      <CardHeader className="text-center p-0">
        <CardTitle className="text-2xl font-bold text-[#18201D]">Sign In to Campus to Corporate</CardTitle>
        <CardDescription className="text-[#717A75] mt-1 text-xs">
          Each account maintains its own isolated resume, verified skills, and job tracking pipeline.
        </CardDescription>
      </CardHeader>

      {/* Demo Accounts Quick-Fill Strip */}
      <div className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E5E6DF] space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-[#717A75] font-semibold">
          <Sparkles className="w-3 h-3 text-[#D4A347]" />
          <span>Quick Sign In with Demo Personas:</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setDemoAccount('divyansh.joshi@example.com', 'password123')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
              email === 'divyansh.joshi@example.com'
                ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/40'
                : 'bg-white text-[#717A75] hover:text-[#18201D] border-[#E5E6DF]'
            }`}
          >
            Divyansh (B.Tech)
          </button>
          <button
            type="button"
            onClick={() => setDemoAccount('pooja.sharma@example.com', 'password123')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
              email === 'pooja.sharma@example.com'
                ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/40'
                : 'bg-white text-[#717A75] hover:text-[#18201D] border-[#E5E6DF]'
            }`}
          >
            Pooja (B.Com)
          </button>
          <button
            type="button"
            onClick={() => setDemoAccount('rahul.verma@example.com', 'password123')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
              email === 'rahul.verma@example.com'
                ? 'bg-[#EBF3EE] text-[#2D6A4F] border-[#2D6A4F]/40'
                : 'bg-white text-[#717A75] hover:text-[#18201D] border-[#E5E6DF]'
            }`}
          >
            Rahul (Diploma)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.name@university.edu"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          iconRight={<ArrowRight className="w-4 h-4" />}
          className="w-full mt-2"
        >
          Sign In to Your Account
        </Button>
      </form>

      <CardFooter className="pt-4 border-t border-[#E8E8E1] flex items-center justify-between text-xs text-[#717A75]">
        <span>New candidate?</span>
        <Link to={routes.signup} className="text-[#2D6A4F] hover:underline font-bold">
          Create student account →
        </Link>
      </CardFooter>
    </Card>
  );
};
