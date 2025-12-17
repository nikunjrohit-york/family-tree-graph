import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async validateUser(token: string) {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Sync user with our database
      let dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!dbUser) {
        // Create user in our database if doesn't exist
        dbUser = await this.userService.createFromSupabaseUser(user);
      } else {
        // Update last login
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }

      return dbUser;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getCurrentUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        familyTrees: {
          include: {
            _count: {
              select: {
                people: true,
                relationships: true,
              },
            },
          },
        },
        sharedTrees: {
          include: {
            familyTree: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
                _count: {
                  select: {
                    people: true,
                    relationships: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
