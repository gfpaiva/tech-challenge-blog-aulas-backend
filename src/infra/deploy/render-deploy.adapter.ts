import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDeployTriggerPort } from '@common/ports/deploy-trigger.port';
import { ILoggerPort } from '@common/ports/logger.port';
import { Env } from '@infra/env/env.schema';

@Injectable()
export class RenderDeployAdapter implements IDeployTriggerPort {
  constructor(
    private readonly config: ConfigService<Env>,
    private readonly logger: ILoggerPort,
  ) {}

  async trigger(): Promise<void> {
    const url = this.config.get<string>('RENDER_DEPLOY_HOOK_URL');

    if (!url) return;

    try {
      await fetch(url, { method: 'POST' });
      this.logger.log('Deploy hook triggered', 'RenderDeployAdapter');
    } catch (err) {
      this.logger.error(
        'Failed to trigger deploy hook',
        err instanceof Error ? err.stack : String(err),
        'RenderDeployAdapter',
      );
    }
  }
}
