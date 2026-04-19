export const MONSTERS = [
  {
    id: 1,
    name: "สไลม์ป่า",
    hp: 50,
    atk: 5,
    image: "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584256/001_obkirh.png"
  },
  {
    id: 2,
    name: "หมาป่าทมิฬ",
    hp: 80,
    atk: 10,
    image: "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584256/002_hboccf.png"
  },
  {
    id: 3,
    name: "ออร์คจอมพลัง",
    hp: 120,
    atk: 15,
    image: "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584257/003_oa4uqs.png"
  },
  {
    id: 4,
    name: "อัศวินปีศาจ",
    hp: 200,
    atk: 25,
    image: "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584257/004_dmq0du.png"
  },
  {
    id: 5,
    name: "ราชาจอมมาร",
    hp: 350,
    atk: 40,
    image: "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584256/005_stxs8j.png"
  }
];

export const BACKGROUND_URL = "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584634/background_1_xsexy8.jpg";

export const CARDS = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584838/001_tqz5mp.png",
    type: "ATK",
    value: 10
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584851/002_nbkalk.png",
    type: "DEF",
    value: 5
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584862/003_ycmkfl.png",
    type: "ATK",
    value: 20
  },
  {
    id: 4,
    image: "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584882/004_wkqmug.png",
    type: "DEF",
    value: 15
  },
  {
    id: 5,
    image: "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584897/005_agifet.png",
    type: "ATK",
    value: 30
  },
  {
    id: 6,
    image: "https://res.cloudinary.com/dx5p9dvj3/image/upload/v1776584905/006_kaqlog.png",
    type: "HEAL",
    value: 20
  }
];

export const WEAPON_TYPES = [
  {
    name: "ดาบผู้กล้า",
    description: "ดาบที่ถูกตีขึ้นมาเพื่อปราบมาร เพิ่ม ATK +10",
    image: "https://placehold.co/200x200/111111/00d2ff.png?text=Sword",
    bonusType: 'ATK',
    bonusValue: 10
  },
  {
    name: "โล่ศักดิ์สิทธิ์",
    description: "โล่ที่สามารถป้องกันเวทมนตร์ เพิ่ม DEF +10",
    image: "https://placehold.co/200x200/111111/00d2ff.png?text=Shield",
    bonusType: 'DEF',
    bonusValue: 10
  },
  {
    name: "คทาเวทย์",
    description: "คทาที่กักเก็บพลังมหาศาล เพิ่ม ATK +15",
    image: "https://placehold.co/200x200/111111/00d2ff.png?text=Wand",
    bonusType: 'ATK',
    bonusValue: 15
  }
];

export const STORY_TEXTS = [
  "ในดินแดนฮาร์โมเนียที่เคยสงบสุข...",
  "บัดนี้ถูกความมืดมิดและเหล่าปีศาจร้ายครอบงำ",
  "ผู้คนต่างหนีตาย และสิ้นหวัง...",
  "แต่ยังมีท่าน ผู้กล้าคนสุดท้าย ที่พร้อมจะทวงคืนแสงสว่าง!",
  "จงเตรียมไพ่แห่งโชคชะตา และเผชิญหน้ากับเหล่ามอนสเตอร์!"
];
