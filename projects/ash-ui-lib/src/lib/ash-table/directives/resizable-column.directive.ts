import { Directive, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';

/**
 * Directive for resizable table columns
 * Usage: <th libResizableColumn [minWidth]="50" [maxWidth]="500" (onResize)="handleResize($event)">
 */
@Directive({
  selector: '[libResizableColumn]',
  host: {
    '[style.position]': '"relative"',
    '[style.user-select]': 'isResizing ? "none" : "auto"'
  }
})
export class ResizableColumnDirective implements OnInit, OnDestroy {
  @Input() minWidth = 50;
  @Input() maxWidth = 500;
  @Output() onResize = new EventEmitter<number>();

  private destroy$ = new Subject<void>();
  public isResizing = false;
  private startX = 0;
  private startWidth = 0;
  private handle!: HTMLElement;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.createResizeHandle();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.handle) {
      this.handle.remove();
    }
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
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => this.onMouseDown(event));

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => this.onMouseMove(event));

    fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onMouseUp());
  }

  private onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    this.startX = event.pageX;
    this.startWidth = this.elementRef.nativeElement.offsetWidth;
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) {
      return;
    }

    const diff = event.pageX - this.startX;
    let newWidth = this.startWidth + diff;

    // Apply min/max constraints
    newWidth = Math.max(this.minWidth, Math.min(newWidth, this.maxWidth));

    this.elementRef.nativeElement.style.width = `${newWidth}px`;
  }

  private onMouseUp(): void {
    if (this.isResizing) {
      this.isResizing = false;
      const finalWidth = this.elementRef.nativeElement.offsetWidth;
      this.onResize.emit(finalWidth);
    }
  }
}
