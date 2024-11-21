export interface Pokemon {
  id: number;
  name: string;
  url: string;
}

export interface PokemonApiResponse {
  results: Pokemon[];
}
