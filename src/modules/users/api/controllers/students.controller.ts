import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CreateUserService } from '@modules/users/core/services/create-user.service';
import { GetUserService } from '@modules/users/core/services/get-user.service';
import { ListUsersService } from '@modules/users/core/services/list-users.service';
import { UpdateUserService } from '@modules/users/core/services/update-user.service';
import { DeleteUserService } from '@modules/users/core/services/delete-user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { ListUsersDto } from '../dtos/list-users.dto';
import {
  ListUsersResponseDto,
  UserResponseDto,
} from '../dtos/user-response.dto';

@Controller('users/students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROFESSOR')
export class StudentsController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUserService: GetUserService,
    private readonly listUsersService: ListUsersService,
    private readonly updateUserService: UpdateUserService,
    private readonly deleteUserService: DeleteUserService,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserService.execute({
      ...dto,
      role: 'ALUNO',
    });
    return UserResponseDto.fromDomain(user);
  }

  @Get()
  async findAll(@Query() query: ListUsersDto): Promise<ListUsersResponseDto> {
    const result = await this.listUsersService.execute({
      role: 'ALUNO',
      page: query.page,
      limit: query.limit,
    });
    return {
      data: result.data.map((user) => UserResponseDto.fromDomain(user)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.getUserService.execute({
      id,
      expectedRole: 'ALUNO',
    });
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUserService.execute({
      id,
      expectedRole: 'ALUNO',
      name: dto.name,
      email: dto.email,
    });
    return UserResponseDto.fromDomain(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteUserService.execute({ id, expectedRole: 'ALUNO' });
  }
}
