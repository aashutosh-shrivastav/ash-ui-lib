import { Injectable } from '@angular/core';
import { ConditionalExpression, SimpleCondition, ComplexCondition, ComparisonOperator } from '../ash-form.types';

/**
 * Service for evaluating conditional expressions
 * Handles field visibility, disabled state, and dynamic required logic
 */
@Injectable()
export class ConditionalLogicService {
  /**
   * Evaluate a conditional expression against form values
   */
  evaluate(expression: ConditionalExpression, formValue: any): boolean {
    return this.evaluateExpression(expression, formValue);
  }

  /**
   * Recursively evaluate conditional expression
   */
  private evaluateExpression(expr: ConditionalExpression, formValue: any): boolean {
    if (this.isSimpleCondition(expr)) {
      return this.evaluateSimpleCondition(expr, formValue);
    } else {
      return this.evaluateComplexCondition(expr, formValue);
    }
  }

  /**
   * Type guard for SimpleCondition
   */
  private isSimpleCondition(expr: ConditionalExpression): expr is SimpleCondition {
    return 'field' in expr && 'operator' in expr && 'value' in expr;
  }

  /**
   * Evaluate a simple condition
   */
  private evaluateSimpleCondition(condition: SimpleCondition, formValue: any): boolean {
    const fieldValue = this.getNestedValue(formValue, condition.field);
    return this.compare(fieldValue, condition.operator, condition.value);
  }

  /**
   * Evaluate a complex condition (AND/OR)
   */
  private evaluateComplexCondition(condition: ComplexCondition, formValue: any): boolean {
    if (condition.operator === 'AND') {
      return condition.conditions.every(c => this.evaluateExpression(c, formValue));
    } else {
      return condition.conditions.some(c => this.evaluateExpression(c, formValue));
    }
  }

  /**
   * Compare two values using an operator
   */
  private compare(fieldValue: any, operator: ComparisonOperator, compareValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === compareValue;

      case 'notEquals':
        return fieldValue !== compareValue;

      case 'greaterThan':
        return this.toNumber(fieldValue) > this.toNumber(compareValue);

      case 'lessThan':
        return this.toNumber(fieldValue) < this.toNumber(compareValue);

      case 'contains':
        if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
          return fieldValue.includes(compareValue);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(compareValue);
        }
        return false;

      case 'notContains':
        if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
          return !fieldValue.includes(compareValue);
        }
        if (Array.isArray(fieldValue)) {
          return !fieldValue.includes(compareValue);
        }
        return true;

      case 'isEmpty':
        return this.isEmpty(fieldValue);

      case 'isNotEmpty':
        return !this.isEmpty(fieldValue);

      case 'in':
        if (Array.isArray(compareValue)) {
          return compareValue.includes(fieldValue);
        }
        return false;

      case 'notIn':
        if (Array.isArray(compareValue)) {
          return !compareValue.includes(fieldValue);
        }
        return true;

      default:
        return false;
    }
  }

  /**
   * Check if a value is empty
   */
  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === 'string') {
      return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }
    return false;
  }

  /**
   * Convert value to number for comparison
   */
  private toNumber(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) {
      return undefined;
    }

    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }
}
