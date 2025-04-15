import {
  Controller,
  Body,
  Post,
  Req,
  Get,
  UseGuards,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

import {
  CreateCardRequestDTO,
  CardResponseDTO,
  UpdateCardRequestDTO,
  UpdateCardPositionRequestDTO,
  UpdateCardPositionResponseDTO,
  CardParamsDTO,
  CardIdParamDTO,
  CourseIdParamDTO,
} from './dto';
import { CardsService } from './cards.service';

@ApiTags('Cards')
@Controller()
export class CardsController {
  constructor(
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly cardService: CardsService,
  ) {}

  @Post('/courses/:courseId/cards')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a card' })
  @ApiResponse({
    status: 201,
    description: 'Returns the created card',
    type: CardResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'courseId', required: true })
  createCard(
    @Param() params: CourseIdParamDTO,
    @Req() req: Request & { user: { sub: string } },
    @Body() createCardRequestDTO: CreateCardRequestDTO,
  ): Promise<CardResponseDTO> {
    return this.cardService.createCard(
      params.courseId,
      createCardRequestDTO,
      req.user.sub,
    );
  }

  @Get('/courses/:courseId/cards')
  @ApiOperation({ summary: 'Get cards' })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    type: [CardResponseDTO],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'courseId', required: true })
  getCards(
    @Req() req: Request & { user: { sub: string } },
    @Param() params: CourseIdParamDTO,
  ): Promise<CardResponseDTO[]> {
    return this.cardService.getCards(params.courseId, req.user.sub);
  }

  @Patch('/courses/:courseId/cards/:cardId/change-position')
  @ApiOperation({ summary: 'Update a card position' })
  @ApiResponse({
    status: 200,
    description: 'Successful updated cards position',
    type: [CardResponseDTO],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'courseId', required: true })
  @ApiParam({ name: 'cardId', required: true })
  updateCardPosition(
    @Req() req: Request & { user: { sub: string } },
    @Param() params: CardParamsDTO,
    @Body() updateCardPositionRequestDTO: UpdateCardPositionRequestDTO,
  ): Promise<UpdateCardPositionResponseDTO[]> {
    return this.cardService.updateCardPosition(
      params.courseId,
      params.cardId,
      updateCardPositionRequestDTO,
      req.user.sub,
    );
  }

  @Patch('/cards/:cardId')
  @ApiOperation({ summary: 'Update a card' })
  @ApiResponse({
    status: 200,
    description: 'Successful updated card response',
    type: CardResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden card deletion for a user',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    required: true,
    name: 'cardId',
    description: 'The cardId of the card to update',
  })
  updateCard(
    @Req() req: Request & { user: { sub: string } },
    @Body() updateCardRequestDTO: UpdateCardRequestDTO,
    @Param() params: CardIdParamDTO,
  ): Promise<CardResponseDTO> {
    return this.cardService.updateCard(
      params.cardId,
      updateCardRequestDTO,
      req.user.sub,
    );
  }

  @Delete('/courses/:courseId/cards/:cardId')
  @ApiOperation({ summary: 'Delete card by cardId' })
  @ApiResponse({
    status: 200,
    description: 'The card successful deleted',
    type: CardResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden card deletion for the user',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({
    required: true,
    name: 'cardId',
    description: 'The cardId of the card to delete',
  })
  deleteCard(
    @Req() req: Request & { user: { sub: string } },
    @Param() params: CardParamsDTO,
  ): Promise<{ message: string; statusCode: 200 }> {
    return this.cardService.deleteCard(params.courseId, params.cardId, req.user.sub);
  }
}
