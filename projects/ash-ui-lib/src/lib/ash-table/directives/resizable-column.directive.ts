import { Directive, ElementRef, inject, input, output, signal, effect, DestroyRef } from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Directive for resizable table columns
 * Usage: <th libResizableColumn [minWidth]="50" [maxWidth]="500" (resize)="handleResize($event)">
 */
@Directive({
  selector: '[libResizableColumn]',
  host: {
    '[style.position]': '"relative"',
    '[style.user-select]': 'isResizing() ? "none" : "auto"',
    '[class.resizing]': 'isResizing()'
  }
})
export class ResizableColumnDirective {
  readonly libResizableColumn = input<boolean>(true);
  readonly minWidth = input<number>(50);
  readonly maxWidth = input<number>(500);
  readonly resize = output<number>();

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  
  protected readonly isResizing = signal(false);
  private startX = 0;
  private startWidth = 0;
  private handle!: HTMLElement;
  private isInitialized = false;

  constructor() {
    // Initialize resize handle and event listeners based on enabled state
    effect(() => {
      const enabled = this.libResizableColumn();
      if (enabled && !this.isInitialized) {
        this.createResizeHandle();
        this.setupEventListeners();
        this.isInitialized = true;
      } else if (!enabled && this.handle) {
        this.handle.remove();
        this.isInitialized = false;
      }
    });
    
    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      if (this.handle) {
        this.handle.remove();
      }
    });
  }

  private createResizeHandle(): void {
    this.handle = document.createElement('div');
    this.handle.style.cssText = `
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      cursor: col-resize;
      background: transparent;
      z-index: 10;
    `;
    this.handle.classList.add('resize-handle');
    this.elementRef.nativeElement.appendChild(this.handle);
  }

  private setupEventListeners(): void {
    fromEvent<MouseEvent>(this.handle, 'mousedown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.onMouseDown(event));

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.onMouseMove(event));

    fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onMouseUp());
  }

  private onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing.set(true);
    this.startX = event.pageX;
    this.startWidth = this.elementRef.nativeElement.offsetWidth;
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isResizing()) {
      return;
    }

    const diff = event.pageX - this.startX;
    let newWidth = this.startWidth + diff;

    // Apply min/max constraints
    newWidth = Math.max(this.minWidth(), Math.min(newWidth, this.maxWidth()));

    this.elementRef.nativeElement.style.width = `${newWidth}px`;
  }

  private onMouseUp(): void {
    if (this.isResizing()) {
      this.isResizing.set(false);
      const finalWidth = this.elementRef.nativeElement.offsetWidth;
      this.resize.emit(finalWidth);
    }
  }
}
