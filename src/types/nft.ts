export type NftRarity = 'Comum' | 'Raro' | 'Épico' | 'Lendário';

export interface Nft {
    id: string,
    name: string,
    creator: string,
    description: string,
    image: string,
    price: string,
    priceInEth: number,
    category: string,
    rarity: NftRarity,
}
