export interface Pokemon {
  id: number;
  name: string;
  image: string;
}

export interface PokemonApiResponse {
  results: Pokemon[];
}
