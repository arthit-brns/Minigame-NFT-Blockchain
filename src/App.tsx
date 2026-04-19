import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BACKGROUND_URL, CARDS, MONSTERS, STORY_TEXTS, WEAPON_TYPES } from './gameData';
import { connectWallet, getMyWeapons, mintWeapon, Weapon } from './utils/ethereum';
import { ethers } from 'ethers';

type GameState = 'START' | 'STORY' | 'BATTLE' | 'BATTLE_END' | 'REWARD' | 'INVENTORY';

interface PlayerState {
  hp: number;
  maxHp: number;
  baseAtk: number;
  baseDef: number;
  walletAddress: string | null;
  signer: ethers.Signer | null;
  weapons: Weapon[];
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [player, setPlayer] = useState<PlayerState>({
    hp: 150,
    maxHp: 150,
    baseAtk: 10,
    baseDef: 5,
    walletAddress: null,
    signer: null,
    weapons: []
  });

  const [storyIndex, setStoryIndex] = useState(0);
  const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
  const [monsterHp, setMonsterHp] = useState(0);
  
  const [hand, setHand] = useState<any[]>([]);
  const [battleMessage, setBattleMessage] = useState("");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [rewardWeapon, setRewardWeapon] = useState<any | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [playNoMetamask, setPlayNoMetamask] = useState(false);

  const currentMonster = MONSTERS[currentMonsterIndex];

  useEffect(() => {
    if (gameState === 'BATTLE' && monsterHp === 0 && currentMonster) {
      setMonsterHp(currentMonster.hp);
      drawCards();
      setBattleMessage(`เจอ ${currentMonster.name}! เตรียมตัวต่อสู้!`);
      setIsPlayerTurn(true);
      setPlayer(p => ({ ...p, hp: p.maxHp })); // Heal full on new battle
    }
  }, [gameState, currentMonsterIndex]);

  const handleConnect = async () => {
    try {
      const { signer, address } = await connectWallet();
      const weapons = await getMyWeapons(signer);
      setPlayer(p => ({ ...p, walletAddress: address, signer, weapons }));
      setGameState('STORY');
    } catch (err: any) {
      alert("Error: " + err.message + "\nIf you don't have Metamask, you can play in Demo mode.");
      console.error(err);
    }
  };

  const handleDemoPlay = () => {
    setPlayNoMetamask(true);
    setGameState('STORY');
  };

