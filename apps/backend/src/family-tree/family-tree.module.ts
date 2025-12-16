import { Module } from '@nestjs/common';
import { FamilyTreeService } from './family-tree.service';
import { FamilyTreeController } from './family-tree.controller';

@Module({
  controllers: [FamilyTreeController],
  providers: [FamilyTreeService],
  exports: [FamilyTreeService],
})
export class FamilyTreeModule {}