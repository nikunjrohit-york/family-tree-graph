import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FamilyTreeService } from './family-tree.service';
import { CreateFamilyTreeDto, UpdateFamilyTreeDto } from '@family-tree/shared';

@ApiTags('family-trees')
@Controller('family-trees')
export class FamilyTreeController {
  constructor(private readonly familyTreeService: FamilyTreeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family tree' })
  @ApiResponse({ status: 201, description: 'Family tree created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createFamilyTreeDto: CreateFamilyTreeDto) {
    return this.familyTreeService.create(createFamilyTreeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all family trees' })
  @ApiResponse({ status: 200, description: 'Family trees retrieved successfully' })
  findAll() {
    return this.familyTreeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a family tree by ID' })
  @ApiResponse({ status: 200, description: 'Family tree retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Family tree not found' })
  findOne(@Param('id') id: string) {
    return this.familyTreeService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get family tree statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Family tree not found' })
  getStats(@Param('id') id: string) {
    return this.familyTreeService.getStats(id);
  }

  @Get(':id/insights')
  @ApiOperation({ summary: 'Get family tree insights' })
  @ApiResponse({ status: 200, description: 'Insights retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Family tree not found' })
  getInsights(@Param('id') id: string) {
    return this.familyTreeService.getFamilyInsights(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a family tree' })
  @ApiResponse({ status: 200, description: 'Family tree updated successfully' })
  @ApiResponse({ status: 404, description: 'Family tree not found' })
  update(@Param('id') id: string, @Body() updateFamilyTreeDto: UpdateFamilyTreeDto) {
    return this.familyTreeService.update(id, updateFamilyTreeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a family tree' })
  @ApiResponse({ status: 204, description: 'Family tree deleted successfully' })
  @ApiResponse({ status: 404, description: 'Family tree not found' })
  remove(@Param('id') id: string) {
    return this.familyTreeService.remove(id);
  }
}