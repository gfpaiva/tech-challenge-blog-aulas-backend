import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDeployTriggerPort } from '@common/ports/deploy-trigger.port';
import { ILoggerPort } from '@common/ports/logger.port';
import { RenderDeployAdapter } from './render-deploy.adapter';
import { NoopDeployAdapter } from './noop-deploy.adapter';
import { Env } from '@infra/env/env.schema';

@Global()
@Module({
  providers: [
    {
      provide: IDeployTriggerPort,
      inject: [ConfigService, ILoggerPort],
      useFactory: (
        config: ConfigService<Env>,
        logger: ILoggerPort,
      ): IDeployTriggerPort => {
        const url = config.get<string>('RENDER_DEPLOY_HOOK_URL');

        if (url) {
          return new RenderDeployAdapter(config, logger);
        }

        return new NoopDeployAdapter();
      },
    },
  ],
  exports: [IDeployTriggerPort],
})
export class DeployModule {}
