import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';

@Module({
  imports: [HealthModule, QuestionnairesModule],
})
export class AppModule {}
