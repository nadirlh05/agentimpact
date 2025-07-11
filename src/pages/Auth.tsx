
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Icône Google personnalisée en SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle, resetPassword, updatePassword } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', fullName: '', confirmPassword: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [newPasswordData, setNewPasswordData] = useState({ password: '', confirmPassword: '' });
  const [defaultTab, setDefaultTab] = useState('login');
  const [showNewPasswordTab, setShowNewPasswordTab] = useState(false);

  const from = location.state?.from?.pathname || '/generator';

  // Check for password reset URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1)); // Remove the # and parse
    
    const isReset = urlParams.get('reset');
    const isError = urlParams.get('error');
    const typeParam = urlParams.get('type');
    const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token');
    const type = hashParams.get('type');
    
    // URL params checked
    
    // Handle expired or invalid reset links
    if (isError === 'expired') {
      toast({
        title: "Lien expiré",
        description: "Le lien de réinitialisation du mot de passe a expiré. Veuillez en demander un nouveau.",
        variant: "destructive",
      });
      setDefaultTab('reset');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    // Si on détecte le paramètre type=recovery ou des tokens de récupération
    const isPasswordRecovery = typeParam === 'recovery' || (accessToken && refreshToken && type === 'recovery') || isReset === 'true';
    
    if (isPasswordRecovery) {
      // Password recovery flow detected
      setShowNewPasswordTab(true);
      setDefaultTab('new-password');
      
      // Si on a des tokens, on établit la session silencieusement
      if (accessToken && refreshToken && type === 'recovery') {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        }).then(({ error }) => {
          if (error) {
            // Error setting session
            toast({
              title: "Erreur",
              description: "Impossible de valider le lien de réinitialisation.",
              variant: "destructive",
            });
          } else {
            // Session set successfully
            // Clean up URL by removing hash parameters but keep type=recovery
            window.history.replaceState({}, document.title, window.location.pathname + '?type=recovery');
          }
        });
      }
    }
  }, [location.search, location.hash, toast]);

  // Effet supplémentaire pour s'assurer que l'onglet reste sur "nouveau mot de passe"
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('type') === 'recovery' || urlParams.get('reset') === 'true') {
      setShowNewPasswordTab(true);
      setDefaultTab('new-password');
    }
  }, [location.search]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Erreur de connexion",
            description: "Email ou mot de passe incorrect.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur de connexion",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Connexion réussie !",
          description: "Vous êtes maintenant connecté.",
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(signupData.email, signupData.password, signupData.fullName);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Compte existant",
            description: "Un compte avec cet email existe déjà. Essayez de vous connecter.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur d'inscription",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Inscription réussie !",
          description: "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
        });
        // Reset form and switch to login tab
        setSignupData({ email: '', password: '', fullName: '', confirmPassword: '' });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email envoyé !",
          description: "Vérifiez votre boîte email pour réinitialiser votre mot de passe.",
        });
        setResetEmail('');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de l'email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPasswordData.password !== newPasswordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (newPasswordData.password.length < 6) {
      toast({
        title: "Erreur", 
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(newPasswordData.password);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Mot de passe mis à jour !",
          description: "Votre mot de passe a été changé avec succès.",
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du mot de passe.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
      }
      // Si pas d'erreur, la redirection sera gérée par Supabase
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion avec Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Button>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Générateur IA
            </span>
          </div>
          <p className="text-gray-600">Connectez-vous pour accéder au générateur</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentification</CardTitle>
            <CardDescription>
              Connectez-vous à votre compte ou créez-en un nouveau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={defaultTab} onValueChange={setDefaultTab} className="space-y-4">
              <TabsList className={`grid w-full ${showNewPasswordTab ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
                <TabsTrigger value="reset">Mot de passe</TabsTrigger>
                {showNewPasswordTab && (
                  <TabsTrigger value="new-password">Nouveau mot de passe</TabsTrigger>
                )}
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="votre.email@exemple.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>

                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-muted"></div>
                  <span className="px-3 text-sm text-muted-foreground">ou</span>
                  <div className="flex-1 border-t border-muted"></div>
                </div>

                <Button 
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2 border-gray-300 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  <span>Se connecter avec Google</span>
                </Button>
                
                <div className="text-center mt-4">
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => {
                      const resetTab = document.querySelector('[value="reset"]') as HTMLElement;
                      resetTab?.click();
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Mot de passe oublié ?
                  </Button>
                </div>
              </TabsContent>

              {/* Reset Password Tab */}
              <TabsContent value="reset">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium">Réinitialiser votre mot de passe</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Entrez votre email pour recevoir un lien de réinitialisation
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="votre.email@exemple.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                  </Button>
                </form>
                
                <div className="text-center mt-4">
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setDefaultTab('login')}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Retour à la connexion
                  </Button>
                </div>
              </TabsContent>

              {/* New Password Tab - Only shown when coming from reset link */}
              {showNewPasswordTab && (
                <TabsContent value="new-password">
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-medium">Nouveau mot de passe</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Entrez votre nouveau mot de passe
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="••••••••"
                          value={newPasswordData.password}
                          onChange={(e) => setNewPasswordData({ ...newPasswordData, password: e.target.value })}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">Confirmer le nouveau mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-new-password"
                          type="password"
                          placeholder="••••••••"
                          value={newPasswordData.confirmPassword}
                          onChange={(e) => setNewPasswordData({ ...newPasswordData, confirmPassword: e.target.value })}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                    </Button>
                  </form>
                </TabsContent>
              )}

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Votre nom complet"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="votre.email@exemple.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Création du compte..." : "Créer un compte"}
                  </Button>
                </form>

                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-muted"></div>
                  <span className="px-3 text-sm text-muted-foreground">ou</span>
                  <div className="flex-1 border-t border-muted"></div>
                </div>

                <Button 
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2 border-gray-300 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  <span>S'inscrire avec Google</span>
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
