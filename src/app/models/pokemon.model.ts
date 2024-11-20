export interface Pokemon {
  name: string;
  url: string;
}

export interface PokemonApiResponse {
  results: Pokemon[];
}
