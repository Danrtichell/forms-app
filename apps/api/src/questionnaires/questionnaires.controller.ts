import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import {
  ImportQuestionnaireDto,
  ImportResponsesDto,
} from './dto/import.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { QuestionnairesService } from './questionnaires.service';

@ApiTags('questionnaires')
@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly questionnaires: QuestionnairesService) {}

  @Post('import')
  @ApiOperation({ summary: 'Import questionnaire JSON (creates new or uses provided id).' })
  importQuestionnaire(@Body() dto: ImportQuestionnaireDto) {
    return this.questionnaires.importQuestionnaire(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List questionnaires' })
  list() {
    return this.questionnaires.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create questionnaire' })
  create(@Body() dto: CreateQuestionnaireDto) {
    return this.questionnaires.create(dto);
  }

  @Get(':id/responses/export')
  @ApiOperation({ summary: 'Export responses as JSON' })
  exportResponses(@Param('id') id: string) {
    return this.questionnaires.exportResponses(id);
  }

  @Post(':id/responses/import')
  @ApiOperation({ summary: 'Import responses JSON (append)' })
  importResponses(@Param('id') id: string, @Body() dto: ImportResponsesDto) {
    return this.questionnaires.importResponses(id, dto);
  }

  @Get(':id/responses')
  @ApiOperation({ summary: 'List submissions' })
  listResponses(@Param('id') id: string) {
    return this.questionnaires.listResponses(id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Basic per-question analytics' })
  analytics(@Param('id') id: string) {
    return this.questionnaires.analytics(id);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export questionnaire JSON' })
  exportQuestionnaire(@Param('id') id: string) {
    return this.questionnaires.exportQuestionnaire(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get questionnaire' })
  get(@Param('id') id: string) {
    return this.questionnaires.get(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update questionnaire' })
  update(@Param('id') id: string, @Body() dto: UpdateQuestionnaireDto) {
    return this.questionnaires.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete questionnaire and its responses' })
  remove(@Param('id') id: string) {
    this.questionnaires.remove(id);
    return { ok: true as const };
  }

  @Post(':id/publish')
  @ApiOperation({
    summary: 'Publish: issue access token for public link',
  })
  publish(@Param('id') id: string) {
    return this.questionnaires.publish(id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Revoke public access token' })
  unpublish(@Param('id') id: string) {
    return this.questionnaires.unpublish(id);
  }
}
