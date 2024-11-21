import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../services/pokemon.service';
import { Pokemon } from '../models/pokemon.model';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { CommonModule } from '@angular/common';

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

  // Eliminar un Pokémon del array local
  deletePokemon(index: number): void {
    this.localPokemonList.splice(index, 1);
  }

  // Simular la edición de un Pokémon
  editPokemon(index: number): void {
    const newName = prompt(
      'Enter the new name:',
      this.localPokemonList[index].name
    );
    if (newName) {
      this.localPokemonList[index].name = newName;
    }
  }
}
