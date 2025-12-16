import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RelationshipService } from './relationship.service';
import { CreateRelationshipDto } from '@family-tree/shared';

@ApiTags('relationships')
@Controller('relationships')
export class RelationshipController {
  constructor(private readonly relationshipService: RelationshipService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new relationship' })
  @ApiResponse({ status: 201, description: 'Relationship created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createRelationshipDto: CreateRelationshipDto) {
    return this.relationshipService.create(createRelationshipDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all relationships in a family tree' })
  @ApiResponse({ status: 200, description: 'Relationships retrieved successfully' })
  findAll(@Query('treeId') treeId: string) {
    return this.relationshipService.findAll(treeId);
  }

  @Get('person/:personId')
  @ApiOperation({ summary: 'Get all relationships for a specific person' })
  @ApiResponse({ status: 200, description: 'Person relationships retrieved successfully' })
  findPersonRelationships(@Param('personId') personId: string) {
    return this.relationshipService.findPersonRelationships(personId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a relationship' })
  @ApiResponse({ status: 204, description: 'Relationship deleted successfully' })
  @ApiResponse({ status: 404, description: 'Relationship not found' })
  remove(@Param('id') id: string) {
    return this.relationshipService.remove(id);
  }
}