import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Query,
  Res,
  HttpCode,
  Post,
  Body,
} from '@nestjs/common';
import type { Response } from 'express';
import { WhatsappService } from '@modules/conversation/whatsapp/services/whatsapp.service';
import { ErrorHandler } from '@src/shared/utils/errors/handler';
import { type VerifyMode } from '@src/modules/conversation/whatsapp/domain/models/Verify';
import { type WhatsappWebhookPayload } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { ServiceValidationError } from '@src/shared/utils/errors/services';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async verify(
    @Query('hub.mode') mode: VerifyMode,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const response = await this.whatsappService.verify({
        mode,
        challenge,
        token,
      });

      return res.status(HttpStatus.OK).send(response);
    } catch (error: unknown) {
      const handler = ErrorHandler.handle(error, this.logger);
      return res.status(handler.statusCode).send(JSON.parse(handler.body));
    }
  }

  /**
   * WhatsApp webhook endpoint
   *
   * @param body Webhook payload from WhatsApp
   * @param res Express response object
   * @description
   * Receives webhook notifications from WhatsApp Business API.
   * Validates and processes incoming messages, marking them as read when supported.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Body() body: WhatsappWebhookPayload,
    @Res() res: Response
  ): Promise<Response> {
    this.logger.log(
      `Received webhook: ${JSON.stringify(body)}`,
      WhatsappController.name
    );

    try {
      const { entry } = body;

      if (!entry || entry.length === 0) {
        throw new ServiceValidationError('No entries in webhook payload');
      }

      /* Process each entry */
      for (const webhookEntry of entry) {
        this.logger.debug(
          `Processing entry ID: ${webhookEntry.id}`,
          WhatsappController.name
        );

        if (!webhookEntry.changes || webhookEntry.changes.length === 0) {
          this.logger.warn(
            `No changes in entry ${webhookEntry.id}`,
            WhatsappController.name
          );
          continue;
        }

        /* Process each change in the entry */
        for (const change of webhookEntry.changes) {
          await this.whatsappService.processChange(change);
        }
      }

      return res.sendStatus(HttpStatus.OK);
    } catch (error: unknown) {
      this.logger.error(
        'Error processing webhook',
        error instanceof Error ? error.stack : String(error)
      );

      const handler = ErrorHandler.handle(error, this.logger);
      return res.sendStatus(handler.statusCode);
    }
  }
}
