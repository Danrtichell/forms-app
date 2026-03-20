import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { QuestionDto } from './question.dto';

export class ImportQuestionnaireDto {
  @ApiPropertyOptional({
    description: 'If omitted, a new id is generated on import.',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [QuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions!: QuestionDto[];
}

export class ImportedResponseItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  answers!: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  submittedAt?: string;
}

export class ImportResponsesDto {
  @ApiProperty({ type: [ImportedResponseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportedResponseItemDto)
  responses!: ImportedResponseItemDto[];
}
