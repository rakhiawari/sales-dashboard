import { Component, ElementRef, ViewChild, AfterViewInit, inject, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.js';
import { DataService } from '../../services/data.js';

@Component({
  selector: 'app-earnings-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './earnings-chart.html',
  styleUrls: ['./earnings-chart.scss']
})
export class EarningsChartComponent implements AfterViewInit {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private readonly themeService = inject(ThemeService);
  private readonly dataService = inject(DataService);
  
  // Component state
  readonly selectedPeriod = signal('12months');
  readonly showFirstHalf = signal(true);
  readonly showTopGross = signal(true);
  readonly isRefreshing = signal(false);
  readonly showTooltip = signal(false);
  readonly tooltipStyle = signal({});
  readonly tooltipData = signal({ month: '', firstHalf: 0, topGross: 0, orders: 0, customers: 0 });

  // Chart data points for mouse interaction
  private chartPoints: { x: number, y: number, data: any }[] = [];

  // Computed values
  readonly chartData = this.dataService.chartData;
  readonly peakMonth = computed(() => {
    const data = this.chartData();
    const peak = data.reduce((max, current) => 
      current.topGross > max.topGross ? current : max
    );
    return peak.month;
  });

  readonly growthRate = computed(() => {
    const data = this.chartData();
    if (data.length < 2) return 0;
    
    const start = data[0].topGross;
    const end = data[data.length - 1].topGross;
    return Math.round(((end - start) / start) * 100);
  });

  constructor() {
    // Effect to redraw chart when theme or data changes
    effect(() => {
      if (this.themeService.theme() && this.chartCanvas) {
        this.drawChart();
      }
    });

    effect(() => {
      if (this.chartData() && this.chartCanvas) {
        this.drawChart();
      }
    });
  }

  ngAfterViewInit(): void {
    this.drawChart();
  }

  onPeriodChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedPeriod.set(target.value);
    this.refreshChart();
  }

  toggleSeries(series: 'firstHalf' | 'topGross'): void {
    if (series === 'firstHalf') {
      this.showFirstHalf.update(show => !show);
    } else {
      this.showTopGross.update(show => !show);
    }
    this.drawChart();
  }

  refreshChart(): void {
    this.isRefreshing.set(true);
    this.dataService.refreshData().subscribe(() => {
      this.isRefreshing.set(false);
      this.drawChart();
    });
  }

  onMouseMove(event: MouseEvent): void {
    const rect = this.chartCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find closest data point
    const closest = this.chartPoints.find(point => 
      Math.abs(point.x - x) < 20 && Math.abs(point.y - y) < 20
    );

    if (closest) {
      this.showTooltip.set(true);
      this.tooltipStyle.set({
        left: `${x + 10}px`,
        top: `${y - 10}px`
      });
      this.tooltipData.set(closest.data);
    } else {
      this.showTooltip.set(false);
    }
  }

  hideTooltip(): void {
    this.showTooltip.set(false);
  }

  private drawChart(): void {
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 300;

    const data = this.chartData();
    this.renderChart(ctx, data, canvas.width, canvas.height);
  }

  private renderChart(ctx: CanvasRenderingContext2D, data: any[], width: number, height: number): void {
    ctx.clearRect(0, 0, width, height);
    this.chartPoints = []; // Reset chart points
    
    const padding = 50;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Get theme colors
    const isDark = this.themeService.isDarkMode();
    const gridColor = isDark ? '#4a5568' : '#f1f5f9';
    const firstHalfColor = isDark ? '#718096' : '#e2e8f0';
    const topGrossColor = isDark ? '#f7fafc' : '#1a202c';
    const textColor = isDark ? '#a0aec0' : '#718096';
    
    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw chart lines
    const stepX = chartWidth / (data.length - 1);
    
    // First half line
    if (this.showFirstHalf()) {
      ctx.strokeStyle = firstHalfColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      data.forEach((point, index) => {
        const x = padding + stepX * index;
        const y = padding + chartHeight - (point.firstHalf / 200) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Store point for mouse interaction
        this.chartPoints.push({ x, y, data: point });
      });
      ctx.stroke();
    }

    // Top gross line
    if (this.showTopGross()) {
      ctx.strokeStyle = topGrossColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      data.forEach((point, index) => {
        const x = padding + stepX * index;
        const y = padding + chartHeight - (point.topGross / 200) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Draw interactive points
        ctx.fillStyle = topGrossColor;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
      ctx.stroke();
    }

    // Add month labels
    ctx.fillStyle = textColor;
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    data.forEach((point, index) => {
      const x = padding + stepX * index;
      ctx.fillText(point.month, x, height - 10);
    });

    // Add Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const value = (200 / 4) * (4 - i);
      const y = padding + (chartHeight / 4) * i;
      ctx.fillText(`${value}K`, padding - 10, y + 4);
    }
  }
}