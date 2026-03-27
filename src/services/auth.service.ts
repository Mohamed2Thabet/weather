import { User } from '@/types';

// Mock authentication service
// In production, this would call a real backend API
export class AuthService {
  static async login(email: string, password: string): Promise<User> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock validation - accept any email/password with min length
    if (password.length < 6) {
      throw new Error('Invalid credentials');
    }

    // Return mock user
    return {
      email,
      name: email.split('@')[0],
    };
  }

  static async logout(): Promise<void> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}
