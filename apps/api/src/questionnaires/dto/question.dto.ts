import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

const QUESTION_TYPES = [
  'short_text',
  'long_text',
  'single_choice',
  'multiple_choice',
  'number',
  'date',
] as const;

export class QuestionDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty({ enum: QUESTION_TYPES })
  @IsIn([...QUESTION_TYPES])
  type!: (typeof QUESTION_TYPES)[number];

  @ApiProperty()
  @IsString()
  label!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @ValidateIf((q) =>
    ['single_choice', 'multiple_choice'].includes(q.type as string),
  )
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeholder?: string;
}
