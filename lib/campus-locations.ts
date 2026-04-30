export type CampusLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
};

export const LIVE_LOCATION_IDS = [
  "location1",
  "location2",
  "location3",
  "location4",
  "location5",
] as const;

export const DEFAULT_CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: "location1",
    name: "Main Gate",
    latitude: 16.84598499546245,
    longitude: 74.60259627660001,
    isDefault: true,
  },
  {
    id: "location2",
    name: "Back Gate",
    latitude: 16.845611053126987,
    longitude: 74.60011287904788,
    isDefault: true,
  },
  {
    id: "location3",
    name: "Lipton",
    latitude: 16.84448920038185,
    longitude: 74.60231495061738,
    isDefault: true,
  },
  {
    id: "location4",
    name: "Civil Department",
    latitude: 16.84469004044469,
    longitude: 74.59998697041415,
    isDefault: true,
  },
  {
    id: "location5",
    name: "Mechanical Department",
    latitude: 16.84508281023488,
    longitude: 74.60040271282178,
    isDefault: true,
  },
  {
    id: "location6",
    name: "Electrical Department",
    latitude: 16.84514184275171,
    longitude: 74.60148631213073,
    isDefault: true,
  },
  {
    id: "location7",
    name: "Computer Science Department",
    latitude: 16.84576817508603,
    longitude: 74.60104373521334,
    isDefault: true,
  },
  {
    id: "location8",
    name: "Information Technology Department",
    latitude: 16.845922201675844,
    longitude: 74.60060117073436,
    isDefault: true,
  },
  {
    id: "location9",
    name: "Gymkhana",
    latitude: 16.84369061852226,
    longitude: 74.60154873103221,
    isDefault: true,
  },
  {
    id: "location10",
    name: "Humanities Department",
    latitude: 16.845794297653665,
    longitude: 74.60038930822697,
    isDefault: true,
  },
  {
    id: "location11",
    name: "Study Room",
    latitude: 16.84493753647038,
    longitude: 74.60210590948479,
    isDefault: true,
  },
  {
    id: "location12",
    name: "Tilak Hall",
    latitude: 16.844572872639038,
    longitude: 74.60123531814764,
    isDefault: true,
  },
  {
    id: "location13",
    name: "Student Facility Center",
    latitude: 16.844786573568,
    longitude: 74.60243161307069,
    isDefault: true,
  },
  {
    id: "location14",
    name: "Cyber Hostel",
    latitude: 16.845323765676568,
    longitude: 74.60221038045954,
    isDefault: true,
  },
  {
    id: "location15",
    name: "NRI Hostel",
    latitude: 16.845121828679467,
    longitude: 74.60256066543924,
    isDefault: true,
  },
  {
    id: "location16",
    name: "Exam Cell",
    latitude: 16.84394353179246,
    longitude: 74.60224110720864,
    isDefault: true,
  },
  {
    id: "location17",
    name: "Polytechnic Wing",
    latitude: 16.844225853175647,
    longitude: 74.60233943281696,
    isDefault: true,
  },
  {
    id: "location18",
    name: "D5 Hostel Block",
    latitude: 16.842767188140748,
    longitude: 74.60350909788285,
    isDefault: true,
  },
  {
    id: "location19",
    name: "D6 Hostel Block",
    latitude: 16.842904428607657,
    longitude: 74.60301746984118,
    isDefault: true,
  },
  {
    id: "location20",
    name: "D7 Hostel Block",
    latitude: 16.84332203113057,
    longitude: 74.60291709578267,
    isDefault: true,
  },
  {
    id: "location21",
    name: "D8 Hostel Block",
    latitude: 16.843949413477134,
    longitude: 74.60308302024644,
    isDefault: true,
  },
  {
    id: "location22",
    name: "Parking",
    latitude: 16.845831439691874,
    longitude: 74.6015161847353,
    isDefault: true,
  },
  {
    id: "location23",
    name: "Ground",
    latitude: 16.843583935767153,
    longitude: 74.60139574675752,
    isDefault: true,
  },
  {
    id: "location24",
    name: "Government Canteen",
    latitude: 16.84337807576859,
    longitude: 74.6019181015518,
    isDefault: true,
  },
  {
    id: "location25",
    name: "Hostel Area",
    latitude: 16.84349588844393,
    longitude: 74.60307812919744,
    isDefault: true,
  },
  {
    id: "location26",
    name: "Academic Complex 1",
    latitude: 16.84471468644097,
    longitude: 74.60106209955524,
    isDefault: true,
  },
  {
    id: "location27",
    name: "Electronics Department",
    latitude: 16.845580737497617,
    longitude: 74.60161370331835,
    isDefault: true,
  },
  {
    id: "location28",
    name: "Library",
    latitude: 16.844385467359807,
    longitude: 74.6019607798317,
    isDefault: true,
  },
  {
    id: "location29",
    name: "IDOL",
    latitude: 16.844213442750284,
    longitude: 74.60171906583113,
    isDefault: true,
  },
  {
    id: "location30",
    name: "Administration Block",
    latitude: 16.84569165477086,
    longitude: 74.60130232549595,
    isDefault: true,
  },
  {
    id: "location31",
    name: "Academic Complex",
    latitude: 16.844400297066063,
    longitude: 74.60098152822171,
    isDefault: true,
  },
];

export function getDefaultCampusLocationName(id: string) {
  return DEFAULT_CAMPUS_LOCATIONS.find(
    (location) => location.id.toLowerCase() === id.toLowerCase(),
  )?.name;
}
