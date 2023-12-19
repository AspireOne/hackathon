interface Person {
  description: string;
  name: string;
  id: number;
}

const guessPeople: Person[] = [
  {
    description: "Vypada jak bezdomovec, je to pologej, hudebnik a milovnik rohliku",
    name: "Tomas",
    id: 1,
  },
  {
    description: "Je to tlustoch, milovnik dobreho jidla, svudce zen, uziva si chladneho pocasi a krasnych zen",
    name: "Luka",
    id: 2,
  },
  {
    description: "C# god, PHP hejtr, milovnik baget, kratomu a alchymistra, programovaci buh a opovrhuje luku budika",
    name: "Matej",
    id: 3,
  },
  {
    description: "Loli enjoyer, opovrhuje spolecnosti a zenami, milovik VRka a smazeneho kurete kentucky",
    name: "Jakub",
    id: 4,
  },
];

export default guessPeople;