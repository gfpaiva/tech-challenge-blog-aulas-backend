export abstract class IDeployTriggerPort {
  abstract trigger(): Promise<void>;
}
