import { ApplicationRef, ComponentRef, Injectable, createComponent, inject, EnvironmentInjector } from '@angular/core';
import { AshToastComponent } from './ash-toast.component';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number; // ms
  successIcon?: string;
  errorIcon?: string;
  warningIcon?: string;
  infoIcon?: string;
}

export class ToastRef {
  constructor(public readonly id: string, private _dismiss: () => void) {}
  dismiss() {
    this._dismiss();
  }
}

@Injectable({ providedIn: 'root' })
export class AshToastService {
  private readonly containerId = 'ash-toast-container-root';
  private readonly toasts = new Map<string, ComponentRef<AshToastComponent>>();
  private readonly envInjector = inject(EnvironmentInjector);

  constructor(private appRef: ApplicationRef) {}

  private ensureContainer(): HTMLElement {
    let el = document.getElementById(this.containerId);
    if (!el) {
      el = document.createElement('div');
      el.id = this.containerId;
      Object.assign(el.style, {
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: '9999',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none'
      } as any);
      document.body.appendChild(el);
    }
    return el;
  }

  show(config: ToastConfig): ToastRef {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;

    const compRef = createComponent(AshToastComponent, { environmentInjector: this.envInjector });
    compRef.setInput('id', id);
    compRef.setInput('message', config.message);
    compRef.setInput('type', config.type ?? 'info');
    compRef.setInput('duration', config.duration ?? 4000);
    compRef.setInput('successIcon', config.successIcon ?? 'check');
    compRef.setInput('errorIcon', config.errorIcon ?? 'error');
    compRef.setInput('warningIcon', config.warningIcon ?? 'warning');
    compRef.setInput('infoIcon', config.infoIcon ?? 'info');

    compRef.instance.onClose = () => this.dismiss(id);

    // Attach the component view to the application for change detection
    this.appRef.attachView(compRef.hostView);

    const hostEl = compRef.location.nativeElement as HTMLElement;
    hostEl.style.pointerEvents = 'auto';

    const container = this.ensureContainer();
    container.appendChild(hostEl);

    this.toasts.set(id, compRef);

    const ms = config.duration ?? 4000;
    if (ms > 0) {
      setTimeout(() => this.dismiss(id), ms);
    }

    return new ToastRef(id, () => this.dismiss(id));
  }

  success(message: string, duration = 3500) {
    return this.show({ message, type: 'success', duration });
  }

  error(message: string, duration = 6000) {
    return this.show({ message, type: 'error', duration });
  }

  dismiss(id: string) {
    const compRef = this.toasts.get(id);
    if (!compRef) return;
    try {
      const el = compRef.location.nativeElement as HTMLElement;
      el.remove();
    } catch (e) {}
    // Detach the view from the application before destroying
    this.appRef.detachView(compRef.hostView);
    compRef.destroy();
    this.toasts.delete(id);
  }
}
