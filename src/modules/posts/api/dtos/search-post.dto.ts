import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchPostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  q: string;
}
