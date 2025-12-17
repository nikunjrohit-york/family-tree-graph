import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { FamilyTreeModule } from './family-tree/family-tree.module';
import { PersonModule } from './person/person.module';
import { PrismaModule } from './prisma/prisma.module';
import { RelationshipModule } from './relationship/relationship.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    PersonModule,
    RelationshipModule,
    FamilyTreeModule,
  ],
})
export class AppModule {}
