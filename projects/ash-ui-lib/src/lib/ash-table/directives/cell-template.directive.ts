import { Directive, Input, TemplateRef } from '@angular/core';
import { CellContext } from '../models/column-def.model';

/**
 * Directive for custom cell templates
 * Usage: <ng-template libCellTemplate columnKey="status" let-row>...</ng-template>
 */
@Directive({
  selector: '[libCellTemplate]'
})
export class CellTemplateDirective<T = any> {
  @Input('columnKey') columnKey!: string;

  constructor(public templateRef: TemplateRef<CellContext<T>>) {}
}
