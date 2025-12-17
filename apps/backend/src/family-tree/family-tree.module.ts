import { Module } from '@nestjs/common';

import { FamilyTreeController } from './family-tree.controller';
import { FamilyTreeService } from './family-tree.service';

@Module({
  controllers: [FamilyTreeController],
  providers: [FamilyTreeService],
  exports: [FamilyTreeService],
})
export class FamilyTreeModule {}
