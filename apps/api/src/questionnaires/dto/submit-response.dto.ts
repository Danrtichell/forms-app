import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class SubmitResponseDto {
  @ApiProperty({ description: 'Must match the token issued when publishing.' })
  @IsString()
  access_token!: string;

  @ApiProperty({
    description: 'Map of question id to answer value.',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  answers!: Record<string, unknown>;
}

export class PublicQueryDto {
  @ApiProperty()
  @IsString()
  access_token!: string;
}
