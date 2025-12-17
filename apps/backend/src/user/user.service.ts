import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User as SupabaseUser } from '@supabase/supabase-js';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createFromSupabaseUser(supabaseUser: SupabaseUser) {
    const userData = supabaseUser.user_metadata || {};
    
    return this.prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        firstName: userData.first_name || userData.firstName,
        lastName: userData.last_name || userData.lastName,
        username: userData.username,
        fullName: userData.full_name || userData.fullName || 
                 `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || null,
        dateOfBirth: userData.date_of_birth ? new Date(userData.date_of_birth) : null,
        phone: userData.phone,
        profilePicture: userData.avatar_url || userData.profilePicture,
        lastLoginAt: new Date(),
      },
    });
  }

  async updateProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
    dateOfBirth?: Date;
    profilePicture?: string;
  }) {
    const fullName = updateData.firstName && updateData.lastName 
      ? `${updateData.firstName} ${updateData.lastName}` 
      : undefined;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        fullName,
        updatedAt: new Date(),
      },
    });
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }
}