import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.js';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './country-list.html',
  styleUrl: './country-list.scss'
})
export class CountryListComponent {
  private readonly dataService = inject(DataService);
  readonly countries = this.dataService.countries;

  onCountryClick(country: any): void {
    console.log('Country clicked:', country);
    this.dataService.addNotification({
      type: 'info',
      title: 'Country Details',
      message: `Viewing sales data for ${country.name}`,
      read: false
    });
  }

  onImageError(event: Event): void {    
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/flags/default.svg'; // Fallback image
  }
}