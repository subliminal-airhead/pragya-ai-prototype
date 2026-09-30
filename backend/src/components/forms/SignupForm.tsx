import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextField } from './TextField';
import { routes } from '../../lib/routes';
import { useApp } from '../../context/AppContext';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please provide a valid college or personal email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = signup(fullName, email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Failed to register account.');
      } else {
        navigate(routes.onboarding.about);
      }
    }, 450);
  };

  return (
    <Card className="max-w-md w-full mx-auto border border-[#E5E6DF] bg-white p-6 sm:p-8 shadow-md rounded-2xl space-y-6">
      <CardHeader className="text-center p-0">
        <CardTitle className="text-2xl font-bold text-[#18201D]">Create Student Account</CardTitle>
        <CardDescription className="text-[#717A75] mt-1 text-xs">
          Your credentials and uploaded resume data remain strictly private to your isolated profile.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Full Legal Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Divyansh Joshi"
          required
        />
        <TextField
          label="College / Personal Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.name@university.edu"
          required
        />
        <TextField
          label="Password (min. 6 characters)"
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
          Create Free Account &amp; Onboard
        </Button>
      </form>

      <div className="p-3.5 rounded-xl border border-[#E5E6DF] bg-[#F8F8F5] flex items-start gap-2.5 text-xs text-[#717A75]">
        <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
        <p>
          Every candidate has their own persistent data store, custom ATS resume, skill gap matrix, and application pipeline.
        </p>
      </div>

      <CardFooter className="pt-4 border-t border-[#E8E8E1] flex items-center justify-between text-xs text-[#717A75]">
        <span>Already have an account?</span>
        <Link to={routes.login} className="text-[#2D6A4F] hover:underline font-bold">
          Sign In here →
        </Link>
      </CardFooter>
    </Card>
  );
};
