import { Module } from '@nestjs/common';

import { PublicQuestionnairesController } from './public-questionnaires.controller';
import { QuestionnairesController } from './questionnaires.controller';
import { QuestionnairesService } from './questionnaires.service';

@Module({
  controllers: [QuestionnairesController, PublicQuestionnairesController],
  providers: [QuestionnairesService],
  exports: [QuestionnairesService],
})
export class QuestionnairesModule {}
