import { useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Box } from '@mui/material';

interface ReCaptchaProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
}

export interface ReCaptchaRef {
  reset: () => void;
}

const ReCaptchaComponent = forwardRef<ReCaptchaRef, ReCaptchaProps>(({ 
  siteKey, 
  onChange, 
  onError,
  theme = 'light' 
}, ref) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Expose reset function via ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      recaptchaRef.current?.reset();
    }
  }));

  if (!siteKey || siteKey === '') {
    return null; // Don't render if site key is not configured
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={onChange}
        theme={theme}
        size="normal"
      />
    </Box>
  );
});

ReCaptchaComponent.displayName = 'ReCaptchaComponent';

export default ReCaptchaComponent;

