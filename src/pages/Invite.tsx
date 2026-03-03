import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Invite landing page: captures referral code from ?ref= and sends the referee
 * to the login page with ref preserved. From login they can "Sign up" and the
 * ref is passed to register so the referral is applied on signup.
 *
 * Example: /invite?ref=BRIQ-AU9D-52ZQ → redirect to /login?ref=BRIQ-AU9D-52ZQ
 */
const Invite: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (ref && ref.trim()) {
      navigate(`/login?ref=${encodeURIComponent(ref.trim())}`, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, ref]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00333e]">
      <p className="text-white/80">Taking you to login…</p>
    </div>
  );
};

export default Invite;
