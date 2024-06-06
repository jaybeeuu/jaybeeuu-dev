type Position = [string, string];

type sRank = "captain" | "first mate" | "officer" | "ensign";

interface CrewMember {
  name: string;
  age: number;
  rank: Rank;
}

interface Ship {
  affiliation: "Royal Navy" | "Pirate";
  position: Position;
  guns: number;
  name: string;
  crew: CrewMember;
}
