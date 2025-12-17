import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PersonModule } from './person/person.module';
import { RelationshipModule } from './relationship/relationship.module';
import { FamilyTreeModule } from './family-tree/family-tree.module';

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