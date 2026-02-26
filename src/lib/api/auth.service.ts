// src/lib/api/auth.service.ts
import { apiClient } from './config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  phone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'cashier' | 'operator';
  company_id: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

class AuthService {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Tentative de connexion avec:', { 
        email: credentials.email,
        password: credentials.password ? '***' : 'manquant'
      });
      
      // Vérification des données avant envoi
      if (!credentials.email || !credentials.password) {
        console.error('❌ Email ou mot de passe manquant');
        throw new Error('Email et mot de passe requis');
      }
      
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      console.log('✅ Réponse API reçue:', {
        status: response.status,
        success: response.data?.success,
        hasToken: !!response.data?.data?.token,
        message: response.data?.message
      });
      
      // Stocker le token et l'utilisateur en cas de succès
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('💾 Token et utilisateur stockés');
      } else {
        console.warn('⚠️ Réponse API sans token:', response.data);
      }
      
      return response.data;
      
    } catch (error: any) {
      // Log détaillé de l'erreur
      console.error('❌ Login error - Détails complets:');
      
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'erreur
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        console.error('Données reçues:', error.response.data);
        
        // Afficher le message d'erreur spécifique si disponible
        if (error.response.data?.message) {
          console.error('Message serveur:', error.response.data.message);
        }
        if (error.response.data?.errors) {
          console.error('Erreurs de validation:', error.response.data.errors);
        }
        
        throw new Error(error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`);
        
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        console.error('Aucune réponse reçue du serveur');
        console.error('Requête:', error.request);
        throw new Error('Le serveur ne répond pas. Vérifiez votre connexion.');
        
      } else {
        // Erreur lors de la configuration de la requête
        console.error('Erreur de configuration:', error.message);
        throw error;
      }
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 Tentative d\'inscription:', { 
        name: data.name,
        email: data.email,
        companyName: data.companyName,
        phone: data.phone || 'non fourni'
      });
      
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('✅ Inscription réussie');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Register error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Récupérer l'utilisateur courant
   */
  async getCurrentUser(): Promise<{ success: boolean; data: User }> {
    try {
      console.log('👤 Récupération de l\'utilisateur courant');
      const response = await apiClient.get('/auth/me');
      
      if (response.data.success && response.data.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        console.log('✅ Utilisateur récupéré:', response.data.data.email);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get current user error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔑 Tentative de changement de mot de passe');
      const response = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Change password error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 Déconnexion');
      await apiClient.post('/auth/logout');
    } catch (error: any) {
      console.error('Logout error:', error.response?.data || error.message);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      console.log('✅ Déconnecté, localStorage nettoyé');
    }
  }

  /**
   * Mot de passe oublié
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('📧 Demande de réinitialisation pour:', email);
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('❌ Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔄 Réinitialisation du mot de passe');
      const response = await apiClient.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error: any) {
      console.error('❌ Reset password error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Rafraîchir le token
   */
  async refreshToken(): Promise<{ success: boolean; data?: { token: string } }> {
    try {
      console.log('🔄 Rafraîchissement du token');
      const response = await apiClient.post('/auth/refresh');
      
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
        console.log('✅ Token rafraîchi');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Refresh token error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const hasToken = !!localStorage.getItem('authToken');
    console.log('🔐 Vérification authentification:', hasToken);
    return hasToken;
  }

  /**
   * Récupérer l'utilisateur depuis localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr) as User;
      console.log('👤 Utilisateur stocké:', user.email);
      return user;
    } catch {
      console.error('❌ Erreur parsing utilisateur stocké');
      return null;
    }
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(requiredRole: string | string[]): boolean {
    const user = this.getStoredUser();
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Vérifier si l'utilisateur est superviseur
   */
  isSupervisor(): boolean {
    return this.hasRole(['admin', 'supervisor']);
  }
}

export const authService = new AuthService();