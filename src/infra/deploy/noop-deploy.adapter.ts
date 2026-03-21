import { Injectable } from '@nestjs/common';
import { IDeployTriggerPort } from '@common/ports/deploy-trigger.port';

@Injectable()
export class NoopDeployAdapter implements IDeployTriggerPort {
  async trigger(): Promise<void> {
    // No-op: deploy hook URL not configured
  }
}
