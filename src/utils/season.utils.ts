import { SeasonsEnum } from "./../enums/seasons.enum";
export const nextSeason = (season: string): SeasonsEnum => {
    switch (season) {
        case SeasonsEnum.Autumn:
            return SeasonsEnum.Winter;
        case SeasonsEnum.Winter:
            return SeasonsEnum.Spring;
        case SeasonsEnum.Spring:
            return SeasonsEnum.Summer;
        case SeasonsEnum.Summer:
            return SeasonsEnum.Autumn;
        default:
            return SeasonsEnum.Autumn;
    }
};
