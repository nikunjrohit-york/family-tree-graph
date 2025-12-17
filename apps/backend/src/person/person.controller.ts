import { CreatePersonDto, UpdatePersonDto } from '@family-tree/shared';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RelationshipType } from '@prisma/client';

import { PersonService } from './person.service';

@ApiTags('people')
@Controller('people')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({ status: 201, description: 'Person created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.create(createPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all people in a family tree' })
  @ApiResponse({ status: 200, description: 'People retrieved successfully' })
  findAll(@Query('treeId') treeId: string) {
    return this.personService.findAll(treeId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search people by name, email, or occupation' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  search(@Query('treeId') treeId: string, @Query('q') query: string) {
    return this.personService.searchPeople(treeId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a person by ID' })
  @ApiResponse({ status: 200, description: 'Person retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  findOne(@Param('id') id: string) {
    return this.personService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a person' })
  @ApiResponse({ status: 200, description: 'Person updated successfully' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.personService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a person' })
  @ApiResponse({ status: 204, description: 'Person deleted successfully' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  remove(@Param('id') id: string) {
    return this.personService.remove(id);
  }

  @Post(':id/family-member')
  @ApiOperation({ summary: 'Add a family member from an existing person node' })
  @ApiResponse({ status: 201, description: 'Family member added successfully' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  addFamilyMember(
    @Param('id') personId: string,
    @Body()
    body: {
      relationshipType: RelationshipType;
      newPersonData: CreatePersonDto;
    },
  ) {
    return this.personService.addFamilyMemberFromNode(
      personId,
      body.relationshipType,
      body.newPersonData,
    );
  }
}
