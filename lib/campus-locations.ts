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
    name: "Study Room",
    latitude: 16.8449375364703,
    longitude: 74.6021059094847,
    isDefault: true,
  },
  {
    id: "location2",
    name: "Gymkhana",
    latitude: 16.8436906185222,
    longitude: 74.6015487310322,
    isDefault: true,
  },
  {
    id: "location3",
    name: "Hostel",
    latitude: 16.8434958884439,
    longitude: 74.6030781291974,
    isDefault: true,
  },
  {
    id: "location4",
    name: "Civil Department",
    latitude: 16.8446900404446,
    longitude: 74.5999869704141,
    isDefault: true,
  },
  {
    id: "location5",
    name: "Mechanical Department",
    latitude: 16.8450828102348,
    longitude: 74.6004027128217,
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
    name: "Humanities Department",
    latitude: 16.8457942976536,
    longitude: 74.6003893082269,
    isDefault: true,
  },
  {
    id: "location10",
    name: "Tilak Hall",
    latitude: 16.844572872639,
    longitude: 74.6012353181476,
    isDefault: true,
  },
  {
    id: "location11",
    name: "Student Facility Center",
    latitude: 16.844786573568,
    longitude: 74.6024316130706,
    isDefault: true,
  },
  {
    id: "location12",
    name: "Cyber Hostel",
    latitude: 16.8453237656765,
    longitude: 74.6022103804595,
    isDefault: true,
  },
  {
    id: "location13",
    name: "NRI Hostel",
    latitude: 16.8451218286794,
    longitude: 74.6025606654392,
    isDefault: true,
  },
  {
    id: "location14",
    name: "Exam Cell",
    latitude: 16.8439435317924,
    longitude: 74.6022411072086,
    isDefault: true,
  },
  {
    id: "location15",
    name: "Polytechnic Wing",
    latitude: 16.8442258531756,
    longitude: 74.6023394328169,
    isDefault: true,
  },
  {
    id: "location16",
    name: "D5 Hostel Block",
    latitude: 16.8427671881407,
    longitude: 74.6035090978828,
    isDefault: true,
  },
  {
    id: "location17",
    name: "D6 Hostel Block",
    latitude: 16.8429044286076,
    longitude: 74.6030174698411,
    isDefault: true,
  },
  {
    id: "location18",
    name: "D7 Hostel Block",
    latitude: 16.8433220311305,
    longitude: 74.6029170957826,
    isDefault: true,
  },
  {
    id: "location19",
    name: "D8 Hostel Block",
    latitude: 16.8439494134771,
    longitude: 74.6030830202464,
    isDefault: true,
  },
  {
    id: "location20",
    name: "Parking",
    latitude: 16.8458314396918,
    longitude: 74.6015161847353,
    isDefault: true,
  },
  {
    id: "location21",
    name: "Ground",
    latitude: 16.8435839357671,
    longitude: 74.6013957467575,
    isDefault: true,
  },
  {
    id: "location22",
    name: "Government Canteen",
    latitude: 16.8433780757685,
    longitude: 74.6019181015518,
    isDefault: true,
  },
  {
    id: "location23",
    name: "Academic Complex 1",
    latitude: 16.8447146864409,
    longitude: 74.6010620995552,
    isDefault: true,
  },
  {
    id: "location24",
    name: "Electronics Department",
    latitude: 16.8455807374976,
    longitude: 74.6016137033183,
    isDefault: true,
  },
  {
    id: "location25",
    name: "Library",
    latitude: 16.8443854673598,
    longitude: 74.6019607798317,
    isDefault: true,
  },
  {
    id: "location26",
    name: "IDOL",
    latitude: 16.8442134427502,
    longitude: 74.6017190658311,
    isDefault: true,
  },
  {
    id: "location27",
    name: "Administration Block",
    latitude: 16.8456916547708,
    longitude: 74.6013023254959,
    isDefault: true,
  },
  {
    id: "location28",
    name: "Academic Complex",
    latitude: 16.844400297066,
    longitude: 74.6009815282217,
    isDefault: true,
  },
  {
    id: "location29",
    name: "Main Gate",
    latitude: 16.8459849954624,
    longitude: 74.6025962766,
    isDefault: true,
  },
  {
    id: "location30",
    name: "Back Gate",
    latitude: 16.8456110531269,
    longitude: 74.6001128790478,
    isDefault: true,
  },
  {
    id: "location31",
    name: "Lipton",
    latitude: 16.8444892003818,
    longitude: 74.6023149506173,
    isDefault: true,
  },
];

export function getDefaultCampusLocationName(id: string) {
  return DEFAULT_CAMPUS_LOCATIONS.find(
    (location) => location.id.toLowerCase() === id.toLowerCase(),
  )?.name;
}
