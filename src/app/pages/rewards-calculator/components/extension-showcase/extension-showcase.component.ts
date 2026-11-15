import { Component, Input } from '@angular/core';
import type { Copy, Language, Region } from '../../utils/rewards-calculator.models';

@Component({
  selector: 'app-extension-showcase',
  standalone: true,
  templateUrl: './extension-showcase.component.html',
  styleUrl: './extension-showcase.component.css',
})
export class ExtensionShowcaseComponent {
  @Input({ required: true }) copy!: Copy;
  @Input({ required: true }) region!: Region;
  @Input({ required: true }) language!: Language;

  formatCurrency(value: number): string {
    return new Intl.NumberFormat(this.region.numberLocale, {
      style: 'currency',
      currency: this.region.currency,
    }).format(value);
  }

  formatPoints(value: number): string {
    return new Intl.NumberFormat(this.language, { maximumFractionDigits: 0 }).format(value);
  }

  previewMainAmount(): number {
    return this.region.fixedAmounts.filter((amount) => amount <= 50).at(-1) ?? this.region.fixedAmounts[0];
  }

  previewCustomAmount(): number {
    return (80 - this.previewMainAmount()) / 2;
  }
}
