import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../services/pokemon.service';
import { Pokemon } from '../models/pokemon.model';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css'],
})
export class PokemonListComponent implements OnInit {
  pokemonList: Pokemon[] = [];
  localPokemonList: Pokemon[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 5; // Valor inicial para los registros por página
  sortDirection: 'asc' | 'desc' = 'asc'; // Dirección del orden
  sortBy: 'id' | 'name' = 'id'; // Atributo por el cual ordenar
  searchTerm: string = ''; // Almacena el término de búsqueda
  filteredPokemonList: Pokemon[] = []; // Lista filtrada de Pokémon
  tempPokemon: Pokemon = { id: 0, name: '', image: '' };
  selectedPokemon: Pokemon | null = null;

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.fetchPokemon();
  }

  // Obtener los datos de Pokémon
  fetchPokemon(): void {
    this.loading = true;
    this.pokemonService.getPokemonList(10).subscribe({
      next: (response) => {
        this.pokemonList = response.results.map((pokemon, index) => ({
          ...pokemon,
          id: index + 1,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
            index + 1
          }.png`,
        }));

        this.filteredPokemonList = [...this.pokemonList];
        this.updateLocalPokemonList();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching Pokémon:', error);
        this.loading = false;
      },
    });
  }

  updateLocalPokemonList() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.localPokemonList = this.filteredPokemonList.slice(start, end);

    // Ordenar la lista local según la dirección y el campo seleccionado
    this.sortList();
  }

  openEditModal(index: number): void {
    this.tempPokemon = { ...this.localPokemonList[index] };
  }

  savePokemonChanges(): void {
    // Encuentra el índice del Pokémon en la lista filtrada (filteredPokemonList)
    const filteredIndex = this.filteredPokemonList.findIndex(
      (pokemon) => pokemon.id === this.tempPokemon.id
    );

    if (filteredIndex !== -1) {
      // Actualiza el Pokémon en filteredPokemonList
      this.filteredPokemonList[filteredIndex] = { ...this.tempPokemon };

      // Recalcula la lista local
      this.updateLocalPokemonList();
    }
  }

  openViewMoreModal(index: number): void {
    const pokemon = this.localPokemonList[index];
    this.pokemonService.getPokemonDetails(pokemon.id).subscribe({
      next: (details) => {
        this.selectedPokemon = { 
          ...pokemon, 
          abilities: details.abilities.map((ability: any) => ability.ability.name),
          type: details.types.map((type: any) => type.type.name).join(', '),
          height: details.height,
          weight: details.weight,
        }; // Combina la info local y la detallada
      },
      error: (err) => {
        console.error('Error fetching Pokemon details:', err);
      }
    });
  }
  

  // Método para manejar la búsqueda
  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredPokemonList = this.pokemonList.filter(
      (pokemon) =>
        pokemon.name.toLowerCase().includes(term) ||
        pokemon.id.toString().includes(term)
    );
    this.updateLocalPokemonList();
  }

  nextPage() {
    if (this.endIndex < this.pokemonList.length) {
      this.currentPage++;
      this.fetchPokemon();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchPokemon();
    }
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.pokemonList.length);
  }

  trackByUserId(index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }

  // Función para ordenar por un atributo
  sortList() {
    this.localPokemonList.sort((a, b) => {
      let compareA = a[this.sortBy];
      let compareB = b[this.sortBy];

      if (typeof compareA === 'string' && typeof compareB === 'string') {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }

      if (this.sortDirection === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });
  }

  // Cambiar la dirección del orden
  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortList();
  }

  // Cambiar el campo por el cual ordenar
  changeSortField(field: 'id' | 'name') {
    if (this.sortBy === field) {
      this.toggleSortDirection(); // Si ya está ordenado por ese campo, cambia la dirección
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc'; // Reiniciar dirección a ascendente
    }
    this.sortList();
  }

  confirmDeletePokemon(index: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.localPokemonList.splice(index, 1); // Elimina el Pokémon
        Swal.fire('Deleted!', 'The Pokémon has been deleted.', 'success');
      }
    });
  }
}
