import { Module } from '@nestjs/common';
import { DatabaseModule } from '@shared/persistence/mongo/database.module';
import { WhatsappController } from './whatsapp/controllers/whatsapp.controller';
import { WhatsappService } from './whatsapp/services/whatsapp.service';
import { WhatsAppApiService } from './whatsapp/services/whatsapp-api.service';
import { ClientSchemaResolverService } from './whatsapp/services/client-schema-resolver.service';
import { ConversationStorageService } from './whatsapp/services/conversation-storage.service';
import { MessageStorageService } from './whatsapp/services/message-storage.service';
import { BotInteractionService } from './whatsapp/services/bot-interaction.service';
import { MessageProcessorFactory } from './whatsapp/services/message-processors/message-processor.factory';
import { AiProvidersModule } from './whatsapp/services/ai-providers/ai-providers.module';
import { ToolsModule } from './whatsapp/services/ai-providers/tools/tools.module';
import { MessageExtractorFactory } from './whatsapp/services/message-extractors/message-extractor.factory';
import { ProductMediaService } from './whatsapp/services/product-media.service';

@Module({
  imports: [DatabaseModule, AiProvidersModule, ToolsModule],
  providers: [
    /* Core Services */
    WhatsappService,
    ClientSchemaResolverService,

    /* WhatsApp Business API Service */
    WhatsAppApiService,

    /* Storage Services (MongoDB) */
    ConversationStorageService,
    MessageStorageService,

    /* Bot Interaction & AI Services */
    BotInteractionService,
    ProductMediaService,

    /* Message Processor Factory (creates processors internally) */
    MessageProcessorFactory,

    /* Message Extractor Factory (creates extractors internally) */
    MessageExtractorFactory,
  ],
  controllers: [WhatsappController],
})
export class ConversationModule {}
