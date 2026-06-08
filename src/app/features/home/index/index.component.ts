import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { forkJoin, finalize, catchError, of } from 'rxjs';

interface Modality {
  label: string;
  route: string;
  image: string;
}

declare const lucide: any;

@Component({
  selector: 'app-index',
  standalone: false,
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})
export class IndexComponent implements OnInit, AfterViewInit {
  private readonly FEATURED_IDS = [7, 34, 128, 132, 96, 23, 86, 88];

  featuredProducts: any[] = [];
  isLoadingProducts = true;

  @ViewChild('carouselTrack') carouselTrackRef!: ElementRef<HTMLUListElement>;

  prevDisabled = true;
  nextDisabled = false;

  readonly modalities: Modality[] = [
    { label: 'FUTEBOL', route: 'Futebol', image: 'backgrounds/modalidade-futebol.png' },
    { label: 'BASQUETE', route: 'Basquete', image: 'backgrounds/modalidade-basquete.png' },
    { label: 'TÊNIS', route: 'Tênis', image: 'backgrounds/modalidade-tenis.png' },
    { label: 'CAMINHADA', route: 'Caminhada', image: 'backgrounds/modalidade-caminhada.png' },
    { label: 'FUTSAL', route: 'Futsal', image: 'backgrounds/modalidade-futsal.png' },
    { label: 'VÔLEI', route: 'Vôlei', image: 'backgrounds/modalidade-volei.png' },
    { label: 'CORRIDA', route: 'Corrida', image: 'backgrounds/modalidade-corrida.png' },
    { label: 'MUSCULAÇÃO', route: 'Musculação', image: 'backgrounds/modalidade-musculacao.png' },
    { label: 'CROSSFIT', route: 'Crossfit', image: 'backgrounds/modalidade-crossfit.png' },
    { label: 'CICLISMO', route: 'Ciclismo', image: 'backgrounds/modalidade-ciclismo.png' },
    { label: 'NATAÇÃO', route: 'Natação', image: 'backgrounds/modalidade-natacao.png' },
    { label: 'SURF', route: 'Surf', image: 'backgrounds/modalidade-surf.png' },
    {
      label: 'ARTES MARCIAIS',
      route: 'Artes Marciais',
      image: 'backgrounds/modalidade-artes-maciais.png',
    },
    { label: 'SKATE', route: 'Skate', image: 'backgrounds/modalidade-skate.png' },
    { label: 'YOGA', route: 'Yoga', image: 'backgrounds/modalidade-yoga.png' },
  ];

  readonly bestOffers = [
    {
      title: 'Tênis Addidas Terrex Feminino',
      price: 'R$ 479,90',
      id: 176,
      cssClass: 'card-1-offers',
    },
    {
      title: 'Tênis Terrex Trailrunner',
      price: 'R$ 479,90',
      id: 177,
      cssClass: 'card-2-offers',
    },
    {
      title: 'Boné Running Mesh',
      price: 'R$ 250,00',
      id: 73,
      cssClass: 'card-3-offers',
    },
    {
      title: 'Bandagem Outshock',
      price: 'R$ 120,00',
      id: 62,
      cssClass: 'card-4-offers',
    },
  ];

  readonly bestOffersDesktop = [
    {
      first: this.bestOffers[0],
      second: this.bestOffers[1],
    },
    {
      first: this.bestOffers[2],
      second: this.bestOffers[3],
    },
  ];

  constructor(
    private productService: ProductService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateCarouselButtons(), 0);
    window.addEventListener('resize', () => this.updateCarouselButtons());

    lucide.createIcons();
  }

  private loadFeaturedProducts(): void {
    const requests = this.FEATURED_IDS.map((id) =>
      this.productService.getById(id).pipe(catchError(() => of(null))),
    );

    forkJoin(requests)
      .pipe(
        finalize(() => {
          this.isLoadingProducts = false;
          this.cdRef.detectChanges();
        }),
      )
      .subscribe({
        next: (products) => {
          this.featuredProducts = products.filter(Boolean);
          this.cdRef.detectChanges();
        },
        error: () => {
          this.featuredProducts = [];
          this.cdRef.detectChanges();
        },
      });
  }

  scrollNext(): void {
    const track = this.carouselTrackRef.nativeElement;
    const cards = track.querySelectorAll<HTMLElement>('.card-item-modalitys');

    for (const card of Array.from(cards)) {
      if (card.offsetLeft > track.scrollLeft + 5) {
        track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
        break;
      }
    }

    setTimeout(() => this.updateCarouselButtons(), 300);
  }

  scrollPrev(): void {
    const track = this.carouselTrackRef.nativeElement;
    const cards = Array.from(track.querySelectorAll<HTMLElement>('.card-item-modalitys')).reverse();

    for (const card of cards) {
      if (card.offsetLeft < track.scrollLeft - 5) {
        track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
        break;
      }
    }

    setTimeout(() => this.updateCarouselButtons(), 300);
  }

  private updateCarouselButtons(): void {
    if (!this.carouselTrackRef) return;

    const track = this.carouselTrackRef.nativeElement;
    const maxScroll = track.scrollWidth - track.clientWidth;

    this.prevDisabled = track.scrollLeft <= 0;
    this.nextDisabled = track.scrollLeft >= maxScroll - 5;
  }
}
