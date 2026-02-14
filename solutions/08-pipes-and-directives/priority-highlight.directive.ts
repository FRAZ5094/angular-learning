import { Directive, computed, input } from '@angular/core';

@Directive({
  selector: '[appPriorityHighlight]',
  host: {
    '[style.borderLeftWidth]': '"4px"',
    '[style.borderLeftStyle]': '"solid"',
    '[style.borderLeftColor]': 'color()',
  },
})
export class PriorityHighlightDirective {
  appPriorityHighlight = input.required<'low' | 'medium' | 'high'>();

  color = computed(() => {
    const colors: Record<string, string> = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#22c55e',
    };
    return colors[this.appPriorityHighlight()];
  });
}
