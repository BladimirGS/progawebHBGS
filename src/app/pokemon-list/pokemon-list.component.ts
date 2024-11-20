import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../services/pokemon.service';
import { Pokemon } from '../models/pokemon.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokemonListComponent implements OnInit {
  pokemonList: Pokemon[] = [];
  localPokemonList: any[] = [];
  loading = true;

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.fetchPokemon();
  }

  // Obtener los datos de Pokémon
  fetchPokemon(): void {
    this.pokemonService.getPokemonList(10).subscribe({
      next: (response) => {
        this.pokemonList = response.results;
        this.localPokemonList = this.pokemonList.map((pokemon, index) => ({
          id: index + 1,
          name: pokemon.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching Pokémon:', error);
        this.loading = false;
      }
    });
  }

  // Eliminar un Pokémon del array local
  deletePokemon(index: number): void {
    this.localPokemonList.splice(index, 1);
  }

  // Simular la edición de un Pokémon
  editPokemon(index: number): void {
    const newName = prompt('Enter the new name:', this.localPokemonList[index].name);
    if (newName) {
      this.localPokemonList[index].name = newName;
    }
  }
}
