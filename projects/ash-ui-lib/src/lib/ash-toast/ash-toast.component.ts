import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { Directionality } from '@angular/cdk/bidi';

@Component({
  selector: 'lib-ash-toast',
  template: `
    <div class="ash-toast" role="status" aria-live="polite" [attr.data-type]="type()">
      <div class="ash-toast__body">
        @if (icon()) {
        <mat-icon class="ash-toast__icon">{{ icon() }}</mat-icon>
        }
        <div class="ash-toast__message">{{ message() }}</div>
      </div>
      <button mat-icon-button type="button" class="ash-toast__close" (click)="close()" aria-label="Dismiss"><mat-icon>close</mat-icon></button>
    </div>
  `,
  styleUrl: './ash-toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatIconButton],
})
export class AshToastComponent {
  readonly id = input<string>('');
  readonly message = input<string>('');
  readonly type = input<'success' | 'error' | 'info' | 'warning'>('info');
  readonly duration = input<number>(4000);

  // Brandable icon inputs
  readonly successIcon = input<string>('check');
  readonly errorIcon = input<string>('error');
  readonly warningIcon = input<string>('warning');
  readonly infoIcon = input<string>('info');

  // Directionality for RTL support
  private readonly dir = inject(Directionality);
  protected readonly isRtl = computed(() => this.dir.value === 'rtl');

  // optional callback assigned by the service (not an Angular Output)
  onClose?: () => void;

  protected readonly icon = computed(() => {
    switch (this.type()) {
      case 'success':
        return this.successIcon();
      case 'error':
        return this.errorIcon();
      case 'warning':
        return this.warningIcon();
      case 'info':
        return this.infoIcon();
      default:
        return null;
    }
  });

  close() {
    this.onClose?.();
  }
}
