import { Injectable } from '@nestjs/common';

import { UserService, CreateUserRequestDTO } from '../users';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
  ) {}

  auth(createUserRequestDTO: CreateUserRequestDTO) {
    return this.usersService.findOrCreate(createUserRequestDTO);
  }
}