  const nextStory = () => {
    if (storyIndex < STORY_TEXTS.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else {
      setGameState('BATTLE');
    }
  };

  const drawCards = () => {
    // Draw 3 random cards from the 6 available
    const shuffled = [...CARDS].sort(() => 0.5 - Math.random());
    setHand(shuffled.slice(0, 3));
  };

  const calculateWeaponBonus = () => {
    let bonusAtk = 0;
    let bonusDef = 0;
    player.weapons.forEach(w => {
        // Since we don't have structured details stored in struct (only description), we parse or assume based on WEAPON_TYPES matching
        const wt = WEAPON_TYPES.find(wt => wt.name === w.itemName);
        if (wt) {
           if (wt.bonusType === 'ATK') bonusAtk += wt.bonusValue;
           if (wt.bonusType === 'DEF') bonusDef += wt.bonusValue;
        }
    });
    return { atk: bonusAtk, def: bonusDef };
  };

  const playCard = async (card: any) => {
    if (!isPlayerTurn) return;
    setIsPlayerTurn(false);

    let dmgToMonster = 0;
    let healAmount = 0;
    let defBonus = 0;

    const wBonus = calculateWeaponBonus();
    const totalAtk = player.baseAtk + wBonus.atk;
    const totalDef = player.baseDef + wBonus.def;

    if (card.type === 'ATK') {
      dmgToMonster = totalAtk + card.value;
      setBattleMessage(`ใช้การ์ดโจมตี! สร้างความเสียหาย ${dmgToMonster} หน่วย`);
    } else if (card.type === 'DEF') {
      defBonus = card.value;
      setBattleMessage(`ใช้การ์ดป้องกัน! เพิ่มพลังป้องกัน ${defBonus} หน่วย`);
    } else if (card.type === 'HEAL') {
      healAmount = card.value;
      setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + healAmount) }));
      setBattleMessage(`ฟื้นฟูพลังชีวิต ${healAmount} หน่วย!`);
    }

    let newMonsterHp = Math.max(0, monsterHp - dmgToMonster);
    setMonsterHp(newMonsterHp);

    if (newMonsterHp <= 0) {
      setTimeout(() => {
        setBattleMessage(`คุณชนะ ${currentMonster.name}!`);
        setTimeout(() => handleVictory(), 2000);
      }, 1000);
      return;
    }

    // Monster turn
    setTimeout(() => {
      const monsterDmg = Math.max(0, currentMonster.atk - totalDef - defBonus);
      setPlayer(p => {
        const newHp = Math.max(0, p.hp - monsterDmg);
        if (newHp <= 0) {
           setTimeout(() => {
               setBattleMessage(`คุณพ่ายแพ้...`);
               setTimeout(() => setGameState('START'), 2000);
           }, 1000);
        }
        return { ...p, hp: newHp };
      });
      setBattleMessage(`${currentMonster.name} โจมตี! โดนความเสียหาย ${monsterDmg} หน่วย`);
      
      setTimeout(() => {
         drawCards();
         setIsPlayerTurn(true);
      }, 1500);

    }, 1500);
  };

  const handleVictory = () => {
    // Random chance to drop weapon
    if (Math.random() > 0.3) {
      const w = WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)];
      setRewardWeapon(w);
      setGameState('REWARD');
    } else {
      proceedToNextMonster();
    }
  };

  const proceedToNextMonster = () => {
    if (currentMonsterIndex < MONSTERS.length - 1) {
      setCurrentMonsterIndex(currentMonsterIndex + 1);
      setGameState('STORY'); // go back to story or just battle next
      // Let's just go directly to next battle
      setGameState('BATTLE');
    } else {
      setBattleMessage("คุณเคลียร์มอนสเตอร์ทั้งหมดแล้ว ยินดีด้วย ผู้กล้า!");
      setGameState('INVENTORY');
    }
  }

  const claimReward = async () => {
    if (playNoMetamask || !player.signer || !player.walletAddress) {
       // Demo mode: just add to local weapons
       setPlayer(p => ({
           ...p,
           weapons: [...p.weapons, { 
               itemName: rewardWeapon.name, 
               description: rewardWeapon.description, 
               image: rewardWeapon.image, 
               isUsed: false, 
               owner: p.walletAddress || 'demo-user' 
           }]
       }));
       proceedToNextMonster();
       return;
    }

    setIsMinting(true);
    try {
      await mintWeapon(player.signer, player.walletAddress, rewardWeapon.name, rewardWeapon.description, rewardWeapon.image);
      const weapons = await getMyWeapons(player.signer);
      setPlayer(p => ({ ...p, weapons }));
      alert("รับอาวุธสำเร็จ!");
    } catch (err) {
      alert("พบปัญหาในการรับอาวุธ");
      console.error(err);
    }
    setIsMinting(false);
    proceedToNextMonster();
  };

  const renderStart = () => (
    <div className="flex flex-col items-center justify-center h-full gap-6 relative z-10 glass-panel p-12 w-full max-w-lg aspect-auto mx-auto mt-20">
      <h1 className="text-5xl font-bold text-[#00d2ff] mb-8 tracking-wider" style={{textShadow: '0 0 15px rgba(0, 210, 255, 0.5)'}}>HARMONIA QUEST</h1>
      <button 
        onClick={handleConnect}
        className="btn-action px-8 py-4 rounded-lg font-bold text-xl w-64"
      >
        เชื่อมต่อ Metamask
      </button>
      <button 
        onClick={handleDemoPlay}
        className="btn-action px-8 py-4 rounded-lg font-bold text-xl w-64"
      >
        เล่นโหมด Demo
      </button>
    </div>
  );

  const renderStory = () => (
    <div className="flex w-full h-full cursor-pointer z-10 relative" onClick={nextStory}>
        <div className="absolute bottom-[210px] left-1/2 -translate-x-1/2 story-panel w-full max-w-3xl p-6 min-h-[100px] flex flex-col justify-center text-center">
           <div className="absolute -top-[15px] left-5 bg-[#00d2ff] text-black px-4 py-[2px] font-bold rounded text-sm">ระบบ</div>
           <AnimatePresence mode="wait">
              <motion.p
                key={storyIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg leading-relaxed text-gray-200"
              >
                {STORY_TEXTS[storyIndex]}
              </motion.p>
           </AnimatePresence>
           <p className="text-center text-xs text-gray-500 mt-4 animate-pulse">(คลิกเพื่อดำเนินการต่อ)</p>
        </div>
    </div>
  );

  const renderBattle = () => {
    const wBonus = calculateWeaponBonus();
    return (
    <div className="w-full h-full z-10 relative">
      {/* HUD Elements */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20 pointer-events-none">
        {/* Player Stats */}
        <div className="flex gap-4">
           <div className="glass-panel p-3 min-w-[280px] pointer-events-auto">
               <div className="flex justify-between text-[13px] mb-1 font-bold text-[#00d2ff]">
                  <span>ผู้กล้า</span>
                  <span>ATK: {player.baseAtk} {wBonus.atk > 0 && `(+${wBonus.atk})`} | DEF: {player.baseDef} {wBonus.def > 0 && `(+${wBonus.def})`}</span>
               </div>
               <div className="w-full h-6 bg-[#111] border border-[#444] rounded relative overflow-hidden mb-1">
                  <div className="hp-bar-fill h-full transition-all" style={{width: `${(player.hp / player.maxHp) * 100}%`}}></div>
                  <span className="absolute left-2 top-[3px] text-[12px] font-bold drop-shadow-[1px_1px_2px_rgba(0,0,0,1)] text-white">HP: {Math.ceil(player.hp)} / {player.maxHp}</span>
               </div>
           </div>
        </div>

        {/* Wallet Info & Actions */}
        <div className="flex flex-col gap-2 min-w-[200px] pointer-events-auto">
           <button onClick={() => setGameState('INVENTORY')} className="btn-action py-2 w-full rounded font-bold shadow-md">
               กระเป๋าสัมภาระ (Item)
           </button>
           <div className="glass-panel p-3 text-right text-sm flex flex-col justify-center">
              <div className="font-bold text-gray-200">METAMASK CONNECTED</div>
              <div className="font-mono text-[#00d2ff] opacity-80">{player.walletAddress ? `${player.walletAddress.slice(0,6)}...${player.walletAddress.slice(-4)}` : 'Demo Mode'}</div>
           </div>
        </div>
      </div>

      {/* Battlefield */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pt-[5vh]">
         {currentMonster && (
             <div className="pointer-events-auto flex flex-col items-center">
               <div className="text-xl uppercase tracking-[2px] bg-black/50 px-6 py-1 rounded-[20px] border border-white/20 mb-3">
                   {currentMonster.name} <span className="text-sm opacity-70 ml-2">HP: {Math.ceil(monsterHp)}/{currentMonster.hp}</span>
               </div>
               <div className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] relative drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                 <motion.img 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 key={currentMonster.id}
                 src={currentMonster.image} 
                 alt={currentMonster.name} 
                 className="w-full h-full object-contain"
                 />
               </div>
             </div>
         )}
      </div>

      {/* Story Box (Battle Dialog) */}
      {battleMessage && (
         <div className="absolute bottom-[200px] left-1/2 -translate-x-1/2 story-panel max-w-[500px] w-[90%] min-h-[65px] py-2 px-6 flex flex-col justify-center text-center z-20">
            <div className="absolute -top-[12px] left-4 bg-[#00d2ff] text-black px-3 py-[2px] font-bold rounded text-xs shadow-md">ต่อสู้</div>
            <p className="text-base text-gray-100 leading-relaxed">{battleMessage}</p>
         </div>
      )}

      {/* Card Hand */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 z-30">
         {hand.map((card, i) => (
             <motion.div 
               key={`${card.id}-${i}`}
               whileHover={isPlayerTurn ? { y: -20 } : {}}
               onClick={() => playCard(card)}
               className={`card-item w-[110px] h-[160px] rounded-lg overflow-hidden relative ${!isPlayerTurn && 'opacity-50 grayscale cursor-not-allowed'}`}
             >
                <img src={card.image} alt={card.type} className="w-full h-full object-cover" />
                <div className="absolute bottom-6 w-full bg-black/70 text-center py-[2px] text-[10px] font-bold text-white">
                   {card.type} +{card.value}
                </div>
             </motion.div>
         ))}
      </div>
    </div>
  )};

  const getFallbackImage = (itemName: string) => {
      let label = "Item";
      if (itemName.includes("เกราะ") || itemName.includes("โล่")) label = "Shield";
      else if (itemName.includes("คทา") || itemName.includes("ไม้กายสิทธิ์")) label = "Wand";
      else if (itemName.includes("ธนู") || itemName.includes("เกาทัณฑ์")) label = "Bow";
      else if (itemName.includes("ดาบ")) label = "Sword";
      return `https://placehold.co/200x200/111111/00d2ff.png?text=${label}`;
  };

  const renderReward = () => (
      <div className="flex flex-col items-center justify-center h-full z-10 relative w-full">
         <h2 className="text-4xl text-[#00d2ff] drop-shadow-[0_0_15px_rgba(0,210,255,0.8)] font-bold mb-8 tracking-wide">คุณได้รับไอเท็มใหม่!</h2>
         <div className="glass-panel p-8 flex flex-col items-center gap-4 max-w-md w-full">
             <img 
                 src={rewardWeapon.image || getFallbackImage(rewardWeapon.name)} 
                 alt={rewardWeapon.name} 
                 referrerPolicy="no-referrer"
                 onError={(e) => { e.currentTarget.src = getFallbackImage(rewardWeapon.name); }}
                 className="w-32 h-32 object-contain bg-[#111] rounded p-2 border border-[#444]" 
             />
             <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{rewardWeapon.name}</h3>
             <p className="text-gray-300 text-center text-sm">{rewardWeapon.description}</p>
             <button 
                 onClick={claimReward} 
                 disabled={isMinting}
                 className="mt-6 w-full btn-action py-3 font-bold text-[15px] uppercase disabled:opacity-50 rounded"
                 style={{ borderColor: '#ffd700', boxShadow: '0 0 10px rgba(255, 215, 0, 0.4)' }}
             >
                 {isMinting ? "กำลังบันทึก (Minting)..." : "Mint New Weapon"}
             </button>
             {playNoMetamask && <p className="text-xs text-yellow-500 mt-2">โหมด Demo: ไอเท็มจะถูกจัดเก็บชั่วคราว ไม่บันทึกลง Blockchain</p>}
         </div>
      </div>
  );

  const renderInventory = () => (
      <div className="flex flex-col h-full z-10 relative bg-[#050505]/95 p-8 w-full overflow-y-auto">
         <div className="flex justify-between items-center mb-8 mt-4 w-full max-w-[1024px] mx-auto border-b border-[#00d2ff]/30 pb-4">
             <h2 className="text-2xl text-[#00d2ff] font-bold drop-shadow-[0_0_10px_rgba(0,210,255,0.5)]">
               กระเป๋าของ {player.walletAddress ? player.walletAddress.slice(0,6)+'...'+player.walletAddress.slice(-4) : 'Demo User'}
             </h2>
             {monsterHp > 0 && currentMonsterIndex < MONSTERS.length && (
                  <button onClick={() => setGameState('BATTLE')} className="btn-action px-6 py-2 rounded">กลับสู่การต่อสู้</button>
             )}
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-[1024px] mx-auto w-full">
             {player.weapons.length === 0 ? (
                 <p className="col-span-full text-center text-gray-500 py-20 text-xl">ยังไม่มีไอเท็ม ไปต่อสู้เพื่อหาไอเท็มกันเถอะ!</p>
             ) : (
                 player.weapons.map((w, i) => (
                     <div key={i} className="glass-panel p-4 flex flex-col items-center gap-3">
                         <img 
                             src={w.image || getFallbackImage(w.itemName)} 
                             alt={w.itemName} 
                             referrerPolicy="no-referrer"
                             onError={(e) => { e.currentTarget.src = getFallbackImage(w.itemName); }}
                             className="w-full h-auto aspect-square object-contain bg-[#111] rounded p-2 border border-[#444]" 
                         />
                         <h4 className="font-bold text-white text-center text-[13px] uppercase">{w.itemName}</h4>
                         <p className="text-[11px] text-[#00d2ff] text-center">{w.description}</p>
                     </div>
                 ))
             )}
         </div>
      </div>
  );

  return (
    <div className="w-full h-screen overflow-hidden flex items-center justify-center relative font-sans text-white bg-[#050505]">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${BACKGROUND_URL})`, backgroundPosition: 'center center' }}
      />
      <div className="vignette" />
      
      {gameState === 'START' && renderStart()}
      {gameState === 'STORY' && renderStory()}
      {gameState === 'BATTLE' && renderBattle()}
      {gameState === 'REWARD' && renderReward()}
      {gameState === 'INVENTORY' && renderInventory()}
    </div>
  );
}

