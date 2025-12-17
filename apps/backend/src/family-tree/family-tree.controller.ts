import { CreateFamilyTreeDto, UpdateFamilyTreeDto } from '@family-tree/shared';
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

import { FamilyTreeService } from './family-tree.service';

@ApiTags('family-trees')
@Controller('family-trees')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FamilyTreeController {
  constructor(private readonly familyTreeService: FamilyTreeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family tree' })
  @ApiResponse({ status: 201, description: 'Family tree created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createFamilyTreeDto: CreateFamilyTreeDto,
    @CurrentUser() userId: string,
  ) {
    return this.familyTreeService.create(createFamilyTreeDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accessible family trees' })
  @ApiResponse({
    status: 200,
    description: 'Family trees retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() userId: string) {
    return this.familyTreeService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a family tree by ID' })
  @ApiResponse({
    status: 200,
    description: 'Family tree retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Family tree not found or access denied',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.familyTreeService.findOne(id, userId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get family tree statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Family tree not found or access denied',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@Param('id') id: string, @CurrentUser() userId: string) {
    // First check access
    await this.familyTreeService.findOne(id, userId);
    return this.familyTreeService.getStats(id);
  }

  @Get(':id/insights')
  @ApiOperation({ summary: 'Get family tree insights' })
  @ApiResponse({ status: 200, description: 'Insights retrieved successfully' })
  @ApiResponse({
    status: 404,
    description: 'Family tree not found or access denied',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInsights(@Param('id') id: string, @CurrentUser() userId: string) {
    // First check access
    await this.familyTreeService.findOne(id, userId);
    return this.familyTreeService.getFamilyInsights(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a family tree' })
  @ApiResponse({ status: 200, description: 'Family tree updated successfully' })
  @ApiResponse({
    status: 404,
    description: 'Family tree not found or access denied',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateFamilyTreeDto: UpdateFamilyTreeDto,
    @CurrentUser() userId: string,
  ) {
    // First check access
    await this.familyTreeService.findOne(id, userId);
    return this.familyTreeService.update(id, updateFamilyTreeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a family tree' })
  @ApiResponse({ status: 204, description: 'Family tree deleted successfully' })
  @ApiResponse({
    status: 404,
    description: 'Family tree not found or access denied',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @CurrentUser() userId: string) {
    // First check access
    await this.familyTreeService.findOne(id, userId);
    return this.familyTreeService.remove(id);
  }
}
