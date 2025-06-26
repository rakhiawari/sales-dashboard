import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metrics-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-card.html',
  styleUrls: ['./metrics-card.scss']
})
export class MetricsCardComponent {
  // Using Angular 20 input signals
  title = input.required<string>();
  value = input.required<string>();
  change = input.required<string>();
  changeType = input<'positive' | 'negative'>('positive');
  period = input<string>('');
  clickable = input<boolean>(false);

  // Output event for clicks
  cardClick = output<void>();

  // Computed signal for stroke color
  strokeColor = computed(() => 
    this.changeType() === 'positive' ? '#10b981' : '#ef4444'
  );

  onCardClick(): void {
    if (this.clickable()) {
      this.cardClick.emit();
    }
  }

  cardClasses = computed(() => {
    const classes = ['metrics-card'];
    classes.push(this.changeType());
    if (this.clickable()) {
      classes.push('clickable');
    }
    return classes.join(' ');
  });
}