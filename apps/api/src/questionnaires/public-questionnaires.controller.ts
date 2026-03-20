import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PublicQueryDto, SubmitResponseDto } from './dto/submit-response.dto';
import { QuestionnairesService } from './questionnaires.service';

@ApiTags('public')
@Controller('public/questionnaires')
export class PublicQuestionnairesController {
  constructor(private readonly questionnaires: QuestionnairesService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Load questionnaire for filling (requires publish token).',
  })
  getForFill(@Param('id') id: string, @Query() query: PublicQueryDto) {
    return this.questionnaires.getPublicDefinition(id, query.access_token);
  }

  @Post(':id/responses')
  @ApiOperation({ summary: 'Submit answers for a published questionnaire.' })
  submit(
    @Param('id') id: string,
    @Body() body: SubmitResponseDto,
  ) {
    return this.questionnaires.submitResponse(id, body);
  }
}
