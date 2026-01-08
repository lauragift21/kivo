import { useEffect, useState, useRef } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';

export function VerifyPage() {
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const { verify } = useAuth();
  
  // Get token directly from URL search params to avoid TanStack Router issues
  const token = new URLSearchParams(window.location.search).get('token');
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      // Prevent double verification
      if (hasVerified.current) return;
      hasVerified.current = true;

      if (!token) {
        setError('Missing verification token');
        setIsVerifying(false);
        return;
      }

      try {
        await verify(token);
        // Use window.location for a full page navigation to ensure auth state is fresh
        window.location.href = '/dashboard';
      } catch (err: any) {
        setError(err.message || 'Failed to verify token');
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, verify]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle>Verifying your link</CardTitle>
            <CardDescription>Please wait while we sign you in...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Verification failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              The link may have expired or already been used. Please request a new sign-in link.
            </p>
            <Button className="w-full" onClick={() => window.location.href = '/auth/signin'}>
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
