import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css'
})
export class EmptyStateComponent {
  icon = input<string>(''); // Can pass an SVG path or class later
  title = input<string>('No data found');
  description = input<string>('There is nothing to display here at the moment.');
  actionText = input<string>('');
  
  actionClick = output<void>();

  onAction() {
    this.actionClick.emit();
  }
}
