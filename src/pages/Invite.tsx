import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Invite landing: captures ?ref= and sends the referee straight to signup
 * so the referral code is pre-filled and applied when they register.
 *
 * Example: /invite?ref=BRIQ-AU9D-52ZQ → redirect to /register?ref=BRIQ-AU9D-52ZQ
 */
const Invite: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (ref && ref.trim()) {
      navigate(`/register?ref=${encodeURIComponent(ref.trim())}`, { replace: true });
    } else {
      navigate('/register', { replace: true });
    }
  }, [navigate, ref]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00333e]">
      <p className="text-white/80">Taking you to sign up…</p>
    </div>
  );
};

export default Invite;
